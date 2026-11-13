/* ---------------- 2Deep · SABATO_SERA.EXE: 90s desktop promo for the Monkey's Bar night ---------------- */
/* Drawn on a logical canvas (216x384 portrait, 384x216 landscape) copied 5x onto the 1080x1920 / 1920x1080 output.
   Rules for this cut: one idea on screen at a time, three or four words per window, every text up for 2 s or more.
   The finale is the stage scene of the levels video (part_side.js), pulled in by build.py. */
let FMT='portrait';const isL=()=>FMT==='landscape';
function setFormat(f){FMT=f==='landscape'?'landscape':'portrait';const l=isL();LG.width=NSC.width=l?384:216;LG.height=NSC.height=l?216:384;
  cv.width=l?1920:1080;cv.height=l?1080:1920;ctx=LG.getContext('2d');ctx.imageSmoothingEnabled=false;W=LG.width;H=LG.height;}

/* ---------------- the night ---------------- */
const SECRET='BANANA',STL={venue:"MONKEY'S BAR",scene:'bar',date:'SAB 14 NOV'};
/* ---------------- timeline: 150 BPM, beat 0.4 s, bar 1.6 s, 17 bars = 27.2 s ----------------
   hook ("find the secret word") > question (the monkey assistant) > goal (download from the Monkey's) > obstacle (the sofa)
   > the monkey pushes the sofa into the recycle bin > crash (the hidden frame) > download complete
   > the app opens: the duo hops on stage, the crowd jumps > date and place */
const EV={tip:[0.3,2.4],
  asst:{in:2.6,cur:[4.0,4.6],click:4.8,out:5.2},
  dl:{open:5.6,freeze:8.8,resume:16.0,done:16.8},
  sofa:{rise:8.8,up:9.1},
  pop1:[9.6,12.0],
  push:{bin:12.0,walk:[12.0,12.5],push:[12.6,13.8],suck:[13.8,14.3],wob:[14.3,14.9]},
  bsod:[15.2,15.8],
  open:17.6,stage:17.9,info:20.0,off:26.8};
const MUSIC_GAPS=[EV.bsod];
const STAGE0=3.5;               /* stage-scene time when the app opens: the duo is a few steps from the stage */
const stT=t=>t-EV.stage+STAGE0; /* hop on stage at 4.4-4.8, party from 4.8 (= 19.2 s, on the downbeat) */

/* ---------------- layout ---------------- */
function LY(){
  if(isL())return{tb:200,tip:[96,46,192,104],ball:[70,40,184,84],monk:[262,100],dl:[16,16,200,108],pop1:[222,16,156,82],sofa:[200,140],bin:[130,148],pushTo:140};
  return{tb:368,tip:[18,124,180,104],ball:[16,128,184,84],monk:[112,226],dl:[4,128,208,108],pop1:[18,40,180,82],sofa:[64,250],bin:[8,260],pushTo:24};}

const ss=u=>{u=clamp(u);return u*u*(3-2*u);};
const mid=(s,cx,y,sc,col)=>dt(s,Math.round(cx-tw(s)*sc/2),y,sc,col);
const MONK_L=MONK_SPR.map(flipX);

/* ---------------- desktop ---------------- */
function taskbar(){const L=LY(),y=L.tb,h=H-y;face(0,y,W,h);rr(0,y,W,1,C95.light);rr(0,y+1,W,1,C95.hi);
  face(2,y+2,44,h-4);ctx.drawImage(NOTES[0],5,y+3);dt('AVVIO',16,y+Math.round((h-7)/2),1,C95.txt);dt('AVVIO',17,y+Math.round((h-7)/2),1,C95.txt);
  face(W-40,y+2,38,h-4,true);mid('18:00',W-21,y+Math.round((h-7)/2),1,C95.txt);}

/* 1. hook: tip of the day, the challenge (the modem screeches underneath) */
function tipWin(t){const L=LY(),[x,y,w]=win(L.tip,'SUGGERIMENTO');const pop=t-EV.tip[0]<0.08;
  ctx.drawImage(BULB,x+6,y+8,BULB.width*2,BULB.height*2);
  if(Math.floor(t*6)%2===0)for(let k=0;k<3;k++)rr(x+6+[2,12,22][k],y+3,1,3,'#ffe03a');
  const tx=x+36;dt('TROVA LA',tx,y+4,2,C95.txt);dt('PAROLA',tx,y+22-(pop?3:0),3,C95.navy);dt('SEGRETA!',tx,y+48-(pop?3:0),3,C95.red);}

/* 2. the monkey as the office assistant: one question, two yes buttons */
function assistant(t){const A=EV.asst,L=LY(),[bx,by,bw,bh]=L.ball,[mx0,my0]=L.monk;
  const ain=t-A.in,pop=ain<0.15?Math.round((1-ain/0.15)*16):0,out=t>A.out?clamp((t-A.out)/0.25):0;
  const cheer=t>=A.click&&t<A.out+0.3,mf=cheer?3:0,bob=cheer?0:Math.round(Math.sin(t*5)),my=my0+pop+bob-Math.round(Math.sin(Math.PI*out)*18)+Math.round(out*out*90);
  const im=MONK_SPR[mf];if(out<1)ctx.drawImage(im,mx0,my,im.width*2,im.height*2);
  if(t>=A.click&&t<A.click+0.4)sparks(mx0+34,my+30,(t-A.click)/0.4,10,44);
  if(t>=A.out||ain<0.12)return;
  rr(bx,by,bw,bh,C95.dk);rr(bx+1,by+1,bw-2,bh-2,C95.tip);[[0,0],[bw-1,0],[0,bh-1],[bw-1,bh-1]].forEach(([a,b])=>rr(bx+a,by+b,1,1,C95.teal));
  if(my0+10>by+bh){const ta=Math.min(bx+bw-22,mx0+12);tail(ta,ta+12,by+bh-1,mx0+30,my0+8,C95.tip);rr(ta+1,by+bh-1,11,1,C95.tip);}
  else{const ty=Math.min(by+bh-22,my0+12);tailV(bx+bw-1,ty,ty+12,mx0+6,my0+24,C95.tip);rr(bx+bw-1,ty+1,1,11,C95.tip);}
  mid('VUOI USCIRE',bx+bw/2,by+9,2,C95.txt);mid('SABATO?',bx+bw/2,by+27,2,C95.txt);
  const pr=t>=A.click&&t<A.click+0.15;btn(bx+bw/2-64,by+bh-28,58,20,'SI',{sc:2,pressed:pr,def:true});btn(bx+bw/2+6,by+bh-28,58,20,'SI',{sc:2});}
const asstBtn=()=>{const[bx,by,bw,bh]=LY().ball;return[bx+bw/2-36,by+bh-18];};

/* 3. the download: the duo, the bar, the date */
function progAt(t){const D=EV.dl;if(t<D.open+0.1)return 0;if(t<D.freeze)return Math.floor(70*ss((t-D.open-0.1)/(D.freeze-D.open-0.1)));
  if(t<D.resume)return 70;if(t<D.done)return Math.floor(70+30*(t-D.resume)/(D.done-D.resume));return 100;}
function dlWin(t){const D=EV.dl,L=LY(),done=t>=D.done,[x,y,w]=win(L.dl,done?'DOWNLOAD COMPLETATO':'DOWNLOAD');
  const p=progAt(t),frozen=t>=D.freeze&&t<D.resume,bar=frozen?C95.red:done?C95.green:C95.navy;
  dt('2DEEP_LIVE.EXE',x+8,y+4,2,C95.navy);dt("DA: MONKEY'S BAR",x+8,y+22,2,C95.txt);
  const pw=w-62;field(x+8,y+42,pw,16);const nb=Math.floor((pw-6)/8),on=Math.round(nb*p/100);for(let k=0;k<on;k++)rr(x+11+k*8,y+45,6,10,bar);
  const ps=p+'%';dt(ps,x+w-6-tw(ps)*2,y+43,2,frozen?C95.red:C95.txt);
  dt('SAB 14 NOV ORE 18',x+8,y+66,2,C95.red);}

/* 4. the sofa breaks in and freezes the download */
function popWin(t){const L=LY(),r=L.pop1,[x,y,w,h]=r,c=win(r,'DIVANO.EXE');ctx.drawImage(WARN,c[0]+6,c[1]+8);
  dt('RESTA SUL',c[0]+30,c[1]+4,2,C95.txt);dt('DIVANO!',c[0]+30,c[1]+22,2,C95.red);btn(x+w/2-26,y+h-22,52,16,'OK',{def:true});}
/* 5. the monkey pushes it into the recycle bin */
function sofaPos(t){const L=LY(),P=EV.push,[sx,sy]=L.sofa,u=clamp((t-EV.sofa.rise)/(EV.sofa.up-EV.sofa.rise));
  let y=Math.round(H+(sy-H)*easeOut(u))-(u>=1&&t<EV.sofa.up+0.15?Math.round(Math.sin((t-EV.sofa.up)/0.15*Math.PI)*4):0);
  const k=ss((t-P.push[0])/(P.push[1]-P.push[0])),x=Math.round(sx+(L.pushTo-sx)*k)+(t>=P.push[0]&&t<P.push[1]?Math.round(Math.sin(t*40)):0);return[x,y];}
const binC=()=>{const[bx,by]=LY().bin;return[bx+16,by+20];};
function drawSofa(t){const P=EV.push;if(t<EV.sofa.rise||t>=P.suck[1])return;let[x,y]=sofaPos(t);
  if(t<P.walk[0])x+=Math.round(Math.sin(t*20));
  if(t<P.suck[0]){ctx.drawImage(SOFA.angry,x,y);ctx.drawImage(CROWN,x+44,y-5);return;}
  const k=ss((t-P.suck[0])/(P.suck[1]-P.suck[0])),s=1-k,[cx,cy]=binC(),w=Math.max(1,Math.round(104*s)),h=Math.max(1,Math.round(58*s)),
    ox=Math.round(x+52+(cx-x-52)*k-w/2),oy=Math.round(y+29+(cy-y-29)*k-h/2);
  ctx.drawImage(SOFA.angry,ox,oy,w,h);}
function drawBin(t){const P=EV.push;if(t<P.bin)return;const[bx,by]=LY().bin,a=t-P.bin,pop=a<0.15?Math.round((1-a/0.15)*8):0,full=t>=P.suck[1];
  const wob=t>=P.wob[0]&&t<P.wob[1]?Math.round(Math.sin((t-P.wob[0])*40)*2):0,im=full?TRASHF:TRASH;
  ctx.drawImage(im,bx+wob+Math.round((32-im.width*2)/2),by+pop+(38-im.height*2),im.width*2,im.height*2);dt('CESTINO',bx+16-Math.round(tw('CESTINO')/2),by+42,1,'#ffffff');
  if(t>=P.wob[0]&&t<P.wob[0]+0.4)sparks(bx+16,by+10,(t-P.wob[0])/0.4,8,22);}
function pushMonkey(t){const P=EV.push,L=LY();if(t<P.walk[0])return;const s=MONK_L[0],w2=s.width*2,h2=s.height*2,feet=L.sofa[1]+58,y0=feet-h2;
  const[sx]=sofaPos(t),contact=sx+98;let x,f;
  if(t<P.walk[1]){const k=easeOut(clamp((t-P.walk[0])/(P.walk[1]-P.walk[0])));x=Math.round(W+(contact-W)*k);f=[1,2][Math.floor(t*10)%2];}
  else if(t<P.push[1]){x=contact;f=t>=P.push[0]?[1,2][Math.floor(t*8)%2]:0;}
  else{x=Math.round(L.pushTo+98);f=t>=P.wob[0]?(Math.floor(t/0.2)%2?3:0):0;}
  const hop=t>=P.wob[0]&&Math.floor(t/0.2)%2?4:0;ctx.drawImage(MONK_L[f],x,y0-hop,w2,h2);}

function drawCursor(t){const A=EV.asst;if(t<A.cur[0]||t>A.click+0.3)return;const st=[W-26,H-70],to=asstBtn(),u=ss((t-A.cur[0])/(A.cur[1]-A.cur[0])),pr=t>=A.click&&t<A.click+0.15;
  ctx.drawImage(CURSOR,Math.round(st[0]+(to[0]-st[0])*u)+(pr?1:0),Math.round(st[1]+(to[1]-st[1])*u)+(pr?1:0));}

function deskScene(t){
  rr(0,0,W,H,C95.teal);taskbar();
  if(t>=EV.tip[0]&&t<EV.tip[1])tipWin(t);
  if(t>=EV.asst.in&&t<EV.asst.out+0.3)assistant(t);
  if(t>=EV.dl.open){if(t<EV.dl.open+0.12){const L=LY();zoomRect([40,L.tb,60,10],L.dl,(t-EV.dl.open)/0.12);}else dlWin(t);}
  drawBin(t);drawSofa(t);pushMonkey(t);
  if(t>=EV.pop1[0]&&t<EV.pop1[1])popWin(t);
  drawCursor(t);
}

/* ---------------- 6. blue screen: the hidden frame with the password ---------------- */
function bsodScene(t){rr(0,0,W,H,C95.bsod);const l=isL(),wht='#ffffff';
  const items=l?[['h',16,14],['HAI MESSO IN PAUSA?',2,10],["DI'",2,4],["'"+SECRET+"'",3,6],['AL BANCONE:',2,10],['TI DEDICHIAMO UN PEZZO.',2,0]]
    :[['h',16,14],['HAI MESSO',2,4],['IN PAUSA?',2,12],["DI'",2,4],["'"+SECRET+"'",3,6],['AL BANCONE:',2,12],['TI DEDICHIAMO',2,4],['UN PEZZO.',2,0]];
  const hgt=items.reduce((s,[,sc,g])=>s+(sc===16?16:7*sc)+g,0);let y=Math.round((H-hgt)/2);
  items.forEach(([s,sc,g])=>{if(s==='h'){const lab=' 2DEEP 95 ',w=tw(lab)*2+8;rr(W/2-w/2,y,w,16,'#aaaaaa');dt(lab,Math.round(W/2-tw(lab)),y+1,2,C95.bsod);y+=16+g;return;}
    mid(s,W/2,y,sc,s.includes(SECRET)?'#ffe03a':wht);y+=7*sc+g;});}

/* ---------------- 8. the app opens: the stage at the Monkey's (scene from the levels video) ---------------- */
const INFO=[['2DEEP LIVE',3,'#ffffff',{shadow:'#ff7ad8',sd:2},25],['SABATO 14 NOVEMBRE',2,'#ffe03a',{},17],['DALLE 18:00',2,'#ffffff',{},22],
  ["MONKEY'S BAR",3,'#ff7ad8',{shadow:'#5a1450',sd:2},24],['CUGNAN',2,'#5fe0ff',{},16],['PONTE NELLE ALPI',2,'#5fe0ff',{},0]];
function infoLines(t,cx,y,mw){INFO.forEach(([s,sc,col,o,step],k)=>{const a=t-EV.info-k*0.2;if(a>=0)ftext(s,cx,y-(a<0.08?5:0),mw,sc,a<0.06?'#ffffff':col,o);y+=step;});}
function stageScene(t){const lt=stT(t),s=duoAt(lt),camX=camFor(lt,s.x);rr(0,0,W,H,'#05050e');
  if(isL()){drawInterior(lt,STL,camX,22);for(let y=198;y<H;y++)rr(0,y,W,1,bay(0,y)<0.5?'#1e1208':'#160d06');
    confetti(lt,24,190);heartsUp(lt,W-40,186,140);if(party(lt))fgCrowd(lt,camX,176,Math.round((1-clamp((lt-SIDE.play)/0.3))*40));sideFlashes(lt);
    rr(0,0,W,24,'#05050e');rr(0,23,W,1,'#ffe03a');sideHUD(lt,1);
    if(t>=EV.info){const k=clamp((t-EV.info)/0.15),pw=Math.round(222*k),px=6,py=30,ph=158;if(pw>6){rr(px,py,pw,ph,'#ffe03a');rr(px+1,py+1,pw-2,ph-2,'#7a4a12');rr(px+2,py+2,pw-4,ph-4,'#0a0b22');}
      if(k>=1)infoLines(t,px+111,py+20,214);}
  }else{const oy=170;drawInterior(lt,STL,camX,oy);for(let y=oy+IH;y<H;y++)rr(0,y,W,1,bay(0,y)<0.5?'#1e1208':'#160d06');
    confetti(lt,oy,oy+IH+40);heartsUp(lt,W-36,oy+IH-4,150);sideFlashes(lt);
    rr(0,0,W,oy,'#05050e');rr(0,oy-1,W,1,'#ffe03a');fgCrowd(lt,camX,oy+206,0);
    if(t<EV.info)sideHUD(lt,48);else infoLines(t,W/2,44,W-8);}}
function finaleScene(t){if(t<EV.stage){const L=LY();rr(0,0,W,H,C95.teal);taskbar();zoomRect(L.dl,[0,0,W,H],(t-EV.open)/(EV.stage-EV.open));return;}stageScene(t);}

/* ---------------- master render, with the CRT switching on and off ---------------- */
function crt(t){const on=clamp(t/0.3),off=clamp((t-EV.off)/(DUR-EV.off-0.04)),cw=cv.width,ch=cv.height;
  OUTX.imageSmoothingEnabled=false;
  if(on>=1&&off<=0){OUTX.drawImage(LG,0,0,W,H,0,0,cw,ch);return;}
  OUTX.fillStyle='#000000';OUTX.fillRect(0,0,cw,ch);OUTX.fillStyle='#ffffff';
  if(on<1){if(on<0.3){const w=Math.round(cw*on/0.3);OUTX.fillRect((cw-w)>>1,(ch>>1)-3,w,6);return;}
    const f=(on-0.3)/0.7,hh=Math.max(6,Math.round(ch*f*f));OUTX.drawImage(LG,0,0,W,H,0,(ch-hh)>>1,cw,hh);OUTX.globalAlpha=0.6*(1-f);OUTX.fillRect(0,(ch-hh)>>1,cw,hh);OUTX.globalAlpha=1;return;}
  if(off<0.5){const f=1-off/0.5,hh=Math.max(6,Math.round(ch*f*f));OUTX.drawImage(LG,0,0,W,H,0,(ch-hh)>>1,cw,hh);OUTX.globalAlpha=0.7*(1-f);OUTX.fillRect(0,(ch-hh)>>1,cw,hh);OUTX.globalAlpha=1;return;}
  if(off<0.8){const w=Math.max(10,Math.round(cw*(1-(off-0.5)/0.3)));OUTX.fillRect((cw-w)>>1,(ch>>1)-3,w,6);return;}
  OUTX.globalAlpha=1-(off-0.8)/0.2;OUTX.fillRect((cw>>1)-6,(ch>>1)-6,12,12);OUTX.globalAlpha=1;}
function render(t){
  t=clamp(t,0,DUR-1e-4);ctx=LG.getContext('2d');ctx.imageSmoothingEnabled=false;
  if(t>=EV.bsod[0]&&t<EV.bsod[1])bsodScene(t);else if(t<EV.open)deskScene(t);else finaleScene(t);
  crt(t);
}
/* what the shared player/renderer needs to know about this scene */
const VIDEO_NAME='2Deep_SabatoSera_exe',COVER_T=23.0,AUDIO_KEY=()=>'';
window.__render=render;window.__DUR=DUR;window.__setFormat=setFormat;
