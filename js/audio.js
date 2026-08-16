/** Modem sting on enter + short wipe stingers. Music lives in TuneBed, not here. */

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

  staticBurst() {
    this.wipe('static', true);
  }

  wipe(type, genreChange) {
    if (!this.ctx || this.muted || this.ctx.state === 'closed') return;
    const t = this.ctx.currentTime;
    if (!genreChange) {
      this.noise(t, 0.1, 0.035, 2600);
      return;
    }
    if (type === 'slime') {
      this.noise(t, 0.22, 0.05, 900);
      this.tone(180, t, 0.18, 'sine', 0.03);
      this.tone(90, t + 0.08, 0.2, 'sine', 0.02);
      return;
    }
    if (type === 'checker') {
      [392, 494, 587, 784].forEach((f, i) => this.tone(f, t + i * 0.05, 0.07, 'square', 0.018));
      this.noise(t, 0.12, 0.03, 1800);
      return;
    }
    if (type === 'leader') {
      this.tone(1000, t, 0.08, 'sine', 0.04);
      this.tone(1000, t + 0.22, 0.08, 'sine', 0.04);
      this.tone(1000, t + 0.44, 0.12, 'sine', 0.045);
      this.noise(t, 0.5, 0.02, 600);
      return;
    }
    if (type === 'neon') {
      this.tone(220, t, 0.18, 'sawtooth', 0.03);
      this.tone(880, t + 0.04, 0.12, 'square', 0.016);
      this.noise(t, 0.16, 0.04, 3200);
      return;
    }
    if (type === 'paparazzi') {
      this.noise(t, 0.04, 0.08, 4000);
      this.noise(t + 0.12, 0.04, 0.07, 4200);
      this.noise(t + 0.26, 0.05, 0.08, 3800);
      this.tone(1800, t, 0.03, 'square', 0.02);
      return;
    }
    if (type === 'glitch') {
      this.noise(t, 0.2, 0.055, 5200);
      this.tone(80, t, 0.1, 'square', 0.03);
      this.tone(1400, t + 0.08, 0.04, 'square', 0.02);
      return;
    }
    if (type === 'splash') {
      this.noise(t, 0.18, 0.05, 1400);
      this.tone(240, t, 0.12, 'sine', 0.03);
      return;
    }
    if (type === 'sitcom') {
      this.tone(523, t, 0.08, 'triangle', 0.03);
      this.tone(659, t + 0.07, 0.1, 'triangle', 0.03);
      this.noise(t, 0.14, 0.03, 2000);
      return;
    }
    if (type === 'stadium') {
      this.noise(t, 0.22, 0.045, 800);
      this.tone(196, t, 0.16, 'sawtooth', 0.025);
      return;
    }
    this.noise(t, 0.24, 0.072, 2400);
    this.noise(t + 0.04, 0.16, 0.045, 5200);
    this.tone(58, t, 0.08, 'sawtooth', 0.02);
    this.tone(1400, t + 0.02, 0.05, 'square', 0.012);
  }
}
