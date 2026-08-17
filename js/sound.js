/** One HTML audio element. Unlock on the same tap. Groove always plays. */

const SILENT = 'audio/silence.wav';
const MOBILE = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '')
  || (navigator.maxTouchPoints > 1 && matchMedia('(pointer: fine)').matches === false);

const previewCache = new Map();

function scoreTrack(row, item) {
  const blob = `${row.trackName || ''} ${row.artistName || ''} ${row.collectionName || ''}`.toLowerCase();
  const title = item.title.toLowerCase();
  let n = 0;
  if (blob.includes(title.slice(0, 18))) n += 6;
  String(item.title).toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2).forEach((w) => {
    if (blob.includes(w)) n += 1;
  });
  if (item.meta && blob.includes(String(item.meta).toLowerCase().slice(0, 14))) n += 3;
  const year = String(row.releaseDate || '').slice(0, 4);
  if (year && Math.abs(Number(year) - Number(item.year)) <= 2) n += 2;
  if (/karaoke|tribute|cover|lullaby|8-bit|kidz bop|mr dooves|piano tribute|tv themes on/i.test(blob)) n -= 8;
  return n;
}

export class Boombox {
  constructor() {
    this.bed = document.getElementById('bed');
    this.ctx = null;
    this.master = null;
    this.unlocked = false;
    this.muted = false;
    this.token = 0;
    this.groove = null;
    this.needTap = false;
    this.label = '';
    this.onLabel = () => {};
    this.pending = null;

    this.bed.playsInline = true;
    this.bed.setAttribute('playsinline', '');
    this.bed.setAttribute('webkit-playsinline', '');
    this.bed.loop = true;
    this.bed.preload = 'auto';
    this.bed.volume = MOBILE ? 0.85 : 0.55;
    if (!this.bed.getAttribute('src')) this.bed.src = SILENT;

    const kick = () => {
      if (!this.unlocked || this.muted) return;
      try { this.ctx?.resume(); } catch {}
      if (this.bed.paused) this.bed.play().catch(() => {});
      if (this.needTap && this.pending) {
        this.needTap = false;
        this.play(this.pending);
      }
    };
    document.addEventListener('pointerdown', kick, { passive: true });
    document.addEventListener('touchstart', kick, { passive: true });
  }

  unlock() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 1;
      this.master.connect(this.ctx.destination);
    }
    this.ctx.resume();
    this.tick();
    this.bed.muted = false;
    this.bed.loop = true;
    if (!this.bed.src) this.bed.src = SILENT;
    this.bed.play().catch(() => { this.needTap = true; });
    if (!this.unlocked) {
      this.unlocked = true;
      this.startGroove();
    }
    this.scratch();
  }

  tick() {
    if (!this.ctx) return;
    const buf = this.ctx.createBuffer(1, 1, 22050);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.connect(this.ctx.destination);
    src.start(0);
  }

  setMuted(v) {
    this.muted = v;
    this.bed.muted = v;
    if (this.master) this.master.gain.value = v ? 0 : 1;
    if (v) {
      try { this.bed.pause(); } catch {}
      this.duckGroove(0);
    } else {
      this.ctx?.resume();
      this.bed.play().catch(() => {});
      this.duckGroove(this.bed.src && !this.bed.src.includes('silence') ? 0.03 : 0.14);
    }
  }

  duckGroove(vol) {
    if (!this.groove || !this.ctx) return;
    this.groove.gain.cancelScheduledValues(this.ctx.currentTime);
    this.groove.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.12);
  }

  startGroove() {
    if (!this.ctx || this.groove) return;
    const sr = this.ctx.sampleRate;
    const q = Math.floor(sr * 60 / 96);
    const len = q * 8;
    const buf = this.ctx.createBuffer(1, len, sr);
    const d = buf.getChannelData(0);
    const hit = (at, dur, fn) => {
      const n = Math.floor(dur * sr);
      for (let i = 0; i < n && at + i < d.length; i++) d[at + i] += fn(i / sr);
    };
    for (let i = 0; i < 8; i++) {
      const t = i * q;
      if (i % 2 === 0) {
        hit(t, 0.18, (x) => Math.sin(2 * Math.PI * (90 - x * 240) * x) * Math.exp(-x * 18) * 0.9);
      } else {
        hit(t, 0.14, (x) => (Math.random() * 2 - 1) * Math.exp(-x * 22) * 0.45);
      }
      hit(t, 0.04, (x) => (Math.random() * 2 - 1) * Math.exp(-x * 70) * 0.12);
      hit(t + Math.floor(q / 2), 0.03, (x) => (Math.random() * 2 - 1) * Math.exp(-x * 80) * 0.1);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const g = this.ctx.createGain();
    g.gain.value = 0.14;
    src.connect(g).connect(this.master || this.ctx.destination);
    src.start();
    this.groove = g;
    this.grooveSrc = src;
  }

  noise(dur, vol, fn) {
    if (!this.ctx || this.muted) return;
    const sr = this.ctx.sampleRate;
    const n = Math.floor(sr * dur);
    const buf = this.ctx.createBuffer(1, n, sr);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (fn ? fn(i / n) : 1);
    const src = this.ctx.createBufferSource();
    const filter = this.ctx.createBiquadFilter();
    const g = this.ctx.createGain();
    src.buffer = buf;
    filter.type = 'bandpass';
    filter.frequency.value = 1800;
    g.gain.setValueAtTime(vol, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + dur);
    src.connect(filter).connect(g).connect(this.master || this.ctx.destination);
    src.start();
    return { src, filter };
  }

  scratch() {
    if (!this.ctx || this.muted) return;
    this.ctx.resume();
    const now = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const dur = 0.09 + Math.random() * 0.05;
      const { filter } = this.noise(dur, 0.55, (t) => 1 - t) || {};
      if (filter) {
        filter.frequency.setValueAtTime(400 + i * 200, now + i * 0.07);
        filter.frequency.exponentialRampToValueAtTime(4200, now + i * 0.07 + dur);
      }
    }
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(220, now);
    o.frequency.exponentialRampToValueAtTime(70, now + 0.18);
    g.gain.setValueAtTime(0.12, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    o.connect(g).connect(this.master || this.ctx.destination);
    o.start(now);
    o.stop(now + 0.22);
  }

  staticBurst() {
    if (!this.ctx || this.muted) return;
    this.ctx.resume();
    this.noise(0.28, 0.42, (t) => (t < 0.1 ? 1 : 1 - t));
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = 'square';
    o.frequency.value = 60;
    g.gain.setValueAtTime(0.08, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.2);
    o.connect(g).connect(this.master || this.ctx.destination);
    o.start();
    o.stop(this.ctx.currentTime + 0.22);
  }

  async lookup(item) {
    const key = `${item.year}|${item.title}|${item.cue}`;
    if (previewCache.has(key)) return previewCache.get(key);
    const q = item.cue || `${item.title} ${item.meta || ''}`;
    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&country=US&limit=12`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      const hits = (data.results || []).filter((r) => r.previewUrl);
      hits.sort((a, b) => scoreTrack(b, item) - scoreTrack(a, item));
      const best = hits[0] && scoreTrack(hits[0], item) >= 3 ? hits[0] : hits[0] || null;
      previewCache.set(key, best);
      return best;
    } catch {
      return null;
    }
  }

  async play(item) {
    if (this.muted || !item) return;
    this.pending = item;
    const token = ++this.token;
    const track = await this.lookup(item);
    if (token !== this.token) return;
    if (!track?.previewUrl) {
      this.duckGroove(0.22);
      this.label = '90s BOOM-BAP BED';
      this.onLabel(this.label);
      return;
    }
    const same = this.bed.currentSrc === track.previewUrl || this.bed.src === track.previewUrl;
    if (same && !this.bed.paused) {
      this.label = `${track.artistName} — ${track.trackName}`;
      this.onLabel(this.label);
      return;
    }
    this.bed.loop = true;
    this.bed.muted = false;
    this.bed.volume = MOBILE ? 0.9 : 0.6;
    this.bed.src = track.previewUrl;
    this.label = `${track.artistName} — ${track.trackName}`;
    this.onLabel(this.label);
    this.duckGroove(0.03);
    try {
      await this.bed.play();
      this.needTap = false;
    } catch {
      this.needTap = true;
      this.onLabel('TAP ANYWHERE FOR MUSIC');
      this.duckGroove(0.16);
    }
  }
}
