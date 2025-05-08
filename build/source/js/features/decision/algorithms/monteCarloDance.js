import delay from '../../../core/delay.js';

/* ---------- STYLE BONUS (added "cool") ---------- */
const styleBonus = {
  fast:    { fast:30, slow:10, classic:15, modern:20, cool:18 },
  slow:    { fast:10, slow:30, classic:20, modern:15, cool:17 },
  classic: { fast:15, slow:20, classic:30, modern:10, cool:16 },
  modern:  { fast:20, slow:15, classic:10, modern:30, cool:19 },
  cool:    { fast:18, slow:17, classic:16, modern:19, cool:30 },
};

/* random 0‑20 “chemistry” bonus */
const vibe = () => Math.floor(Math.random() * 21);

function pairScore(L, F) {
  /* fall back to 0 if some style string is unexpected */
  const stylePts = (styleBonus[L.style] ?? {})[F.style] ?? 0;
  const skillPts = 30 - Math.abs(L.skill - F.skill);    // 0‑30
  const vibePts  = vibe();                              // 0‑20
  return stylePts + skillPts + vibePts;                 // 0‑80
}

/* ---------- Monte‑Carlo ---------- */
export async function monteCarloDance(leaders, followers, iters, onSnap) {
  const shuffle = arr => arr.sort(() => Math.random() - .5);
  let best = { total: -Infinity };

  for (let iter = 1; iter <= iters; iter++) {
    shuffle(leaders);
    shuffle(followers);

    let total = 0;
    const pairs = leaders.map((L, i) => {
      const F = followers[i];
      const score = pairScore(L, F);
      total += score;
      return { l: L, f: F, score };
    });

    if (total > best.total) {
      best = { iter, total, pairs: JSON.parse(JSON.stringify(pairs)) };
      await onSnap(best);          // pause while UI animates
    }

    if (iter % 1000 === 0) await delay(1);
  }
}
