import { ITEMS, initDrawer } from './db.js';
import { NostalAudio } from './audio.js';
import { WorldFX, WipeFX } from './worlds.js';
import { describe, youtubeUrl, fallbackBlurb } from './wiki.js';
import { TuneBed } from './tunes.js';
import { portrait, artQuality } from './art.js';

const NICKISH = /nick|toon|animaniacs|rugrats|ren & stimpy|doug|cartoon|fox kids|saturday morning|disney afternoon|warner|simpsons|batman: the animated|gargoyles|reboot|aeon flux/i;
const PHONE = /nokia|motorola|startac|star tac|microtac|blackberry|pager|communicator|cell phone|flip phone|mobile phone/i;
const PALACE = /best picture|oscar|academy award|palme|schindler|unforgiven|silence of the lambs|dances with wolves|forrest gump|braveheart|english patient|shakespeare in love|american beauty|saving private ryan|philadelphia|leaving las vegas|goodfellas|fargo|life is beautiful|the insider|thin red line|boys don.?t cry|awakenings|howards end|dead man walking|secrets & lies|l\.a\. confidential|as good as it gets|good will hunting|the green mile|titanic/i;

function gameWorld(item) {
  const p = platformFor(item);
  if (p === 'ARCADE') return 'arcade';
  if (p === 'N64') return 'n64';
  if (p === 'PS1') return 'ps1';
  if (p === 'PC') return 'pc';
  if (p === 'DREAMCAST') return 'dc';
  if (p === 'GAME BOY' || p === 'GAME GEAR') return 'gb';
  if (p === 'SNES' || p === 'NES') return 'snes';
  if (p === 'GENESIS' || p === 'SATURN' || p === 'SEGA CD' || p === '32X') return 'sonic';
  if (p === 'NEO GEO' || p === 'JAGUAR' || p === 'TG-16') return 'arcade';
  if (/mario|zelda|metroid|donkey kong|kirby|earthbound|chrono|yoshi/i.test(`${item.title} ${item.meta}`)) return 'snes';
  return 'sonic';
}

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
  if (item.cat === 'game') return { kind: 'game', world: gameWorld(item), wipe: 'static' };
  const map = {
    cartoon: { kind: 'cartoon', world: 'nick', wipe: 'slime' },
    toy: { kind: 'ad', world: 'park', wipe: 'splash' },
    music: { kind: 'music', world: 'mtv', wipe: 'neon' },
    food: { kind: 'ad', world: 'park', wipe: 'splash' },
    sport: { kind: 'sport', world: 'court', wipe: 'stadium' },
    person: { kind: 'person', world: 'flash', wipe: 'paparazzi' },
    web: { kind: 'web', world: 'matrix', wipe: 'glitch' },
    event: { kind: 'event', world: 'news', wipe: 'static' },
  };
  return map[item.cat] || map.web;
}

function faceKind(kind) {
  if (kind === 'cartoon') return 'tv';
  return kind;
}

function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const KIDCAT = new Set(['cartoon', 'toy', 'food', 'game', 'music']);
const KIDSHOW = /simpsons|fresh prince|saved by the bell|friends|seinfeld|90210|home improvement|power ranger|pokemon|nintendo|blockbuster|saturday|recess|rugrats|hey arnold|spongebob|magic school|animaniacs|tiny toon|doug|rocko|dexter|catdog|nanny|full house|boy meets world|clarissa|are you afraid|goosebumps|wishbone|bill nye|zoom/i;

function kidish(item) {
  if (KIDCAT.has(item.cat)) return true;
  if (item.cat === 'tv' && KIDSHOW.test(`${item.title} ${item.note}`)) return true;
  return /school bus|recess|lunchbox|saturday morning|living room|sleepover|mall|arcade/i.test(item.note || '');
}

function mixDeck(list, pin) {
  const rest = list.filter((x) => x !== pin);
  const kids = shuffle(rest.filter(kidish));
  const rest2 = shuffle(rest.filter((x) => !kidish(x)));
  const out = [];
  let i = 0;
  let j = 0;
  while (i < kids.length || j < rest2.length) {
    if (i < kids.length) out.push(kids[i++]);
    if (i < kids.length) out.push(kids[i++]);
    if (j < rest2.length) out.push(rest2[j++]);
  }
  return pin ? [pin, ...out] : out;
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

function clip(s, n = 28) {
  const t = String(s || '');
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
}

function busy() {
  return !entered || drawer.hidden === false;
}

const GAME_WORLDS = new Set(['sonic', 'snes', 'n64', 'ps1', 'arcade', 'gb', 'pc', 'dc']);

function setWorld(name) {
  if (name === worldName) return;
  worldName = name;
  document.querySelectorAll('#worlds .world').forEach((w) => {
    w.classList.toggle('is-on', w.dataset.world === name);
  });
  const parade = document.getElementById('parade');
  if (parade) parade.hidden = !GAME_WORLDS.has(name);
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
  park: { ch: '24', net: 'PARK' },
  circular: { ch: '24', net: 'TOYS' },
  grocery: { ch: '18', net: 'FOOD' },
  circuit: { ch: '44', net: 'CITY' },
  court: { ch: '12', net: 'NBC' },
  flash: { ch: '08', net: 'E!' },
  matrix: { ch: '99', net: 'WEB' },
  news: { ch: '02', net: 'CNN' },
  snes: { ch: '32', net: 'NINT' },
  n64: { ch: '64', net: 'NINT' },
  ps1: { ch: '01', net: 'SONY' },
  arcade: { ch: '88', net: 'COIN' },
  gb: { ch: '16', net: 'BRICK' },
  pc: { ch: '86', net: 'DOS' },
  dc: { ch: '09', net: 'SEGA' },
};

function platformFor(item) {
  const m = `${item.meta} ${item.note} ${item.title}`;
  if (/dreamcast/i.test(m)) return 'DREAMCAST';
  if (/n64|nintendo 64/i.test(m)) return 'N64';
  if (/playstation|ps1|\bpsx\b/i.test(m)) return 'PS1';
  if (/saturn/i.test(m)) return 'SATURN';
  if (/snes|super nintendo/i.test(m)) return 'SNES';
  if (/game boy/i.test(m)) return 'GAME BOY';
  if (/game gear/i.test(m)) return 'GAME GEAR';
  if (/genesis|mega drive/i.test(m)) return 'GENESIS';
  if (/sega cd|mega cd/i.test(m)) return 'SEGA CD';
  if (/32x/i.test(m)) return '32X';
  if (/neo geo/i.test(m)) return 'NEO GEO';
  if (/jaguar/i.test(m)) return 'JAGUAR';
  if (/turbo|pc engine/i.test(m)) return 'TG-16';
  if (/arcade/i.test(m)) return 'ARCADE';
  if (/\bpc\b|dos|windows/i.test(m)) return 'PC';
  if (/\bnes\b/i.test(m)) return 'NES';
  return '16-BIT';
}

function vhsLook(item) {
  const b = `${item.title} ${item.note} ${item.meta}`;
  if (/disney|lion king|aladdin|beauty and the beast|little mermaid|toy story|mulan|pocahontas|hercules|tarzan|a bug.?s life|hunchback|peter pan|cinderella|snow white|sleeping beauty|fantasia|bambi|dumbo|101 dalmatians|the jungle book/i.test(b)) {
    return { label: 'disney', banner: "WALT DISNEY'S MASTERPIECE", studio: 'WALT DISNEY HOME VIDEO', spine: 'DISNEY', rating: 'G' };
  }
  if (/scream|nightmare|friday the|blair witch|silence of the lambs|se7en|\bseven\b|exorcist|halloween|candyman|the craft/i.test(b)) {
    return { label: 'horror', banner: 'SPECIAL EDITION', studio: 'HOME VIDEO', spine: 'THRILLER', rating: 'R' };
  }
  if (PALACE.test(b)) {
    return { label: 'prestige', banner: 'AWARD WINNER', studio: 'HOME VIDEO', spine: 'PRESTIGE', rating: 'R' };
  }
  if (/star wars|star trek|matrix|independence day|terminator|back to the future|men in black|total recall|gattaca|fifth element|alien/i.test(b)) {
    return { label: 'scifi', banner: 'FUTURE SHOCK', studio: 'HOME VIDEO', spine: 'SCI-FI', rating: 'PG-13' };
  }
  if (/die hard|lethal weapon|speed|twister|mission.?impossible|face.?off|con air|the rock|bad boys|true lies/i.test(b)) {
    return { label: 'action', banner: 'BLOCKBUSTER HIT', studio: 'HOME VIDEO', spine: 'ACTION', rating: 'PG-13' };
  }
  if (/comedy|dumb and|ace ventura|billy madison|happy gilmore|austin powers|american pie|there.?s something|clueless|wedding singer/i.test(b)) {
    return { label: 'comedy', banner: 'HIT COMEDY', studio: 'HOME VIDEO', spine: 'COMEDY', rating: 'PG-13' };
  }
  return { label: 'hit', banner: 'NOW ON VIDEO', studio: 'HOME VIDEO', spine: 'VIDEO', rating: 'PG' };
}

function dressShot(item, world) {
  const kicker = document.getElementById('shotKicker');
  const tag = document.getElementById('shotTag');
  const card = document.querySelector('.shot-card');
  if (!kicker || !tag) return;
  if (card) card.dataset.store = world;
  kicker.textContent = `NEW FOR ${item.year}`;
  if (world === 'park') tag.textContent = item.cat === 'food' ? 'CONCESSION' : 'THE MIDWAY';
  else if (world === 'circuit') tag.textContent = 'NOW IN STORES';
  else tag.textContent = 'THE TOY AISLE';
}

function dressVhs(item) {
  const look = vhsLook(item);
  const clam = document.getElementById('vhsClam');
  if (clam) clam.dataset.label = look.label;
  const banner = document.getElementById('vhsBanner');
  const studio = document.getElementById('vhsStudio');
  const rating = document.getElementById('vhsRating');
  const spine = document.getElementById('vhsSpine');
  if (banner) banner.textContent = look.banner;
  if (studio) studio.textContent = look.studio;
  if (rating) rating.textContent = look.rating;
  if (spine) spine.textContent = look.spine;
}

function setFaces(url) {
  const active = document.querySelector('.obj.is-on') || document.querySelector('.obj');
  document.querySelectorAll('.obj').forEach((host) => {
    const img = host.querySelector('.face-img');
    if (!img) return;
    img.referrerPolicy = 'no-referrer';
    if (host !== active) {
      img.removeAttribute('src');
      host.classList.remove('has-art');
      return;
    }
    img.onload = () => host.classList.add('has-art');
    img.onerror = () => {
      if (img.dataset.art === url) {
        img.removeAttribute('src');
        host.classList.remove('has-art');
      }
    };
    if (!url) {
      img.removeAttribute('src');
      delete img.dataset.art;
      host.classList.remove('has-art');
      return;
    }
    img.dataset.art = url;
    img.src = url;
    if (img.complete && img.naturalWidth) host.classList.add('has-art');
  });
}

function dialFor(item) {
  return DIAL[themeFor(item).world] || DIAL.matrix;
}

const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

const WIPE_MS = {
  slime: 1080,
  glitch: 980,
  static: 920,
  checker: 880,
  tape: 900,
  leader: 960,
  neon: 920,
  paparazzi: 880,
  sitcom: 820,
  stadium: 920,
  splash: 860,
  same: 360,
};

function playWipe(type, { fromCh, toCh, net, genreChange }) {
  const mode = genreChange ? (type || 'static') : 'same';
  const dur = WIPE_MS[mode] || (genreChange ? 720 : 420);
  wipe.className = '';
  wipe.dataset.wipe = mode;
  wipe.classList.toggle('swap', !!genreChange);
  document.getElementById('wipeFrom').textContent = `CH ${fromCh}`;
  document.getElementById('wipeCh').textContent = `CH ${toCh}`;
  document.getElementById('wipeNet').textContent = net;
  void wipe.offsetWidth;
  wipe.className = genreChange ? 'on swap' : 'on';
  wipe.dataset.wipe = mode;
  wipe.style.setProperty('--wipe-ms', `${dur}ms`);
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

  const face = faceKind(theme.kind);
  hero.dataset.show = face;
  hero.querySelectorAll('.obj').forEach((el) => {
    el.style.removeProperty('display');
    const on = el.dataset.kind === face;
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
  const plat = document.getElementById('gamePlat');
  const box = document.getElementById('gameBox');
  if (plat) plat.textContent = platformFor(item);
  if (box) box.dataset.plat = platformFor(item).replace(/\s+/g, '');
  setWorld(theme.world);
  if (theme.kind === 'ad') dressShot(item, theme.world);
  if (theme.kind === 'movie') dressVhs(item);
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
  metaEl.textContent = item.note || fallbackBlurb(item);
  document.getElementById('pos').textContent = `${index + 1} / ${pool.length}`;
  ytLink.href = youtubeUrl(item);
  wikiLink.href = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(item.title)}`;
  loadCard(item);
  if (entered) tunes.play(item);
}

function loadCard(item) {
  wikiAbort?.abort();
  wikiAbort = new AbortController();
  const token = ++wikiToken;
  const signal = wikiAbort.signal;
  let best = 0;
  const apply = (url) => {
    if (token !== wikiToken || !url) return;
    const q = artQuality(url);
    if (q < best) return;
    best = q;
    setFaces(url);
  };
  setFaces('');
  describe(item, signal).then((info) => {
    if (token !== wikiToken) return;
    if (info.wiki) wikiLink.href = info.wiki;
    apply(info.image);
  }).catch((err) => {
    if (err?.name === 'AbortError') return;
  });
  portrait(item, signal).then(apply).catch((err) => {
    if (err?.name === 'AbortError') return;
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
  const wait = genreChange ? (WIPE_MS[theme.wipe] || 720) : WIPE_MS.same;
  setTimeout(() => { lock = false; }, wait + 40);
}

function startDeck() {
  pool = mixDeck(ITEMS);
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

let booting = false;
function bootIn() {
  if (entered || booting) return;
  booting = true;
  audio.unlock();
  tunes.prime();
  audio.startLogonNow();
  const status = document.getElementById('bootStatus');
  const fill = document.getElementById('bootFill');
  connect.classList.add('booting');
  if (fill) fill.style.width = '100%';
  audio.dialUp((s) => { if (status) status.textContent = s; }).catch(() => {}).finally(() => {
    audio.stopAll();
    entered = true;
    connect.classList.add('gone');
    connect.hidden = true;
    bootFx.setWorld('');
    tunes.play(pool[index]);
  });
}
connect.addEventListener('pointerdown', bootIn);
connect.addEventListener('click', bootIn);

const kickAudio = () => {
  audio.unlock();
  if (!entered || tunes.muted) return;
  tunes.kick();
};
window.addEventListener('pointerdown', kickAudio, { passive: true });
window.addEventListener('touchstart', kickAudio, { passive: true });

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
const FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
function parallax(x, y) {
  if (!FINE) return;
  const nx = x / innerWidth - 0.5;
  const ny = y / innerHeight - 0.5;
  hero.style.transform = `rotateY(${nx * 8}deg) rotateX(${-ny * 5}deg)`;
  worldsEl.style.transform = `translate(${nx * -18}px, ${ny * -12}px) scale(1.05)`;
  const rig = document.querySelector('.obj.is-on .rig');
  if (rig) rig.style.transform = `rotateY(${-12 + nx * 16}deg) rotateX(${6 - ny * 8}deg)`;
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
