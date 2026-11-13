/* ---------------- 2Deep · SABATO_SERA.EXE: 90s desktop promo for the Monkey's Bar night ---------------- */
/* Drawn on a logical canvas (216x384 portrait, 384x216 landscape) copied 5x onto the 1080x1920 / 1920x1080 output.
   Rules for this cut: one window on screen at a time, three or four words per window, every text up for 2 s or more. */
let FMT='portrait';const isL=()=>FMT==='landscape';
function setFormat(f){FMT=f==='landscape'?'landscape':'portrait';const l=isL();LG.width=NSC.width=l?384:216;LG.height=NSC.height=l?216:384;
  cv.width=l?1920:1080;cv.height=l?1080:1920;ctx=LG.getContext('2d');ctx.imageSmoothingEnabled=false;W=LG.width;H=LG.height;}

/* ---------------- the night ---------------- */
const SECRET='BANANA';
/* ---------------- timeline: 150 BPM, beat 0.4 s, bar 1.6 s, 18 bars = 28.8 s ----------------
   hook (modem) > question (assistant) > goal (download) > obstacle (sofa) > ally (Katia's nudge)
   > crash (hidden frame) > win (download complete, solitaire cards) > payoff (the band at the bar) > card > "find the word" */
const EV={dial:[0.15,0.95],hand:[1.0,1.85],conn:1.9,desk:2.4,
  asst:{in:2.6,cur:[4.0,4.6],click:4.8,out:5.2},
  dl:{open:5.6,freeze:8.8,resume:16.0,done:16.8},
  sofa:{rise:8.8,up:9.1,fall:16.2},
  pop1:[9.6,12.0],
  chat:12.0,trillo:13.6,shake:[13.6,15.2],
  bsod:[15.2,15.8],
  cards:{t0:16.8,n:8,gap:0.22},
  player:{open:19.2,max:19.5},
  card:22.4,cta:26.0,off:28.4};
const MUSIC_GAPS=[EV.bsod];

/* ---------------- layout ---------------- */
function LY(){
  if(isL())return{tb:200,dial:[96,54,192,92],ball:[70,40,184,84],monk:[262,100],dl:[16,70,186,96],sofa:[262,140],pop1:[204,8,176,82],chat:[204,8,176,90],trY:176};
  return{tb:368,dial:[14,132,188,92],ball:[16,128,184,84],monk:[112,226],dl:[8,140,200,96],sofa:[56,250],pop1:[18,46,180,82],chat:[18,46,180,90],trY:178};}
function NL(){return isL()?{F:196,barX:272,trioX:240,trioFrom:110,card:[6,16,232,174]}:{F:326,barX:40,trioX:8,trioFrom:-90,card:[4,46,208,200]};}

const ss=u=>{u=clamp(u);return u*u*(3-2*u);};
const slam=(t,t0)=>{const a=t-t0;return a<0.1?Math.round((1-a/0.1)*12):0;};
const mid=(s,cx,y,sc,col)=>dt(s,Math.round(cx-tw(s)*sc/2),y,sc,col);

/* ---------------- desktop ---------------- */
function taskbar(){const L=LY(),y=L.tb,h=H-y;face(0,y,W,h);rr(0,y,W,1,C95.light);rr(0,y+1,W,1,C95.hi);
  face(2,y+2,44,h-4);ctx.drawImage(NOTES[0],5,y+3);dt('AVVIO',16,y+Math.round((h-7)/2),1,C95.txt);dt('AVVIO',17,y+Math.round((h-7)/2),1,C95.txt);
  face(W-40,y+2,38,h-4,true);mid('18:00',W-21,y+Math.round((h-7)/2),1,C95.txt);}

/* 1. hook: dial-up to "SABATO SERA" (modem sound underneath) */
function dialWin(t){const L=LY(),r=L.dial,[x,y,w]=win(r,'CONNESSIONE');
  ctx.drawImage(PC,x+10,y+4);ctx.drawImage(GLOBE,x+w-28,y+5);const ok=t>=EV.conn;
  const n=8,ph=Math.floor(t*12);for(let k=0;k<n;k++){const px=x+34+k*Math.round((w-70)/n);rr(px,y+11,3,3,ok?C95.green:(k+ph)%n<3?C95.navy:C95.sh);}
  mid('SABATO SERA',x+w/2,y+30,2,C95.navy);
  if(ok)mid('CONNESSO!',x+w/2,y+52,2,C95.green);}

/* 2. the monkey as the office assistant: one question, two yes buttons */
function assistant(t){const A=EV.asst,L=LY(),[bx,by,bw,bh]=L.ball,[mx0,my0]=L.monk;
  const ain=t-A.in,pop=ain<0.15?Math.round((1-ain/0.15)*16):0,out=t>A.out?clamp((t-A.out)/0.25):0;
  const cheer=t>=A.click&&t<A.out+0.3,mf=cheer?3:0,bob=cheer?0:Math.round(Math.sin(t*5)),my=my0+pop+bob-Math.round(Math.sin(Math.PI*out)*18)+Math.round(out*out*90);
  const im=MONK_SPR[mf];if(out<1)ctx.drawImage(im,mx0,my,im.width*2,im.height*2);
  if(t>=A.click&&t<A.click+0.4)sparks(mx0+34,my+30,(t-A.click)/0.4,10,44);
  if(t>=A.out||ain<0.12)return;
  rr(bx,by,bw,bh,C95.dk);rr(bx+1,by+1,bw-2,bh-2,C95.tip);[[0,0],[bw-1,0],[0,bh-1],[bw-1,bh-1]].forEach(([dx,dy])=>rr(bx+dx,by+dy,1,1,C95.teal));
  if(my0+10>by+bh){const ta=Math.min(bx+bw-22,mx0+12);tail(ta,ta+12,by+bh-1,mx0+30,my0+8,C95.tip);rr(ta+1,by+bh-1,11,1,C95.tip);}
  else{const ty=Math.min(by+bh-22,my0+12);tailV(bx+bw-1,ty,ty+12,mx0+6,my0+24,C95.tip);rr(bx+bw-1,ty+1,1,11,C95.tip);}
  mid('VUOI USCIRE',bx+bw/2,by+9,2,C95.txt);mid('SABATO?',bx+bw/2,by+27,2,C95.txt);
  const pr=t>=A.click&&t<A.click+0.15;btn(bx+bw/2-64,by+bh-28,58,20,'SI',{sc:2,pressed:pr,def:true});btn(bx+bw/2+6,by+bh-28,58,20,'SI',{sc:2});}
const asstBtn=()=>{const[bx,by,bw,bh]=LY().ball;return[bx+bw/2-36,by+bh-18];};

/* 3. the download of Saturday night */
function progAt(t){const D=EV.dl;if(t<D.open+0.1)return 0;if(t<D.freeze)return Math.floor(70*ss((t-D.open-0.1)/(D.freeze-D.open-0.1)));
  if(t<D.resume)return 70;if(t<D.done)return Math.floor(70+30*(t-D.resume)/(D.done-D.resume));return 100;}
function dlWin(t){const D=EV.dl,L=LY(),r=L.dl,done=t>=D.done,[x,y,w]=win(r,'DOWNLOAD');
  const p=progAt(t),frozen=t>=D.freeze&&t<D.resume;
  dt('SABATO_SERA.EXE',x+8,y+4,2,C95.navy);
  const pw=w-62;field(x+8,y+26,pw,16);const nb=Math.floor((pw-6)/8),on=Math.round(nb*p/100);for(let k=0;k<on;k++)rr(x+11+k*8,y+29,6,10,frozen?C95.red:C95.navy);
  const ps=p+'%';dt(ps,x+w-6-tw(ps)*2,y+27,2,frozen?C95.red:C95.txt);
  if(done)dt('COMPLETATO!',x+8,y+52,2,C95.green);else dt('MANCA 1 GIORNO',x+8,y+52,2,frozen?C95.red:C95.txt);}

/* 4. the sofa breaks in and freezes the download; after the crash it spins and drops off the screen */
function drawSofa(t){const S=EV.sofa,L=LY(),[sx,sy]=L.sofa;if(t<S.rise)return;
  const u=clamp((t-S.rise)/(S.up-S.rise));let x=sx,y=Math.round(H+(sy-H)*easeOut(u))-(u>=1&&t<S.up+0.15?Math.round(Math.sin((t-S.up)/0.15*Math.PI)*4):0);
  if(t<EV.bsod[0]){x+=t>=EV.trillo?Math.round(Math.sin(t*70)*3):Math.round(Math.sin(t*20));}
  else{const a=t-S.fall;if(a>0)y+=Math.round(a*a*900);if(y>H)return;}
  ctx.drawImage(SOFA.angry,x,y);ctx.drawImage(CROWN,x+44,y-5);
  if(t>=EV.bsod[1])for(let k=0;k<3;k++){const an=t*8+k*2.09;ctx.drawImage(SPARK,Math.round(x+50+Math.cos(an)*22),Math.round(y-8+Math.sin(an)*6));}}
function popWin(t){const L=LY(),r=L.pop1,[x,y,w,h]=r,c=win(r,'DIVANO.EXE');ctx.drawImage(WARN,c[0]+8,c[1]+8);
  dt('RESTA SUL',c[0]+34,c[1]+4,2,C95.txt);dt('DIVANO!',c[0]+34,c[1]+22,2,C95.red);btn(x+w/2-26,y+h-22,52,16,'OK',{def:true});}

/* 5. Katia's chat: the nudge */
function chatWin(t){const L=LY(),a=t-EV.trillo,r=L.chat.slice();if(a>=0){r[0]+=Math.round(Math.sin(t*80)*Math.min(4,1+a*6));r[1]+=Math.round(Math.cos(t*67)*2);}
  const[x,y,w,h]=win(r,'CHAT CON KATIA');rr(x+4,y+4,24,22,'#ffd6ea');bevel(x+4,y+4,24,22,true);ctx.drawImage(KFACE,x+5,y+5);
  dt('SABATO',x+36,y+4,2,C95.txt);dt('CI SEI?',x+36,y+22,2,C95.txt);
  btn(x+w-62,y+h-20,60,18,'TRILLO',{pressed:a>=0&&a<0.12,def:true});}

/* 7. win: solitaire cards bounce down leaving a trail (sampled at 30 fps so every render shows the same trail) */
const CARDP={};
function cardPaths(){const k=W+'x'+H;if(CARDP[k])return CARDP[k];const L=LY(),floor=L.tb-24,top=isL()?6:46,out=[];
  for(let i=0;i<EV.cards.n;i++){const t0=EV.cards.t0+i*EV.cards.gap,dir=i%3===2?1:-1;let x=W-26-(i%4)*24,y=top,vx=dir*(70+R(i*7.3)*70),vy=-40-R(i*3.1)*90;const pts=[],bounces=[];
    for(let s=0;s<150;s++){const tt=t0+s/30;pts.push([tt,x,y]);vy+=700/30;x+=vx/30;y+=vy/30;if(y>floor){y=floor-(y-floor)*0.6;vy=-vy*0.78;bounces.push(tt);}if(x<-20||x>W+2)break;}
    out.push({pts,bounces,im:CARDS[i%4]});}
  return CARDP[k]=out;}
function cardsTrail(t){if(t<EV.cards.t0)return;cardPaths().forEach(c=>{for(const[tt,x,y]of c.pts){if(tt>t)break;ctx.drawImage(c.im,Math.round(x),Math.round(y));}});}

function drawCursor(t){const A=EV.asst;if(t<A.cur[0]||t>A.click+0.3)return;const st=[W-26,H-70],to=asstBtn(),u=ss((t-A.cur[0])/(A.cur[1]-A.cur[0])),pr=t>=A.click&&t<A.click+0.15;
  ctx.drawImage(CURSOR,Math.round(st[0]+(to[0]-st[0])*u)+(pr?1:0),Math.round(st[1]+(to[1]-st[1])*u)+(pr?1:0));}
function panelT(y,w){w=Math.min(W-4,w);rr(W/2-w/2+2,y-6,w,33,'#000000');rr(W/2-w/2,y-8,w,33,'#0c0a2a');}

function deskScene(t){
  const shake=t>=EV.shake[0]&&t<EV.shake[1]?Math.min(4,1+(t-EV.shake[0])*4):0,sx=shake?Math.round(Math.sin(t*90)*shake):0,sy=shake?Math.round(Math.cos(t*73)*shake*0.6):0;
  rr(0,0,W,H,C95.teal);ctx.save();ctx.translate(sx,sy);taskbar();
  if(t<EV.desk)dialWin(t);
  if(t>=EV.asst.in&&t<EV.asst.out+0.3)assistant(t);
  if(t>=EV.dl.open){if(t<EV.dl.open+0.12){const L=LY();zoomRect([40,L.tb,60,10],L.dl,(t-EV.dl.open)/0.12);}else if(t<EV.dl.done)dlWin(t);}
  drawSofa(t);
  if(t>=EV.pop1[0]&&t<EV.pop1[1])popWin(t);
  if(t>=EV.chat&&t<EV.bsod[0])chatWin(t);
  cardsTrail(t);
  if(t>=EV.dl.done)dlWin(t);
  ctx.restore();
  if(t>=EV.trillo&&t<EV.bsod[0]){const L=LY(),y=L.trY-slam(t,EV.trillo);panelT(y,140);ctext('TRILLO!',W/2,y,3,['#ffe03a','#ff7ad8','#5fe0ff'][Math.floor(t*8)%3],{shadow:'#ff4a5a',sd:2});}
  drawCursor(t);
}

/* ---------------- 6. blue screen: the hidden frame with the password ---------------- */
function bsodScene(t){rr(0,0,W,H,C95.bsod);const l=isL(),wht='#ffffff';
  const items=l?[['h',16,14],['HAI MESSO IN PAUSA?',2,10],["DI'",2,4],["'"+SECRET+"'",3,6],['AL BANCONE:',2,10],['TI DEDICHIAMO UN PEZZO.',2,0]]
    :[['h',16,14],['HAI MESSO',2,4],['IN PAUSA?',2,12],["DI'",2,4],["'"+SECRET+"'",3,6],['AL BANCONE:',2,12],['TI DEDICHIAMO',2,4],['UN PEZZO.',2,0]];
  const hgt=items.reduce((s,[,sc,g])=>s+(sc===16?16:7*sc)+g,0);let y=Math.round((H-hgt)/2);
  items.forEach(([s,sc,g])=>{if(s==='h'){const lab=' 2DEEP 95 ',w=tw(lab)*2+8;rr(W/2-w/2,y,w,16,'#aaaaaa');dt(lab,Math.round(W/2-tw(lab)),y+1,2,C95.bsod);y+=16+g;return;}
    mid(s,W/2,y,sc,s.includes(SECRET)?'#ffe03a':wht);y+=7*sc+g;});}

/* ---------------- 8. the night at the Monkey's ---------------- */
const NBG={};
function nightBG(){const k=W+'x'+H;if(NBG[k])return NBG[k];const N=NL(),F=N.F,c=mk(W,H),g=c.getContext('2d'),cs=['#05061a','#0b0e30','#151a4a','#2a2460','#46306e'].map(hx),D=g.createImageData(W,H),hz=F-50;
  for(let y=0;y<H;y++){const f=clamp(y/hz)*(cs.length-1),k2=Math.min(cs.length-2,Math.floor(f)),fr=f-k2;for(let x=0;x<W;x++){const v=fr>bay(x,y)?cs[k2+1]:cs[k2],i=(y*W+x)*4;D.data[i]=v[0];D.data[i+1]=v[1];D.data[i+2]=v[2];D.data[i+3]=255;}}
  g.putImageData(D,0,0);
  for(let i=0;i<Math.round(W*hz/600);i++){g.fillStyle=R(i*2.2)>0.85?'#ffffff':'#9aa0d8';g.fillRect(R(i*5.3)*W|0,R(i*9.7)*(hz-30)|0,1,1);}
  const mx=W-34,my=isL()?28:F-170;g.fillStyle='#f1e6b4';for(let y=-8;y<=8;y++)for(let x=-8;x<=8;x++)if(x*x+y*y<=64)g.fillRect(mx+x,my+y,1,1);
  for(let x=0;x<W;x++){const h=Math.round(46+Math.sin(x*0.031)*16+Math.sin(x*0.083+1)*7),top=F-26-h;for(let y=top;y<F-26;y++){g.fillStyle=y<top+6?'#8a94cc':'#1c2050';g.fillRect(x,y,1,1);}}
  const rect=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
  rect(0,F-26,W,10,'#4a4a62');rect(0,F-26,W,1,'#6a6a82');rect(0,F-16,W,2,'#2a2a3a');rect(0,F-14,W,H-F+14,'#26263a');
  for(let x=0;x<W;x+=40)rect(x,F+14,18,2,'#c8c8a0');rect(0,F+30,W,H,'#1c1c2c');
  return NBG[k]=c;}
function trio(t,x,F,o){const walk=o.walk,d=t*40,wf=walk?[1,0,2,0][Math.floor(d/8)%4]:0,bob=walk&&wf!==0?-1:0,bob2=walk&&wf===0?-1:0;
  const kx=x,ky=F-43+bob2,lx=x+23,ly=F-46+bob;ctx.drawImage(SPR.kat[wf],kx-1,ky-1);ctx.drawImage(SPR.lor[wf],lx-1,ly-1);
  const st=o.play?Math.floor(t/0.1)%2:0;rr(lx+9,ly+31-st,3,2,'#f2b48c');rr(kx+14,ky+28-st,3,2,'#f2b48c');
  const mf=walk?wf:(Math.floor(t/0.4)%2?3:0),mx=x+50,my=F-39+(walk&&mf!==0?-1:0);ctx.drawImage(MONK_SPR[mf],mx-1,my-1);}
function nightScene(t){const N=NL(),F=N.F,P=EV.player;ctx.drawImage(nightBG(),0,0);
  const bx=N.barX,byT=F-12-BARIMG.height;ctx.drawImage(BARIMG,bx,byT);
  const on=t>=P.open+0.6&&!(t<P.open+0.9&&Math.floor(t*25)%3===0);
  if(on)glow(bx+82,byT+14,44,'#ff5fd8',0.22);
  ctx.drawImage(on?NEON.mOn:NEON.mOff,bx+16,byT+5);ctx.drawImage(on?BAR_NEON.on:BAR_NEON.off,bx+44,byT+9);ctx.drawImage(on?NEON.bOn:NEON.bOff,bx+102,byT+9);
  for(let k=0,x=bx+6;x<bx+158;x+=8,k++)rr(x,byT+58,2,2,on?['#ff4a5a','#ffe03a','#5ae06a','#5fe0ff','#ff7ad8'][(k+Math.floor(t*5))%5]:'#3a3a4a');
  const a=clamp((t-P.open-0.1)/1.7),x=Math.round(N.trioFrom+(N.trioX-N.trioFrom)*a),walk=a<1;trio(t,x,F,{walk,play:!walk});
  if(!walk){const door=bx+82;for(let k=0;k<2;k++){const u=((t-P.open-1.8)*0.8+k*0.5)%1;sparks(door,F-36,u,6,16);}}}
function finaleScene(t){const P=EV.player,L=LY();
  if(t<P.max){/* the file opens: zoom rectangle from the download window to full screen, over the desktop */
    rr(0,0,W,H,C95.teal);taskbar();cardsTrail(t);zoomRect(L.dl,[0,0,W,H],(t-P.open)/(P.max-P.open));return;}
  nightScene(t);if(t>=EV.card)infoCard(t);}

/* ---------------- 9-10. the card with the date, then the call to find the secret word ---------------- */
function infoCard(t){const N=NL(),r=N.card,a=t-EV.card,l=isL();
  if(a<0.15){zoomRect([W/2,H/2,4,4],r,a/0.15);return;}
  const[x,y,w,h]=win(r,'SABATO_SERA.EXE');rr(x,y,w,h,'#0c0a2a');bevel(x,y,w,h,true);const cx=x+w/2,mw=w-2;
  if(t<EV.cta){let cy=y+(l?10:8);
    if(l){ftext('SABATO 14 NOVEMBRE',cx,cy,mw,2,'#ffe03a',{shadow:'#ff4a5a',sd:1});cy+=20;}
    else{ftext('SABATO 14',cx,cy,mw,3,'#ffe03a',{shadow:'#ff4a5a',sd:2});cy+=24;ftext('NOVEMBRE',cx,cy,mw,3,'#ffe03a');cy+=27;}
    ftext('DALLE 18:00',cx,cy,mw,3,'#ffffff');cy+=28;ftext("MONKEY'S BAR",cx,cy,mw,3,'#ff7ad8');cy+=26;
    ftext('CUGNAN',cx,cy,mw,2,'#5fe0ff');cy+=17;ftext('PONTE NELLE ALPI',cx,cy,mw,2,'#5fe0ff');cy+=23;
    ftext('2DEEP LIVE',cx,cy,mw,3,'#ffffff',{shadow:'#ff7ad8',sd:2});return;}
  /* last beat before the loop: send people back to look for the hidden frame */
  const b=t-EV.cta,lines=[['TROVA LA',3,'#ffffff'],['PAROLA',3,'#7dff8a'],['SEGRETA',3,'#7dff8a'],['NEL VIDEO',2,'#ffffff']],hh=lines.reduce((s,[,sc])=>s+7*sc+8,-8);
  let cy=Math.round(y+(h-hh)/2)-(b<0.1?Math.round((1-b/0.1)*8):0);lines.forEach(([s,sc,col])=>{ftext(s,cx,cy,mw,sc,col,sc===3?{shadow:'#2a7a3a',sd:2}:{});cy+=7*sc+8;});}

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
  if(t>=EV.bsod[0]&&t<EV.bsod[1])bsodScene(t);else if(t<EV.player.open)deskScene(t);else finaleScene(t);
  crt(t);
}
/* what the shared player/renderer needs to know about this scene */
const VIDEO_NAME='2Deep_SabatoSera_exe',COVER_T=24.5,AUDIO_KEY=()=>FMT;   /* card bounces differ a little between the two formats */
window.__render=render;window.__DUR=DUR;window.__setFormat=setFormat;
