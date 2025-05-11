/* UI */
import { monteCarloDance } from '../algorithms/monteCarloDance.js';
import delay from '../../../core/delay.js';
import { femaleNames, maleNames } from '../../../data/names.js';

/* GRID & CELL */
const CELL = 96;
const MAX_PAIR = 5;
const COL_L_TARGET = 2;
const COL_F_TARGET = 3;
const COL_L_START  = 0;
const COL_F_START  = 5;

/* Sprite  */
const spriteSrc = (type, style) => `/img/dancers/${type}_${style}.png`;

/* utils */
const rand = (m, M) => Math.floor(Math.random() * (M - m + 1)) + m;
const pick = arr => arr.slice().sort(() => Math.random() - 0.5);
const pickNames = (list, n) => pick(list).slice(0, n);

/* dancer factory */
function makeDancers(kind, names) {
  return names.map((name, i) => {
    const style = ['fast', 'slow', 'classic', 'modern', 'cool'][i % 5];
    return {
      name,
      style,
      skill: rand(40, 100),
      get sprite() {
        return spriteSrc(kind, this.style);
      },
    };
  });
}

export function initDanceGame(mountId = 'decision-tool') {
  /*  reactive state  */
  let pairCount = 3;
  let leaders = [];
  let followers = [];
  let matrix = [];
  const history = [];
  let ptr = -1;

  /*  mount skeleton  */
  const root = document.getElementById(mountId);
  root.innerHTML = template();
  const $ = (s) => root.querySelector(s);

  const selCount = $('#pair-count'),
    selIter = $('#iter'),
    setupBox = $('#setup-box'),
    rndBtn = $('#shuffle'),
    runBtn = $('#run'),
    prevBtn = $('#prev'),
    nextBtn = $('#next'),
    grid = $('#grid'),
    info = $('#info'),
    logBox = $('#log'),
    matTbl = $('#mat');

  /* navigation */
  function nav() {
    prevBtn.disabled = ptr <= 0;
    nextBtn.disabled = ptr >= history.length - 1;
  }

  /* setup (leader & follower setup section) */
  function line(d, isLeader, idx) {
    return `
      <div class="flex gap-2 items-center">
        <div class="w-20 text-white">${d.name}</div>
        <select class="border rounded px-1 text-xs"
                data-kind="${isLeader ? 'L' : 'F'}"
                data-idx="${idx}">
          ${['fast', 'slow', 'classic', 'modern', 'cool']
            .map((s) => `<option${d.style === s ? ' selected' : ''}>${s}</option>`)
            .join('')}
        </select>
        <input type="range" min="40" max="100" value="${d.skill}"
               data-kind="${isLeader ? 'L' : 'F'}" data-idx="${idx}" class="w-32">
        <div class="w-8 text-right text-xs text-white">${d.skill}</div>
      </div>`;
  }

  /* builders */
  function buildActors() {
    leaders = makeDancers('leader', pickNames(femaleNames, pairCount));
    followers = makeDancers('follower', pickNames(maleNames, pairCount));
    matrix = buildMatrix();
    history.length = 0;
    ptr = -1;
    nav();
  }

  const buildMatrix = () =>
    Array.from({ length: pairCount }, () =>
      Array.from({ length: pairCount }, () => rand(20, 100))
    );

  /* init */
  buildActors();
  renderSetup();
  drawMatrix();
  spawnGrid();

  /* events */
  selCount.onchange = () => {
    pairCount = Number(selCount.value);
    buildActors();
    renderSetup();
    drawMatrix();
    spawnGrid();
  };

  rndBtn.onclick = () => {
    leaders.forEach((d) => (d.skill = rand(40, 100)));
    followers.forEach((d) => (d.skill = rand(40, 100)));
    matrix = buildMatrix();
    renderSetup();
    drawMatrix();
    spawnGrid();
  };

  runBtn.onclick = () => runMC(Number(selIter.value));
  prevBtn.onclick = async () => await show(ptr - 1);
  nextBtn.onclick = async () => await show(ptr + 1);

  /* setup panel */
  function renderSetup() {
		const leaderHTML = leaders.map((d, i) => line(d, true, i)).join('');
		const followerHTML = followers.map((d, i) => line(d, false, i)).join('');
	
		setupBox.innerHTML = `
			<div class="flex flex-col gap-2">${leaderHTML}</div>
			<div class="flex flex-col gap-2">${followerHTML}</div>
		`;
	
		// Style select
		setupBox.querySelectorAll('select[data-idx]').forEach((sel) => {
			sel.onchange = () => {
				const idx = +sel.dataset.idx;
				const isL = sel.dataset.kind === 'L';
				const dancer = isL ? leaders[idx] : followers[idx];
				dancer.style = sel.value;
				const spriteEl = grid.querySelector('#sprite-' + dancer.name);
				if (spriteEl) spriteEl.style.backgroundImage = `url(${dancer.sprite})`;
			};
		});
	
		// Skill slider
		setupBox.querySelectorAll('input[type="range"]').forEach((r) => {
			const out = r.nextElementSibling;
			r.oninput = () => {
				out.textContent = r.value;
				const idx = +r.dataset.idx;
				const dancer = r.dataset.kind === 'L' ? leaders[idx] : followers[idx];
				dancer.skill = Number(r.value);
			};
		});
	}

  /* grid functions */
  function cell(col, row) {
    return { left: col * CELL, top: row * CELL };
  }

  function spawnGrid() {
    grid.style.background = 'url("img/tileset-grassland-grass.png") repeat'; // tileset for grid background
    grid.innerHTML = '';
    grid.style.width = `${6 * CELL}px`;
    grid.style.height = `${pairCount * CELL}px`;

    [...leaders, ...followers].forEach((d, idx) => {
      const row = idx < pairCount ? idx : idx - pairCount;
      const col = idx < pairCount ? COL_L_START : COL_F_START;
      const pos = cell(col, row);

      const wrap = document.createElement('div');
      wrap.style.position = 'absolute';
      wrap.style.left = `${pos.left}px`;
      wrap.style.top = `${pos.top}px`;
      wrap.style.width = `${CELL}px`;
      wrap.style.transition = 'left 1.2s, top 1.2s';

      const label = document.createElement('div');
      label.textContent = d.name;
      label.className = 'text-center text-xs font-semibold';

      const sprite = document.createElement('div');
      sprite.id = 'sprite-' + d.name;
      sprite.className = 'dance-sprite w-16 h-16 mx-auto';
      sprite.style.backgroundImage = `url(${d.sprite})`;

      wrap.appendChild(label);
      wrap.appendChild(sprite);
      grid.appendChild(wrap);
    });
  }

  /* matrix */
  function drawMatrix() {
    matTbl.innerHTML =
      '<caption class="caption-top text-xs mb-1">Raw compatibility score (0‑100)</caption>' +
      '<tr><th></th>' +
      followers.map((f) => `<th>${f.name}</th>`).join('') +
      '</tr>' +
      matrix
        .map(
          (row, i) =>
            `<tr><th>${leaders[i].name}</th>` +
            row.map((s) => `<td>${s}</td>`).join('') +
            '</tr>'
        )
        .join('');
  }

  /* narrative */
  function narrative(p) {
    const same = p.l.style === p.f.style;
    const styleTxt = same
      ? `Both love <strong>${p.l.style}</strong> style.`
      : `${p.l.name} likes <strong>${p.l.style}</strong>, ${p.f.name} prefers <strong>${p.f.style}</strong>.`;
    const gap = Math.abs(p.l.skill - p.f.skill);
    const skillTxt =
      gap <= 5 ? 'Skills match perfectly.'
        : gap <= 15 ? 'Skills are close.'
        : 'Big skill gap.';
    return `• <strong>${p.l.name}</strong> & <strong>${p.f.name}</strong> — <em>${p.score}&nbsp;pts</em><br>${styleTxt} ${skillTxt}`;
  }

  /* animate snapshot */
  async function animateSnap(s) {
    s.pairs.forEach((p, i) => {
      const lWrap = grid.querySelector('#sprite-' + p.l.name).parentElement;
      const fWrap = grid.querySelector('#sprite-' + p.f.name).parentElement;
      const posL = cell(COL_L_TARGET, i),
        posF = cell(COL_F_TARGET, i);
      lWrap.style.left = `${posL.left}px`;
      lWrap.style.top = `${posL.top}px`;
      fWrap.style.left = `${posF.left}px`;
      fWrap.style.top = `${posF.top}px`;
    });
    info.innerHTML = `Iter <strong>${s.iter}</strong> — Best <span class="font-bold text-indigo-600">${s.total}</span> pts`;
    log(`<hr><em>New record!</em><br>${s.pairs.map(narrative).join('<br>')}`);
    await delay(1250);
  }

  /* run monte carlo */
  async function runMC(iters) {
    history.length = 0;
    ptr = -1;
    nav();
    spawnGrid();
    log('🎲 Running…');
    await monteCarloDance(leaders, followers, iters, async (snap) => {
      history.push(snap);
      ptr = history.length - 1;
      nav();
      await animateSnap(snap);
    });
    log('✅ Finished.');
  }

  async function show(i) {
    if (i < 0 || i >= history.length) return;
    ptr = i;
    nav();
    await animateSnap(history[i]);
  }

  function log(t) {
    logBox.insertAdjacentHTML('beforeend', `<div>${t}</div>`);
    logBox.scrollTop = logBox.scrollHeight;
  }

  /* template */
  function template() {
    return `
      <div class="min-h-[80vh] flex flex-col items-center py-8">
    <div class="bg-slate-200/70 backdrop-blur-md rounded-2xl p-6 shadow-xl w-full max-w-4xl flex flex-col gap-6">
      <h2 class="text-center text-3xl font-semibold text-indigo-600 dark:text-indigo-400">Dance Partner Matcher</h2>

      <div class="flex flex-wrap gap-3 justify-center items-center">
        <label class="flex items-center gap-1"> Couples
          <select id="pair-count" class="border rounded px-1 py-0.5">
            ${[2,3,4,5].map(n=>`<option${n===pairCount?' selected':''}>${n}</option>`).join('')}
          </select>
        </label>
        <label class="flex items-center gap-1"> Iter
          <select id="iter" class="border rounded px-1 py-0.5">
            <option>500</option><option selected>5000</option><option>20000</option>
          </select>
        </label>
        <button id="shuffle" class="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded">Randomise All</button>
        <button id="run"  class="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded">Run</button>
        <button id="prev" class="bg-gray-300 text-gray-700 px-2 rounded" disabled>◀</button>
        <button id="next" class="bg-gray-300 text-gray-700 px-2 rounded" disabled>▶</button>
      </div>

      <div id="setup-box" class="grid sm:grid-cols-2 gap-2 bg-white/60 dark:bg-slate-700/60 p-4 rounded-lg shadow-inner text-xs"></div>
      <div id="grid" class="relative mx-auto"></div>
      <div id="info" class="font-medium text-center"></div>

      <!-- SIDE‑BY‑SIDE area -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-start">
        <table id="mat" class="text-sm border-separate border-spacing-1"></table>
        <div class="max-w-sm bg-slate-400/70 p-4 rounded shadow text-sm">
          <h3 class="font-semibold mb-1">How are pairs scored?</h3>
          <ul class="list-disc list-inside">
            <li><strong>Style bonus</strong> — identical style up to 30 pts</li>
            <li><strong>Skill gap</strong> — closer skills add up to 30 pts</li>
            <li><strong>Chemistry</strong> — random vibe bonus (0‑20 pts)</li>
          </ul>
          Monte‑Carlo reshuffles thousands of times and pauses whenever it finds a better match.
        </div>
      </div>

      <div id="log" class="scroll-touch w-full max-w-3xl h-48 mx-auto justify-center overflow-y-auto bg-gray-50 dark:bg-slate-400/40 p-3 text-sm font-mono rounded shadow-inner"></div>
    </div>
  </div>`;
  }
}
