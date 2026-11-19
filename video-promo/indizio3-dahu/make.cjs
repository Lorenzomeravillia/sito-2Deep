/* The 3rd clue promo (the Dahu), recorded inside Skanoid in its ska-reggae version, with the song set up in the BRANO panel.
   node make.cjs probe                 the song as the game reads it (layers, bars, off-beats)
   node make.cjs search 1-40           pass 1 only, for many seeds: when the last brick falls, how many balls are left
   SEED=n node make.cjs preview 1,5,9  pass 1, then selected frames of pass 2 in out/
   SEED=n node make.cjs                the whole video: out/v.mp4 and out/h.mp4 (no sound) + out/audio.s16, then mux.py
   The game runs on fixed ticks of 1/120 s: pass 1 finds the tick of the last brick, pass 2 replays the very same game and
   slows the picture around it (one tick per frame instead of four). The song and the sounds are rendered offline on the
   video's clock. */
const {chromium}=require('playwright'),fs=require('fs'),{spawn,execFileSync}=require('child_process');
const path=require('path'),D=__dirname+'/',REPO=path.resolve(__dirname,'../..')+'/',OUT=D+'out/';fs.mkdirSync(OUT,{recursive:true});fs.mkdirSync(D+'build',{recursive:true});
const MODE=process.argv[2]||'full',ARG=process.argv[3]||'';
const b64=f=>fs.readFileSync(f).toString('base64');
const EVENTO='f93c1503-53ec-42f1-83e0-1d42d595c403';/* Al Cantonet, Feltre, Saturday 21 November 2026 at 21:00 */
const SONGOFF=+(process.env.SONGOFF||0),AUDT=30;

function buildPage(){
  execFileSync('python3',[REPO+'skanoid/build.py','--artifact',D+'build','--musica','ska','--evento',EVENTO],{stdio:'ignore'});
  let html=fs.readFileSync(D+'build/skanoid_page.html','utf8');
  const rep=(a,b)=>{const n=html.split(a).length-1;if(n!==1)throw new Error('patch found '+n+' times: '+a.slice(0,70));html=html.replace(a,()=>b);};
  const cfg=fs.readFileSync(process.env.SONGCFG||D+'song_cfg.json','utf8');
  rep('window.__SITE_DATA={};','window.__SITE_DATA={song:'+JSON.stringify(cfg)+'};');
  rep('AC=new (window.AudioContext||window.webkitAudioContext)();','AC=window.__OFF||new (window.AudioContext||window.webkitAudioContext)();');
  rep('SX.sfxBus.gain.value=0.8;','SX.sfxBus.gain.value=window.__SFXG||0.8;');
  /* the song starts where the video wants it, on a bar line */
  rep('SONG_T0=AC.currentTime;','SONG_T0=AC.currentTime-(window.__SONGOFF||0)/SONG_RATE;');
  rep('LAYERS=-1;MSRC.start();','LAYERS=-1;MSRC.start(0,window.__SONGOFF||0);');
  /* for a promo: no song title on the screen, no wall clicks with ten balls, a soft flash at the win instead of a white one,
     no "tap for level 2" texts and no game zoom at the win (the video moves its own camera) */
  rep("function hudLabel(){return SONG&&SONG.name?up(SONG.name):'';}","function hudLabel(){return '';}");
  rep('function wallNote(){if(SX)','function wallNote(){if(false&&SX)');
  rep('zoom.t=t;flash=1;balls=[];','zoom.t=t;flash=0.3;balls=[];');
  rep('for(let i=0;i<5;i++)setTimeout(()=>{','for(let i=0;i<5;i++)window.__later(()=>{');
  rep('if(LAB&&balls[0]&&balls[0].vol)','if(false&&balls[0]&&balls[0].vol)');
  rep("let zk=1;if(st==='win'){","let zk=1;if(st==='win'&&!window.__NOZOOM){");
  rep("if(st==='over'||st==='win'){const u=t-stT;","if(st==='over'||(st==='win'&&!window.__NOWINTXT)){const u=t-stT;");
  rep('function frame(now){','window.__MV={update,draw,musicTick,launch,catchCap,clampPaddle,fit,layoutSign,bakeSign,bakeBricks,checkSign,forecast,audio,startGroove,beatEnv,S,CAPS,BX,BY,BW,BH,COLS,ROWS,W,H,'+
    'get st(){return st;},set st(v){st=v;},get balls(){return balls;},set balls(v){balls=v;},get caps(){return caps;},get paddle(){return paddle;},get slowT(){return slowT;},set slowT(v){slowT=v;},'+
    'get flash(){return flash;},set flash(v){flash=v;},get bricks(){return bricks;},get boss(){return boss;},set boss(v){boss=v;},get bossDone(){return bossDone;},set bossDone(v){bossDone=v;},'+
    'get t(){return t;},get SIGN(){return SIGN;},get lives(){return lives;},set lives(v){lives=v;},get hits(){return hits;},set hits(v){hits=v;},get score(){return score;},set score(v){score=v;},'+
    'get SONG(){return SONG;},get SONGBUF(){return SONGBUF;},get LEV(){return LEV;},get LAYERS(){return LAYERS;},get SONG_RATE(){return SONG_RATE;},alive};\nfunction frame(now){');
  fs.writeFileSync(D+'build/rec.html',html);}

async function openPage(b,seed,setup){
  const p=await b.newPage({viewport:{width:540,height:1100},deviceScaleFactor:3});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});p.errs=errs;
  const ff=[['Fredoka','fredoka-latin-500-normal.woff2','500'],['Fredoka','fredoka-latin-600-normal.woff2','600'],['Fredoka','fredoka-latin-700-normal.woff2','700'],['Tilt Neon','tilt-neon-latin-400-normal.woff2','400']]
    .map(([f,file,w])=>`@font-face{font-family:'${f}';font-weight:${w};src:url(data:font/woff2;base64,${b64(REPO+'video-promo/indizio3/fonts/'+file)}) format('woff2')}`).join('');
  await p.addInitScript(([css,seed])=>{
    let s=seed>>>0;Math.random=()=>{s+=0x6D2B79F5;let x=s;x=Math.imul(x^x>>>15,x|1);x^=x+Math.imul(x^x>>>7,x|61);return((x^x>>>14)>>>0)/4294967296;};
    try{localStorage.clear();}catch(e){}
    const o=window.requestAnimationFrame.bind(window);window.__stopRAF=false;window.requestAnimationFrame=cb=>window.__stopRAF?0:o(cb);
    window.__lq=[];window.__later=(fn,ms)=>window.__lq.push([(window.__gt||0)+ms/1000,fn]);window.__NOZOOM=true;window.__NOWINTXT=true;window.__SFXG=0.5;
    document.addEventListener('DOMContentLoaded',()=>{const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);});},[ff,seed]);
  await p.goto('file://'+D+'build/rec.html');
  await p.waitForFunction(()=>window.__MV&&window.__MV.SONGBUF,null,{timeout:60000});
  await p.evaluate(async([silk,cav,setup])=>{window.__stopRAF=true;await new Promise(r=>setTimeout(r,120));window.__SETUP=setup;
    for(const [n,u,w] of [['Silk','data:font/woff2;base64,'+silk,'400'],['Caveat','data:font/woff2;base64,'+cav,'700']]){const f=new FontFace(n,'url('+u+')',{weight:w});await f.load();document.fonts.add(f);}
    await document.fonts.load('30px "Tilt Neon"');await document.fonts.load('700 16px "Fredoka"');},
    [b64(REPO+'video-promo/libera/silkscreen-400.woff2'),b64(REPO+'assets/giochi/caveat-700.woff2'),setup]);
  await p.addScriptTag({content:fs.readFileSync(D+'vid.js','utf8')});
  return p;}

(async()=>{
  buildPage();
  const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
  if(MODE==='probe'){const p=await openPage(b,7,{});
    const info=await p.evaluate(()=>{const M=__MV,S=M.SONG;const bar=S.barLen;return{name:S.name,len:S.len,barLen:bar,beat:S.beat,rate:M.SONG_RATE,lev:M.LEV.slice(0,12).map(x=>+x.toFixed(3)),nlev:M.LEV.length,
      steps:S.steps.map((s,k)=>({label:s.label,names:s.names,n:s.events.length,perBar:Array.from({length:Math.round(S.len/bar)},(_,i)=>s.events.filter(e=>e.t>=i*bar&&e.t<(i+1)*bar).length)})),
      ev0:S.steps.map(s=>s.events[0])};});
    console.log(JSON.stringify(info,null,1).slice(0,6000));console.log('errs',p.errs.slice(0,5));await b.close();return;}
  const pass1=async seed=>{const p=await openPage(b,seed,{seed});const r=await p.evaluate(()=>VID.pass1());r.errs=p.errs.slice(0,4);await p.close();return r;};
  if(MODE==='search'){const [a,z]=ARG.split('-').map(Number);for(let s=a;s<=z;s++){const r=await pass1(s);console.log(s,JSON.stringify(r));}await b.close();return;}
  const SEED=+(process.env.SEED||1);const r1=await pass1(SEED);console.log('pass1',JSON.stringify(r1));if(r1.winTick==null)throw new Error('no win');
  const PREVIEW=MODE==='preview'||MODE==='still'?ARG.split(',').map(Number):null,STILL=MODE==='still';
  const p=await openPage(b,SEED,{seed:SEED,winTick:r1.winTick,lastXY:r1.lastXY});
  await p.evaluate(([AUDT,OFF])=>{const oac=new OfflineAudioContext(2,44100*AUDT,44100);window.__OAC=oac;window.__vt=0;window.__SONGOFF=OFF;
    window.__OFF=new Proxy(oac,{get(o,q){if(q==='currentTime')return window.__vt;if(q==='state')return 'running';if(q==='resume'||q==='suspend'||q==='close')return ()=>Promise.resolve();const v=o[q];return typeof v==='function'?v.bind(o):v;}});
    VID.start();},[AUDT,SONGOFF]);
  console.log('canvas',await p.evaluate(()=>[document.getElementById('c').width,document.getElementById('c').height]));
  const enc=name=>{const f=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate','30','-c:v','mjpeg','-i','-','-c:v','libx264','-preset','veryfast','-crf','16','-pix_fmt','yuv420p','-r','30',OUT+name+'_tmp.mp4']);f.stderr.on('data',d=>process.stderr.write(d));return f;};
  let fv=null,fh=null;if(!PREVIEW){fv=enc('v');fh=enc('h');}
  const write=(f,buf)=>new Promise(r=>{if(!f.stdin.write(buf))f.stdin.once('drain',r);else r();});
  let n=0,done=false,t=0;
  while(!done&&n<30*25){const tt=n/30,grab=!STILL&&(!PREVIEW||PREVIEW.some(x=>Math.abs(x-tt)<1/60+1e-6));
    const [jv,jh,t1,fin]=await p.evaluate(g=>VID.step(g),grab);t=t1;done=fin;n++;
    if(STILL){if(PREVIEW.some(x=>Math.abs(x-tt)<1/60+1e-6))fs.writeFileSync(OUT+'still_'+tt.toFixed(2)+'.png',Buffer.from(await p.evaluate(x=>VID.still(x),tt),'base64'));if(tt>Math.max(...PREVIEW)+0.05)break;}
    else if(PREVIEW){if(jv){fs.writeFileSync(OUT+'pv_v_'+tt.toFixed(2)+'.jpg',Buffer.from(jv,'base64'));fs.writeFileSync(OUT+'pv_h_'+tt.toFixed(2)+'.jpg',Buffer.from(jh,'base64'));}
      if(tt>Math.max(...PREVIEW)+0.05)break;}
    else{await write(fv,Buffer.from(jv,'base64'));await write(fh,Buffer.from(jh,'base64'));}}
  const info=await p.evaluate(()=>VID.info());info.frames=n;fs.writeFileSync(OUT+'events.json',JSON.stringify(info));
  console.log('frames',n,'t',t.toFixed(2),JSON.stringify(info).slice(0,600));
  if(!PREVIEW){const cl=[fv,fh].map(f=>new Promise(r=>f.on('close',c=>r(c))));fv.stdin.end();fh.stdin.end();const codes=await Promise.all(cl);if(codes.some(c=>c!==0))throw new Error('ffmpeg '+codes);
    fs.renameSync(OUT+'v_tmp.mp4',OUT+'v.mp4');fs.renameSync(OUT+'h_tmp.mp4',OUT+'h.mp4');
    const pcm=await p.evaluate(async DUR=>{const out=await window.__OAC.startRendering(),L=out.getChannelData(0),R=out.getChannelData(1),N=Math.min(L.length,Math.ceil(44100*DUR)),i16=new Int16Array(N*2);
      for(let i=0;i<N;i++){i16[2*i]=Math.max(-1,Math.min(1,L[i]))*32767;i16[2*i+1]=Math.max(-1,Math.min(1,R[i]))*32767;}
      let s='';const u8=new Uint8Array(i16.buffer);for(let i=0;i<u8.length;i+=32768)s+=String.fromCharCode.apply(null,u8.subarray(i,i+32768));return btoa(s);},n/30);
    fs.writeFileSync(OUT+'audio.s16',Buffer.from(pcm,'base64'));}
  console.log('errs',JSON.stringify(p.errs.slice(0,6)));await b.close();})();
