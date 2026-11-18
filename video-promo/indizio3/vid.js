/* 3rd clue promo from the breakout game: an autopilot plays, overlays in the clue series' style, vertical 1080x1920 and horizontal 1920x1080.
   Runs inside the game page (artifact build with hooks __MV, __OFF). VID.step(grab) advances one frame and returns both JPEGs when grab. */
window.VID=(function(){
const M=__MV,cv=document.getElementById('c'),FPS=30;
const VC=document.createElement('canvas');VC.width=1080;VC.height=1920;const vg=VC.getContext('2d');
const HC=document.createElement('canvas');HC.width=1920;HC.height=1080;const hg=HC.getContext('2d');
const C=window.__CLUE;
const IM={};for(const [k,src] of Object.entries(window.__VIMG))(IM[k]=new Image()).src=src;
const clamp=u=>Math.max(0,Math.min(1,u)),eo=u=>1-Math.pow(1-clamp(u),3);
const back=u=>{u=clamp(u);const c1=1.9,c3=c1+1;return 1+c3*Math.pow(u-1,3)+c1*Math.pow(u-1,2);};
let t=0,frame=0,readyT=0,lost=0,lastBalls=1;const ev={},prog=[],lines={};
const NB=M.bricks.length;
/* ---- autopilot: under the ball that lands first, aiming at the side with more bricks; capsules when there is time ---- */
function aimSide(x){let l=0,r=0;for(const b of M.bricks)if(b.alive){if(b.x+12<x)l++;else r++;}return r>l*1.15?1:(l>r*1.15?-1:0);}
function pilot(dt){const p=M.paddle;
  if(M.st==='ready'){readyT+=dt;if(readyT>(t<1?0.6:0.45)){M.launch();readyT=0;}}
  let best=null,bt=1e9;for(const b of M.balls){if(b.stuck||b.vy<=0)continue;const tt=(p.y-b.r-b.y)/b.vy;if(tt>=-0.02&&tt<bt){bt=tt;best=b;}}
  let tx=p.x;
  if(best){let x=best.x+best.vx*Math.max(0,bt);const lo=best.r+1,hi=270-best.r-1,span=hi-lo;x=((x-lo)%(2*span)+2*span)%(2*span);x=lo+(x>span?2*span-x:x);
    tx=x-aimSide(x)*p.w*0.26;}
  if(bt>0.5){const c=M.caps.filter(c=>c.k==='M'||c.k==='L').sort((a,b)=>b.y-a.y)[0];if(c&&c.y>300)tx=c.x;}
  const mv=560*dt;p.x+=Math.max(-mv,Math.min(mv,tx-p.x));M.clampPaddle();}
/* two triple-ball capsules early on, so the wall goes down at video pace */
const GIFTS=[[1.6,0.35],[4.2,0.7]];
function sim(dt0){let dt=dt0;if(M.slowT>0){M.slowT=M.slowT-dt;dt*=M.slowF;}
  window.__vt=t;window.__gt=M.t;pilot(dt);M.update(dt);
  for(const g of GIFTS)if(!g.done&&t>=g[0]&&M.st==='play'){g.done=1;M.caps.push({k:'M',x:40+g[1]*190,y:300,vy:60});}
  window.__lq=window.__lq.filter(([at,fn])=>{if(M.t>=at){fn();return false;}return true;});
  M.musicTick();
  const nb=M.balls.length;if(M.st==='play'&&nb<lastBalls)lost+=lastBalls-nb;lastBalls=nb;
  const pr=1-M.alive()/NB;prog.push([+t.toFixed(3),+pr.toFixed(3),nb]);
  if(!ev.launch&&M.st==='play')ev.launch=t;
  if(!ev.boss&&M.boss)ev.boss=t;if(!ev.ko&&M.bossDone)ev.ko=t;
  M.SIGN.forEach((L,i)=>{if(L.done&&lines[i]==null)lines[i]=t;});
  for(const k of [0.2,0.4,0.6,0.8])if(ev['p'+k]==null&&pr>=k)ev['p'+k]=t;
  if(!ev.win&&M.st==='win')ev.win=t;
  if(!ev.end&&ev.win&&t>=ev.win+1.7)ev.end=t;}
function punch(){let p=0;for(const k in lines){const u=t-lines[k];if(u>=0&&u<0.5)p=Math.max(p,0.035*Math.exp(-u*9)*Math.cos(u*22));}return p;}
function game(g,x,y,w,h,blur){const s=1+punch(),sw=cv.width/s,sh=cv.height/s,sx=(cv.width-sw)/2,sy=(cv.height-sh)/2;g.save();g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
  if(blur)g.filter='blur('+blur+'px) brightness(0.55)';g.drawImage(cv,sx,sy,sw,sh,x,y,w,h);g.restore();}
const PIX="'Silk',monospace",HAND="'Caveat',cursive";
function T(g,s,x,y,size,col,o={}){g.save();g.font=(o.hand?'700 ':'400 ')+size+'px '+(o.hand?HAND:PIX);g.textAlign=o.align||'center';g.textBaseline='middle';
  if(o.a!==undefined)g.globalAlpha=clamp(o.a);let sc=o.sc||1;if(o.maxW){const w=g.measureText(s).width;if(w>o.maxW)sc*=o.maxW/w;}if(sc!==1){g.translate(x,y);g.scale(sc,sc);g.translate(-x,-y);}
  if(o.glow){g.shadowColor=o.glow;g.shadowBlur=size*0.45;}
  if(!o.hand){g.lineJoin='round';g.lineWidth=Math.max(3,size*0.14);g.strokeStyle=o.stroke||'#0a0716';g.strokeText(s,x,y);}
  else{g.lineJoin='round';g.lineWidth=size*0.12;g.strokeStyle='rgba(10,7,22,0.85)';g.strokeText(s,x,y);}
  g.fillStyle=col;g.fillText(s,x,y);if(o.glow){g.shadowBlur=size*0.2;g.fillText(s,x,y);}g.restore();}
function sticker(g,im,x,y,w,a,rot){if(!im.naturalWidth)return;const h=w*im.naturalHeight/im.naturalWidth;g.save();g.globalAlpha=clamp(a);g.translate(x,y);g.rotate(rot||0);
  const hl=g.createRadialGradient(0,0,w*0.1,0,0,w*0.85);hl.addColorStop(0,'rgba(255,224,58,0.5)');hl.addColorStop(1,'rgba(255,224,58,0)');g.fillStyle=hl;g.fillRect(-w,-w,2*w,2*w);
  g.shadowColor='rgba(255,255,255,0.95)';g.shadowBlur=w*0.06;g.drawImage(im,-w/2,-h/2,w,h);g.shadowColor='rgba(0,0,0,0.5)';g.shadowBlur=w*0.08;g.shadowOffsetY=w*0.03;g.drawImage(im,-w/2,-h/2,w,h);g.restore();}
const ap=(t0,d)=>t0==null?0:clamp((t-t0)/(d||0.35));
/* ---- the end card: when, where, the third clue, the Dahu, where to play ---- */
function endCard(g,W,H,horiz){const t0=ev.end,u=t-t0;const st=i=>t0+0.18+i*0.16;const A=i=>ap(st(i),0.3),S=i=>back(ap(st(i),0.45));
  const bob=Math.sin(u*2.4)*6,pulse=0.78+0.22*Math.sin(u*4.2),z=1+0.025*clamp((u-1)/4);
  g.save();g.translate(W/2,H/2);g.scale(z,z);g.translate(-W/2,-H/2);
  if(!horiz){const Mw=940;let y=300;
    T(g,'2DEEP LIVE',W/2,y,60,'#ff7ad8',{a:A(0),sc:S(0),glow:'rgba(255,122,216,0.6)',maxW:Mw});y+=140;
    T(g,'SABATO',W/2,y,128,'#f2d27a',{a:A(1),sc:S(1),maxW:Mw});y+=130;T(g,'21 NOVEMBRE',W/2,y,100,'#f2d27a',{a:A(1),sc:S(1),maxW:Mw});y+=125;
    T(g,'ORE 21:00',W/2,y,92,'#ffffff',{a:A(2),sc:S(2),maxW:Mw});y+=150;
    T(g,'AL CANTONET',W/2,y,100,'#ff4a5a',{a:A(3),sc:S(3),glow:'rgba(255,74,90,0.75)',maxW:Mw});y+=105;T(g,'FELTRE',W/2,y,66,'#ffffff',{a:A(3),sc:S(3),maxW:Mw});
    y+=130;T(g,C.n+'° INDIZIO',W/2,y,42,'#65dbef',{a:A(4)});sticker(g,IM[C.img],W/2-190,y+130+bob,250,A(4),-0.08);
    T(g,C.v[0],W/2+130,y+85,78,'#ffffff',{hand:1,a:A(4)});T(g,C.v[1],W/2+130,y+160,78,'#ffffff',{hand:1,a:A(4)});
    T(g,C.sub,W/2+130,y+228,30,'#f2d27a',{a:A(5),maxW:440});
    y+=300;T(g,'MA TU LO CONOSCI IL DAHU?',W/2,y,50,'#ff7ad8',{a:A(6),sc:S(6),maxW:Mw});y+=65;T(g,'FATTELA RACCONTARE AL BANCONE',W/2,y,38,'#d8cfe8',{a:A(7),maxW:Mw});
    y+=75;T(g,'GIOCA SU 2DEEP.IT/GIOCHI',W/2,y,40,'#65dbef',{a:A(8)*pulse,maxW:Mw});}
  else{const L=1316,Mw=1060;let y=150;
    T(g,'2DEEP LIVE',L,y,56,'#ff7ad8',{a:A(0),sc:S(0),glow:'rgba(255,122,216,0.6)',maxW:Mw});y+=130;
    T(g,'SABATO 21 NOVEMBRE',L,y,80,'#f2d27a',{a:A(1),sc:S(1),maxW:Mw});y+=112;T(g,'ORE 21:00',L,y,74,'#ffffff',{a:A(2),sc:S(2),maxW:Mw});y+=128;
    T(g,'AL CANTONET · FELTRE',L,y,74,'#ff4a5a',{a:A(3),sc:S(3),glow:'rgba(255,74,90,0.75)',maxW:Mw});
    y+=160;sticker(g,IM[C.img],L-250,y+40+bob,200,A(4),-0.08);T(g,C.n+'° INDIZIO',L+90,y-20,38,'#65dbef',{a:A(4)});T(g,C.h,L+90,y+50,70,'#ffffff',{hand:1,a:A(4),maxW:640});
    T(g,C.sub,L+90,y+112,30,'#f2d27a',{a:A(5),maxW:640});
    T(g,'MA TU LO CONOSCI IL DAHU?',L,858,44,'#ff7ad8',{a:A(6),sc:S(6),maxW:Mw});T(g,'FATTELA RACCONTARE AL BANCONE',L,918,32,'#d8cfe8',{a:A(7),maxW:Mw});T(g,'GIOCA SU 2DEEP.IT/GIOCHI',L,985,40,'#65dbef',{a:A(8)*pulse,maxW:Mw});}
  g.restore();}
/* ---- vertical: the game full frame, the hook, the end card ---- */
function drawV(){const g=vg;const e=ev.end?eo((t-ev.end)/0.5):0;g.fillStyle='#05030c';g.fillRect(0,0,1080,1920);
  game(g,0,0,1080,1920,0);if(e>0){g.save();g.globalAlpha=e;game(g,0,0,1080,1920,14);g.restore();g.fillStyle='rgba(7,5,15,'+0.35*e+')';g.fillRect(0,0,1080,1920);endCard(g,1080,1920,false);}
  const hA=clamp(1-(t-1.9)/0.4)*ap(0.1,0.25);if(hA>0){g.fillStyle='rgba(5,3,12,'+0.5*hA+')';g.fillRect(0,985,1080,300);T(g,C.hook[0],540,1070,84,'#f2d27a',{a:hA,sc:back(ap(0.1,0.4)),maxW:980});T(g,C.hook[1],540,1190,120,'#ffffff',{a:hA,sc:back(ap(0.25,0.4)),maxW:980});}}
/* ---- horizontal: the game on the left, what the sign says and the clue appear on the right as the wall comes down ---- */
function drawH(){const g=hg;const e=ev.end?eo((t-ev.end)/0.5):0;
  const bg=g.createLinearGradient(0,0,1920,1080);bg.addColorStop(0,'#14092a');bg.addColorStop(1,'#07050f');g.fillStyle=bg;g.fillRect(0,0,1920,1080);
  const gx=140,gy=40,gw=562,gh=1000;g.save();g.shadowColor='rgba(255,95,210,0.45)';g.shadowBlur=40;g.fillStyle='#05030c';g.fillRect(gx-4,gy-4,gw+8,gh+8);g.restore();
  game(g,gx,gy,gw,gh,e>0?10*e:0);g.strokeStyle='rgba(255,95,210,0.8)';g.lineWidth=3;g.strokeRect(gx-3,gy-3,gw+6,gh+6);
  if(e>0){endCard(g,1920,1080,true);return;}
  const L=1316,Mw=1060;T(g,'2DEEP LIVE',L,110,44,'#ff7ad8',{glow:'rgba(255,122,216,0.5)'});
  const hA=clamp(1-(t-(ev['p0.2']||99))/0.3);if(hA>0)T(g,C.hookH,L,420,62,'#f2d27a',{a:hA*ap(0.1,0.3),maxW:Mw});
  if(ev['p0.2']){const a=ap(ev['p0.2']+0.3),s=back(ap(ev['p0.2']+0.3,0.45));T(g,'AL CANTONET',L,300,96,'#ff4a5a',{a,sc:s,glow:'rgba(255,74,90,0.75)'});T(g,'FELTRE',L,395,58,'#ffffff',{a,sc:s});}
  if(ev['p0.4']){const a=ap(ev['p0.4']+0.3),s=back(ap(ev['p0.4']+0.3,0.45));T(g,'SAB 21 NOV',L,540,92,'#f2d27a',{a,sc:s});T(g,'ORE 21:00',L,640,64,'#ffffff',{a,sc:s});}
  if(ev['p0.6']){const a=ap(ev['p0.6']+0.2),bob=Math.sin(t*2.4)*5;sticker(g,IM[C.img],L-240,830+bob,180,a,-0.08);T(g,C.n+'° INDIZIO',L+80,775,34,'#65dbef',{a});T(g,C.h,L+80,845,62,'#ffffff',{hand:1,a,maxW:640});T(g,C.sub,L+80,905,26,'#f2d27a',{a,maxW:640});}
  if(ev['p0.8']){const a=ap(ev['p0.8']+0.2);T(g,'MA TU LO CONOSCI IL DAHU?',L,985,40,'#ff7ad8',{a,maxW:Mw});}}
function step(grab){sim(1/FPS);M.draw();let r=[null,null];if(grab){drawV();drawH();r=[VC.toDataURL('image/jpeg',0.92).slice(23),HC.toDataURL('image/jpeg',0.92).slice(23)];}
  t+=1/FPS;frame++;return [r[0],r[1],t,!!ev.end&&t>=ev.end+6.6];}
return{step,ev:()=>({ev,lines,t,lost,prog:prog.filter((x,i)=>i%15===0)})};})();
