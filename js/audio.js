/** Modem sting, logon line, wipe stingers. Music lives in TuneBed. */

export class NostalAudio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.keep = null;
    this.muted = false;
    this.nodes = [];
    this.logonBuf = null;
    this.logonDecoded = null;
    this.logonStarted = false;
    this.logonEl = new Audio('audio/youve-got-nostalgia.wav');
    this.logonEl.preload = 'auto';
    this.logonEl.playsInline = true;
    this.logonEl.setAttribute('playsinline', '');
    this.logonEl.setAttribute('webkit-playsinline', '');
    this.logonEl.hidden = true;
    document.body.appendChild(this.logonEl);
    fetch('audio/youve-got-nostalgia.wav')
      .then((r) => r.arrayBuffer())
      .then((buf) => { this.logonBuf = buf; })
      .catch(() => {});
  }

  unlock() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 1;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    if (!this.keep && this.ctx) {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.frequency.value = 40;
      g.gain.value = 0.00008;
      o.connect(g).connect(this.ctx.destination);
      o.start();
      this.keep = o;
    }
    if (this.logonBuf && this.ctx && !this.logonDecoded) {
      const copy = this.logonBuf.slice(0);
      this.ctx.decodeAudioData(copy).then((dec) => { this.logonDecoded = dec; }).catch(() => {});
    }
  }

  setMuted(v) {
    this.muted = v;
    this.stopAll();
    this.stopLogon();
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
    this.stopLogon();
    try { speechSynthesis.cancel(); } catch {}
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

  handshake(when, dur = 1.15) {
    if (!this.ctx || this.muted) return;
    const steps = 28;
    for (let i = 0; i < steps; i++) {
      const f = 380 + ((i * 137) % 1700);
      this.tone(f, when + i * (dur / steps), dur / steps + 0.02, i % 2 ? 'square' : 'sawtooth', 0.016);
    }
    this.noise(when, dur, 0.038, 2400);
    this.noise(when + 0.2, dur - 0.2, 0.022, 4200);
  }

  chime(when) {
    this.tone(784, when, 0.14, 'sine', 0.07);
    this.tone(1175, when + 0.12, 0.22, 'sine', 0.055);
    this.tone(1568, when + 0.12, 0.18, 'triangle', 0.02);
  }

  scratch(when = this.ctx?.currentTime || 0, hits = 3) {
    if (!this.ctx || this.muted) return;
    for (let i = 0; i < hits; i++) {
      const t = when + i * 0.09;
      const dur = 0.11 + (i % 2) * 0.05;
      const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let s = 0; s < len; s++) data[s] = (Math.random() * 2 - 1) * (1 - s / len);
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.value = 2.4;
      const startF = i % 2 ? 2400 : 900;
      const endF = i % 2 ? 280 : 1800;
      bp.frequency.setValueAtTime(startF, t);
      bp.frequency.exponentialRampToValueAtTime(Math.max(80, endF), t + dur);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.11, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(bp).connect(g).connect(this._out());
      src.start(t);
      src.stop(t + dur + 0.02);
      this.nodes.push(src, bp, g);
    }
  }

  staticBurst(when = this.ctx?.currentTime || 0) {
    this.noise(when, 0.22, 0.08, 3200);
    this.noise(when, 0.18, 0.05, 800);
    this.tone(90, when, 0.12, 'sawtooth', 0.02);
  }

  slimeSplat(when = this.ctx?.currentTime || 0) {
    this.noise(when, 0.32, 0.07, 500);
    this.tone(140, when, 0.28, 'sine', 0.05);
    this.tone(70, when + 0.08, 0.3, 'sine', 0.035);
    this.noise(when + 0.12, 0.2, 0.04, 1800);
  }

  startLogonNow() {
    if (this.muted || this.logonStarted) return;
    this.logonStarted = true;
    this.logonEl.muted = false;
    this.logonEl.volume = 0.95;
    try { this.logonEl.currentTime = 0; } catch {}
    const p = this.logonEl.play();
    if (p && p.catch) {
      p.catch(() => {
        if (!this.playDecodedLogon()) this.speakFallback();
      });
    }
  }

  speakFallback() {
    if (typeof speechSynthesis === 'undefined') return;
    try { speechSynthesis.cancel(); } catch {}
    const u = new SpeechSynthesisUtterance("You've got nostalgia.");
    u.rate = 1;
    u.pitch = 0.97;
    u.volume = 1;
    speechSynthesis.speak(u);
  }

  playDecodedLogon() {
    if (this.muted || !this.ctx || !this.logonDecoded) return false;
    const src = this.ctx.createBufferSource();
    const g = this.ctx.createGain();
    g.gain.value = 0.95;
    src.buffer = this.logonDecoded;
    src.connect(g).connect(this._out());
    src.start();
    this.nodes.push(src, g);
    return true;
  }

  async speakNostalgia() {
    if (this.muted) return;
    if (this.logonStarted && !this.logonEl.paused) {
      await new Promise((r) => {
        this.logonEl.onended = () => r();
        setTimeout(r, 2400);
      });
      return;
    }
    if (this.logonBuf && this.ctx && !this.logonDecoded) {
      try {
        this.logonDecoded = await this.ctx.decodeAudioData(this.logonBuf.slice(0));
      } catch {}
    }
    if (this.playDecodedLogon()) {
      await new Promise((r) => setTimeout(r, 2200));
      return;
    }
    this.startLogonNow();
    await new Promise((r) => setTimeout(r, 2200));
  }

  stopLogon() {
    try { this.logonEl.pause(); this.logonEl.currentTime = 0; } catch {}
  }

  async dialUp(onStatus) {
    this.unlock();
    const say = (s) => { try { onStatus?.(s); } catch {} };
    if (this.muted) {
      say('Connected.');
      return;
    }
    const t = this.ctx.currentTime;
    say('Dialing…');
    this.tone(350, t, 0.28, 'sine', 0.045);
    this.tone(440, t, 0.28, 'sine', 0.045);
    const keys = [[941, 1336], [697, 1209], [697, 1477], [770, 1336]];
    keys.forEach((p, i) => {
      this.tone(p[0], t + 0.32 + i * 0.07, 0.06, 'sine', 0.05);
      this.tone(p[1], t + 0.32 + i * 0.07, 0.06, 'sine', 0.05);
    });
    say('Handshake…');
    this.tone(2100, t + 0.7, 0.28, 'sine', 0.04);
    this.handshake(t + 0.95, 0.7);
    await new Promise((r) => setTimeout(r, 1700));
    say('Connected.');
    this.chime(this.ctx.currentTime);
    await new Promise((r) => setTimeout(r, 280));
    await this.speakNostalgia();
    this.stopAll();
  }

  whoosh(when, dur = 0.28, vol = 0.05) {
    this.noise(when, dur, vol, 700);
    this.noise(when, dur * 0.7, vol * 0.6, 1800);
    this.tone(140, when, dur, 'sine', vol * 0.45);
    this.tone(90, when + 0.04, dur * 0.8, 'sine', vol * 0.3);
  }

  wipe(type, genreChange) {
    if (!this.ctx || this.muted || this.ctx.state === 'closed') return;
    const t = this.ctx.currentTime;
    if (!genreChange) {
      this.staticBurst(t);
      return;
    }
    this.scratch(t, type === 'neon' || type === 'checker' ? 4 : 2);
    if (type === 'slime') {
      this.slimeSplat(t);
      return;
    }
    if (type === 'checker') {
      this.whoosh(t, 0.2, 0.04);
      this.noise(t, 0.16, 0.04, 2200);
      return;
    }
    if (type === 'leader') {
      this.tone(880, t, 0.07, 'sine', 0.035);
      this.tone(880, t + 0.24, 0.07, 'sine', 0.035);
      this.tone(880, t + 0.48, 0.14, 'sine', 0.04);
      return;
    }
    if (type === 'tape') {
      this.tone(90, t, 0.08, 'square', 0.018);
      this.noise(t, 0.22, 0.05, 800);
      return;
    }
    if (type === 'neon') {
      this.whoosh(t, 0.24, 0.045);
      return;
    }
    if (type === 'paparazzi') {
      this.noise(t, 0.035, 0.09, 4200);
      this.noise(t + 0.14, 0.035, 0.08, 4000);
      this.noise(t + 0.3, 0.04, 0.09, 3800);
      return;
    }
    if (type === 'glitch') {
      this.handshake(t, 0.35);
      return;
    }
    if (type === 'splash') {
      this.tone(784, t, 0.1, 'sine', 0.03);
      this.tone(1046, t + 0.09, 0.16, 'sine', 0.028);
      return;
    }
    if (type === 'sitcom') {
      this.tone(392, t, 0.1, 'triangle', 0.03);
      this.tone(523, t + 0.08, 0.14, 'triangle', 0.028);
      return;
    }
    if (type === 'stadium') {
      this.noise(t, 0.32, 0.055, 600);
      this.tone(98, t, 0.22, 'sawtooth', 0.02);
      return;
    }
    this.staticBurst(t);
  }
}
