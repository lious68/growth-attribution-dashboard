// Fixed demo snapshot, Asia/Shanghai dates. Attachment weeks are numeric anchors;
// all identities, daily allocations, other dates and category allocations are synthetic.
(function(){
 const anchors={
 '2026-08-10':{pv:55751,uv:41436,registered:1013,verified:486,consumption:299},
 '2026-08-17':{pv:56826,uv:41929,registered:1080,verified:511,consumption:321},
 '2026-08-24':{pv:56021,uv:41205,registered:1092,verified:510,consumption:228},
 '2026-08-31':{pv:56738,uv:41361,registered:1142,verified:520,consumption:294}};
 const allocate=(total,weights)=>{const denominator=weights.reduce((a,b)=>a+b,0),raw=weights.map(w=>total*w/denominator),out=raw.map(Math.floor);raw.map((v,i)=>({i,r:v-out[i]})).sort((a,b)=>b.r-a.r).slice(0,total-out.reduce((a,b)=>a+b,0)).forEach(x=>out[x.i]++);return out};
 const plus=(date,n)=>{const d=new Date(date+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
 const days=[];
 for(let week=0;week<11;week++){
  const monday=plus('2026-06-29',week*7),a=anchors[monday]||{pv:46800+week*920+(week%3)*370,uv:34500+week*670,registered:760+week*38,verified:340+week*17,consumption:180+week*10};
  const rows=Array.from({length:7},(_,j)=>({date:plus(monday,j),pv:0,uv:new Set(),registered:new Set(),verified:new Set(),consumption:new Set(),anchored:!!anchors[monday]}));
  for(let n=0;n<a.uv;n++){
   const id=n<a.uv-6000?100000+week*60000+n:n-(a.uv-6000),day=(n*3)%7;
   rows[day].uv.add(id);
   if(n<a.registered)rows[day].registered.add(id);
   if(n<a.verified)rows[day].verified.add(id);
   if(n<a.consumption)rows[day].consumption.add(id);
   if(n%10===0)rows[(day+1)%7].uv.add(id);
  }
  const extra=allocate(a.pv-rows.reduce((s,r)=>s+r.uv.size,0),[1.05,1.12,1.08,1.1,1.18,.8,.75]);
  rows.forEach((r,i)=>{r.pv=r.uv.size+extra[i];if(r.date>='2026-07-01'&&r.date<='2026-09-10')days.push(r)});
 }
 function aggregate(indices){const result={pv:0,uv:new Set(),registered:new Set(),verified:new Set(),consumption:new Set()};indices.forEach(i=>{result.pv+=days[i].pv;for(const key of ['uv','registered','verified','consumption'])days[i][key].forEach(id=>result[key].add(id))});return {pv:result.pv,...Object.fromEntries(['uv','registered','verified','consumption'].map(k=>[k,result[k].size]))}};
 const D=window.GROWTH_DATA;D.dates=days.map(r=>r.date.slice(5).replace('-','/'));
 Object.keys(D.trends).forEach(k=>D.trends[k]=[]);
 days.forEach((r,i)=>{const regs=r.registered.size,dept=allocate(regs,[53+(i%5),20,15,12]);['growth','sales','sem','ambassador'].forEach((k,j)=>D.trends[k].push(dept[j]));const channel=allocate(dept[0],[31,22,16,15,6,9,5]);['geo','content','kol','community','offline','event','other'].forEach((k,j)=>D.trends[k].push(channel[j]));D.trends.valid.push(regs);D.trends.confirmed.push(dept[0]-channel[6]);D.trends.assisted.push(channel[6]);D.trends.unidentified.push(regs-dept[0])});
 window.UNIFIED_REPORT={days,aggregate,anchors,start:'2026-07-01',end:'2026-09-10'};
})();
