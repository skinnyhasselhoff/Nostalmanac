import { ITEMS } from './catalog.js';
import { portrait } from './art.js';
import { youtubeUrl } from './wiki.js';
import { Boombox } from './sound.js';

const $ = (id) => document.getElementById(id);
const VIBE = { cartoon: 'toon', movie: 'movie', music: 'jam', fad: 'fad' };
const LABEL = { cartoon: 'CARTOON', movie: 'MOVIE', music: 'SONG', fad: 'FAD' };

const boom = new Boombox();
let deck = ITEMS.slice();
let i = 0;
let yearFilter = '';
let catFilter = '';
let artTok = 0;
let wipeLock = false;
let coolUntil = 0;

function wikiSearch(item) {
  const q = item.query || item.title;
  return `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(q)}`;
}

function paintWorld(cat) {
  const vibe = VIBE[cat] || 'toon';
  document.body.dataset.vibe = vibe;
  document.querySelectorAll('.world').forEach((el) => {
    el.classList.toggle('is-on', el.dataset.vibe === vibe);
  });
}

function staticFrame(ctx, w, h) {
  const img = ctx.createImageData(w, h);
  const d = img.data;
  for (let p = 0; p < d.length; p += 4) {
    const v = Math.random() * 255;
    d[p] = d[p + 1] = d[p + 2] = v;
    d[p + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

function wipe(kind) {
  const el = $('wipe');
  const canvas = $('wipeFx');
  const word = $('wipeWord');
  el.className = '';
  el.classList.add('go', kind);
  word.textContent = kind === 'scratch' ? 'SKRRRT' : 'SHHH';
  const ctx = canvas.getContext('2d', { alpha: false });
  const w = canvas.width = Math.min(160, innerWidth / 4);
  const h = canvas.height = Math.min(90, innerHeight / 4);
  let n = 0;
  const tick = () => {
    staticFrame(ctx, w, h);
    if (++n < 10) requestAnimationFrame(tick);
  };
  tick();
  if (kind === 'scratch') boom.scratch();
  else boom.staticBurst();
  clearTimeout(wipe.t);
  wipe.t = setTimeout(() => { el.className = ''; }, 430);
}

function render(item) {
  $('tag').textContent = `${item.year} · ${LABEL[item.cat] || item.cat.toUpperCase()}`;
  $('title').textContent = item.title;
  $('note').textContent = item.note;
  $('stickerTag').textContent = LABEL[item.cat] || item.cat.toUpperCase();
  $('pos').textContent = `${i + 1} / ${deck.length}`;
  $('ytLink').href = youtubeUrl(item);
  $('wikiLink').href = wikiSearch(item);
  paintWorld(item.cat);

  const tok = ++artTok;
  const img = $('art');
  img.removeAttribute('src');
  img.alt = item.title;
  portrait(item).then((url) => {
    if (tok !== artTok) return;
    if (url) img.src = url;
  }).catch(() => {});
}

function go(next, fx) {
  if (!deck.length) return;
  i = (next + deck.length) % deck.length;
  const item = deck[i];
  const kind = fx || (item.cat === 'music' ? 'scratch' : 'static');
  wipe(kind);
  render(item);
  boom.play(item);
}

function step(dir) {
  if (wipeLock || Date.now() < coolUntil) return;
  wipeLock = true;
  go(i + dir);
  setTimeout(() => { wipeLock = false; }, 220);
}

function applyFilters() {
  const q = ($('search').value || '').trim().toLowerCase();
  deck = ITEMS.filter((it) => {
    if (yearFilter && String(it.year) !== yearFilter) return false;
    if (catFilter && it.cat !== catFilter) return false;
    if (!q) return true;
    return `${it.title} ${it.meta} ${it.note}`.toLowerCase().includes(q);
  });
  $('dbCount').textContent = `${deck.length} hits`;
  $('results').innerHTML = deck.slice(0, 80).map((it, n) => (
    `<li data-i="${n}"><b>${it.title}</b><span>${it.year} · ${it.cat}</span></li>`
  )).join('');
  if (!deck.length) {
    $('title').textContent = 'No hits';
    $('note').textContent = 'Try another year or vibe.';
    return;
  }
  i = Math.min(i, deck.length - 1);
}

function openDrawer() {
  $('drawer').hidden = false;
  $('drawer').removeAttribute('inert');
  applyFilters();
  $('search').focus();
}

function closeDrawer() {
  $('drawer').hidden = true;
  $('drawer').setAttribute('inert', '');
}

function boot() {
  const years = $('years');
  years.innerHTML = `<button type="button" data-year="" class="on">ALL</button>`
    + Array.from({ length: 10 }, (_, n) => 1990 + n).map((y) => `<button type="button" data-year="${y}">${y}</button>`).join('');
  $('cats').innerHTML = [['', 'ALL'], ['cartoon', 'CARTOONS'], ['movie', 'MOVIES'], ['music', 'SONGS'], ['fad', 'FADS']]
    .map(([id, label], n) => `<button type="button" data-cat="${id}" class="${n === 0 ? 'on' : ''}">${label}</button>`).join('');

  years.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    yearFilter = b.dataset.year;
    years.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
    applyFilters();
  });
  $('cats').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    catFilter = b.dataset.cat;
    $('cats').querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
    applyFilters();
  });
  $('search').addEventListener('input', applyFilters);
  $('results').addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    const picked = deck[Number(li.dataset.i)];
    $('search').value = '';
    applyFilters();
    const idx = picked ? deck.findIndex((it) => it.title === picked.title && it.cat === picked.cat) : 0;
    i = idx < 0 ? 0 : idx;
    closeDrawer();
    go(i, picked?.cat === 'music' ? 'scratch' : 'static');
  });

  $('btnSearch').addEventListener('click', openDrawer);
  $('btnClose').addEventListener('click', closeDrawer);
  $('drawer').addEventListener('click', (e) => { if (e.target.id === 'drawer') closeDrawer(); });

  $('btnMute').addEventListener('click', () => {
    const next = !boom.muted;
    boom.setMuted(next);
    $('btnMute').textContent = next ? 'SOUND OFF' : 'SOUND ON';
    $('btnMute').classList.toggle('is-off', next);
  });

  boom.onLabel = (t) => { $('nowplay').textContent = t; };

  $('prev').addEventListener('click', () => step(-1));
  $('next').addEventListener('click', () => step(1));

  let sx = 0;
  let sy = 0;
  document.addEventListener('touchstart', (e) => {
    sx = e.changedTouches[0].clientX;
    sy = e.changedTouches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) < 40 && Math.abs(dy) < 40) return;
    if (Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
    else step(dy < 0 ? 1 : -1);
  }, { passive: true });

  document.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) < 12) return;
    step(e.deltaY > 0 ? 1 : -1);
  }, { passive: true });

  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    coolUntil = Date.now() + 900;
    boom.unlock();
    $('boot').classList.add('out');
    go(0, 'scratch');
  };
  ['pointerdown', 'touchstart', 'click'].forEach((ev) => {
    $('boot').addEventListener(ev, start, { passive: true });
  });
}

boot();
