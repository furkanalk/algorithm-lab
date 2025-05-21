const styleBonus = {
  fast:{fast:30,slow:10,classic:15,modern:20,cool:18},
  slow:{fast:10,slow:30,classic:20,modern:15,cool:17},
  classic:{fast:15,slow:20,classic:30,modern:10,cool:16},
  modern:{fast:20,slow:15,classic:10,modern:30,cool:19},
  cool:{fast:18,slow:17,classic:16,modern:19,cool:30},
};
const vibe = ()=> Math.floor(Math.random()*21);
export function pairScore(L,F){
  const s = styleBonus[L.style]?.[F.style] ?? 0;
  return s + (30-Math.abs(L.skill-F.skill)) + vibe();
}
