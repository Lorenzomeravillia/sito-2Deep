/* ---------------- playback + controls ---------------- */
function fit(){const dpr=window.devicePixelRatio||1,vw=innerWidth*dpr,vh=innerHeight*dpr;let s=Math.floor(Math.min(vw/W,vh/H));if(s<1)s=Math.min(vw/W,vh/H);cv.style.width=(W*s/dpr)+'px';cv.style.height=(H*s/dpr)+'px';}
const $=id=>document.getElementById(id);
const au=$('au'),ui={bar:$('bar'),play:$('play'),open:$('openMusic'),panel:$('panel'),close:$('close'),srcDef:$('srcDef'),srcMidi:$('srcMidi'),midiBox:$('midiBox'),file:$('file'),fileInfo:$('fileInfo'),tracks:$('tracks'),offset:$('offset'),offsetV:$('offsetV'),speed:$('speed'),speedV:$('speedV'),transp:$('transp'),loop:$('loop'),sfx:$('sfx'),vol:$('vol'),volV:$('volV'),apply:$('apply'),status:$('status'),pv:$('pv'),pvBtn:$('pvBtn'),pvRow:$('pvRow'),pvSeek:$('pvSeek'),pvTime:$('pvTime')};
if(EXPORT){ui.bar.hidden=true;render(0);return;}
fit();addEventListener('resize',fit);
let t0=performance.now(),playing=false,info=null,busy=false,exporting=false,curOpts={mode:'default',sfx:true,vol:1};
const fmtT=s=>{const m=Math.floor(s/60),r=s-m*60;return m+':'+(r<10?'0':'')+r.toFixed(1);};
for(let k=-12;k<=12;k++){const o=document.createElement('option');o.value=k;o.textContent=(k>0?'+':'')+k;if(k===0)o.selected=true;ui.transp.appendChild(o);}
function setStatus(s,warn){ui.status.textContent=s;ui.status.classList.toggle('warn',!!warn);}
function showBar(v){ui.bar.hidden=!v;}
function stop(){au.pause();playing=false;t0=performance.now();showBar(true);}
/* one rendered soundtrack per settings combination: preview and Applica share it, so applying what you just heard is instant */
let stCache={key:'',uri:''};
const optKey=o=>JSON.stringify(Object.keys(o).sort().map(k=>[k,o[k]]));
async function soundtrackUri(opts){const key=optKey(opts)+'|'+PAST.map(r=>r[2]).join('');if(stCache.key===key)return stCache.uri;const uri='data:audio/wav;base64,'+b64(pcm16(await renderSoundtrack(opts,32000)));stCache={key,uri};return uri;}
async function prepare(opts,label,user){
  const say=user||!previewing;
  busy=true;ui.play.disabled=true;ui.apply.disabled=true;if(say)setStatus('Preparo la musica…');
  try{curOpts=opts;au.src=await soundtrackUri(opts);au.load();ui.play.disabled=false;if(user||!previewing)setStatus(label);}
  catch(e){setStatus('Non sono riuscito a preparare l’audio: '+e.message+'.',true);}
  busy=false;refreshApply();
}
function collect(){
  const base={sfx:ui.sfx.checked,vol:(+ui.vol.value)/100};
  if(ui.srcDef.checked||!info)return{...base,mode:'default'};
  return{...base,mode:'midi',events:midiEvents(info,{offset:+ui.offset.value,speed:(+ui.speed.value)/100,transp:+ui.transp.value,loop:ui.loop.checked})};
}
function refreshApply(){ui.apply.disabled=busy||(ui.srcMidi.checked&&(!info||!info.list.some(g=>g.on)));}
function dirty(){if(!busy)setStatus(previewing?'Aggiorno l’anteprima tra un attimo…':'Modifiche da applicare.');refreshApply();if(previewing){clearTimeout(pvTimer);pvTimer=setTimeout(()=>loadPreview(true),450);}}
/* ---- in-panel preview: plays the panel's current settings without applying them ---- */
let previewing=false,pvTimer=null,pvGen=0,pvKey='',pvDrag=false;
const SILENT='data:audio/wav;base64,'+b64(pcm16({getChannelData:()=>new Float32Array(800),sampleRate:8000}));
function pvUI(){ui.pvBtn.textContent=previewing?'■ Ferma':'▶ Anteprima';ui.pvBtn.classList.toggle('on',previewing);ui.pvBtn.setAttribute('aria-pressed',String(previewing));ui.pvRow.hidden=!previewing;}
function stopPreview(){if(!previewing)return;previewing=false;pvGen++;clearTimeout(pvTimer);ui.pv.pause();ui.pv.muted=false;pvUI();t0=performance.now();}
async function loadPreview(resume){
  if(!previewing)return;
  const o=collect();
  if(o.mode==='midi'&&!o.events.length){setStatus(info&&!info.list.some(g=>g.on)?'Accendi almeno una traccia per sentire l’anteprima.':'Dal punto scelto non ci sono note: sposta “Parti da” più indietro.',true);ui.pv.pause();return;}
  const g=++pvGen,key=optKey(o);setStatus(resume?'Aggiorno l’anteprima…':'Preparo l’anteprima…');
  try{
    const uri=await soundtrackUri(o);if(g!==pvGen||!previewing)return;
    const pos=resume&&pvKey?ui.pv.currentTime:0,same=pvKey===key;
    const go=()=>{if(g!==pvGen||!previewing)return;try{ui.pv.currentTime=Math.min(pos,DUR-0.05);}catch(e){}ui.pv.muted=false;
      const pr=ui.pv.play();if(pr&&pr.catch)pr.catch(()=>{stopPreview();setStatus('Il browser ha bloccato l’audio: premi di nuovo ▶ Anteprima.',true);});};
    if(same&&ui.pv.readyState>=1)go();else{pvKey=key;ui.pv.addEventListener('loadedmetadata',go,{once:true});ui.pv.src=uri;ui.pv.load();}
    setStatus(key===optKey(curOpts)?'Anteprima delle impostazioni già applicate.':'Anteprima in corso. Se ti piace, premi Applica per usarla nel video.');
  }catch(e){if(g===pvGen){stopPreview();setStatus('Non riesco a preparare l’anteprima: '+e.message+'.',true);}}
}
ui.pvBtn.addEventListener('click',()=>{
  if(previewing){stopPreview();setStatus('Anteprima fermata.');return;}
  try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch(e){}
  if(playing)stop();
  if(!pvKey){ui.pv.src=SILENT;}ui.pv.muted=true;const pr=ui.pv.play();if(pr&&pr.catch)pr.catch(()=>{});   /* unlocks audio on iPhone while the tap still counts */
  previewing=true;pvUI();loadPreview(false);
});
ui.pvSeek.max=String(DUR);
ui.pvSeek.addEventListener('pointerdown',()=>{pvDrag=true;});
addEventListener('pointerup',()=>{pvDrag=false;});
ui.pvSeek.addEventListener('input',()=>{const v=+ui.pvSeek.value;ui.pvTime.textContent=fmtT(v);if(previewing&&ui.pv.readyState>=1)try{ui.pv.currentTime=v;}catch(e){}});
function closeMusic(){stopPreview();ui.panel.hidden=true;}
function renderTracks(){
  ui.tracks.textContent='';
  info.list.forEach((g,i)=>{
    const row=document.createElement('div');row.className='trk'+(g.on?'':' off');
    const lab=document.createElement('label');lab.className='tname';const cb=document.createElement('input');cb.type='checkbox';cb.id='trk'+i;cb.checked=g.on;
    const nm=document.createElement('span');nm.textContent=g.label;lab.append(cb,nm);
    const meta=document.createElement('span');meta.className='tmeta';meta.textContent=g.count+' note · '+(g.drum?'percussioni':(g.prog!=null?GMF[g.prog>>3]:'strumento non indicato'));
    const si=document.createElement('select');si.id='inst'+i;si.setAttribute('aria-label','Suono per '+g.label);INSTRUMENTS.forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;if(v===g.inst)o.selected=true;si.appendChild(o);});
    const so=document.createElement('select');so.id='oct'+i;so.setAttribute('aria-label','Ottava per '+g.label);[[-2,'−2 ott'],[-1,'−1 ott'],[0,'ottava 0'],[1,'+1 ott'],[2,'+2 ott']].forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;if(v===g.oct)o.selected=true;so.appendChild(o);});
    so.disabled=g.inst==='drums';
    cb.addEventListener('change',()=>{g.on=cb.checked;row.classList.toggle('off',!g.on);dirty();});
    si.addEventListener('change',()=>{g.inst=si.value;so.disabled=g.inst==='drums';dirty();});
    so.addEventListener('change',()=>{g.oct=+so.value;dirty();});
    row.append(lab,meta,si,so);ui.tracks.appendChild(row);});
}
ui.file.addEventListener('change',()=>{const f=ui.file.files&&ui.file.files[0];if(!f)return;const rd=new FileReader();
  rd.onload=()=>{try{info=analyzeMidi(parseMidi(rd.result));
      ui.fileInfo.textContent=f.name+' · '+fmtT(info.end)+' · '+info.list.length+(info.list.length===1?' traccia':' tracce')+' · '+info.tempo+' bpm';
      ui.offset.max=Math.max(0,Math.floor((info.end-1)*10)/10);ui.offset.value=Math.floor(info.first*10)/10;ui.offsetV.textContent=fmtT(+ui.offset.value);
      renderTracks();ui.srcMidi.checked=true;ui.midiBox.hidden=false;dirty();}
    catch(e){info=null;ui.tracks.textContent='';ui.fileInfo.textContent='Non riesco a leggere questo file: '+e.message+'.';refreshApply();}};
  rd.onerror=()=>{ui.fileInfo.textContent='Non riesco a leggere questo file.';};rd.readAsArrayBuffer(f);});
[ui.srcDef,ui.srcMidi].forEach(r=>r.addEventListener('change',()=>{ui.midiBox.hidden=!ui.srcMidi.checked;dirty();}));
ui.offset.addEventListener('input',()=>{ui.offsetV.textContent=fmtT(+ui.offset.value);dirty();});
ui.speed.addEventListener('input',()=>{ui.speedV.textContent=ui.speed.value+'%';dirty();});
ui.vol.addEventListener('input',()=>{ui.volV.textContent=ui.vol.value+'%';dirty();});
[ui.transp,ui.loop,ui.sfx].forEach(el=>el.addEventListener('change',dirty));
ui.apply.addEventListener('click',()=>{if(playing)stop();const o=collect();
  if(o.mode==='midi'&&!o.events.length){setStatus('Dal punto scelto non ci sono note: sposta “Parti da” più indietro.',true);return;}
  prepare(o,o.mode==='midi'?'Pronto: '+o.events.length+' note dal MIDI su '+String(DUR).replace('.',',')+' s. Premi ▶ Audio.':'Pronto: musica 2Deep originale. Premi ▶ Audio.',true);});
ui.open.addEventListener('click',()=>{ui.panel.hidden=false;ui.close.focus();});
ui.close.addEventListener('click',()=>{closeMusic();ui.open.focus();});
ui.panel.addEventListener('click',e=>{if(e.target===ui.panel)closeMusic();});
addEventListener('keydown',e=>{if(e.key==='Escape'&&!ui.panel.hidden){closeMusic();ui.open.focus();}});
ui.play.addEventListener('click',()=>{closeMusic();try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch(e){}
  au.currentTime=0;const p=au.play();playing=true;showBar(false);
  if(p&&p.catch)p.catch(()=>{playing=false;showBar(true);setStatus('Il browser ha bloccato l’audio: riprova a premere ▶ Audio.',true);});});
cv.addEventListener('click',()=>{if(exporting)return;if(playing)stop();else t0=performance.now();});
prepare({mode:'default',sfx:true,vol:1},'Pronto: musica 2Deep originale.');
(function loop(now){if(!exporting){const pvOn=previewing&&!ui.pv.paused&&ui.pv.readyState>=2,a=pvOn?ui.pv:(playing&&!au.paused&&au.readyState>=2?au:null);
  const t=a?a.currentTime:((now-t0)/1000)%DUR;render(t);
  if(pvOn&&!pvDrag){ui.pvSeek.value=t.toFixed(1);ui.pvTime.textContent=fmtT(t);}}requestAnimationFrame(loop);})(performance.now());

