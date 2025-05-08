import delay from '../../../core/delay.js';

export async function quickSort(arr, chart, asc, step, C, tell) {
  const a = arr.slice();
  const bar = chart.data.datasets[0];

  /** Paint each bar based on the current partition window */
  const paint = (low, high, j, pivotIdx) => a.map((_, idx) => {
    if (idx === pivotIdx)               return C.pivot;      // pivot – unique colour
    if (idx === j)                      return C.test;       // bar under test
    if (idx < low || idx > high)        return C.sorted;     // already partition‑fixed
    return C.unsorted;                                      // active, unsorted
  });

  /** Partition– returns new pivot position  */
  async function partition(low, high) {
    const pivot = a[high];
    tell(`🟡 <strong>Partition [${low}‑${high}]</strong><br>Pivot = ${pivot}`);
    let i = low;

    for (let j = low; j < high; j++) {
      bar.backgroundColor = paint(low, high, j, high);
      chart.update();
      await delay(step);

      tell(`Compare ${a[j]} with pivot ${pivot}`);
      if (asc ? a[j] < pivot : a[j] > pivot) {
        [a[i], a[j]] = [a[j], a[i]];
        bar.data = a.slice();
        chart.update();
        tell(`↔️ Swap ${a[j]} ↔ ${a[i]} (pivot stays)`);
        await delay(step * 0.6);
        i++;
      }
    }

    /* finally move pivot into place */
    [a[i], a[high]] = [a[high], a[i]];
    bar.data = a.slice();
    bar.backgroundColor = paint(low, high, -1, i);
    chart.update();
    tell(`✅ Pivot ${pivot} placed at index ${i}<br>&nbsp;`);
    await delay(step);
    return i;
  }

  /* -------- iterative quick‑sort using stack -------- */
  const stack = [[0, a.length - 1]];
  while (stack.length) {
    const [low, high] = stack.pop();
    if (low >= high) continue;

    const p = await partition(low, high);

    /* push right then left so left is processed first (like recursion) */
    stack.push([p + 1, high]);
    stack.push([low, p - 1]);
  }

  bar.backgroundColor = a.map(() => C.sorted);
  chart.update();
  tell('🎉 Quick Sort complete – array ordered!');
}
