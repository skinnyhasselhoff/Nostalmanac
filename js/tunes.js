/** Apple Music previews. Primed in the same tap that enters so phones can play. */

import { queriesFor, pickTrack, labelFor } from './cues.js';

const cache = new Map();
const SILENT = 'audio/silence.wav';
const MOBILE = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '')
  || (navigator.maxTouchPoints > 1 && !window.matchMedia('(pointer: fine)').matches);

function makePlayer() {
  const el = new Audio();
  el.preload = 'auto';
  el.loop = true;
  el.hidden = true;
  el.playsInline = true;
  el.setAttribute('playsinline', '');
  el.setAttribute('webkit-playsinline', '');
  document.body.appendChild(el);
  return el;
}

export class TuneBed {
  constructor() {
    this.el = makePlayer();
    this.hold = makePlayer();
    this.volume = MOBILE ? 0.55 : 0.32;
    this.el.volume = this.volume;
    this.muted = false;
    this.token = 0;
    this.label = '';
    this.onLabel = () => {};
    this.pending = null;
    this.armed = false;
    this.el.src = SILENT;
    this.hold.src = SILENT;
  }

  prime() {
    this.armed = true;
    const boot = (node) => {
      try {
        if (!node.src) node.src = SILENT;
        node.loop = true;
        node.muted = false;
        node.volume = 0.01;
        const p = node.play();
        if (p && p.catch) p.catch(() => { this.armed = false; });
      } catch {
        this.armed = false;
      }
    };
    boot(this.hold);
    boot(this.el);
  }

  setMuted(v) {
    this.muted = v;
    this.el.muted = v;
    if (v) this.el.pause();
    else if (this.pending) this.play(this.pending);
    else this.resume();
  }

  pause() {
    try { this.el.pause(); } catch {}
  }

  resume() {
    if (this.muted) return;
    if (this.pending) {
      this.play(this.pending);
      return;
    }
    if (!this.el.src || this.el.src.includes('silence.wav')) return;
    this.el.play().catch(() => {});
  }

  kick() {
    if (this.muted) return;
    this.prime();
    this.resume();
  }

  stop() {
    this.token += 1;
    this.pending = null;
    this.el.src = SILENT;
    this.label = '';
    this.onLabel('');
  }

  async play(item) {
    if (this.muted || !item) return;
    this.pending = item;
    const token = ++this.token;
    const track = await this.lookup(item);
    if (token !== this.token) return;
    if (!track?.previewUrl) {
      this.pause();
      this.label = '';
      this.onLabel('');
      return;
    }
    const same = this.el.src === track.previewUrl || this.el.src.endsWith(track.previewUrl);
    if (same && !this.el.paused) {
      this.label = labelFor(track, item);
      this.onLabel(this.label);
      return;
    }
    this.el.src = track.previewUrl;
    this.el.loop = true;
    this.el.muted = false;
    this.el.volume = this.volume;
    this.label = labelFor(track, item);
    this.onLabel(this.label);
    try {
      await this.el.play();
      this.pending = item;
    } catch {
      this.onLabel('tap anywhere for music');
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
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=song&country=US&limit=12`;
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
