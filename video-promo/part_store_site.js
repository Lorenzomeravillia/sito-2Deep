/* ---------------- site store: dates come from the 2deep.it database (td.site_events = the "Date" tab of the admin).
   Changes made here for the video only (shorter names, scene, closing phrase, hidden rows) are saved as overrides
   in td.site_content, section "video", key "settings", keyed by event id: the site's dates stay the single source. ---------------- */
(()=>{
const g$={gate:$('gate'),email:$('gEmail'),pass:$('gPass'),login:$('gLogin'),status:$('gStatus'),src:$('dSource')};
const WD=['DOM','LUN','MAR','MER','GIO','VEN','SAB'],MO=['GEN','FEB','MAR','APR','MAG','GIU','LUG','AGO','SET','OTT','NOV','DIC'];
const SKIP_RE=/annull|rinviat|cancellat|saltat/i;
const isoToday=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
/* "2026-11-14" -> "SAB 14 NOV" for levels, "14 NOV" (two-digit day) for the history table */
function evDate(iso,level){const[y,m,d]=iso.split('-').map(Number),wd=WD[new Date(y,m-1,d).getDay()];return level?wd+' '+d+' '+MO[m-1]:String(d).padStart(2,'0')+' '+MO[m-1];}
let sb=null,AUTO=null,SET={v:1,ev:{}};
/* what the video shows straight from the site: next three published dates, last past dates, level = played dates + 1 */
function siteAuto(events,today){
  const pub=events.filter(e=>e.is_published!==false&&e.event_date).slice().sort((a,b)=>a.event_date<b.event_date?-1:a.event_date>b.event_date?1:String(a.event_time||'').localeCompare(String(b.event_time||'')));
  const fut=pub.filter(e=>e.event_date>=today),past=pub.filter(e=>e.event_date<today),ok=e=>!SKIP_RE.test(e.description||'');
  return{first:past.filter(ok).length+1,nFut:fut.length,nPast:past.length,
    levels:[0,1,2].map(i=>{const e=fut[i];return e?{id:String(e.id),date:evDate(e.event_date,true),venue:e.venue||'',place:String(e.city||'').trim(),time:e.event_time?String(e.event_time).slice(0,5):'',scene:'auto'}:{date:'',venue:'',place:'',time:'',scene:'auto'};}),
    past:past.slice(-LIM.past).map(e=>({id:String(e.id),date:evDate(e.event_date,false),venue:e.venue||'',ok:ok(e)}))};
}
const pick=(o,ks)=>{const r={};if(o)ks.forEach(k=>{if(o[k]!==undefined)r[k]=o[k];});return r;};
function merge(a,s){const ev=s.ev||{};
  return{first:a.first+(Math.round(+s.firstDelta)||0),
    levels:a.levels.map(l=>({...l,...pick(l.id&&ev[l.id]&&ev[l.id].lv,['date','venue','place','time','scene'])})),
    past:a.past.filter(p=>!(ev[p.id]&&ev[p.id].ps&&ev[p.id].ps.hide)).map(p=>({...p,...pick(ev[p.id]&&ev[p.id].ps,['date','venue','ok'])})),
    cta:typeof s.cta==='string'?s.cta:DEF_CTA};}
function diff(a,raw){
  const s={v:1,ev:{}},same=(x,y)=>clean(x)===clean(y),put=(id,g,k,v)=>{const e=s.ev[id]=s.ev[id]||{};(e[g]=e[g]||{})[k]=v;};
  if(raw.first!==a.first)s.firstDelta=raw.first-a.first;
  raw.levels.forEach(l=>{const b=l.id&&a.levels.find(x=>x.id===l.id);if(!b)return;
    ['date','venue','place','time'].forEach(k=>{if(!same(l[k],b[k]))put(l.id,'lv',k,clean(l[k]));});
    if(SCENE_KEYS.includes(l.scene))put(l.id,'lv','scene',l.scene);});
  a.past.forEach(b=>{const r=raw.past.find(x=>x.id===b.id);if(!r){put(b.id,'ps','hide',true);return;}
    if(!same(r.date,b.date))put(b.id,'ps','date',clean(r.date));if(!same(r.venue,b.venue))put(b.id,'ps','venue',clean(r.venue));if(r.ok!==b.ok)put(b.id,'ps','ok',r.ok);});
  if(clean(raw.cta)!==DEF_CTA)s.cta=clean(raw.cta);
  /* keep what was set for dates not on screen now (a level that will become history, older history rows) */
  const shown=new Set([...a.levels.map(l=>l.id),...a.past.map(p=>p.id)].filter(Boolean));
  Object.entries(SET.ev||{}).forEach(([id,v])=>{if(shown.has(id))return;s.ev[id]=v;});
  /* a level renamed now stays renamed once it becomes history, unless the history row says otherwise */
  a.levels.forEach(l=>{const e=s.ev[l.id];if(e&&e.lv&&e.lv.venue&&!(e.ps&&e.ps.venue))put(l.id,'ps','venue',e.lv.venue);});
  return s;}
async function writeSet(s){
  const{error}=await sb.from('site_content').upsert([{section:'video',content_key:'settings',content_value:JSON.stringify(s),content_type:'json',updated_at:new Date().toISOString()}],{onConflict:'section,content_key'});
  if(error)throw error;SET=s;}
function srcNote(){if(!g$.src||!AUTO)return;
  g$.src.textContent=AUTO.nFut?'Dal sito: '+AUTO.nFut+(AUTO.nFut===1?' data futura':' date future')+' e '+AUTO.nPast+' passate. I livelli usano le prime tre date future.':'Nel sito ci sono solo date passate: aggiungi la prossima nella scheda Date dell’admin per creare il video.';}
STORE={kind:'site',canAdd:false,
  async save(raw){if(!AUTO)return{ok:false,msg:'Applicato, ma le date del sito non sono ancora caricate.'};
    try{await writeSet(diff(AUTO,raw));return{ok:true,msg:'Applicato e salvato nel sito: valgono solo per il video.'};}
    catch(e){return{ok:false,msg:'Applicato, ma il salvataggio nel sito non è riuscito ('+((e&&e.message)||e)+'). Le modifiche restano finché tieni aperta la pagina.'};}},
  async reset(){if(!AUTO)return{ok:false,msg:'Le date del sito non sono ancora caricate.'};
    try{await writeSet({v:1,ev:{}});}catch(e){return{ok:false,msg:'Ripristino non riuscito ('+((e&&e.message)||e)+').'};}
    adopt(merge(AUTO,SET));return{ok:true,msg:'Ripristinate le date come sono nel sito.'};}};
async function load(){
  g$.status.textContent='Leggo le date dal sito…';
  const[ev,st]=await Promise.all([
    sb.from('site_events').select('id,event_date,event_time,venue,city,description,is_published').eq('is_published',true).order('event_date',{ascending:true}),
    sb.from('site_content').select('content_value').eq('section','video').eq('content_key','settings').maybeSingle()]);
  if(ev.error)throw ev.error;
  try{SET=st&&st.data&&st.data.content_value?JSON.parse(st.data.content_value):{v:1,ev:{}};if(!SET||typeof SET!=='object')SET={v:1,ev:{}};}catch(e){SET={v:1,ev:{}};}
  AUTO=siteAuto(ev.data||[],isoToday());srcNote();
  g$.gate.hidden=true;
  if(AUTO.nFut)receiveCfg(merge(AUTO,SET));else openDates();
}
function gateMsg(s,warn){g$.status.textContent=s;g$.status.classList.toggle('warn',!!warn);}
async function login(){
  const email=g$.email.value.trim(),pass=g$.pass.value;if(!email||!pass){gateMsg('Inserisci email e password.',true);return;}
  g$.login.disabled=true;gateMsg('Accesso…');
  try{const{error}=await sb.auth.signInWithPassword({email,password:pass});if(error)throw error;await load();}
  catch(e){gateMsg('Accesso non riuscito: '+((e&&e.message)||e),true);}
  finally{g$.login.disabled=false;}}
g$.login.addEventListener('click',login);
[g$.email,g$.pass].forEach(e=>e.addEventListener('keydown',ev=>{if(ev.key==='Enter')login();}));
(async()=>{
  try{if(!window.supabase||!window.SUPABASE_URL)throw new Error('collegamento al sito non disponibile');
    sb=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ADMIN_KEY||window.SUPABASE_ANON_KEY,{db:{schema:'td'}});
    const{data}=await sb.auth.getSession();
    if(data&&data.session)await load();else{gateMsg('');g$.email.focus();}}
  catch(e){gateMsg('Errore: '+((e&&e.message)||e)+'. Ricarica la pagina.',true);}
})();
window.__site={siteAuto,merge,diff,get SET(){return SET;},get AUTO(){return AUTO;}};
})();
