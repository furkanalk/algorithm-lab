import {
  monteCarloDance,
  greedyDance,
  simulatedAnnealingDance,
  geneticDance,
  tabuSearchDance,
} from '../algorithms/index.js';

import delay from '../../../core/delay.js';
import { femaleNames, maleNames } from '../../../data/names.js';

/* ---------- GRID & CELL ---------- */
const DEFAULT_CELL = 96;
const MAX_PAIR     = 5;
const MOBILE_BREAK = 640;           // px - mobile width
const COL_L_TARGET = 2;             // final left column
const COL_F_TARGET = 3;             // final right column
const COL_L_START  = 0;             // spawn left column
const COL_F_START  = 5;             // spawn right column

/* ---------- Sprite helper ---------- */
const spriteSrc = (type, style) => `img/dancers/${type}_${style}.png`;

/* ---------- utils ---------- */
const rand      = (m, M)   => Math.floor(Math.random() * (M - m + 1)) + m;
const shuffle   = arr      => arr.slice().sort(() => Math.random() - .5);
const pickNames = (list, n) => shuffle(list).slice(0, n);

/* ---------- dancer factory ---------- */
const STYLES = ['fast','slow','classic','modern','cool'];
function makeDancers(kind, names) {
  return names.map((name, i) => ({
    name,
    style: STYLES[i % STYLES.length],
    skill: rand(40, 100),
    get sprite() { return spriteSrc(kind, this.style); }
  }));
}

/* ---------- helper ---------- */
function cell(col, row) {
  return { left: col * DEFAULT_CELL, top: row * DEFAULT_CELL };
}

export function initDanceGame(mountId = 'decision-tool') {
  /* ---------- responsive limits ---------- */
  const maxPairs = window.innerWidth <= MOBILE_BREAK ? 4 : MAX_PAIR;

  /* ---------- reactive state ---------- */
  let pairCount = Math.min(3, maxPairs);
  let leaders = [], followers = [], matrix = [];
  const history = []; let ptr = -1;
  let skipMode = false;

  /* ---------- mount ---------- */
  const root = document.getElementById(mountId);
  root.innerHTML = template();
  const $ = s => root.querySelector(s);

  /* ---------- refs ---------- */
  const selCount   = $('#pair-count'),
        selIter    = $('#iter'),
        selAlgo    = $('#algorithm'),
        setupBox   = $('#setup-box'),
        shuffleBtn = $('#shuffle'),
        runBtn     = $('#run'),
        skipBtn    = $('#skip'),
        prevBtn    = $('#prev'),
        nextBtn    = $('#next'),
        grid       = $('#grid'),
        infoBox    = $('#info'),
        logBox     = $('#log'),
        matTbl     = $('#mat');

  const nav = () => {
    prevBtn.disabled = ptr <= 0;
    nextBtn.disabled = ptr >= history.length - 1;
  };

  /* ---------- builders ---------- */
  const buildMatrix = () =>
    Array.from({ length: pairCount },
      () => Array.from({ length: pairCount }, () => rand(20, 100))
    );

  function buildActors() {
    leaders   = makeDancers('leader',   pickNames(femaleNames, pairCount));
    followers = makeDancers('follower', pickNames(maleNames,   pairCount));
    matrix    = buildMatrix();
    history.length = 0; ptr = -1; nav();
  }

  /* ---------- init ---------- */
  buildActors();
  renderSetup();
  drawMatrix();
  spawnGrid();

  const NO_ITER = new Set(['greedy']);
  selAlgo.onchange = () => {
    const needsIter = !NO_ITER.has(selAlgo.value);
    selIter.disabled = !needsIter;
    selIter.classList.toggle('opacity-50', !needsIter);
  };
  selAlgo.onchange();

  /* ---------- events ---------- */
  selCount.onchange = () => {
    pairCount = Math.min(+selCount.value, maxPairs);
    buildActors(); renderSetup(); drawMatrix(); spawnGrid();
  };
  shuffleBtn.onclick = () => {
    [...leaders, ...followers].forEach(d => d.skill = rand(40, 100));
    matrix = buildMatrix();
    renderSetup(); drawMatrix(); spawnGrid();
  };
  runBtn.onclick  = () => runAlgo(selAlgo.value, +selIter.value);
  skipBtn.onclick = () => { skipMode = true; skipBtn.disabled = true; };
  prevBtn.onclick = () => show(ptr - 1);
  nextBtn.onclick = () => show(ptr + 1);

  /* ---------- setup panel ---------- */
  function line(d, isL, idx) {
    return `
      <div class="flex gap-2 items-center">
        <div class="w-20">${d.name}</div>
        <select data-kind="${isL?'L':'F'}" data-idx="${idx}" class="border rounded px-1 text-xs">
          ${STYLES.map(s => `<option${d.style===s?' selected':''}>${s}</option>`).join('')}
        </select>
        <input type="range" min="40" max="100" value="${d.skill}"
               data-kind="${isL?'L':'F'}" data-idx="${idx}" class="w-32">
        <div class="w-8 text-right text-xs">${d.skill}</div>
      </div>`;
  }
  function renderSetup() {
    setupBox.innerHTML =
      `<div class="flex flex-col gap-2">${leaders.map((d,i)=>line(d,true,i)).join('')}</div>` +
      `<div class="flex flex-col gap-2">${followers.map((d,i)=>line(d,false,i)).join('')}</div>`;

    setupBox.querySelectorAll('select').forEach(sel=>{
      sel.onchange = ()=>{
        const arr = sel.dataset.kind==='L' ? leaders : followers;
        const d = arr[+sel.dataset.idx];
        d.style = sel.value;
        const sp = grid.querySelector(`#sprite-${d.name}`);
        if (sp) sp.style.backgroundImage = `url(${d.sprite})`;
      };
    });
    setupBox.querySelectorAll('input[type="range"]').forEach(r=>{
      const out = r.nextElementSibling;
      r.oninput = ()=>{
        out.textContent = r.value;
        const arr = r.dataset.kind==='L' ? leaders : followers;
        arr[r.dataset.idx].skill = +r.value;
      };
    });
  }

  /* ---------- grid ---------- */
  function spawnGrid() {
    // Grid arka planını ayarla ve içeriği temizle
    grid.style.background = 'url("img/tileset-grassland-grass.png") repeat';
    grid.innerHTML = '';

    // Ölçüler
    const cols  = COL_F_START + 1;
    const fullW = cols * DEFAULT_CELL;
    const fullH = pairCount * DEFAULT_CELL;
    grid.style.width  = `${fullW}px`;
    grid.style.height = `${fullH}px`;

    // Ekran genişliğine göre ölçek hesapla
    const containerW = grid.parentElement.clientWidth;
    const scale = Math.min(1, containerW / fullW);
    const origin = window.innerWidth <= MOBILE_BREAK ? 'top left' : 'top center';
    grid.style.transform       = `scale(${scale})`;
    grid.style.transformOrigin = origin;

    // ——— Burada parent wrapper’ın layout yüksekliğini de ayarlıyoruz ———
    grid.parentElement.style.height = `${fullH * scale}px`;
    // ————————————————————————————————————————————————————————————————

    // Yukarı kaydırmayı sıfırla
    grid.parentElement.scrollLeft = 0;

    // Lider ve takipçileri konumlandır
    [...leaders, ...followers].forEach((d, i) => {
      const row = i < pairCount ? i : i - pairCount;
      const col = i < pairCount ? COL_L_START : COL_F_START;
      const { left, top } = cell(col, row);

      const wrap = document.createElement('div');
      wrap.style = `
        position: absolute;
        left: ${left}px; top: ${top}px;
        width: ${DEFAULT_CELL}px; height: ${DEFAULT_CELL}px;
        transition: left 1.2s, top 1.2s;
      `;
      wrap.innerHTML = `
        <div class="text-center text-xs font-semibold">${d.name}</div>
        <div id="sprite-${d.name}"
            class="dance-sprite ${d.style} w-16 h-16 mx-auto"
            style="background-image: url(${d.sprite});">
        </div>
      `;
      grid.appendChild(wrap);
    });
  }

  /* ---------- matrix ---------- */
  function drawMatrix() {
    matTbl.innerHTML =
      `<caption class="caption-top text-xs mb-1">Raw compatibility score (0–100)</caption>` +
      `<tr><th></th>${followers.map(f=>`<th>${f.name}</th>`).join('')}</tr>` +
      matrix.map((row,i)=>
        `<tr><th>${leaders[i].name}</th>` +
        row.map(s=>`<td>${s}</td>`).join('') +
        `</tr>`
      ).join('');
  }

  /* ---------- narrative ---------- */
  function narrative(p) {
    const same = p.l.style===p.f.style;
    const styleTxt = same
      ? `Both love <strong>${p.l.style}</strong> style.`
      : `${p.l.name} likes <strong>${p.l.style}</strong>, ${p.f.name} prefers <strong>${p.f.style}</strong>.`;
    const gap = Math.abs(p.l.skill - p.f.skill);
    const skillTxt = gap <= 5   ? 'Skills match perfectly.'
                    : gap <= 15  ? 'Skills are close.'
                                 : 'Big skill gap.';
    return `• <strong>${p.l.name}</strong> & <strong>${p.f.name}</strong> — <em>${p.score}</em> pts<br>` +
           `${styleTxt} ${skillTxt}`;
  }

  /* ---------- animate ---------- */
  async function animateSnap(s) {
    s.pairs.forEach((p,i)=>{
      const lWrap = grid.querySelector(`#sprite-${p.l.name}`).parentElement;
      const fWrap = grid.querySelector(`#sprite-${p.f.name}`).parentElement;
      const { left: lL, top: lT } = cell(COL_L_TARGET,i);
      const { left: fL, top: fT } = cell(COL_F_TARGET,i);
      lWrap.style.left = `${lL}px`; lWrap.style.top = `${lT}px`;
      fWrap.style.left = `${fL}px`; fWrap.style.top = `${fT}px`;
    });
    infoBox.innerHTML = `Iter <strong>${s.iter}</strong> — Best <span class="font-bold text-indigo-600">${s.total}</span> pts`;
    logBox.insertAdjacentHTML('beforeend', `<hr><em>New record!</em><br>${s.pairs.map(narrative).join('<br>')}`);
    logBox.scrollTop = logBox.scrollHeight;
    if (!skipMode) await delay(1250);
  }

  /* ---------- run algorithm ---------- */
  async function runAlgo(algo, iters) {
    history.length = 0; ptr = -1; nav();
    spawnGrid();
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));

    logBox.innerHTML = `🎲 Running ${algo}…`;
    skipMode = false; skipBtn.classList.remove('hidden'); skipBtn.disabled = false;

    const cb = async snap => {
      history.push(snap); ptr = history.length - 1; nav();
      await animateSnap(snap);
    };

    switch(algo) {
      case 'mc':     await monteCarloDance(leaders, followers, iters, cb); break;
      case 'greedy': await greedyDance(leaders, followers, cb);             break;
      case 'sa':     await simulatedAnnealingDance(leaders, followers, iters, cb); break;
      case 'ga':     await geneticDance(leaders, followers, iters, cb);     break;
      case 'tabu':   await tabuSearchDance(leaders, followers, iters, cb);  break;
    }

    skipBtn.classList.add('hidden');
    logBox.insertAdjacentHTML('beforeend','<br>✅ Finished.');
    logBox.scrollTop = logBox.scrollHeight;
  }

  /* ---------- history navigation ---------- */
  const show = i => { if(i<0||i>=history.length) return; ptr = i; nav(); animateSnap(history[i]); };

  /* ---------- template ---------- */
  function template() {
    const ITER_OPTS = [5,10,25,50,100,250,500,1000];
    return `
<div class="min-h-[60vh] md:min-h-[80vh] flex flex-col items-center py-8 bg-gradient-to-br from-slate-50 to-indigo-100">
  <div class="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-xl w-full max-w-4xl flex flex-col gap-6">
    <h2 class="text-center text-3xl font-semibold text-indigo-600">Dance Partner Matcher</h2>

    <div class="flex flex-wrap gap-3 justify-center items-center">
      <label class="flex items-center gap-1">Couples
        <select id="pair-count" class="border rounded px-1 py-0.5">
          ${[...Array(maxPairs).keys()].map(i=>`<option${i+1===pairCount?' selected':''}>${i+1}</option>`).join('')}
        </select>
      </label>
      <label class="flex items-center gap-1">Iter
        <select id="iter" class="border rounded px-1 py-0.5">
          ${ITER_OPTS.map(v=>`<option>${v}</option>`).join('')}
        </select>
      </label>
      <label class="flex items-center gap-1">Algo
        <select id="algorithm" class="border rounded px-1 py-0.5">
          <option value="mc">Monte Carlo</option>
          <option value="greedy">Greedy</option>
          <option value="sa">Simulated Annealing</option>
          <option value="ga">Genetic Alg.</option>
          <option value="tabu">Tabu Search</option>
        </select>
      </label>
      <button id="shuffle" class="bg-amber-500 text-white px-3 py-1 rounded">Randomise</button>
      <button id="run"     class="bg-teal-600  text-white px-3 py-1 rounded">Run</button>
      <button id="skip"    class="hidden bg-rose-500 text-white px-3 py-1 rounded">Skip</button>
      <button id="prev"    class="bg-gray-300 px-2 rounded" disabled>◀</button>
      <button id="next"    class="bg-gray-300 px-2 rounded" disabled>▶</button>
    </div>

    <div id="setup-box" class="grid sm:grid-cols-2 gap-2 bg-white p-4 rounded-lg shadow-inner text-xs"></div>

    <!-- sadece mobilde kaydırmayı kapatıyoruz -->
    <div class="w-full overflow-x-hidden md:overflow-x-auto md:flex md:justify-center">
      <div id="grid" class="relative"></div>
    </div>

    <div id="info" class="font-medium text-center"></div>

    <div class="flex flex-col sm:flex-row gap-4 justify-center items-start">
      <table id="mat" class="text-sm border-separate border-spacing-1"></table>
      <div class="max-w-sm p-4 rounded shadow text-sm bg-white">
        <h3 class="font-semibold mb-1">How are pairs scored?</h3>
        <ul class="list-disc list-inside">
          <li><strong>Style bonus</strong> — identical style up to 30 pts</li>
          <li><strong>Skill gap</strong> — closer skills add up to 30 pts</li>
          <li><strong>Chemistry</strong> — random vibe bonus (0-20 pts)</li>
        </ul>
      </div>
    </div>

    <div id="log" class="scroll-touch w-full max-w-3xl h-48 mx-auto overflow-y-auto bg-gray-50 p-3 text-sm font-mono rounded shadow-inner"></div>
  </div>
</div>`;
  }
}
