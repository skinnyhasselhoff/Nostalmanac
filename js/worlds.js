/** Canvas FX: Matrix rain + Sonic rings */

const KATA = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ012345789Z';

export class WorldFX {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.world = 'boot';
    this.drops = [];
    this.rings = [];
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const box = this.canvas.parentElement?.getBoundingClientRect();
    this.w = Math.max(1, Math.floor(box?.width || this.canvas.clientWidth || innerWidth));
    this.h = Math.max(1, Math.floor(box?.height || this.canvas.clientHeight || innerHeight));
    this.canvas.width = this.w * dpr;
    this.canvas.height = this.h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.font = Math.max(12, Math.floor(this.w / 42));
    const cols = Math.ceil(this.w / this.font);
    this.drops = Array.from({ length: cols }, () => Math.random() * -40);
    this.rings = Array.from({ length: 10 }, (_, i) => ({
      x: (i * 0.12 + 0.08) * this.w,
      y: 0.42 * this.h + Math.sin(i) * 40,
      r: 14 + (i % 3) * 4,
      s: 1.2 + (i % 4) * 0.4,
    }));
  }

  setWorld(name) {
    this.world = name;
    this.ctx.clearRect(0, 0, this.w, this.h);
  }

  tick(t) {
    const { ctx, w, h } = this;
    if (this.world === 'matrix') {
      this.drawMatrix();
      return;
    }
    ctx.clearRect(0, 0, w, h);
    if (this.world === 'sonic') this.drawRings(t);
    else if (this.world === 'gotham') this.drawBats(t);
    else if (this.world === 'nick') this.drawSplat(t);
    else if (this.world === 'bayside') this.drawSparkle(t);
    else if (this.world === 'mtv') this.drawNeon(t);
    else if (this.world === 'court') this.drawBall(t);
    else if (this.world === 'studio') this.drawSparkle(t);
    else if (this.world === 'flash') this.drawFlash(t);
    else if (this.world === 'news') this.drawBats(t);
  }

  drawMatrix() {
    const { ctx, w, h, font, drops } = this;
    ctx.fillStyle = 'rgba(0, 12, 4, 0.18)';
    ctx.fillRect(0, 0, w, h);
    ctx.font = `${font}px monospace`;
    drops.forEach((y, i) => {
      const ch = KATA[Math.floor(Math.random() * KATA.length)];
      const x = i * font;
      ctx.fillStyle = '#b6ffce';
      ctx.fillText(ch, x, y * font);
      ctx.fillStyle = '#00c853';
      ctx.fillText(KATA[Math.floor(Math.random() * KATA.length)], x, (y - 1) * font);
      if (y * font > h && Math.random() > 0.975) drops[i] = 0;
      else drops[i] = y + 0.85;
    });
  }

  drawRings(t) {
    const { ctx, rings } = this;
    rings.forEach((ring, i) => {
      ring.x += ring.s;
      if (ring.x > this.w + 40) ring.x = -40;
      ring.y = 0.38 * this.h + Math.sin(t * 2 + i) * 18;
      ctx.save();
      ctx.translate(ring.x, ring.y);
      ctx.strokeStyle = '#ffd200';
      ctx.shadowColor = '#ffea00';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(0, 0, ring.r, ring.r * 0.55, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#fff6a0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, ring.r * 0.55, ring.r * 0.28, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
  }

  drawBats(t) {
    const { ctx, w, h } = this;
    ctx.fillStyle = 'rgba(232, 163, 23, 0.12)';
    for (let i = 0; i < 6; i++) {
      const x = (Math.sin(t * 0.4 + i * 1.7) * 0.4 + 0.5) * w;
      const y = 80 + i * 36 + Math.sin(t * 2 + i) * 10;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(0.7 + (i % 3) * 0.15, 0.7);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-16, -10, -22, 4);
      ctx.quadraticCurveTo(-8, 0, 0, 8);
      ctx.quadraticCurveTo(8, 0, 22, 4);
      ctx.quadraticCurveTo(16, -10, 0, 0);
      ctx.fill();
      ctx.restore();
    }
  }

  drawSplat(t) {
    const { ctx, w, h } = this;
    const colors = ['#b6ff3a', '#9ee000', '#ffe14a', '#7cff3a'];
    for (let i = 0; i < 9; i++) {
      const x = (0.08 + i * 0.11) * w;
      const fall = ((t * 55 + i * 70) % (h * 0.72));
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.ellipse(x, fall, 10 + (i % 3) * 4, 18 + (i % 4) * 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, fall + 16, 7 + (i % 2) * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawSparkle(t) {
    const { ctx, w, h } = this;
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    for (let i = 0; i < 14; i++) {
      const x = ((i * 0.17 + t * 0.04) % 1) * w;
      const y = (0.18 + (i % 5) * 0.12) * h;
      const s = 2 + (i % 3);
      ctx.fillRect(x, y, s, s);
    }
  }

  drawNeon(t) {
    const { ctx, w, h } = this;
    for (let i = 0; i < 12; i++) {
      const barH = (0.12 + Math.abs(Math.sin(t * 4 + i)) * 0.28) * h;
      ctx.fillStyle = i % 2 ? '#ff2bd6' : '#2de0c8';
      ctx.globalAlpha = 0.45;
      ctx.fillRect(w * 0.12 + i * 18, h * 0.62 - barH, 10, barH);
    }
    ctx.globalAlpha = 1;
  }

  drawBall(t) {
    const { ctx, w, h } = this;
    const y = 0.42 * h + Math.abs(Math.sin(t * 3)) * 0.18 * h;
    ctx.fillStyle = '#c45a28';
    ctx.beginPath();
    ctx.arc(0.78 * w, y, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0.78 * w, y, 16, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawFlash(t) {
    const { ctx, w, h } = this;
    for (let i = 0; i < 4; i++) {
      const pulse = (Math.sin(t * 6 + i) + 1) / 2;
      ctx.fillStyle = `rgba(255,255,255,${0.04 + pulse * 0.08})`;
      ctx.beginPath();
      ctx.arc((0.2 + i * 0.22) * w, (0.22 + (i % 2) * 0.18) * h, 30 + pulse * 20, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export class WipeFX {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.until = 0;
    this.dur = 560;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.nw = 160;
    this.nh = 90;
    this.canvas.width = this.nw;
    this.canvas.height = this.nh;
    this.ctx.imageSmoothingEnabled = false;
  }

  burst(ms = 560) {
    this.dur = ms;
    this.until = performance.now() + ms;
  }

  tick() {
    const { ctx, nw, nh } = this;
    const left = this.until - performance.now();
    if (left <= 0) {
      ctx.clearRect(0, 0, nw, nh);
      return;
    }
    const elapsed = this.dur - left;
    if (elapsed < 100) this.drawBars();
    else this.drawSnow();
  }

  drawBars() {
    const { ctx, nw, nh } = this;
    const cols = ['#ffffff', '#ffe14a', '#2de0c8', '#3ecb5a', '#ff4fd8', '#cc0000', '#3a4adf', '#111111'];
    const bw = nw / cols.length;
    cols.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(i * bw, 0, bw + 1, nh * 0.72);
    });
    const low = ['#002244', '#ffffff', '#4a0080', '#111111', '#111111', '#222222', '#111111', '#000000'];
    low.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(i * bw, nh * 0.72, bw + 1, nh * 0.28);
    });
  }

  drawSnow() {
    const { ctx, nw, nh } = this;
    const img = ctx.createImageData(nw, nh);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      if (Math.random() > 0.6) {
        d[i] = Math.random() * 255;
        d[i + 1] = Math.random() * 255;
        d[i + 2] = Math.random() * 255;
      } else {
        const v = Math.random() * 255;
        d[i] = d[i + 1] = d[i + 2] = v;
      }
      d[i + 3] = 230;
    }
    for (let k = 0; k < 5; k++) {
      const y = ((performance.now() / 14 + k * 17) % nh) | 0;
      for (let x = 0; x < nw; x++) {
        const i = (y * nw + x) * 4;
        d[i] = d[i + 1] = d[i + 2] = 255;
        d[i + 3] = 255;
      }
    }
    for (let t = 0; t < 4; t++) {
      const y = (Math.random() * nh) | 0;
      const shift = ((Math.random() * 20) | 0) - 10;
      for (let x = 0; x < nw; x++) {
        const sx = (x + shift + nw) % nw;
        const di = (y * nw + x) * 4;
        const si = (y * nw + sx) * 4;
        d[di] = d[si];
        d[di + 1] = d[si + 1];
        d[di + 2] = d[si + 2];
      }
    }
    ctx.putImageData(img, 0, 0);
  }
}
