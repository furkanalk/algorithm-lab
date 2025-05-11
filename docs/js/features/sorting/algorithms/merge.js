import delay from '../../../core/delay.js';

export async function mergeSort(arr, chart, asc, step, C, tell) {
  const a=arr.slice(), d=chart.data.datasets[0];
  async function merge(l,m,r){
    const L=a.slice(l,m+1), R=a.slice(m+1,r+1);
    tell(`↔️ Merge [${l}‑${m}] & [${m+1}‑${r}]`);
    let i=0,j=0,k=l;
    while(i<L.length && j<R.length){
      d.backgroundColor=d.backgroundColor.map((c,idx)=>
        idx===k ? C.merge : (idx>=l&&idx<=r?C.right:C.unsorted));
      chart.update();
      tell(`Compare ${L[i]} vs ${R[j]}`);
      await delay(step);
      a[k++]= asc ? (L[i]<=R[j]?L[i++]:R[j++]) : (L[i]>=R[j]?L[i++]:R[j++]);
      d.data=a.slice(); chart.update();
    }
    while(i<L.length) a[k++]=L[i++];
    while(j<R.length) a[k++]=R[j++];
    d.data=a.slice(); chart.update();
    tell('✅ Segment merged<br>&nbsp;');
    await delay(step/1.5);
  }
  async function sort(l,r){
    if(l>=r) return;
    const m=(l+r)>>1; await sort(l,m); await sort(m+1,r); await merge(l,m,r);
  }
  await sort(0,a.length-1);
  d.backgroundColor=a.map(()=>C.sorted); chart.update();
  tell('🎉 Merge‑Sort finished!');
}
