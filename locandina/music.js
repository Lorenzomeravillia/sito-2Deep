/* ---- the band comes in as the poster is uncovered: the 2Deep loop (gameSong, 8 bars at 150 bpm) split in five layers,
   rendered offline into one multichannel buffer; each layer is a gain (same system as the flipper) ---- */
const MLOOP=12.8,MSR=22050,MSTEPS=[0,0.15,0.3,0.5,0.75];   /* drums from the start, then bass, guitar, melody, full band at 75% */
function songLayers(){const ev=gameSong(),E=0.2,BAR=1.6,PROG=['C','G','Am','F','C','G','F','G'];
  const ARP={C:['C5','E5','G5','C6'],G:['B4','D5','G5','B5'],Am:['A4','C5','E5','A5'],F:['A4','C5','F5','A5']},HAR={C:['E5','G5'],G:['D5','G5'],Am:['C5','E5'],F:['C5','F5']};
  PROG.forEach((c,b)=>{const t0=b*BAR;for(let i=0;i<8;i++)ev.push({t:t0+i*E,d:0.12,m:NN(ARP[c][i%4]),v:90,i:'p125'});HAR[c].forEach(n=>ev.push({t:t0,d:1.5,m:NN(n),v:80,i:'sq'}));});
  const by={drums:0,bass:1,skank:2,lead:3,p125:4,sq:4},L=[[],[],[],[],[]];ev.forEach(e=>L[by[e.i]].push(e));return L;}
let MBUF=null,MSRC=null,MLG=[],MLAY=-1,MMASTER=null;
async function renderMusic(){const L=songLayers(),n=L.length,len=Math.round(MSR*MLOOP),TL=Math.round(MSR*1.5),oac=new OAC(n,len+TL,MSR),mg=oac.createChannelMerger(n);mg.connect(oac.destination);
  L.forEach((evs,k)=>{const E=new Engine(oac);E.musicBus.disconnect();E.musicBus.connect(mg,0,k);E.musicBus.gain.value=0.8;evs.forEach(e=>E.note(e));});
  const raw=await new Promise((res,rej)=>{let d=false;oac.oncomplete=e=>{if(!d){d=true;res(e.renderedBuffer);}};const p=oac.startRendering();if(p&&p.then)p.then(b=>{if(!d){d=true;res(b);}},rej);});
  const out=new AudioBuffer({numberOfChannels:n,length:len,sampleRate:MSR});let pk=0;const ch=[];
  for(let k=0;k<n;k++){const a=raw.getChannelData(k),o=out.getChannelData(k);o.set(a.subarray(0,len));for(let i=0;i<TL;i++)o[i]+=a[len+i];ch.push(o);}
  for(let i=0;i<len;i++){let s=0;for(let k=0;k<n;k++)s+=ch[k][i];if(Math.abs(s)>pk)pk=Math.abs(s);}if(pk>0)ch.forEach(o=>{for(let i=0;i<len;i++)o[i]*=0.8/pk;});return out;}
function startMusic(){if(!AC||MSRC||!MBUF)return;MMASTER=AC.createGain();MMASTER.gain.value=0.38;MMASTER.connect(AC.destination);
  MSRC=AC.createBufferSource();MSRC.buffer=MBUF;MSRC.loop=true;const sp=AC.createChannelSplitter(MBUF.numberOfChannels);MSRC.connect(sp);
  MLG=[];for(let k=0;k<MBUF.numberOfChannels;k++){const g=AC.createGain();g.gain.value=0;sp.connect(g,k);g.connect(MMASTER);MLG.push(g);}MLAY=-1;MSRC.start();musicLayers();}
/* how many layers play: one more at every step of the uncovered share; everything at the end */
function musicLayers(){if(!MLG.length)return;const end=G.state==='win'||G.state==='over',n=end?MLG.length:MSTEPS.filter(s=>G.pct>=s).length;if(n===MLAY)return;
  const t=AC.currentTime;MLG.forEach((g,k)=>{const on=k<n;g.gain.cancelScheduledValues(t);g.gain.setTargetAtTime(on?1:0,t,on?0.05:0.4);});
  if(MLAY>0&&n>MLAY&&!end)pop(['','IL BASSO!','LA CHITARRA!','LA MELODIA!','TUTTA LA BAND!'][n-1]||'',TW/2,FY+FH/2,C.cyan,2);MLAY=n;}
