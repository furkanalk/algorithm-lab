import delay from '../../../core/delay.js';

export async function selectionSort(arr, chart, asc, step, C, tell) {
  const a = arr.slice(), n = a.length, d = chart.data.datasets[0];
  const paint = (i, j, best) => a.map((_, k) =>
    k === best                 ? C.best
  : k === j                    ? C.scan
  : asc ? k < i                ? C.sorted : C.unsorted
        : k > i                ? C.sorted : C.unsorted );

  for (let i = 0, s=1; i < n - 1; i++) {
    let best = i;
    tell(`<strong>Round ${i+1}</strong> – searching for the ${asc?'smallest':'largest'}…`);
    for (let j = i+1; j < n; j++) {
      d.backgroundColor = paint(i, j, best); chart.update();
      tell(`🔍 Step ${s++}: Compare ${a[j]} with current best ${a[best]}`);
      if (asc ? a[j] < a[best] : a[j] > a[best]) {
        best = j;
        tell('💡 New best found!');
      }
      await delay(step);
    }
    [a[i], a[best]] = [a[best], a[i]];
    tell(`↔️ Swap into position – ${a[i]} locked!<br>&nbsp;`);
    d.data = a.slice(); d.backgroundColor = paint(i+1,-1,-1); chart.update();
    await delay(step);
  }
  d.backgroundColor = a.map(()=>C.sorted); chart.update();
  tell('🎉 Selection complete!');
}
