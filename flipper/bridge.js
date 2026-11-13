/* ---- bridge: the site's dates become the levels of the "Prossimi livelli" video and the theme of the pinball table.
   Same rules as the admin's video page (part_store_site.js): next three published dates are the levels, the level number
   is the played dates + 1 (a note with "annullato" marks a date as skipped), the short names saved for the video apply.
   SITE_DATA is a snapshot taken when the page was built; on the site it is read live from the database. ---- */
const SITE_DATA=window.__SITE_DATA||/*SITE_DATA*/null;
const PB_WD=['DOM','LUN','MAR','MER','GIO','VEN','SAB'],PB_MO=['GEN','FEB','MAR','APR','MAG','GIU','LUG','AGO','SET','OTT','NOV','DIC'],PB_SKIP=/annull|rinviat|cancellat|saltat/i;
const pbToday=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
function pbDate(iso,level){const[y,m,d]=iso.split('-').map(Number),wd=PB_WD[new Date(y,m-1,d).getDay()];return level?wd+' '+d+' '+PB_MO[m-1]:String(d).padStart(2,'0')+' '+PB_MO[m-1];}
function pbAuto(events,today){
  const pub=events.filter(e=>e.is_published!==false&&e.event_date).slice().sort((a,b)=>a.event_date<b.event_date?-1:a.event_date>b.event_date?1:String(a.event_time||'').localeCompare(String(b.event_time||'')));
  const fut=pub.filter(e=>e.event_date>=today),past=pub.filter(e=>e.event_date<today),ok=e=>!PB_SKIP.test(e.description||'');
  return{first:past.filter(ok).length+1,
    levels:[0,1,2].map(i=>{const e=fut[i];return e?{id:String(e.id),date:pbDate(e.event_date,true),venue:e.venue||'',place:String(e.city||'').trim(),time:e.event_time?String(e.event_time).slice(0,5):'',scene:'auto',iso:e.event_date,name:e.venue||'',full:(e.venue||'')+', '+String(e.city||'').trim()}:{date:'',venue:'',place:'',time:'',scene:'auto'};}),
    past:past.slice(-LIM.past).map(e=>({id:String(e.id),date:pbDate(e.event_date,false),venue:e.venue||'',ok:ok(e)}))};}
function pbMerge(a,s){const ev=(s&&s.ev)||{},pick=(o,ks)=>{const r={};if(o)ks.forEach(k=>{if(o[k]!==undefined)r[k]=o[k];});return r;};
  return{first:a.first+(Math.round(+(s&&s.firstDelta))||0),
    levels:a.levels.map(l=>({...l,...pick(l.id&&ev[l.id]&&ev[l.id].lv,['date','venue','place','time','scene'])})),
    past:a.past.filter(p=>!(ev[p.id]&&ev[p.id].ps&&ev[p.id].ps.hide)).map(p=>({...p,...pick(ev[p.id]&&ev[p.id].ps,['date','venue','ok'])})),
    cta:s&&typeof s.cta==='string'?s.cta:DEF_CTA};}
{let set={v:1,ev:{}};try{set=JSON.parse(SITE_DATA.settings||'{}')||set;}catch(e){}
  const auto=pbAuto((SITE_DATA&&SITE_DATA.events)||[],pbToday()),cfg=pbMerge(auto,set);setFormat('landscape');setCfg(cfg);
  window.__LVE={render,cv,T,DUR,levels:LV.map((l,i)=>({n:l.n,date:l.date,venue:l.venue,place:l.place,time:l.time,scene:l.scene,soon:l.soon,
    iso:(cfg.levels[i]&&cfg.levels[i].iso)||'',rawTime:(cfg.levels[i]&&cfg.levels[i].time)||'',full:(cfg.levels[i]&&cfg.levels[i].full)||'',name:(cfg.levels[i]&&cfg.levels[i].name)||''}))};}
