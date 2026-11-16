/* node make.cjs [preview t1,t2,...]: renders the Libera promo in two formats from the game itself.
   The Libera artifact build (data from libera/site_data.json) + hooks -> frames -> ffmpeg (H.264, 30 fps) + audio rendered offline
   from the game's own song layers and sound effects, loudness -14 LUFS. Output in out/. */
const {chromium}=require('playwright'),fs=require('fs'),{spawn,execFileSync}=require('child_process');
const path=require('path'),D=__dirname+'/',REPO=path.resolve(__dirname,'../..')+'/',OUT=D+'out/';fs.mkdirSync(OUT,{recursive:true});
const PREVIEW=process.argv[2]==='preview'?process.argv[3].split(',').map(Number):null;
const b64=f=>fs.readFileSync(f).toString('base64');
(async()=>{
  /* the page with hooks: sound effects logged with the video time, internals exposed for the offline audio */
  execFileSync('python3',[REPO+'libera/build.py','--artifact',D+'build'],{stdio:'ignore'});
  let html=fs.readFileSync(D+'build/libera_page.html','utf8');
  html=html.replace("function sfx(k,a){if(!AC)return;","function sfx(k,a){if(window.__sfxLog&&!window.__offline)window.__sfxLog.push([window.__vt||0,k,a?JSON.parse(JSON.stringify(a)):null]);if(!AC)return;");
  const i=html.lastIndexOf('\n})();\n</script>');
  html=html.slice(0,i)+"\nwindow.__V={setAC:v=>{AC=v;},getAC:()=>AC,sfx,song:()=>SONGBUF,layers:()=>gameLayers(),POLA,FX,FY,PW,PH};"+html.slice(i);
  fs.writeFileSync(D+'build/rec.html',html);
  const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
  const p=await b.newPage({viewport:{width:302,height:620},deviceScaleFactor:6});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{const o=window.requestAnimationFrame.bind(window);window.__stopRAF=false;window.requestAnimationFrame=cb=>window.__stopRAF?0:o(cb);window.__sfxLog=[];window.__lay=[];});
  await p.goto('file://'+D+'build/rec.html');await p.waitForTimeout(1200);
  await p.mouse.click(151,300);await p.waitForTimeout(1500);
  await p.evaluate(async([silk,cav,cock,gift])=>{window.__stopRAF=true;await new Promise(r=>setTimeout(r,80));
    for(const [n,u] of [['Silk','data:font/woff2;base64,'+silk],['Caveat','data:font/woff2;base64,'+cav]]){const f=new FontFace(n,'url('+u+')',{weight:n==='Caveat'?'700':'400'});await f.load();document.fonts.add(f);}
    window.__VIMG={cocktail:'data:image/webp;base64,'+cock,gift:'data:image/webp;base64,'+gift};window.__sfxLog.length=0;},
    [b64(D+'silkscreen-400.woff2'),
     b64(REPO+'assets/giochi/caveat-700.woff2'),b64(REPO+'assets/giochi/al-cantonet/cocktail-scontornata.webp'),b64(REPO+'assets/giochi/icone/regalo.webp')]);
  await p.addScriptTag({content:fs.readFileSync(D+'vid.js','utf8')});await p.waitForTimeout(300);
  console.log('canvas',await p.evaluate(()=>[document.getElementById('c').width,document.getElementById('c').height]));
  const enc=name=>{const f=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate','30','-c:v','mjpeg','-i','-','-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p','-r','30',OUT+name+'_tmp.mp4']);f.stderr.on('data',d=>process.stderr.write(d));return f;};
  let fv=null,fh=null;if(!PREVIEW){fv=enc('v');fh=enc('h');}
  const write=(f,buf)=>new Promise(r=>{if(!f.stdin.write(buf))f.stdin.once('drain',r);else r();});
  let n=0,done=false,t=0;
  while(!done&&n<30*30){const [jv,jh,tt,fin]=await p.evaluate(()=>VID.step());t=tt;done=fin;n++;
    if(PREVIEW){const hit=PREVIEW.find(x=>Math.abs(x-tt)<1/60+1e-6);if(hit!==undefined){fs.writeFileSync(OUT+'pv_v_'+hit+'.jpg',Buffer.from(jv,'base64'));fs.writeFileSync(OUT+'pv_h_'+hit+'.jpg',Buffer.from(jh,'base64'));}
      if(tt>Math.max(...PREVIEW)+0.1)break;}
    else{await write(fv,Buffer.from(jv,'base64'));await write(fh,Buffer.from(jh,'base64'));}}
  const info=await p.evaluate(()=>VID.ev());console.log('frames',n,'t',t.toFixed(2),JSON.stringify(info.ev),JSON.stringify(info.closes.map(c=>[+c.t.toFixed(2),+c.pct.toFixed(2)])));
  if(!PREVIEW){const cl=[fv,fh].map(f=>new Promise(r=>f.on('close',c=>r(c))));fv.stdin.end();fh.stdin.end();const codes=await Promise.all(cl);if(codes.some(c=>c!==0))throw new Error('ffmpeg '+codes);
    /* the audio: the song's layers as they came in during the run, plus every sound effect at its moment */
    const pcm=await p.evaluate(async DUR=>{const sr=44100,oac=new OfflineAudioContext(2,Math.ceil(sr*DUR),sr),buf=__V.song(),lay=window.__lay;
      const src=oac.createBufferSource();src.buffer=buf;src.loop=true;const sp=oac.createChannelSplitter(buf.numberOfChannels);src.connect(sp);
      const master=oac.createGain();master.gain.value=0.42;master.connect(oac.destination);
      for(let k=0;k<buf.numberOfChannels;k++){const g=oac.createGain();g.gain.setValueAtTime(lay[0]>k?1:0,0);let prev=lay[0];
        lay.forEach((n,f)=>{if(n!==prev){const on=n>k,was=prev>k;if(on!==was)g.gain.setTargetAtTime(on?1:0,f/30,on?0.03:0.25);prev=n;}});sp.connect(g,k);g.connect(master);}
      /* the end: everything fades out over the last second */
      master.gain.setValueAtTime(0.42,DUR-1.2);master.gain.linearRampToValueAtTime(0,DUR);src.start(0);
      const real=__V.getAC();window.__offline=true;
      for(const [T,k,a] of window.__sfxLog){__V.setAC(new Proxy(oac,{get(o,q){if(q==='currentTime')return T;const v=o[q];return typeof v==='function'?v.bind(o):v;}}));try{__V.sfx(k,a);}catch(e){}}
      __V.setAC(real);const out=await oac.startRendering(),L=out.getChannelData(0),R=out.getChannelData(1),i16=new Int16Array(L.length*2);
      for(let i=0;i<L.length;i++){i16[2*i]=Math.max(-1,Math.min(1,L[i]))*32767;i16[2*i+1]=Math.max(-1,Math.min(1,R[i]))*32767;}
      let s='';const u8=new Uint8Array(i16.buffer);for(let i=0;i<u8.length;i+=32768)s+=String.fromCharCode.apply(null,u8.subarray(i,i+32768));return btoa(s);},n/30);
    fs.writeFileSync(OUT+'audio.s16',Buffer.from(pcm,'base64'));
    for(const o of ['v','h']){const name=o==='v'?'2deep_libera_indizio1_verticale.mp4':'2deep_libera_indizio1_orizzontale.mp4';
      execFileSync('ffmpeg',['-y','-loglevel','error','-i',OUT+o+'_tmp.mp4','-f','s16le','-ar','44100','-ac','2','-i',OUT+'audio.s16','-map','0:v','-map','1:a','-c:v','copy','-af','loudnorm=I=-14:TP=-1.5:LRA=11','-ar','44100','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',OUT+'mux_tmp.mp4']);fs.renameSync(OUT+'mux_tmp.mp4',OUT+name);}
    console.log('sfx',await p.evaluate(()=>window.__sfxLog.length));}
  console.log('errs',JSON.stringify(errs));await b.close();})();
