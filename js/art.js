/** Real pictures for the almanac. Wikipedia first, iTunes artwork as backup. */

const cache = new Map();

function biggerWiki(url) {
  return String(url || '').replace(/\/\d+px-/, '/800px-');
}

function biggerItunes(url) {
  return String(url || '').replace(/\d+x\d+bb/, '600x600bb');
}

async function itunesImage(item, signal) {
  const entity = item.cat === 'movie' ? 'movie'
    : item.cat === 'music' || item.cat === 'game' ? 'album'
    : item.cat === 'tv' || item.cat === 'cartoon' ? 'tvSeason'
    : 'allTrack';
  const q = item.cat === 'music'
    ? `${item.title} ${item.meta || ''}`
    : `${item.title} ${item.year}`;
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=${entity}&limit=5`;
    const res = await fetch(url, { signal });
    if (!res.ok) return '';
    const data = await res.json();
    const hit = (data.results || []).find((r) => r.artworkUrl100);
    return hit ? biggerItunes(hit.artworkUrl100) : '';
  } catch {
    return '';
  }
}

export async function portrait(item, wikiImage, signal) {
  const key = `${item.cat}|${item.year}|${item.title}`;
  if (cache.has(key)) return cache.get(key);
  const itunes = await itunesImage(item, signal);
  let url = '';
  if (item.cat === 'music' || item.cat === 'movie' || item.cat === 'game') {
    url = itunes || wikiImage || '';
  } else {
    url = wikiImage || itunes || '';
  }
  cache.set(key, url);
  return url;
}
