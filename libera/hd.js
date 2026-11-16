/* ---- the objects in high definition: the neon note, the prizes (the venue's real photos cut out, or 3D icons), the enemies
   and the polaroids. The poster stays pixel art; whatever moves or is pinned on it is drawn at the screen's resolution with the
   same soft light edge, the same shadow and the same halo, so it all reads as stickers on the poster.
   3D icons: Microsoft Fluent Emoji (MIT, assets/giochi/icone). Handwriting: Caveat (OFL, assets/giochi/caveat-700.woff2). ---- */
const ICON_SRC=window.__GAME_ICONS||{},iconUrl=k=>ICON_SRC[k]||('/assets/giochi/icone/'+k+'.webp');
const HD={K:0,dirty:true,spr:{},pol:[],clip:[],font:false};
const HDIMG={};function hdImg(url){if(!url)return null;if(!HDIMG[url]){const i=new Image();i.onload=()=>{HD.dirty=true;};i.src=url;HDIMG[url]=i;}return HDIMG[url];}
const ready=i=>i&&i.complete&&i.naturalWidth>0;
/* the same treatment for every object, in poster units */
const SH={blur:3,dy:1.6,col:'rgba(0,0,0,0.5)'},RIM={w:0.8,blur:2.8,col:'rgba(255,255,255,0.9)'},HALO=0.5;
try{const ff=new FontFace('Caveat','url('+(window.__GAME_FONT||'/assets/giochi/caveat-700.woff2')+')',{weight:'700'});
  ff.load().then(f=>{document.fonts.add(f);HD.font=true;HD.dirty=true;}).catch(()=>{});}catch(e){}
const HAND="700 10px Caveat,'Segoe Print','Bradley Hand',cursive";
/* one object: shadow, soft light edge, then the object, baked once at the screen's resolution */
function bake(wU,hU,paint,pixel){const M=7,k=K,obj=mk(Math.max(1,Math.round(wU*k)),Math.max(1,Math.round(hU*k))),og=obj.getContext('2d');
  og.imageSmoothingEnabled=!pixel;og.imageSmoothingQuality='high';paint(og,obj.width,obj.height);
  const c=mk(obj.width+2*M*k,obj.height+2*M*k),g=c.getContext('2d'),o=M*k;
  /* the soft white edge: the object's silhouette in white, spread around it and blurred */
  const sil=mk(obj.width,obj.height),sg=sil.getContext('2d');sg.drawImage(obj,0,0);sg.globalCompositeOperation='source-in';sg.fillStyle=RIM.col;sg.fillRect(0,0,sil.width,sil.height);
  const rim=mk(c.width,c.height),rg=rim.getContext('2d');rg.shadowColor=RIM.col;rg.shadowBlur=RIM.blur*k;
  for(let a=0;a<12;a++){const r=RIM.w*k;rg.drawImage(sil,o+Math.cos(a*Math.PI/6)*r,o+Math.sin(a*Math.PI/6)*r);}
  /* only around the object, not behind it (glass stays see-through) */
  rg.shadowColor='transparent';rg.globalCompositeOperation='destination-out';rg.drawImage(sil,o,o);
  g.save();g.shadowColor=SH.col;g.shadowBlur=SH.blur*k;g.shadowOffsetY=SH.dy*k;g.drawImage(rim,0,0);g.restore();
  g.drawImage(obj,o,o);return{c,wU:wU+2*M,hU:hU+2*M,w:wU,h:hU};}
const contain=(g,im,W,H)=>{const s=Math.min(W/im.naturalWidth,H/im.naturalHeight),w=im.naturalWidth*s,h=im.naturalHeight*s;g.drawImage(im,(W-w)/2,(H-h)/2,w,h);};
/* an image (cut-out photo or icon) fitted in a box of b units, keeping its proportions */
function bakeImg(im,b){const r=im.naturalWidth/im.naturalHeight,w=r>=1?b:b*r,h=r>=1?b/r:b;return bake(w,h,(g,W,H)=>g.drawImage(im,0,0,W,H));}
/* the player: a neon note, yellow body, white core, glow */
function paintNote(g,W,H){g.save();g.scale(W/24,H/26);g.translate(12,13);g.shadowColor='#ffe03a';g.shadowBlur=3.2*W/24;
  const ng=g.createLinearGradient(-8,-12,8,10);ng.addColorStop(0,'#fff7b0');ng.addColorStop(1,'#ffc21a');g.fillStyle=ng;
  g.beginPath();g.ellipse(-3.2,6.6,5.4,4.2,-0.45,0,Math.PI*2);g.fill();g.fillRect(1.1,-10.5,2.4,17.4);
  g.beginPath();g.moveTo(1.1,-10.5);g.bezierCurveTo(7.5,-9,10.2,-5.4,8.4,-0.8);g.bezierCurveTo(7.4,-4.4,4.8,-6.2,3.5,-6.2);g.closePath();g.fill();
  g.shadowBlur=0;g.fillStyle='rgba(255,255,255,0.8)';g.beginPath();g.ellipse(-5,5.3,1.8,1.1,-0.45,0,Math.PI*2);g.fill();g.fillRect(1.9,-9,0.8,12);g.restore();}
/* the remote control (there is no emoji for it): drawn, with a little volume */
function paintRemote(g,W,H){g.save();g.scale(W/10,H/24);const rg=g.createLinearGradient(0,0,10,0);rg.addColorStop(0,'#2b2b33');rg.addColorStop(0.5,'#4c4c58');rg.addColorStop(1,'#1c1c23');
  g.fillStyle=rg;g.beginPath();g.roundRect(0.3,0.3,9.4,23.4,3.2);g.fill();g.fillStyle='rgba(255,255,255,0.16)';g.fillRect(1.4,1.6,1.1,20.5);
  g.fillStyle='#ff3b4a';g.beginPath();g.arc(5,4.2,1.5,0,Math.PI*2);g.fill();
  [['#7ee08a',2.4],['#ffd23f',5],['#5aa9ff',7.6]].forEach(([c,x])=>{g.fillStyle=c;g.beginPath();g.arc(x,9.2,1,0,Math.PI*2);g.fill();});
  g.fillStyle='#a2a2b4';for(let r=0;r<3;r++)for(const x of [2.4,5,7.6]){g.beginPath();g.arc(x,13.4+r*2.9,0.85,0,Math.PI*2);g.fill();}g.restore();}
function buildSprites(){const S={};
  S.note=bake(17,18.5,paintNote);
  /* prizes: the cut-out photo when the venue has one, otherwise the 3D icon of its kind; the mystery box is a gift */
  CFG.items.forEach((it,i)=>{const cut=it.cut?hdImg(it.cut):null,ic=hdImg(iconUrl(it.icon)),
      im=ready(cut)?cut:ready(ic)?ic:null;if(im)S['i'+i]=bakeImg(im,im===cut?30:24);});
  const gift=hdImg(iconUrl('regalo'));if(ready(gift))S.m=bakeImg(gift,24);
  const sl=hdImg(iconUrl('ciabatta'));if(ready(sl))S.slip=bakeImg(sl,21);
  S.remote=bake(9,22,paintRemote);
  S.sofa=bake(26,22,(g,W,H)=>g.drawImage(ENEMY.sofa,0,0,W,H),true);
  return S;}
/* ---- polaroids: real proportions (88x107 mm, square photo 79x79), ivory paper slightly curved at the edges, tape,
   a handwritten caption ---- */
const PW=58,PH=PW*107/88;
function bakePolaroid(p,i){const k=K,M=9,w=PW,h=PH,b=w*4.5/88,t=w*6/88,ph=w-2*b,bow=w*0.022,c=mk(Math.round((w+2*M)*k),Math.round((h+2*M)*k)),g=c.getContext('2d');
  g.setTransform(k,0,0,k,M*k,M*k);
  const paper=()=>{g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(w/2,bow*0.5,w,0);g.quadraticCurveTo(w-bow,h/2,w,h);g.quadraticCurveTo(w/2,h-bow*0.5,0,h);g.quadraticCurveTo(bow,h/2,0,0);g.closePath();};
  /* the corners lift a little: their shadow reaches further */
  g.save();g.filter='none';g.fillStyle='rgba(0,0,0,0.32)';g.shadowColor='rgba(0,0,0,0.45)';g.shadowBlur=4*k;
  [[w-2,h-1.5],[2,h-1.5],[w-2,1.5]].forEach(([x,y])=>{g.beginPath();g.ellipse(x,y+1.4,3,2.2,0,0,Math.PI*2);g.fill();});g.restore();
  g.save();g.shadowColor=SH.col;g.shadowBlur=SH.blur*k;g.shadowOffsetY=SH.dy*k;paper();g.fillStyle='#f5f1e8';g.fill();g.restore();
  g.save();paper();g.clip();
  let gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,'rgba(255,255,255,0.4)');gr.addColorStop(1,'rgba(170,150,120,0.16)');g.fillStyle=gr;g.fillRect(0,0,w,h);
  gr=g.createLinearGradient(0,0,w,0);gr.addColorStop(0,'rgba(110,90,60,0.24)');gr.addColorStop(0.08,'rgba(110,90,60,0)');gr.addColorStop(0.9,'rgba(110,90,60,0)');gr.addColorStop(1,'rgba(110,90,60,0.28)');g.fillStyle=gr;g.fillRect(0,0,w,h);
  gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgba(110,90,60,0.16)');gr.addColorStop(0.05,'rgba(110,90,60,0)');gr.addColorStop(0.88,'rgba(110,90,60,0)');gr.addColorStop(1,'rgba(100,80,50,0.32)');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.fillStyle='rgba(255,255,255,0.5)';g.fillRect(0,h*0.93,w,0.4);g.fillRect(w*0.94,0,0.35,h);
  /* the photo */
  g.save();g.beginPath();g.rect(b,t,ph,ph);g.clip();const im=p.img&&!p.song?hdImg(p.img):null;
  if(p.song)vinylHD(g,b,t,ph,i);
  else if(ready(im)){const s=Math.max(ph/im.naturalWidth,ph/im.naturalHeight),iw=im.naturalWidth*s,ih=im.naturalHeight*s;g.drawImage(im,b+ph/2-iw/2,t+ph/2-ih/2,iw,ih);
    g.globalCompositeOperation='soft-light';g.fillStyle='rgba(255,190,120,0.35)';g.fillRect(b,t,ph,ph);g.globalCompositeOperation='source-over';}
  else{g.fillStyle='#1a1214';g.fillRect(b,t,ph,ph);const ic=!p.q&&p.icon?hdImg(iconUrl(p.icon)):null;if(ready(ic)){g.save();g.translate(b+ph*0.18,t+ph*0.18);contain(g,ic,ph*0.64,ph*0.64);g.restore();}}
  if(p.q){g.fillStyle='rgba(10,7,22,0.5)';g.fillRect(b,t,ph,ph);g.font=HAND.replace('10px',Math.round(ph*0.8)+'px');g.textAlign='center';g.textBaseline='middle';
    g.shadowColor='rgba(0,0,0,0.6)';g.shadowBlur=2*k;g.fillStyle=PAL.gold;g.fillText('?',b+ph/2,t+ph*0.54);g.shadowBlur=0;}
  const v=g.createRadialGradient(b+ph/2,t+ph/2,ph*0.35,b+ph/2,t+ph/2,ph*0.78);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(30,12,0,0.3)');g.fillStyle=v;g.fillRect(b,t,ph,ph);
  const gl=g.createLinearGradient(b,t,b+ph,t+ph);gl.addColorStop(0,'rgba(255,255,255,0.2)');gl.addColorStop(0.42,'rgba(255,255,255,0)');g.fillStyle=gl;g.fillRect(b,t,ph,ph);g.restore();
  g.strokeStyle='rgba(60,40,20,0.22)';g.lineWidth=0.35;g.strokeRect(b,t,ph,ph);
  /* the caption, handwritten, as big as fits */
  const txt=p.hand||p.title||'';let fs=8.5;g.textAlign='center';g.textBaseline='middle';
  const setF=()=>{g.font=HAND.replace('10px',fs+'px');};setF();while(fs>5.2&&g.measureText(txt).width>ph)
  {fs-=0.3;setF();}
  const cap=g.measureText(txt).width<=ph?txt:(p.labelHand||'');g.save();g.translate(w/2,t+ph+(h-t-ph)*0.5);g.rotate(-0.02);g.fillStyle='#2a2340';g.fillText(cap,0,0);g.restore();
  g.restore();
  g.strokeStyle='rgba(255,255,255,0.55)';g.lineWidth=0.3;paper();g.stroke();
  /* tape */
  g.save();g.translate(w/2,0.5);g.rotate(-(p.rot||0)*1.6+0.05);const tw2=w*0.4,th=w*0.12;g.beginPath();g.moveTo(-tw2/2,-th/2);
  for(let s=0;s<=6;s++)g.lineTo(tw2/2+(s%2?-0.6:0),-th/2+th*s/6);for(let s=0;s<=6;s++)g.lineTo(-tw2/2+(s%2?0.6:0),th/2-th*s/6);g.closePath();
  g.shadowColor='rgba(0,0,0,0.18)';g.shadowBlur=1.5*k;g.fillStyle='rgba(236,226,190,0.74)';g.fill();g.restore();
  return{c,M};}
function vinylHD(g,x,y,s,i){const cx=x+s/2,cy=y+s/2,r=s/2-1.5;g.fillStyle='#2a1f3a';g.fillRect(x,y,s,s);
  const rg=g.createRadialGradient(cx-r*0.3,cy-r*0.3,r*0.1,cx,cy,r);rg.addColorStop(0,'#2a2630');rg.addColorStop(1,'#08070b');g.fillStyle=rg;g.beginPath();g.arc(cx,cy,r,0,Math.PI*2);g.fill();
  g.strokeStyle='rgba(255,255,255,0.07)';g.lineWidth=0.3;for(let q=r*0.42;q<r-1;q+=1.1){g.beginPath();g.arc(cx,cy,q,0,Math.PI*2);g.stroke();}
  g.strokeStyle='rgba(255,255,255,0.22)';g.lineWidth=1.2;g.beginPath();g.arc(cx,cy,r*0.72,-2.3,-1.4);g.stroke();
  g.fillStyle=['#ff7ad8','#86cfdc','#f2d27a','#f0646e'][i%4];g.beginPath();g.arc(cx,cy,r*0.34,0,Math.PI*2);g.fill();g.fillStyle='#08070b';g.beginPath();g.arc(cx,cy,0.9,0,Math.PI*2);g.fill();}
/* rebuild everything when the screen's resolution changes or an image or the font arrives */
function ensureHD(){if(HD.K===K&&!HD.dirty)return;HD.K=K;HD.dirty=false;HD.spr=buildSprites();HD.pol=POLA.map((p,i)=>bakePolaroid(p,i));}
/* which part of each polaroid is uncovered: the land cells under it */
function hdClip(){HD.clip=POLA.map(p=>{const P=new Path2D(),m=6,c0=Math.max(0,Math.floor((p.x-m)/CS)),c1=Math.min(COLS-1,Math.floor((p.x+PW+m)/CS)),r0=Math.max(0,Math.floor((p.y-m)/CS)),r1=Math.min(ROWS-1,Math.floor((p.y+PH+m)/CS));
  for(let r=r0;r<=r1;r++){let s=-1;for(let c=c0;c<=c1+1;c++){const on=c<=c1&&grid[r*COLS+c]===1;if(on&&s<0)s=c;if(!on&&s>=0){P.rect(FX+s*CS,FY+r*CS,(c-s)*CS,CS);s=-1;}}}return P;});}
function drawPolaroidsHD(full,alpha){ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.globalAlpha=alpha==null?1:alpha;
  POLA.forEach((p,i)=>{const s=HD.pol[i];if(!s)return;ctx.save();if(!full&&HD.clip[i])ctx.clip(HD.clip[i]);ctx.translate(FX+p.x+PW/2,FY+p.y+PH/2);ctx.rotate(p.rot||0);
    ctx.drawImage(s.c,-PW/2-s.M,-PH/2-s.M,PW+2*s.M,PH+2*s.M);
    const ft=G.found[p.k];if(ft!==undefined&&G.t-ft<2.5){ctx.strokeStyle=`rgba(255,224,58,${0.5+0.5*Math.sin((G.t-ft)*10)})`;ctx.lineWidth=1.6;ctx.strokeRect(-PW/2-1.5,-PH/2-1.5,PW+3,PH+3);}
    ctx.restore();});ctx.restore();}
/* an object with its halo; the same halo for everything, coloured by role (gold prizes, red enemies, yellow note) */
function drawObj(s,x,y,rot,flip,halo){if(!s)return false;ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  if(halo){const R=Math.max(s.w,s.h)*0.62+5,hg=ctx.createRadialGradient(x,y,1,x,y,R);hg.addColorStop(0,halo.replace('A',HALO));hg.addColorStop(1,halo.replace('A',0));ctx.fillStyle=hg;ctx.fillRect(x-R,y-R,2*R,2*R);}
  ctx.translate(x,y);if(rot)ctx.rotate(rot);if(flip)ctx.scale(-1,1);ctx.drawImage(s.c,-s.wU/2,-s.hU/2,s.wU,s.hU);ctx.restore();return true;}
const HALOS={prize:'rgba(255,224,58,A)',enemy:'rgba(255,60,80,A)',note:'rgba(255,236,150,A)'};
