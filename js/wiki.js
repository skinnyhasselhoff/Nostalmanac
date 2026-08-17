/** Live Wikipedia summaries + YouTube search links. Cached. Never blocks the UI. */

const cache = new Map();
const coverCache = new Map();

const HINT = {
  game: 'video game',
  movie: 'film',
  tv: 'TV series',
  cartoon: 'TV series',
  music: 'song',
  person: '',
  tech: '',
  web: 'website',
  food: '',
  toy: 'toy',
  sport: '',
  event: '',
};

const YT_EXTRA = {
  movie: 'trailer',
  music: 'official music video',
  game: 'gameplay',
  tv: 'intro theme',
  cartoon: 'theme song',
  sport: 'highlights',
  person: '1990s interview',
  tech: 'demo',
  food: 'commercial',
  toy: 'commercial',
  web: 'history',
  event: 'news report',
};

const STOP = new Set(['the', 'and', 'for', 'from', 'with', 'that', 'this', 'part', 'vol']);

export function youtubeUrl(item) {
  const q = [item.year, item.title, item.meta, YT_EXTRA[item.cat] || '90s']
    .filter(Boolean)
    .join(' ');
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
}

export function fallbackBlurb(item) {
  return [item.meta, item.note].filter(Boolean).join(' — ');
}

function searchUrl(q, limit = 8) {
  const u = new URL('https://en.wikipedia.org/w/api.php');
  u.searchParams.set('action', 'query');
  u.searchParams.set('list', 'search');
  u.searchParams.set('srsearch', q);
  u.searchParams.set('srlimit', String(limit));
  u.searchParams.set('format', 'json');
  u.searchParams.set('origin', '*');
  return u;
}

function summaryUrl(title) {
  return `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}?redirect=true`;
}

function mediaUrl(title) {
  return `https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(title.replace(/ /g, '_'))}`;
}

function clip(text, n = 420) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (t.length <= n) return t;
  const cut = t.slice(0, n);
  const sp = cut.lastIndexOf(' ');
  return `${cut.slice(0, sp > 80 ? sp : n)}…`;
}

function bits(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((w) => w.length > 2 && !STOP.has(w));
}

function overlap(hit, item) {
  const a = bits(item.title);
  const b = bits(hit);
  if (!a.length) return 0;
  return a.filter((w) => b.includes(w)).length / a.length;
}

function scoreHit(hit, item) {
  const hitL = String(hit || '').toLowerCase();
  const titleL = item.title.toLowerCase().trim();
  const stripped = hitL.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
  let n = overlap(hit, item) * 10;
  if (stripped === titleL) n += 6;
  if (hitL.startsWith(titleL)) n += 3;
  if (item.cat === 'game' && /video game|arcade|nintendo|sega|playstation/i.test(hit)) n += 5;
  if (item.cat === 'movie' && /\bfilm\b|\bmovie\b/i.test(hit)) n += 5;
  if ((item.cat === 'tv' || item.cat === 'cartoon') && /tv series|television|cartoon/i.test(hit)) n += 5;
  if (item.cat === 'music' && /song|single|album/i.test(hit)) n += 3;
  if (item.query && hitL === item.query.toLowerCase()) n += 12;
  if (String(item.year) && hit.includes(String(item.year))) n += 2;
  if (/^list of |disambiguation|filmography/i.test(hit)) n -= 8;
  if (item.cat !== 'music' && /soundtrack/i.test(hit)) n -= 6;
  return n;
}

function wikiPic(data) {
  const url = data.originalimage?.source || data.thumbnail?.source || '';
  if (/\.svg(\?|$)/i.test(url)) return '';
  if (/flag_of|wordmark|commons\/thumb\/.*logo/i.test(url)) return '';
  return url.split('?')[0];
}

function absWiki(src) {
  if (!src) return '';
  if (src.startsWith('//')) return `https:${src}`;
  return src;
}

function isCoverFile(name, src) {
  const blob = `${name} ${src}`.toLowerCase();
  if (/\.svg(\?|$)/i.test(src) || /\.svg/i.test(name)) return false;
  if (/flag_of|wordmark|icon|logo\.|commons\/thumb\/.*logo|gnome-mime|oojs ui/i.test(blob)) return false;
  if (/box.?art|cover|poster|vhs|clamshell|ntsc|pal\b|genesis|snes|n64|playstation|arcade/i.test(blob)) return true;
  if (/upload\.wikimedia\.org\/wikipedia\/en\//i.test(src)) return true;
  return /\/wikipedia\/en\//i.test(src);
}

async function summaryFor(title, signal) {
  const res = await fetch(summaryUrl(title), { signal });
  if (!res.ok) return null;
  const data = await res.json();
  if (data.type === 'disambiguation') return null;
  const extract = clip(data.extract || '');
  if (!extract || /^.*may refer to/i.test(extract)) return null;
  return {
    text: extract,
    image: wikiPic(data),
    wiki: data.content_urls?.desktop?.url || `https://en.wikipedia.org/wiki/${encodeURIComponent(data.title)}`,
    title: data.title || title,
  };
}

async function mediaCover(title, signal) {
  try {
    const res = await fetch(mediaUrl(title), { signal });
    if (!res.ok) return '';
    const data = await res.json();
    const images = (data.items || []).filter((it) => it.type === 'image');
    const ranked = images
      .map((it) => {
        const src = absWiki(it.srcset?.[0]?.src || it.original?.source || it.thumbnail?.source || '');
        return { src: src.split('?')[0], name: it.title || '', score: isCoverFile(it.title || '', src) ? 2 : 0 };
      })
      .filter((it) => it.src && !/\.svg(\?|$)/i.test(it.src));
    ranked.sort((a, b) => b.score - a.score);
    return ranked[0]?.src || '';
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    return '';
  }
}

async function searchTitles(q, signal) {
  const sr = await fetch(searchUrl(q), { signal });
  if (!sr.ok) return [];
  const sj = await sr.json();
  return (sj.query?.search || []).map((row) => row.title);
}

function queriesFor(item) {
  const hint = HINT[item.cat] || '';
  const quoted = `"${item.title}"`;
  const pinned = item.query ? [item.query] : [];
  if (item.cat === 'game') {
    return [...pinned, `${quoted} ${item.year} video game`, `${quoted} ${item.meta || ''} video game`, `${item.title} ${item.year} video game`, `${item.title} ${hint}`, item.title];
  }
  if (item.cat === 'movie') {
    return [...pinned, `${quoted} ${item.year} film`, `${item.title} ${item.year} film`, `${item.title} film`, item.title];
  }
  return [
    ...pinned,
    [item.title, item.meta, hint].filter(Boolean).join(' '),
    [item.title, hint, item.year].filter(Boolean).join(' '),
    item.title,
  ];
}

export async function describe(item, signal) {
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  const key = `${item.cat}|${item.year}|${item.title}`;
  if (cache.has(key)) return cache.get(key);

  if (item.query) {
    try {
      const sum = await summaryFor(item.query, signal);
      if (sum) {
        cache.set(key, sum);
        return sum;
      }
    } catch (err) {
      if (err.name === 'AbortError') throw err;
    }
  }

  for (const q of queriesFor(item)) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    try {
      const titles = await searchTitles(q, signal);
      const ranked = titles
        .map((title) => ({ title, score: scoreHit(title, item) }))
        .filter((row) => row.score >= 5)
        .sort((a, b) => b.score - a.score);
      for (const row of ranked.slice(0, 4)) {
        const sum = await summaryFor(row.title, signal);
        if (sum) {
          cache.set(key, sum);
          return sum;
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') throw err;
    }
  }

  const fallback = { text: fallbackBlurb(item), image: '', wiki: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(item.title)}` };
  cache.set(key, fallback);
  return fallback;
}

export async function coverImage(item, signal) {
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  const key = `${item.cat}|${item.year}|${item.title}`;
  if (coverCache.has(key)) return coverCache.get(key);

  if (item.query) {
    try {
      const sum = await summaryFor(item.query, signal);
      if (sum?.image) {
        coverCache.set(key, sum.image);
        return sum.image;
      }
      const media = await mediaCover(item.query, signal);
      if (media) {
        coverCache.set(key, media);
        return media;
      }
    } catch (err) {
      if (err.name === 'AbortError') throw err;
    }
  }

  for (const q of queriesFor(item)) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    try {
      const titles = await searchTitles(q, signal);
      const ranked = titles
        .map((title) => ({ title, score: scoreHit(title, item) }))
        .filter((row) => row.score >= 4)
        .sort((a, b) => b.score - a.score);
      for (const row of ranked.slice(0, 5)) {
        const sum = await summaryFor(row.title, signal);
        if (sum?.image) {
          coverCache.set(key, sum.image);
          return sum.image;
        }
        const media = await mediaCover(row.title, signal);
        if (media) {
          coverCache.set(key, media);
          return media;
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') throw err;
    }
  }

  coverCache.set(key, '');
  return '';
}
