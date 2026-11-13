/* ---------------- the song, one instrument at a time ----------------
   A song is five layers: layer 0 plays from the start, layers 1-3 come in with the first, second and third lit letter,
   layer 4 only in LIVE (the fourth letter), when the whole band plays. After LIVE the letters start again, and so does the song.
   Every layer is rendered offline into its own channel of one buffer, so the layers stay in time and switching one on is a gain.
   The band's panel (BRANO) builds the layers from a MIDI file; without one, the built-in 2Deep loop is split the same way. */
const LAYERDEF=['Dall’inizio','Con la prima lettera','Con la seconda lettera','Con la terza lettera','Solo in LIVE (tutte e quattro)'],LAYERK=['INIZIO','LETTERA 1','LETTERA 2','LETTERA 3','LIVE'];
const MSR=22050,SONG_KEY='2deep_pinball_song',MIDI_MAX=150000;
let SONG=null,SONGBUF=null,SONGJOB=0;

/* the built-in loop (gameSong, 8 bars at 150 bpm) plus two parts for LIVE: an arpeggio and a held harmony */
function defaultSong(){const ev=gameSong(),E=0.2,BAR=1.6,PROG=['C','G','Am','F','C','G','F','G'];
  const ARP={C:['C5','E5','G5','C6'],G:['B4','D5','G5','B5'],Am:['A4','C5','E5','A5'],F:['A4','C5','F5','A5']},HAR={C:['E5','G5'],G:['D5','G5'],Am:['C5','E5'],F:['C5','F5']};
  PROG.forEach((c,b)=>{const t0=b*BAR;for(let i=0;i<8;i++)ev.push({t:t0+i*E,d:0.12,m:NN(ARP[c][i%4]),v:90,i:'p125'});HAR[c].forEach(n=>ev.push({t:t0,d:1.5,m:NN(n),v:80,i:'sq'}));});
  const by={drums:0,bass:1,skank:2,lead:3,p125:4,sq:4},steps=LAYERDEF.map(()=>({events:[],label:''}));
  ev.forEach(e=>steps[by[e.i]].events.push(e));['BATTERIA','BASSO','CHITARRA','MELODIA','ARPEGGI'].forEach((l,k)=>steps[k].label=l);
  return{name:'',len:LOOP,steps,midi:false,beat:0.4,echo:ECHO_DEF};}

/* a MIDI song from the panel's settings: the loop is `bars` bars from `offset`, each track in the layer it was given */
const trackKey=g=>g.ti+':'+g.ch;
function midiSong(cfg,info){const sp=cfg.speed||1,span=cfg.bars*240/(info.tempo||120),len=span/sp,steps=LAYERDEF.map(()=>({events:[],names:[],label:''}));
  info.list.forEach(g=>{const c=cfg.tracks[trackKey(g)];if(!c||!(c.step>=0&&c.step<LAYERDEF.length))return;const st=steps[c.step];st.names.push(c.label||g.label);
    g.notes.forEach(nt=>{if(nt.t0<cfg.offset||nt.t0>=cfg.offset+span)return;const t=(nt.t0-cfg.offset)/sp;
      st.events.push({t,d:Math.max(0.03,Math.min((nt.t1-nt.t0)/sp,len-t+1.2)),m:c.inst==='drums'?nt.n:nt.n+12*(c.oct||0)+(cfg.transp||0),v:nt.v,i:c.inst});});});
  steps.forEach(s=>s.label=s.names.join(' + '));
  return{name:cfg.name||'',len,steps,midi:true,beat:60/((info.tempo||120)*sp),echo:{mix:cfg.echoMix??ECHO_DEF.mix,rep:cfg.echoRep??ECHO_DEF.rep,time:ECHO_DEF.time}};}
/* the echo on the tracks played with the Lead sound. The synth engine has a fixed one (one repeat, 0.3 s later, at 28%);
   here it is rebuilt from the song's settings: rep repeats 0.3 s apart, the first at mix, each next one at 60% of the one before */
const ECHO_DEF={mix:0.28,rep:1,time:0.3};
function setEcho(ac,E,o){o=o||ECHO_DEF;E.leadBus.disconnect();E.leadBus.connect(E.musicBus);const n=Math.max(0,Math.min(6,Math.round(o.rep||0)));if(!n||!(o.mix>0))return;
  for(let k=1;k<=n;k++){const d=ac.createDelay(k*o.time+0.1);d.delayTime.value=k*o.time;const g=ac.createGain();g.gain.value=o.mix*Math.pow(0.6,k-1);E.leadBus.connect(d);d.connect(g);g.connect(E.musicBus);}}

/* render all layers at once: one Engine per layer, its music bus into its own channel; the tail past the loop end is folded
   back onto the start (no seam), then one gain for every layer so the full band peaks at 0.8 */
async function renderSong(song){const n=LAYERDEF.length,L=Math.max(1,Math.round(MSR*song.len)),ec=song.echo||ECHO_DEF,TL=Math.round(MSR*Math.max(1.5,(ec.rep||0)*ec.time+1)),oac=new OAC(n,L+TL,MSR);
  const mg=oac.createChannelMerger(n),lp=oac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=9000;mg.connect(lp);lp.connect(oac.destination);
  song.steps.forEach((s,k)=>{if(!s.events.length)return;const E=new Engine(oac);E.musicBus.disconnect();E.musicBus.connect(mg,0,k);E.musicBus.gain.value=0.8;setEcho(oac,E,ec);s.events.forEach(e=>E.note(e));});
  const raw=await new Promise((res,rej)=>{let done=false;const ok=b=>{if(!done){done=true;res(b);}};oac.oncomplete=e=>ok(e.renderedBuffer);const p=oac.startRendering();if(p&&p.then)p.then(ok,rej);});
  const out=oac.createBuffer(n,L,MSR),ch=[];
  for(let k=0;k<n;k++){const a=raw.getChannelData(k),o=out.getChannelData(k);o.set(a.subarray(0,L));for(let i=0;i<TL&&i<L;i++)o[i]+=a[L+i];ch.push(o);}
  let pk=0;for(let i=0;i<L;i++){let s=0;for(let k=0;k<n;k++)s+=ch[k][i];if(s>pk)pk=s;else if(-s>pk)pk=-s;}
  if(pk>0){const f=0.8/pk;ch.forEach(o=>{for(let i=0;i<L;i++)o[i]*=f;});}
  return out;}

/* ---- playback: the buffer loops, a splitter feeds one gain per layer ---- */
let MSRC=null,MLG=[],MASTER=null,LAYERS=-1,MPAUSE=false;
function playSong(buf){if(!AC)return;stopSong();MASTER=AC.createGain();MASTER.gain.value=MUTED||MPAUSE?0:0.42;MASTER.connect(AC.destination);
  MSRC=AC.createBufferSource();MSRC.buffer=buf;MSRC.loop=true;const sp=AC.createChannelSplitter(buf.numberOfChannels);MSRC.connect(sp);
  MLG=[];for(let k=0;k<buf.numberOfChannels;k++){const g=AC.createGain();g.gain.value=0;sp.connect(g,k);g.connect(MASTER);MLG.push(g);}
  LAYERS=-1;MSRC.start();applyLayers();}
function stopSong(){if(MSRC){try{MSRC.stop();}catch(e){}MSRC.disconnect();}if(MASTER)MASTER.disconnect();MSRC=null;MASTER=null;MLG=[];}
/* how many layers play now: all of them in LIVE and on the title and game-over screens, otherwise one more per lit letter */
function layersNow(){if(G.state==='title'||G.state==='over'||live())return LAYERDEF.length;return 1+Math.min(3,G.lit.filter(Boolean).length);}
function applyLayers(){if(!MLG.length)return;const n=layersNow();if(n===LAYERS)return;const t=AC.currentTime;
  MLG.forEach((g,k)=>{const on=k<n;g.gain.cancelScheduledValues(t);g.gain.setTargetAtTime(on?1:0,t,on?0.03:0.25);});LAYERS=n;}
function setMusicLevel(){if(MASTER)MASTER.gain.setTargetAtTime(MUTED||MPAUSE?0:0.42,AC.currentTime,0.05);}
/* (re)build the song and swap it in when the render is done; a newer request wins over an older one */
function useSong(song){SONG=song;const job=++SONGJOB;
  return renderSong(song).then(buf=>{if(job!==SONGJOB)return null;SONGBUF=buf;if(AC)playSong(buf);return buf;});}
const stepLabel=k=>SONG&&SONG.steps[k]?up(SONG.steps[k].label):'';
