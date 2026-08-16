/** Short modem sting on enter. Then silence. Never loops. Never drones. */

export class NostalAudio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
    this.nodes = [];
  }

  async unlock() {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.master.gain.value = 1;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') await this.ctx.resume();
  }

  setMuted(v) {
    this.muted = v;
    this.silence();
    if (this.master && this.ctx && this.ctx.state !== 'closed') {
      this.master.gain.value = v ? 0 : 1;
    }
  }

  stopAll() {
    this.nodes.forEach((n) => {
      try { n.stop?.(); } catch {}
      try { n.disconnect?.(); } catch {}
    });
    this.nodes = [];
  }

  silence() {
    this.stopAll();
    if (this.master && this.ctx && this.ctx.state !== 'closed') {
      this.master.gain.setValueAtTime(this.muted ? 0 : 1, this.ctx.currentTime);
    }
  }

  _out() {
    return this.master || this.ctx.destination;
  }

  tone(freq, when, dur, type = 'sine', vol = 0.05) {
    if (!this.ctx || this.muted) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, when);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(vol, when + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(g).connect(this._out());
    o.start(when);
    o.stop(when + dur + 0.03);
    this.nodes.push(o, g);
  }

  noise(when, dur, vol = 0.06, freq = 2000) {
    if (!this.ctx || this.muted) return;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = freq;
    bp.Q.value = 0.9;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, when);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    src.connect(bp).connect(g).connect(this._out());
    src.start(when);
    src.stop(when + dur);
    this.nodes.push(src, bp, g);
  }

  async dialUp() {
    await this.unlock();
    if (this.muted) return;
    const t = this.ctx.currentTime;
    this.tone(350, t, 0.22, 'sine', 0.035);
    this.tone(440, t, 0.22, 'sine', 0.035);
    const keys = [[941, 1336], [697, 1209], [697, 1477], [770, 1336]];
    keys.forEach((p, i) => {
      this.tone(p[0], t + 0.28 + i * 0.1, 0.06, 'sine', 0.04);
      this.tone(p[1], t + 0.28 + i * 0.1, 0.06, 'sine', 0.04);
    });
    this.noise(t + 0.75, 0.55, 0.055, 1800);
    this.tone(1650, t + 0.8, 0.16, 'square', 0.016);
    this.tone(2100, t + 1.05, 0.12, 'square', 0.014);
    this.tone(880, t + 1.4, 0.07, 'sine', 0.03);
    await new Promise((r) => setTimeout(r, 1600));
    this.silence();
  }

  tick() {
    if (!this.ctx || this.muted || this.ctx.state === 'closed') return;
    this.noise(this.ctx.currentTime, 0.03, 0.022, 3400);
  }
}
