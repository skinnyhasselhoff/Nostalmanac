import { ITEMS, initDrawer } from './db.js';
import { NostalAudio } from './audio.js';
import { WorldFX, WipeFX } from './worlds.js';
import { describe, youtubeUrl, fallbackBlurb } from './wiki.js';
import { TuneBed } from './tunes.js';

const NICKISH = /nick|toon|animaniacs|rugrats|ren & stimpy|doug|cartoon|fox kids|saturday morning|disney afternoon|warner|simpsons|batman: the animated|gargoyles|reboot|aeon flux/i;
const PHONE = /nokia|motorola|startac|star tac|microtac|blackberry|pager|communicator|cell phone|flip phone|mobile phone/i;
const PALACE = /best picture|oscar|academy award|palme|schindler|unforgiven|silence of the lambs|dances with wolves|forrest gump|braveheart|english patient|shakespeare in love|american beauty|saving private ryan|philadelphia|leaving las vegas|goodfellas|fargo|life is beautiful|the insider|thin red line|boys don.?t cry|awakenings|howards end|dead man walking|secrets & lies|l\.a\. confidential|as good as it gets|good will hunting|the green mile|titanic/i;

function themeFor(item) {
  const blob = `${item.title} ${item.meta} ${item.note}`;
  if (item.cat === 'tv') {
    if (NICKISH.test(blob)) return { kind: 'tv', world: 'nick', wipe: 'slime' };
    if (/^friends$/i.test(item.title)) return { kind: 'tv', world: 'friends', wipe: 'sitcom' };
    if (/seinfeld/i.test(item.title)) return { kind: 'tv', world: 'monks', wipe: 'sitcom' };
    if (/90210|beverly hills/i.test(item.title)) return { kind: 'tv', world: 'zip', wipe: 'sitcom' };
    if (/fresh prince|bel-air|bel air/i.test(item.title)) return { kind: 'tv', world: 'belair', wipe: 'sitcom' };
    return { kind: 'tv', world: 'bayside', wipe: 'sitcom' };
  }
  if (item.cat === 'movie') {
    if (PALACE.test(blob)) return { kind: 'movie', world: 'gotham', wipe: 'leader' };
    return { kind: 'movie', world: 'video', wipe: 'tape' };
  }
  if (item.cat === 'tech') {
    if (PHONE.test(blob)) return { kind: 'tech', world: 'bayside', wipe: 'sitcom' };
    return { kind: 'ad', world: 'circuit', wipe: 'splash' };
  }
  const map = {
    game: { kind: 'game', world: 'sonic', wipe: 'checker' },
    cartoon: { kind: 'cartoon', world: 'nick', wipe: 'slime' },
    toy: { kind: 'ad', world: 'circular', wipe: 'splash' },
    music: { kind: 'music', world: 'mtv', wipe: 'neon' },
    food: { kind: 'ad', world: 'grocery', wipe: 'splash' },
    sport: { kind: 'sport', world: 'court', wipe: 'stadium' },
    person: { kind: 'person', world: 'flash', wipe: 'paparazzi' },
    web: { kind: 'web', world: 'matrix', wipe: 'glitch' },
    event: { kind: 'event', world: 'news', wipe: 'static' },
  };
  return map[item.cat] || map.web;
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
const tunes = new TuneBed();
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

const DIAL = {
  sonic: { ch: '33', net: 'SEGA' },
  nick: { ch: '03', net: 'NICK' },
  gotham: { ch: '07', net: 'HBO' },
  video: { ch: '36', net: 'VIDS' },
  bayside: { ch: '04', net: 'NBC' },
  friends: { ch: '04', net: 'NBC' },
  monks: { ch: '04', net: 'NBC' },
  zip: { ch: '11', net: 'FOX' },
  belair: { ch: '04', net: 'NBC' },
  mtv: { ch: '10', net: 'MTV' },
  circular: { ch: '24', net: 'TOYS' },
  grocery: { ch: '18', net: 'FOOD' },
  circuit: { ch: '44', net: 'CITY' },
  court: { ch: '12', net: 'ESPN' },
  flash: { ch: '08', net: 'E!' },
  matrix: { ch: '99', net: 'WEB' },
  news: { ch: '02', net: 'CNN' },
};

function adPrice(title) {
  let h = 0;
  for (const c of String(title)) h = (h * 33 + c.charCodeAt(0)) | 0;
  const n = Math.abs(h);
  const dollars = 4 + (n % 46);
  const cents = ['99', '97', '95', '49'][n % 4];
  return `$${dollars}.${cents}`;
}

function dressAd(item, world) {
  const store = document.getElementById('adStore');
  const price = document.getElementById('adPrice');
  const fine = document.getElementById('adFine');
  const clip = document.querySelector('.ad-clip');
  if (!store || !clip) return;
  clip.dataset.store = world;
  if (world === 'circular') {
    store.innerHTML = 'TOYS <i>R</i> US';
    fine.textContent = 'GEOFFREY SAYS HURRY · AISLE 9';
  } else if (world === 'grocery') {
    store.textContent = 'WEEKLY SPECIALS';
    fine.textContent = 'LIMIT 2 · WITH COUPON · SEE STORE';
  } else {
    store.textContent = 'CIRCUIT CITY';
    fine.textContent = 'PRICE MATCH · WHILE SUPPLIES LAST';
  }
  price.textContent = adPrice(item.title);
}

function dialFor(item) {
  return DIAL[themeFor(item).world] || DIAL.matrix;
}

const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

function playWipe(type, { fromCh, toCh, net, genreChange }) {
  const mode = genreChange ? (type || 'static') : 'same';
  const dur = genreChange ? 720 : 240;
  wipe.className = '';
  wipe.dataset.wipe = mode;
  wipe.classList.toggle('swap', !!genreChange);
  document.getElementById('wipeFrom').textContent = `CH ${fromCh}`;
  document.getElementById('wipeCh').textContent = `CH ${toCh}`;
  document.getElementById('wipeNet').textContent = net;
  void wipe.offsetWidth;
  wipe.className = genreChange ? 'on swap' : 'on';
  wipe.dataset.wipe = mode;
  wipeFx.burst(dur, mode);
  setTimeout(() => { wipe.className = ''; }, dur + 40);
}

function show(i, { wipeType, fromCh, genreChange } = {}) {
  if (!pool.length) return;
  index = ((i % pool.length) + pool.length) % pool.length;
  const item = pool[index];
  const theme = themeFor(item);
  const dial = dialFor(item);

  if (wipeType) {
    playWipe(wipeType, {
      fromCh: fromCh || dial.ch,
      toCh: dial.ch,
      net: dial.net,
      genreChange: !!genreChange,
    });
  }

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
  const dateEl = document.querySelector('.zine-date');
  if (dateEl) dateEl.textContent = `${MONTHS[item.year % 12]} ${item.year}`;
  setWorld(theme.world);
  if (theme.kind === 'ad') dressAd(item, theme.world);
  const ch = document.getElementById('ch');
  const nextCh = `CH ${dial.ch}`;
  if (ch.textContent !== nextCh) {
    ch.classList.remove('flip');
    void ch.offsetWidth;
    ch.textContent = nextCh;
    ch.classList.add('flip');
  }
  document.getElementById('tag').textContent = `${item.year}  ·  ${item.cat}`;
  document.getElementById('title').textContent = item.title;
  metaEl.textContent = fallbackBlurb(item);
  document.getElementById('pos').textContent = `${index + 1} / ${pool.length}`;
  ytLink.href = youtubeUrl(item);
  wikiLink.href = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(item.title)}`;
  loadWiki(item);
  if (entered) tunes.play(item);
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
  const cur = pool[index];
  const next = pool[(index + dir + pool.length) % pool.length];
  const from = themeFor(cur);
  const theme = themeFor(next);
  const genreChange = from.world !== theme.world;
  show(index + dir, {
    wipeType: theme.wipe,
    fromCh: dialFor(cur).ch,
    genreChange,
  });
  audio.wipe(theme.wipe, genreChange);
  setTimeout(() => { lock = false; }, genreChange ? 760 : 280);
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
  tunes.setMuted(next);
  muteBtn.textContent = next ? 'Muted' : 'Sound';
  if (!next && entered) tunes.play(pool[index]);
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
  tunes.play(pool[index]);
}, { once: true });

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    audio.silence();
    tunes.pause();
  } else if (entered && !tunes.muted) {
    tunes.resume();
  }
});
window.addEventListener('pagehide', () => {
  audio.silence();
  tunes.pause();
});

const nowplay = document.getElementById('nowplay');
tunes.onLabel = (label) => {
  if (label) {
    nowplay.hidden = false;
    nowplay.textContent = `♪ ${label}`;
  } else {
    nowplay.hidden = true;
    nowplay.textContent = '';
  }
};

const worldsEl = document.getElementById('worlds');
function parallax(x, y) {
  const nx = x / innerWidth - 0.5;
  const ny = y / innerHeight - 0.5;
  hero.style.transform = `rotateY(${nx * 11}deg) rotateX(${-ny * 6}deg)`;
  worldsEl.style.transform = `translate(${nx * -16}px, ${ny * -10}px) scale(1.04)`;
}
window.addEventListener('pointermove', (e) => {
  if (busy()) return;
  parallax(e.clientX, e.clientY);
}, { passive: true });

function tick(t) {
  fx.tick(t * 0.001);
  wipeFx.tick();
  if (!connect.hidden) bootFx.tick(t * 0.001);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
