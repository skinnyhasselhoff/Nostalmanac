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
    this.stopLogon();
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
    if (this.muted) return;
    const played = await this.playLogon();
    if (played) return;
    if (typeof speechSynthesis === 'undefined') return;
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
    const prefer = [/mark/i, /guy/i, /davis/i, /andrew/i, /aaron/i, /david/i, /alex/i, /daniel/i, /samantha/i, /google us english/i];
    let voice = null;
    for (const re of prefer) {
      voice = voices.find((v) => re.test(v.name) && /^en/i.test(v.lang));
      if (voice) break;
    }
    if (!voice) voice = voices.find((v) => /^en[-_]?US/i.test(v.lang)) || voices.find((v) => /^en/i.test(v.lang));
    const say = (text, rate, after) => new Promise((resolve) => {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = rate;
      u.pitch = 0.97;
      u.volume = 0.95;
      if (voice) u.voice = voice;
      u.onend = resolve;
      u.onerror = resolve;
      speechSynthesis.speak(u);
      setTimeout(resolve, after);
    });
    await say("You've got", 0.88, 1100);
    await new Promise((r) => setTimeout(r, 380));
    await say('nostalgia.', 0.72, 2200);
  }

  playLogon() {
    return new Promise((resolve) => {
      this.stopLogon();
      const el = new Audio('audio/youve-got-nostalgia.wav');
      el.preload = 'auto';
      el.volume = 0.92;
      el.playbackRate = 0.96;
      this.logonEl = el;
      let settled = false;
      const done = (ok) => {
        if (settled) return;
        settled = true;
        el.onended = el.onerror = null;
        resolve(ok);
      };
      el.onended = () => done(true);
      el.onerror = () => done(false);
      el.play().then(() => {
        setTimeout(() => done(true), 4200);
      }).catch(() => done(false));
    });
  }

  stopLogon() {
    if (!this.logonEl) return;
    try { this.logonEl.pause(); } catch {}
    try { this.logonEl.removeAttribute('src'); this.logonEl.load(); } catch {}
    this.logonEl = null;
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
      this.whoosh(t, 0.18, 0.04);
      return;
    }
    if (type === 'slime') {
      this.whoosh(t, 0.22, 0.04);
      this.noise(t, 0.28, 0.055, 700);
      this.tone(160, t, 0.22, 'sine', 0.035);
      this.tone(70, t + 0.1, 0.24, 'sine', 0.025);
      return;
    }
    if (type === 'checker') {
      this.whoosh(t, 0.2, 0.04);
      this.noise(t, 0.16, 0.04, 2200);
      this.tone(420, t, 0.05, 'sine', 0.02);
      this.tone(280, t + 0.08, 0.08, 'sine', 0.018);
      return;
    }
    if (type === 'leader') {
      this.tone(880, t, 0.07, 'sine', 0.035);
      this.tone(880, t + 0.24, 0.07, 'sine', 0.035);
      this.tone(880, t + 0.48, 0.14, 'sine', 0.04);
      this.whoosh(t + 0.1, 0.35, 0.03);
      return;
    }
    if (type === 'tape') {
      this.tone(90, t, 0.08, 'square', 0.018);
      this.noise(t, 0.22, 0.05, 800);
      this.tone(70, t + 0.1, 0.18, 'sawtooth', 0.014);
      this.whoosh(t + 0.12, 0.2, 0.03);
      return;
    }
    if (type === 'neon') {
      this.tone(110, t, 0.22, 'sine', 0.04);
      this.tone(220, t + 0.05, 0.16, 'triangle', 0.02);
      this.whoosh(t, 0.24, 0.045);
      return;
    }
    if (type === 'paparazzi') {
      this.noise(t, 0.035, 0.09, 4200);
      this.tone(1600, t, 0.025, 'square', 0.018);
      this.noise(t + 0.14, 0.035, 0.08, 4000);
      this.noise(t + 0.3, 0.04, 0.09, 3800);
      return;
    }
    if (type === 'glitch') {
      this.handshake(t, 0.35);
      this.whoosh(t + 0.1, 0.2, 0.04);
      return;
    }
    if (type === 'splash') {
      this.tone(784, t, 0.1, 'sine', 0.03);
      this.tone(1046, t + 0.09, 0.16, 'sine', 0.028);
      this.whoosh(t, 0.2, 0.035);
      return;
    }
    if (type === 'sitcom') {
      this.tone(392, t, 0.1, 'triangle', 0.03);
      this.tone(523, t + 0.08, 0.14, 'triangle', 0.028);
      this.whoosh(t, 0.18, 0.03);
      return;
    }
    if (type === 'stadium') {
      this.noise(t, 0.32, 0.055, 600);
      this.tone(98, t, 0.22, 'sawtooth', 0.02);
      this.whoosh(t, 0.28, 0.04);
      return;
    }
    this.whoosh(t, 0.26, 0.05);
    this.noise(t, 0.22, 0.05, 2400);
  }
}
