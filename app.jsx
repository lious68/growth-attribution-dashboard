// Design: preserve the existing teal UI; separate category expansion from time expansion.
// Original daily demo data is authoritative for period totals. Source rows are simulated splits.
const {useState,useMemo,useEffect,useRef}=React;
const D=window.GROWTH_DATA;
const dates=D.dates.map(x=>'2026-'+x.replace('/','-'));
const fmt=n=>n.toLocaleString('zh-CN');
const short=d=>d.slice(5).replace('-','/');
const sum=(a,indices)=>indices.reduce((s,i)=>s+a[i],0);
const colors=['#159A8C','#4B8DE8','#8072D4','#BA893C'];
function split(total,weights){
 const s=weights.reduce((a,b)=>a+b,0),raw=weights.map(w=>w*total/s),out=raw.map(Math.floor);
 raw.map((v,i)=>({i,r:v-out[i]})).sort((a,b)=>b.r-a.r).slice(0,total-out.reduce((a,b)=>a+b,0)).forEach(x=>out[x.i]++);
 return out;
}
const nodes={};
D.attributionTree.children.forEach((d,di)=>{
 nodes[d.id]={...d,values:D.trends[d.id],color:colors[di],children:(d.children||[]).map(c=>c.id)};
 (d.children||[]).forEach(c=>{
  const sources=D.details[c.id]||[];
  const allocations=D.trends[c.id].map(v=>sources.length?split(v,sources.map(s=>s.confirmed)):[]);
  nodes[c.id]={...c,values:D.trends[c.id],color:colors[0],children:sources.map((s,i)=>c.id+'-'+i)};
  sources.forEach((s,i)=>nodes[c.id+'-'+i]={id:c.id+'-'+i,name:s.source,values:allocations.map(a=>a[i]),color:colors[0],children:[],simulated:true});
 });
});
const departmentIds=D.attributionTree.children.map(d=>d.id);
nodes.all={id:'all',name:'注册归属合计',values:dates.map((_,i)=>departmentIds.reduce((s,id)=>s+nodes[id].values[i],0)),children:departmentIds,color:'#174A5B'};
function groups(indices,grain){
 if(grain==='day')return indices.map(i=>({key:dates[i],label:short(dates[i]),indices:[i]}));
 const map=new Map();
 indices.forEach(i=>{const d=new Date(dates[i]+'T00:00:00Z');d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7));const key=d.toISOString().slice(0,10);if(!map.has(key))map.set(key,[]);map.get(key).push(i)});
 return [...map].map(([key,ix],i)=>({key,label:`第 ${i+1} 周`,indices:ix,partial:ix.length<7}));
}
function App(){
 const [start,setStart]=useState("2026-09-01"),[end,setEnd]=useState(dates.at(-1)),[grain,setGrain]=useState('day');
 const [expanded,setExpanded]=useState(new Set(['all','growth'])),[weeks,setWeeks]=useState(new Set());
 const [focus,setFocus]=useState('growth'),[detail,setDetail]=useState(null),[message,setMessage]=useState('');
 const [t,setTweak]=useTweaks(window.TWEAK_DEFAULTS);
 const ref=useRef(null);
 const indices=useMemo(()=>dates.map((_,i)=>i).filter(i=>dates[i]>=start&&dates[i]<=end),[start,end]);
 const buckets=useMemo(()=>groups(indices,grain),[indices,grain]);
 const valid=start&&end&&start<=end&&indices.length>0;
 const toggle=(setter,set,key)=>setter(new Set(set.has(key)?[...set].filter(k=>k!==key):[...set,key]));
 const visible=[];function visit(id,depth){visible.push({...nodes[id],depth});if(expanded.has(id))nodes[id].children.forEach(c=>visit(c,depth+1))}visit('all',0);
 const columns=buckets.flatMap(b=>grain==='week'&&weeks.has(b.key)?[{...b,kind:'week'},...groups(b.indices,'day').map(d=>({...d,kind:'child'}))]:[{...b,kind:grain}]);
 useEffect(()=>{document.documentElement.style.setProperty('--brand',t.primaryColor);document.body.dataset.density=t.density},[t]);
 useEffect(()=>{
  if(!valid)return;
  const chart=echarts.init(ref.current);
  chart.setOption({animation:false,grid:{left:52,right:24,top:18,bottom:48},tooltip:{trigger:'axis',valueFormatter:fmt},xAxis:{type:'category',data:buckets.map(b=>grain==='week'?`${b.label}\n${short(dates[b.indices[0]])}–${short(dates[b.indices.at(-1)])}`:b.label),axisTick:{show:false},axisLine:{lineStyle:{color:'#D8E7E4'}},axisLabel:{color:'#68808A',interval:'auto'}},yAxis:{type:'value',min:0,splitLine:{lineStyle:{color:'#E6EEEB',type:'dashed'}},axisLabel:{color:'#68808A'}},series:[{name:nodes[focus].name,type:grain==='week'?'bar':'line',data:buckets.map(b=>sum(nodes[focus].values,b.indices)),barMaxWidth:76,symbolSize:7,lineStyle:{width:2.5},itemStyle:{color:t.primaryColor},areaStyle:grain==='day'?{opacity:.05}:undefined}]});
  chart.on('click',p=>setDetail({id:focus,bucket:buckets[p.dataIndex]}));
  const resize=()=>chart.resize();window.addEventListener('resize',resize);return()=>{chart.dispose();window.removeEventListener('resize',resize)};
 },[buckets,focus,grain,valid,t.primaryColor]);
 useEffect(()=>{const handler=e=>{if(e.key==='Escape')setDetail(null)};window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler)},[]);
 useEffect(()=>{if(detail)document.querySelector('.drawer .close')?.focus()},[detail]);
 function range(n){setStart(dates[Math.max(0,dates.length-n)]);setEnd(dates.at(-1));setWeeks(new Set());setDetail(null)}
 function exportCSV(){const rows=[['分类','区间合计',...columns.map(b=>b.kind==='week'?`${b.label} ${short(dates[b.indices[0]])}-${short(dates[b.indices.at(-1)])} 合计`:b.label)],...visible.map(r=>[r.name,sum(r.values,indices),...columns.map(b=>sum(r.values,b.indices))])];const blob=new Blob(['\uFEFF'+rows.map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`分类${grain==='day'?'日报':'周报'}-${start}-${end}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setMessage('已导出当前可见分类和时间列')}
 return <div>
 <header><div className="brand"><b>UG</b><div><strong>用增数据看板</strong><small>注册归因 · 分类与时间分析</small></div></div><span className="badge">交互设计稿 · 演示数据</span></header>
 <main><div className="intro"><div><span className="eyebrow">分类分析</span><h1>每天的变化，每周的结果</h1><p>沿着注册归属、用增渠道和具体来源，查看同一时间段的贡献。</p></div><button onClick={exportCSV} disabled={!valid}>导出当前表格 ↓</button></div>
 <section className="filters"><div className="range"><label>日期范围 <input aria-label="开始日期" type="date" min={dates[0]} max={dates.at(-1)} value={start} onChange={e=>{setStart(e.target.value);setDetail(null)}}/></label><span>至</span><input aria-label="结束日期" type="date" min={dates[0]} max={dates.at(-1)} value={end} onChange={e=>{setEnd(e.target.value);setDetail(null)}}/><button onClick={()=>range(7)}>最近 7 天</button><button onClick={()=>{setStart("2026-07-01");setEnd("2026-07-30");setDetail(null)}}>7月1—30日</button><button onClick={()=>{setStart("2026-08-01");setEnd("2026-08-31");setDetail(null)}}>8月</button><button onClick={()=>{setStart("2026-09-01");setEnd(dates.at(-1));setDetail(null)}}>本月</button><button onClick={()=>range(dates.length)}>全部日期</button></div><div className="granularity"><span>展示粒度</span><div className="segmented">{[['day','按日'],['week','按周']].map(([id,label])=><button key={id} aria-pressed={grain===id} className={grain===id?'active':''} onClick={()=>{setGrain(id);setDetail(null)}}>{label}</button>)}</div></div></section>
 <div className="range-note">数据范围：2026/07/01—09/10 · 北京时间 · {grain==='day'?'每日一列，连续展示所选日期':'周一至周日；周序号按所选区间排列，首尾不足一周仅汇总已选日期'}</div>
 {!valid?<section className="empty" role="alert">请选择有效日期范围，开始日期不能晚于结束日期。数据覆盖 7 月 1 日至 9 月 10 日。</section>:<>
 <section className="chart-panel"><div className="section-head"><div><h2>{nodes[focus].name} <span> / {grain==='day'?'每日趋势':'每周合计'}</span></h2><p>{short(start)}—{short(end)} · {indices.length} 天 · 点击图中数据查看明细</p></div><div className="metric"><span>区间合计</span><strong>{fmt(sum(nodes[focus].values,indices))}<small> 人</small></strong></div></div><div ref={ref} className="chart"></div></section>
 <section className="table-panel"><div className="section-head"><div><h2>分类{grain==='day'?'日报':'周报'}</h2><p>{grain==='day'?'逐日看数量，点击数字查看当天构成':'每周合计 = 所选周内每天之和；点击周标题展开每日数据'}</p></div><div className="actions"><button onClick={()=>setExpanded(new Set(['all','growth',...nodes.growth.children]))}>展开所有分类</button><button onClick={()=>setExpanded(new Set(['all']))}>收起分类</button></div></div>
 <div className="table-scroll"><table><thead><tr><th className="name-cell">分类 / 点击名称联动趋势</th><th className="total-cell">区间合计<small>{indices.length} 天</small></th>{columns.map(b=><th key={b.key+'-'+b.kind} className={b.kind==='child'?'child-head':''}>{b.kind==='week'?<button className="week-toggle" aria-expanded={weeks.has(b.key)} onClick={()=>toggle(setWeeks,weeks,b.key)}>{weeks.has(b.key)?'−':'＋'} {b.label}<small>{short(dates[b.indices[0]])}—{short(dates[b.indices.at(-1)])}</small><em>{b.partial?`不足一周 · ${b.indices.length} 天`:'完整周 · 7 天'}</em></button>:<>{b.label}<small>周{'日一二三四五六'[new Date(b.key+'T00:00:00Z').getUTCDay()]}</small></>}</th>)}</tr></thead>
 <tbody>{visible.map(r=><tr key={r.id} className={`${focus===r.id?'selected':''} ${r.depth===0?'root-row':''}`}><th className="name-cell"><div style={{paddingLeft:r.depth*17}}>{r.children.length?<button className="expand" aria-label={`${expanded.has(r.id)?'收起':'展开'}${r.name}`} aria-expanded={expanded.has(r.id)} onClick={()=>toggle(setExpanded,expanded,r.id)}>{expanded.has(r.id)?'⌄':'›'}</button>:<span className="leaf"></span>}<button className="row-name" onClick={()=>setFocus(r.id)}>{r.name}</button>{r.simulated?<small className="split-label">模拟</small>:null}</div></th><td className="total-cell"><button onClick={()=>setDetail({id:r.id,bucket:{label:'所选区间',indices}})}>{fmt(sum(r.values,indices))}</button></td>{columns.map(b=><td className={b.kind==='child'?'child-data':''} key={b.key+'-'+b.kind}><button onClick={()=>setDetail({id:r.id,bucket:b})}>{fmt(sum(r.values,b.indices))}</button></td>)}</tr>)}</tbody></table></div>
 <div className="table-foot"><span>固定分类和区间合计，左右滑动查看全部日期</span><span>{grain==='week'?'展开的每日列是周合计的明细，不重复计入区间合计':'单位：人 · 数量按注册日期求和'}</span></div></section>
 <TrafficModule indices={indices} buckets={buckets} grain={grain} primaryColor={t.primaryColor}/>
 <div className="notes"><strong>统计口径</strong><p>上方分类及下方访问与转化报告共用同一日期范围和日／周粒度。注册数量使用同一份模拟每日数据，渠道与具体来源为模拟拆分；附件四周的核心指标作为周基准，按日分配不代表真实每日记录。</p></div>
 </>}
 <div role="status" className="status">{message}</div><footer>参考 <a href="https://www.metabase.com/docs/latest/dashboards/filters" target="_blank" rel="noreferrer">Metabase 时间分组</a> 与 <a href="https://www.metabase.com/docs/latest/questions/visualizations/drill-through" target="_blank" rel="noreferrer">点击下钻</a> · 模拟数据截至 2026/09/10</footer></main>
 {detail?<div className="overlay" onClick={()=>setDetail(null)}><section className="drawer" role="dialog" aria-modal="true" aria-label="数据明细" onClick={e=>e.stopPropagation()} onKeyDown={e=>{if(e.key==='Tab'){const a=[...e.currentTarget.querySelectorAll('button,a,input')];if(e.shiftKey&&document.activeElement===a[0]){e.preventDefault();a.at(-1).focus()}else if(!e.shiftKey&&document.activeElement===a.at(-1)){e.preventDefault();a[0].focus()}}}}><button className="close" aria-label="关闭明细" onClick={()=>setDetail(null)}>×</button><span className="eyebrow">{detail.bucket.indices.length===1?'当日明细':'时间明细'}</span><h2>{nodes[detail.id].name}</h2><p>{short(dates[detail.bucket.indices[0]])}—{short(dates[detail.bucket.indices.at(-1)])} · {detail.bucket.indices.length} 天</p><div className="drawer-total">{fmt(sum(nodes[detail.id].values,detail.bucket.indices))}<small> 人</small></div><h3>{detail.bucket.indices.length===1?'分类构成':'每天的数据'}</h3>{detail.bucket.indices.length>1?detail.bucket.indices.map(i=><button className="detail-row" key={i} onClick={()=>setDetail({id:detail.id,bucket:{label:short(dates[i]),indices:[i]}})}><span>{short(dates[i])}</span><b>{fmt(nodes[detail.id].values[i])}　›</b></button>):nodes[detail.id].children.length?nodes[detail.id].children.map(id=><button className="detail-row" key={id} onClick={()=>{setFocus(id);setDetail({id,bucket:detail.bucket})}}><span>{nodes[id].name}{nodes[id].simulated?' · 模拟':''}</span><b>{fmt(sum(nodes[id].values,detail.bucket.indices))}　›</b></button>):<p className="drawer-note">已到最细分类。{nodes[detail.id].simulated?'具体来源每日值为模拟分配。':'当前没有更细来源数据。'}</p>}<button className="primary" onClick={()=>{setFocus(detail.id);setDetail(null)}}>在趋势图中查看这个分类</button></section></div>:null}
 <button className="style-button" onClick={()=>window.postMessage({type:'miaoda:tweaks:activate'},'*')}>外观</button><TweaksPanel title="外观"><TweakColor label="主色" value={t.primaryColor} options={['#159A8C','#3B82D0','#6F69C9']} onChange={v=>setTweak('primaryColor',v)}/><TweakRadio label="表格密度" value={t.density} options={['compact','regular','comfy']} onChange={v=>setTweak('density',v)}/></TweaksPanel>
 </div>
}
Object.assign(window,{dates,nodes,fmt,short,groups});
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
