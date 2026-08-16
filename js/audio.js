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
    try { speechSynthesis.cancel(); } catch {}
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

  async speakNostalgia() {
    if (this.muted || typeof speechSynthesis === 'undefined') return;
    try { speechSynthesis.cancel(); } catch {}
    const waitVoices = () => new Promise((resolve) => {
      const ready = speechSynthesis.getVoices();
      if (ready.length) return resolve(ready);
      const t = setTimeout(() => resolve(speechSynthesis.getVoices()), 600);
      speechSynthesis.addEventListener('voiceschanged', () => {
        clearTimeout(t);
        resolve(speechSynthesis.getVoices());
      }, { once: true });
    });
    const voices = await waitVoices();
    const prefer = [/david/i, /mark/i, /alex/i, /daniel/i, /guy/i, /fred/i, /microsoft.*english/i, /google us/i];
    let voice = null;
    for (const re of prefer) {
      voice = voices.find((v) => re.test(v.name) && /^en/i.test(v.lang));
      if (voice) break;
    }
    if (!voice) voice = voices.find((v) => /^en[-_]?US/i.test(v.lang)) || voices.find((v) => /^en/i.test(v.lang));
    const u = new SpeechSynthesisUtterance("You've got nostalgia.");
    u.rate = 0.9;
    u.pitch = 0.78;
    u.volume = 0.92;
    if (voice) u.voice = voice;
    await new Promise((resolve) => {
      u.onend = resolve;
      u.onerror = resolve;
      speechSynthesis.speak(u);
      setTimeout(resolve, 2800);
    });
  }

  async dialUp(onStatus) {
    await this.unlock();
    const say = (s) => { try { onStatus?.(s); } catch {} };
    if (this.muted) {
      say('Connected.');
      return;
    }
    const t = this.ctx.currentTime;
    say('Dialing…');
    this.tone(350, t, 0.38, 'sine', 0.04);
    this.tone(440, t, 0.38, 'sine', 0.04);
    const keys = [[941, 1336], [697, 1209], [697, 1477], [770, 1336], [852, 1336], [770, 1477], [941, 1209]];
    keys.forEach((p, i) => {
      this.tone(p[0], t + 0.48 + i * 0.09, 0.07, 'sine', 0.045);
      this.tone(p[1], t + 0.48 + i * 0.09, 0.07, 'sine', 0.045);
    });
    this.tone(440, t + 1.2, 0.38, 'sine', 0.03);
    this.tone(480, t + 1.2, 0.38, 'sine', 0.03);
    this.tone(440, t + 1.78, 0.32, 'sine', 0.028);
    this.tone(480, t + 1.78, 0.32, 'sine', 0.028);
    say('Handshake…');
    this.tone(2100, t + 2.2, 0.42, 'sine', 0.035);
    this.handshake(t + 2.62, 1.2);
    this.tone(1650, t + 3.85, 0.16, 'square', 0.014);
    this.tone(2100, t + 4.05, 0.12, 'square', 0.012);
    await new Promise((r) => setTimeout(r, 4300));
    say('Connected.');
    this.chime(this.ctx.currentTime);
    await new Promise((r) => setTimeout(r, 420));
    await this.speakNostalgia();
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
    if (type === 'tape') {
      this.tone(240, t, 0.1, 'square', 0.02);
      this.noise(t, 0.18, 0.04, 900);
      this.tone(180, t + 0.08, 0.14, 'sawtooth', 0.016);
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
