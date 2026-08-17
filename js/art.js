/** Real pictures for the almanac. Wikipedia / TVMaze posters, iTunes album art for music. */

import { coverImage } from './wiki.js';

const cache = new Map();

function biggerItunes(url) {
  return String(url || '').replace(/\d+x\d+bb/, '1200x1200bb');
}

function artQuality(url) {
  if (!url) return 0;
  const u = url.toLowerCase();
  if (/\.svg(\?|$)/.test(u)) return 1;
  if (/box.?art|poster|cover|clamshell|genesis_box|vhs/i.test(u)) return 6;
  if (/mzstatic|tvmaze|static\.tvmaze/i.test(u)) return 5;
  if (/upload\.wikimedia\.org\/wikipedia\/en\//i.test(u)) return 5;
  return 3;
}

async function itunesImage(item, signal) {
  const entity = item.cat === 'music' ? 'song' : item.cat === 'tv' || item.cat === 'cartoon' ? 'tvSeason' : item.cat === 'movie' ? 'movie' : '';
  if (!entity) return '';
  const q = item.cat === 'music'
    ? `${item.title} ${item.meta || ''}`
    : `${item.title} ${item.year || ''}`;
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=${entity}&country=US&limit=8`;
    const res = await fetch(url, { signal });
    if (!res.ok) return '';
    const data = await res.json();
    const titleL = item.title.toLowerCase();
    const hits = (data.results || []).filter((r) => r.artworkUrl100);
    const ranked = hits.map((r) => {
      const name = `${r.collectionName || ''} ${r.trackName || ''}`.toLowerCase();
      let score = 0;
      if (name.includes(titleL.slice(0, 18))) score += 4;
      bits(item.title).forEach((w) => { if (name.includes(w)) score += 1; });
      if (item.meta && name.includes(String(item.meta).toLowerCase().slice(0, 12))) score += 2;
      if (item.cat === 'music') {
        const artist = String(item.meta || '').toLowerCase();
        const an = String(r.artistName || '').toLowerCase();
        if (artist && an.includes(artist.split(' ')[0])) score += 8;
        else if (artist) score -= 5;
        if (/hits \d|karaoke|tribute|now that|kidz bop/i.test(name)) score -= 12;
      }
      const year = String(r.releaseDate || '').slice(0, 4);
      if (year && Math.abs(Number(year) - Number(item.year)) <= 1) score += 2;
      return { score, url: biggerItunes(r.artworkUrl100) };
    }).sort((a, b) => b.score - a.score);
    return ranked[0]?.score > 2 ? ranked[0].url : (item.cat === 'music' ? '' : (hits[0] ? biggerItunes(hits[0].artworkUrl100) : ''));
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    return '';
  }
}

function bits(s) {
  return String(s || '').toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2);
}

async function tvmazeImage(item, signal) {
  try {
    const url = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(item.title)}`;
    const res = await fetch(url, { signal });
    if (!res.ok) return '';
    const hits = await res.json();
    const ranked = (hits || []).map((h) => {
      const show = h.show || {};
      const name = String(show.name || '').toLowerCase();
      const year = Number(String(show.premiered || '').slice(0, 4));
      let score = Number(h.score) || 0;
      if (name === item.title.toLowerCase()) score += 4;
      if (year && Math.abs(year - Number(item.year)) <= 2) score += 3;
      return { score, url: show.image?.original || show.image?.medium || '' };
    }).filter((r) => r.url).sort((a, b) => b.score - a.score);
    return ranked[0]?.url || '';
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    return '';
  }
}

export async function portrait(item, signal) {
  const key = `${item.cat}|${item.year}|${item.title}`;
  if (cache.has(key)) return cache.get(key);

  const jobs = [];
  if (item.cat === 'music' || item.cat === 'movie') jobs.push(itunesImage(item, signal));
  if (item.cat === 'tv' || item.cat === 'cartoon') {
    jobs.push(tvmazeImage(item, signal));
    jobs.push(itunesImage(item, signal));
  }
  jobs.push(coverImage(item, signal));

  try {
    const urls = await Promise.all(jobs);
    const best = urls
      .filter(Boolean)
      .sort((a, b) => artQuality(b) - artQuality(a))[0] || '';
    cache.set(key, best);
    return best;
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    return '';
  }
}

export { artQuality };
