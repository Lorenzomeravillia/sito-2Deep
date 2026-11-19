/* =====================================================================================================
   MUSIC (the ska-reggae version): the band's soundtrack in 8 bit, the flipper's song engine (flipper/music.js) with its own
   song for Skanoid (site_content skanoid/song), set up by the band in the BRANO panel. Five groups of instruments come in as
   the wall comes down (at the start, at 15, 35, 55 and 75% of the wall); the ball does not play notes, it only makes the
   sounds of the game. Any MIDI is made "in levare" by three tracks computed from the song (below), and the screen pulses on
   the off-beat. The whole song plays a little slower, at A=432 Hz instead of 440, like the band.
   ===================================================================================================== */
let MUTED=false,AC=null,SX=null,SONG_T0=0,SONG_RATE=1,LEV=[];const LOOP=12.8;
const up=s=>String(s||'').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
const SONG_LAYERS={names:['Dall’inizio','Al 15% del muro','Al 35% del muro','Al 55% del muro','Dal 75% e alla vittoria'],keys:['INIZIO','15%','35%','55%','75%']};
const WALL_STEPS=[0.15,0.35,0.55,0.75];
const speedFactor=h=>1+Math.min(0.55,(h==null?hits:h)*0.005);/* the ball speeds up with the hits (in the relaxing version this lives with its music) */
const pickW=a=>{let s=0;for(const x of a)s+=x[1];let r=Math.random()*s;for(const x of a){if((r-=x[1])<=0)return x[0];}return a[a.length-1][0];};

/* ---- the song "in levare" ----
   To any MIDI the game adds three tracks computed from the song, which the band places like the others in the BRANO panel:
   SKANK, the song's chords as short chops on the off-beat; BATTERIA SKA, kick on the beats that carry the bar, snare on the
   others, hi-hat on the off-beats; ONE DROP, the reggae drums (kick and rim together in the middle of the bar), left out at first.
   The beat comes from the tempo and the meter written in the file. In 4/4 (and 2/4, 2/2) the off-beat is the second eighth of
   every beat; in 3/4 the same on three beats, a waltz in levare; in 6/8, 9/8 and 12/8 every beat is three eighths and the
   off-beat is the third one: a shuffle, the rhythm ska grew out of. The chords: on every beat, the notes sounding in all the
   parts (low notes count more) are matched against the major and minor triads; a new chord has to beat the one before by a
   margin, so the chop does not flicker between two readings of the same harmony. */
function meterOf(m){for(const tr of m.tracks)for(const e of tr.ev)if(e.type==='ts'&&e.num>0&&e.den>0)return{num:e.num,den:e.den};return{num:4,den:4};}
const barQ=info=>info.barQ||4,barSec=info=>barQ(info)*60/(info.tempo||120);
const meterText=info=>{const m=info.meter||{num:4,den:4};return m.num+'/'+m.den+(info.compound?', levare in shuffle':m.num===3&&m.den===4?', valzer in levare':'')+(info.levareAuto?' · rilevato: '+LEV_WHY[info.levareAuto.why]:'');};
/* songs already in levare: the beat of the file is not always the beat you feel. Four readings, the band can pick one in the panel:
   normale  the chop on the second eighth of every beat (a song in battere is turned into levare, a ska song already chopping on
            the eighths keeps its place);
   inverti  the file is half a beat off (kick, snare and bass fall on its off-beats): beat and off-beat swap;
   reggae   half time, the chop on 2 and 4 (a reggae written with the chop on the quarter notes);
   doppio   double time, the chop on the off-beat sixteenths (a ska written at half its speed).
   Automatic: where the kick, the snare and the bass fall, and where the chords of the other parts start, decide. */
const LEV_WHY={battere:'in battere: lo porto in levare',levare:'già in levare sugli ottavi',spostato:'battere e levare scambiati nel file',reggae:'reggae a metà tempo, accordi sul 2 e sul 4',doppio:'levare sui sedicesimi',shuffle:'6/8: levare in shuffle'};
function detectLevare(info,ts){const q=60/(info.tempo||120);if(ts.den===8&&ts.num%3===0&&ts.num>=6)return{mode:'normale',why:'shuffle'};
  const bq=Math.max(1,Math.round(ts.num*4/ts.den)),bin=t=>{const x=((t/q)%1+1)%1;return Math.round(x*4)%4;};/* 0 beat, 2 eighth off-beat, 1 and 3 sixteenths */
  const mk=[0,0,0,0],ch=[0,0,0,0],qp=[0,0,0,0],bass=info.list.filter(g=>!g.drum&&!g.gen&&(g.inst==='bass'||(g.prog>=32&&g.prog<=39)));
  for(const g of info.list){if(g.gen||!g.drum)continue;for(const x of g.notes)if([35,36,38,40].includes(x.n))mk[bin(x.t0)]++;}
  for(const g of bass)for(const x of g.notes)mk[bin(x.t0)]+=0.7;
  for(const g of info.list){if(g.gen||g.drum||bass.includes(g))continue;const ns=g.notes;
    for(let i=0;i<ns.length;i++){let j=i;while(j+1<ns.length&&ns[j+1].t0-ns[i].t0<0.03)j++;if(j>i){const b=bin(ns[i].t0);ch[b]++;if(b===0)qp[Math.round(ns[i].t0/q)%bq%4]++;}i=j;}}
  const tm=mk[0]+mk[2],tc=ch[0]+ch[1]+ch[2]+ch[3];
  if(tm>=8&&mk[2]>mk[0]*1.5)return{mode:'inverti',why:'spostato'};
  if(tc>=8&&ch[1]+ch[3]>(ch[0]+ch[2])*1.5)return{mode:'doppio',why:'doppio'};
  if(tc>=8&&ch[2]>ch[0]*1.5)return{mode:'normale',why:'levare'};
  if(bq===4&&qp[1]+qp[3]>=6&&qp[1]+qp[3]>3*(qp[0]+qp[2]))return{mode:'reggae',why:'reggae'};
  return{mode:'normale',why:'battere'};}
function analyzeMidi(m,mode){const info=analyzeMidiBase(m),ts=meterOf(m);
  try{info.levareAuto=detectLevare(info,ts);info.levareMode=mode&&mode!=='auto'?mode:info.levareAuto.mode;addLevare(info,ts,info.levareMode);}catch(e){}return info;}
const TRI={maj:[0,4,7],min:[0,3,7]};
function triadScore(w,low,tot,r,ty){let sc=0;for(let pc=0;pc<12;pc++){const d=(pc-r+12)%12;sc+=TRI[ty].includes(d)?w[pc]*(d===0?1.2:1):-0.55*w[pc];}return sc+(low!=null&&low%12===r?0.25*tot:0);}
function addLevare(info,ts,mode){const q=60/(info.tempo||120),comp=ts.den===8&&ts.num%3===0&&ts.num>=6;
  info.meter=ts;info.compound=comp;info.barQ=ts.num*4/ts.den;
  let bq=comp?ts.num/3:Math.max(1,Math.round(ts.num*4/ts.den));if(mode==='reggae'&&(comp||bq%2))mode='normale';
  const beat=(comp?q*1.5:q)*(mode==='reggae'?2:mode==='doppio'?0.5:1),off=comp?beat*2/3:beat/2,shift=mode==='inverti'?off:0,bpb=mode==='reggae'?bq/2:mode==='doppio'?4:bq,nb=Math.ceil(info.end/beat)+1;
  const parts=info.list.filter(g=>!g.drum),sk=[],ska=[],od=[];let prev=null,prevV=null;
  for(let k=0;k<nb;k++){const b0=k*beat+shift,b1=b0+beat,w=new Array(12).fill(0);let low=null,tot=0;
    for(const g of parts)for(const x of g.notes){if(x.t0>=b1)break;if(x.t1<=b0)continue;const o=(Math.min(x.t1,b1)-Math.max(x.t0,b0))/beat*(0.5+(x.v||100)/254)*(x.n<55?1.4:1);w[x.n%12]+=o;tot+=o;if(low==null||x.n<low)low=x.n;}
    let chord=prev;
    if(tot>0.05){let best=null;for(let r=0;r<12;r++)for(const ty of ['maj','min']){const sc=triadScore(w,low,tot,r,ty);if(!best||sc>best.sc)best={r,ty,sc};}
      const ps=prev?triadScore(w,low,tot,prev.r,prev.ty):-1e9;if(!prev||best.sc>ps+0.15*Math.abs(ps)+0.02)chord=best;}
    /* the chop: the triad close together around the middle of the keyboard, the inversion nearest to the last one */
    if(chord){const pcs=TRI[chord.ty].map(d=>(chord.r+d)%12);let v=null;
      for(let inv=0;inv<3;inv++){const ord=pcs.slice(inv).concat(pcs.slice(0,inv)),vv=[55+((ord[0]-55)%12+12)%12];for(let j=1;j<3;j++){let m=vv[j-1]+1;while(m%12!==ord[j])m++;vv.push(m);}
        if(vv[2]>72)for(let j=0;j<3;j++)vv[j]-=12;const cost=prevV?vv.reduce((s,m,j)=>s+Math.abs(m-prevV[j]),0):Math.abs(vv[1]-63);if(!v||cost<v.cost)v={vv,cost};}
      prevV=v.vv;prev=chord;const t=b0+off;for(const n of v.vv)sk.push({n,v:100,t0:t,t1:t+0.08,lev:1});}
    /* the drums: the hi-hat soft on the beat and strong on the off-beat (in the shuffle also a ghost in the middle) */
    const pos=k%bpb,to=b0+off,hit=(arr,n,v,tt)=>arr.push({n,v,t0:tt,t1:tt+0.08});
    for(const arr of [ska,od]){hit(arr,42,55,b0);hit(arr,42,110,to);}if(comp)hit(ska,42,30,b0+beat/3);
    if(bpb===3){if(pos===0)hit(ska,36,120,b0);else hit(ska,38,pos===2?95:70,b0);}
    else if(pos%2===0)hit(ska,36,120,b0);else hit(ska,38,110,b0);
    if(pos===(bpb===3?2:Math.floor(bpb/2))){hit(od,36,120,b0);hit(od,37,110,b0);}}
  const grp=(ch,name,notes,drum)=>{if(!notes.length)return;const ns=notes.map(x=>x.n);let mn=ns[0],mx=ns[0],sm=0;for(const n of ns){if(n<mn)mn=n;if(n>mx)mx=n;sm+=n;}
    info.list.push({ti:'gen',ch,name,label:name,notes,count:notes.length,avg:sm/ns.length,min:mn,max:mx,drum,prog:null,gen:ch,inst:drum?'drums':'skank',on:false,oct:0});};
  grp('skank','SKANK IN LEVARE',sk,false);grp('ska','BATTERIA SKA',ska,true);grp('onedrop','ONE DROP REGGAE',od,true);}
/* the off-beats inside the loop, for the pulse of the screen: the song's chops, otherwise the half of every beat */
function levareTimes(song){const ts=new Set();song.steps.forEach(s=>s.events.forEach(e=>{if(e.lev||e.i==='skank')ts.add(Math.round(e.t*1000));}));
  let out=[...ts].map(x=>x/1000).sort((a,b)=>a-b);if(!out.length&&song.beat)for(let t=song.beat/2;t<song.len;t+=song.beat)out.push(t);return out.filter(t=>t<song.len);}

/* ---- the groups of instruments follow the wall; everything on the sign lit and at the end of the game ---- */
function gameLayers(){if(st==='win'||st==='over')return LAYERDEF.length;const p=bricks.length?1-alive()/bricks.length:0;return 1+WALL_STEPS.filter(x=>p>=x).length;}
function songBtnScreen(){return st==='ready'&&sheet.hidden;}
function audio(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return;}SX=new Engine(AC);SX.sfxBus.gain.value=0.8;if(SONGBUF)playSong(SONGBUF);}}
function initAudio(){audio();if(AC&&AC.state==='suspended')AC.resume();}
function startGroove(){}
function musicTick(){if(SONGUI)SONGUI.tick();if(!AC)return;const before=LAYERS;applyLayers();
  /* a group comes in during play: its name on the screen (BASSO! ...) */
  if(st==='play'&&before>=1&&LAYERS>before)for(let k=LAYERS-1;k>=before;k--){if(SONG&&SONG.steps[k]&&SONG.steps[k].events.length){const n=stepLabel(k);banner(n?n+'!':'ENTRA UN ALTRO STRUMENTO');break;}}
}
const songPos=()=>!MSRC||!SONG||!AC?-1:(((AC.currentTime-SONG_T0)*SONG_RATE)%SONG.len+SONG.len)%SONG.len;
/* the visual pulse: highest on every off-beat of the song */
function beatEnv(){const p=songPos();if(p<0||!LEV.length)return 0;let last=LEV[LEV.length-1]-SONG.len;for(const x of LEV){if(x<=p)last=x;else break;}return Math.exp(-(p-last)/SONG_RATE*6);}
function sweepPhase(){const p=songPos();if(p<0)return -1;const bar=SONG.barLen||(SONG.beat||0.4)*4;return(p%bar)/bar;}

/* ---- the sounds of the game, in the same chip voices; none of them is a note of the song ---- */
const sfxT=()=>AC.currentTime+0.005;
function ballNote(b,brick){if(b&&b.vol)b.vol.k++;if(!SX)return;const t=sfxT();SX.noise(t,0.02,0.07,{hp:4500,decay:0.006});SX.osc(t,0.05,1700,0.25,0.03,{sweep:900,decay:0.02});}
function toughNote(){if(!SX)return;const t=sfxT();SX.noise(t,0.03,0.06,{hp:7000,decay:0.01});SX.osc(t,0.04,2600,0.5,0.025,{decay:0.015});}
function paddleNote(){if(!SX)return;const t=sfxT();SX.noise(t,0.03,0.08,{hp:2200,decay:0.01});SX.osc(t,0.06,170,'sine',0.12,{sweep:80,decay:0.03});}
function wallNote(){if(SX)SX.noise(sfxT(),0.015,0.04,{hp:4000,decay:0.006});}
function capNote(){if(!SX)return;const t=sfxT();[0,4,7,12].forEach((x,i)=>SX.osc(t+i*0.045,0.08,mtof(84+x),0.25,0.05,{decay:0.04}));}
function letterBuzz(){if(!SX)return;const t=sfxT();SX.osc(t,0.18,100,0.5,0.025,{decay:0.08});SX.noise(t,0.02,0.03,{hp:3500,decay:0.006});}
function lineChime(){if(!SX)return;const t=sfxT();[0,7,12,19].forEach((x,i)=>SX.osc(t+i*0.05,0.12,mtof(86+x),0.125,0.05,{decay:0.06}));}
function bossThump(){if(!SX)return;const t=sfxT();SX.osc(t,0.3,110,'sine',0.35,{sweep:45,decay:0.1});SX.noise(t,0.2,0.15,{lp:900,decay:0.06});}
function finaleMusic(){if(!SX)return;const t=sfxT();SX.noise(t,0.8,0.12,{hp:3000,decay:0.3});[0,4,7,12,16,19,24].forEach((x,i)=>SX.osc(t+0.05*i,0.12,mtof(72+x),0.25,0.06,{decay:0.06}));}
function loseNotes(){if(!SX)return;const t=sfxT();[76,72,67].forEach((m,i)=>SX.osc(t+i*0.18,i===2?0.4:0.15,mtof(m),0.5,0.05,{decay:i===2?0.15:0.05}));}
function newKey(){}
function musicLevel(){}
function startVolley(b,events){b.vol={k:0,n:events.filter(e=>e.k!=='tough').length};}

/* ---- what the shared game asks of the music ---- */
const startTitle=()=>'Ska-reggae a '+S.tune+' Hz',MLV=()=>Math.max(0,LAYERS-1),LEVARE_PULSE=true,START_SUB='colonna sonora 8 bit in levare · alza il volume';
function hudLabel(){return SONG&&SONG.name?up(SONG.name):'';}
function winLine(){return score+' punti · musica a '+S.tune+' Hz';}
function nearEnd(){}
/* the tuning: the loop plays at 432/440 of its speed, and the position in the song stays where it was */
function onTune(){if(!MSRC||!AC)return;const p=songPos();SONG_RATE=S.tune/440;MSRC.playbackRate.setValueAtTime(SONG_RATE,AC.currentTime);SONG_T0=AC.currentTime-p/SONG_RATE;}
function musicDebug(){return{get layers(){return LAYERS;},get song(){return SONG?{name:SONG.name,len:SONG.len,midi:SONG.midi,steps:SONG.steps.map(s=>s.events.length),labels:SONG.steps.map(s=>s.label)}:null;},get lev(){return LEV;},get buf(){return!!SONGBUF;},get rate(){return SONG_RATE;},analyze:m=>analyzeMidi(parseMidi(m))};}
