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
    else if (this.world === 'snes') this.drawCoins(t);
    else if (this.world === 'n64') this.drawStars(t);
    else if (this.world === 'ps1') this.drawOrbs(t);
    else if (this.world === 'arcade') this.drawCabinets(t);
    else if (this.world === 'gb') this.drawPixels(t);
    else if (this.world === 'pc') this.drawCursor(t);
    else if (this.world === 'dc') this.drawOrbs(t);
    else if (this.world === 'gotham') this.drawCinema(t);
    else if (this.world === 'nick') this.drawSplat(t);
    else if (this.world === 'bayside') this.drawSparkle(t);
    else if (this.world === 'friends') this.drawSparkle(t);
    else if (this.world === 'monks') this.drawSparkle(t);
    else if (this.world === 'zip') this.drawSparkle(t);
    else if (this.world === 'belair') this.drawSparkle(t);
    else if (this.world === 'mtv') this.drawCarnival(t);
    else if (this.world === 'court') this.drawBall(t);
    else if (this.world === 'studio') this.drawSparkle(t);
    else if (this.world === 'park') this.drawMidway(t);
    else if (this.world === 'circular') this.drawSparkle(t);
    else if (this.world === 'grocery') this.drawSparkle(t);
    else if (this.world === 'circuit') this.drawScreens(t);
    else if (this.world === 'video') this.drawTickets(t);
    else if (this.world === 'flash') this.drawPaparazzi(t);
    else if (this.world === 'news') this.drawSparkle(t);
  }

  drawMatrix() {
    const { ctx, w, h, font, drops } = this;
    ctx.clearRect(0, 0, w, h);
    ctx.font = `${font}px monospace`;
    drops.forEach((y, i) => {
      const ch = KATA[Math.floor(Math.random() * KATA.length)];
      const x = i * font;
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = '#b6ffce';
      ctx.fillText(ch, x, y * font);
      ctx.fillStyle = '#00c853';
      ctx.fillText(KATA[Math.floor(Math.random() * KATA.length)], x, (y - 1) * font);
      if (y * font > h && Math.random() > 0.975) drops[i] = 0;
      else drops[i] = y + 0.85;
    });
    ctx.globalAlpha = 1;
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
    ctx.globalAlpha = 0.72;
    for (let i = 0; i < 11; i++) {
      const x = (0.06 + i * 0.09) * w;
      const fall = ((t * 70 + i * 70) % (h * 0.85));
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.ellipse(x, fall, 12 + (i % 3) * 5, 22 + (i % 4) * 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, fall + 18, 8 + (i % 2) * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
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

  drawCoins(t) {
    const { ctx, w, h } = this;
    for (let i = 0; i < 8; i++) {
      const x = ((i * 0.11 + 0.12) % 1) * w;
      const y = 0.32 * h + Math.sin(t * 3 + i) * 10;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(0.55 + Math.abs(Math.sin(t * 4 + i)) * 0.45, 1);
      ctx.fillStyle = '#ffe14a';
      ctx.strokeStyle = '#c47828';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  drawStars(t) {
    const { ctx, w, h } = this;
    ctx.fillStyle = '#ffe14a';
    ctx.shadowColor = '#fff6a0';
    ctx.shadowBlur = 10;
    for (let i = 0; i < 7; i++) {
      const x = (0.1 + i * 0.13) * w;
      const y = (0.16 + Math.sin(t * 2 + i) * 0.06) * h;
      const r = 7 + (i % 3) * 2;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(t * 0.8 + i);
      ctx.beginPath();
      for (let p = 0; p < 5; p++) {
        const a = (p * Math.PI * 2) / 5 - Math.PI / 2;
        const b = a + Math.PI / 5;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        ctx.lineTo(Math.cos(b) * r * 0.4, Math.sin(b) * r * 0.4);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.shadowBlur = 0;
  }

  drawFog(t) {
    const { ctx, w, h } = this;
    for (let i = 0; i < 5; i++) {
      const x = ((i * 0.22 + t * 0.03) % 1.2 - 0.1) * w;
      const y = (0.28 + (i % 3) * 0.1) * h;
      const g = ctx.createRadialGradient(x, y, 10, x, y, 90);
      g.addColorStop(0, 'rgba(200,220,230,.22)');
      g.addColorStop(1, 'rgba(200,220,230,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(x, y, 110, 36, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawCabinets(t) {
    const { ctx, w, h } = this;
    for (let i = 0; i < 10; i++) {
      const pulse = 0.35 + Math.abs(Math.sin(t * 5 + i)) * 0.45;
      ctx.strokeStyle = i % 2 ? `rgba(255,43,214,${pulse})` : `rgba(0,229,255,${pulse})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(w * 0.2 + i * 22, h * 0.22, 14, h * 0.38);
    }
  }

  drawPixels(t) {
    const { ctx, w, h } = this;
    ctx.fillStyle = '#0f380f';
    for (let i = 0; i < 16; i++) {
      const x = ((i * 0.08 + t * 0.02) % 1) * w;
      const y = (0.2 + (i % 4) * 0.1) * h;
      ctx.fillRect(x, y, 6, 6);
    }
  }

  drawCursor(t) {
    const { ctx, w, h } = this;
    if (Math.floor(t * 2) % 2 === 0) {
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(w * 0.14, h * 0.28, 8, 18);
    }
    ctx.fillStyle = '#ff2bd6';
    ctx.globalAlpha = 0.25;
    ctx.fillRect(0, ((t * 40) % h), w, 3);
    ctx.globalAlpha = 1;
  }

  drawOrbs(t) {
    const { ctx, w, h } = this;
    for (let i = 0; i < 6; i++) {
      const x = (0.15 + i * 0.14) * w;
      const y = 0.24 * h + Math.sin(t * 2 + i) * 16;
      ctx.fillStyle = i % 2 ? '#ff6a18' : '#fff';
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.arc(x, y, 8 + (i % 3) * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  drawCarnival(t) {
    const { ctx, w, h } = this;
    const colors = ['#ffe14a', '#ff2bd6', '#00e5ff', '#fff'];
    for (let i = 0; i < 22; i++) {
      const x = ((i * 0.09 + t * 0.08) % 1) * w;
      const y = ((i * 0.17 + t * 0.12) % 0.7) * h;
      ctx.fillStyle = colors[i % colors.length];
      ctx.globalAlpha = 0.7;
      ctx.fillRect(x, y, 5 + (i % 3), 5 + (i % 3));
    }
    ctx.globalAlpha = 1;
    ctx.save();
    ctx.translate(w * 0.82, h * 0.18);
    ctx.rotate(t * 1.4);
    ctx.strokeStyle = '#ffe14a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-18, -18);
    ctx.lineTo(18, 18);
    ctx.moveTo(18, -18);
    ctx.lineTo(-18, 18);
    ctx.stroke();
    ctx.restore();
    if (Math.sin(t * 9) > 0.4) {
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w * 0.12, h * 0.08);
      ctx.lineTo(w * 0.22, h * 0.28);
      ctx.lineTo(w * 0.18, h * 0.18);
      ctx.lineTo(w * 0.3, h * 0.36);
      ctx.stroke();
    }
  }

  drawMidway(t) {
    const { ctx, w, h } = this;
    const colors = ['#ff7a18', '#ffe14a', '#ff2bd6', '#7cff3a'];
    for (let i = 0; i < 10; i++) {
      const x = ((i * 0.12 + t * 0.04) % 1) * w;
      const y = (0.12 + (i % 3) * 0.08) * h + Math.sin(t * 2 + i) * 6;
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(192,20,44,.45)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.22);
    for (let x = 0; x <= w; x += 20) {
      ctx.lineTo(x, h * 0.22 + Math.sin(x / 40 + t) * 18);
    }
    ctx.stroke();
  }

  drawScreens(t) {
    const { ctx, w, h } = this;
    for (let i = 0; i < 8; i++) {
      const on = Math.sin(t * 6 + i) > 0.2;
      ctx.fillStyle = on ? (i % 2 ? '#00e5ff' : '#ffe14a') : '#111';
      ctx.globalAlpha = on ? 0.28 : 0.08;
      ctx.fillRect(w * 0.12 + (i % 4) * 70, h * 0.22 + Math.floor(i / 4) * 48, 54, 36);
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

  drawCinema(t) {
    const { ctx, w, h } = this;
    const pulse = (Math.sin(t * 3) + 1) / 2;
    ctx.fillStyle = `rgba(255, 220, 140, ${0.04 + pulse * 0.06})`;
    ctx.beginPath();
    ctx.moveTo(w * 0.72, 0);
    ctx.lineTo(w * 0.86, 0);
    ctx.lineTo(w * 0.68, h * 0.52);
    ctx.lineTo(w * 0.32, h * 0.52);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 240, 200, 0.08)';
    for (let i = 0; i < 18; i++) {
      const x = ((i * 0.07 + t * 0.03) % 1) * w;
      const y = (0.12 + (i % 5) * 0.08) * h;
      ctx.fillRect(x, y, 2, 2);
    }
  }

  drawPaparazzi(t) {
    const { ctx, w, h } = this;
    for (let i = 0; i < 6; i++) {
      const burst = Math.sin(t * 9 + i * 1.7);
      if (burst < 0.72) continue;
      const x = (0.12 + (i % 3) * 0.32) * w;
      const y = (0.16 + Math.floor(i / 3) * 0.22) * h;
      const g = ctx.createRadialGradient(x, y, 2, x, y, 70);
      g.addColorStop(0, 'rgba(255,255,255,.85)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, 70, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawTickets(t) {
    const { ctx, w, h } = this;
    const colors = ['#ffe14a', '#c0142c', '#1a3a88', '#fff'];
    for (let i = 0; i < 10; i++) {
      const x = ((i * 0.13 + t * 0.05) % 1.1 - 0.05) * w;
      const y = (0.18 + (i % 4) * 0.16) * h + Math.sin(t * 2 + i) * 8;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.sin(t + i) * 0.25);
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(-14, -8, 28, 16);
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = '#111';
      ctx.fillRect(-10, -2, 20, 3);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    this.drawSparkle(t);
  }
}

export class WipeFX {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.until = 0;
    this.dur = 560;
    this.mode = 'static';
    this.drops = [];
    this.resize(160, 90);
    window.addEventListener('resize', () => this.resize());
  }

  resize(nw, nh) {
    const mode = this.mode || 'static';
    if (mode === 'glitch') { this.nw = nw || 420; this.nh = nh || 240; this.canvas.style.imageRendering = 'auto'; }
    else if (mode === 'slime') { this.nw = nw || 320; this.nh = nh || 180; this.canvas.style.imageRendering = 'auto'; }
    else { this.nw = nw || 280; this.nh = nh || 160; this.canvas.style.imageRendering = 'auto'; }
    this.canvas.width = this.nw;
    this.canvas.height = this.nh;
    this.ctx.imageSmoothingEnabled = mode === 'glitch' || mode === 'slime';
    this.font = Math.max(10, Math.floor(this.nw / 28));
    this.drops = Array.from({ length: Math.ceil(this.nw / this.font) }, () => Math.random() * -20);
  }

  burst(ms = 560, mode = 'static') {
    this.dur = ms;
    this.mode = mode;
    this.until = performance.now() + ms;
    this.resize();
  }

  tick() {
    const { ctx, nw, nh } = this;
    const left = this.until - performance.now();
    if (left <= 0) {
      ctx.clearRect(0, 0, nw, nh);
      return;
    }
    const elapsed = this.dur - left;
    const mode = this.mode || 'static';
    if (mode === 'leader') this.drawFilm(elapsed);
    else if (mode === 'checker') this.drawChecker(elapsed);
    else if (mode === 'tape') this.drawChecker(elapsed);
    else if (mode === 'slime') this.drawSlime(elapsed);
    else if (mode === 'neon') this.drawTintSnow('#ffe14a', '#ff2bd6');
    else if (mode === 'glitch') this.drawMatrixWipe();
    else if (mode === 'paparazzi') this.drawWhite(elapsed);
    else if (mode === 'sitcom') {
      if (elapsed < 180) this.drawBars();
      else this.drawSnow();
    }
    else if (mode === 'same' || mode === 'static') this.drawSnow();
    else if (elapsed < 90 && mode !== 'splash' && mode !== 'stadium') this.drawBars();
    else this.drawSnow();
  }

  drawMatrixWipe() {
    const { ctx, nw, nh, font, drops } = this;
    const kata = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ012345789Z';
    ctx.fillStyle = 'rgba(0, 8, 2, 0.28)';
    ctx.fillRect(0, 0, nw, nh);
    ctx.font = `700 ${font}px monospace`;
    drops.forEach((y, i) => {
      const x = i * font;
      ctx.fillStyle = '#d4ffe4';
      ctx.fillText(kata[Math.floor(Math.random() * kata.length)], x, y * font);
      ctx.fillStyle = '#00c853';
      ctx.fillText(kata[Math.floor(Math.random() * kata.length)], x, (y - 1) * font);
      ctx.fillStyle = '#086';
      ctx.fillText(kata[Math.floor(Math.random() * kata.length)], x, (y - 2) * font);
      if (y * font > nh && Math.random() > 0.86) drops[i] = 0;
      else drops[i] = y + 1.15;
    });
  }

  drawSlime(elapsed) {
    const { ctx, nw, nh } = this;
    ctx.fillStyle = '#041';
    ctx.fillRect(0, 0, nw, nh);
    const colors = ['#b6ff3a', '#9ee000', '#7cff3a', '#ff7a00', '#ffe14a'];
    const t = elapsed / 70;
    for (let i = 0; i < 14; i++) {
      const x = ((i * 0.09 + 0.04) % 1) * nw;
      const fall = ((t * 18 + i * 22) % (nh + 80)) - 20;
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.ellipse(x, fall, 16 + (i % 4) * 8, 28 + (i % 3) * 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, fall + 22, 10 + (i % 3) * 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawFilm() {
    const { ctx, nw, nh } = this;
    ctx.fillStyle = '#1a0c04';
    ctx.fillRect(0, 0, nw, nh);
    const img = ctx.createImageData(nw, nh);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = 40 + Math.random() * 50;
      d[i] = v + 30;
      d[i + 1] = v;
      d[i + 2] = v * 0.5;
      d[i + 3] = 200;
    }
    ctx.putImageData(img, 0, 0);
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, 14, nh);
    ctx.fillRect(nw - 14, 0, 14, nh);
    ctx.fillStyle = '#eee';
    const off = ((performance.now() / 40) % 16);
    for (let y = -16 + off; y < nh; y += 16) {
      ctx.fillRect(3, y, 8, 8);
      ctx.fillRect(nw - 11, y, 8, 8);
    }
  }

  drawChecker(elapsed) {
    const { ctx, nw, nh } = this;
    const s = Math.max(4, 18 - elapsed / 40);
    for (let y = 0; y < nh; y += s) {
      for (let x = 0; x < nw; x += s) {
        ctx.fillStyle = ((x / s + y / s) | 0) % 2 ? '#1a3a88' : '#ffe14a';
        ctx.fillRect(x, y, s + 1, s + 1);
      }
    }
  }

  drawTintSnow(a, b) {
    this.drawSnow();
    const { ctx, nw, nh } = this;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = ((performance.now() / 80) | 0) % 2 ? a : b;
    ctx.globalAlpha = 0.35;
    ctx.fillRect(0, 0, nw, nh);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  drawGlitch() {
    this.drawSnow();
    const { ctx, nw, nh } = this;
    ctx.fillStyle = '#00ff88';
    for (let i = 0; i < 8; i++) {
      const y = Math.random() * nh;
      ctx.fillRect(0, y, nw, 2 + Math.random() * 4);
    }
  }

  drawWhite(elapsed) {
    const { ctx, nw, nh } = this;
    const on = elapsed % 140 < 50;
    ctx.fillStyle = on ? '#fff' : '#111';
    ctx.fillRect(0, 0, nw, nh);
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
