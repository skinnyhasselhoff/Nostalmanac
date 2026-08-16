import { MOVIES } from './data/movies.js';
import { TV } from './data/tv.js';
import { GAMES } from './data/games.js';
import { MUSIC } from './data/music.js';
import { PEOPLE } from './data/people.js';
import { MISC } from './data/misc.js';

const CATS = [
  ['all', 'All'],
  ['movie', 'Movies'],
  ['tv', 'TV'],
  ['cartoon', 'Cartoons'],
  ['game', 'Games'],
  ['music', 'Music'],
  ['person', 'People'],
  ['tech', 'Tech'],
  ['toy', 'Toys'],
  ['sport', 'Sports'],
  ['food', 'Food'],
  ['web', 'Web'],
  ['event', 'Events'],
];

function parse(src) {
  const out = [];
  for (const line of src.split('\n')) {
    const p = line.split('|');
    if (p.length < 4) continue;
    const year = +p[0];
    if (year < 1990 || year > 1999) continue;
    out.push({
      year,
      cat: p[1].trim(),
      title: p[2].trim(),
      meta: (p[3] || '').trim(),
      note: (p[4] || '').trim(),
    });
  }
  return out;
}

function dedupe(items) {
  const seen = new Set();
  const next = [];
  for (const it of items) {
    const k = `${it.year}|${it.cat}|${it.title.toLowerCase()}`;
    if (seen.has(k)) continue;
    seen.add(k);
    next.push(it);
  }
  return next;
}

export const ITEMS = dedupe([
  ...parse(MOVIES),
  ...parse(TV),
  ...parse(GAMES),
  ...parse(MUSIC),
  ...parse(PEOPLE),
  ...parse(MISC),
]).sort((a, b) => a.year - b.year || a.title.localeCompare(b.title));

export function filterItems(year = 'all', cat = 'all', q = '') {
  const query = q.trim().toLowerCase();
  return ITEMS.filter((it) => {
    if (year !== 'all' && it.year !== +year) return false;
    if (cat !== 'all' && it.cat !== cat) return false;
    if (!query) return true;
    return `${it.title} ${it.meta} ${it.note} ${it.cat}`.toLowerCase().includes(query);
  });
}

export function initDrawer({ onFilter, onPick }) {
  const yearsEl = document.getElementById('years');
  const catsEl = document.getElementById('cats');
  const results = document.getElementById('results');
  const search = document.getElementById('search');
  const countEl = document.getElementById('dbCount');

  let year = 'all';
  let cat = 'all';
  let q = '';
  let shown = 80;
  let lastList = ITEMS;

  yearsEl.innerHTML = ['all', 1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999]
    .map((y) => `<button type="button" data-year="${y}" class="${y === 'all' ? 'active' : ''}">${y === 'all' ? 'ALL' : String(y).slice(2)}</button>`)
    .join('');

  catsEl.innerHTML = CATS
    .map(([id, label], i) => `<button type="button" data-cat="${id}" class="${i === 0 ? 'active' : ''}">${label}</button>`)
    .join('');

  function emit() {
    lastList = filterItems(year, cat, q);
    shown = 80;
    countEl.textContent = `${lastList.length.toLocaleString()} in this surf`;
    paint();
    onFilter(lastList);
  }

  function paint() {
    const slice = lastList.slice(0, shown);
    results.innerHTML = slice.map((it, i) => `
      <li class="hit" data-i="${i}">
        <div class="hit-year">${it.year} · ${esc(it.cat)}</div>
        <div class="hit-title">${esc(it.title)}</div>
        <div class="hit-note">${esc([it.meta, it.note].filter(Boolean).join(' — '))}</div>
      </li>
    `).join('') + (lastList.length > shown
      ? `<li class="hit more" data-more="1"><div class="hit-title">Show more</div></li>`
      : '');
  }

  yearsEl.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    year = b.dataset.year;
    yearsEl.querySelectorAll('button').forEach((x) => x.classList.toggle('active', x === b));
    emit();
  });
  catsEl.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    cat = b.dataset.cat;
    catsEl.querySelectorAll('button').forEach((x) => x.classList.toggle('active', x === b));
    emit();
  });
  search.addEventListener('input', () => { q = search.value; emit(); });
  results.addEventListener('click', (e) => {
    const row = e.target.closest('.hit');
    if (!row) return;
    if (row.dataset.more) { shown += 80; paint(); return; }
    const item = lastList[+row.dataset.i];
    if (item) onPick(item);
  });

  emit();
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
