import { ITEMS, initDrawer } from './db.js';
import { NostalAudio } from './audio.js';
import { WorldFX } from './worlds.js';

const KIND = {
  game: 'game',
  movie: 'movie',
  person: 'movie',
  tv: 'movie',
  cartoon: 'cartoon',
  toy: 'cartoon',
  music: 'music',
  food: 'food',
  sport: 'food',
  tech: 'tech',
  web: 'tech',
  event: 'tech',
};

const WORLD = {
  game: 'sonic',
  cartoon: 'nick',
  toy: 'nick',
  tv: 'nick',
  movie: 'gotham',
  person: 'gotham',
  music: 'bayside',
  tech: 'matrix',
  web: 'matrix',
  event: 'matrix',
  food: 'studio',
  sport: 'studio',
};

const audio = new NostalAudio();
const fx = new WorldFX(document.getElementById('fxCanvas'));
const bootFx = new WorldFX(document.getElementById('bootFx'));
bootFx.setWorld('matrix');

let pool = ITEMS;
let index = 0;
let lock = false;
let worldName = '';
let entered = false;

const hero = document.getElementById('hero');
const connect = document.getElementById('connect');
const drawer = document.getElementById('drawer');
const muteBtn = document.getElementById('btnMute');

function clip(s, n = 32) {
  const t = String(s || '');
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
}

function busy() {
  return !entered || drawer.hidden === false;
}

function setWorld(name) {
  if (name === worldName) return;
  worldName = name;
  document.querySelectorAll('#worlds .world').forEach((w) => {
    w.classList.toggle('is-on', w.dataset.world === name);
  });
  fx.setWorld(name);
}

function show(i) {
  if (!pool.length) return;
  index = Math.max(0, Math.min(pool.length - 1, i));
  const item = pool[index];
  const kind = KIND[item.cat] || 'tech';
  hero.dataset.show = kind;
  hero.querySelectorAll('.obj').forEach((el) => {
    el.style.removeProperty('display');
    el.classList.toggle('is-on', el.dataset.kind === kind);
  });
  hero.querySelectorAll('.obj-title').forEach((el) => {
    el.textContent = clip(item.title);
  });
  setWorld(WORLD[item.cat] || 'studio');
  document.getElementById('ch').textContent = `CH ${String(item.year).slice(2)}`;
  document.getElementById('tag').textContent = `${item.year}  ·  ${item.cat}`;
  document.getElementById('title').textContent = item.title;
  document.getElementById('meta').textContent = [item.meta, item.note].filter(Boolean).join(' — ');
  document.getElementById('pos').textContent = `${index + 1} / ${pool.length}`;
}

function step(dir) {
  if (lock || busy()) return;
  lock = true;
  show(index + dir);
  audio.tick();
  setTimeout(() => { lock = false; }, 180);
}

function startAtSonic() {
  const i = pool.findIndex((it) => it.title === 'Sonic the Hedgehog' && /genesis/i.test(it.meta));
  show(i >= 0 ? i : 0);
}

document.getElementById('next').addEventListener('click', () => step(1));
document.getElementById('prev').addEventListener('click', () => step(-1));

let wheelT = 0;
window.addEventListener('wheel', (e) => {
  if (busy()) return;
  const now = performance.now();
  if (now - wheelT < 280) return;
  if (Math.abs(e.deltaY) < 10 && Math.abs(e.deltaX) < 10) return;
  wheelT = now;
  const dy = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
  step(dy > 0 ? 1 : -1);
}, { passive: true });

let touchX = null;
let touchY = null;
window.addEventListener('touchstart', (e) => {
  if (busy()) return;
  touchX = e.touches[0].clientX;
  touchY = e.touches[0].clientY;
}, { passive: true });
window.addEventListener('touchend', (e) => {
  if (touchY == null || busy()) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - touchX;
  const dy = t.clientY - touchY;
  touchX = touchY = null;
  if (Math.abs(dy) < 36 && Math.abs(dx) < 36) return;
  if (Math.abs(dy) >= Math.abs(dx)) {
    if (dy < -36) step(1);
    if (dy > 36) step(-1);
  } else {
    if (dx < -36) step(1);
    if (dx > 36) step(-1);
  }
}, { passive: true });

document.getElementById('btnSearch').addEventListener('click', (e) => {
  e.stopPropagation();
  drawer.hidden = false;
  drawer.inert = false;
  document.getElementById('search').focus();
});
document.getElementById('btnClose').addEventListener('click', () => {
  drawer.hidden = true;
  drawer.inert = true;
});
drawer.addEventListener('click', (e) => {
  if (e.target === drawer) {
    drawer.hidden = true;
    drawer.inert = true;
  }
});

muteBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const next = !audio.muted;
  audio.setMuted(next);
  muteBtn.textContent = next ? 'Muted' : 'Sound';
});

initDrawer({
  onFilter(list) {
    pool = list.length ? list : ITEMS;
  },
  onPick(item) {
    pool = ITEMS;
    const i = pool.findIndex((x) => x === item);
    drawer.hidden = true;
    drawer.inert = true;
    show(i >= 0 ? i : 0);
  },
});

startAtSonic();

connect.addEventListener('click', async () => {
  try { await audio.dialUp(); } catch {}
  audio.silence();
  entered = true;
  connect.classList.add('gone');
  connect.hidden = true;
  bootFx.setWorld('');
}, { once: true });

document.addEventListener('visibilitychange', () => {
  if (document.hidden) audio.silence();
});
window.addEventListener('pagehide', () => audio.silence());

function tick(t) {
  fx.tick(t * 0.001);
  if (!connect.hidden) bootFx.tick(t * 0.001);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
