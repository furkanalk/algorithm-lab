import delay from '../../../core/delay.js';

export async function insertionSort(arr, chart, asc, step, C, tell) {
  const a=arr.slice(), d=chart.data.datasets[0];
  const paint = (sorted, cur) => a.map((_,k)=>
    k===cur         ? C.key
  : k<sorted        ? C.sorted
                    : C.unsorted );

  for(let i=1,s=1;i<a.length;i++){
    let key=a[i], j=i-1;
    tell(`🛎️ <strong>Pick ${key}</strong> for insertion`);
    while(j>=0 && (asc ? a[j]>key : a[j]<key)){
      a[j+1]=a[j]; j--;
      d.data=a.slice(); d.backgroundColor=paint(i,j+1); chart.update();
      tell(`Step ${s++}: shift ${a[j+1]} ➡️`);
      await delay(step);
    }
    a[j+1]=key;
    d.data=a.slice(); chart.update();
    tell(`✅ Insert ${key} at index ${j+1}<br>&nbsp;`);
    await delay(step/1.5);
  }
  d.backgroundColor=a.map(()=>C.sorted); chart.update();
  tell('🎉 Sorted by insertion!');
}
