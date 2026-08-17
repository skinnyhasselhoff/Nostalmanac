/** Quiet Apple Music previews. Wrong song = silence. */

import { queriesFor, pickTrack, labelFor } from './cues.js';

const cache = new Map();

export class TuneBed {
  constructor() {
    this.el = new Audio();
    this.el.preload = 'auto';
    this.el.loop = true;
    this.el.hidden = true;
    this.el.setAttribute('playsinline', '');
    document.body.appendChild(this.el);
    this.volume = 0.18;
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
    this.label = labelFor(track, item);
    this.onLabel(this.label);
    try {
      await this.el.play();
    } catch {
      this.onLabel('');
    }
  }

  async lookup(item) {
    const key = `${item.cat}|${item.title}|${item.meta}|${item.note}`;
    if (cache.has(key)) return cache.get(key);
    const queries = queriesFor(item);
    if (!queries.length) {
      cache.set(key, null);
      return null;
    }
    for (const q of queries) {
      try {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=song&limit=8`;
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();
        const track = pickTrack(data.results, item);
        if (track) {
          cache.set(key, track);
          return track;
        }
      } catch {
        /* try the next query */
      }
    }
    cache.set(key, null);
    return null;
  }
}
