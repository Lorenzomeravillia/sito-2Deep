/* Promo video from Libera: scripted gameplay (waypoints), camera, overlays, vertical 1080x1920 and horizontal 1920x1080.
   Runs inside the game page (artifact build with hooks __X, __V, __sfxLog). VID.step() advances one frame and returns both JPEGs. */
window.VID=(function(){
const X=__X,G=X.G,V=__V,cv=document.getElementById('c'),FPS=30;
const VC=document.createElement('canvas');VC.width=1080;VC.height=1920;const vg=VC.getContext('2d');
const HC=document.createElement('canvas');HC.width=1920;HC.height=1080;const hg=HC.getContext('2d');
const IM={};for(const [k,src] of Object.entries(window.__VIMG))(IM[k]=new Image()).src=src;
const clamp=(u)=>Math.max(0,Math.min(1,u)),eo=u=>1-Math.pow(1-clamp(u),3),eio=u=>{u=clamp(u);return u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;};
const back=u=>{u=clamp(u);const c1=1.9,c3=c1+1;return 1+c3*Math.pow(u-1,3)+c1*Math.pow(u-1,2);};
/* ---- the script: where the note goes (cells), with pauses to enjoy each reveal ---- */
const WP=[[1,23,0.25],[84,23,1.05],[84,45,0],[1,45,1.0],[22,45,0],[22,70,0],[1,70,1.9],[22,70,0],[22,100,0],[64,100,0],[64,45,1.6]];
let wi=0,hold=0,t=0,frame=0;const ev={};let lastPct=0,closes=[];
G.state='play';G.px=1;G.py=23;G.dx=G.dy=0;G.draw=false;G.trail=[];G.nextItem=1e9;G.items=[];G.lives=3;G.score=0;
const E=G.enemies;
function enemies(){const b=E.find(e=>e.boss),r=E.find(e=>e.k==='remote'),s=E.find(e=>e.k==='slip');
  const set=(e,x,y)=>{if(!e)return;e.vx=(x-e.x)||e.vx;e.vy=0.0001;e.x=x;e.y=y;};
  set(b,165+48*Math.sin(t*0.9),372+12*Math.sin(t*1.4));set(r,70+26*Math.sin(t*1.2+1),398+8*Math.cos(t*1.5));set(s,130+9*Math.sin(t*2.1),228+7*Math.cos(t*1.6));
  E.forEach(e=>{e.vx=Math.sign(e.vx)*0.0001||0.0001;e.vy=0;});}
function drive(dt){if(hold>0){hold-=dt;G.dx=G.dy=0;return;}const w=WP[wi];if(!w){G.dx=G.dy=0;return;}
  if(G.px===w[0]&&G.py===w[1]){hold=w[2];wi++;G.dx=G.dy=0;return;}
  G.dx=Math.sign(w[0]-G.px);G.dy=Math.sign(w[1]-G.py);
  /* faster than the game: snappier on screen; even faster along land */
  const land=X.grid[(G.py+G.dy)*86+(G.px+G.dx)]===1&&!G.draw;G.moveAcc+=dt*30*(land?2.4:1.15);}
function sim(dt){const n=6;for(let i=0;i<n;i++){drive(dt/n);X.update(dt/n);enemies();}
  if(G.pct>lastPct+0.005){closes.push({t,pct:G.pct});lastPct=G.pct;}
  if(!ev.item&&t>=2.9){ev.item=t;G.items.push({k:'i0',c:12,r:57,x:12*3+1.5,y:57*3+1.5,t:G.t});}
  if(!ev.gift&&closes.length>=4){ev.gift=t;G.items.push({k:'m',c:44,r:116,x:44*3+1.5,y:116*3+1.5,t:G.t});}
  if(!ev.pol&&G.found&&('s0' in G.found)){ev.pol=t;}
  if(!ev.end&&closes.length>=4&&t>=closes[3].t+1.7){ev.end=t;window.__sfxLog.push([t,'win',null]);}}
/* ---- camera: a push-in on the polaroid when it is found ---- */
function punch(){let p=0;for(const c of closes){const u=t-c.t;if(u>=0&&u<0.5)p=Math.max(p,0.045*Math.exp(-u*9)*Math.cos(u*22));}return p;}
function cam(){const k=1+punch();if(!ev.pol)return{s:k,cx:135,cy:240};const u=t-ev.pol-0.15,a=eio(u/0.45)*(1-eio((u-1.55)/0.45));
  const P=V.POLA[0],cx=V.FX+P.x+V.PW/2,cy=V.FY+P.y+V.PH/2,s=(1+0.9*a)*k;return{s,cx:135+(cx-135)*a,cy:240+(cy-240)*a};}
function game(g,x,y,w,h,c,blur){const k=cv.width/270,sw=cv.width/Math.max(1,c.s),sh=cv.height/Math.max(1,c.s);let sx=c.cx*k-sw/2,sy=c.cy*k-sh/2;
  sx=Math.max(0,Math.min(cv.width-sw,sx));sy=Math.max(0,Math.min(cv.height-sh,sy));g.save();g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
  if(blur)g.filter='blur('+blur+'px) brightness(0.55)';g.drawImage(cv,sx,sy,sw,sh,x,y,w,h);g.restore();}
const PIX="'Silk',monospace",HAND="'Caveat',cursive";
function T(g,s,x,y,size,col,o={}){g.save();g.font=(o.hand?'700 ':'400 ')+size+'px '+(o.hand?HAND:PIX);g.textAlign=o.align||'center';g.textBaseline='middle';
  if(o.a!==undefined)g.globalAlpha=clamp(o.a);let sc=o.sc||1;if(o.maxW){const w=g.measureText(s).width;if(w>o.maxW)sc*=o.maxW/w;}if(sc!==1){g.translate(x,y);g.scale(sc,sc);g.translate(-x,-y);}
  if(o.glow){g.shadowColor=o.glow;g.shadowBlur=size*0.45;}
  if(!o.hand){g.lineJoin='round';g.lineWidth=Math.max(3,size*0.14);g.strokeStyle=o.stroke||'#0a0716';g.strokeText(s,x,y);}
  g.fillStyle=col;g.fillText(s,x,y);if(o.glow){g.shadowBlur=size*0.2;g.fillText(s,x,y);}g.restore();}
function sticker(g,im,x,y,w,a,rot){if(!im.naturalWidth)return;const h=w*im.naturalHeight/im.naturalWidth;g.save();g.globalAlpha=clamp(a);g.translate(x,y);g.rotate(rot||0);
  const hl=g.createRadialGradient(0,0,w*0.1,0,0,w*0.85);hl.addColorStop(0,'rgba(255,224,58,0.5)');hl.addColorStop(1,'rgba(255,224,58,0)');g.fillStyle=hl;g.fillRect(-w,-w,2*w,2*w);
  g.shadowColor='rgba(255,255,255,0.95)';g.shadowBlur=w*0.06;g.drawImage(im,-w/2,-h/2,w,h);g.shadowColor='rgba(0,0,0,0.5)';g.shadowBlur=w*0.08;g.shadowOffsetY=w*0.03;g.drawImage(im,-w/2,-h/2,w,h);g.restore();}
const ap=(t0,d)=>clamp((t-t0)/(d||0.35));
/* ---- the end card: what, where, when, the first clue, the tease ---- */
function endCard(g,W,H,horiz){const t0=ev.end,u=t-t0;const st=i=>t0+0.18+i*0.16;const A=i=>ap(st(i),0.3),S=i=>back(ap(st(i),0.45));
  const bob=Math.sin(u*2.4)*6,pulse=0.78+0.22*Math.sin(u*4.2),z=1+0.025*clamp((u-1)/4);
  g.save();g.translate(W/2,H/2);g.scale(z,z);g.translate(-W/2,-H/2);
  if(!horiz){const M=940;let y=300;
    T(g,'2DEEP LIVE',W/2,y,60,'#ff7ad8',{a:A(0),sc:S(0),glow:'rgba(255,122,216,0.6)',maxW:M});y+=140;
    T(g,'SABATO',W/2,y,128,'#f2d27a',{a:A(1),sc:S(1),maxW:M});y+=130;T(g,'21 NOVEMBRE',W/2,y,100,'#f2d27a',{a:A(1),sc:S(1),maxW:M});y+=125;
    T(g,'ORE 21:00',W/2,y,92,'#ffffff',{a:A(2),sc:S(2),maxW:M});y+=150;
    T(g,'AL CANTONET',W/2,y,100,'#ff4a5a',{a:A(3),sc:S(3),glow:'rgba(255,74,90,0.75)',maxW:M});y+=105;T(g,'FELTRE',W/2,y,66,'#ffffff',{a:A(3),sc:S(3),maxW:M});
    y+=130;T(g,'1° INDIZIO',W/2,y,42,'#65dbef',{a:A(4)});sticker(g,IM.cocktail,W/2-180,y+130+bob,230,A(4),-0.08);
    T(g,'I cocktail',W/2+120,y+100,78,'#ffffff',{hand:1,a:A(4)});T(g,'di Elisa',W/2+120,y+180,78,'#ffffff',{hand:1,a:A(4)});
    y+=300;T(g,'E CHI È IL DAÙ?',W/2,y,50,'#ff7ad8',{a:A(6),sc:S(6),maxW:M});y+=65;T(g,'AL PROSSIMO INDIZIO...',W/2,y,38,'#d8cfe8',{a:A(7),maxW:M});
    y+=75;T(g,'GIOCA SU 2DEEP.IT/LIBERA',W/2,y,40,'#65dbef',{a:A(8)*pulse,maxW:M});}
  else{const L=1316,M=1060;let y=150;
    T(g,'2DEEP LIVE',L,y,56,'#ff7ad8',{a:A(0),sc:S(0),glow:'rgba(255,122,216,0.6)',maxW:M});y+=130;
    T(g,'SABATO 21 NOVEMBRE',L,y,80,'#f2d27a',{a:A(1),sc:S(1),maxW:M});y+=112;T(g,'ORE 21:00',L,y,74,'#ffffff',{a:A(2),sc:S(2),maxW:M});y+=128;
    T(g,'AL CANTONET · FELTRE',L,y,74,'#ff4a5a',{a:A(3),sc:S(3),glow:'rgba(255,74,90,0.75)',maxW:M});
    y+=160;sticker(g,IM.cocktail,L-250,y+40+bob,190,A(4),-0.08);T(g,'1° INDIZIO',L+90,y-20,38,'#65dbef',{a:A(4)});T(g,'I cocktail di Elisa',L+90,y+50,70,'#ffffff',{hand:1,a:A(4)});
    T(g,'E CHI È IL DAÙ? AL PROSSIMO INDIZIO...',L,905,36,'#ff7ad8',{a:A(6),maxW:M});T(g,'GIOCA SU 2DEEP.IT/LIBERA',L,975,40,'#65dbef',{a:A(8)*pulse,maxW:M});}
  g.restore();}
/* ---- vertical: the game full frame, a hook, the end card ---- */
function drawV(){const c=cam(),g=vg;const e=ev.end?eo((t-ev.end)/0.5):0;g.fillStyle='#07050f';g.fillRect(0,0,1080,1920);
  game(g,0,0,1080,1920,c,0);if(e>0){g.save();g.globalAlpha=e;game(g,0,0,1080,1920,c,14);g.restore();g.fillStyle='rgba(7,5,15,'+0.35*e+')';g.fillRect(0,0,1080,1920);endCard(g,1080,1920,false);}
  /* hook */
  const hA=clamp(1-(t-1.5)/0.4)*ap(0.1,0.25);if(hA>0){T(g,'DOVE SUONIAMO',540,820,84,'#f2d27a',{a:hA,sc:back(ap(0.1,0.4))});T(g,'SABATO?',540,930,120,'#ffffff',{a:hA,sc:back(ap(0.25,0.4))});}}
/* ---- horizontal: the game on the left, the clues appear on the right as the poster is uncovered ---- */
function drawH(){const c=cam(),g=hg;const e=ev.end?eo((t-ev.end)/0.5):0;
  const bg=g.createLinearGradient(0,0,1920,1080);bg.addColorStop(0,'#14092a');bg.addColorStop(1,'#07050f');g.fillStyle=bg;g.fillRect(0,0,1920,1080);
  const gx=140,gy=40,gw=562,gh=1000;g.save();g.shadowColor='rgba(255,122,216,0.45)';g.shadowBlur=40;g.fillStyle='#07050f';g.fillRect(gx-4,gy-4,gw+8,gh+8);g.restore();
  game(g,gx,gy,gw,gh,c,e>0?10*e:0);g.strokeStyle='rgba(255,122,216,0.8)';g.lineWidth=3;g.strokeRect(gx-3,gy-3,gw+6,gh+6);
  if(e>0){endCard(g,1920,1080,true);return;}
  const L=1316,M=1060;T(g,'LIBERA LA SERATA',L,110,44,'#ff7ad8',{glow:'rgba(255,122,216,0.5)'});
  const hA=clamp(1-(t-(closes[0]?closes[0].t:99))/0.3);if(hA>0)T(g,'DOVE SUONIAMO SABATO?',L,420,62,'#f2d27a',{a:hA*ap(0.1,0.3),maxW:M});
  if(closes[0]){const a=ap(closes[0].t+0.3),s=back(ap(closes[0].t+0.3,0.45));T(g,'AL CANTONET',L,300,96,'#ff4a5a',{a,sc:s,glow:'rgba(255,74,90,0.75)'});T(g,'FELTRE',L,395,58,'#ffffff',{a,sc:s});}
  if(closes[1]){const a=ap(closes[1].t+0.3),s=back(ap(closes[1].t+0.3,0.45));T(g,'SAB 21 NOV',L,540,92,'#f2d27a',{a,sc:s});T(g,'ORE 21:00',L,640,64,'#ffffff',{a,sc:s});}
  if(ev.pol){const a=ap(ev.pol+0.2);sticker(g,IM.cocktail,L-240,830,170,a,-0.08);T(g,'1° INDIZIO',L+80,775,34,'#65dbef',{a});T(g,'I cocktail di Elisa',L+80,845,62,'#ffffff',{hand:1,a});}
  if(ev.gift){const a=ap(ev.gift+0.2);T(g,'E CHI È IL DAÙ?',L,985,40,'#ff7ad8',{a});}}
function step(){window.__vt=t;sim(1/FPS);window.__lay.push(V.layers());X.draw();drawV();drawH();t+=1/FPS;frame++;
  return [VC.toDataURL('image/jpeg',0.92).slice(23),HC.toDataURL('image/jpeg',0.92).slice(23),t,!!ev.end&&t>=ev.end+5.2];}
return{step,ev:()=>({ev,closes,t,pct:G.pct})};})();
