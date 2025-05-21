import delay from '../../../core/delay.js';
import { pairScore } from './scoreHelpers.js';

export async function greedyDance(leaders, followers, onSnap) {
  const remainingF = [...followers];
  let iter = 0, total = 0;
  const pairs = [];

  for (const L of leaders) {
    let best = null, bestScore = -Infinity, bestIdx = -1;
    remainingF.forEach((F, idx) => {
      const s = pairScore(L, F);
      if (s > bestScore) { best = F; bestScore = s; bestIdx = idx; }
    });
    remainingF.splice(bestIdx, 1);
    pairs.push({ l: L, f: best, score: bestScore });
    total += bestScore;
    await onSnap({ iter: ++iter, total, pairs: JSON.parse(JSON.stringify(pairs)) });
    await delay(1);
  }
}
