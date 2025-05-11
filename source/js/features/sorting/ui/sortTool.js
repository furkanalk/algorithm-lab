/* UI */
import * as ChartMod from 'https://cdn.jsdelivr.net/npm/chart.js@4.4.9/+esm';
import ChartDataLabels from 'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0/+esm';
const { Chart, registerables } = ChartMod;
Chart.register(...registerables, ChartDataLabels);

import {
  bubbleSort,
  selectionSort,
  insertionSort,
  mergeSort,
  quickSort
} from '../algorithms/index.js';

const palette = [
  '#6366F1','#0EA5E9','#8B5CF6','#06B6D4','#1E40AF',
  '#10B981','#8B5A2B'
];
const pick = () => palette[Math.floor(Math.random()*palette.length)];

export function initSortTool(containerId='sorting-tool') {
  let data = [], chart = null, ascending = true, sorting = false;
  let baseColor = pick();

  const COLORS = () => ({
    unsorted : baseColor,
    compared : '#EF4444',
    key      : '#8B5CF6',
    best     : '#FACC15',
    scan     : '#FBBF24',
    merge    : '#A855F7',
    right    : '#06B6D4',
    pivot    : '#000000',
    test     : '#EF4444',
    sorted   : '#F97316',
  });
  

  /* DOM */
  const root = document.getElementById(containerId);
  root.innerHTML = `
   <div class="flex flex-col gap-y-4 items-center">
     <h2 class="text-3xl font-medium text-orange-500">Sorting Visualizer</h2>

     <div class="flex flex-row gap-2 w-full max-w-2xl">
       <select id="algo" class="border px-2 py-1 rounded">
         <option value="bubble">Bubble</option>
         <option value="selection">Selection</option>
         <option value="insertion">Insertion</option>
         <option value="merge">Merge</option>
         <option value="quick">Quick</option>
       </select>
       <input id="input" class="border px-2 py-1 flex-1 rounded"
              placeholder="Up to 10 numbers, comma‑separated" />
       <button id="order" class="px-3 py-1 rounded text-white bg-teal-700/90 hover:bg-teal-700">
         Asc
       </button>
       <button id="rand" class="px-3 py-1 rounded border bg-white hover:bg-zinc-100">
         Random
       </button>
     </div>

     <div class="flex gap-2">
       <button id="sort" class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">Sort</button>
       <button id="prev" class="px-3 py-2 bg-gray-300 text-gray-700 rounded" disabled>⬅</button>
       <button id="next" class="px-3 py-2 bg-gray-300 text-gray-700 rounded" disabled>➡</button>
     </div>

     <div class="w-full max-w-2xl"><canvas id="canvas" style="height:320px"></canvas></div>

     <div class="flex gap-3 text-sm">
       <span class="flex items-center gap-1"><span id="leg-uns" class="w-6 h-3.5"></span>Unsorted</span>
       <span class="flex items-center gap-1"><span style="background:#F97316" class="w-6 h-3.5"></span>Sorted</span>
       <span class="flex items-center gap-1"><span style="background:#EF4444" class="w-6 h-3.5"></span>Compared</span>
     </div>

     <div id="log" class="scroll-touch w-full max-w-2xl h-64 overflow-y-auto bg-gray-50 rounded p-3 text-sm font-mono shadow-inner"></div>
     <div id="current" class="w-full max-w-2xl bg-white rounded p-4 text-base font-semibold shadow"></div>
   </div>
  `;

  /* refs */
  const $ = s => root.querySelector(s);
  const selAlgo=$('#algo'), input=$('#input'), btnOrder=$('#order'),
        btnRand=$('#rand'), btnSort=$('#sort'),
        btnPrev=$('#prev'), btnNext=$('#next'),
        canvas=$('#canvas'), legUns=$('#leg-uns'),
        logEl=$('#log'), curEl=$('#current');

  /* helpers */
  const randomData = () => Array.from({length:10},() => Math.floor(Math.random()*100)+1);
  const clearLog   = () => { logEl.innerHTML=''; curEl.innerHTML=''; };
  const pushLog    = m   => { logEl.insertAdjacentHTML('beforeend',`<div>${m}</div>`); logEl.scrollTop=logEl.scrollHeight; };

  /* history */
  const history=[]; let ptr=-1;
  const snap = msg => history.push({
    data: chart.data.datasets[0].data.slice(),
    cols: chart.data.datasets[0].backgroundColor.slice(),
    msg
  });
  const navUpdate = () => {
    btnPrev.disabled = ptr<=0;
    btnNext.disabled = ptr>=history.length-1;
  };
  const show = i => {
    if(i<0||i>=history.length) return;
    ptr=i; navUpdate();
    const h=history[i];
    chart.data.datasets[0].data = h.data.slice();
    chart.data.datasets[0].backgroundColor = h.cols.slice();
    chart.update();
    curEl.innerHTML = h.msg;
  };

  /* chart */
  const buildChart = () => {
    if (chart) chart.destroy();
    chart = new Chart(canvas.getContext('2d'),{
      type:'bar',
      data:{
        labels:data.map((_,i)=>i.toString()),
        datasets:[{data, backgroundColor:data.map(()=>baseColor), borderWidth:2}]
      },
      options:{
        responsive:true, maintainAspectRatio:false,
        layout:{padding:{top:30}},
        scales:{ x:{display:false,offset:true}, y:{display:false,beginAtZero:true}},
        plugins:{
          legend:{display:false},
          datalabels:{
            color:'white',
            anchor:'start',
            align :'start',
            xAdjust: -10,
            clamp:true,  
            clip:false,
            formatter:v=>v
          }
        }
      },
      plugins:[ChartDataLabels]
    });
    legUns.style.background=baseColor;
    setTimeout(()=>chart.resize(),0);
  };

  const setBusy = b => {
    [input,btnOrder,btnRand,btnSort].forEach(el=>el.disabled=b);
    btnSort.textContent = b ? 'Sorting…' : 'Sort';
    sorting=b;
  };

  /* events */
  btnRand.onclick = () => {
    baseColor=pick(); data=randomData(); input.value='';
    history.length=0; ptr=-1; navUpdate(); clearLog(); buildChart();
  };
  input.oninput = e => {
    data=e.target.value.split(',').map(v=>Number(v.trim())).filter(Number.isFinite).slice(0,10);
    history.length=0; ptr=-1; navUpdate(); clearLog(); buildChart();
  };
  btnOrder.onclick = () => {
    ascending=!ascending;
    btnOrder.textContent = ascending?'Asc':'Desc';
    btnOrder.classList.toggle('bg-teal-700/90', ascending);
    btnOrder.classList.toggle('bg-orange-700/90',!ascending);
  };
  btnSort.onclick = async () => {
    if(sorting||data.length===0) return;
    history.length=0; ptr=-1; navUpdate(); clearLog(); buildChart();
    setBusy(true);

    let prev='';
    const notify = m => {
      if(prev){ pushLog(prev); snap(prev); }
      curEl.innerHTML = m; prev=m;
    };
    const step = 800;
    const algo = selAlgo.value;
    const run = {
      bubble    : bubbleSort,
      selection : selectionSort,
      insertion : insertionSort,
      merge     : mergeSort,
      quick     : quickSort
    }[algo] || bubbleSort;
    await run(data, chart, ascending, step, COLORS(), notify);
    snap(prev); ptr=history.length-1; navUpdate();
    setBusy(false);
  };
  btnPrev.onclick = () => show(ptr-1);
  btnNext.onclick = () => show(ptr+1);

  /* first load */
  data=randomData(); buildChart();
}
