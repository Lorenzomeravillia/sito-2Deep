/* node make.cjs [preview t1,t2,...]: the 3rd clue promo, recorded from the breakout game of the site.
   Artifact build (data from libera/site_data.json) + hooks -> every frame stepped by hand -> two intermediate videos
   (vertical and horizontal, overlays included), the music rendered offline from the same run, and events.json
   (bars, progress, win). edit.py then cuts the long run to the final length on bar lines. */
const {chromium}=require('playwright'),fs=require('fs'),{spawn,execFileSync}=require('child_process');
const path=require('path'),D=__dirname+'/',REPO=path.resolve(__dirname,'../..')+'/',OUT=D+'out/';fs.mkdirSync(OUT,{recursive:true});fs.mkdirSync(D+'build',{recursive:true});
const PREVIEW=process.argv[2]==='preview'?process.argv[3].split(',').map(Number):null;
const b64=f=>fs.readFileSync(f).toString('base64');
const CLUE={n:3,img:'brioche',hook:['E A','COLAZIONE?'],hookH:'E A COLAZIONE?',v:['Le brioches','del Cantonet'],h:'Le brioches del Cantonet',sub:'CON CASTAGNE O ZUCCA'};
const SEED=+(process.env.SEED||7),MAXT=110,AUDT=120;
(async()=>{
  execFileSync('python3',[REPO+'skanoid/build.py','--artifact',D+'build'],{stdio:'ignore'});
  let html=fs.readFileSync(D+'build/skanoid_page.html','utf8');
  const rep=(a,b)=>{if(!html.includes(a))throw new Error('patch not found: '+a.slice(0,60));html=html.replace(a,b);};
  rep('AC=new (window.AudioContext||window.webkitAudioContext)();','AC=window.__OFF||new (window.AudioContext||window.webkitAudioContext)();');
  rep('for(let i=0;i<5;i++)setTimeout(()=>{','for(let i=0;i<5;i++)window.__later(()=>{');
  rep('if(LAB&&balls[0]&&balls[0].vol)','if(false&&balls[0]&&balls[0].vol)');
  rep('function schedule(i,T){','function schedule(i,T){if(i%16===0&&window.__bars)window.__bars.push(T);');
  rep('function frame(now){','window.__MV={update,draw,musicTick,launch,catchCap,clampPaddle,fit,layoutSign,bakeSign,audio,startGroove,S,get st(){return st;},get balls(){return balls;},get caps(){return caps;},get paddle(){return paddle;},get slowT(){return slowT;},set slowT(v){slowT=v;},get slowF(){return slowF;},get bricks(){return bricks;},get boss(){return boss;},get bossDone(){return bossDone;},get t(){return t;},get SIGN(){return SIGN;},get lives(){return lives;},set lives(v){lives=v;},alive};\nfunction frame(now){');
  fs.writeFileSync(D+'build/rec.html',html);
  const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
  const p=await b.newPage({viewport:{width:400,height:800},deviceScaleFactor:3});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  const ff=[['Fredoka','fredoka-latin-500-normal.woff2','500'],['Fredoka','fredoka-latin-600-normal.woff2','600'],['Fredoka','fredoka-latin-700-normal.woff2','700'],['Tilt Neon','tilt-neon-latin-400-normal.woff2','400']]
    .map(([f,file,w])=>`@font-face{font-family:'${f}';font-weight:${w};src:url(data:font/woff2;base64,${b64(D+'fonts/'+file)}) format('woff2')}`).join('');
  await p.addInitScript(([css,seed])=>{
    /* a seeded Math.random: the same run every time */
    let s=seed>>>0;Math.random=()=>{s+=0x6D2B79F5;let x=s;x=Math.imul(x^x>>>15,x|1);x^=x+Math.imul(x^x>>>7,x|61);return((x^x>>>14)>>>0)/4294967296;};
    try{localStorage.clear();}catch(e){}
    const o=window.requestAnimationFrame.bind(window);window.__stopRAF=false;window.requestAnimationFrame=cb=>window.__stopRAF?0:o(cb);
    window.__bars=[];window.__lq=[];window.__later=(fn,ms)=>window.__lq.push([(window.__gt||0)+ms/1000,fn]);
    document.addEventListener('DOMContentLoaded',()=>{const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);});},[ff,SEED]);
  await p.goto('file://'+D+'build/rec.html');await p.waitForTimeout(1500);
  await p.evaluate(async([silk,cav,bri,clue,AUDT])=>{window.__CLUE=clue;window.__stopRAF=true;await new Promise(r=>setTimeout(r,100));
    for(const [n,u,w] of [['Silk','data:font/woff2;base64,'+silk,'400'],['Caveat','data:font/woff2;base64,'+cav,'700']]){const f=new FontFace(n,'url('+u+')',{weight:w});await f.load();document.fonts.add(f);}
    await document.fonts.load('30px "Tilt Neon"');await document.fonts.load('700 16px "Fredoka"');
    window.__VIMG={brioche:'data:image/webp;base64,'+bri};
    /* the music goes into an offline context whose clock is the video's */
    const oac=new OfflineAudioContext(2,44100*AUDT,44100);window.__OAC=oac;window.__vt=0;
    window.__OFF=new Proxy(oac,{get(o,q){if(q==='currentTime')return window.__vt;if(q==='state')return 'running';if(q==='resume'||q==='suspend'||q==='close')return ()=>Promise.resolve();const v=o[q];return typeof v==='function'?v.bind(o):v;}});
    const M=__MV;M.S.speed='veloce';M.fit();M.layoutSign();M.bakeSign();M.audio();M.startGroove();},
    [b64(REPO+'video-promo/libera/silkscreen-400.woff2'),b64(REPO+'assets/giochi/caveat-700.woff2'),b64(REPO+'assets/giochi/al-cantonet/brioche-scontornata.webp'),CLUE,AUDT]);
  await p.addScriptTag({content:fs.readFileSync(D+'vid.js','utf8')});await p.waitForTimeout(300);
  console.log('canvas',await p.evaluate(()=>[document.getElementById('c').width,document.getElementById('c').height]));
  const enc=name=>{const f=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate','30','-c:v','mjpeg','-i','-','-c:v','libx264','-preset','veryfast','-crf','16','-pix_fmt','yuv420p','-r','30',OUT+name+'_long.mp4']);f.stderr.on('data',d=>process.stderr.write(d));return f;};
  let fv=null,fh=null;if(!PREVIEW){fv=enc('v');fh=enc('h');}
  const write=(f,buf)=>new Promise(r=>{if(!f.stdin.write(buf))f.stdin.once('drain',r);else r();});
  let n=0,done=false,t=0;const want=!PREVIEW||true;
  while(!done&&n<30*MAXT){const grab=!PREVIEW||PREVIEW.some(x=>Math.abs(x-n/30)<1/60+1e-6);
    const [jv,jh,tt,fin]=await p.evaluate(g=>VID.step(g),grab);t=tt;done=fin;n++;
    if(PREVIEW){if(jv){const k=(n-1)/30;fs.writeFileSync(OUT+'pv_v_'+k.toFixed(2)+'.jpg',Buffer.from(jv,'base64'));fs.writeFileSync(OUT+'pv_h_'+k.toFixed(2)+'.jpg',Buffer.from(jh,'base64'));}
      if(n/30>Math.max(...PREVIEW)+0.1)break;}
    else{await write(fv,Buffer.from(jv,'base64'));await write(fh,Buffer.from(jh,'base64'));}}
  const info=await p.evaluate(()=>VID.ev());info.bars=await p.evaluate(()=>window.__bars);info.frames=n;fs.writeFileSync(OUT+'events.json',JSON.stringify(info));
  console.log('frames',n,'t',t.toFixed(2),JSON.stringify(info.ev),'lost',info.lost);
  if(!PREVIEW){const cl=[fv,fh].map(f=>new Promise(r=>f.on('close',c=>r(c))));fv.stdin.end();fh.stdin.end();const codes=await Promise.all(cl);if(codes.some(c=>c!==0))throw new Error('ffmpeg '+codes);
    const pcm=await p.evaluate(async DUR=>{const out=await window.__OAC.startRendering(),L=out.getChannelData(0),R=out.getChannelData(1),N=Math.min(L.length,Math.ceil(44100*DUR)),i16=new Int16Array(N*2);
      for(let i=0;i<N;i++){i16[2*i]=Math.max(-1,Math.min(1,L[i]))*32767;i16[2*i+1]=Math.max(-1,Math.min(1,R[i]))*32767;}
      let s='';const u8=new Uint8Array(i16.buffer);for(let i=0;i<u8.length;i+=32768)s+=String.fromCharCode.apply(null,u8.subarray(i,i+32768));return btoa(s);},n/30);
    fs.writeFileSync(OUT+'audio_long.s16',Buffer.from(pcm,'base64'));}
  console.log('errs',JSON.stringify(errs.slice(0,6)));await b.close();})();
