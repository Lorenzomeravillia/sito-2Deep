/* ---------------- BRANO: the band's panel to load a MIDI and choose when each instrument comes in ----------------
   The admin sets it up once; it is saved where STORE keeps it (store_site.js: the site's database; store_artifact.js: the
   claude.ai page's database) and every player hears it. Without admin rights it is saved in this browser only.
   The panel button shows for admins (or with #brano at the end of the address). */
const b64e=ab=>{let s='';const u=new Uint8Array(ab);for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s);};
const b64d=s=>{const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u.buffer;};
const fmtS=s=>{const m=Math.floor(s/60),r=s-m*60;return m+':'+(r<10?'0':'')+r.toFixed(1);};
function songFromCfg(cfg){if(!cfg||!cfg.midi)return null;try{const info=analyzeMidi(parseMidi(b64d(cfg.midi)));return{song:midiSong(cfg,info),info};}catch(e){return null;}}
let CANEDIT=false,SCFG=null;
const $s=id=>document.getElementById(id);
const SPN=$s('song'),SBTN=$s('songBtn'),S={file:$s('sFile'),info:$s('sInfo'),name:$s('sName'),offset:$s('sOffset'),offsetV:$s('sOffsetV'),bars:$s('sBars'),barsV:$s('sBarsV'),
  speed:$s('sSpeed'),speedV:$s('sSpeedV'),transp:$s('sTransp'),tracks:$s('sTracks'),order:$s('sOrder'),play:$s('sPlay'),save:$s('sSave'),def:$s('sDef'),close:$s('sClose'),status:$s('sStatus'),body:$s('sBody')};
for(let k=-12;k<=12;k++){const o=document.createElement('option');o.value=k;o.textContent=(k>0?'+':'')+k;S.transp.appendChild(o);}
const setS=(t,warn)=>{S.status.textContent=t;S.status.classList.toggle('warn',!!warn);};

/* startup: the song read with the dates (site), otherwise this browser's copy, otherwise the 2Deep loop; then the admin rights,
   and on claude.ai the song from the page's database */
/* a saved song carries its MIDI inside (midi, base64) or points to a file on the site (midiUrl) */
async function withMidi(d){if(d&&!d.midi&&d.midiUrl){const r=await fetch(d.midiUrl);if(!r.ok)throw new Error('MIDI '+r.status);return{...d,midi:b64e(await r.arrayBuffer())};}return d;}
async function applySong(d){if(d&&d.none){SCFG=null;useSong(defaultSong());return;}try{d=await withMidi(d);}catch(e){d=null;}
  const r=songFromCfg(d);if(r){SCFG=d;useSong(r.song);}else{SCFG=null;useSong(defaultSong());}}
async function loadSong(){const pre=STORE.preload();let cfg=pre;
  if(cfg===undefined){try{cfg=JSON.parse(localStorage.getItem(SONG_KEY)||'null');}catch(e){cfg=null;}}
  await applySong(cfg);
  try{await STORE.init();CANEDIT=STORE.edit;if(pre===undefined){const d=await STORE.load();if(d!==undefined)await applySong(d);}}catch(e){}}
/* the editor's button: on the start screen only (the end of the game belongs to the players), and only for admins */
function songBtnVisible(){return(CANEDIT||location.hash==='#brano')&&G.state==='title'&&SPN.hidden;}

/* ---- panel state: the MIDI being edited and its settings ---- */
let PINFO=null,PMIDI=null,PCFG=null;
const PV={src:null,gains:[],master:null,buf:null,key:'',level:0,auto:null,job:0,on:false,timer:null,solo:null};
function maxBars(info){return Math.max(1,Math.floor(90/(240/(info.tempo||120))));}
/* names on the display: the track's own name when it means something, otherwise its instrument family;
   names that are web addresses or file notes ("More files") are not names */
const JUNK=/:\/\/|www\.|\.(com|it|net|org)\b|more files|copyright|untitled|^\s*$/i;
const isBass=g=>!g.drum&&(g.inst==='bass'||(g.prog!=null&&g.prog>=32&&g.prog<=39));
function niceLabel(g){if(g.drum)return 'BATTERIA';if(isBass(g))return 'BASSO';if(g.name&&!JUNK.test(g.name))return up(g.name).slice(0,14);return up(g.prog!=null?GMF[g.prog>>3]:'TRACCIA').slice(0,14);}
/* share of notes that start while another note of the same track is still sounding: a sung line is close to 0, chords are high */
function overlap(g){const n=g.notes.slice().sort((a,b)=>a.t0-b.t0);let ov=0,ends=[];for(const x of n){ends=ends.filter(e=>e>x.t0+0.01);if(ends.length)ov++;ends.push(x.t1);}return n.length?ov/n.length:1;}
/* first guess, for the admin to change: drums from the start, bass with the first letter, the busiest accompaniment with the second,
   the melody (one note at a time, middle-high register, the most notes) with the third, everything else in LIVE; under 8 notes, left out */
function autoCfg(info,name){const tracks={},L=info.list,mel=L.filter(g=>!g.drum&&!isBass(g)),VOICE=/voc|voce|voice|canto|melod|lead|sing/i;
  const lead=mel.filter(g=>g.count>=16&&g.avg>=58&&overlap(g)<0.3).sort((a,b)=>(VOICE.test(b.name||'')-VOICE.test(a.name||''))||b.count-a.count)[0]||null;
  const rest=mel.filter(g=>g!==lead&&g.count>=8).sort((a,b)=>b.count-a.count),dr=L.some(g=>g.drum);
  const stepOf=g=>{if(g.count<8)return -1;if(g.drum)return 0;if(isBass(g))return dr?1:0;if(g===lead)return 3;const k=rest.indexOf(g);return dr?(k===0?2:4):(k===0?1:k===1?2:4);};
  const seen={};L.forEach(g=>{let lb=niceLabel(g);seen[lb]=(seen[lb]||0)+1;if(seen[lb]>1)lb=(lb.slice(0,12)+' '+seen[lb]);
    tracks[trackKey(g)]={label:lb,inst:g===lead?'lead':g.inst,oct:0,step:stepOf(g)};});
  const bars=Math.min(16,maxBars(info));
  return{v:1,name:up(name).replace(/\.MIDI?$/,'').replace(/_+/g,' ').replace(/\s+/g,' ').trim().slice(0,24),offset:bestOffset(info,tracks,bars),bars,speed:1,transp:0,tracks};}
/* the loop starts on a beat of the song's grid. First guess: the stretch where every moment (start, three letters, LIVE) has
   something that plays, then the one with the most tracks playing */
const beatLen=info=>60/(info.tempo||120);
const notesIn=(g,off,span)=>{let n=0;for(const x of g.notes)if(x.t0>=off&&x.t0<off+span)n++;return n;};
function bestOffset(info,tracks,bars){const bl=beatLen(info)*4,span=bars*bl;let best=info.first,bs=-1;
  /* score: for each moment, the share of bars in the loop where it plays (so a part that only comes in at the very end counts little) */
  for(let off=info.first;off+span<=info.end+0.01;off+=bl){const bars_=LAYERDEF.map(()=>new Set());let sc=0;
    info.list.forEach(g=>{const c=tracks[trackKey(g)];if(!c||c.step<0)return;let n=0;for(const x of g.notes)if(x.t0>=off&&x.t0<off+span){n++;bars_[c.step].add(Math.floor((x.t0-off)/bl));}if(n>=4)sc+=1000;});
    bars_.forEach(st=>sc+=100000*st.size/bars);if(sc>bs+1){bs=sc;best=off;}}
  return Math.round(best*1000)/1000;}
function renderPanel(){const has=!!PINFO;S.body.hidden=!has;S.save.disabled=!has;S.play.disabled=!has;if(!has){S.info.textContent=SCFG?'':'Nessun brano caricato: suona la musica 2Deep.';return;}
  const bt=beatLen(PINFO);S.name.value=PCFG.name||'';S.offset.min=(PINFO.first%bt).toFixed(3);S.offset.step=bt.toFixed(4);S.offset.max=Math.max(0,PINFO.end-1).toFixed(3);S.offset.value=PCFG.offset;offText();
  S.bars.max=maxBars(PINFO);S.bars.value=PCFG.bars;S.speed.value=Math.round(PCFG.speed*100);S.speedV.textContent=S.speed.value+'%';S.transp.value=PCFG.transp;barsText();
  S.tracks.textContent='';
  PINFO.list.forEach((g,i)=>{const c=PCFG.tracks[trackKey(g)]||(PCFG.tracks[trackKey(g)]={label:up(g.label).slice(0,14),inst:g.inst,oct:0,step:-1});
    const row=document.createElement('div');row.className='strk'+(c.step<0?' off':'');
    const nm=document.createElement('input');nm.value=c.label;nm.maxLength=14;nm.setAttribute('aria-label','Nome sul display per '+g.label);
    const meta=document.createElement('span');meta.className='smeta';meta.textContent=g.label+' · '+g.count+' note · '+(g.drum?'percussioni':(g.prog!=null?GMF[g.prog>>3]:'strumento non indicato'));
    const warn=document.createElement('span');warn.className='swarn';warn.textContent='Nel giro scelto questa traccia non suona.';meta.appendChild(warn);
    const mk_=(opts,val,lab)=>{const s=document.createElement('select');s.setAttribute('aria-label',lab+' per '+g.label);opts.forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;if(String(v)===String(val))o.selected=true;s.appendChild(o);});return s;};
    const st=mk_([...LAYERDEF.map((t,k)=>[k,t]),[-1,'Esclusa: non suona']],c.step,'Quando entra'),si=mk_(INSTRUMENTS,c.inst,'Suono'),so=mk_([[-2,'−2 ott'],[-1,'−1 ott'],[0,'ottava 0'],[1,'+1 ott'],[2,'+2 ott']],c.oct,'Ottava');
    so.disabled=c.inst==='drums';st.className='sstep';
    nm.addEventListener('input',()=>{c.label=up(nm.value).slice(0,14);renderOrder();});
    st.addEventListener('change',()=>{c.step=+st.value;row.classList.toggle('off',c.step<0);renderOrder();markSilent();changed();});
    si.addEventListener('change',()=>{c.inst=si.value;so.disabled=c.inst==='drums';changed();});
    so.addEventListener('change',()=>{c.oct=+so.value;changed();});
    const solo=document.createElement('button');solo.type='button';solo.className='ssolo';solo.dataset.key=trackKey(g);solo.textContent='▶ DA SOLA';solo.setAttribute('aria-label','Ascolta solo '+g.label);
    solo.addEventListener('click',()=>previewSolo(g,false));
    const sel=document.createElement('div');sel.className='ssel';sel.append(st,si,so,solo);row.append(nm,meta,sel);S.tracks.appendChild(row);});
  renderOrder();markSilent();}
/* the running order, also the buttons to hear the song up to a given moment */
function renderOrder(){S.order.textContent='';if(!PINFO)return;
  LAYERK.forEach((k,i)=>{const names=PINFO.list.filter(g=>{const c=PCFG.tracks[trackKey(g)];return c&&c.step===i;}).map(g=>PCFG.tracks[trackKey(g)].label+(silentIn(g)?' (muta nel giro)':''));
    const b=document.createElement('button');b.type='button';b.className='schip'+(PV.on&&PV.level===i?' on':'');b.setAttribute('aria-pressed',String(PV.on&&PV.level===i));
    const h=document.createElement('b');h.textContent=k;const s=document.createElement('span');s.textContent=names.length?names.join(' + '):'—';b.append(h,s);
    b.addEventListener('click',()=>{stopAuto();previewAt(i);});S.order.appendChild(b);});}
function offText(){const b=Math.max(0,Math.round(PCFG.offset/beatLen(PINFO)));S.offsetV.textContent=fmtS(PCFG.offset)+' · battuta '+(Math.floor(b/4)+1)+(b%4?', tempo '+(b%4+1):'');}
/* which tracks have notes inside the chosen loop: a track that is silent there brings nothing in when its moment comes */
function silentIn(g){const span=PCFG.bars*240/(PINFO.tempo||120);return notesIn(g,PCFG.offset,span)===0;}
function markSilent(){S.tracks.querySelectorAll('.strk').forEach((row,i)=>{const g=PINFO.list[i],w=row.querySelector('.swarn');const sil=silentIn(g)&&PCFG.tracks[trackKey(g)].step>=0;w.hidden=!sil;});}
function barsText(){const sec=PCFG.bars*240/(PINFO.tempo||120)/PCFG.speed;S.barsV.textContent=PCFG.bars+' battute · '+fmtS(sec);}

/* ---- listening inside the panel: same render as the game, layers switched on up to the chosen moment ---- */
const pvKey=()=>PMIDI.length+'|'+JSON.stringify({...PCFG,name:''});
async function previewAt(level){PV.level=level;PV.on=true;PV.solo=null;markSolo();renderOrder();initAudio();if(!AC)return;
  const key=pvKey();if(PV.key!==key||!PV.buf){const job=++PV.job;const song=midiSong(PCFG,PINFO);
    if(!song.steps.some(s=>s.events.length)){stopPreview();setS('Nel giro scelto non ci sono note: sposta “Parti da”.',true);return;}
    setS('Preparo l’ascolto…');let buf;try{buf=await renderSong(song);}catch(e){setS('Non riesco a preparare l’audio: '+e.message,true);return;}
    if(job!==PV.job||!PV.on)return;PV.buf=buf;PV.key=key;startPreview();}
  else if(!PV.src)startPreview();
  pvGains();setS('In ascolto fino a «'+LAYERDEF[level].toLowerCase()+'». Tocca un altro momento per confrontare.');}
function startPreview(){stopPreviewSrc();const b=PV.buf;PV.master=AC.createGain();PV.master.gain.value=0.5;PV.master.connect(AC.destination);
  PV.src=AC.createBufferSource();PV.src.buffer=b;PV.src.loop=true;const sp=AC.createChannelSplitter(b.numberOfChannels);PV.src.connect(sp);
  PV.gains=[];for(let k=0;k<b.numberOfChannels;k++){const g=AC.createGain();g.gain.value=0;sp.connect(g,k);g.connect(PV.master);PV.gains.push(g);}PV.src.start();}
function pvGains(){const t=AC.currentTime;PV.gains.forEach((g,k)=>g.gain.setTargetAtTime(k<=PV.level?1:0,t,0.04));S.play.textContent='■ Ferma';}
function stopPreviewSrc(){if(PV.src){try{PV.src.stop();}catch(e){}PV.src.disconnect();}if(PV.master)PV.master.disconnect();PV.src=null;PV.master=null;PV.gains=[];}
function stopAuto(){clearInterval(PV.auto);PV.auto=null;}
/* one track alone, to tell the parts apart (the second tap stops it) */
function markSolo(){S.tracks.querySelectorAll('.ssolo').forEach(b=>{const on=PV.on&&PV.solo===b.dataset.key;b.textContent=on?'■ FERMA':'▶ DA SOLA';b.setAttribute('aria-pressed',String(on));b.classList.toggle('on',on);});}
async function previewSolo(g,again){const k=trackKey(g);if(!again&&PV.on&&PV.solo===k){stopPreview();setS('Ascolto fermato.');return;}
  stopAuto();clearTimeout(PV.timer);const job=++PV.job;PV.on=true;PV.solo=k;markSolo();renderOrder();initAudio();if(!AC)return;
  const c=PCFG.tracks[k],song=midiSong({...PCFG,tracks:{[k]:{...c,step:0}}},PINFO);
  if(!song.steps[0].events.length){stopPreview();setS('«'+c.label+'» non suona nel giro scelto: sposta “Parti da” o allunga il giro.',true);return;}
  setS('Preparo l’ascolto…');let buf;try{buf=await renderSong(song);}catch(e){setS('Non riesco a preparare l’audio: '+e.message,true);return;}
  if(job!==PV.job||!PV.on)return;PV.buf=buf;PV.key='solo:'+k;startPreview();const t=AC.currentTime;PV.gains.forEach(x=>x.gain.setValueAtTime(1,t));S.play.textContent='■ Ferma';
  setS('In ascolto: solo «'+c.label+'».');}
function stopPreview(){stopAuto();clearTimeout(PV.timer);PV.on=false;PV.solo=null;markSolo();PV.job++;stopPreviewSrc();S.play.textContent='▶ Ascolta come cresce';renderOrder();}
/* after a change, the next listen renders again; while listening, it re-renders after a short pause */
function changed(){if(!PV.on)return;clearTimeout(PV.timer);PV.timer=setTimeout(()=>{if(PV.solo){const g=PINFO.list.find(x=>trackKey(x)===PV.solo);if(g)return previewSolo(g,true);}previewAt(PV.level);},500);}
S.play.addEventListener('click',()=>{if(PV.on){stopPreview();setS('Ascolto fermato.');return;}
  previewAt(0);const step=Math.max(6,Math.min(12,(PCFG.bars*240/(PINFO.tempo||120)/PCFG.speed)/2));
  PV.auto=setInterval(()=>{if(!PV.on)return stopAuto();if(PV.level>=LAYERDEF.length-1){stopAuto();return;}previewAt(PV.level+1);},step*1000);});

S.file.addEventListener('change',()=>{const f=S.file.files&&S.file.files[0];if(!f)return;const rd=new FileReader();
  rd.onload=()=>{try{if(rd.result.byteLength>MIDI_MAX)throw new Error('il file supera 150 KB');const info=analyzeMidi(parseMidi(rd.result));
      stopPreview();PINFO=info;PMIDI=b64e(rd.result);PCFG=autoCfg(info,f.name);PV.key='';
      S.info.textContent=f.name+' · '+fmtS(info.end)+' · '+info.list.length+(info.list.length===1?' traccia':' tracce')+' · '+info.tempo+' bpm';renderPanel();
      setS('Ho proposto un ordine: batteria, basso, le altre parti, la melodia per ultima. Cambialo quando vuoi e ascolta.');}
    catch(e){setS('Non riesco a leggere questo file: '+e.message+'.',true);}};
  rd.onerror=()=>setS('Non riesco a leggere questo file.',true);rd.readAsArrayBuffer(f);S.file.value='';});
S.name.addEventListener('input',()=>{if(PCFG)PCFG.name=up(S.name.value).slice(0,24);});
S.offset.addEventListener('input',()=>{PCFG.offset=+S.offset.value;offText();renderOrder();markSilent();changed();});
S.bars.addEventListener('input',()=>{PCFG.bars=+S.bars.value;barsText();renderOrder();markSilent();changed();});
S.speed.addEventListener('input',()=>{PCFG.speed=(+S.speed.value)/100;S.speedV.textContent=S.speed.value+'%';barsText();changed();});
S.transp.addEventListener('change',()=>{PCFG.transp=+S.transp.value;changed();});
S.save.addEventListener('click',async()=>{if(!PINFO)return;stopPreview();const cfg={...PCFG,v:1,midi:PMIDI,savedAt:new Date().toISOString()};delete cfg.midiUrl;
  if(!midiSong(cfg,PINFO).steps.some(s=>s.events.length)){setS('Nel giro scelto non ci sono note: sposta “Parti da” prima di salvare.',true);return;}
  S.save.disabled=true;setS('Salvo…');
  if(STORE.shared()){try{await STORE.save(cfg);try{localStorage.removeItem(SONG_KEY);}catch(e){}setS('Salvato: chi apre il flipper ora sente «'+(cfg.name||'questo brano')+'».');}
    catch(e){S.save.disabled=false;setS('Non sono riuscito a salvarlo per tutti ('+(e.code||e.message)+').',true);return;}}
  else{try{localStorage.setItem(SONG_KEY,JSON.stringify(cfg));setS(STORE.localNote);}catch(e){S.save.disabled=false;setS('Non riesco a salvarlo neanche su questo browser.',true);return;}}
  S.save.disabled=false;SCFG=cfg;useSong(midiSong(cfg,PINFO));});
S.def.addEventListener('click',async()=>{stopPreview();setS('Rimetto la musica 2Deep…');
  try{localStorage.removeItem(SONG_KEY);}catch(e){}
  if(STORE.shared()){try{await STORE.save({v:1,none:true,savedAt:new Date().toISOString()});}catch(e){setS('Non sono riuscito a cambiarla per tutti ('+(e.code||e.message)+').',true);return;}}
  SCFG=null;PINFO=null;PMIDI=null;PCFG=null;useSong(defaultSong());S.info.textContent='';renderPanel();setS('Torna a suonare la musica 2Deep.');});
function openSong(){initAudio();const r=SCFG?songFromCfg(SCFG):null;
  if(r){PINFO=r.info;PMIDI=SCFG.midi;PCFG=JSON.parse(JSON.stringify({...SCFG,midi:undefined}));S.info.textContent=(SCFG.name||'Brano salvato')+' · '+fmtS(PINFO.end)+' · '+PINFO.tempo+' bpm';}
  else{PINFO=null;PMIDI=null;PCFG=null;S.info.textContent='';}
  PV.key='';renderPanel();setS(r?'Il brano salvato. Cambia l’ordine e ascolta, poi salva.':'Scegli un file MIDI per cominciare.');
  MPAUSE=true;setMusicLevel();SPN.hidden=false;SBTN.hidden=true;S.close.focus();}
function closeSong(){stopPreview();SPN.hidden=true;MPAUSE=false;setMusicLevel();}
SBTN.addEventListener('click',openSong);S.close.addEventListener('click',closeSong);
SPN.addEventListener('keydown',e=>{if(e.key==='Escape')closeSong();});
['pointerdown','keydown','keyup'].forEach(t=>SPN.addEventListener(t,e=>e.stopPropagation()));SBTN.addEventListener('pointerdown',e=>e.stopPropagation());
loadSong();
