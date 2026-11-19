/* ---- the relaxing version: the Atmosfera button (bottom left) and the music lab in the options ---- */
const MODE='relax';
const RNG=[['mTransT','transT',v=>v.toFixed(1).replace('.',',')+' s'],['mAuto','auto',v=>v+' s'],['mGap','minGap',v=>v+' s'],['mBpm','bpm',v=>v+' bpm'],
  ['mVolPad','volPad',v=>Math.round(v*100)+'%'],['mVolDrum','volDrum',v=>Math.round(v*100)+'%'],['mVolNote','volNote',v=>Math.round(v*100)+'%'],
  ['mCx','melCx',v=>(v<0.05?'lineare':v<0.35?'mossa':v<0.65?'ricca':'libera')+' · '+Math.round(v*100)+'%'],
  ['mDens','dens',v=>Math.round(v*100)+'%',1],['mSwing','swing',v=>Math.round(v*100)+'%',1],['mPump','pump',v=>Math.round(v*100)+'%',1],
  ['mBright','bright',v=>Math.round(v*100)+'%',1,'pad'],['mRev','rev',v=>Math.round(v*100)+'%',1],['mDly','dly',v=>Math.round(v*100)+'%',1],['mChorus','chorus',v=>Math.round(v*100)+'%',1,'full']];
const SEL=[['mTim','tim'],['mTimHi','timHi'],['mDrum','drum']];
function syncMusic(){for(const [id,k,f] of RNG){$(id).value=MS[k];$(id+'V').textContent=f(+MS[k]);}
  $('mPaddle').checked=MS.paddle;$('mEnrich').checked=MS.enrich;$('mAccel').checked=MS.accel;$('mGap').disabled=!MS.paddle;
  document.querySelectorAll('.vgrid input').forEach(c=>c.checked=!!MS.v[c.dataset.v]);
  document.querySelectorAll('[data-mk]').forEach(s=>s.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(MS[s.dataset.mk]===b.dataset.v))));
  for(const [id,k] of SEL)$(id).value=MS[k];
  document.querySelectorAll('#mScenes button').forEach(b=>b.setAttribute('aria-pressed',String(MS.scene===b.dataset.scene)));}
function musicChanged(repad){saveMS();syncMusic();applyVolumes();showMood();if(repad&&AC&&started)setPad(curChord(),AC.currentTime+0.02);}
/* the Atmosfera button: one tap, the next atmosphere from a shuffled bag, so every one comes round before any repeats */
const SCENE_NAMES={'2deep':'2Deep',quiete:'Quiete',brezza:'Brezza',groove:'Groove',bossa:'Bossa',viaggio:'Viaggio',spazio:'Spazio'};let moodBag=[],moodPending=null,riserBar=-1;
/* the label follows the touch at once and blinks while the new atmosphere waits for the next bar; it settles when the music changes */
function showMood(){const id=moodPending||MS.scene;$('moodName').textContent=SCENE_NAMES[id]||'su misura';moodB.classList.toggle('wait',!!moodPending);}
function applyScene(id,T){const sc=SCENES[id];if(!sc)return;Object.assign(MS,JSON.parse(JSON.stringify(sc)));MS.scene=id;pend=null;
  if(AC&&started&&T!=null){/* on the bar: the old pad fades, a chord of the new harmony comes in, the drums switch on the downbeat */
    for(const v of VOICES)if(!v.dead)killVoice(v,T,0.7);
    if(!ending){const c=nextChord();chords.push({t:T,c});if(chords.length>16)chords.shift();lastChangeT=T;setPad(c,T,0.7);}else setPad(curChord(),T,0.7);
    PADF.frequency.setTargetAtTime(padHz(mlevel)+700,T,0.05);PADF.frequency.setTargetAtTime(padHz(ending?4:mlevel),T+0.3,0.8);}
  else repad(true);
  musicChanged(false);}
function applyMoodAt(T){const id=moodPending;moodPending=null;applyScene(id,T);banner('ATMOSFERA '+SCENE_NAMES[id].toUpperCase());}
function queueMood(id){const live=AC&&started&&AC.state==='running';
  if(!live){applyScene(id);banner('ATMOSFERA '+SCENE_NAMES[id].toUpperCase());return;}
  moodPending=id;showMood();
  /* a short noise swell up to the bar where the change lands, so the wait sounds like a lead-in */
  const six=60/bpm()/4,nb=stepN+((16-stepN%16)%16),T1=nextStep+(nb-stepN)*six;
  if(nb!==riserBar&&T1-AC.currentTime>0.35){riserBar=nb;const T0=AC.currentTime+0.02,src=AC.createBufferSource(),f=AC.createBiquadFilter(),gn=AC.createGain();src.buffer=NOISE;src.loop=true;
    f.type='bandpass';f.Q.value=1.4;f.frequency.setValueAtTime(700,T0);f.frequency.exponentialRampToValueAtTime(6500,T1);gn.gain.setValueAtTime(0.0001,T0);gn.gain.exponentialRampToValueAtTime(0.045,T1);gn.gain.exponentialRampToValueAtTime(0.0001,T1+0.09);
    src.connect(f);f.connect(gn);gn.connect(BUS);src.start(T0);src.stop(T1+0.12);}}
function nextMood(){audio();if(AC&&AC.state==='suspended')AC.resume();startGroove();
  const cur=moodPending||MS.scene;let id;do{if(!moodBag.length)moodBag=Object.keys(SCENES).filter(k=>k!==cur).sort(()=>Math.random()-0.5);id=moodBag.shift();}while(id===cur);
  queueMood(id);}
{for(const [id,k,,acc,re] of RNG){$(id).addEventListener('input',e=>{MS[k]=+e.target.value;if(acc)MS.scene='';musicChanged(false);if(re==='pad')repad(false);});
    if(re==='full')$(id).addEventListener('change',()=>repad(true));}
  for(const [id,k] of SEL)$(id).addEventListener('change',e=>{MS[k]=e.target.value;MS.scene='';musicChanged(false);if(k!=='drum')repad(true);});
  document.querySelectorAll('#mScenes button').forEach(b=>b.addEventListener('click',()=>{moodPending=null;applyScene(b.dataset.scene,AC&&started?nextStep:null);}));
  $('mPaddle').addEventListener('change',e=>{MS.paddle=e.target.checked;musicChanged(false);});
  $('mEnrich').addEventListener('change',e=>{MS.enrich=e.target.checked;musicChanged(true);});
  $('mAccel').addEventListener('change',e=>{MS.accel=e.target.checked;musicChanged(false);});
  document.querySelectorAll('.vgrid input').forEach(c=>c.addEventListener('change',()=>{MS.v[c.dataset.v]=c.checked;musicChanged(true);}));
  document.querySelectorAll('[data-mk]').forEach(s=>s.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;MS[s.dataset.mk]=b.dataset.v;MS.scene='';pend=null;musicChanged(false);}));
  $('mReset').addEventListener('click',()=>{MS=JSON.parse(JSON.stringify(MDEF));pend=null;musicChanged(false);repad(true);});
  $('mNow').addEventListener('click',()=>{audio();if(AC&&AC.state==='suspended')AC.resume();startGroove();lastChangeT=-1e9;chordReq=true;});
  $('mCopy').addEventListener('click',()=>{const s=JSON.stringify(MS),ta=$('mCopyTxt');ta.value=s;const done=()=>{$('mCopy').textContent='Copiate';setTimeout(()=>{$('mCopy').textContent='Copia le impostazioni';},1500);};
    try{navigator.clipboard.writeText(s).then(done,()=>{ta.hidden=false;ta.select();});}catch(e){ta.hidden=false;ta.select();}});}
/* what the options say about this music; the BRANO panel belongs to the other version */
$('musicNote').textContent='Ogni mattoncino suona una nota, e le note di un tiro, da un rimbalzo sulla racchetta al successivo, formano una piccola melodia che finisce sulla nota dell\'accordo.';
$('moodNote').textContent=' Il pulsante Atmosfera cambia l\'accompagnamento a ogni tocco.';
$('songBtn').hidden=true;
