import delay from '../../../core/delay.js';
import { pairScore } from './scoreHelpers.js';

function crossover(a,b){
  const cut = Math.random()*a.length|0;
  const child = [...a.slice(0,cut), ...b.filter(x=>!a.slice(0,cut).includes(x))];
  return child;
}
function mutate(arr){
  const [i,j] = [Math.random()*arr.length|0, Math.random()*arr.length|0];
  [arr[i],arr[j]]=[arr[j],arr[i]];
}
export async function geneticDance(leaders, followers, iters, onSnap) {
  let pop = Array.from({length:30},()=> shuffle([...followers]));
  let bestT = -1, bestPairs=null; const scoreArr = arr=> leaders.reduce((s,L,i)=>s+pairScore(L,arr[i]),0);

  for (let iter=0; iter<=iters; iter++){
    pop.sort((a,b)=> scoreArr(b)-scoreArr(a));
    const best = scoreArr(pop[0]);
    if(best>bestT){ bestT=best; bestPairs=leaders.map((L,i)=>({l:L,f:pop[0][i],score:pairScore(L,pop[0][i])}));
      await onSnap({iter,total:bestT,pairs:bestPairs});}
    const next = pop.slice(0,10); // elitism
    while(next.length<30){
      const [p1,p2]=pick2(pop.slice(0,15));
      let child=crossover(p1,p2);
      if(Math.random()<0.2) mutate(child);
      next.push(child);
    }
    pop=next;
    if(iter%100===0) await delay(1);
  }

  function shuffle(a){return a.sort(()=>Math.random()-.5);}
  function pick2(arr){ const i=Math.random()*arr.length|0, j=Math.random()*arr.length|0; return [arr[i],arr[j]];}
}
