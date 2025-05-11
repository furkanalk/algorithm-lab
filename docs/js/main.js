import {
  createGrid, toggleWallMode, clearPath, resetGrid, visualize,
  startNode, endNode,
  bfs, dfs, dijkstra, astar
} from './features/pathfinding/index.js';

import { initSortTool } from './features/sorting/index.js';
import { initDanceGame } from './features/decision/index.js';

const sections = {
  home : document.getElementById('homeSection'),
  wiki : document.getElementById('wikiSection'),
  test : document.getElementById('testSection'),
  path : document.getElementById('pathSection'),
  sort : document.getElementById('sortSection'),
  decision : document.getElementById('decisionSection'),
};

/* Bubble Sort UI init once */
let sortInitDone = false;
let decisionInitDone = false;

function showSection(name) {
  Object.entries(sections).forEach(([key, sec]) => {
    sec.classList.toggle('hidden',  key !== name);
    sec.classList.toggle('visible', key === name);
  });

  if (name === 'path') {
    (function retry() {
      const h = document.getElementById('grid').clientHeight;
      if (h > 0) return createGrid();
      setTimeout(retry, 50);
    })();
  }

  if (name === 'sort' && !sortInitDone) {     // ⭐
    requestIdleCallback(() => initSortTool('sorting-tool'));
    sortInitDone = true;
  }

  if (name === 'decision' && !decisionInitDone) {     // ⭐
    requestIdleCallback(() => initDanceGame('decision-tool'));
    decisionInitDone = true;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('homeTest').addEventListener('click',
    () => showSection('test'));
  document.getElementById('homeWiki').addEventListener('click',
    () => showSection('wiki'));
  document.getElementById('navTest').addEventListener('click',
    () => showSection('test'));
  document.getElementById('navWiki').addEventListener('click',
    () => showSection('wiki'));
  document.getElementById('btnPath').addEventListener('click',
    () => showSection('path'));
  document.getElementById('openSort').addEventListener('click',
    () => showSection('sort'));
  document.getElementById('openDecision').addEventListener('click',
    () => showSection('decision'));
  const backBtn = document.getElementById('backTest');
  if (backBtn) backBtn.addEventListener('click',
    () => showSection('test'));

  showSection('home');
  
  /* pathfinding */
  document.getElementById('wallBtn').addEventListener('click', () => {
    const mode = toggleWallMode();
    document.getElementById('wallBtn').textContent =
      `Wall Mode: ${mode ? 'On' : 'Off'}`;
  });

  document.getElementById('runBtn').addEventListener('click', () => {
    if (!startNode || !endNode) return;

    const algo = document.getElementById('algoSelect').value;
    const speed = Number(document.getElementById('speedSelect').value);
    let result;

    switch (algo) {
      case 'bfs'      : result = bfs(startNode, endNode);      break;
      case 'dfs'      : result = dfs(startNode, endNode);      break;
      case 'dijkstra' : result = dijkstra(startNode, endNode); break;
      case 'astar'    : result = astar(startNode, endNode);    break;
      default         : return;
    }
    visualize(result.visitedOrder, result.path, speed);
  });

  document.getElementById('resetBtn').addEventListener('click', resetGrid);
  document.getElementById('clearBtn').addEventListener('click', clearPath);
});
requestIdleCallback(() => {
  createGrid({ skipFade: false });
});