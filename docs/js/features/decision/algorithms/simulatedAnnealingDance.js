import delay from '../../../core/delay.js';
import { pairScore } from './scoreHelpers.js';

export async function simulatedAnnealingDance(leaders, followers, iters, onSnap) {
  let order = [...followers];
  const score = arr => leaders.reduce((sum, L, i) => sum + pairScore(L, arr[i]), 0);
  let bestTotal = score(order), bestPairs = buildPairs(order);
  await onSnap({ iter: 0, total: bestTotal, pairs: bestPairs });

  for (let iter = 1, T = 50; iter <= iters; iter++, T *= 0.995) {
    // swap iki follower
    const [i, j] = [Math.random()*order.length|0, Math.random()*order.length|0];
    [order[i], order[j]] = [order[j], order[i]];
    const newTotal = score(order);

    const accept = newTotal > bestTotal || Math.random() < Math.exp((newTotal - bestTotal)/T);
    if (!accept) [order[i], order[j]] = [order[j], order[i]]; // geri al
    else {
      bestTotal = newTotal;
      bestPairs = buildPairs(order);
      await onSnap({ iter, total: bestTotal, pairs: bestPairs });
    }
    if (iter % 400 === 0) await delay(1);
  }

  function buildPairs(arr){ return leaders.map((L,i)=>({ l:L,f:arr[i],score:pairScore(L,arr[i]) })); }
}
