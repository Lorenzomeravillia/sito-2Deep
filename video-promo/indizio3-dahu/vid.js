/* The Dahu clue promo, inside Skanoid (ska-reggae). The game plays for real from the last part of a level: a band of bricks still
   covers the venue and the date on the sign, seven balls are in play, an autopilot aims them. Overlays: hook, neon trails, light rings,
   sparks, bloom, confetti, a camera that slows down on the last brick and pushes in on the lit sign, then the clue and the call to action.
   VID.pass1() runs the game alone and reports the tick of the last brick; VID.start()+VID.step(grab) replay it frame by frame. */
window.VID=(function(){
const M=__MV,cv=document.getElementById('c'),FPS=30,TICK=1/120,SET=window.__SETUP||{};
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const VC=mk(1080,1920),vg=VC.getContext('2d'),HC=mk(1920,1080),hg=HC.getContext('2d'),BL=mk(270,480),bl=BL.getContext('2d');
const rng=seed=>{let s=seed>>>0;return()=>{s+=0x6D2B79F5;let x=s;x=Math.imul(x^x>>>15,x|1);x^=x+Math.imul(x^x>>>7,x|61);return((x^x>>>14)>>>0)/4294967296;};};
const CR=rng((SET.seed||1)*7919+13),FX=rng(4242),DR=rng(777);
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),c01=u=>clamp(u,0,1),eo=u=>1-Math.pow(1-c01(u),3),eio=u=>{u=c01(u);return u<0.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;};
const back=u=>{u=c01(u);const c1=1.9,c3=c1+1;return 1+c3*Math.pow(u-1,3)+c1*Math.pow(u-1,2);},lerp=(a,b,u)=>a+(b-a)*u;
const NEON=['#ff2e88','#ffd23f','#2ee8c4','#3d8bff','#a35bff','#ff9a1f','#4fe3ff'];
const {BX,BY,BW,BH,COLS}=M;
let tick=0,frame=0,readyT=0,lastBroken=null,prevAlive=[],prevLives=3;const ev={lines:{}},rings=[],sparks=[],conf=[],trails=new Map();
let minBalls=99,lostBalls=0,prevBalls=0;

/* ---- the endgame: a band of bricks over AL CANTONET and SAB 21 NOV, two of them with a three-balls capsule ---- */
const KEEP=[[3,[1,2,3,4,5,6,7,8]],[4,[2,3,6,7]],[6,[1,2,3,4,5,6,7,8]],[7,[2,3,4,5,6,7]],[9,[3,4,5,6]]];
function setup(){Math.random=rng((SET.seed||1)*2654435761+1);M.S.speed='veloce';
  const rowCol={};for(const b of M.bricks)if(!b.gift)rowCol[b.r]=b.col;
  const keep=new Set();for(const [r,cs] of KEEP)for(const c of cs)keep.add(r*COLS+c);
  for(const b of M.bricks){const k=b.r*COLS+b.c;b.alive=keep.has(k);b.hp=1;b.max=1;b.gift=false;b.cap=null;b.col=rowCol[b.r];b.wob=0;b.hitT=-9;}
  for(const k of [3*COLS+2,6*COLS+7]){const b=M.bricks[k];b.gift=true;b.cap='M';b.col=M.CAPS.M.col;}
  M.bakeBricks();M.bossDone=true;M.boss=null;M.hits=40;M.score=3170;M.lives=3;M.paddle.x=135;M.caps.length=0;
  const balls=[];for(let i=0;i<7;i++){const up=CR()<0.72,a=(CR()-0.5)*1.5,x=30+CR()*210,y=up?250+CR()*160:200+CR()*120;
    balls.push({x,y,vx:Math.sin(a)*200,vy:(up?-1:1)*Math.cos(a)*200,r:3.2,stuck:false});}
  M.balls=balls;M.st='play';for(const b of balls)M.forecast(b);
  M.checkSign();M.slowT=0;M.flash=0;for(const L of M.SIGN){if(L.done)L.doneT=-9;for(const l of L.letters)if(l.lit)l.litT=-9;}
  prevAlive=M.bricks.map(b=>b.alive);prevBalls=balls.length;}

/* ---- autopilot: under the ball that lands first, hitting it with the part of the paddle that sends it at a brick ---- */
function exposed(b){for(const o of M.bricks)if(o.alive&&o.c===b.c&&o.r>b.r)return false;return true;}
function target(x){let best=null,bs=1e9;for(const b of M.bricks){if(!b.alive||!exposed(b))continue;const s=Math.abs(b.x+BW/2-x)+(b.gift?-40:0);if(s<bs){bs=s;best=b;}}return best;}
function pilot(dt){const p=M.paddle;let best=null,bt=1e9;
  for(const b of M.balls){if(b.stuck||b.vy<=0)continue;const tt=(p.y-b.r-b.y)/b.vy;if(tt>=-0.02&&tt<bt){bt=tt;best=b;}}
  let tx=p.x;
  if(best){let x=best.x+best.vx*Math.max(0,bt);const lo=best.r+3,hi=270-best.r-3,span=hi-lo;x=((x-lo)%(2*span)+2*span)%(2*span);x=lo+(x>span?2*span-x:x);
    const tg=target(x);if(tg){const dx=tg.x+BW/2-x,dy=(p.y-best.r)-(tg.y+BH/2);const ang=clamp(Math.atan2(dx,dy),-0.95,0.95);tx=x-ang/1.05*p.w/2*0.92;}else tx=x;}
  if(bt>0.5){const c=M.caps.filter(c=>c.k==='M').sort((a,b)=>b.y-a.y)[0];if(c&&c.y>330)tx=c.x;}
  const mv=620*dt;p.x+=clamp(tx-p.x,-mv,mv);M.clampPaddle();}

/* ---- one tick of the game (1/120 s of game time) at video time vt ---- */
function tickOnce(vt){window.__vt=vt;window.__gt=M.t;
  if(M.st==='ready'){readyT+=TICK;if(readyT>0.3){M.launch();readyT=0;}}
  pilot(TICK);for(const c of M.caps)if(!c.fast){c.fast=1;c.vy=150;}
  M.update(TICK);window.__lq=window.__lq.filter(([at,fn])=>{if(M.t>=at){fn();return false;}return true;});M.musicTick();
  M.bricks.forEach((b,i)=>{if(prevAlive[i]&&!b.alive){prevAlive[i]=false;lastBroken=i;onBreak(b,vt);}});
  if(M.lives<prevLives)ev.lose=true;prevLives=M.lives;
  const nb=M.balls.length;if(M.st==='play'){if(nb<prevBalls)lostBalls+=prevBalls-nb;minBalls=Math.min(minBalls,nb);}prevBalls=nb;
  for(const b of M.balls){let a=trails.get(b);if(!a)trails.set(b,a=[]);a.push([b.x,b.y,M.t]);if(a.length>16)a.shift();}
  for(const k of trails.keys())if(!M.balls.includes(k))trails.delete(k);
  M.SIGN.forEach((L,i)=>{if(L.done&&ev.lines[i]==null&&L.doneT>0)ev.lines[i]=vt;});
  if(ev.winTick==null&&M.st==='win'){ev.winTick=tick;ev.tWin=vt;ev.last=lastBroken;onWin(vt);}
  tick++;}
function onBreak(b,vt){const x=b.x+BW/2,y=b.y+BH/2,col=b.col;rings.push({x,y,col,t0:M.t,big:false});
  for(let i=0;i<9;i++){const a=FX()*Math.PI*2,v=60+FX()*150;sparks.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-40,col:FX()<0.3?'#ffffff':col,t0:M.t,life:0.35+FX()*0.35});}
  if(sparks.length>500)sparks.splice(0,sparks.length-500);}
function onWin(vt){const b=M.bricks[lastBroken];rings.push({x:b.x+BW/2,y:b.y+BH/2,col:'#ffffff',t0:M.t,big:true});
  for(let i=0;i<180;i++){const a=-Math.PI/2+(FX()-0.5)*2.6,v=380+FX()*620;conf.push({x:135+(FX()-0.5)*200,y:150+(FX()-0.5)*60,vx:Math.cos(a)*v*0.55,vy:Math.sin(a)*v,
    col:NEON[i%NEON.length],t0:vt+FX()*0.15,w:6+FX()*7,h:10+FX()*10,r0:FX()*6,vr:(FX()-0.5)*14,sw:FX()*6});}}

/* ---- camera: still during the game, toward the last brick in the slow motion, then up onto the lit sign ---- */
function ticksFor(){if(SET.winTick==null)return 4;const d=(tick-SET.winTick)*TICK;if(d>=-0.25&&d<0.15)return 1;if(d>=-0.40&&d<0.30)return 2;return 4;}
const LB=SET.last!=null?SET.last:null;
function cam(vt){let z=1.0,cx=135,cy=240;
  if(SET.winTick!=null&&SET.lastXY){const [lx,ly]=SET.lastXY,d=(tick-SET.winTick)*TICK;
    if(ev.tWin==null){const u=eio((d+0.45)/0.45);z=1+0.2*u;cx=lerp(135,lx,u*0.7);cy=lerp(240,ly,u*0.7);}
    else{const u=eio((vt-ev.tWin)/1.4);z=lerp(1.2,1.34,u);cx=lerp(lerp(135,lx,0.7),135,u);cy=lerp(lerp(240,ly,0.7),150,u);}}
  return{z,cx,cy};}
function view(x,y,w,h,c){const k=cv.width/270,sw=cv.width/c.z,sh=cv.height/c.z;const sx=clamp(c.cx*k-sw/2,0,cv.width-sw),sy=clamp(c.cy*k-sh/2,0,cv.height-sh);return{x,y,w,h,sx,sy,sw,sh,k,s:k*w/sw};}
const P=(v,gx,gy)=>[v.x+(gx*v.k-v.sx)*v.w/v.sw,v.y+(gy*v.k-v.sy)*v.h/v.sh];
function blit(g,v,blur,dim){g.save();g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';if(blur)g.filter='blur('+blur+'px) brightness('+(dim||0.5)+')';g.drawImage(cv,v.sx,v.sy,v.sw,v.sh,v.x,v.y,v.w,v.h);g.restore();}
function bloom(g,v,a){bl.clearRect(0,0,270,480);bl.filter='blur(2.2px) contrast(1.9) brightness(0.75)';bl.drawImage(cv,v.sx,v.sy,v.sw,v.sh,0,0,270,480);bl.filter='none';
  g.save();g.beginPath();g.rect(v.x,v.y,v.w,v.h);g.clip();g.globalCompositeOperation='lighter';g.globalAlpha=a;g.imageSmoothingQuality='high';g.drawImage(BL,v.x,v.y,v.w,v.h);g.restore();}
function effects(g,v){const t=M.t;g.save();g.beginPath();g.rect(v.x,v.y,v.w,v.h);g.clip();g.globalCompositeOperation='lighter';g.lineCap='round';
  /* neon trails, one colour per ball */
  let i=0;for(const [b,a] of trails){const col=NEON[i++%NEON.length];if(a.length<2)continue;for(let j=1;j<a.length;j++){const age=t-a[j][2];if(age>0.11)continue;const u=1-age/0.11;
      const [x0,y0]=P(v,a[j-1][0],a[j-1][1]),[x1,y1]=P(v,a[j][0],a[j][1]);g.strokeStyle=col;g.globalAlpha=0.42*u;g.lineWidth=v.s*7*u;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();
      g.globalAlpha=0.7*u;g.lineWidth=v.s*1.8*u;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();}}
  /* light rings where a brick goes */
  for(const r of rings){const u=(t-r.t0)/(r.big?0.9:0.42);if(u<0||u>1)continue;const [x,y]=P(v,r.x,r.y),rad=v.s*(r.big?6+120*eo(u):3+30*eo(u));
    g.strokeStyle=r.col;g.globalAlpha=(1-u)*0.35;g.lineWidth=v.s*(r.big?9:5)*(1-u)+1;g.beginPath();g.arc(x,y,rad,0,Math.PI*2);g.stroke();
    g.globalAlpha=(1-u)*0.9;g.lineWidth=v.s*(r.big?2.6:1.5)*(1-u)+0.8;g.beginPath();g.arc(x,y,rad,0,Math.PI*2);g.stroke();}
  /* sparks */
  for(const s of sparks){const u=(t-s.t0)/s.life;if(u<0||u>1)continue;const tt=t-s.t0,x=s.x+s.vx*tt,y=s.y+s.vy*tt+150*tt*tt,vx=s.vx,vy=s.vy+300*tt,sp=Math.hypot(vx,vy)||1;
    const [X,Y]=P(v,x,y),L=v.s*(2+5*(1-u));g.strokeStyle=s.col;g.globalAlpha=1-u;g.lineWidth=v.s*1.1;g.beginPath();g.moveTo(X,Y);g.lineTo(X-vx/sp*L,Y-vy/sp*L);g.stroke();}
  g.restore();}
function confetti(g,v,vt,a){if(!conf.length)return;g.save();g.globalAlpha=a;for(const c of conf){const tt=vt-c.t0;if(tt<0||tt>5.5)continue;
    const dr=Math.exp(-tt*1.6),x=c.x+c.vx*(1-dr)/1.6+Math.sin(tt*3+c.sw)*10,y=c.y+c.vy*(1-dr)/1.6+70*tt*tt*0.5+60*tt;const [X,Y]=P(v,x,y);
    if(Y>v.y+v.h+40)continue;const sc=v.w/270*0.28;g.save();g.translate(X,Y);g.rotate(c.r0+c.vr*tt);g.scale(1,Math.cos(tt*7+c.sw));g.fillStyle=c.col;g.fillRect(-c.w*sc,-c.h*sc/2,c.w*sc*2,c.h*sc);g.restore();}
  g.restore();}

/* ---- type, in the clue series' style: pixel letters and handwriting ---- */
const PIX="'Silk',monospace",HAND="'Caveat',cursive";
function T(g,s,x,y,size,col,o={}){g.save();g.font=(o.hand?'700 ':'400 ')+size+'px '+(o.hand?HAND:PIX);g.textAlign=o.align||'center';g.textBaseline='middle';
  if(o.a!==undefined)g.globalAlpha=c01(o.a);let sc=o.sc||1;if(o.maxW){const w=g.measureText(s).width;if(w>o.maxW)sc*=o.maxW/w;}if(sc!==1){g.translate(x,y);g.scale(sc,sc);g.translate(-x,-y);}
  if(o.glow){g.shadowColor=o.glow;g.shadowBlur=size*0.45;}
  g.lineJoin='round';g.lineWidth=o.hand?size*0.12:Math.max(3,size*0.14);g.strokeStyle=o.hand?'rgba(10,7,22,0.85)':(o.stroke||'#0a0716');g.strokeText(s,x,y);
  g.fillStyle=col;g.fillText(s,x,y);if(o.glow){g.shadowBlur=size*0.2;g.fillText(s,x,y);}g.restore();}
function wOf(g,s,size,hand){g.save();g.font=(hand?'700 ':'400 ')+size+'px '+(hand?HAND:PIX);const w=g.measureText(s).width;g.restore();return w;}
/* neon tube strokes */
function tube(g,path,col,w,a){g.save();g.globalAlpha=a*0.45;g.strokeStyle=col;g.lineWidth=w*2.6;g.shadowColor=col;g.shadowBlur=w*5;g.stroke(path);
  g.globalAlpha=a;g.shadowBlur=w*2;g.lineWidth=w;g.stroke(path);g.shadowBlur=0;g.globalAlpha=a*0.85;g.strokeStyle='rgba(255,255,255,0.9)';g.lineWidth=w*0.34;g.stroke(path);g.restore();}
/* the Dahu: a chamois on a slope, the legs on the uphill side shorter than the others */
const DH=(()=>{const body=new Path2D(),legs=new Path2D(),horn=new Path2D(),slope=new Path2D(),eye=new Path2D();
  body.moveTo(64,-40);body.bezierCurveTo(60,-26,52,-20,44,-20);body.bezierCurveTo(20,-14,-30,-14,-54,-22);body.bezierCurveTo(-68,-26,-70,-44,-56,-52);
  body.bezierCurveTo(-30,-66,30,-64,54,-52);body.lineTo(64,-76);body.bezierCurveTo(68,-86,84,-86,92,-74);body.bezierCurveTo(97,-68,96,-63,90,-62);
  body.bezierCurveTo(84,-61,78,-62,74,-60);body.lineTo(64,-40);body.moveTo(80,-61);body.lineTo(81,-50);
  body.moveTo(-60,-48);body.bezierCurveTo(-68,-52,-72,-58,-70,-64);body.moveTo(67,-77);body.quadraticCurveTo(56,-80,51,-89);body.quadraticCurveTo(62,-88,71,-81);
  for(const [x,y0,y1] of [[-44,-24,40],[-32,-20,35],[30,-20,10],[40,-24,6]]){legs.moveTo(x,y0);legs.lineTo(x+(x<0?-2:2),y1);}
  horn.moveTo(72,-83);horn.bezierCurveTo(70,-100,66,-114,56,-112);horn.quadraticCurveTo(51,-110,53,-103);horn.moveTo(83,-84);horn.bezierCurveTo(85,-104,80,-120,70,-120);horn.quadraticCurveTo(65,-119,66,-112);
  slope.moveTo(-118,64);slope.lineTo(118,-30);
  eye.arc(82,-73,2.2,0,Math.PI*2);return{body,legs,horn,slope,eye};})();
function dahu(g,cx,cy,s,a,u){if(a<=0)return;const fl=u<0.5?(Math.sin(u*90)>-0.2?1:0.25):1;g.save();g.translate(cx,cy);g.scale(s,s);g.lineCap='round';g.lineJoin='round';
  tube(g,DH.slope,'#4fe3ff',3.2,a*fl);tube(g,DH.legs,'#ffd23f',4,a*fl);tube(g,DH.body,'#ffd23f',4,a*fl);tube(g,DH.horn,'#ff5fd2',2.8,a*fl);
  g.globalAlpha=a*fl;g.fillStyle='#fff';g.fill(DH.eye);
  for(const [x,y,c,ph] of [[-96,-80,'#ff5fd2',0],[-20,-96,'#4fe3ff',1.7],[110,-96,'#ffd23f',3.1],[-110,10,'#4fe3ff',4.2],[104,20,'#ff5fd2',5.3]]){const tw=0.5+0.5*Math.sin(u*5+ph),r=5+4*tw;g.globalAlpha=a*(0.35+0.65*tw);g.fillStyle=c;g.shadowColor=c;g.shadowBlur=10;
    g.beginPath();g.moveTo(x,y-r);g.quadraticCurveTo(x,y,x+r,y);g.quadraticCurveTo(x,y,x,y+r);g.quadraticCurveTo(x,y,x-r,y);g.quadraticCurveTo(x,y,x,y-r);g.fill();}
  g.restore();}
const HEART=(()=>{const p=new Path2D();p.moveTo(0,10);p.bezierCurveTo(-26,-8,-16,-30,0,-18);p.bezierCurveTo(16,-30,26,-8,0,10);return p;})();
const PLANE=(()=>{const p=new Path2D();p.moveTo(-18,-4);p.lineTo(22,-20);p.lineTo(8,20);p.lineTo(1,4);p.closePath();p.moveTo(1,4);p.lineTo(22,-20);return p;})();
function icon(g,path,x,y,s,col,a){g.save();g.translate(x,y);g.scale(s,s);g.lineCap='round';g.lineJoin='round';tube(g,path,col,3.2,a);g.restore();}
const ap=(t0,d)=>t0==null?0:0;

/* ---- the cards ---- */
function clueCard(g,W,H,horiz,u,out){const A=i=>c01((u-0.12-i*0.14)/0.3)*(1-out),S=i=>back((u-0.12-i*0.14)/0.45);
  if(!horiz){T(g,'3° INDIZIO',540,300,52,'#65dbef',{a:A(0),sc:S(0)});dahu(g,540,720,3.0,A(1),u-0.26);
    T(g,'MA TU LO CONOSCI',540,1110,66,'#ffffff',{a:A(2),sc:S(2),maxW:940});T(g,'IL DAHU?',540,1245,140,'#ff7ad8',{a:A(3),sc:S(3),glow:'rgba(255,122,216,0.6)',maxW:940});
    T(g,'piccolo aiuto: si beve',540,1405,96,'#ffd23f',{hand:1,a:A(5),sc:S(5),maxW:940});}
  else{const L=1316;T(g,'3° INDIZIO',L,120,46,'#65dbef',{a:A(0),sc:S(0)});dahu(g,L,470,2.25,A(1),u-0.26);
    T(g,'MA TU LO CONOSCI IL DAHU?',L,770,60,'#ff7ad8',{a:A(2),sc:S(2),glow:'rgba(255,122,216,0.6)',maxW:1080});T(g,'piccolo aiuto: si beve',L,890,84,'#ffd23f',{hand:1,a:A(4),sc:S(4),maxW:1000});}}
function ctaCard(g,W,H,horiz,u,vt){const A=i=>c01((u-0.1-i*0.13)/0.3),S=i=>back((u-0.1-i*0.13)/0.45),be=M.beatEnv(),pl=1+0.06*be;
  const likeLine=(x,y,size,a,sc)=>{const s='METTI MI PIACE',w=wOf(g,s,size)*(sc||1);icon(g,HEART,x-w/2-size*0.75,y+size*0.32,size/22*pl,'#ff2e88',a);T(g,s,x+size*0.4,y,size,'#ffffff',{a,sc});};
  const sendLine=(x,y,size,lines,a,sc)=>{const w=Math.max(...lines.map(s=>wOf(g,s,size)))*(sc||1);icon(g,PLANE,x-w/2-size*0.8,y+(lines.length-1)*size*0.65,size/24,'#4fe3ff',a);
    lines.forEach((s,i)=>T(g,s,x+size*0.4,y+i*size*1.3,size,'#4fe3ff',{a,sc}));};
  const frameBox=(x0,y0,x1,y1,a)=>{if(a<=0)return;const p=new Path2D();p.roundRect(x0,y0,x1-x0,y1-y0,28);g.save();g.globalAlpha=a*0.5;g.fillStyle='rgba(20,8,36,0.7)';g.fill(p);g.restore();g.lineJoin='round';tube(g,p,'#ff5fd2',3.2+2.2*be,a*(0.75+0.25*be));};
  if(!horiz){T(g,'2DEEP LIVE',540,245,56,'#ff7ad8',{a:A(0),sc:S(0),glow:'rgba(255,122,216,0.6)'});
    T(g,'SABATO',540,385,132,'#ffd23f',{a:A(1),sc:S(1),maxW:940});T(g,'21 NOVEMBRE',540,515,100,'#ffd23f',{a:A(1),sc:S(1),maxW:940});
    T(g,'ORE 21:00',540,635,84,'#ffffff',{a:A(2),sc:S(2),maxW:940});
    T(g,'AL CANTONET',540,785,104,'#ff4a5a',{a:A(3),sc:S(3),glow:'rgba(255,74,90,0.75)',maxW:940});T(g,'FELTRE',540,890,64,'#ffffff',{a:A(3),sc:S(3)});
    T(g,'Ti aspettiamo!',540,1030,118,'#ffffff',{hand:1,a:A(4),sc:S(4)});
    frameBox(80,1135,1000,1465,A(5));likeLine(540,1218,64,A(6),S(6));sendLine(540,1325,54,['E MANDALO A CHI','PORTI CON TE'],A(7),S(7));}
  else{const L=1316;T(g,'2DEEP LIVE',L,105,48,'#ff7ad8',{a:A(0),sc:S(0),glow:'rgba(255,122,216,0.6)'});
    T(g,'SABATO 21 NOVEMBRE',L,215,80,'#ffd23f',{a:A(1),sc:S(1),maxW:1080});T(g,'ORE 21:00',L,318,66,'#ffffff',{a:A(2),sc:S(2)});
    T(g,'AL CANTONET · FELTRE',L,435,78,'#ff4a5a',{a:A(3),sc:S(3),glow:'rgba(255,74,90,0.75)',maxW:1080});
    T(g,'Ti aspettiamo!',L,570,104,'#ffffff',{hand:1,a:A(4),sc:S(4)});
    frameBox(L-540,665,L+540,905,A(5));likeLine(L,735,58,A(6),S(6));sendLine(L,840,46,['E MANDALO A CHI PORTI CON TE'],A(7),S(7));}}
const CLUE0=1.5,CTA0=4.2,END=9.4;
function cards(g,W,H,horiz,vt){if(ev.tWin==null)return;const u=vt-ev.tWin;
  if(u>=CLUE0-0.05&&u<CTA0+0.3)clueCard(g,W,H,horiz,u-CLUE0,c01((u-CTA0)/0.25));
  if(u>=CTA0)ctaCard(g,W,H,horiz,u-CTA0,vt);}
const blurAmt=vt=>ev.tWin==null?0:eo((vt-ev.tWin-CLUE0+0.1)/0.45);

/* ---- vertical: the game full frame ---- */
function drawV(vt){const g=vg,c=cam(vt),v=view(0,0,1080,1920,c),e=blurAmt(vt);g.fillStyle='#05030c';g.fillRect(0,0,1080,1920);
  blit(g,v,0);bloom(g,v,0.55*(1-e));effects(g,v);
  if(e>0){g.save();g.globalAlpha=e;blit(g,v,22,0.32);g.restore();g.fillStyle='rgba(7,5,15,'+0.3*e+')';g.fillRect(0,0,1080,1920);}
  confetti(g,v,vt,e>0?1-0.45*e:1);cards(g,1080,1920,false,vt);
  const hA=c01(1-(vt-1.75)/0.3)*c01((vt-0.06)/0.2);if(hA>0){const gr=g.createLinearGradient(0,980,0,1330);gr.addColorStop(0,'rgba(5,3,12,0)');gr.addColorStop(0.2,'rgba(5,3,12,'+0.6*hA+')');gr.addColorStop(0.8,'rgba(5,3,12,'+0.6*hA+')');gr.addColorStop(1,'rgba(5,3,12,0)');
    g.fillStyle=gr;g.fillRect(0,980,1080,350);T(g,'SABATO SI SUONA',540,1090,84,'#ffd23f',{a:hA,sc:back((vt-0.06)/0.4),maxW:980});
    T(g,'AL CANTONET',540,1218,124,'#ff4a5a',{a:hA,sc:back((vt-0.2)/0.4),glow:'rgba(255,74,90,0.75)',maxW:980});}}
/* ---- horizontal: the game on the left, the words on the right ---- */
function drawH(vt){const g=hg,e=blurAmt(vt);const bg=g.createLinearGradient(0,0,1920,1080);bg.addColorStop(0,'#14092a');bg.addColorStop(1,'#07050f');g.fillStyle=bg;g.fillRect(0,0,1920,1080);
  const gx=140,gy=40,gw=562,gh=1000,c=cam(vt),v=view(gx,gy,gw,gh,c);
  g.save();g.shadowColor='rgba(255,95,210,0.45)';g.shadowBlur=40;g.fillStyle='#05030c';g.fillRect(gx-4,gy-4,gw+8,gh+8);g.restore();
  blit(g,v,0);bloom(g,v,0.55*(1-e));effects(g,v);if(e>0){g.save();g.globalAlpha=e;blit(g,v,9,0.45);g.restore();}confetti(g,v,vt,1);
  g.strokeStyle='rgba(255,95,210,0.8)';g.lineWidth=3;g.strokeRect(gx-3,gy-3,gw+6,gh+6);
  if(ev.tWin!=null&&vt-ev.tWin>=CLUE0-0.05){cards(g,1920,1080,true,vt);return;}
  const L=1316,out=ev.tWin==null?0:c01((vt-ev.tWin-CLUE0+0.4)/0.3),a=i=>c01((vt-0.06-i*0.14)/0.3)*(1-out),s=i=>back((vt-0.06-i*0.14)/0.45);
  T(g,'2DEEP LIVE',L,130,46,'#ff7ad8',{a:a(0),glow:'rgba(255,122,216,0.5)'});
  T(g,'SABATO SI SUONA',L,400,84,'#ffd23f',{a:a(1),sc:s(1),maxW:1080});T(g,'AL CANTONET',L,545,116,'#ff4a5a',{a:a(2),sc:s(2),glow:'rgba(255,74,90,0.75)',maxW:1080});
  T(g,'FELTRE',L,655,58,'#ffffff',{a:a(3),sc:s(3)});
  const d=c01((vt-1.1)/0.3)*(1-out),ds=back((vt-1.1)/0.45);T(g,'SABATO 21 NOVEMBRE',L,815,62,'#ffd23f',{a:d,sc:ds,maxW:1080});T(g,'ORE 21:00',L,905,52,'#ffffff',{a:d,sc:ds});}

function drawGame(){const r=Math.random;Math.random=DR;try{M.draw();}finally{Math.random=r;}}
function offline(){const oac=new OfflineAudioContext(2,44100*2,44100);window.__vt=0;
  window.__OFF=new Proxy(oac,{get(o,q){if(q==='currentTime')return window.__vt;if(q==='state')return 'running';if(q==='resume'||q==='suspend'||q==='close')return ()=>Promise.resolve();const v=o[q];return typeof v==='function'?v.bind(o):v;}});}
function pass1(){offline();setup();M.audio();let n=0;while(n<1800&&(ev.winTick==null||tick<ev.winTick+60)){tickOnce(tick*TICK);n++;}
  const b=ev.last!=null?M.bricks[ev.last]:null;
  return{winTick:ev.winTick,winT:ev.winTick!=null?+(ev.winTick*TICK).toFixed(2):null,lose:!!ev.lose,minBalls,lostBalls,left:M.alive(),last:ev.last,lastXY:b?[b.x+BW/2,b.y+BH/2]:null,lines:ev.lines};}
function start(){setup();M.audio();}
function step(grab){const k=ticksFor();for(let j=0;j<k;j++)tickOnce((frame+j/k)/FPS);
  const vt=frame/FPS;let r=[null,null];if(grab){drawGame();drawV(vt);drawH(vt);r=[VC.toDataURL('image/jpeg',0.92).slice(23),HC.toDataURL('image/jpeg',0.92).slice(23)];}
  frame++;return [r[0],r[1],frame/FPS,ev.tWin!=null&&frame/FPS>=ev.tWin+END];}
/* ---- a still for a photo post (4:5): the lit sign with the confetti, the clue and the like/send box underneath ---- */
const SC=mk(1080,1350),sg=SC.getContext('2d');
function viewR(x,y,w,h,z,cx,cy){const k=cv.width/270,sw=cv.width/z,sh=sw*h/w;const sx=clamp(cx*k-sw/2,0,cv.width-sw),sy=clamp(cy*k-sh/2,0,cv.height-sh);return{x,y,w,h,sx,sy,sw,sh,k,s:k*w/sw};}
function still(vt){drawGame();const g=sg;g.fillStyle='#05030c';g.fillRect(0,0,1080,1350);const v=viewR(0,0,1080,1350,1.0,135,172);
  blit(g,v,0);bloom(g,v,0.55);effects(g,v);confetti(g,v,vt,1);
  const gr=g.createLinearGradient(0,800,0,1350);gr.addColorStop(0,'rgba(5,3,12,0)');gr.addColorStop(0.22,'rgba(5,3,12,0.82)');gr.addColorStop(1,'rgba(5,3,12,0.92)');g.fillStyle=gr;g.fillRect(0,800,1080,550);
  dahu(g,265,985,1.32,1,2);
  T(g,'3° INDIZIO',715,880,36,'#65dbef');T(g,'MA TU LO CONOSCI',715,945,42,'#ffffff',{maxW:560});T(g,'IL DAHU?',715,1025,92,'#ff7ad8',{glow:'rgba(255,122,216,0.6)',maxW:560});
  T(g,'piccolo aiuto: si beve',715,1105,58,'#ffd23f',{hand:1,maxW:560});
  const p=new Path2D();p.roundRect(70,1160,940,145,26);g.save();g.globalAlpha=0.55;g.fillStyle='rgba(20,8,36,0.75)';g.fill(p);g.restore();g.lineJoin='round';tube(g,p,'#ff5fd2',3.6,1);
  const s1='METTI MI PIACE',s2='E MANDALO A CHI PORTI CON TE',w1=wOf(g,s1,44),w2=wOf(g,s2,34);
  icon(g,HEART,540-w1/2-26,1212+20,40/22,'#ff2e88',1);T(g,s1,540+18,1210,44,'#ffffff');
  icon(g,PLANE,540-w2/2-30,1266,32/24,'#4fe3ff',1);T(g,s2,540+18,1265,34,'#4fe3ff');
  return SC.toDataURL('image/png').slice(22);}
return{pass1,start,step,still,info:()=>({ev,tick,frame,minBalls,lostBalls,winT:SET.winTick*TICK,songoff:window.__SONGOFF})};})();
