/* Skanoid, the 2Deep's breakout (Arkanoid with ska in the name): candy-glass bricks over a neon sign with the next gig, music made by the ball.
   window.__GAME_DATA={events:[site_events rows], evento:id|null} comes before; window.__LAB=true shows the music lab. */
window.SKANOID=function(){
/* settings saved under the game's first name are carried over once */
const LS=k=>{try{let v=localStorage.getItem('skanoid_'+k);if(v==null){v=localStorage.getItem('mattoncini_'+k);if(v!=null)localStorage.setItem('skanoid_'+k,v);}return v;}catch(e){return null;}};
"use strict";
const W=270,H=480,TOP=40;
const cv=document.getElementById('c'),g=cv.getContext('2d'),wrap=document.getElementById('wrap'),optB=document.getElementById('opt'),moodB=document.getElementById('mood');
let scale=1,dpr=1,K=1;
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w));c.height=Math.max(1,Math.ceil(h));return c;};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function fit(){const r=wrap.getBoundingClientRect();scale=Math.min(r.width/W,r.height/H);dpr=Math.min(3,window.devicePixelRatio||1);K=scale*dpr;
  cv.style.width=Math.floor(W*scale)+'px';cv.style.height=Math.floor(H*scale)+'px';cv.width=Math.round(W*K);cv.height=Math.round(H*K);bake();}
function placeOpt(){const r=cv.getBoundingClientRect(),w=wrap.getBoundingClientRect();optB.style.left=(r.right-w.left-optB.offsetWidth-8)+'px';optB.style.top=(r.bottom-w.top-optB.offsetHeight-8)+'px';
  moodB.style.left=(r.left-w.left+8)+'px';moodB.style.top=(r.bottom-w.top-moodB.offsetHeight-8)+'px';}

/* ---- settings and record, per viewer ---- */
const SPEED={lenta:150,normale:185,veloce:225},PADW={S:38,M:48,L:60};
let S={speed:'normale',pad:'M',quant:'tempo',tune:432},best=0;
try{Object.assign(S,JSON.parse(LS('opts')||'{}'));best=+LS('best')||0;}catch(e){}
const save=()=>{try{localStorage.setItem('skanoid_opts',JSON.stringify(S));localStorage.setItem('skanoid_best',String(best));}catch(e){}};

/* ---- the gig, from the site's dates: the one in the address, otherwise the next published one that is not cancelled ---- */
const GIG=(function(){const D=window.__GAME_DATA||{},SKIP=/annull|rinviat|cancellat|saltat/i,pad=n=>String(n).padStart(2,'0'),d0=new Date(),
    today=d0.getFullYear()+'-'+pad(d0.getMonth()+1)+'-'+pad(d0.getDate()),ev0=(D.events||[]).filter(e=>e&&e.event_date);
  let ev=D.evento?ev0.find(e=>String(e.id)===String(D.evento)):null;
  if(!ev)ev=ev0.filter(e=>e.is_published!==false&&e.event_date>=today&&!SKIP.test(e.description||''))
    .sort((a,b)=>a.event_date<b.event_date?-1:a.event_date>b.event_date?1:String(a.event_time||'').localeCompare(String(b.event_time||'')))[0]||null;
  if(!ev)return null;const [y,m,d]=ev.event_date.split('-').map(Number),wd=new Date(y,m-1,d).getDay();
  const up=s=>String(s||'').replace(/\s*\(.*?\)\s*/g,' ').trim().toUpperCase();
  return{venue:up(ev.venue),city:up(ev.city),date:['DOM','LUN','MAR','MER','GIO','VEN','SAB'][wd]+' '+d+' '+['GEN','FEB','MAR','APR','MAG','GIU','LUG','AGO','SET','OTT','NOV','DIC'][m-1],
    time:ev.event_time?'ORE '+String(ev.event_time).slice(0,5):'',tbc:/confermar/i.test(ev.description||'')};})();
/* what each level's sign says: the gig first, then the band */
const SIGNS=[
  GIG?[['2DEEP LIVE',15,'#ff5fd2'],[GIG.venue,24,'#ff3d6e'],[GIG.date,30,'#ffd36b'],[[GIG.time,GIG.city].filter(Boolean).join(' · ')+(GIG.tbc?' (DA CONFERMARE)':''),16,'#4fe3ff']]
     :[['2DEEP LIVE',17,'#ff5fd2'],['ACOUSTIC',26,'#ff3d6e'],['SKA & REGGAE',26,'#ffd36b'],['2DEEP.IT',16,'#4fe3ff']],
  [['2DEEP',18,'#ff5fd2'],['DUE VOCI',28,'#ffd36b'],['DUE STRUMENTI',24,'#ff3d6e'],["UN'UNICA PROFONDITÀ",16,'#4fe3ff']],
  [['IL MURO SUONA',16,'#4fe3ff'],['A 432 HZ',32,'#ffd36b'],['ACOUSTIC',22,'#ff5fd2'],['SKA & REGGAE',18,'#ff3d6e']]];

/* =====================================================================================================
   MUSIC: a small song on an 80s home keyboard with 8-bit drums, tuned to A=432 Hz. It is born reggae (half time, the
   one drop: kick and rim together on the third beat) and becomes ska as the wall comes down: at the third threshold
   the groove doubles (the chop on every off-beat, kick and snare taking turns, walking bass). The chords are the flipper's progression (I V vi IV I V IV V), a fourth higher at
   every level. The instruments come in with the sign, each on a bar line after a short drum fill:
   start: drums and the bricks' keyboard / RITMO IN LEVARE: the organ chop / SKA & REGGAE: the bass, and the chop doubles /
   DUE VOCI, DUE STRUMENTI: the switch to ska, the melody in thirds / UN'UNICA PROFONDITÀ: 8-bit arpeggios and dub echo.
   The melody is the bricks': a hit starts a phrase on the next beat, and hits during a phrase ask for the next one (below).
   The tempo holds in the reggae and rises by a fifth from the start of the ska to the end of the wall.
   ===================================================================================================== */
const MDEF={bpm:132,accel:0.2,style:'gioco',melCx:0.3,tone:'organo',volDrum:0.85,volBass:0.6,volKeys:0.9,volLead:1,echo:0.4,rev:0.22};
let MS=JSON.parse(JSON.stringify(MDEF));
try{const o=JSON.parse(LS('music2')||'null');if(o)for(const k in MDEF)if(o[k]!=null&&typeof o[k]===typeof MDEF[k])MS[k]=o[k];}catch(e){}
const saveMS=()=>{try{localStorage.setItem('skanoid_music2',JSON.stringify(MS));}catch(e){}};
/* the keyboard that plays the bricks: five tones, picked with the button at the bottom left */
const TONES={organo:'Organo',piano:'Piano',ottoni:'Ottoni',flauto:'Flauto',chip:'8 bit'},TONE_ORDER=Object.keys(TONES);
if(!TONES[MS.tone])MS.tone='organo';
let AC=null,BUS=null,DRUMG=null,BASSG=null,KEYG=null,LEADG=null,LEADDUB=null,DUB=null,REVG=null,DL=null,NOISE=null,NOISE8=null,METAL=null,ORGANW=null,PULSE={},
  started=false,nextStep=0,stepN=0,ring=[],lastTickT=0,tempoP=0;
let KEY=2;const MAJ=[0,2,4,5,7,9,11],NAMES=['DO','DO#','RE','MIB','MI','FA','FA#','SOL','LAB','LA','SIB','SI'];
const pickW=a=>{let s=0;for(const x of a)s+=x[1];let r=Math.random()*s;for(const x of a){if((r-=x[1])<=0)return x[0];}return a[a.length-1][0];};
const mtof=m=>S.tune*Math.pow(2,(m-69)/12);
const deg=(d,k)=>(KEY+MAJ[(d+k)%7])%12;
const KSC={ion:[0,2,4,5,7,9,11]};
const scaleOf=(r,mode)=>KSC[mode].map(x=>(r+x)%12);
const keyScale=()=>scaleOf(KEY,'ion');
/* a chord from its root and its scale: penta is the scale without the notes a semitone away from the chord, the safe set for simple phrases */
function mkChord(root,scale,o){o=o||{};const rel=scale.map(p=>(p-root+12)%12).sort((a,b)=>a-b),at=k=>(root+rel[k])%12;
  const pcs=[root,at(2),at(4)],maj=rel[2]===4;
  let sc=scale.slice();const rank=p=>pcs.includes(p)?2:0;
  for(let i=0;i<3;i++){const lo=sc.find(p=>sc.includes((p+1)%12));if(lo==null)break;const hi=(lo+1)%12;sc=sc.filter(p=>p!==(rank(lo)<rank(hi)?lo:hi));}
  return{d:o.d==null?-1:o.d,root,maj,pcs,penta:sc,scale:scale.slice(),name:NAMES[root]+(maj?'':'m')};}
const chordOf=d=>mkChord(deg(d,0),keyScale(),{d});
/* the flipper's progression: one chord per bar of ska, one per bar of half-time reggae (twice as long) */
const GIRO=[0,4,5,3,0,4,3,4],giroChord=k=>chordOf(GIRO[((k%8)+8)%8]);
const NLOG=[];let chords=[{t:0,c:chordOf(0)}],ending=false,skaP=null;
const chordAt=T=>{let c=chords[0].c;for(const x of chords)if(x.t<=T+1e-4)c=x.c;return c;};
const curChord=()=>chords[chords.length-1].c;
const wallP=()=>bricks.length?1-alive()/bricks.length:0;
/* the tempo: the start of the level, up to a fifth faster from the start of the ska to the end of the wall (smoothed), a little faster level by level */
const speedFactor=h=>1+Math.min(0.55,(h==null?hits:h)*0.005);/* the ball speeds up with the hits */
const bpm=()=>MS.bpm*(1+MS.accel*tempoP)*(1+0.03*Math.min(4,lvl-1));
function pulseWave(d){const N=40,re=new Float32Array(N+1),im=new Float32Array(N+1);for(let n=1;n<=N;n++)re[n]=Math.sin(Math.PI*n*d)/n;return AC.createPeriodicWave(re,im);}
/* the noise of old consoles: a 15-bit shift register; its short loop gives a metallic buzz */
function lfsr(short,hold){const n=AC.sampleRate,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);let r=1,v=0.8;
  for(let i=0;i<n;i++){if(i%hold===0){const bit=(r^(r>>(short?6:1)))&1;r=(r>>1)|(bit<<14);v=r&1?0.8:-0.8;}d[i]=v;}return b;}
function audio(){if(AC)return;try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return;}
  try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch(e){}
  const comp=AC.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=3;comp.connect(AC.destination);
  BUS=AC.createGain();BUS.gain.value=0.7;BUS.connect(comp);
  const len=Math.round(AC.sampleRate*1.3),ir=AC.createBuffer(2,len,AC.sampleRate);for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3);}
  const rev=AC.createConvolver();rev.buffer=ir;REVG=AC.createGain();REVG.gain.value=MS.rev;rev.connect(REVG);REVG.connect(BUS);
  /* dub echo: a dotted eighth with darker and darker repeats; the drums and the organ are sent to it only at the fourth threshold */
  DL=AC.createDelay(2);DL.delayTime.value=0.34;const fb=AC.createGain();fb.gain.value=0.45;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1800;
  const hp=AC.createBiquadFilter();hp.type='highpass';hp.frequency.value=280;DL.connect(lp);lp.connect(hp);hp.connect(fb);fb.connect(DL);const wet=AC.createGain();wet.gain.value=0.55;hp.connect(wet);wet.connect(BUS);
  DUB=AC.createGain();DUB.gain.value=0;DUB.connect(DL);
  const bus=rv=>{const gn=AC.createGain();gn.connect(BUS);if(rv)gn.connect(rev);return gn;};
  DRUMG=bus(false);BASSG=bus(false);KEYG=bus(true);LEADG=bus(true);LEADDUB=AC.createGain();LEADDUB.gain.value=0;LEADG.connect(LEADDUB);LEADDUB.connect(DL);
  NOISE=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);{const d=NOISE.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
  NOISE8=lfsr(false,3);METAL=lfsr(true,1);
  ORGANW=AC.createPeriodicWave(new Float32Array(9),new Float32Array([0,1,0.55,0.3,0.32,0.08,0.14,0,0.09]));
  PULSE[12]=pulseWave(0.125);PULSE[25]=pulseWave(0.25);PULSE[50]=pulseWave(0.5);
  applyVolumes();}
function applyVolumes(){if(!AC)return;const T=AC.currentTime,set=(p,v)=>p.setTargetAtTime(v,T,0.15),deep=effStage()>=4;
  set(DRUMG.gain,MS.volDrum);set(BASSG.gain,MS.volBass);set(KEYG.gain,MS.volKeys);set(LEADG.gain,MS.volLead);set(REVG.gain,MS.rev);
  set(DUB.gain,deep?MS.echo:0);set(LEADDUB.gain,deep?MS.echo*0.45:0);}
function env(gn,T,a,peak,dec){gn.gain.setValueAtTime(0.0001,T);gn.gain.exponentialRampToValueAtTime(peak,T+a);gn.gain.exponentialRampToValueAtTime(0.0001,T+a+dec);}
function osc(type,f,T,dest,peak,a,dec){const o=AC.createOscillator(),gn=AC.createGain();if(typeof type==='string')o.type=type;else o.setPeriodicWave(type);
  o.frequency.setValueAtTime(f,T);env(gn,T,a,peak,dec);o.connect(gn);gn.connect(dest);o.start(T);o.stop(T+a+dec+0.05);return{o,gn};}
function nz(buf,T,dur,type,freq,q,peak,dest){const s=AC.createBufferSource();s.buffer=buf;const f=AC.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q||1;
  const gn=AC.createGain();env(gn,T,0.001,peak,dur);s.connect(f);f.connect(gn);gn.connect(dest||BUS);s.start(T,Math.random()*0.5);s.stop(T+dur+0.05);return gn;}
function tick(T,v){nz(NOISE8,T,0.015,'bandpass',3500,2,0.04*(v||1),DRUMG);}
function chip(m,T,dur,v,duty){return osc(PULSE[duty||25],mtof(m),T,LEADG,0.07*(v||1),0.002,dur).gn;}

/* ---- the band ---- */
function crash(T){nz(NOISE8,T,1.1,'highpass',4200,0.5,0.15,DRUMG);}
const DR={
  k:(T,v)=>{const o=AC.createOscillator(),gn=AC.createGain();o.type='triangle';o.frequency.setValueAtTime(180,T);o.frequency.exponentialRampToValueAtTime(46,T+0.09);env(gn,T,0.002,0.8*v,0.17);
    o.connect(gn);gn.connect(DRUMG);o.start(T);o.stop(T+0.25);nz(NOISE8,T,0.012,'lowpass',3000,0.7,0.1*v,DRUMG);},
  s:(T,v)=>{nz(NOISE8,T,0.14,'bandpass',2300,0.8,0.34*v,DRUMG).connect(DUB);const o=AC.createOscillator(),og=AC.createGain();o.setPeriodicWave(PULSE[50]);
    o.frequency.setValueAtTime(250,T);o.frequency.exponentialRampToValueAtTime(150,T+0.05);env(og,T,0.001,0.08*v,0.06);o.connect(og);og.connect(DRUMG);o.start(T);o.stop(T+0.1);},
  r:(T,v)=>{nz(METAL,T,0.035,'bandpass',2000,2.2,0.34*v,DRUMG).connect(DUB);osc(PULSE[25],880,T,DRUMG,0.045*v,0.001,0.025);},
  h:(T,v)=>{nz(NOISE8,T,0.028,'highpass',7500,0.7,0.14*v,DRUMG);},
  o:(T,v)=>{nz(NOISE8,T,0.17,'highpass',6800,0.7,0.085*v,DRUMG);}};
/* the grooves: 32 steps are one bar of half-time reggae, 16 one bar of ska. Digits are loudness, '.' is a rest */
const ONEDROP={k:'................9...............',r:'................8...............',h:'4.2.6.2.4.2.6.2.4.2.6.2.4.2.6.2.'};
const BASS_R=[[0,'R',6],[6,'R',2],[12,'3',3],[20,'5',3],[24,'8',3],[28,'A',3]],BASS_S=[[0,'R',3],[4,'3',3],[8,'5',3],[12,'A',3]];
const GROOVE=[
  Object.assign({},ONEDROP),
  Object.assign({skank:[8,24]},ONEDROP),
  Object.assign({o:'..............................4.',skank:[8,10,24,26],skankV:[1,0.5,1,0.5],bass:BASS_R},ONEDROP),
  {k:'9.......8.......',s:'....8.......8...',h:'..6...6...6...6.',skank:[2,6,10,14],bass:BASS_S,two:true},
  {k:'9.......8.......',s:'....8.......8...',h:'2.6.2.6.2.6.2.6.',o:'..............4.',skank:[2,6,10,14],bass:BASS_S,two:true,arp:true}];
const LAYERS=[0.15,0.35,0.55,0.75],LAYERN=['RITMO IN LEVARE','SKA & REGGAE','DUE VOCI, DUE STRUMENTI',"UN'UNICA PROFONDITÀ"];
let stage=0,wantStage=0,changeAt=-1,songStep=0,chordIdx=0,restartNext=null,lastES=-1;
/* what plays: the stage the wall has reached; the full band with the tune when the sign is lit; a quiet reggae after the last life */
const effStage=()=>ending?4:st==='over'?1:stage;
const cycleLen=()=>effStage()>=3?16:32;
function musicLevel(p){let l=0;for(const x of LAYERS)if(p>=x)l++;wantStage=MS.style==='reggae'?2:MS.style==='ska'?4:l;}
function voicing(c){return c.pcs.map(pc=>60+((pc-60)%12+12)%12).sort((a,b)=>a-b);}
function keyStab(c,T,dur,v){for(const m of voicing(c)){const o=AC.createOscillator(),gn=AC.createGain();o.setPeriodicWave(ORGANW);o.frequency.value=mtof(m);
  gn.gain.setValueAtTime(0.0001,T);gn.gain.exponentialRampToValueAtTime(0.08*v,T+0.003);gn.gain.setTargetAtTime(0.0001,T+dur,0.018);o.connect(gn);gn.connect(KEYG);gn.connect(DUB);o.start(T);o.stop(T+dur+0.15);}}
/* the bass: a triangle like the old consoles, with a little pulse wave on top so that a phone speaker hears it too */
function bassNote(m,T,dur,v){const f=mtof(m),gn=AC.createGain(),lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1300;lp.Q.value=0.7;
  const o1=AC.createOscillator();o1.type='triangle';o1.frequency.value=f;const o2=AC.createOscillator();o2.setPeriodicWave(PULSE[25]);o2.frequency.value=f;const g2=AC.createGain();g2.gain.value=0.3;
  o1.connect(gn);o2.connect(g2);g2.connect(gn);gn.connect(lp);lp.connect(BASSG);
  gn.gain.setValueAtTime(0.0001,T);gn.gain.exponentialRampToValueAtTime(0.4*v,T+0.006);gn.gain.setTargetAtTime(0.25*v,T+0.01,0.1);gn.gain.setTargetAtTime(0.0001,T+dur,0.025);
  o1.start(T);o2.start(T);o1.stop(T+dur+0.2);o2.stop(T+dur+0.2);}
const bassReg=pc=>36+((pc-36)%12+12)%12;
function bassPlay(c,nc,w,T,dur){const r=bassReg(c.root);let m=r;
  if(w==='8')m=r+12;else if(w==='3')m=r+((c.pcs[1]-c.root+12)%12);else if(w==='5')m=r+((c.pcs[2]-c.root+12)%12);
  else if(w==='A'){const nr=bassReg(nc.root);m=nr===r?r+7:nr+(nr>r?-1:1);}/* a semitone into the next chord */
  bassNote(m,T,dur,1);}
function arpNote(c,s,T,dur){const t=c.pcs.map(pc=>72+((pc-72)%12+12)%12).sort((a,b)=>a-b);t.push(t[0]+12);const m=t[(s>>2)%2?3-(s%4):s%4];
  const o=AC.createOscillator(),gn=AC.createGain();o.setPeriodicWave(PULSE[12]);o.frequency.value=mtof(m);env(gn,T,0.002,0.032,dur);o.connect(gn);gn.connect(KEYG);gn.connect(DUB);o.start(T);o.stop(T+dur+0.05);}
/* the tune of the flipper, for the lit sign: eight bars on the same chords, in eighths (written in C, moved to the level's key) */
const NN=s=>{const m=/^([A-G])(#?)(\d)$/.exec(s);return 12*(+m[3]+1)+{C:0,D:2,E:4,F:5,G:7,A:9,B:11}[m[1]]+(m[2]?1:0);};
const THEME=[[['E5',1],['G5',1],['C6',2],['B5',1],['G5',1],['E5',2]],[['D5',1],['G5',1],['B5',1],['D6',2],['B5',1],['G5',2]],[['C5',1],['E5',1],['A5',1],['C6',2],['A5',1],['E5',2]],
  [['F5',1],['A5',1],['C6',1],['A5',1],['G5',1],['F5',1],['E5',1],['D5',1]],[['E5',1],['G5',1],['C6',2],['B5',1],['G5',1],['E5',2]],[['D5',1],['G5',1],['B5',1],['D6',2],['B5',1],['G5',2]],
  [['F5',1],['A5',1],['C6',1],['F6',2],['E6',1],['D6',1],['C6',1]],[['G5',1],['B5',1],['D6',1],['G6',1],['F6',1],['D6',1],['B5',2]]]
  .map(bar=>{let a=0;return bar.map(([n,d])=>{const x={s:a*2,m:NN(n),len:d*2};a+=d;return x;});});
function themeStep(s,T){const off=((KEY%12)+12)%12,o=off>2?off-12:off;for(const x of THEME[chordIdx%8])if(x.s===s){const m=x.m+o;playLeadAt({m,h:thirdBelow(m),len:x.len,v:0.9},T,false);}}
function playStep(i,T){const es=effStage(),G=GROOVE[es],s=songStep,c=giroChord(chordIdx),six=60/bpm()/4,over=st==='over',dv=over?0.45:1;
  const hit=(p,ins)=>{const n=p?+p[s]||0:0;if(n)DR[ins](T,n/9*dv);};
  if(changeAt>i&&changeAt-i<=8){/* the fill before a new instrument: eighths, then sixteenths, louder and louder */const r=changeAt-i;if(r<=4||r%2===0)DR.s(T,0.4+0.6*(8-r)/7);}
  else{hit(G.k,'k');hit(G.s,'s');hit(G.r,'r');}
  hit(G.h,'h');hit(G.o,'o');
  if(G.skank){const q=G.skank.indexOf(s);if(q>=0)keyStab(c,T,es>=3?0.065:0.095,(G.skankV?G.skankV[q]:1)*(over?0.6:1));}
  if(G.bass&&!over)for(const [bs,w,l] of G.bass)if(bs===s)bassPlay(c,giroChord(chordIdx+1),w,T,l*six*0.9);
  if(G.arp&&!over)arpNote(c,s,T,six*0.7);
  if(ending)themeStep(s,T);}
function schedule(i,T){
  if(restartNext){const r=restartNext;restartNext=null;songStep=0;chordIdx=0;changeAt=-1;if(r==='theme')ending=true;else crash(T);}
  if(changeAt>=0&&changeAt<i)changeAt=-1;
  if(songStep>=cycleLen()){songStep=0;chordIdx=(chordIdx+1)%8;}
  if(songStep===0){
    if(changeAt===i){changeAt=-1;if(wantStage>stage){if(MS.style==='gioco'){stage++;banner(LAYERN[stage-1]);}else stage=wantStage;crash(T);if(stage>=3&&skaP==null)skaP=wallP();}else if(wantStage<stage)stage=wantStage;}
    chords.push({t:T,c:giroChord(chordIdx)});if(chords.length>24)chords.shift();}
  const es=effStage();if(es!==lastES){lastES=es;applyVolumes();}
  playStep(i,T);phraseStep(i,T);
  while(leadQ.length&&leadQ[0].i<=i){const x=leadQ.shift();if(x.i===i)playLeadAt(x,T,true);}
  const lev=effStage()>=3?songStep%4===2:songStep===8||songStep===24;/* the off-beat: where the chop falls, and the screen pulses */
  songStep++;if(songStep>=cycleLen()){songStep=0;chordIdx=(chordIdx+1)%8;}
  /* the wall asks for a change: it lands on a bar line, with room for the fill */
  if(changeAt<0&&!ending&&st!=='over'&&wantStage!==stage){const L=cycleLen(),left=(L-songStep)%L;changeAt=i+1+left+(left<8&&wantStage>stage?L:0);}
  return lev;}
function musicTick(){if(!AC||!started||AC.state!=='running')return;const now=AC.currentTime,dt=Math.min(0.5,Math.max(0,now-lastTickT));lastTickT=now;
  /* the tempo holds in the reggae and rises from the start of the ska to the end of the wall */
  const tg=st==='over'?0:ending?1:stage>=3&&skaP!=null?clamp((wallP()-skaP)/Math.max(0.05,1-skaP),0,1):0;tempoP+=(tg-tempoP)*Math.min(1,dt*0.35);
  while(nextStep<now+0.12){const lev=schedule(stepN,nextStep);ring.push({i:stepN,T:nextStep,lev});if(ring.length>64)ring.shift();nextStep+=60/bpm()/4;stepN++;}
  DL.delayTime.setTargetAtTime(60/bpm()*0.75,now,0.5);}
function startGroove(){if(!AC||started)return;started=true;nextStep=AC.currentTime+0.06;stepN=0;songStep=0;chordIdx=0;changeAt=-1;restartNext=null;lastTickT=AC.currentTime;chords=[{t:nextStep,c:giroChord(0)}];}
function restartSong(){ending=false;leadQ=[];changeAt=-1;tempoP=0;phrase=null;phraseReq=false;musicLevel(0);stage=MS.style==='gioco'?0:wantStage;skaP=stage>=3?0:null;restartNext='level';}
function newKey(){/* each level moves up a fourth and starts again from reggae */KEY=(2+5*(lvl-1))%12;restartSong();}
function slot(){const now=AC.currentTime+0.012;if(S.quant==='libero'||!started)return{T:now,i:-1};for(const r of ring)if(r.T>=now)return{T:r.T,i:r.i};return{T:nextStep,i:stepN};}
/* the visual pulse follows the off-beat */
function beatEnv(){if(!AC||!started)return 0;const now=AC.currentTime;let lb=null;for(const r of ring)if(r.lev&&r.T<=now)lb=r.T;return lb==null?0:Math.exp(-(now-lb)*5);}

/* ---- the bricks' keyboard ---- */
let leadQ=[],leadLive=[];
function leadNote(m,T,dur,v){const f=mtof(m),gn=AC.createGain(),o=[],tone=MS.tone;let peak=0.13*v,a=0.004,sus=0.8;
  const add=(w,det,amp,dst)=>{const os=AC.createOscillator();if(typeof w==='string')os.type=w;else os.setPeriodicWave(w);os.frequency.value=f;os.detune.value=det||0;
    const og=AC.createGain();og.gain.value=amp;os.connect(og);og.connect(dst||gn);os.start(T);o.push(os);return os;};
  if(tone==='organo'){add(ORGANW,0,1);sus=0.85;}
  else if(tone==='piano'){/* struck: bright at first, then it darkens and fades by itself */const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(4200,T);lp.frequency.exponentialRampToValueAtTime(900,T+0.45);lp.connect(gn);
    add('sawtooth',-4,0.5,lp);add('triangle',3,0.7,lp);sus=0;a=0.002;peak*=1.2;}
  else if(tone==='ottoni'){const lp=AC.createBiquadFilter();lp.type='lowpass';lp.Q.value=1.2;lp.frequency.setValueAtTime(500,T);lp.frequency.exponentialRampToValueAtTime(2800,T+0.035);lp.frequency.setTargetAtTime(1700,T+0.04,0.08);lp.connect(gn);
    add('sawtooth',-6,0.55,lp);add('sawtooth',6,0.55,lp);a=0.018;}
  else if(tone==='flauto'){add('sine',0,1);add('triangle',0,0.25);
    const s=AC.createBufferSource();s.buffer=NOISE;const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=Math.min(8000,f*2);bp.Q.value=2;const ng=AC.createGain();
    ng.gain.setValueAtTime(0.0001,T);ng.gain.exponentialRampToValueAtTime(0.25,T+0.01);ng.gain.exponentialRampToValueAtTime(0.0001,T+0.08);s.connect(bp);bp.connect(ng);ng.connect(gn);s.start(T,Math.random()*0.5);
    const l=AC.createOscillator(),lg=AC.createGain();l.frequency.value=5.5;lg.gain.setValueAtTime(0,T);lg.gain.linearRampToValueAtTime(9,T+0.25);l.connect(lg);o.forEach(x=>lg.connect(x.detune));l.start(T);o.push(l,s);
    a=0.03;sus=0.9;peak*=1.15;}
  else{add(PULSE[25],0,0.8);sus=0.7;a=0.002;}
  const end=T+Math.max(0.05,dur),ring_=Math.min(0.35,dur*1.2+0.08);
  gn.gain.setValueAtTime(0.0001,T);gn.gain.exponentialRampToValueAtTime(peak,T+a);
  if(sus>0){gn.gain.setTargetAtTime(peak*sus,T+a,0.06);gn.gain.setTargetAtTime(0.0001,end,0.016);}else gn.gain.setTargetAtTime(0.0001,T+a,ring_);
  gn.connect(LEADG);const t1=sus>0?end+0.15:T+a+ring_*5;o.forEach(x=>x.stop(t1));
  leadLive.push({g:gn,o,t0:T,t1});if(leadLive.length>48)leadLive.splice(0,leadLive.length-48);}
/* one note at a time: what is still sounding or waiting fades out where the new motif begins */
function cutLead(T0){leadQ=[];if(!AC)return;
  for(const x of leadLive){if(x.t1<=T0)continue;try{x.g.gain.cancelScheduledValues(T0);
      if(x.t0>=T0-0.001){x.g.gain.setValueAtTime(0.0001,T0);for(const o of x.o)o.stop(T0+0.005);}
      else{x.g.gain.setTargetAtTime(0.0001,T0,0.01);for(const o of x.o)o.stop(T0+0.06);}x.t1=T0;}catch(e){}}
  leadLive=leadLive.filter(x=>x.t1>AC.currentTime);}
function playLeadAt(x,T,count){const d=Math.max(0.05,x.len*60/bpm()/4*0.92);leadNote(x.m,T,d,x.v);if(x.h!=null)leadNote(x.h,T+0.004,d,x.v*0.55);
  if(count){notesLvl++;if(LAB){NLOG.push([x.m,x.h==null?0:1]);if(NLOG.length>4000)NLOG.shift();}}}
/* a motif goes out step by step: what falls in steps already sent to the sound card plays now, the rest waits for its step */
function playMotif(mo,i0,T0){const six=60/bpm()/4;
  for(const x of mo){if(i0<0){playLeadAt(x,T0+x.d*six,true);continue;}const k=i0+x.d;
    if(k<stepN){const r=ring.find(q=>q.i===k);playLeadAt(x,r?r.T:T0+x.d*six,true);}else leadQ.push(Object.assign({i:k},x));}
  leadQ.sort((a,b)=>a.i-b.i);}
function thirdBelow(m){const sc=keyScale();for(let x=m-3;x>=m-4;x--)if(sc.includes(((x%12)+12)%12))return x;return m-3;}
/* ---- the bricks' keyboard: phrases on the beat ----
   A hit asks for a phrase: it starts on the next beat and plays to its end on the grid (two bars of ska, one bar of half-time
   reggae), whatever the ball does meanwhile; every hit still clicks at once. Hits during a phrase ask for the next one, so
   while the wall is falling the melody goes on, question and answer; when the ball is quiet the melody rests.
   A phrase is a rhythm whose second half repeats the first, notes that move mostly by step on the major pentatonic, chord
   tones on the beats, about an octave of range, and an ending on the chord's root (the answer) or on its third or fifth (the
   question). Rhythms: one character per eighth of ska (a sixteenth of half-time reggae), x a note, - held, . silent */
const RHY={calm:['x-x-x---x-x-x---','x---x.x.x---x---','..x.x.x-..x.x-x-','.x.x.x--.x.x.x--','x-.x--x-x-.x----'],
  busy:['x.x.x-x-x.x.x---','x-.xx-x-x-.xx---','x.xxx.x-x.xxx---','xx.x.x.xxx.x.x--','..xx.xx-..xx.x--']};
let phrase=null,phraseReq=false,phraseN=0,hitsRecent=[],melPrev=74;
function contour(n,cx){const shape=pickW([['arch',2],['down',1.2],['up',0.8],['wave',1]]),out=[];let back=0;
  for(let k=1;k<n;k++){let sg=shape==='up'?1:shape==='down'?-1:shape==='wave'?(k%2?1:-1):(k<n/2?1:-1),d=pickW([[1,6],[0,0.6],[2,1+2*cx],[3,0.4*cx]]);
    if(back){sg=back;d=1;}/* after a leap, a step back the other way */back=d>=2?-sg:0;out.push(sg*d);}
  return out;}
function makePhrase(i){const busy=effStage()>=3||hitsRecent.length>=4||MS.melCx>0.6,set=RHY[busy&&Math.random()<0.75?'busy':'calm'],r=set[Math.floor(Math.random()*set.length)],notes=[];
  for(let k=0;k<16;k++)if(r[k]==='x'){let len=1;while(k+len<16&&r[k+len]==='-')len++;notes.push({d:k*2,len:len*2,half:k<8?0:1});}
  const h1=notes.filter(x=>!x.half),h2=notes.filter(x=>x.half),mv=contour(h1.length,MS.melCx);
  h1.forEach((x,k)=>{x.dv=k?mv[k-1]:null;});
  /* the second half repeats the moves of the first, starting where the first started or a step away */
  const back=-mv.reduce((a,b)=>a+b,0)+pickW([[0,2],[1,1],[-1,1]]);h2.forEach((x,k)=>{x.dv=k?(mv[k-1]==null?pickW([[1,1],[-1,1]]):mv[k-1]):back;});
  phraseN++;return{i0:i,notes,answer:phraseN%2===0};}
const melCenter=()=>{const t=72+((KEY-72)%12+12)%12;return t<69?t+12:t;};/* the key's tonic, between A4 and G#5 */
function nearestPc(pcs,ref,lo,hi,dir){let best=null;for(let m=lo;m<=hi;m++){if(!pcs.includes(((m%12)+12)%12))continue;const s=Math.abs(m-ref)-(dir&&Math.sign(m-ref)===Math.sign(dir)?0.5:0);if(best==null||s<best.s)best={m,s};}return best?best.m:ref;}
function phraseNote(x,c,strong,last,answer){const ok=new Set([0,2,4,7,9].map(v=>(KEY+v)%12).concat(c.pcs));if(MS.melCx>=0.5)keyScale().forEach(v=>ok.add(v));
  const A=[];for(let m=55;m<=93;m++)if(ok.has(m%12))A.push(m);const lo=melCenter()-5,hi=melCenter()+7;
  let m;if(x.dv==null)m=nearestPc(c.pcs,clamp(melPrev,lo,hi),lo,hi);/* the first note: a chord tone near the last one */
  else{const j=A.reduce((b,v,k)=>Math.abs(v-melPrev)<Math.abs(A[b]-melPrev)?k:b,0);m=A[clamp(j+x.dv,0,A.length-1)];if(m>hi||m<lo)m=A[clamp(j-x.dv,0,A.length-1)];}
  if(last)m=nearestPc(answer?[c.root]:[c.pcs[1],c.pcs[2]],m,lo-2,hi+2);
  else if(strong&&!c.pcs.includes(m%12))m=nearestPc(c.pcs,m,lo-2,hi+2,x.dv);
  if(Math.abs(m-melPrev)>7)m+=m>melPrev?-12:12;/* never a leap wider than a fifth */
  melPrev=m;return m;}
/* in the scheduler, step by step: the end of a phrase, the start of the next one on a beat, the notes due now */
function phraseStep(i,T){if(phrase&&i-phrase.i0>=32)phrase=null;
  if(ending||st==='over'||st==='win'){phrase=null;phraseReq=false;return;}
  if(!phrase&&phraseReq&&songStep%4===0){phrase=makePhrase(i);phraseReq=false;}
  if(!phrase)return;const k=i-phrase.i0,ns=phrase.notes;
  for(const x of ns)if(x.d===k){const strong=songStep%(cycleLen()>=32?8:4)===0,last=x===ns[ns.length-1],m=phraseNote(x,giroChord(chordIdx),strong,last,phrase.answer);
    playLeadAt({m,h:GROOVE[effStage()].two?thirdBelow(m):null,len:x.len,v:last?1.05:strong?1:0.85},T,true);if(last)flashSign=1;}}
function startVolley(b,events){b.vol={k:0,n:events.filter(e=>e.k!=='tough').length};}
/* a brick: a glassy click at once, and the request for a phrase */
function ballNote(b,brick){if(!AC)return;const now=AC.currentTime;nz(METAL,now,0.02,'bandpass',5200,2,0.07,DRUMG);if(b&&b.vol)b.vol.k++;
  phraseReq=true;hitsRecent=hitsRecent.filter(x=>now-x<3);hitsRecent.push(now);}
function toughNote(){if(!AC)return;const {T}=slot();chip(96,T,0.05,0.6,12);nz(METAL,T,0.06,'bandpass',3200,3,0.15,DRUMG);}
/* the paddle: a low blip on the chord now playing */
function paddleNote(){if(!AC)return;const now=AC.currentTime;nz(NOISE8,now,0.05,'lowpass',450,1,0.18,DRUMG);
  const {T}=slot(),c=chordAt(T),r=48+((c.root-48)%12+12)%12,k=osc(PULSE[50],mtof(r+12),T,DRUMG,0.06,0.002,0.09);k.o.frequency.exponentialRampToValueAtTime(mtof(r),T+0.06);}
function wallNote(){if(AC)tick(AC.currentTime,0.35);}
function capNote(){if(!AC)return;const {T}=slot(),c=chordAt(T),r=72+((c.root-72)%12+12)%12;[0,c.maj?4:3,7,12,c.maj?16:15,19,24].forEach((x,i)=>chip(r+x,T+i*0.035,0.06,0.8,25));}
function letterBuzz(){if(!AC)return;const T=AC.currentTime;const o=AC.createOscillator(),f=AC.createBiquadFilter(),gn=AC.createGain();o.type='sawtooth';o.frequency.value=100;f.type='lowpass';f.frequency.value=700;
  env(gn,T,0.01,0.025,0.22);o.connect(f);f.connect(gn);gn.connect(BUS);o.start(T);o.stop(T+0.3);tick(T,0.5);}
function lineChime(){if(!AC)return;const {T}=slot(),c=chordAt(T);const tones=[];for(let m=74;m<=93;m++)if(c.pcs.includes(m%12))tones.push(m);tones.slice(0,5).forEach((m,i)=>chip(m,T+i*0.05,0.12,0.9,12).connect(DL));}
function bossThump(){if(!AC)return;const T=AC.currentTime,r=bassReg(curChord().root),k=osc('triangle',mtof(r+12),T,DRUMG,0.5,0.003,0.3);k.o.frequency.exponentialRampToValueAtTime(mtof(r),T+0.2);nz(NOISE8,T,0.22,'lowpass',900,0.7,0.2,DRUMG);}
/* the sign is lit: a crash, an arpeggio up two octaves, then the whole band plays the flipper's tune until the next level */
function finaleMusic(){if(!AC)return;restartNext='theme';phrase=null;phraseReq=false;cutLead(AC.currentTime+0.01);const {T}=slot(),base=KEY+60;crash(T);DR.k(T,1);[0,4,7,12,16,19,24].forEach((x,i)=>chip(base+x,T+0.045*i,0.12,0.9,25));}
function loseNotes(){if(!AC)return;cutLead(AC.currentTime+0.01);phrase=null;phraseReq=false;const {T}=slot(),c=chordAt(T),cand=[];for(let x=melPrev-14;x<=melPrev;x++)if(c.penta.includes(((x%12)+12)%12))cand.push(x);
  cand.reverse().slice(0,3).forEach((x,i)=>chip(x,T+i*0.2,i===2?0.45:0.16,0.9,50));}

/* =====================================================================================================
   GAME. The physics runs on a fixed step of 1/240 s, the same code for the game and for the forecast.
   ===================================================================================================== */
const COLS=10,ROWS=12,BW=25,BH=12,BX=(W-COLS*BW)/2,BY=TOP+34,STEP=1/240;
/* the wall in the colours of 70s neon signs, warm at the top and cool at the bottom; the second row of each pair leans toward the next colour */
const NEON70=['#ff2e88','#ff4b2b','#ff9a1f','#ffd23f','#2ee8c4','#3d8bff','#a35bff'];
const ROWCOL=Array.from({length:12},(_,r)=>r%2?mixHex(NEON70[r>>1],NEON70[(r>>1)+1],0.4):NEON70[r>>1]);
/* the walls, level by level: hit points per cell (1, or 2 and 3 for the bricks with extra tubes inside); the top rows are the ones that light the sign */
const LAYOUTS=[
  (r,c)=>r<2?2:1,
  (r,c)=>{const hx=Math.abs(c-4.5),heart=(r>=2&&r<=9)&&((r<=3&&(Math.abs(hx-2)<=1.2))||(r>3&&hx<=5.6-(r-3)*0.95));return heart?2:(r===0?3:1);},
  (r,c)=>(c===1||c===8)&&r>=1?3:((r+c)%3===0?2:1)];
const FCLOG=[];let notesLvl=0,bricks=[],balls=[],caps=[],parts=[],pops=[],trail=[],orbs=[],boss=null,bossDone=false,SIGN=[],lvl=1,flashSign=0;
let comboT=-9,paddle,st,lives=3,score=0,combo=0,hits=0,shake=0,wideT=[],slowUntil=0,t=0,sim=0,acc=0,stT=0,flash=0,slowT=0,slowF=1,zoom={x:W/2,y:H/2,t:-9},bannerTxt=null,bannerT=-9;
function banner(s){bannerTxt=s;bannerT=t;}
function buildLevel(){bricks=[];const lay=LAYOUTS[(lvl-1)%LAYOUTS.length],gold=new Set(),ng=6+Math.min(4,lvl);
  while(gold.size<ng)gold.add((2+Math.floor(Math.random()*10))*COLS+Math.floor(Math.random()*COLS));
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const hp=Math.min(3,lay(r,c)+(lvl>3&&r<3?1:0)),isG=hp===1&&gold.has(r*COLS+c),cap=isG?pickW([['M',0.45],['L',0.25],['S',0.15],['V',0.15]]):null;
    bricks.push({x:BX+c*BW,y:BY+r*BH,c,r,hp,max:hp,gift:isG,cap,col:isG?CAPS[cap].col:ROWCOL[r],alive:true,hitT:-9,wob:0});}
  bakeBricks();setSign(SIGNS[(lvl-1)%SIGNS.length]);notesLvl=0;boss=null;bossDone=false;caps=[];hits=Math.min(40,(lvl-1)*12);wideT=[];slowUntil=0;}
function newGame(){lvl=1;lives=3;score=0;paddle={x:W/2,y:H-46,h:10,base:PADW[S.pad],w:PADW[S.pad],sq:0,hitT:-9};buildLevel();newKey();ready();}
function nextLevel(){lvl++;lives=Math.min(5,lives+1);buildLevel();newKey();banner('LIVELLO '+lvl);ready();}
function ready(){st='ready';stT=t;combo=0;balls=[{x:paddle.x,y:paddle.y-4,vx:0,vy:0,r:3.2,stuck:true}];}
const alive=()=>bricks.reduce((n,b)=>n+(b.alive?1:0),0);
const targets=()=>alive()+(boss&&boss.hp>0?1:0)+(!bossDone&&!boss?1:0);
const speedOf=(h,su,tt)=>SPEED[S.speed]*speedFactor(h)*(tt<su?0.68:1);
function launch(){if(st!=='ready')return;st='play';const a=(Math.random()*0.5-0.25),sp=speedOf(hits,slowUntil,sim);
  for(const b of balls){b.stuck=false;b.vx=Math.sin(a)*sp;b.vy=-Math.cos(a)*sp;forecast(b);}startGroove();}

/* ---- the sign ---- */
const SIGNFONT=s=>s+'px "Tilt Neon", "Fredoka", sans-serif';
function setSign(lines){const ys=[16,46,86,122];SIGN=lines.map(([txt,size,col],i)=>({txt,size,col,y:BY+ys[i],letters:[],done:false}));layoutSign();bakeSign();}
function layoutSign(){const c=mk(10,10).getContext('2d');for(const L of SIGN){let size=L.size;c.font=SIGNFONT(size);let w=c.measureText(L.txt).width;const maxW=COLS*BW-14;if(w>maxW){size*=maxW/w;c.font=SIGNFONT(size);w=c.measureText(L.txt).width;}
  L.fs=size;let x=W/2-w/2;const old=L.letters;L.letters=[];for(let i=0;i<L.txt.length;i++){const ch=L.txt[i],cw=c.measureText(ch).width,o=old[i];
    L.letters.push({ch,x,w:cw,lit:o?o.lit:false,litT:o?o.litT:-9,space:ch===' '});x+=cw;}}}
function covered(l,L){const x0=l.x+l.w*0.2,x1=l.x+l.w*0.8,y0=L.y-L.fs*0.35,y1=L.y+L.fs*0.35;
  for(const b of bricks)if(b.alive&&b.x<x1&&b.x+BW>x0&&b.y<y1&&b.y+BH>y0)return true;return false;}
function checkSign(){for(const L of SIGN){let all=true;for(const l of L.letters){if(l.space)continue;if(!l.lit&&!covered(l,L)){l.lit=true;l.litT=t;letterBuzz();}if(!l.lit)all=false;}
  if(all&&!L.done){L.done=true;L.doneT=t;lineChime();slowT=Math.max(slowT,0.45);slowF=0.45;flash=Math.max(flash,0.25);}}}
function spawnBoss(){const hp=6+2*(lvl-1);boss={x:-40,y:BY+ROWS*BH+44,w:56,h:42,hp,max:hp,hitT:-9,t0:sim};banner(lvl>1?'RE DIVANO È TORNATO':'RE DIVANO!');}

/* ---- input: drag anywhere moves the paddle; a short tap launches; a mouse follows the pointer ---- */
let down=null;
cv.addEventListener('pointerdown',e=>{audio();if(AC&&AC.state==='suspended')AC.resume();startGroove();down={id:e.pointerId,t:performance.now(),moved:0,lx:e.clientX};try{cv.setPointerCapture(e.pointerId);}catch(_){}e.preventDefault();});
cv.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'&&!down){const r=cv.getBoundingClientRect();paddle.x=(e.clientX-r.left)/scale;clampPaddle();}});
/* drags and releases are heard on the whole window, each matched to the finger that started it: some phone browsers keep a touch
   that began on the Suono button on the button instead of handing it to the canvas, and the tap was lost there */
addEventListener('pointermove',e=>{if(!down||e.pointerId!==down.id)return;if(down.mood){down.my+=Math.abs(e.clientY-down.ly);down.ly=e.clientY;}paddle.x+=(e.clientX-down.lx)/scale*1.15;down.moved+=Math.abs(e.clientX-down.lx);down.lx=e.clientX;clampPaddle();e.preventDefault();});
moodB.addEventListener('pointerdown',e=>{down={id:e.pointerId,t:performance.now(),moved:0,lx:e.clientX,mood:true,my:0,ly:e.clientY};try{cv.setPointerCapture(e.pointerId);}catch(_){}e.preventDefault();});
moodB.addEventListener('click',e=>{if(e.detail===0)nextMood();});
/* touch defaults off on the game surface: no browser gesture starts from a drag on the canvas */
for(const el of [cv,moodB]){el.addEventListener('touchstart',e=>e.preventDefault(),{passive:false});el.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});}
addEventListener('pointerup',e=>{if(!down||e.pointerId!==down.id)return;const tap=down.moved<10&&performance.now()-down.t<350,fromMood=down.mood,still=down.moved+(down.my||0)<14;down=null;arm();
  if(fromMood){if(still)nextMood();return;}/* on the Suono button: a touch that stays put changes the tone, however long; a swipe only moves the paddle */
  if(st==='ready'&&(tap||e.pointerType==='mouse'))launch();else if(st==='over'&&t-stT>1.2)newGame();else if(st==='win'&&t-stT>1.6)nextLevel();});
addEventListener('pointercancel',e=>{if(down&&e.pointerId===down.id)down=null;});
function clampPaddle(){paddle.x=clamp(paddle.x,paddle.w/2+4,W-paddle.w/2-4);}
const keys={};addEventListener('keydown',e=>{keys[e.key]=true;if(e.key===' '){audio();startGroove();if(st==='ready')launch();else if(st==='over'&&t-stT>1.2)newGame();else if(st==='win'&&t-stT>1.6)nextLevel();e.preventDefault();}});
addEventListener('keyup',e=>{keys[e.key]=false;});

/* ---- the physics step, shared by the game and by the forecast ---- */
function collideRect(b,x0,y0,w,h){const nx=clamp(b.x,x0,x0+w),ny=clamp(b.y,y0,y0+h),dx=b.x-nx,dy=b.y-ny;if(dx*dx+dy*dy>b.r*b.r)return false;
  const ox=Math.min(b.x+b.r-x0,x0+w-(b.x-b.r)),oy=Math.min(b.y+b.r-y0,y0+h-(b.y-b.r));
  if(ox<oy){b.vx=b.x<x0+w/2?-Math.abs(b.vx):Math.abs(b.vx);b.x+=b.vx>0?ox:-ox;}else{b.vy=b.y<y0+h/2?-Math.abs(b.vy):Math.abs(b.vy);b.y+=b.vy>0?oy:-oy;}return true;}
function bossMove(B,tt){const life=B.hp/B.max,sp=0.9+(1-life)*1.6,u=tt-B.t0,tx=W/2+Math.sin(u*sp)*(W/2-40);B.x+=(tx-B.x)*Math.min(1,STEP*(u<1.2?2.2:5));}
/* one step of one ball in a world {bricks, boss, sim, hits, slowUntil}; on(kind, thing) reports what it touched */
function ballStep(b,Wd,on){const sp=speedOf(Wd.hits,Wd.slowUntil,Wd.sim),cur=Math.hypot(b.vx,b.vy)||1;b.vx*=sp/cur;b.vy*=sp/cur;
  b.x+=b.vx*STEP;b.y+=b.vy*STEP;
  if(b.x<b.r+3){b.x=b.r+3;b.vx=Math.abs(b.vx);on('wall');}
  if(b.x>W-b.r-3){b.x=W-b.r-3;b.vx=-Math.abs(b.vx);on('wall');}
  if(b.y<TOP+b.r+3){b.y=TOP+b.r+3;b.vy=Math.abs(b.vy);on('wall');}
  const B=Wd.boss;if(B&&B.hp>0&&collideRect(b,B.x-B.w/2,B.y-B.h/2,B.w,B.h)){if(Wd.sim-B.hitT>0.25){B.hitT=Wd.sim;B.hp--;on('boss',B);}}
  const c0=Math.floor((b.x-b.r-BX)/BW),c1=Math.floor((b.x+b.r-BX)/BW),r0=Math.floor((b.y-b.r-BY)/BH),r1=Math.floor((b.y+b.r-BY)/BH);
  for(let r=Math.max(0,r0);r<=Math.min(ROWS-1,r1);r++)for(let c=Math.max(0,c0);c<=Math.min(COLS-1,c1);c++){const k=Wd.bricks[r*COLS+c];if(!k.alive)continue;
    if(!collideRect(b,k.x,k.y,BW,BH))continue;if(Math.abs(b.vy)<sp*0.25)b.vy=(b.vy<0?-1:1)*sp*0.25;
    if(k.hp>1){k.hp--;on('tough',k);}else{k.alive=false;Wd.hits++;on('brick',k);}return;}}
/* the forecast: copy the world and run the ball until it comes back to the paddle's height */
function forecast(b){const Wd={bricks:bricks.map(k=>({x:k.x,y:k.y,r:k.r,c:k.c,alive:k.alive,hp:k.hp})),boss:boss?{...boss}:null,sim,hits,slowUntil},bb={...b},ev=[];let ret=null;
  for(let n=0;n<240*8;n++){Wd.sim+=STEP;if(Wd.boss)bossMove(Wd.boss,Wd.sim);
    ballStep(bb,Wd,(k,x)=>{if(k==='brick'||k==='boss')ev.push({k,t:Wd.sim-sim,r:x.r});else if(k==='tough')ev.push({k:'tough'});});
    if(bb.vy>0&&bb.y+bb.r>=paddle.y){ret=Wd.sim-sim;break;}if(bb.y>H)break;}
  startVolley(b,ev,ret);b.fc=ev.filter(e=>e.k!=='tough').length;}

/* ---- what happens when the real ball touches things ---- */
function burst(x,y,col,n,sp){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=(sp||70)*(0.35+Math.random());parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-35,life:0.5+Math.random()*0.4,t:0,col,s:1.5+Math.random()*2.5,rot:Math.random()*6,vr:(Math.random()-0.5)*14,shard:Math.random()<0.6});}
  if(parts.length>420)parts.splice(0,parts.length-420);}
function pop(txt,x,y,col,big){pops.push({txt,x:clamp(x,40,W-40),y,col:col||'#fff',t:0,big:!!big});}
function onReal(b){return (k,x)=>{
  if(k==='wall')wallNote();
  else if(k==='tough'){x.hitT=t;x.wob=1;toughNote();burst(b.x,b.y,x.col||'#ffffff',6,45);}
  else if(k==='brick'){const br=x;br.hitT=t;b.real=(b.real||0)+1;combo++;comboT=t;score+=10*Math.min(combo,12);ballNote(b,br);
    for(const n of bricks)if(n.alive&&Math.abs(n.c-br.c)<=1&&Math.abs(n.r-br.r)<=1){n.wob=Math.max(n.wob,0.6);n.hitT=Math.max(n.hitT,t-0.06);}
    burst(br.x+BW/2,br.y+BH/2,br.col,12,80);shake=Math.min(3.5,shake+0.8);
    if(br.gift||Math.random()<0.065){/* a gift brick always drops the capsule it shows; any other brick now and then a surprise */const kk=br.cap||pickW([['M',0.45],['L',0.25],['S',0.15],['V',0.15]]);caps.push({k:kk,x:br.x+BW/2,y:br.y+BH/2,vy:60});}
    const p=1-alive()/bricks.length;musicLevel(p);checkSign();if(!boss&&!bossDone&&p>=0.5)spawnBoss();
    zoom.x=br.x+BW/2;zoom.y=br.y+BH/2;if(!targets())win();}
  else if(k==='boss'){const B=x;B.flashT=t;b.real=(b.real||0)+1;bossThump();ballNote(b,null);shake=Math.min(5,shake+2.5);burst(B.x,B.y,'#ff3d6e',10,70);burst(B.x,B.y-10,'#ffffff',6,50);score+=60;
    if(B.hp<=0){bossDone=true;burst(B.x,B.y,'#ff3d6e',40,140);burst(B.x,B.y,'#ffd36b',24,120);pop('RE DIVANO K.O.',B.x,B.y,'#ff5fd2',true);score+=500;lineChime();
      zoom.x=B.x;zoom.y=B.y;boss=null;if(!targets())win();}}};}
const CAPS={L:{col:'#4fe3ff',txt:'RACCHETTA LARGA'},S:{col:'#5cf5a8',txt:'PALLINA LENTA'},M:{col:'#ff5fd2',txt:'TRE PALLINE'},V:{col:'#ff3d6e',txt:'VITA IN PIÙ'}};
function catchCap(c){const d=CAPS[c.k];let tx=d.txt;capNote();score+=50;
  /* wide paddle: up to two at once, each with its own 12 seconds; a third one only renews the older */
  if(c.k==='L'){const on=wideT.filter(x=>x>t).sort((a,b)=>a-b);if(on.length<2)on.push(t+12);else{on[0]=t+12;tx+=' · MAX';}if(on.length===2&&!tx.endsWith('MAX'))tx+=' x2';wideT=on;}
  pop(tx,c.x,paddle.y-20,d.col);
  if(c.k==='S')slowUntil=sim+10;else if(c.k==='V')lives=Math.min(5,lives+1);
  else if(c.k==='M'){const src=balls.find(b=>!b.stuck)||balls[0];if(!src)return;for(const a of [-0.5,0.5]){if(balls.length>=9)break;const sp=Math.hypot(src.vx,src.vy)||speedOf(hits,slowUntil,sim),ang=Math.atan2(src.vx,-src.vy)+a;
    const nb={x:src.x,y:src.y,vx:Math.sin(ang)*sp,vy:-Math.cos(ang)*sp,r:3.2,stuck:false};balls.push(nb);forecast(nb);}}}
function win(){st='win';stT=t;slowT=1.3;slowF=0.3;zoom.t=t;flash=1;balls=[];caps=[];SIGN.forEach(L=>L.letters.forEach(l=>{if(!l.lit){l.lit=true;l.litT=t;}}));
  if(score>best){best=score;save();}finaleMusic();for(let i=0;i<5;i++)setTimeout(()=>{burst(40+Math.random()*190,BY+Math.random()*140,['#ff5fd2','#4fe3ff','#ffd36b','#5cf5a8'][i%4],30,150);},i*180);}
function lose(){lives--;combo=0;loseNotes();shake=4;if(lives<=0){st='over';stT=t;if(score>best){best=score;save();}}else ready();}
function physStep(){sim+=STEP;if(boss)bossMove(boss,sim);const Wd={bricks,boss,get sim(){return sim;},get hits(){return hits;},set hits(v){hits=v;},slowUntil};
  for(const b of balls){if(b.stuck)continue;const prevVy=b.vy;ballStep(b,Wd,onReal(b));if(st!=='play')return;
    const p=paddle;if(b.vy>0&&b.y+b.r>=p.y&&b.y-b.r<=p.y+p.h&&b.x>=p.x-p.w/2-b.r&&b.x<=p.x+p.w/2+b.r){
      const sp=speedOf(hits,slowUntil,sim),rel=clamp((b.x-p.x)/(p.w/2),-1,1),ang=rel*1.05;b.vx=Math.sin(ang)*sp;b.vy=-Math.cos(ang)*sp;b.y=p.y-b.r;combo=0;p.sq=1;p.hitT=t;paddleNote();if(b.fc!=null){FCLOG.push([b.fc,b.real||0]);if(FCLOG.length>200)FCLOG.shift();}b.real=0;forecast(b);}}
  balls=balls.filter(b=>b.y<H+12);if(st==='play'&&!balls.length)lose();}
function update(dt){t+=dt;flash=Math.max(0,flash-dt*3);shake=Math.max(0,shake-dt*10);flashSign=Math.max(0,flashSign-dt*2.5);
  const kv=(keys.ArrowLeft?-1:0)+(keys.ArrowRight?1:0);if(kv){paddle.x+=kv*280*dt;clampPaddle();}
  const nw=wideT.filter(x=>x>t).length,tw=Math.min(96,paddle.base*[1,1.4,1.75][nw]);paddle.w+=(tw-paddle.w)*Math.min(1,dt*10);clampPaddle();paddle.sq=Math.max(0,paddle.sq-dt*5);
  for(const b of bricks)b.wob=Math.max(0,b.wob-dt*2.6);
  if(st==='ready'){for(const b of balls){b.x=paddle.x;b.y=paddle.y-b.r-1;}}
  if(st==='play'){acc+=dt;let n=0;while(acc>=STEP&&n<24){physStep();acc-=STEP;n++;if(st!=='play')break;}if(n>=24)acc=0;for(const b of balls)trail.push({x:b.x,y:b.y,t});}
  else acc=0;
  if(boss&&st!=='play'){/* the boss keeps breathing on the spot between lives */}
  for(const c of caps){c.y+=c.vy*dt;const p=paddle;if(c.y+5>=p.y&&c.y-5<=p.y+p.h&&Math.abs(c.x-p.x)<=p.w/2+8){c.got=true;catchCap(c);}}
  caps=caps.filter(c=>!c.got&&c.y<H+10);
  for(const q of parts){q.t+=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=240*dt;q.rot+=q.vr*dt;}parts=parts.filter(q=>q.t<q.life);
  for(const q of pops)q.t+=dt;pops=pops.filter(q=>q.t<1.4);trail=trail.filter(q=>t-q.t<0.14);
  for(const o of orbs){o.y-=o.v*dt;o.x+=Math.sin(t*0.3+o.p)*4*dt;if(o.y<-30){o.y=H+30;o.x=Math.random()*W;}}}

/* =====================================================================================================
   DRAWING: pre-baked at the screen's real resolution, candy glass, neon glows
   ===================================================================================================== */
const SPR={};
function hexA(h,a){const n=parseInt(h.slice(1),16);return 'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+a+')';}
function lighten(h,f){const n=parseInt(h.slice(1),16);return 'rgb('+[n>>16&255,n>>8&255,n&255].map(v=>Math.round(v+(255-v)*f)).join(',')+')';}
function darken(h,f){const n=parseInt(h.slice(1),16);return 'rgb('+[n>>16&255,n>>8&255,n&255].map(v=>Math.round(v*(1-f))).join(',')+')';}
const M=8;
/* the bricks: dark glass with a neon tube inside, in the row's colour. Bricks that need more hits have short extra tubes inside,
   one for every extra hit, that go dark one by one; the gift bricks show the letter of the capsule they drop and flicker */
const rnd=(a,b,c)=>{let h=(a*73856093)^(b*19349663)^(c*83492791);h=(h^(h>>>13))*1274126177;return ((h^(h>>>16))>>>0)/4294967296;};
function mixHex(a,b,f){const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16),m=(x,y)=>Math.round(x+(y-x)*f);
  return '#'+[m(A>>16&255,B>>16&255),m(A>>8&255,B>>8&255),m(A&255,B&255)].map(v=>clamp(v,0,255).toString(16).padStart(2,'0')).join('');}
function brickColour(b){if(b.gift)return CAPS[b.cap].col;const next=ROWCOL[Math.min(ROWS-1,b.r+1)];return mixHex(b.col,next,clamp(0.35*(b.c/(COLS-1))+0.08*(rnd(b.r,b.c,lvl)-0.5),0,1));}
function bakeNeon(col,hp,maxhp,letter){const c=mk((BW+2*M)*K,(BH+2*M)*K),x=c.getContext('2d');x.scale(K,K);x.translate(M+1,M+1);const w=BW-2,h=BH-2;
  x.beginPath();x.roundRect(0,0,w,h,2);x.fillStyle=mixHex(col,'#0a0418',0.8);x.fill();
  const gl=x.createLinearGradient(0,0,0,h);gl.addColorStop(0,hexA(col,0.3));gl.addColorStop(1,hexA(col,0.1));x.fillStyle=gl;x.beginPath();x.roundRect(0.5,0.5,w-1,h-1,1.8);x.fill();
  x.strokeStyle=hexA(col,0.5);x.lineWidth=0.5;x.beginPath();x.roundRect(0.25,0.25,w-0.5,h-0.5,2);x.stroke();
  const tube=(path,lit)=>{x.save();x.lineCap='round';x.lineJoin='round';
    if(lit){x.shadowColor=col;x.shadowBlur=4;x.strokeStyle=lighten(col,0.3);x.lineWidth=1.4;path();x.stroke();x.shadowBlur=0;x.strokeStyle='rgba(255,255,255,0.9)';x.lineWidth=0.45;path();x.stroke();}
    else{x.strokeStyle=hexA(col,0.3);x.lineWidth=1.1;path();x.stroke();}x.restore();};
  tube(()=>{x.beginPath();x.roundRect(2.1,2.1,w-4.2,h-4.2,2.1);},true);
  if(letter){x.save();x.font='700 7.5px "Fredoka", sans-serif';x.textAlign='center';x.textBaseline='middle';x.shadowColor=col;x.shadowBlur=3;x.fillStyle='#ffffff';x.fillText(letter,w/2,h/2+0.4);x.restore();}
  else if(maxhp>1){/* the extra tubes: one bar across the middle, or two side by side */const bars=maxhp===2?[[w/2-4.6,w/2+4.6]]:[[w/2-6.4,w/2-1.4],[w/2+1.4,w/2+6.4]];bars.forEach(([x0,x1],k)=>tube(()=>{x.beginPath();x.moveTo(x0,h/2);x.lineTo(x1,h/2);},k<hp-1));}
  x.fillStyle='rgba(255,255,255,0.22)';x.fillRect(1.2,0.9,w-2.4,0.55);
  return c;}
function bakeFlash(){const c=mk((BW+2*M)*K,(BH+2*M)*K),x=c.getContext('2d');x.scale(K,K);x.shadowColor='#ffffff';x.shadowBlur=5;x.fillStyle='#ffffff';x.beginPath();x.roundRect(M+1,M+1,BW-2,BH-2,2);x.fill();return c;}
function bakeBricks(){if(!K)return;for(const b of bricks){b.tint=brickColour(b);b.spr={};for(let hp=1;hp<=b.max;hp++)b.spr[hp]=bakeNeon(b.tint,hp,b.max,b.gift?b.cap:null);}SPR.whiteV=bakeFlash();}
const glowFor=col=>SPR.glow[col]||(SPR.glow[col]=bakeGlow(col));
function bakeGlow(col){const c=mk((BW+2*M)*K,(BH+2*M)*K),x=c.getContext('2d');x.scale(K,K);x.shadowColor=col;x.shadowBlur=7;x.fillStyle=col;x.beginPath();x.roundRect(M+1,M+1,BW-2,BH-2,3.6);x.fill();
  x.globalCompositeOperation='destination-out';x.shadowBlur=0;x.beginPath();x.roundRect(M+1,M+1,BW-2,BH-2,3.6);x.fill();return c;}
function bakeDot(r,col){const s=r*2,c=mk(s*K,s*K),x=c.getContext('2d');x.scale(K,K);const gr=x.createRadialGradient(r,r,0,r,r,r);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.25,col);gr.addColorStop(1,hexA(col,0));x.fillStyle=gr;x.fillRect(0,0,s,s);return c;}
function bakeLetter(l,L,lit){const pad=L.fs*0.8,c=mk((l.w+pad*2)*K,(L.fs*1.6+pad)*K),x=c.getContext('2d');x.scale(K,K);x.font=SIGNFONT(L.fs);x.textAlign='center';x.textBaseline='middle';const cx=l.w/2+pad,cy=(L.fs*1.6+pad)/2;
  if(lit){x.shadowColor=L.col;x.shadowBlur=L.fs*0.7;x.fillStyle=L.col;x.fillText(l.ch,cx,cy);x.shadowBlur=L.fs*0.25;x.fillText(l.ch,cx,cy);x.shadowBlur=0;x.fillStyle=lighten(L.col,0.75);x.fillText(l.ch,cx,cy);}
  else{x.fillStyle=hexA(L.col,0.13);x.fillText(l.ch,cx,cy);x.lineWidth=0.5;x.strokeStyle=hexA(L.col,0.22);x.strokeText(l.ch,cx,cy);}
  return {c,ox:-pad,oy:-cy};}
function bakeBg(){const c=mk(W*K,H*K),x=c.getContext('2d');x.scale(K,K);const gr=x.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#14072e');gr.addColorStop(0.55,'#0b0620');gr.addColorStop(1,'#05030c');x.fillStyle=gr;x.fillRect(0,0,W,H);
  x.globalAlpha=0.18;x.strokeStyle='#3d2a6e';x.lineWidth=0.5;for(let y=BY-6,r=0;y<BY+ROWS*BH+10;y+=9,r++){x.beginPath();x.moveTo(BX-4,y);x.lineTo(BX+COLS*BW+4,y);x.stroke();for(let xx=BX-4+(r%2)*9;xx<BX+COLS*BW+4;xx+=18){x.beginPath();x.moveTo(xx,y);x.lineTo(xx,y+9);x.stroke();}}
  x.globalAlpha=1;const fl=x.createLinearGradient(0,H-90,0,H);fl.addColorStop(0,'rgba(79,227,255,0)');fl.addColorStop(1,'rgba(79,227,255,0.10)');x.fillStyle=fl;x.fillRect(0,H-90,W,90);return c;}
/*__SOFA__*/
const CROWN=new Image();CROWN.src='/*__CROWN__*/';
function bakeSofa(){const w=60,h=w*(58+22)/104,c=mk((w+16)*K,(h+16)*K),x=c.getContext('2d');x.scale(K,K);x.translate(8,8);x.shadowColor='rgba(255,61,110,0.9)';x.shadowBlur=10;paintSofa(x,w,h,true);
  x.shadowBlur=0;if(CROWN.complete&&CROWN.naturalWidth){const cw=w*0.33;x.drawImage(CROWN,w/2-cw/2,-h*0.02,cw,cw*CROWN.naturalHeight/CROWN.naturalWidth);}return {c,w,h};}
CROWN.onload=()=>{if(K)SPR.sofa=bakeSofa();};
function bakeSign(){if(!K)return;for(const L of SIGN)for(const l of L.letters){if(l.space)continue;l.on=bakeLetter(l,L,true);l.off=bakeLetter(l,L,false);}}
/* the off-beat pulse: a pink glow from the edges of the screen */
function bakeVignette(){const c=mk(W*K,H*K),x=c.getContext('2d');x.scale(K,K);const gr=x.createRadialGradient(W/2,H/2,H*0.28,W/2,H/2,H*0.62);gr.addColorStop(0,'rgba(255,95,210,0)');gr.addColorStop(1,'rgba(255,95,210,0.55)');x.fillStyle=gr;x.fillRect(0,0,W,H);return c;}
const RM=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
function bake(){SPR.glow={};SPR.spark={};for(const col of new Set(ROWCOL.concat(Object.values(CAPS).map(d=>d.col),['#ffffff','#ffd36b'])))SPR.spark[col]=bakeDot(4,col);
  SPR.ball=bakeDot(9,'#bff6ff');SPR.orb=bakeDot(24,'#7a3cff');SPR.bg=bakeBg();SPR.vig=bakeVignette();layoutSign();bakeSign();SPR.sofa=bakeSofa();bakeBricks();}
function flick(d){if(d<0)return 0;for(const [e,v] of [[0.05,1],[0.12,0],[0.16,1],[0.27,0.2],[0.32,1]])if(d<e)return v;return 1;}
function txt(s,x,y,size,col,o={}){g.save();g.font=(o.w||700)+' '+size+'px '+getComputedStyle(document.body).fontFamily;g.textAlign=o.align||'center';g.textBaseline='middle';
  if(o.maxW){const w=g.measureText(s).width;if(w>o.maxW){g.translate(x,y);g.scale(o.maxW/w,o.maxW/w);g.translate(-x,-y);}}
  if(o.sc&&o.sc!==1){g.translate(x,y);g.scale(o.sc,o.sc);g.translate(-x,-y);}
  if(o.a!==undefined)g.globalAlpha=clamp(o.a,0,1);if(o.glow){g.shadowColor=o.glow;g.shadowBlur=o.blur||8;}
  if(o.stroke){g.lineJoin='round';g.lineWidth=o.stroke;g.strokeStyle='rgba(5,3,12,0.85)';g.strokeText(s,x,y);}
  g.fillStyle=col;g.fillText(s,x,y);g.restore();}
const spr=(c,x,y,w,h)=>g.drawImage(c,x,y,w,h);
function draw(){const be=beatEnv();g.setTransform(K,0,0,K,0,0);spr(SPR.bg,0,0,W,H);
  let zk=1;if(st==='win'){const u=t-zoom.t;zk=1+0.16*Math.sin(clamp(u/1.6,0,1)*Math.PI);}
  if(!RM&&be>0.01){const pz=1+0.006*be;g.translate(W/2,H/2);g.scale(pz,pz);g.translate(-W/2,-H/2);}
  const sx=shake?(Math.random()-0.5)*shake:0,sy=shake?(Math.random()-0.5)*shake:0;g.save();g.translate(sx+zoom.x,sy+zoom.y);g.scale(zk,zk);g.translate(-zoom.x,-zoom.y);
  g.globalCompositeOperation='lighter';for(const o of orbs){g.globalAlpha=0.10+0.10*be;spr(SPR.orb,o.x-o.s,o.y-o.s,o.s*2,o.s*2);}g.globalAlpha=1;
  for(const L of SIGN){const lf=Math.max(L.done?Math.max(0,1-(t-L.doneT)/0.6):0,flashSign*0.5);for(const l of L.letters){if(l.space||!l.on)continue;const off=l.off,on=l.on;
      g.globalCompositeOperation='source-over';spr(off.c,l.x+off.ox,L.y+off.oy,off.c.width/K,off.c.height/K);
      if(l.lit){g.globalCompositeOperation='lighter';g.globalAlpha=clamp(flick(t-l.litT)*(0.82+0.18*be),0,1);spr(on.c,l.x+on.ox,L.y+on.oy,on.c.width/K,on.c.height/K);
        if(lf>0){g.globalAlpha=lf*0.6;spr(on.c,l.x+on.ox,L.y+on.oy,on.c.width/K,on.c.height/K);}g.globalAlpha=1;}}}
  g.globalCompositeOperation='source-over';
  let sweep=-1;if(AC&&started&&stage>=2&&st==='play'){const now=AC.currentTime;let lb=null;for(const r of ring)if(r.i%16===0&&r.T<=now)lb=r.T;if(lb!=null){const u=(now-lb)/(60/bpm()*4);if(u<0.7)sweep=u/0.7*1.25-0.12;}}
  for(const b of bricks){if(!b.alive)continue;const u=t-b.hitT,wob=b.wob*Math.sin(u*38)*0.14,cx=b.x+BW/2,cy=b.y+BH/2;
    g.save();g.translate(cx,cy);g.scale(1+wob,1-wob);g.translate(-cx,-cy);
    /* a gift brick flickers now and then, like a neon tube about to go */const fl=b.gift?flick((t+b.c*0.37+b.r*0.53)%2.6):1;
    g.globalCompositeOperation='lighter';g.globalAlpha=(0.35+0.45*be)*(b.gift?1.25*fl:1);spr(glowFor(b.tint||b.col),b.x-M,b.y-M,BW+2*M,BH+2*M);g.globalAlpha=1;g.globalCompositeOperation='source-over';
    const img=u<0.07?SPR.whiteV:b.spr&&b.spr[b.hp];if(img){g.globalAlpha=0.45+0.55*fl;spr(img,b.x-M,b.y-M,BW+2*M,BH+2*M);g.globalAlpha=1;}
    if(sweep>=0){const d=(b.x+b.y*0.9)/(W+H*0.45),a=Math.max(0,1-Math.abs(d-sweep)/0.07);if(a>0){g.globalCompositeOperation='lighter';g.globalAlpha=a*0.32;spr(SPR.whiteV,b.x-M,b.y-M,BW+2*M,BH+2*M);g.globalAlpha=1;g.globalCompositeOperation='source-over';}}
    g.restore();}
  if(boss&&SPR.sofa){const u=t-(boss.flashT||-9),sq=u<0.3?Math.sin(u*30)*0.18*(1-u/0.3):0,br=Math.sin(t*3)*0.03,s=SPR.sofa;g.save();g.translate(boss.x,boss.y+boss.h/2);g.scale(1+sq+br,1-sq-br);
    spr(s.c,-s.w/2-8,-s.h-4,s.w+16,s.h+16);if(u<0.08){g.globalCompositeOperation='lighter';g.globalAlpha=0.6;spr(s.c,-s.w/2-8,-s.h-4,s.w+16,s.h+16);g.globalAlpha=1;g.globalCompositeOperation='source-over';}g.restore();
    for(let i=0;i<boss.max;i++){g.fillStyle=i<boss.hp?'#ff3d6e':'rgba(255,61,110,0.2)';g.beginPath();g.roundRect(boss.x-boss.max*3.5+i*7+1,boss.y-boss.h/2-10,5,3,1.5);g.fill();}}
  g.globalCompositeOperation='lighter';
  for(const q of trail){const a=1-(t-q.t)/0.14;g.globalAlpha=0.5*a;const r=6*a+2;spr(SPR.ball,q.x-r,q.y-r,r*2,r*2);}
  g.globalAlpha=1;for(const b of balls)spr(SPR.ball,b.x-9,b.y-9,18,18);
  for(const q of parts){const a=Math.max(0,1-q.t/q.life);g.globalAlpha=a;if(q.shard){g.globalCompositeOperation='source-over';g.save();g.translate(q.x,q.y);g.rotate(q.rot);g.fillStyle=q.col;g.fillRect(-q.s/2,-q.s/3,q.s,q.s*0.66);g.fillStyle='rgba(255,255,255,0.6)';g.fillRect(-q.s/2,-q.s/3,q.s,q.s*0.2);g.restore();}
    else{g.globalCompositeOperation='lighter';spr(SPR.spark[q.col]||SPR.spark['#ffffff'],q.x-4,q.y-4,8,8);}}
  g.globalAlpha=1;g.globalCompositeOperation='source-over';
  for(const c of caps){const d=CAPS[c.k];g.save();g.shadowColor=d.col;g.shadowBlur=10;const gr=g.createLinearGradient(0,c.y-6,0,c.y+6);gr.addColorStop(0,lighten(d.col,0.6));gr.addColorStop(1,darken(d.col,0.2));g.fillStyle=gr;g.beginPath();g.roundRect(c.x-12,c.y-6,24,12,6);g.fill();g.restore();
    g.fillStyle='rgba(255,255,255,0.7)';g.beginPath();g.roundRect(c.x-9,c.y-5,18,4,2);g.fill();txt(c.k,c.x,c.y+0.8,9,'#1a0f2e');}
  const p=paddle,sq=p.sq*3,ph=t-p.hitT<0.12;g.save();g.shadowColor='#4fe3ff';g.shadowBlur=14+8*be+(ph?14:0);const gr=g.createLinearGradient(0,p.y,0,p.y+p.h);gr.addColorStop(0,ph?'#ffffff':'#d8fbff');gr.addColorStop(0.5,'#4fe3ff');gr.addColorStop(1,'#1677a6');g.fillStyle=gr;
  g.beginPath();g.roundRect(p.x-p.w/2-sq/2,p.y+sq*0.35,p.w+sq,p.h-sq*0.35,5);g.fill();g.restore();
  g.strokeStyle='rgba(255,255,255,0.45)';g.lineWidth=0.4;for(let i=0;i<3;i++){const yy=p.y+3+i*2+sq*0.3;g.beginPath();g.moveTo(p.x-p.w/2+5,yy);g.lineTo(p.x+p.w/2-5,yy);g.stroke();}
  g.fillStyle='rgba(255,255,255,0.75)';g.beginPath();g.roundRect(p.x-p.w/2+4,p.y+1.2+sq*0.35,p.w-8,2.2,1.1);g.fill();
  for(const q of pops){const u=q.t/1.4,s=q.big?1.6:1.1;txt(q.txt,q.x,q.y-u*18,9*s,q.col,{a:Math.min(1,(1-u)*2.4),sc:1+0.25*Math.max(0,1-q.t*6),stroke:3,glow:q.col,blur:8});}
  g.restore();
  if(be>0.01&&SPR.vig&&st!=='over'){g.globalCompositeOperation='lighter';g.globalAlpha=0.16*be;spr(SPR.vig,0,0,W,H);g.globalAlpha=1;g.globalCompositeOperation='source-over';}
  if(flash>0){g.fillStyle='rgba(255,255,255,'+flash*0.45+')';g.fillRect(0,0,W,H);}
  if(combo>=3&&st==='play'){const u=t-comboT,k=1+0.35*Math.max(0,1-u*5),hot=Math.min(1,combo/12);
    txt('x'+Math.min(combo,12),14,H-72,13+hot*7,hot>0.6?'#ffd36b':'#ff5fd2',{align:'left',sc:k,glow:hot>0.6?'#ffb347':'#ff5fd2',blur:10+hot*8,stroke:4});txt('combo',15,H-58,8,'#a99cc8',{align:'left',w:600});}
  txt(String(score),12,18,16,'#ffffff',{align:'left',glow:'rgba(79,227,255,0.6)',blur:6});
  {const on432=S.tune===432,col=on432?'#ffd36b':'#4fe3ff',amp=1.6+4*be+3*flashSign,x0=W/2-44,y0=17;g.save();g.shadowColor=col;g.shadowBlur=8;g.strokeStyle=col;g.lineWidth=1.3;g.beginPath();
    for(let i=0;i<=26;i++){const xx=x0+i,yy=y0+Math.sin(i*0.75-t*9)*amp*Math.sin(i/26*Math.PI);if(i)g.lineTo(xx,yy);else g.moveTo(xx,yy);}g.stroke();g.restore();
    g.save();g.font='17px "Tilt Neon", "Fredoka", sans-serif';g.textAlign='left';g.textBaseline='middle';g.shadowColor=col;g.shadowBlur=10+8*be;g.fillStyle=lighten(col,0.4);g.fillText(S.tune+' Hz',W/2-12,y0+1);g.restore();}
  for(let i=0;i<lives;i++){const x=W-16-i*15,y=18;g.save();g.shadowColor='#ff3d6e';g.shadowBlur=6;g.fillStyle='#ff3d6e';g.beginPath();g.moveTo(x,y+4);g.bezierCurveTo(x-7,y-1,x-4,y-7,x,y-3);g.bezierCurveTo(x+4,y-7,x+7,y-1,x,y+4);g.fill();g.restore();}
  const pct=bricks.length?1-alive()/bricks.length:0;g.fillStyle='rgba(255,255,255,0.08)';g.beginPath();g.roundRect(12,30,W-24,4,2);g.fill();g.save();g.shadowColor='#ff5fd2';g.shadowBlur=8;g.fillStyle='#ff5fd2';g.beginPath();g.roundRect(12,30,Math.max(4,(W-24)*pct),4,2);g.fill();g.restore();
  txt('livello '+lvl+' · record '+Math.max(best,score),12,BY-14,8,'#a99cc8',{align:'left',w:600});if(started)txt(chordAt(AC.currentTime).name,W-12,BY-14,8,'rgba(79,227,255,0.8)',{align:'right',w:600});
  if(LAB&&balls[0]&&balls[0].vol)txt('previsti '+balls[0].fc+' · suonati '+balls[0].vol.k,W/2+30,BY-14,8,'rgba(255,211,107,0.8)',{align:'center',w:600});
  if(bannerTxt&&t-bannerT<1.4){const u=(t-bannerT)/1.4;txt(bannerTxt,W/2,H-150,15,'#ffffff',{maxW:W-30,a:Math.min(1,(1-u)*3),sc:0.8+0.3*Math.min(1,u*6),glow:'#ff5fd2',blur:14,stroke:4});}
  const blink=0.6+0.4*Math.sin(t*5);
  if(st==='ready'){txt(lives===3&&score===0?'Tocca per lanciare':'Tocca per ripartire',W/2,H-86,13,'#ffd36b',{a:blink,glow:'rgba(255,211,107,0.7)',blur:10});
    if(lives===3&&score===0&&lvl===1){txt('Il muro suona a '+S.tune+' Hz',W/2,H-124,15,'#ffd36b',{glow:'#ffb347',blur:12,stroke:3});txt('dal reggae allo ska · alza il volume',W/2,H-106,9.5,'#4fe3ff',{w:500});}}
  if(st==='over'||st==='win'){const u=t-stT;if(st==='over'){g.fillStyle='rgba(5,3,12,0.68)';g.fillRect(0,0,W,H);txt('Fine partita',W/2,H/2-30,26,'#ff3d6e',{glow:'#ff3d6e',blur:16});txt(score+' punti · livello '+lvl,W/2,H/2+4,14,'#ffffff');}
    else if(u>1){const a=clamp((u-1)/0.4,0,1);txt('Insegna accesa!',W/2,BY+ROWS*BH+40,22,'#ffd36b',{a,glow:'#ffd36b',blur:16,stroke:5});txt(score+' punti · '+notesLvl+' note a '+S.tune+' Hz',W/2,BY+ROWS*BH+66,12,'#ffffff',{a,maxW:W-30});}
    if(score>=best&&score>0&&u>1)txt('Nuovo record',W/2,st==='win'?BY+ROWS*BH+86:H/2+26,11,'#4fe3ff',{});
    if(u>(st==='win'?1.6:1.2))txt(st==='win'?'Tocca per il livello '+(lvl+1):'Tocca per rigiocare',W/2,H-80,13,'#ffd36b',{a:blink});}}

/* ---- options and the music lab, open to everyone (settings stay in this browser); ?lab=1 also shows the forecast check ---- */
const LAB=!!window.__LAB||/[?&]lab=1/.test(location.search);
const sheet=document.getElementById('sheet'),$=id=>document.getElementById(id);
function syncSeg(){document.querySelectorAll('.seg[data-k]').forEach(s=>s.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(String(S[s.dataset.k])===b.dataset.v))));}
document.querySelectorAll('.seg[data-k]').forEach(s=>s.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const k=s.dataset.k;S[k]=k==='tune'?+b.dataset.v:b.dataset.v;save();syncSeg();
  if(k==='pad')paddle.base=PADW[S.pad];}));
const pct=v=>Math.round(v*100)+'%';
const RNG=[['mBpm','bpm',v=>Math.round(v/2)+' bpm in reggae, '+v+' allo ska'],['mAccel','accel',v=>'+'+Math.round(v*100)+'%'],['mCx','melCx',v=>(v<0.05?'lineare':v<0.35?'mossa':v<0.65?'ricca':'libera')+' · '+Math.round(v*100)+'%'],
  ['mVolDrum','volDrum',pct],['mVolBass','volBass',pct],['mVolKeys','volKeys',pct],['mVolLead','volLead',pct],['mEcho','echo',pct],['mRev','rev',pct]];
function syncMusic(){for(const [id,k,f] of RNG){$(id).value=MS[k];$(id+'V').textContent=f(+MS[k]);}
  document.querySelectorAll('[data-mk]').forEach(s=>s.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(MS[s.dataset.mk]===b.dataset.v))));
  $('mTone').value=MS.tone;}
function musicChanged(){saveMS();syncMusic();applyVolumes();showMood();}
/* the Suono button: the next tone of the keyboard, like the tone buttons of an 80s home keyboard, with three notes to hear it at once */
function showMood(){$('moodName').textContent=TONES[MS.tone];}
function nextMood(){audio();if(AC&&AC.state==='suspended')AC.resume();startGroove();
  MS.tone=TONE_ORDER[(TONE_ORDER.indexOf(MS.tone)+1)%TONE_ORDER.length];musicChanged();
  if(AC&&started){const {T,i}=slot(),c=chordAt(T),r=72+((c.root-72)%12+12)%12;cutLead(T);playMotif([{d:0,m:r,len:2,v:0.8},{d:2,m:r+(c.maj?4:3),len:2,v:0.8},{d:4,m:r+7,len:3,v:0.9}],i,T);}}
/* a back swipe pauses instead of leaving: one history entry of our own, added on a release (a real user gesture).
   In apps like Facebook the back gesture walks the page history first, so the first swipe lands here */
let guard=false;
function arm(){if(guard)return;try{history.pushState({skanoid:1},'',location.href);guard=true;}catch(e){}}
addEventListener('popstate',()=>{if(!guard)return;guard=false;if(st==='over'){history.back();return;}
  if(sheet.hidden){$('pauseNote').hidden=false;sheet.hidden=false;syncSeg();syncMusic();}});
{for(const [id,k] of RNG)$(id).addEventListener('input',e=>{MS[k]=+e.target.value;musicChanged();});
  document.querySelectorAll('[data-mk]').forEach(s=>s.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;MS[s.dataset.mk]=b.dataset.v;musicChanged();musicLevel(wallP());}));
  $('mTone').addEventListener('change',e=>{MS.tone=e.target.value;musicChanged();});
  $('mReset').addEventListener('click',()=>{MS=JSON.parse(JSON.stringify(MDEF));musicChanged();musicLevel(wallP());});
  $('mCopy').addEventListener('click',()=>{const s=JSON.stringify(MS),ta=$('mCopyTxt');ta.value=s;const done=()=>{$('mCopy').textContent='Copiate';setTimeout(()=>{$('mCopy').textContent='Copia le impostazioni';},1500);};
    try{navigator.clipboard.writeText(s).then(done,()=>{ta.hidden=false;ta.select();});}catch(e){ta.hidden=false;ta.select();}});}
optB.addEventListener('click',()=>{$('pauseNote').hidden=true;sheet.hidden=false;syncSeg();syncMusic();});
$('close').addEventListener('click',()=>{sheet.hidden=true;$('pauseNote').hidden=true;arm();audio();if(AC&&AC.state==='suspended')AC.resume();startGroove();});
document.addEventListener('visibilitychange',()=>{if(!AC)return;if(document.hidden)AC.suspend();else AC.resume();});
for(let i=0;i<9;i++)orbs.push({x:Math.random()*W,y:Math.random()*H,v:4+Math.random()*7,s:14+Math.random()*22,p:Math.random()*6});
paddle={x:W/2,y:H-46,h:10,base:PADW[S.pad],w:PADW[S.pad],sq:0,hitT:-9};
setSign(SIGNS[0]);showMood();addEventListener('resize',()=>{fit();placeOpt();});fit();placeOpt();
if(document.fonts){document.fonts.load('30px "Tilt Neon"').then(()=>document.fonts.load('700 16px "Fredoka"')).then(()=>{bake();placeOpt();}).catch(()=>{});}
newGame();let last=performance.now();
window.__SKANOID={get stage(){return stage;},get wantStage(){return wantStage;},bpm,get tempoP(){return tempoP;},get ending(){return ending;},get KEY(){return KEY;},get leadQ(){return leadQ;},get songStep(){return songStep;},get chordIdx(){return chordIdx;},get sim(){return sim;},get lives(){return lives;},set lives(v){lives=v;},FCLOG,get bricks(){return bricks;},get balls(){return balls;},get boss(){return boss;},get st(){return st;},onReal,forecast,win,nextLevel,get lvl(){return lvl;},NLOG,get MS(){return MS;},catchCap,get paddle(){return paddle;},get t(){return t;},get chords(){return chords;}};
function frame(now){let dt=Math.min(1/30,(now-last)/1000);last=now;if(slowT>0){slowT-=dt;dt*=slowF;}if(sheet.hidden&&!document.hidden)update(dt);if(!document.hidden)musicTick();draw();requestAnimationFrame(frame);}
requestAnimationFrame(frame);
};
