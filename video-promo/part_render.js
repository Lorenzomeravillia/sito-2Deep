/* ---------------- MP4 render in the browser ---------------- */
const MB_URL='https://cdn.jsdelivr.net/npm/mediabunny@1.62.1/dist/bundles/mediabunny.min.mjs';
const AAC_URL='https://cdn.jsdelivr.net/npm/@mediabunny/aac-encoder@1.62.1/dist/bundles/mediabunny-aac-encoder.min.mjs';
const ASR=48000;
const r$={panel:$('rpanel'),open:$('openRender'),close:$('rclose'),audio:$('rAudio'),method:$('rMethod'),start:$('rStart'),prog:$('rProg'),meter:$('rMeter'),fill:$('rFill'),pct:$('rPct'),status:$('rStatus'),save:$('rSave'),cover:$('rCover')};
let MB=null,plan=null,planP=null,job=null,lastVideo=null;
const yieldUI=()=>new Promise(r=>{const c=new MessageChannel();c.port1.onmessage=()=>r();c.port2.postMessage(0);});
const timeout=(p,ms)=>Promise.race([p,new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),ms))]);
const mb=n=>(n/1048576).toFixed(1).replace('.',',')+' MB';
const radio=n=>(document.querySelector('input[name="'+n+'"]:checked')||{}).value;
function setR(s,kind){r$.status.textContent=s;r$.status.classList.toggle('warn',kind==='warn');r$.status.classList.toggle('ok',kind==='ok');}
function setP(p){const v=Math.round(clamp(p)*100);r$.fill.style.width=v+'%';r$.pct.textContent=v+'%';r$.meter.setAttribute('aria-valuenow',v);}
function bigCanvas(){const c=mk(W*5,H*5),x=c.getContext('2d');x.imageSmoothingEnabled=false;return{c,x};}
function frame(x,t){render(t);x.drawImage(cv,0,0,W*5,H*5);}

/* AAC: native encoder first; otherwise Mediabunny's WebAssembly encoder, which needs the import map to find "mediabunny" */
async function loadAac(){
  try{const m=await import(AAC_URL);m.registerAacEncoder();return true;}catch(e){}
  try{const src=(await (await fetch(AAC_URL)).text()).replaceAll('from "mediabunny"','from "'+MB_URL+'"');
    const u=URL.createObjectURL(new Blob([src],{type:'text/javascript'}));const m=await import(u);m.registerAacEncoder();return true;}catch(e){return false;}
}
async function aacWorks(){
  const {Output,Mp4OutputFormat,BufferTarget,AudioSampleSource,AudioSample}=MB;
  const out=new Output({format:new Mp4OutputFormat(),target:new BufferTarget()}),src=new AudioSampleSource({codec:'aac',bitrate:160000});
  out.addAudioTrack(src);await out.start();
  const smp=new AudioSample({data:new Float32Array(ASR/5),format:'f32-planar',numberOfChannels:1,sampleRate:ASR,timestamp:0});await src.add(smp);smp.close();
  await out.finalize();return out.target.buffer.byteLength>0;
}
function realtimeMime(){
  if(typeof MediaRecorder==='undefined'||!HTMLCanvasElement.prototype.captureStream)return null;
  return ['video/mp4;codecs=avc1.640028,mp4a.40.2','video/mp4;codecs=avc1,mp4a.40.2','video/mp4'].find(m=>{try{return MediaRecorder.isTypeSupported(m);}catch(e){return false;}})||null;
}
function probe(){return planP||(planP=(async()=>{
  const rt=realtimeMime();
  if(typeof VideoEncoder==='undefined')return{fast:false,aac:false,rt};
  try{MB=await timeout(import(MB_URL),20000);}catch(e){return{fast:false,aac:false,rt};}
  let avc=false;try{avc=await MB.canEncodeVideo('avc',{width:1080,height:1920,bitrate:12e6});}catch(e){}
  if(!avc)return{fast:false,aac:false,rt};
  let aac=false;try{aac=await MB.canEncodeAudio('aac',{numberOfChannels:1,sampleRate:ASR,bitrate:160000});}catch(e){}
  if(!aac){try{aac=(await timeout(loadAac(),25000))&&(await timeout(aacWorks(),15000));}catch(e){aac=false;}}
  return{fast:true,aac,rt};
})());}
function chooseMethod(){
  if(!plan)return null;const audio=r$.audio.checked;
  if(plan.fast&&(plan.aac||!audio))return 'fast';
  if(plan.rt)return 'rt';
  if(plan.fast)return 'fast-mute';
  return null;
}
function describe(){
  const m=chooseMethod();
  r$.method.textContent=!plan?'Controllo cosa sa fare questo browser…':
    m==='fast'?'Render veloce: il video si crea in pochi secondi, anche più rapido della durata.':
    m==='rt'?'Questo browser registra in tempo reale: servono circa 30 secondi, con la pagina aperta e in primo piano.':
    m==='fast-mute'?'Qui posso creare l’MP4 solo senza audio. Per la versione con musica apri la pagina da Chrome o Safari aggiornati.':
    'Questo browser non riesce a creare un MP4. Apri la pagina da Chrome o Safari aggiornati, o dall’app Claude sul telefono.';
  r$.start.disabled=!m||!!job;
}

async function renderFast(o,onP,job){
  const {Output,Mp4OutputFormat,BufferTarget,CanvasSource,AudioSampleSource,AudioSample}=MB;
  const {c,x}=bigCanvas();
  const out=new Output({format:new Mp4OutputFormat({fastStart:'in-memory'}),target:new BufferTarget()});
  const vs=new CanvasSource(c,{codec:'avc',bitrate:o.bitrate,keyFrameInterval:2,latencyMode:'quality'});
  out.addVideoTrack(vs,{frameRate:o.fps});
  let as=null,pcm=null,aNext=0;
  if(o.audio){setR('Preparo la musica…');pcm=(await renderSoundtrack(o.music,ASR)).getChannelData(0);if(job.cancel)throw new Error('cancel');as=new AudioSampleSource({codec:'aac',bitrate:160000});out.addAudioTrack(as);}
  setR('Creo il video…');
  const addAudio=async k=>{const a=k*ASR,b=Math.min(pcm.length,(k+1)*ASR);if(b<=a)return;const smp=new AudioSample({data:pcm.slice(a,b),format:'f32-planar',numberOfChannels:1,sampleRate:ASR,timestamp:k});try{await as.add(smp);}finally{smp.close();}};
  await out.start();
  const n=Math.round(DUR*o.fps);exporting=true;
  try{
    for(let i=0;i<n;i++){
      if(job.cancel)throw new Error('cancel');
      const t=i/o.fps;
      while(as&&aNext<=t+1&&aNext<DUR){await addAudio(aNext);aNext++;}
      frame(x,t);await vs.add(t,1/o.fps);
      if(i%3===0){onP(i/n);await yieldUI();}
    }
    while(as&&aNext<DUR){await addAudio(aNext);aNext++;}
    onP(1);await out.finalize();
  }catch(e){try{await out.cancel();}catch(_){}throw e;}
  finally{exporting=false;}
  return new Blob([out.target.buffer],{type:'video/mp4'});
}

async function renderRealtime(o,onP,job,ac){
  const {c,x}=bigCanvas();frame(x,0);
  const tracks=[...c.captureStream(o.fps).getVideoTracks()];let src=null;
  if(o.audio&&ac){setR('Preparo la musica…');const buf=await renderSoundtrack(o.music,ac.sampleRate);if(job.cancel)throw new Error('cancel');const dest=ac.createMediaStreamDestination();src=ac.createBufferSource();src.buffer=buf;src.connect(dest);tracks.push(...dest.stream.getAudioTracks());}
  const rec=new MediaRecorder(new MediaStream(tracks),{mimeType:plan.rt,videoBitsPerSecond:o.bitrate,audioBitsPerSecond:160000});
  const chunks=[];rec.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data);};
  const stopped=new Promise(r=>{rec.onstop=r;});
  exporting=true;
  try{
    if(ac&&ac.state!=='running')await ac.resume();
    const clock=()=>ac?ac.currentTime:performance.now()/1000;
    setR('Registro in tempo reale: tieni la pagina aperta e in primo piano…');rec.start(1000);const start=clock()+0.1;if(src)src.start(start);
    await new Promise((res,rej)=>{(function step(){
      if(job.cancel){rej(new Error('cancel'));return;}
      const t=clock()-start;if(t>=DUR){res();return;}
      if(t>=0){frame(x,t);onP(t/DUR);}requestAnimationFrame(step);})();});
    frame(x,DUR-0.001);
  }finally{exporting=false;try{if(rec.state!=='inactive')rec.stop();}catch(e){}}
  await stopped;
  if(job.cancel)throw new Error('cancel');
  return new Blob(chunks,{type:'video/mp4'});
}

async function offer(name,blob){
  let dl=null;try{if(window.claude&&typeof window.claude.use==='function')dl=await window.claude.use('downloads');}catch(e){}
  if(dl){try{await dl.save({filename:name,data:blob});return 'saved';}
    catch(e){const c=e&&e.code;if(c==='declined')return 'declined';if(c==='rate_limited')return 'busy';if(c==='too_large')return 'big';if(c!=='unavailable'&&c!=='not_granted'&&c!=='capability_disabled'&&c!=='capability_removed')return 'error';}}
  /* phones: the share sheet saves straight to Photos ("Salva video") or sends the file to Instagram/WhatsApp */
  if(matchMedia('(pointer:coarse)').matches&&navigator.canShare){try{const f=new File([blob],name,{type:blob.type||'application/octet-stream'});
    if(navigator.canShare({files:[f]})){await navigator.share({files:[f],title:name});return 'shared';}}catch(e){if(e&&e.name==='AbortError')return 'declined';}}
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},10000);return 'saved';
}
const SAVE_MSG={shared:'Fatto: se hai scelto «Salva video» lo trovi in Foto.',saved:'File pronto: lo trovi tra i download o nella finestra di condivisione.',declined:'Salvataggio annullato. Puoi riprovare con il pulsante qui sotto.',busy:'C’è già una richiesta di salvataggio aperta: completala e riprova.',big:'Il file è troppo grande per questa destinazione: prova la qualità Leggera.',error:'Il salvataggio non è riuscito: riprova con il pulsante qui sotto.'};
async function saveVideo(){if(!lastVideo)return;const r=await offer(lastVideo.name,lastVideo.blob);setR(SAVE_MSG[r]||SAVE_MSG.error,r==='saved'||r==='shared'?'ok':'warn');window.__lastSave=r;}

function busyUI(on){
  r$.start.textContent=on?'■ Annulla':'● Avvia render';r$.start.classList.toggle('rec',on);r$.start.classList.toggle('primary',!on);
  r$.prog.hidden=!on&&!lastVideo;r$.close.disabled=on;r$.cover.disabled=on;r$.audio.disabled=on;
  document.querySelectorAll('#rpanel input[type=radio]').forEach(e=>e.disabled=on);
}
r$.start.addEventListener('click',async()=>{
  if(job){job.cancel=true;r$.start.disabled=true;setR('Annullo…');return;}
  const method=chooseMethod();if(!method)return;
  const o={fps:+radio('fps')||30,bitrate:(+radio('q')||12)*1e6,audio:r$.audio.checked&&method!=='fast-mute',music:curOpts};
  let ac=null;
  if(method==='rt'&&o.audio){try{const AC=window.AudioContext||window.webkitAudioContext;ac=new AC({sampleRate:ASR});}catch(e){try{ac=new (window.AudioContext||window.webkitAudioContext)();}catch(_){ac=null;}}}
  if(playing)stop();
  job={cancel:false};lastVideo=null;r$.save.hidden=true;setP(0);busyUI(true);r$.start.disabled=false;
  setR('Preparo…');
  const t1=performance.now();
  try{
    const blob=method==='rt'?await renderRealtime(o,setP,job,ac):await renderFast(o,setP,job);
    const name=VIDEO_NAME+'_'+(isL()?'16x9':'9x16')+(o.fps===60?'_60fps':'')+'.mp4';
    lastVideo={blob,name};window.__lastVideo=blob;
    r$.save.textContent='⬇ Salva MP4 · '+mb(blob.size);r$.save.hidden=false;
    setR('Video pronto in '+Math.round((performance.now()-t1)/1000)+' s · '+mb(blob.size)+(o.audio?'':' · senza audio')+'.','ok');
    job=null;busyUI(false);describe();
    await saveVideo();
  }catch(e){
    const cancelled=e&&e.message==='cancel';
    setR(cancelled?'Render annullato.':'Il render si è interrotto: '+((e&&e.message)||'errore sconosciuto')+'. Riprova; se succede ancora, prova la qualità Leggera o 30 fotogrammi.',cancelled?'':'warn');
    job=null;busyUI(false);describe();setP(0);r$.prog.hidden=true;
  }finally{
    if(ac)try{ac.close();}catch(e){}
    t0=performance.now();
    HOOK.afterExport();
  }
});
r$.save.addEventListener('click',saveVideo);
r$.cover.addEventListener('click',async()=>{
  const {c,x}=bigCanvas();frame(x,COVER_T);
  const blob=await new Promise(r=>c.toBlob(r,'image/png'));if(!blob){setR('Non riesco a creare l’immagine.','warn');return;}
  window.__lastCover=blob;const r=await offer(VIDEO_NAME+'_copertina_'+(isL()?'16x9':'9x16')+'.png',blob);
  setR(r==='saved'||r==='shared'?'Copertina pronta: usala come immagine di copertina del Reel o come post.':SAVE_MSG[r]||SAVE_MSG.error,r==='saved'||r==='shared'?'ok':'warn');
});
r$.audio.addEventListener('change',describe);
function openRender(){
  r$.panel.hidden=false;r$.close.focus();describe();
  if(!plan)probe().then(p=>{plan=p;describe();}).catch(()=>{plan={fast:false,aac:false,rt:realtimeMime()};describe();});
}
function closeRender(){if(job)return;r$.panel.hidden=true;r$.open.focus();}
r$.open.addEventListener('click',openRender);
r$.close.addEventListener('click',closeRender);
r$.panel.addEventListener('click',e=>{if(e.target===r$.panel)closeRender();});
addEventListener('keydown',e=>{if(e.key==='Escape'&&!r$.panel.hidden)closeRender();});
ui.play.addEventListener('click',()=>{HOOK.closePanels();r$.panel.hidden=true;});
/* format switch: the page preview follows the choice, and the choice is remembered on this device */
function applyFmt(f,save){setFormat(f);fit();if(save)try{localStorage.setItem('2deep-fmt',f);}catch(e){}}
document.querySelectorAll('input[name="fmt"]').forEach(r=>r.addEventListener('change',()=>{if(r.checked)applyFmt(r.value,true);}));
try{if(localStorage.getItem('2deep-fmt')==='landscape'){document.querySelector('input[name="fmt"][value="landscape"]').checked=true;applyFmt('landscape',false);}}catch(e){}
window.__probe=()=>probe().then(p=>(plan=p,describe(),p));
window.__setPlan=p=>{plan=p;describe();};
