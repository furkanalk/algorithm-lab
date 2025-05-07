  export const dirs = [
  { dr: -1, dc: 0 }, { dr: 1, dc: 0 },
  { dr:  0, dc:-1 }, { dr: 0, dc: 1 },
];

export let startNode = null;
export let endNode   = null;
export let rows = 0, cols = 0;
export let walls = [];

let gridElement            = null;
let wallMode               = false;
let isMouseDown            = false;
let visualizationCancelled = false;
  
document.addEventListener('mousedown', () => { if (wallMode) isMouseDown = true; });
document.addEventListener('mouseup',   () => { isMouseDown = false; });

function gridDelegated(e) {
  const cell = e.target.closest('.node');
  if (!cell) return;
  const [r, c] = cell.dataset.rc.split(',').map(Number);
  if (e.type === 'click')           handleCellClick(r, c);
  else if (e.type === 'mouseenter' && wallMode && isMouseDown)
                                    handleCellClick(r, c);
}
  
/* SVG */
const startSVG = `
  <svg viewBox="0 0 24 24">
    <path fill="#ffffff" d="M5 3v18h2v-7h11l-2-4 2-4H7V3H5Z"/>
  </svg>`;
const endSVG = `
  <svg viewBox="0 0 24 24">
    <path fill="#ffffff" d="M5 3v18h2v-7h10l2 3 2-4-2-4-2 3H7V3H5Z"/>
  </svg>`;

function onAnimEnd(e) {
  if (e.animationName === 'fade-in')
    e.target.classList.remove('fade-in');
}

/* GRID CREATE */
export function createGrid({ skipFade = false } = {}) {
  gridElement = document.getElementById('grid');
  if (!gridElement) return;

  let tempMeasure = false;
  if (!gridElement.clientHeight) {
    tempMeasure = true;
    const headerH = document.querySelector('header')?.offsetHeight || 64;
    const approxH = window.innerHeight - headerH - 120;
    const approxW = window.innerWidth  - 32;
    gridElement.style.height = `${approxH}px`;
    gridElement.style.width  = `${approxW}px`;
  }

  const st = getComputedStyle(gridElement);
  const size = parseFloat(st.getPropertyValue('--node-size')) || 30;
  const gap  = parseFloat(st.getPropertyValue('--grid-gap'))  || 0;

  const w = gridElement.clientWidth;
  const h = gridElement.clientHeight;
  const newCols = Math.max(1, Math.floor((w + gap) / (size + gap)));
  const newRows = Math.max(1, Math.floor((h + gap) / (size + gap)));

  if (newRows === rows && newCols === cols && !tempMeasure) return;

  rows = newRows;
  cols = newCols;
  walls = Array.from({ length: rows }, () => Array(cols).fill(false));

  gridElement.style.gridTemplateColumns = `repeat(${cols}, ${size}px)`;
  gridElement.style.gridAutoRows        = `${size}px`;
  gridElement.style.gap                 = `${gap}px`;
  gridElement.innerHTML = '';              // clear old

  let r = 0;
  function addRow() {
    const frag = document.createDocumentFragment();
    for (let c = 0; c < cols; c++) {
      const div = document.createElement('div');
      div.dataset.rc = `${r},${c}`;
      div.className  = `node node-unvisited${skipFade ? '' : ' fade-in'}`;
      frag.appendChild(div);
    }
    gridElement.appendChild(frag);
    if (++r < rows) {
      requestAnimationFrame(addRow);
    }
  }
  addRow();

  if (!gridElement.__fadeListenerAdded) {
    gridElement.addEventListener('animationend', onAnimEnd);
    gridElement.__fadeListenerAdded = true;
  }

  if (tempMeasure) {
    gridElement.style.height = '';
    gridElement.style.width  = '';
  }
}

/* CELLS */
export function handleCellClick(r, c) {
  const cell = gridElement.querySelector(`[data-rc="${r},${c}"]`);

  if (wallMode) {
    if (!walls[r][c]) {
      walls[r][c] = true;
      cell.classList.remove('node-unvisited', 'fade-in');
      cell.classList.add('wall-fill');
      cell.addEventListener('animationend', () => {
        cell.classList.remove('wall-fill');
        cell.classList.add('node-wall');
      }, { once: true });
    } else {
      walls[r][c] = false;
      cell.className = 'node node-unvisited';
    }
    return;
  }

  if (!startNode) {
    startNode = { row: r, col: c };
    cell.classList.replace('node-unvisited', 'node-start');
  } else if (!endNode && !(startNode.row === r && startNode.col === c)) {
    endNode = { row: r, col: c };
    cell.classList.replace('node-unvisited', 'node-end');
  }
}

export const toggleWallMode = () => (wallMode = !wallMode);

export function clearPath() {
  startNode = endNode = null;
  gridElement.querySelectorAll('.node').forEach(cell => {
    const [r, c] = cell.dataset.rc.split(',').map(Number);
    if (!walls[r][c]) cell.className = 'node node-unvisited';
  });
}

export function resetGrid() {
  visualizationCancelled = true;
  startNode = endNode = null;
  walls.forEach(row => row.fill(false));
  createGrid({ skipFade: true });
}

/* VISUALIZE */
export async function visualize(visited, path, speed = 1) {
  visualizationCancelled = false;
  const visitDelay = 45 / speed, pathDelay = 90 / speed;

  for (const v of visited) {
    if (visualizationCancelled) return;
    const { row, col } = v;
    if (walls[row][col]) continue;
    const cell = gridElement.querySelector(`[data-rc="${row},${col}"]`);
    if (!cell || cell.classList.contains('node-start')
                || cell.classList.contains('node-end')) continue;
    cell.className = 'node node-visited fill-swell';
    await new Promise(r => setTimeout(r, visitDelay));
  }
  
  // Insert flags
  const sc = gridElement.querySelector(`[data-rc="${startNode.row},${startNode.col}"]`);
  const ec = gridElement.querySelector(`[data-rc="${endNode.row},${endNode.col}"]`);
  if (sc && !sc.querySelector('svg')) sc.insertAdjacentHTML('beforeend', startSVG);
  if (ec && !ec.querySelector('svg')) ec.insertAdjacentHTML('beforeend', endSVG);

  for (const p of path) {
    if (visualizationCancelled) return;
    const { row, col } = p;
    if (walls[row][col]) continue;
    const cell = gridElement.querySelector(`[data-rc="${row},${col}"]`);
    if (!cell || cell.classList.contains('node-start')
                || cell.classList.contains('node-end')) continue;
    cell.className = 'node node-shortest-path fill-swell-orange pulse';
    await new Promise(r => setTimeout(r, pathDelay));
  }

  if (visualizationCancelled) return;
  gridElement.classList.add('shake', 'glow');
  setTimeout(() => gridElement.classList.remove('shake', 'glow'), 600);
}

/* LOAD */
window.addEventListener('resize', () => createGrid({ skipFade: true }));

document.addEventListener('DOMContentLoaded', () => {
  const g = document.getElementById('grid');
  g.addEventListener('click',       gridDelegated);
  g.addEventListener('mouseenter',  gridDelegated, true);
});
