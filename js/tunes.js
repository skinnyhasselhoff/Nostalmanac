/** Quiet Apple Music previews for the current card. Real songs, never loud. */

const cache = new Map();

function queryFor(item) {
  const title = item.title;
  const meta = item.meta || '';
  switch (item.cat) {
    case 'music':
      return `${title} ${meta}`;
    case 'movie':
      return `${title} soundtrack theme`;
    case 'tv':
    case 'cartoon':
      return `${title} theme song`;
    case 'game':
      return `${title} video game soundtrack`;
    case 'person':
      return `${title} 1990s`;
    case 'sport':
      return `${title} anthem`;
    case 'toy':
      return `${title} theme`;
    default:
      return `${title} 90s`;
  }
}

function pickTrack(results, item) {
  const hits = (results || []).filter((t) => t.previewUrl);
  if (!hits.length) return null;
  const words = String(item.title).toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2);
  const scored = hits.map((t) => {
    const blob = `${t.trackName} ${t.artistName} ${t.collectionName}`.toLowerCase();
    const score = words.reduce((n, w) => n + (blob.includes(w) ? 1 : 0), 0);
    return { t, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].t;
}

export class TuneBed {
  constructor() {
    this.el = new Audio();
    this.el.preload = 'auto';
    this.el.loop = true;
    this.el.crossOrigin = 'anonymous';
    this.volume = 0.12;
    this.el.volume = this.volume;
    this.muted = false;
    this.token = 0;
    this.label = '';
    this.onLabel = () => {};
  }

  setMuted(v) {
    this.muted = v;
    this.el.muted = v;
    if (v) this.el.pause();
  }

  pause() {
    try { this.el.pause(); } catch {}
  }

  resume() {
    if (this.muted || !this.el.src) return;
    this.el.play().catch(() => {});
  }

  stop() {
    this.token += 1;
    this.el.removeAttribute('src');
    this.el.load();
    this.label = '';
    this.onLabel('');
  }

  async play(item) {
    if (this.muted || !item) return;
    const token = ++this.token;
    const track = await this.lookup(item);
    if (token !== this.token) return;
    if (!track?.previewUrl) {
      this.pause();
      this.label = '';
      this.onLabel('');
      return;
    }
    if (this.el.src === track.previewUrl && !this.el.paused) {
      this.onLabel(this.label);
      return;
    }
    this.el.src = track.previewUrl;
    this.el.volume = this.volume;
    this.label = `${track.trackName} · ${track.artistName}`;
    this.onLabel(this.label);
    try {
      await this.el.play();
    } catch {
      this.onLabel('');
    }
  }

  async lookup(item) {
    const key = `${item.cat}|${item.title}|${item.meta}`;
    if (cache.has(key)) return cache.get(key);
    const q = queryFor(item);
    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=song&limit=5`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      const track = pickTrack(data.results, item);
      cache.set(key, track);
      return track;
    } catch {
      cache.set(key, null);
      return null;
    }
  }
}
