/* ---------------- dates editor (shared by the artifact and the 2deep.it admin page) ---------------- */
const d$={panel:$('dpanel'),open:$('openDates'),close:$('dclose'),first:$('dFirst'),levels:$('dLevels'),past:$('dPast'),add:$('dAdd'),apply:$('dApply'),status:$('dStatus'),reset:$('dReset')};
let pendingCfg=null;
/* where applied dates are kept: replaced by the artifact store (claude db) or the site store (2deep.it database) */
let STORE={kind:'local',canAdd:true,async save(){return{ok:true,msg:'Applicato. Sullo schermo vedi le nuove date.'};}};
function syncAria(){cv.setAttribute('aria-label','Animazione in stile videogioco con le prossime date dei 2Deep: '+LV.map(L=>L.soon?'livello '+L.n+' in arrivo':[L.date,L.venue,L.place,L.time].filter(Boolean).join(' ')).join('; ').toLowerCase());}
function setD(s,kind){d$.status.textContent=s;d$.status.classList.toggle('warn',kind==='warn');d$.status.classList.toggle('ok',kind==='ok');}
function inp(id,val,max,ph,label){const i=document.createElement('input');i.className='txt';i.type='text';i.id=id;i.value=val||'';i.maxLength=max;i.placeholder=ph||'';
  i.autocomplete='off';i.spellcheck=false;i.setAttribute('autocapitalize','characters');if(label)i.setAttribute('aria-label',label);return i;}
function fld(label,el){const l=document.createElement('label');l.className='fld';l.append(label,el);return l;}
/* what will happen to each line once it is drawn: 0 fits, 1 drawn smaller, 2 shortened */
function fate(s,boxes){let w=0;for(const[mw,sc]of boxes){const f=fitTxt(s,mw,sc),st=f.step===0?0:f.step>0?1:2;if(st>w)w=st;}return w;}
const SHORT={bar:'BAR AL NEON',borgo:'BORGO COL CASTELLO',baita:'BAITA IN MONTAGNA',locale:'OSTERIA CON INSEGNA',soon:'IN ARRIVO'};
const lv$=(i,k)=>$('l'+i+k);
const lvVals=i=>({date:clean(lv$(i,'date').value),venue:clean(lv$(i,'venue').value),place:clean(lv$(i,'place').value),time:clean(lv$(i,'time').value)});
const lvEmptyIn=v=>!v.date&&!v.venue&&!v.place&&!v.time;
function sceneOf(i){const v=lvVals(i);if(i>0&&lvEmptyIn(v))return 'soon';const s=lv$(i,'scene').value;return s!=='auto'?s:autoScene(v);}
function levelHint(i){
  const v=lvVals(i),time=fmtTime(v.time),out=[];
  const sel=lv$(i,'scene');sel.options[0].textContent='Automatico · '+SCN[autoScene(v)].label;
  if(i>0&&lvEmptyIn(v)){sel.disabled=true;$('l'+i+'fit').textContent=STORE.kind==='site'?'Posto libero: nel video compare la scheda IN ARRIVO. La data si aggiunge nella scheda Date dell’admin.':'Livello libero: nel video compare la scheda IN ARRIVO.';legendUpd(i);return;}
  sel.disabled=false;
  const line=v.place&&time?v.place+' · '+time:v.place+time;
  const chk=(name,s,boxes)=>{const f=fate(s,boxes);if(f===2)out.push(name+' troppo lungo: verrà accorciato.');else if(f===1)out.push(name+' lungo: verrà scritto più piccolo.');};
  chk('Data',v.date,[[BOX.cardDate[0]-Math.max(0,tw('LV'+(CFG.first+i))-19),2],BOX.banDate]);chk('Locale',v.venue,[BOX.cardVenue,BOX.banLine]);chk('Paese',v.place,[BOX.banLine]);chk('Orario',time,[BOX.banLine]);
  if(fate(line,[BOX.cardLine])===2)out.push('Paese e orario insieme non stanno nella scheda: verranno accorciati.');
  if(!v.date||!v.venue)out.push(i===0?'Servono almeno data e locale.':'Servono data e locale, oppure svuota il livello per la scheda IN ARRIVO.');
  $('l'+i+'fit').textContent=out.join(' ');legendUpd(i);
}
function legend(i){const n=Math.max(1,Math.min(96,Math.round(+d$.first.value)||CFG.first))+i;return 'LV '+n+' · '+SHORT[lv$(i,'scene')?sceneOf(i):(LV[i]?LV[i].scene:'locale')];}
function legendUpd(i){const e=$('l'+i+'lg');if(e)e.textContent=legend(i);}
function pastRow(p){
  const row=document.createElement('div');row.className='prow';row._id=p.id||null;
  const di=inp('',p.date,LIM.pdate,'GG MES','Data'),vi=inp('',p.venue,LIM.pvenue,'LOCALE','Locale');
  const sk=document.createElement('label');sk.className='skip';const cb=document.createElement('input');cb.type='checkbox';cb.checked=!p.ok;cb.setAttribute('aria-label','Data saltata');sk.append(cb);
  const rm=document.createElement('button');rm.type='button';rm.className='x sm';rm.textContent='✕';rm.setAttribute('aria-label',STORE.kind==='site'?'Togli questa data dal video':'Rimuovi questa data');
  rm.addEventListener('click',()=>{row.remove();refreshAdd();dDirty();});
  [di,vi].forEach(e=>e.addEventListener('input',dDirty));cb.addEventListener('change',dDirty);
  row.append(di,vi,sk,rm);row._get=()=>{const o={date:di.value,venue:vi.value,ok:!cb.checked};if(row._id)o.id=row._id;return o;};return row;
}
const pastRows=()=>[...d$.past.children].filter(r=>r._get);
function refreshAdd(){d$.add.hidden=!STORE.canAdd;d$.add.disabled=pastRows().length>=LIM.past;if(d$.reset)d$.reset.hidden=!STORE.reset;}
function fillEditor(){
  d$.first.value=CFG.first;d$.levels.textContent='';
  CFG.levels.forEach((l,i)=>{
    const fs=document.createElement('fieldset');fs.className='lvl';fs._id=l.id||null;const lg=document.createElement('legend');lg.id='l'+i+'lg';fs.appendChild(lg);
    const g2=document.createElement('div');g2.className='g2';
    g2.append(fld('Data',inp('l'+i+'date',l.date,LIM.date,'SAB 14 NOV')),fld('Orario',inp('l'+i+'time',l.time,LIM.time,'18:00')));
    const sel=document.createElement('select');sel.id='l'+i+'scene';
    [['auto','Automatico'],...SCENE_KEYS.map(k=>[k,SCN[k].label])].forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;sel.appendChild(o);});
    sel.value=SCENE_KEYS.includes(l.scene)?l.scene:'auto';
    const hint=document.createElement('p');hint.className='fit';hint.id='l'+i+'fit';hint.setAttribute('aria-live','polite');
    fs.append(g2,fld('Locale',inp('l'+i+'venue',l.venue,LIM.venue,'NOME DEL LOCALE')),fld('Paese',inp('l'+i+'place',l.place,LIM.place,'PAESE')),fld('Scenario',sel),hint);
    /* on the site a level is one of the site's dates: an empty slot stays empty until a date is added in the admin */
    if(STORE.kind==='site'&&!l.id)fs.querySelectorAll('input').forEach(e=>{e.disabled=true;e.placeholder='';});
    fs.querySelectorAll('input').forEach(e=>e.addEventListener('input',()=>{levelHint(i);dDirty();}));
    sel.addEventListener('change',()=>{levelHint(i);dDirty();});
    d$.levels.appendChild(fs);levelHint(i);});
  $('dCta').value=CFG.cta;ctaHint();
  d$.past.textContent='';const hd=document.createElement('div');hd.className='prow phead';hd.setAttribute('aria-hidden','true');
  ['Data','Locale','Saltato',''].forEach(t=>{const s=document.createElement('span');s.textContent=t;hd.appendChild(s);});d$.past.appendChild(hd);
  CFG.past.forEach(p=>d$.past.appendChild(pastRow(p)));refreshAdd();
}
function readEditor(){
  return{first:Math.round(+d$.first.value)||CFG.first,
    levels:[0,1,2].map(i=>{const fs=d$.levels.children[i],o={date:lv$(i,'date').value,venue:lv$(i,'venue').value,place:lv$(i,'place').value,time:lv$(i,'time').value,scene:lv$(i,'scene').value};if(fs&&fs._id)o.id=fs._id;return o;}),
    past:pastRows().map(r=>r._get()),cta:$('dCta').value};
}
function dDirty(){setD('Modifiche da applicare.');}
function ctaHint(){const s=clean($('dCta').value)||DEF_CTA,f=Math.max(fate(s,[[204,2]]),fate(s,[[300,2]]));$('dCtaFit').textContent=f===2?'Frase lunga: verrà accorciata.':'';}
$('dCta').addEventListener('input',()=>{ctaHint();dDirty();});
d$.first.addEventListener('input',()=>{[0,1,2].forEach(legendUpd);dDirty();});
d$.add.addEventListener('click',()=>{if(pastRows().length>=LIM.past)return;const r=pastRow({date:'',venue:'',ok:true});d$.past.appendChild(r);refreshAdd();r.querySelector('input').focus();dDirty();});
function adopt(c){setCfg(c);syncAria();if(playing)stop();prepare(curOpts,'Pronto con le nuove date.');}
/* dates arriving from outside (another device, the site) wait while the editor is open or a render runs */
function receiveCfg(c){if(!d$.panel.hidden||exporting){pendingCfg=c;return;}adopt(c);}
function openDates(){if(exporting)return;fillEditor();setD(pendingCfg?'Sono arrivate date nuove: chiudi e riapri per vederle.':'');d$.panel.hidden=false;d$.close.focus();}
function closeDates(){d$.panel.hidden=true;if(pendingCfg){const c=pendingCfg;pendingCfg=null;adopt(c);}d$.open.focus();}
d$.open.addEventListener('click',openDates);
d$.close.addEventListener('click',closeDates);
d$.panel.addEventListener('click',e=>{if(e.target===d$.panel)closeDates();});
addEventListener('keydown',e=>{if(e.key==='Escape'&&!d$.panel.hidden)closeDates();});
d$.apply.addEventListener('click',async()=>{
  const raw=readEditor();
  const bad=raw.levels.findIndex((l,i)=>{const v={date:clean(l.date),venue:clean(l.venue),place:clean(l.place),time:clean(l.time)};return i===0?!(v.date&&v.venue):(!lvEmptyIn(v)&&!(v.date&&v.venue));});
  if(bad>=0){setD(bad===0?'Il primo livello ha bisogno di data e locale.':'Livello '+(bad+1)+': servono data e locale, oppure svuotalo per la scheda IN ARRIVO.','warn');return;}
  pendingCfg=null;adopt(raw);fillEditor();t0=performance.now();
  d$.apply.disabled=true;setD('Applicato, salvo…');
  let r;try{r=await STORE.save(raw);}catch(e){r={ok:false,msg:'Applicato, ma il salvataggio non è riuscito: le date restano finché tieni aperta la pagina.'};}
  d$.apply.disabled=false;setD(r.msg,r.ok?'ok':'warn');
});
if(d$.reset)d$.reset.addEventListener('click',async()=>{if(!STORE.reset)return;d$.reset.disabled=true;setD('Ripristino le date del sito…');
  let r;try{r=await STORE.reset();}catch(e){r={ok:false,msg:'Ripristino non riuscito: riprova tra poco.'};}
  d$.reset.disabled=false;fillEditor();setD(r.msg,r.ok?'ok':'warn');});
syncAria();
HOOK.afterExport=()=>{if(pendingCfg&&d$.panel.hidden){const c=pendingCfg;pendingCfg=null;adopt(c);}};
HOOK.closePanels=()=>{d$.panel.hidden=true;};
