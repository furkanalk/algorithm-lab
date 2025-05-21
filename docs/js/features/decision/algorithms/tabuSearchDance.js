import delay from '../../../core/delay.js';
import { pairScore } from './scoreHelpers.js';

export async function tabuSearchDance(leaders, followers, iters, onSnap) {
  let order = [...followers];
  let best  = score(order), bestPairs = build(order);
  const tabu = []; const TABU_LEN = 15;

  await onSnap({ iter: 0, total: best, pairs: bestPairs });

  for (let iter = 1; iter <= iters; iter++) {
    let candidate = null, candScore = -Infinity, swapIdx = null;

    for (let i = 0; i < order.length; i++) {
      for (let j = i + 1; j < order.length; j++) {
        if (tabu.some(t => t[0] === i && t[1] === j)) continue;
        const tmp = [...order];
        [tmp[i], tmp[j]] = [tmp[j], tmp[i]];
        const s = score(tmp);
        if (s > candScore) { candidate = tmp; candScore = s; swapIdx = [i, j]; }
      }
    }

    order = candidate;
    tabu.push(swapIdx);
    if (tabu.length > TABU_LEN) tabu.shift();

    if (candScore > best) {
      best = candScore;
      bestPairs = build(order);
      await onSnap({ iter, total: best, pairs: bestPairs });
    }
    if (iter % 400 === 0) await delay(1);
  }

  function score(arr) { return leaders.reduce((t, L, idx) => t + pairScore(L, arr[idx]), 0); }
  function build(arr) { return leaders.map((L, i) => ({ l: L, f: arr[i], score: pairScore(L, arr[i]) })); }
}
