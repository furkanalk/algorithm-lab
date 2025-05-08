import delay from '../../../core/delay.js';

export async function bubbleSort(arr, chart, ascending, step, colors, notify) {
  const data   = arr.slice();
  const bar    = chart.data.datasets[0];
  const paint  = (j, bound) => data.map((_, k) => {
    if (k === j || k === j + 1) return colors.compared;
    if (ascending ? k > bound : k < bound) return colors.sorted;
    return colors.unsorted;
  });

  for (let i = 0, stepNo = 1; i < data.length - 1; i++) {
    let swapped = false;
    for (let j = 0; j < data.length - i - 1; j++) {
      bar.backgroundColor = paint(j, ascending ? data.length - i - 1 : i);
      chart.update();
      notify(`<strong>Step ${stepNo++}:</strong> Compare ${data[j]} & ${data[j + 1]}`);
      if (ascending ? data[j] > data[j + 1] : data[j] < data[j + 1]) {
        [data[j], data[j + 1]] = [data[j + 1], data[j]];
        swapped = true;
        notify('↔️ Swap');
        bar.data = data.slice(); chart.update();
      } else notify('👌 No swap');
      await delay(step);
    }
    if (!swapped) break;
  }
  bar.backgroundColor = data.map(() => colors.sorted);
  chart.update();
  notify('🎉 Done!');
}
