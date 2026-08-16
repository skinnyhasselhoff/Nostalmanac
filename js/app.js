import { ITEMS, initDrawer } from './db.js';
import { NostalAudio } from './audio.js';
import { WorldFX, WipeFX } from './worlds.js';
import { describe, youtubeUrl, fallbackBlurb } from './wiki.js';

const NICKISH = /nick|toon|animaniacs|rugrats|ren & stimpy|doug|cartoon|fox kids|saturday morning|disney afternoon|warner|simpsons|batman: the animated|gargoyles|reboot|aeon flux/i;

function themeFor(item) {
  const blob = `${item.title} ${item.meta} ${item.note}`;
  if (item.cat === 'tv' && NICKISH.test(blob)) {
    return { kind: 'tv', world: 'nick', wipe: 'slime' };
  }
  const map = {
    game: { kind: 'game', world: 'sonic', wipe: 'checker' },
    movie: { kind: 'movie', world: 'gotham', wipe: 'static' },
    tv: { kind: 'tv', world: 'bayside', wipe: 'static' },
    cartoon: { kind: 'cartoon', world: 'nick', wipe: 'slime' },
    toy: { kind: 'cartoon', world: 'nick', wipe: 'slime' },
    music: { kind: 'music', world: 'mtv', wipe: 'neon' },
    food: { kind: 'food', world: 'studio', wipe: 'splash' },
    sport: { kind: 'sport', world: 'court', wipe: 'flash' },
    person: { kind: 'person', world: 'flash', wipe: 'flash' },
    tech: { kind: 'tech', world: 'matrix', wipe: 'glitch' },
    web: { kind: 'tech', world: 'matrix', wipe: 'glitch' },
    event: { kind: 'event', world: 'news', wipe: 'static' },
  };
  return map[item.cat] || map.tech;
}

function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function mixDeck(list, pin) {
  const rest = shuffle(list.filter((x) => x !== pin));
  return pin ? [pin, ...rest] : rest;
}

const audio = new NostalAudio();
const fx = new WorldFX(document.getElementById('fxCanvas'));
const bootFx = new WorldFX(document.getElementById('bootFx'));
const wipeFx = new WipeFX(document.getElementById('wipeFx'));
bootFx.setWorld('matrix');

let pool = mixDeck(ITEMS);
let index = 0;
let lock = false;
let worldName = '';
let entered = false;
let wikiAbort = null;
let wikiToken = 0;

const hero = document.getElementById('hero');
const connect = document.getElementById('connect');
const drawer = document.getElementById('drawer');
const muteBtn = document.getElementById('btnMute');
const wipe = document.getElementById('wipe');
const ytLink = document.getElementById('ytLink');
const wikiLink = document.getElementById('wikiLink');
const metaEl = document.getElementById('meta');

function clip(s, n = 36) {
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

function playWipe(type) {
  wipe.className = '';
  void wipe.offsetWidth;
  wipe.className = `on ${type}`;
  if (type === 'static') wipeFx.burst(500);
  setTimeout(() => { wipe.className = ''; }, 620);
}

function show(i, { wipeType } = {}) {
  if (!pool.length) return;
  index = ((i % pool.length) + pool.length) % pool.length;
  const item = pool[index];
  const theme = themeFor(item);

  if (wipeType) playWipe(wipeType);

  hero.dataset.show = theme.kind;
  hero.querySelectorAll('.obj').forEach((el) => {
    el.style.removeProperty('display');
    const on = el.dataset.kind === theme.kind;
    el.classList.toggle('is-on', on);
    if (on) {
      el.classList.remove('is-on');
      void el.offsetWidth;
      el.classList.add('is-on');
    }
  });
  hero.querySelectorAll('.obj-title').forEach((el) => {
    el.textContent = clip(item.title);
  });
  setWorld(theme.world);
  document.getElementById('ch').textContent = `CH ${String(item.year).slice(2)}`;
  document.getElementById('tag').textContent = `${item.year}  ·  ${item.cat}`;
  document.getElementById('title').textContent = item.title;
  metaEl.textContent = fallbackBlurb(item);
  document.getElementById('pos').textContent = `${index + 1} / ${pool.length}`;
  ytLink.href = youtubeUrl(item);
  wikiLink.href = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(item.title)}`;
  loadWiki(item);
}

function loadWiki(item) {
  wikiAbort?.abort();
  wikiAbort = new AbortController();
  const token = ++wikiToken;
  describe(item, wikiAbort.signal).then((info) => {
    if (token !== wikiToken) return;
    metaEl.textContent = info.text;
    if (info.wiki) wikiLink.href = info.wiki;
  }).catch((err) => {
    if (err.name === 'AbortError') return;
  });
}

function step(dir) {
  if (lock || busy()) return;
  lock = true;
  const next = pool[(index + dir + pool.length) % pool.length];
  const theme = themeFor(next);
  show(index + dir, { wipeType: theme.wipe });
  if (theme.wipe === 'static') audio.staticBurst();
  else audio.tick();
  setTimeout(() => { lock = false; }, 520);
}

function startDeck() {
  const sonic = ITEMS.find((it) => it.title === 'Sonic the Hedgehog' && /genesis/i.test(it.meta));
  pool = mixDeck(ITEMS, sonic);
  show(0);
}

document.getElementById('next').addEventListener('click', () => step(1));
document.getElementById('prev').addEventListener('click', () => step(-1));

let wheelT = 0;
window.addEventListener('wheel', (e) => {
  if (busy()) return;
  const now = performance.now();
  if (now - wheelT < 420) return;
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
    pool = list.length ? list : mixDeck(ITEMS);
  },
  onPick(item) {
    pool = mixDeck(ITEMS, item);
    drawer.hidden = true;
    drawer.inert = true;
    show(0);
  },
});

startDeck();

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
  wipeFx.tick();
  if (!connect.hidden) bootFx.tick(t * 0.001);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
