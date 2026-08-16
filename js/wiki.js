/** Live Wikipedia summaries + YouTube search links. Cached. Never blocks the UI. */

const cache = new Map();

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

export function youtubeUrl(item) {
  const q = [item.year, item.title, item.meta, YT_EXTRA[item.cat] || '90s']
    .filter(Boolean)
    .join(' ');
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
}

export function fallbackBlurb(item) {
  return [item.meta, item.note].filter(Boolean).join(' — ');
}

function searchUrl(q) {
  const u = new URL('https://en.wikipedia.org/w/api.php');
  u.searchParams.set('action', 'query');
  u.searchParams.set('list', 'search');
  u.searchParams.set('srsearch', q);
  u.searchParams.set('srlimit', '1');
  u.searchParams.set('format', 'json');
  u.searchParams.set('origin', '*');
  return u;
}

function summaryUrl(title) {
  return `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}?redirect=true`;
}

function clip(text, n = 280) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (t.length <= n) return t;
  const cut = t.slice(0, n);
  const sp = cut.lastIndexOf(' ');
  return `${cut.slice(0, sp > 80 ? sp : n)}…`;
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
    wiki: data.content_urls?.desktop?.url || `https://en.wikipedia.org/wiki/${encodeURIComponent(data.title)}`,
  };
}

function relevant(hit, item) {
  const hitL = String(hit || '').toLowerCase();
  const words = item.title.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2);
  if (words.length) return words.some((w) => hitL.includes(w));
  const meta = item.meta.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3);
  return meta.some((w) => hitL.includes(w));
}

export async function describe(item, signal) {
  const key = `${item.cat}|${item.year}|${item.title}`;
  if (cache.has(key)) return cache.get(key);

  const queries = [
    [item.title, item.meta, HINT[item.cat]].filter(Boolean).join(' '),
    [item.title, HINT[item.cat], item.year].filter(Boolean).join(' '),
    item.title,
  ];

  for (const q of queries) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    try {
      const sr = await fetch(searchUrl(q), { signal });
      if (!sr.ok) continue;
      const sj = await sr.json();
      const hit = sj.query?.search?.[0]?.title;
      if (!hit || !relevant(hit, item)) continue;
      const sum = await summaryFor(hit, signal);
      if (sum) {
        cache.set(key, sum);
        return sum;
      }
    } catch (err) {
      if (err.name === 'AbortError') throw err;
    }
  }

  const fallback = { text: fallbackBlurb(item), wiki: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(item.title)}` };
  cache.set(key, fallback);
  return fallback;
}
