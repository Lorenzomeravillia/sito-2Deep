/* ---------------- chiptune synth (Web Audio, offline) ---------------- */
const OAC=window.OfflineAudioContext||window.webkitOfflineAudioContext;
const mtof=m=>440*Math.pow(2,(m-69)/12);
const NN=s=>{const m=/^([A-G]#?)(\d)$/.exec(s);return 12*(+m[2]+1)+{C:0,'C#':1,D:2,'D#':3,E:4,F:5,'F#':6,G:7,'G#':8,A:9,'A#':10,B:11}[m[1]];};
function pulseWave(ac,duty){const n=64,re=new Float32Array(n),im=new Float32Array(n);for(let k=1;k<n;k++){re[k]=2/(k*Math.PI)*Math.sin(2*Math.PI*k*duty);im[k]=2/(k*Math.PI)*(1-Math.cos(2*Math.PI*k*duty));}return ac.createPeriodicWave(re,im);}
function Engine(ac){
  this.ac=ac;this.w={};this.no=0;
  const len=ac.sampleRate*2;this.nb=ac.createBuffer(1,len,ac.sampleRate);const d=this.nb.getChannelData(0);let s=12345;for(let i=0;i<len;i++){s=(s*1103515245+12345)&0x7fffffff;d[i]=s/0x3fffffff-1;}
  const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=9000;lp.connect(ac.destination);
  this.musicBus=ac.createGain();this.musicBus.connect(lp);this.sfxBus=ac.createGain();this.sfxBus.connect(lp);
  this.leadBus=ac.createGain();this.leadBus.connect(this.musicBus);
  const dl=ac.createDelay(1);dl.delayTime.value=0.3;const dg=ac.createGain();dg.gain.value=0.28;this.leadBus.connect(dl);dl.connect(dg);dg.connect(this.musicBus);
}
Engine.prototype.osc=function(t,dur,freq,shape,vol,o={}){
  const ac=this.ac,os=ac.createOscillator(),g=ac.createGain();
  if(shape==='tri')os.type='triangle';else if(shape==='sine')os.type='sine';else os.setPeriodicWave(this.w[shape]||(this.w[shape]=pulseWave(ac,shape)));
  os.frequency.setValueAtTime(freq,t);if(o.sweep)os.frequency.exponentialRampToValueAtTime(o.sweep,t+dur);
  const a=Math.min(o.a||0.003,dur*0.3),r=Math.min(o.r||0.02,dur*0.5),gp=g.gain;gp.setValueAtTime(0,t);gp.linearRampToValueAtTime(vol,t+a);
  let end=t+dur;if(o.decay){gp.setTargetAtTime(0,t+a,o.decay);end=t+dur+o.decay*2;}else{gp.setValueAtTime(vol,Math.max(t+a,t+dur-r));gp.linearRampToValueAtTime(0,t+dur);}
  os.connect(g);g.connect(o.bus||this.sfxBus);os.start(t);os.stop(end+0.01);
};
Engine.prototype.noise=function(t,dur,vol,o={}){
  const ac=this.ac,src=ac.createBufferSource();src.buffer=this.nb;let n=src;
  if(o.hp){const f=ac.createBiquadFilter();f.type='highpass';f.frequency.value=o.hp;n.connect(f);n=f;}
  if(o.lp){const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=o.lp;n.connect(f);n=f;}
  const g=ac.createGain(),gp=g.gain;gp.setValueAtTime(0,t);gp.linearRampToValueAtTime(vol,t+0.001);
  if(o.decay)gp.setTargetAtTime(0,t+0.001,o.decay);else{gp.setValueAtTime(vol,Math.max(t+0.001,t+dur-0.01));gp.linearRampToValueAtTime(0,t+dur);}
  n.connect(g);g.connect(o.bus||this.sfxBus);this.no=(this.no+0.37)%1.5;src.start(t,this.no,dur+0.02);
};
Engine.prototype.drum=function(t,m,v,bus){
  if(m===35||m===36)this.osc(t,0.14,165,'sine',0.5*v,{sweep:45,decay:0.045,bus});
  else if(m===37||m===38||m===39||m===40){this.noise(t,0.12,0.22*v,{hp:1200,decay:0.04,bus});this.osc(t,0.05,190,0.5,0.077*v,{decay:0.02,bus});}
  else if(m===46)this.noise(t,0.18,0.06*v,{hp:6000,decay:0.06,bus});
  else if(m===49||m===52||m===55||m===57)this.noise(t,0.7,0.12*v,{hp:3000,decay:0.25,bus});
  else if([41,43,45,47,48,50].includes(m)){const f=80+(m-41)*12;this.osc(t,0.18,f*1.6,'sine',0.35*v,{sweep:f,decay:0.08,bus});}
  else this.noise(t,0.03,0.05*v,{hp:6000,decay:0.008,bus});
};
Engine.prototype.note=function(e){
  const v=0.4+0.6*Math.min(127,e.v||100)/127,m=Math.max(12,Math.min(108,Math.round(e.m))),f=mtof(m),mb=this.musicBus,d=e.d;
  switch(e.i){
    case 'lead':this.osc(e.t,Math.max(0.05,d*0.9),f,0.25,0.085*v,{r:0.03,bus:this.leadBus});break;
    case 'p125':this.osc(e.t,Math.max(0.05,d*0.9),f,0.125,0.07*v,{r:0.03,bus:mb});break;
    case 'sq':this.osc(e.t,Math.max(0.05,d*0.9),f,0.5,0.055*v,{r:0.03,bus:mb});break;
    case 'skank':this.osc(e.t,0.075,f,0.25,0.05*v,{decay:0.05,bus:mb});break;
    case 'bass':this.osc(e.t,Math.max(0.06,Math.min(d*0.92,2.5)),f,'tri',0.34*v,{r:0.03,bus:mb});break;
    case 'drums':this.drum(e.t,m,v,mb);break;
  }
};
const INSTRUMENTS=[['lead','Lead (pulse 25%)'],['p125','Pulse sottile (12,5%)'],['sq','Onda quadra (50%)'],['skank','Skank in levare'],['bass','Basso triangolo'],['drums','Batteria noise']];
/* defaultSong() and scheduleSfx(E) come from the scene module (part_levels_music.js, monkey/part_music.js) */
async function renderSoundtrack(o,sr){
  if(!OAC)throw new Error('questo browser non supporta l’audio offline');
  const len=Math.round(sr*DUR),ac=new OAC(1,len,sr),E=new Engine(ac),mv=0.75*o.vol;
  if(o.mode==='midi'){const g=E.musicBus.gain;g.setValueAtTime(0,0);g.linearRampToValueAtTime(mv,0.04);g.setValueAtTime(mv,DUR-0.5);g.linearRampToValueAtTime(0,DUR);}else E.musicBus.gain.value=mv;
  /* a scene can ask for moments of silence (MUSIC_GAPS: [[from,to],...]); they apply to a loaded MIDI too */
  if(typeof MUSIC_GAPS!=='undefined')MUSIC_GAPS.forEach(([a,b])=>{const g=E.musicBus.gain;g.setValueAtTime(mv,a-0.012);g.linearRampToValueAtTime(0,a);g.setValueAtTime(0,b);g.linearRampToValueAtTime(mv,b+0.012);});
  (o.mode==='midi'?o.events:defaultSong()).forEach(e=>{if(e.t<DUR)E.note(e);});
  if(o.sfx)scheduleSfx(E);
  const buf=await new Promise((res,rej)=>{ac.oncomplete=e=>res(e.renderedBuffer);const p=ac.startRendering();if(p&&p.then)p.then(res,rej);});
  const d=buf.getChannelData(0);let pk=0;for(let i=0;i<d.length;i++){const a=Math.abs(d[i]);if(a>pk)pk=a;}
  if(pk>0){const k=0.89/pk;for(let i=0;i<d.length;i++)d[i]*=k;}
  return buf;
}
function pcm16(buf){const d=buf.getChannelData(0),n=d.length,out=new Uint8Array(44+n*2),v=new DataView(out.buffer),sr=buf.sampleRate,ws=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));};
  ws(0,'RIFF');v.setUint32(4,36+n*2,true);ws(8,'WAVE');ws(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);ws(36,'data');v.setUint32(40,n*2,true);
  for(let i=0;i<n;i++)v.setInt16(44+i*2,Math.max(-1,Math.min(1,d[i]))*32767,true);return out;}
function b64(bytes){let s='';for(let i=0;i<bytes.length;i+=0x8000)s+=String.fromCharCode.apply(null,bytes.subarray(i,i+0x8000));return btoa(s);}
window.__audioWav=async sr=>b64(pcm16(await renderSoundtrack({mode:'default',sfx:true,vol:1},sr)));

/* ---------------- MIDI ---------------- */
function parseMidi(ab){
  const d=new DataView(ab);let p=0;const str=n=>{let s='';for(let i=0;i<n;i++)s+=String.fromCharCode(d.getUint8(p+i));return s;};
  const vlq=()=>{let v=0,b;do{b=d.getUint8(p++);v=(v<<7)|(b&0x7f);}while(b&0x80);return v;};
  if(str(4)==='RIFF')p=20;
  if(str(4)!=='MThd')throw new Error('il file non sembra un MIDI');
  p+=4;const hl=d.getUint32(p);p+=4;const fmt=d.getUint16(p),ntr=d.getUint16(p+2),div=d.getUint16(p+4);p+=hl;
  const tracks=[];
  while(tracks.length<ntr&&p+8<=d.byteLength){
    const id=str(4);p+=4;const len=d.getUint32(p);p+=4;const end=Math.min(d.byteLength,p+len);
    if(id!=='MTrk'){p=end;continue;}
    let tick=0,rs=0,name='';const ev=[];
    while(p<end){tick+=vlq();let st=d.getUint8(p);
      if(st===0xFF){p++;const ty=d.getUint8(p++),l=vlq();if(ty===0x51&&l===3)ev.push({tick,type:'tempo',v:(d.getUint8(p)<<16)|(d.getUint8(p+1)<<8)|d.getUint8(p+2)});else if(ty===0x03&&!name){let s='';for(let i=0;i<l;i++)s+=String.fromCharCode(d.getUint8(p+i));name=s.replace(/[^\x20-\x7e -ÿ]/g,'').trim();}p+=l;continue;}
      if(st===0xF0||st===0xF7){p++;p+=vlq();continue;}
      if(st&0x80){rs=st;p++;}else st=rs;
      const ty=st&0xF0,ch=st&0x0F;
      if(ty===0xC0||ty===0xD0){const a=d.getUint8(p++);if(ty===0xC0)ev.push({tick,type:'prog',ch,v:a});continue;}
      const a=d.getUint8(p++),b=d.getUint8(p++);
      if(ty===0x90)ev.push({tick,type:b?'on':'off',ch,n:a,v:b});else if(ty===0x80)ev.push({tick,type:'off',ch,n:a});}
    p=end;tracks.push({name,ev});}
  return{fmt,div,tracks};
}
const GMF=['Pianoforte','Percussioni cromatiche','Organo','Chitarra','Basso','Archi','Ensemble','Ottoni','Ance','Fiati','Synth lead','Synth pad','Synth FX','Strumenti etnici','Percussivi','Effetti'];
function analyzeMidi(m){
  const tempos=[];m.tracks.forEach(tr=>tr.ev.forEach(e=>{if(e.type==='tempo')tempos.push(e);}));tempos.sort((a,b)=>a.tick-b.tick);
  let toSec;
  if(m.div&0x8000){const fps=256-(m.div>>8),tpf=m.div&0xff;toSec=tk=>tk/(fps*tpf);}
  else{const segs=[];let lt=0,ls=0,tp=500000;for(const e of tempos){ls+=(e.tick-lt)*tp/1e6/m.div;lt=e.tick;tp=e.v;segs.push({tick:lt,sec:ls,tempo:tp});}
    toSec=tk=>{let s={tick:0,sec:0,tempo:500000};for(const g of segs){if(g.tick<=tk)s=g;else break;}return s.sec+(tk-s.tick)*s.tempo/1e6/m.div;};}
  const progs={},gs={},grp=(ti,ch,name)=>gs[ti+':'+ch]||(gs[ti+':'+ch]={ti,ch,name,notes:[]});
  m.tracks.forEach((tr,ti)=>{const open={};let last=0;
    tr.ev.forEach(e=>{last=Math.max(last,e.tick);
      if(e.type==='prog'){if(progs[e.ch]==null)progs[e.ch]=e.v;return;}
      if(e.type==='on'){(open[e.ch*128+e.n]=open[e.ch*128+e.n]||[]).push(e);}
      else if(e.type==='off'){const st=open[e.ch*128+e.n]&&open[e.ch*128+e.n].shift();if(st){const t0=toSec(st.tick);grp(ti,e.ch,tr.name).notes.push({n:e.n,v:st.v,t0,t1:Math.max(t0+0.03,toSec(e.tick))});}}});
    Object.values(open).forEach(a=>a.forEach(st=>{const t0=toSec(st.tick);grp(ti,st.ch,tr.name).notes.push({n:st.n,v:st.v,t0,t1:Math.max(t0+0.1,toSec(last))});}));});
  const list=Object.values(gs).filter(g=>g.notes.length).map(g=>{g.notes.sort((a,b)=>a.t0-b.t0);const ns=g.notes.map(x=>x.n);
    return{...g,count:g.notes.length,avg:ns.reduce((s,x)=>s+x,0)/ns.length,min:Math.min(...ns),max:Math.max(...ns),drum:g.ch===9,prog:progs[g.ch]};});
  if(!list.length)throw new Error('nel file non ci sono note da suonare');
  const perTrack={};list.forEach(g=>perTrack[g.ti]=(perTrack[g.ti]||0)+1);
  list.forEach(g=>{g.label=(g.name||(g.drum?'Batteria':'Traccia '+(g.ti+1)))+(perTrack[g.ti]>1?' · canale '+(g.ch+1):'');});
  const mel=list.filter(g=>!g.drum),maxC=Math.max(1,...mel.map(g=>g.count));let lead=null,bass=null;
  mel.filter(g=>g.count>=maxC*0.15).forEach(g=>{if(!lead||g.avg>lead.avg)lead=g;});
  mel.filter(g=>g!==lead&&g.avg<56).forEach(g=>{if(!bass||g.avg<bass.avg)bass=g;});
  let alt=0;list.forEach(g=>{g.inst=g.drum?'drums':g===lead?'lead':g===bass?'bass':(alt++%2?'p125':'sq');g.on=g.drum||g===lead||g===bass;g.oct=0;});
  if(!list.some(g=>g.on))list[0].on=true;
  let end=0,first=1e9;list.forEach(g=>g.notes.forEach(x=>{if(x.t1>end)end=x.t1;if(x.t0<first)first=x.t0;}));
  return{list,end,first,fmt:m.fmt,tempo:tempos.length?Math.round(60e6/tempos[0].v):120};
}
function midiEvents(info,o){
  const ev=[],seg=Math.max(0.25,info.end-o.offset),sel=info.list.filter(g=>g.on);
  for(let k=0;k<500;k++){const base=k*seg/o.speed;if(base>=DUR)break;
    sel.forEach(g=>g.notes.forEach(nt=>{if(nt.t0<o.offset||nt.t0>=info.end)return;const t=base+(nt.t0-o.offset)/o.speed;if(t>=DUR)return;
      const d=Math.max(0.03,Math.min((nt.t1-nt.t0)/o.speed,DUR-t));ev.push({t,d,m:g.inst==='drums'?nt.n:nt.n+12*g.oct+o.transp,v:nt.v,i:g.inst});}));
    if(!o.loop)break;}
  return ev;
}

