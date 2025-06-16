import { Chart } from '../lib/chart.js';

// Tamamen animasyonları kapatıyoruz, böylece yükseklik sürekli
// artmaz ve requestAnimationFrame döngüsü durur
Chart.defaults.animation = false;

const MOBILE_BREAK = 640;    // px; mobil limit

const shuffle = a => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const COLOR_LEFT  = '#6366f1';
const COLOR_RIGHT = '#ec4899';

export function initSortingRaceTool(sectionId = 'race-tool') {
  const section   = document.getElementById(sectionId);
  if (!section) {
    console.warn('SortingRace: section not found');
    return;
  }

  const leftSel   = section.querySelector('#algoLeft');
  const rightSel  = section.querySelector('#algoRight');
  const randomBtn = section.querySelector('#raceRandom');
  const runBtn    = section.querySelector('#raceRun');
  const leftArea  = section.querySelector('#leftBars');
  const rightArea = section.querySelector('#rightBars');
  const graph     = section.querySelector('#raceGraph');

  const algos = {
    'Bubble Sort'   : bubbleSteps,
    'Selection Sort': selectionSteps,
    'Insertion Sort': insertionSteps,
    'Quick Sort'    : quickSteps,
    'Merge Sort'    : mergeSteps,
    'Heap Sort'     : heapSteps,
  };
  Object.keys(algos).forEach(n => {
    leftSel .append(new Option(n, n));
    rightSel.append(new Option(n, n));
  });
  rightSel.selectedIndex = 1;

  let currentInit = [...Array(60).keys()].map(i => 60 - i);

  drawBars(leftArea,  currentInit, COLOR_LEFT);
  drawBars(rightArea, currentInit, COLOR_RIGHT);

  let raceChart = null;
  raceChart = makeChart(
    { name: leftSel.value,  duration: 0, comparisons: 0 },
    { name: rightSel.value, duration: 0, comparisons: 0 }
  );

  randomBtn.addEventListener('click', () => {
    currentInit = shuffle([...Array(60).keys()].map(i => i + 1));
    drawBars(leftArea,  currentInit, COLOR_LEFT);
    drawBars(rightArea, currentInit, COLOR_RIGHT);
    resetChart();
  });

  runBtn.addEventListener('click', () => {
    resetChart();

    const leftArr  = [...currentInit];
    const rightArr = [...currentInit];

    drawBars(leftArea,  currentInit, COLOR_LEFT);
    drawBars(rightArea, currentInit, COLOR_RIGHT);

    const results = { l: null, r: null };

    animate(leftArea,  leftArr,  algos[leftSel.value],  r => { results.l = { name:leftSel.value,  ...r }; maybeUpdate(); });
    animate(rightArea, rightArr, algos[rightSel.value], r => { results.r = { name:rightSel.value, ...r }; maybeUpdate(); });

    function maybeUpdate() {
      if (results.l && results.r) {
        raceChart = makeChart(results.l, results.r);
      }
    }
  });

  function drawBars(area, arr, color) {
    area.innerHTML         = '';
    area.style.display     = 'flex';
    area.style.alignItems  = 'flex-end';
    area.style.gap         = '1px';
    const max = Math.max(...arr);

    arr.forEach(v => {
      const bar = document.createElement('div');
      bar.style.height     = `${(v / max) * 100}%`;
      bar.style.flex       = '1 0 auto';
      bar.style.background = color;
      bar.style.transition = 'height .07s linear';
      area.appendChild(bar);
    });
  }

  function animate(area, arr, stepFn, done) {
    const { steps, comparisons } = stepFn([...arr]);
    const bars  = [...area.children];
    const start = performance.now();
    let i = 0;

    const id = setInterval(() => {
      if (i >= steps.length) {
        clearInterval(id);
        done({ duration: Math.round(performance.now() - start), comparisons });
        return;
      }
      steps[i++].forEach((v, k) => {
        bars[k].style.height = `${(v / arr.length) * 100}%`;
      });
    }, 12); // ≈60 fps
  }

  function makeChart(a, b) {
    const old = Chart.getChart(graph);
    if (old) old.destroy();

    graph.style.display = 'block';

    return new Chart(graph, {
      type: 'bar',
      data: {
        labels: ['Time (ms)', 'Comparisons'],
        datasets: [
          {
            label: a.name,
            data: [a.duration, a.comparisons],
            backgroundColor: 'rgba(99,102,241,0.7)'
          },
          {
            label: b.name,
            data: [b.duration, b.comparisons],
            backgroundColor: 'rgba(236,72,153,0.7)'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: window.innerWidth <= MOBILE_BREAK ? 1.2 : 2,
        animation: false,
        plugins: {
          title: {
            display: true,
            text: 'Performance Analysis'
          }
        }
      }
    });
  }

  function resetChart() {
    const old = Chart.getChart(graph);
    if (old) old.destroy();
    raceChart = null;
  }
}

function bubbleSteps(a) {
  const s = [a.slice()];
  let c = 0;

  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < a.length - 1 - i; j++) {
      c++;
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        s.push(a.slice());
      }
    }
  }

  return { steps: s, comparisons: c };
}

function selectionSteps(a) {
  const s = [a.slice()];
  let c = 0;

  for (let i = 0; i < a.length - 1; i++) {
    let min = i;
    for (let j = i + 1; j < a.length; j++) {
      c++;
      if (a[j] < a[min]) {
        min = j;
      }
    }
    if (min !== i) {
      [a[i], a[min]] = [a[min], a[i]];
      s.push(a.slice());
    }
  }

  return { steps: s, comparisons: c };
}

function insertionSteps(a) {
  const s = [a.slice()];
  let c = 0;

  for (let i = 1; i < a.length; i++) {
    let key = a[i];
    let j = i - 1;

    while (j >= 0 && a[j] > key) {
      c++;
      a[j + 1] = a[j];
      j--;
      s.push(a.slice());
    }

    a[j + 1] = key;
    s.push(a.slice());
  }

  return { steps: s, comparisons: c };
}

function quickSteps(a) {
  const s = [a.slice()];
  let c = 0;

  function quicksort(left, right) {
    if (left >= right) return;

    const pivot = a[right];
    let i = left;

    for (let j = left; j < right; j++) {
      c++;
      if (a[j] < pivot) {
        [a[i], a[j]] = [a[j], a[i]];
        s.push(a.slice());
        i++;
      }
    }

    [a[i], a[right]] = [a[right], a[i]];
    s.push(a.slice());

    quicksort(left, i - 1);
    quicksort(i + 1, right);
  }

  quicksort(0, a.length - 1);
  return { steps: s, comparisons: c };
}

function mergeSteps(a) {
  const s = [a.slice()];
  let c = 0;

  function mergesort(left, right) {
    if (left >= right) return;

    const mid = (left + right) >> 1;
    mergesort(left, mid);
    mergesort(mid + 1, right);

    const L = a.slice(left, mid + 1);
    const R = a.slice(mid + 1, right + 1);

    let i = 0, j = 0, k = left;

    while (i < L.length && j < R.length) {
      c++;
      a[k++] = (L[i] <= R[j]) ? L[i++] : R[j++];
      s.push(a.slice());
    }

    while (i < L.length) a[k++] = L[i++];
    while (j < R.length) a[k++] = R[j++];
    s.push(a.slice());
  }

  mergesort(0, a.length - 1);
  return { steps: s, comparisons: c };
}

function heapSteps(a) {
  const s = [a.slice()];
  let c = 0;

  function heapify(n, i) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < n && a[left] > a[largest]) largest = left;
    if (right < n && a[right] > a[largest]) largest = right;

    if (largest !== i) {
      [a[i], a[largest]] = [a[largest], a[i]];
      s.push(a.slice());
      heapify(n, largest);
    }

    c++;
  }

  for (let i = Math.floor(a.length / 2) - 1; i >= 0; i--) {
    heapify(a.length, i);
  }

  for (let i = a.length - 1; i > 0; i--) {
    [a[0], a[i]] = [a[i], a[0]];
    s.push(a.slice());
    heapify(i, 0);
  }

  return { steps: s, comparisons: c };
}
