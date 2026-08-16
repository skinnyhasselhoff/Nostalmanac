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
    else if (this.world === 'mtv') this.drawSparkle(t);
    else if (this.world === 'court') this.drawSparkle(t);
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
    const colors = ['#ffe14a', '#b6ff3a', '#5ad0ff', '#fff'];
    for (let i = 0; i < 10; i++) {
      const x = (0.12 + (i % 5) * 0.19) * w;
      const y = (0.18 + Math.floor(i / 5) * 0.52) * h + Math.sin(t + i) * 10;
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.arc(x, y, 7 + (i % 3) * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawSparkle(t) {
    const { ctx, w, h } = this;
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    for (let i = 0; i < 12; i++) {
      const x = ((i * 0.17 + t * 0.04) % 1) * w;
      const y = (0.2 + (i % 4) * 0.15) * h;
      const s = 2 + (i % 3);
      ctx.fillRect(x, y, s, s);
    }
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

  burst(ms = 480) {
    this.until = performance.now() + ms;
  }

  tick() {
    const { ctx, nw, nh } = this;
    if (performance.now() > this.until) {
      ctx.clearRect(0, 0, nw, nh);
      return;
    }
    const img = ctx.createImageData(nw, nh);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.random() * 255;
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 230;
    }
    ctx.putImageData(img, 0, 0);
  }
}
