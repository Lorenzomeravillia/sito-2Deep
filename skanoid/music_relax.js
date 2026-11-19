/* =====================================================================================================
   MUSIC (the relaxing version), spa style, tuned to A=432 Hz. A drone on the key note, chords that change slowly and cross-fade
   (shared notes keep sounding), consonant colours only. Pitched notes on top come from the ball: at every
   bounce on the paddle the game already knows how many bricks the ball will break before it comes back
   (the physics runs on a fixed step, so the forecast is exact) and writes a phrase of that many notes that
   rises, turns and lands on the chord's root with the last brick. Higher rows play chords, not single notes.
   Over the level the register climbs, the pad gets richer and the percussion grows with the ball's speed.
   ===================================================================================================== */
const MDEF={transT:3,auto:12,minGap:6,paddle:true,prog:'spa',enrich:true,bpm:84,accel:true,
  v:{sub:true,drone:true,root:true,third:true,fifth:true,ninth:true,sixth:false,seventh:false,high:true},volPad:0.8,volDrum:0.7,volNote:1,
  melCx:0.3,scene:'2deep',tim:'spa',timHi:'spa',drum:'reggae',dens:0.5,swing:0,pump:0,bright:0.5,rev:0.38,dly:0,chorus:0.3};
/* atmospheres from the Tappeto armonico app: accompaniment only (harmony level, timbres, percussion, space). Tempo and melody stay as they are */
const SCENE_V={sub:true,drone:true,root:true,third:true,fifth:true,ninth:false,sixth:false,seventh:false,high:true};
const SCENES={'2deep':{prog:'spa',tim:'spa',timHi:'spa',drum:'reggae',dens:0.5,swing:0,pump:0,bright:0.5,rev:0.38,dly:0,chorus:0.3,transT:3,v:MDEF.v},
  quiete:{prog:'colore',tim:'caldo',timHi:'coro',drum:'none',dens:0.5,swing:0,pump:0,bright:0.35,rev:0.48,dly:0,chorus:0.3,transT:4.2,v:SCENE_V},
  brezza:{prog:'colore',tim:'archi',timHi:'coro',drum:'respiro',dens:0.4,swing:0,pump:0,bright:0.45,rev:0.36,dly:0.2,chorus:0.2,transT:3.5,v:SCENE_V},
  groove:{prog:'ricco',tim:'epiano',timHi:'caldo',drum:'pulsazione',dens:0.6,swing:0.25,pump:0.45,bright:0.55,rev:0.24,dly:0.25,chorus:0.15,transT:2.2,v:SCENE_V},
  bossa:{prog:'ricco',tim:'epiano',timHi:'archi',drum:'bossa',dens:0.55,swing:0.15,pump:0,bright:0.5,rev:0.28,dly:0.1,chorus:0.25,transT:2.5,v:SCENE_V},
  viaggio:{prog:'modale',tim:'vetro',timHi:'coro',drum:'spezzato',dens:0.5,swing:0.1,pump:0.15,bright:0.5,rev:0.44,dly:0.35,chorus:0.35,transT:3.2,v:SCENE_V},
  spazio:{prog:'libero',tim:'campana',timHi:'coro',drum:'sussurro',dens:0.35,swing:0,pump:0,bright:0.4,rev:0.6,dly:0.4,chorus:0.4,transT:4.5,v:SCENE_V}};
let MS=JSON.parse(JSON.stringify(MDEF));
try{const o=JSON.parse(LS('music')||'null');if(o){Object.assign(MS,o);MS.v=Object.assign({},MDEF.v,o.v||{});}}catch(e){}
const saveMS=()=>{try{localStorage.setItem('skanoid_music',JSON.stringify(MS));}catch(e){}};
let AC=null,BUS=null,MEL=null,PADF=null,PADG=null,PADDUCK=null,DRUMG=null,NOTEG=null,NOISE=null,DL=null,REVG=null,PADDLY=null,started=false,nextStep=0,stepN=0,ring=[];
let KEY=2;const MAJ=[0,2,4,5,7,9,11],NAMES=['DO','DO#','RE','MIB','MI','FA','FA#','SOL','LAB','LA','SIB','SI'];
const PROG={spa:{0:[[3,4],[5,3],[1,1]],3:[[0,5],[5,1.5],[1,1]],5:[[3,4],[0,2],[1,1]],1:[[3,3],[0,1],[5,1]]},
  tappeto:{0:[[1,1],[3,3],[4,3],[5,2]],1:[[4,4],[3,1],[5,1]],3:[[0,2],[4,3],[1,1],[5,1]],4:[[0,4],[5,2],[3,1]],5:[[3,3],[1,2],[4,1]]}};
const pickW=a=>{let s=0;for(const x of a)s+=x[1];let r=Math.random()*s;for(const x of a){if((r-=x[1])<=0)return x[0];}return a[a.length-1][0];};
const mtof=m=>S.tune*Math.pow(2,(m-69)/12);
const deg=(d,k)=>(KEY+MAJ[(d+k)%7])%12;
const KSC={ion:[0,2,4,5,7,9,11],dor:[0,2,3,5,7,9,10],mix:[0,2,4,5,7,9,10],aeo:[0,2,3,5,7,8,10],lyd:[0,2,4,6,7,9,11]};
const scaleOf=(r,mode)=>KSC[mode].map(x=>(r+x)%12);
/* a chord from its root and its scale: the scale gives the colours (ninth, sixth, seventh) and the notes the melody may use;
   penta is the scale without the notes a semitone away from the chord, the safe set for simple phrases */
function mkChord(root,scale,o){o=o||{};const rel=scale.map(p=>(p-root+12)%12).sort((a,b)=>a-b),at=k=>(root+rel[k])%12,sus=!!o.sus&&rel[3]===5;
  const pcs=[root,sus?at(3):at(2),at(4)],maj=!sus&&rel[2]===4,add=o.add||[];
  let sc=scale.slice();const rank=p=>pcs.includes(p)?2:0;
  for(let i=0;i<3;i++){const lo=sc.find(p=>sc.includes((p+1)%12));if(lo==null)break;const hi=(lo+1)%12;sc=sc.filter(p=>p!==(rank(lo)<rank(hi)?lo:hi));}
  const s7=add.includes('seventh'),n9=add.includes('ninth'),n6=add.includes('sixth'),name=NAMES[root]+(maj||sus?'':'m')+(s7?(rel[6]===11?'maj7':'7')+(sus?'sus4':'')+(n9?'(9)':''):(sus?'sus4':'')+(n6&&n9?'6/9':n6?'6':n9?'add9':''));
  return{d:o.d==null?-1:o.d,root,maj,pcs,penta:sc,scale:scale.slice(),ninth:at(1),sixth:at(5),seventh:at(6),add,pedal:o.pedal,sus,name};}
const chordOf=(d,o)=>mkChord(deg(d,0),scaleOf(KEY,'ion'),Object.assign({d},o||{}));
const NLOG=[];let chords=[{t:0,c:chordOf(0)}],sinceTonic=0,chordReq=false,lastChangeT=0,cadence=null,mlevel=0,annLevel=0,melSlots={},ending=false,lastMel=72,lastStart=null,pend=null;
const chordAt=T=>{let c=chords[0].c;for(const x of chords)if(x.t<=T+1e-4)c=x.c;return c;};
const curChord=()=>chords[chords.length-1].c;
/* harmony levels: our spa giro, then the five levels of the app (Semplice, Colore, Ricco, Modale, Libero) written for the game */
const HLV={spa:0,tappeto:1,colore:2,ricco:3,modale:4,libero:5};
const hlv=()=>HLV[MS.prog]||0;
const preD=()=>[1,2,3].includes(hlv())?4:3;
function colours(l){if(l<2)return[];if(l===2)return pickW([[[],2],[['seventh'],2],[['ninth'],2],[['seventh','ninth'],1]]);
  return pickW([[['ninth'],1.5],[['seventh','ninth'],2],[['sixth','ninth'],1.5],[['seventh'],1]]);}
function nextChord(){const l=hlv(),cur=curChord(),tw=d=>d===0?1+0.5*sinceTonic:1,giro=P=>{const o=P[cur.d]||P[0];return pickW(o.map(([d,w])=>[d,w*tw(d)]));};let c;
  if(cadence)c=chordOf(preD(),{add:l>=2?(preD()===4?['seventh']:['ninth']):[]});
  else if(pend!=null){c=chordOf(pend,{add:colours(l)});pend=null;}
  else if(l<=1)c=chordOf(giro(l?PROG.tappeto:PROG.spa));
  else if(l===2){const d=giro(PROG.tappeto);c=chordOf(d,{add:colours(2),sus:(d===4||d===1)&&Math.random()<0.35});}
  else if(l===3){const r=Math.random();
    if(cur.d>=0&&r<0.16){/* borrowed: bVII from mixolydian or iv from the parallel minor, then home */c=Math.random()<0.5?mkChord((KEY+10)%12,scaleOf(KEY,'mix'),{d:-2,add:['ninth']}):mkChord((KEY+5)%12,scaleOf(KEY,'aeo'),{d:-3,add:['sixth']});pend=0;}
    else if(cur.d>=0&&r<0.32){/* a secondary dominant that resolves on ii, V or vi */const t=pickW([[1,1],[4,0.8],[5,1.4]]),root=(deg(t,0)+7)%12,th=(root+4)%12;
      c=mkChord(root,scaleOf(KEY,'ion').map(p=>p===(th+11)%12?th:p),{d:-10-t,add:['seventh']});pend=t;}
    else c=chordOf(giro(PROG.tappeto),{add:colours(3)});}
  else if(l===4){/* modal: tonic pedal in the bass, sus chords, bVII instead of the dominant */const d=pickW([[0,1.2*tw(0)],[1,1.2],[3,1.4],[5,1],[-2,1.2]].filter(x=>x[0]!==cur.d));
    const o={add:pickW([[['ninth'],2],[['seventh','ninth'],1.5],[['seventh'],1]]),sus:Math.random()<0.45,pedal:KEY};
    c=d===-2?mkChord((KEY+10)%12,scaleOf(KEY,'mix'),Object.assign(o,{d})):chordOf(d,o);}
  else{/* free: roots move by thirds and semitones, lydian and dorian colours, the tonic comes back now and then */
    if(cur.d!==0&&Math.random()<0.2*sinceTonic)c=chordOf(0,{add:['seventh','ninth']});
    else{let root;do root=(cur.root+pickW([[3,2],[4,2],[8,2],[9,2],[1,1],[11,1],[5,0.5],[7,0.5]]))%12;while(root===KEY);const lyd=Math.random()<0.55;
      c=mkChord(root,scaleOf(root,lyd?'lyd':'dor'),{add:['seventh','ninth']});}}
  sinceTonic=c.d===0?0:sinceTonic+1;return c;}
const speedFactor=h=>1+Math.min(0.55,(h==null?hits:h)*0.005);
const bpm=()=>MS.bpm*(MS.accel?1+0.3*clamp((speedFactor()-1)/0.55,0,1):1);
function audio(){if(AC)return;try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return;}
  try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch(e){}
  const comp=AC.createDynamicsCompressor();comp.threshold.value=-16;comp.ratio.value=3.5;comp.connect(AC.destination);
  BUS=AC.createGain();BUS.gain.value=0.9;BUS.connect(comp);
  const len=AC.sampleRate*3.2,ir=AC.createBuffer(2,len,AC.sampleRate);for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6);}
  const rev=AC.createConvolver();rev.buffer=ir;const rg=AC.createGain();rg.gain.value=MS.rev;REVG=rg;rev.connect(rg);rg.connect(BUS);
  DL=AC.createDelay(2);DL.delayTime.value=0.5;const fb=AC.createGain();fb.gain.value=0.3;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2200;
  DL.connect(lp);lp.connect(fb);fb.connect(DL);const dg=AC.createGain();dg.gain.value=0.22;lp.connect(dg);dg.connect(BUS);
  NOTEG=AC.createGain();NOTEG.gain.value=MS.volNote;NOTEG.connect(BUS);MEL=AC.createGain();MEL.connect(NOTEG);MEL.connect(DL);MEL.connect(rev);
  DRUMG=AC.createGain();DRUMG.gain.value=MS.volDrum;DRUMG.connect(BUS);
  NOISE=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const nd=NOISE.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
  PADF=AC.createBiquadFilter();PADF.type='lowpass';PADF.frequency.value=900;PADF.Q.value=0.5;
  const lfo=AC.createOscillator(),lg=AC.createGain();lfo.frequency.value=0.07;lg.gain.value=250;lfo.connect(lg);lg.connect(PADF.frequency);lfo.start();
  /* the pad dips a little under each note of the ball, so the hits come forward */
  PADDUCK=AC.createGain();PADDUCK.gain.value=1;PADG=AC.createGain();PADG.gain.value=MS.volPad;PADF.connect(PADDUCK);PADDUCK.connect(PADG);PADG.connect(BUS);PADG.connect(rev);PADDLY=AC.createGain();PADDLY.gain.value=MS.dly*0.5;PADG.connect(PADDLY);PADDLY.connect(DL);}
function applyVolumes(){if(!AC)return;const T=AC.currentTime;PADG.gain.setTargetAtTime(MS.volPad,T,0.2);DRUMG.gain.setTargetAtTime(MS.volDrum,T,0.2);NOTEG.gain.setTargetAtTime(MS.volNote,T,0.2);REVG.gain.setTargetAtTime(MS.rev,T,0.2);PADDLY.gain.setTargetAtTime(MS.dly*0.5,T,0.2);}
function duck(T,depth){PADDUCK.gain.cancelScheduledValues(T);PADDUCK.gain.setTargetAtTime(1-depth,T,0.012);PADDUCK.gain.setTargetAtTime(1,T+0.06,0.22);}
let VOICES=[];
const CHOIR={},TIMLV={spa:1,caldo:0.93,archi:1.07,organo:1.2,coro:1.55,vetro:1.3,campana:1.3,epiano:1};let ORGAN=null;
/* the pad timbres of the Tappeto app: the same oscillators, scaled to sit under the ball's notes */
function choirWave(f){const key=Math.round(f*10);if(CHOIR[key])return CHOIR[key];const N=Math.max(3,Math.min(48,Math.floor(4500/f))),re=new Float32Array(N+1),im=new Float32Array(N+1);
  for(let k=1;k<=N;k++){let a=0;for(const [c,b,g] of [[600,90,1],[1040,110,0.55],[2250,160,0.2],[2450,170,0.14]])a+=g/(1+Math.pow((k*f-c)/b,2));im[k]=(a*0.85+0.15/k)/Math.sqrt(k);}
  return CHOIR[key]=AC.createPeriodicWave(re,im);}
function newVoice(role,m,T,fadeIn){const v={role,m,g:AC.createGain(),o:[]};v.g.gain.setValueAtTime(0.0001,T);
  const kind=role==='high'?MS.timHi:MS.tim,f=mtof(m),w=0.4+2*MS.chorus;
  const lvl=role==='sub'?0.16:role==='drone'?0.05:(role==='high'?0.022:0.04)*(TIMLV[kind]||1);
  const add=(type,r,det,a,wave)=>{const o=AC.createOscillator(),og=AC.createGain();if(wave)o.setPeriodicWave(wave);else o.type=type;o.detune.value=det;o.frequency.setValueAtTime(f*r,T);og.gain.value=a;o.connect(og);og.connect(v.g);o.start(T);v.o.push({o,r});return o;};
  const vib=(os,rate,depth)=>{const l=AC.createOscillator(),lg=AC.createGain();l.frequency.value=rate+Math.random()*0.6;lg.gain.setValueAtTime(0,T);lg.gain.linearRampToValueAtTime(depth,T+1.8);l.connect(lg);os.forEach(o=>lg.connect(o.detune));l.start(T);v.o.push({o:l,r:0});};
  const fm=(ratio,i0,i1,tau,a)=>{const car=add('sine',1,0,a),md=AC.createOscillator(),mg=AC.createGain();md.frequency.setValueAtTime(f*ratio,T);mg.gain.setValueAtTime(f*ratio*i0,T);mg.gain.setTargetAtTime(f*ratio*i1,T,tau);md.connect(mg);mg.connect(car.frequency);md.start(T);v.o.push({o:md,r:ratio});};
  if(role==='sub')add('sine',1,0,1);
  else if(role==='drone'){add('triangle',1,0,0.7);add('sawtooth',1,-4*w,0.15);add('sawtooth',1,4*w,0.15);}
  else if(kind==='caldo'){add('sawtooth',1,-3*w,0.5);add('sawtooth',1,3*w,0.25);add('triangle',0.5,0,0.35);}
  else if(kind==='archi')vib([add('sawtooth',1,-10*w,0.34),add('sawtooth',1,0,0.34),add('sawtooth',1,10*w,0.34)],4.8,7);
  else if(kind==='organo'){if(!ORGAN)ORGAN=AC.createPeriodicWave(new Float32Array(9),new Float32Array([0,1,0.42,0.14,0.12,0.03,0.05,0,0.03]));add(null,1,0,0.9,ORGAN);add('sine',1,3*w,0.25);}
  else if(kind==='coro'){const cw=choirWave(f);vib([add(null,1,-8*w,0.5,cw),add(null,1,8*w,0.5,cw)],5,6);}
  else if(kind==='vetro'){fm(3,0.47,0.1,0.9,0.85);add('sine',2,4*w,0.12);}
  else if(kind==='campana'){fm(3.5,0.9,0.08,1.6,0.7);fm(1,0.4,0.05,2.5,0.35);}
  else if(kind==='epiano'){fm(1,1.6,0.35,1.2,0.85);add('sine',1,5*w,0.2);}
  else if(role==='high'){add('sine',1,0,1);add('sine',1,5*w,0.5);}
  else{add('sawtooth',1,-7*w,0.2);add('sawtooth',1,7*w,0.2);add('triangle',1,0,0.6);}
  v.g.connect(role==='sub'?PADDUCK:PADF);v.g.gain.exponentialRampToValueAtTime(lvl,T+Math.max(0.05,fadeIn));VOICES.push(v);return v;}
function killVoice(v,T,fade){v.dead=true;v.end=T+fade+0.2;v.g.gain.cancelScheduledValues(T);v.g.gain.setValueAtTime(Math.max(0.0001,v.g.gain.value),T);v.g.gain.exponentialRampToValueAtTime(0.0001,T+Math.max(0.05,fade));v.o.forEach(x=>x.o.stop(T+fade+0.1));}
const UNLOCK={sub:0,drone:0,root:0,fifth:0,third:1,ninth:2,sixth:3,seventh:3,high:4};
function wanted(c){const lv=ending?4:mlevel,on=k=>(MS.v[k]||c.add.includes(k))&&(!MS.enrich||UNLOCK[k]<=lv)&&!(ending&&(k==='ninth'||k==='sixth'||k==='seventh')),out=[];
  const near=(pc,ref,lo,hi)=>{let b=null;for(let m=lo;m<=hi;m++){if(m%12!==pc)continue;if(b==null||Math.abs(m-ref)<Math.abs(b-ref))b=m;}return b;};
  const prev=r=>{const v=VOICES.find(x=>!x.dead&&x.role===r);return v?v.m:null;};
  if(on('sub'))out.push(['sub',near(c.pedal!=null?c.pedal:c.root,prev('sub')||40,36,47)]);
  if(on('drone')&&c.scale.includes(KEY))out.push(['drone',near(KEY,50,45,56)]);
  for(const [r,pc,ref] of [['root',c.root,57],['third',c.pcs[1],62],['fifth',c.pcs[2],64],['ninth',c.ninth,66],['sixth',c.sixth,67],['seventh',c.seventh,68]])if(on(r))out.push([r,near(pc,prev(r)||ref,54,74)]);
  if(on('high'))out.push(['high',near(c.root,prev('high')||81,76,88)]);
  return out;}
function setPad(c,T,fade){if(!AC)return;const want=wanted(c),tt=fade==null?MS.transT:fade;
  for(const v of VOICES){if(v.dead)continue;if(!want.some(([r,m])=>m===v.m&&(r==='sub')===(v.role==='sub')))killVoice(v,T,tt);}
  for(const [r,m] of want){if(!VOICES.some(v=>!v.dead&&v.m===m&&(r==='sub')===(v.role==='sub')))newVoice(r,m,T,tt);}
  VOICES=VOICES.filter(v=>!v.dead||v.end>AC.currentTime);
  PADF.frequency.setTargetAtTime(padHz(ending?4:mlevel),T,1.5);}
const padHz=l=>[900,1100,1350,1650,2000][l]*(0.55+0.9*MS.bright);
function repad(full){if(!AC||!started)return;const T=AC.currentTime+0.02;if(full)for(const v of VOICES)if(!v.dead)killVoice(v,T,0.8);setPad(curChord(),T,full?0.8:null);}
function retune(){if(!AC)return;const T=AC.currentTime;for(const v of VOICES)if(!v.dead)v.o.forEach(x=>{if(x.r)x.o.frequency.setTargetAtTime(mtof(v.m)*x.r,T,0.05);});}
function startGroove(){if(!AC||started)return;started=true;nextStep=AC.currentTime+0.06;stepN=0;chords=[{t:nextStep,c:chordOf(0)}];lastChangeT=nextStep;setPad(chords[0].c,nextStep);}
function env(gn,T,a,peak,dec){gn.gain.setValueAtTime(0.0001,T);gn.gain.exponentialRampToValueAtTime(peak,T+a);gn.gain.exponentialRampToValueAtTime(0.0001,T+a+dec);}
function osc(type,f,T,dest,peak,a,dec){const o=AC.createOscillator(),gn=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,T);env(gn,T,a,peak,dec);o.connect(gn);gn.connect(dest);o.start(T);o.stop(T+a+dec+0.05);return o;}
function noise(T,dur,type,freq,q,peak,dest){const s=AC.createBufferSource();s.buffer=NOISE;const f=AC.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q||1;const gn=AC.createGain();env(gn,T,0.002,peak,dur);s.connect(f);f.connect(gn);gn.connect(dest||BUS);s.start(T,Math.random()*0.5);s.stop(T+dur+0.05);}
const TIMBRE=['bell','bell','vibes','vibes','vibes','glass','glass','kalimba','kalimba','marimba','marimba','marimba'];
function voice(kind,m,T,v,len){const f=mtof(m);v=v||1;const L=len||1;
  if(kind==='bell'){osc('sine',f,T,MEL,0.12*v,0.003,1.4*L);osc('sine',f*2.76,T,MEL,0.035*v,0.002,0.5*L);}
  else if(kind==='marimba'){osc('sine',f,T,MEL,0.2*v,0.002,0.4*L);osc('sine',f*4,T,MEL,0.05*v,0.001,0.07);}
  else if(kind==='vibes'){osc('sine',f,T,MEL,0.15*v,0.004,1.1*L);osc('sine',f*4,T,MEL,0.022*v,0.002,0.18);}
  else if(kind==='kalimba'){osc('triangle',f,T,MEL,0.16*v,0.002,0.6*L);osc('sine',f*5.4,T,MEL,0.04*v,0.001,0.08);}
  else if(kind==='glass'){osc('sine',f,T,MEL,0.14*v,0.002,0.9*L);osc('sine',f*3,T,MEL,0.035*v,0.002,0.45*L);}
  else{osc('sine',f,T,MEL,0.12*v,0.025,0.7*L);noise(T,0.2,'bandpass',f*2,6,0.025*v,MEL);}}
function tick(T,v){noise(T,0.02,'bandpass',3500,2,0.05*(v||1),DRUMG);}
function kick(T,v){const o=AC.createOscillator(),gn=AC.createGain();o.frequency.setValueAtTime(110,T);o.frequency.exponentialRampToValueAtTime(42,T+0.13);env(gn,T,0.002,0.5*(v||1),0.22);o.connect(gn);gn.connect(DRUMG);o.start(T);o.stop(T+0.3);}
/* the drum patterns of the Tappeto app, 16 sixteenths: '.' rest, 1-9 dynamics, under 6 the hit depends on density.
   k kick, s snare, h hat, r wood, z shaker. In the game the instruments come in with the sign, like the pad voices */
const DSTY={respiro:{k:'9.......5.......',r:'........6.......',z:'3.2.3.2.3.2.3.2.'},
  pulsazione:{k:'8...7...8...7...',s:'....7.......7...',h:'..5...5...5...5.',z:'.2.2.2.2.2.2.2.2'},
  bossa:{k:'7..57..57..57..5',r:'6..6..6...6..6..',z:'4232423242324232'},
  spezzato:{k:'9......5..7.....',s:'........8.......',h:'5.3.5.35.3.5.3.3',r:'...........4....'},
  sussurro:{k:'6...............',h:'......3.......3.',z:'4.2.3.2.4.2.3.2.'}};
const DGATE={z:0,h:0,k:1,r:2,s:3};
const DPLAY={k:(T,v)=>kick(T,0.65*v),s:(T,v)=>{noise(T,0.06,'lowpass',650,0.6,0.19*v,DRUMG);noise(T,0.2,'bandpass',3400,0.8,0.11*v,DRUMG);},
  h:(T,v)=>noise(T,0.05,'highpass',8000,0.7,0.08*v,DRUMG),r:(T,v)=>noise(T,0.025,'bandpass',1850,1.6,0.17*v,DRUMG),z:(T,v)=>noise(T,0.06,'bandpass',8200,1.2,0.07*v,DRUMG)};
function pump(T){const sp=60/bpm();PADDUCK.gain.cancelScheduledValues(T);PADDUCK.gain.setTargetAtTime(1-0.5*MS.pump,T,0.01);PADDUCK.gain.setTargetAtTime(1,T+0.03,sp*0.3);}
function drums(i,T){const s=i%16,lv=mlevel,live=st==='play';if(!live&&st!=='ready')return;
  if(live&&MS.pump>0&&s%4===0)pump(T);
  if(MS.drum==='none')return;
  const P=DSTY[MS.drum];
  if(P){const d=clamp(MS.dens+(lv>=4?0.15:0),0,1);
    for(const ins of ['k','s','h','r','z']){const pat=P[ins];if(!pat||(!live&&ins!=='z'&&ins!=='h')||(MS.enrich&&DGATE[ins]>lv))continue;
      let n=+pat[s]||0;if(!n){if((ins==='h'||ins==='z')&&d>0.6&&Math.random()<(d-0.6)*0.9)n=2;else continue;}
      else if(n<6&&Math.random()>Math.min(1,(n/6)*(0.35+1.3*d)))continue;
      DPLAY[ins](T,(n/9)*(0.88+Math.random()*0.24)*(live?1:0.6));}
    return;}
  /* reggae and ska: the weight is on the offbeat, "in levare" */
  if(s%4===2)noise(T,lv>=4?0.11:0.035,'highpass',7600,0.7,(live?1:0.6)*(lv>=2?0.055:0.035),DRUMG);
  if(lv>=3&&s%2===1)noise(T,0.02,'highpass',9000,0.7,0.018,DRUMG);
  if(!live)return;
  if(lv>=1&&s===8)kick(T,0.7);                         /* one drop: the kick on the third beat */
  if(lv>=2&&s%4===2)noise(T,0.035,'bandpass',2400,3,0.06,DRUMG); /* the rim on the offbeat */
  if(lv>=3&&s===0)kick(T,0.55);
  if(lv>=3&&(s===4||s===12))noise(T,0.13,'bandpass',1800,0.9,lv>=4?0.15:0.09,DRUMG);
  if(lv>=4&&(s===4||s===12))kick(T,0.5);}             /* steppers: a kick on every beat */
let waitQ=[],waitRest=0,waitStart=-1;
function waitMusic(i,T){if(waitStart<0){waitStart=i;waitRest=6;}const k=i-waitStart,six=60/bpm()/4,chordFor=j=>chordOf(((j-waitStart)%48)>=32?3:0);/* four bars at home, two on the fourth, then home again */
  if(k>0&&(k%48===0||k%48===32)){const c=chordFor(i);chords.push({t:T,c});if(chords.length>16)chords.shift();setPad(c,T,2.5);}
  if(i%4===2)noise(T,0.03,'highpass',7600,0.7,0.02,DRUMG);
  if(i%2)return;
  if(waitQ.length){const m=waitQ.shift();if(m!=null)voice('bell',m,T,0.4,1.6);return;}
  if(waitRest>0){waitRest--;return;}
  /* a new little phrase in the key's pentatonic, rising and landing on the chord it will end on */
  const n=4+Math.floor(Math.random()*4),pen=[0,2,4,7,9].map(x=>(KEY+x)%12),cand=[];for(let m=72;m<=91;m++)if(pen.includes(m%12))cand.push(m);
  const plan=planPhrase(n,MS.melCx*0.6),b0=cand.findIndex(m=>m>=77),end=chordFor(i+2*(n-1));
  waitQ=plan.map((o,j)=>{let m=cand[clamp(b0+o,0,cand.length-1)];if(j===n-1){let r=null;for(let x=m-7;x<=m+7;x++)if(((x%12)+12)%12===end.root&&(r==null||Math.abs(x-m)<Math.abs(r-m)))r=x;if(r!=null)m=r;}return m;});
  if(n>4&&Math.random()<0.5)waitQ.splice(2,0,null);
  waitRest=4+Math.floor(Math.random()*5);const m=waitQ.shift();voice('bell',m,T,0.4,1.6);}
function schedule(i,T){if(moodPending&&i%16===0)applyMoodAt(T);if(ending&&st==='win'){waitMusic(i,T);return;}
  if(i%4===0&&!ending){const since=T-lastChangeT,hold=cadence&&curChord().d===preD();
    if(!hold&&((chordReq&&MS.paddle)||since>=MS.auto)){const c=nextChord();if(c.name!==curChord().name){chords.push({t:T,c});if(chords.length>16)chords.shift();setPad(c,T);}lastChangeT=T;chordReq=false;}}
  drums(i,T);}
function musicTick(){if(!AC||!started||AC.state!=='running')return;
  while(nextStep<AC.currentTime+0.12){const sw=stepN%2?MS.swing*0.66*60/bpm()/4:0;schedule(stepN,nextStep+sw);ring.push({i:stepN,T:nextStep+sw});if(ring.length>64)ring.shift();nextStep+=60/bpm()/4;stepN++;}
  DL.delayTime.setTargetAtTime(60/bpm()*0.75,AC.currentTime,0.5);}
function slot(){const now=AC.currentTime+0.012;if(S.quant==='libero'||!started)return{T:now,i:-1};for(const r of ring)if(r.T>=now)return{T:r.T,i:r.i};return{T:nextStep,i:stepN};}
function beatEnv(){if(!AC||!started)return 0;const now=AC.currentTime;let lb=null;for(const r of ring)if(r.i%4===0&&r.T<=now)lb=r.T;return lb==null?0:Math.exp(-(now-lb)*5);}
const LAYERS=[0.15,0.35,0.55,0.75],LAYERN=['RITMO IN LEVARE','SKA & REGGAE','DUE VOCI, DUE STRUMENTI',"UN'UNICA PROFONDITÀ"];
function musicLevel(p){let l=0;for(const x of LAYERS)if(p>=x)l++;if(l>mlevel){mlevel=l;if(l>annLevel){annLevel=l;banner(LAYERN[l-1]);}if(AC&&started)setPad(curChord(),AC.currentTime+0.02);}}
/* ---- the phrase of a volley: the notes the ball will play between two bounces on the paddle ---- */
/* melodic complexity (lab): 0 is the plain arch in the pentatonic; going up, the phrase picks other shapes (valley, rise, fall,
   wave, sequence), leaps of a third or a fourth that are then filled by step, the full scale of the chord and, near the top,
   chromatic grace notes that resolve by a semitone. The landing on the root stays: every phrase still closes */
function planPhrase(n,cx){cx=cx||0;if(n<=0)return[];if(n===1)return[0];
  if(n===2)return cx<0.05?[2,0]:pickW([[[2,0],1],[[1,0],cx],[[-1,0],cx],[[-2,0],0.8*cx],[[3,0],0.7*cx],[[4,0],0.5*cx],[[-3,0],0.4*cx]]);
  const R=Math.random,shape=cx<0.05?'arch':pickW([['arch',1.2],['valley',cx],['rise',0.5*cx],['fall',0.6*cx],['wave',cx],['seq',n>=5?1.2*cx:0]]);
  let x=0,lp=false;const out=[0],mv=()=>{const big=!lp&&R()<0.1+0.45*cx;lp=big;return big?(R()<0.6?2:3):1;};
  if(shape==='arch'||shape==='valley'){const sg=shape==='arch'?1:-1,pk=Math.max(1,Math.round((n-1)*(cx<0.05?0.62:0.4+0.35*R())));
    for(let i=1;i<n;i++){if(cx<0.05){if(i<=pk)x+=(n>7&&R()<0.35)?2:1;else x-=(i===n-1)?0:((x>1&&R()<0.3)?2:1);}else x+=i<=pk?sg*mv():-sg*mv();out.push(x);}}
  else if(shape==='rise'||shape==='fall'){const sg=shape==='rise'?1:-1;for(let i=1;i<n;i++){x+=sg*mv();out.push(x);}}
  else if(shape==='wave'){const sg=R()<0.5?1:-1;for(let i=1;i<n;i++){x+=i%2?sg*(1+(R()<cx?1:0)):-sg;out.push(x);}}
  else{const cell=[0,pickW([[1,1],[2,1],[-1,0.7],[-2,0.5]])],t=R()<0.65?-1:1;if(R()<0.5)cell.push(cell[1]+pickW([[-1,1],[1,0.6],[-2,0.4]]));
    for(let i=1;i<n;i++)out.push(cell[i%cell.length]+Math.floor(i/cell.length)*t);}
  return out;}
function startVolley(b,events){const n=events.filter(e=>e.k!=='tough').length;b.vol={plan:planPhrase(n,MS.melCx),k:0,n,base:null};}
const center=()=>66+9*clamp(1-alive()/bricks.length,0,1)+[0,2,4][(lvl-1)%3];
function harmonyUnder(m,c,count){const out=[];for(let d=3;d<=12&&out.length<count;d++){const x=m-d;if(c.pcs.includes(((x%12)+12)%12)&&!out.some(y=>Math.abs(y-x)<3))out.push(x);}return out;}
function ballNote(b,brick){if(!AC)return;tick(AC.currentTime,0.8);let {T,i}=slot(),busy=false;
  if(i>=0){if(melSlots[i]){const nx=ring.find(r=>r.i===i+1);if(!melSlots[i+1]&&nx){i++;T=nx.T;}else busy=true;}if(!busy){melSlots[i]=1;for(const k in melSlots)if(+k<i-64)delete melSlots[k];}}
  const c=chordAt(T),cx=MS.melCx,cen=center()+(brick&&cx>0?(ROWS/2-brick.r)*0.7*cx:0),span=14+6*cx,pool=cx>=0.35?c.scale:c.penta,cand=[];
  for(let m=Math.round(cen-span);m<=Math.round(cen+span+2);m++)if(pool.includes(((m%12)+12)%12))cand.push(m);
  const V=b&&b.vol;let m,last=false;
  if(V&&V.k<V.plan.length){if(V.base==null){const tones=[];cand.forEach((x,j)=>{if(c.pcs.includes(x%12))tones.push(j);});
      if(cx<0.05){let bi=tones[0];for(const j of tones)if(Math.abs(cand[j]-cen)<Math.abs(cand[bi]-cen))bi=j;V.base=bi;}
      else{/* where the phrase starts: near the register of the moment and of the brick's row, not far from the last note, rarely where the last phrase started */
        const sc=3+5*cx,sl=3+4*cx;V.base=pickW(tones.map(j=>{const dc=cand[j]-cen,dl=cand[j]-lastMel;return[j,Math.exp(-dc*dc/(2*sc*sc)-dl*dl/(2*sl*sl))*(cand[j]===lastStart?0.15:1)+1e-6];}));}
      lastStart=cand[V.base];}
    const j=clamp(V.base+V.plan[V.k],0,cand.length-1);m=cand[j];last=V.k===V.plan.length-1&&V.n>=2;V.k++;
    if(last){/* the landing: the chord's root closest to where the phrase arrived */let r=null;for(let x=m-7;x<=m+7;x++)if(((x%12)+12)%12===c.root&&(r==null||Math.abs(x-m)<Math.abs(r-m)))r=x;if(r!=null)m=r;}}
  else{/* off the forecast (another ball got there first): a step near the last note, wider with more complexity */let j=cand.reduce((bi,x,jj)=>Math.abs(x-lastMel)<Math.abs(cand[bi]-lastMel)?jj:bi,0);
    j=clamp(j+pickW([[1,2],[-1,2.5],[0,0.4],[2,2*cx],[-2,2*cx],[3,cx],[-3,cx]]),0,cand.length-1);m=cand[j];}
  if(busy&&!last)return;/* two notes on the same sixteenth: the phrase moves on, this one stays silent */
  if(i>=0&&i%4===0&&!last&&!c.pcs.includes(m%12)){for(const d of [1,-1,2,-2])if(c.pcs.includes(((m+d)%12+12)%12)){m+=d;break;}}
  if(LAB){NLOG.push([m,V?V.k:0,V?V.n:0,c.name,c.pcs.includes(((m%12)+12)%12)?1:0]);if(NLOG.length>4000)NLOG.shift();}
  notesLvl++;lastMel=m;const r=brick?brick.r:6,kind=brick?TIMBRE[r]:'bell',vel=(brick&&brick.gift?1.15:1)*(last?1.25:1);
  if(cx>=0.55&&c.pcs.includes(((m%12)+12)%12)&&Math.random()<(cx-0.5)*0.7){/* a grace note: a semitone below (chromatic) or the scale note above, resolving on the chord tone */
    let g=m-1;if(Math.random()<0.4){for(let x=m+1;x<=m+2;x++)if(c.scale.includes(x%12)){g=x;break;}}voice(kind,g,Math.max(AC.currentTime,T-0.055),0.45*vel,0.35);}
  voice(kind,m,T,vel,last?1.8:1);
  /* higher rows play chords: two notes under the melody in the top rows, one in the middle */
  const poly=last?2:r<=3?2:r<=7?1:0;for(const h of harmonyUnder(m,c,poly))voice(kind,h,T+0.012,0.55*vel,last?1.8:1);
  if(last){voice('glass',m+12,T+0.03,0.5,1.6);flashSign=1;}
  duck(T,last?0.45:0.28);}
function toughNote(){if(!AC)return;const {T}=slot();voice('bell',95,T,0.5);tick(AC.currentTime,0.7);duck(T,0.2);}
function paddleNote(){if(!AC)return;const now=AC.currentTime;noise(now,0.07,'lowpass',380,1,0.2,DRUMG);
  if(MS.paddle&&now-lastChangeT>=MS.minGap)chordReq=true;
  /* a warm low note on the chord now playing, and the pad opens for a moment */
  const {T}=slot(),c=chordAt(T),r=36+((c.root-36)%12+12)%12;osc('triangle',mtof(r+12),T,MEL,0.16,0.006,0.5);osc('sine',mtof(r),T,BUS,0.22,0.006,0.6);
  PADF.frequency.cancelScheduledValues(T);PADF.frequency.setTargetAtTime(padHz(mlevel)+900,T,0.02);PADF.frequency.setTargetAtTime(padHz(mlevel),T+0.05,0.5);}
function wallNote(){if(AC)tick(AC.currentTime,0.35);}
function capNote(){if(!AC)return;const {T}=slot(),c=chordAt(T),r=72+((c.root-72)%12+12)%12,six=60/bpm()/4;[0,c.maj?4:3,7,12].forEach((x,i)=>voice('vibes',r+x,T+i*six,0.8));}
function letterBuzz(){if(!AC)return;const T=AC.currentTime;const o=AC.createOscillator(),f=AC.createBiquadFilter(),gn=AC.createGain();o.type='sawtooth';o.frequency.value=100;f.type='lowpass';f.frequency.value=700;
  env(gn,T,0.01,0.025,0.22);o.connect(f);f.connect(gn);gn.connect(BUS);o.start(T);o.stop(T+0.3);tick(T,0.5);}
function lineChime(){if(!AC)return;const {T}=slot(),c=chordAt(T);const tones=[];for(let m=74;m<=93;m++)if(c.pcs.includes(m%12))tones.push(m);tones.slice(0,4).forEach((m,i)=>voice('glass',m,T+i*0.04,0.9));}
function bossThump(){if(!AC)return;const T=AC.currentTime,c=curChord(),r=36+((c.root-36)%12+12)%12;osc('sine',mtof(r),T,DRUMG,0.45,0.004,0.35);noise(T,0.25,'lowpass',900,0.7,0.22,DRUMG);duck(T,0.3);}
function finaleMusic(){if(!AC)return;ending=true;const T0=slot().T+0.05,c=chordOf(0);chords.push({t:T0,c});setPad(c,T0,Math.min(MS.transT,1.2));kick(T0,1);noise(T0,2.4,'highpass',5000,0.5,0.1,DRUMG);
  const base=KEY+60;[0,4,7,12,16,19,24,28,31,36].forEach((x,i)=>voice('bell',base+x,T0+0.09*i,0.7));}
function loseNotes(){if(!AC)return;const {T}=slot(),c=chordAt(T),cand=[];for(let x=lastMel-14;x<=lastMel;x++)if(c.penta.includes(((x%12)+12)%12))cand.push(x);
  cand.reverse().slice(0,3).forEach((x,i)=>voice('soft',x,T+i*0.28,0.8));mlevel=Math.max(0,mlevel-1);setPad(c,T);}
function newKey(){/* each level moves up a fourth: calm, and you hear it */KEY=(2+5*(lvl-1))%12;cadence=null;ending=false;waitQ=[];waitStart=-1;sinceTonic=0;pend=null;mlevel=0;annLevel=0;
  if(AC&&started){const T=AC.currentTime+0.05;chords.push({t:T,c:chordOf(0)});lastChangeT=T;setPad(chordOf(0),T,2.5);}}

/* ---- what the shared game asks of the music ---- */
const startTitle=()=>'Il muro suona a '+S.tune+' Hz',MLV=()=>mlevel,LEVARE_PULSE=false,START_SUB='ogni mattoncino è una nota · alza il volume';
function hudLabel(){return AC&&started?chordAt(AC.currentTime).name:'';}
function winLine(){return score+' punti · '+notesLvl+' note a '+S.tune+' Hz';}
/* how far into the bar we are (0 to 1), for the light that sweeps the wall */
function sweepPhase(){if(!(AC&&started))return -1;const now=AC.currentTime;let lb=null;for(const r of ring)if(r.i%16===0&&r.T<=now)lb=r.T;return lb==null?-1:(now-lb)/(60/bpm()*4);}
/* three targets left: the harmony heads for the dominant, so the last brick closes the cadence */
function nearEnd(){if(!cadence)cadence='pre';}
function onTune(){retune();}
function musicDebug(){return{get mlevel(){return mlevel;},get MS(){return MS;},get chords(){return chords;},NLOG};}
