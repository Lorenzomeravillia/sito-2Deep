/* ---------------- 2Deep · SABATO_SERA.EXE: 90s desktop promo for the Monkey's Bar night ---------------- */
/* Drawn on a logical canvas (216x384 portrait, 384x216 landscape) copied 5x onto the 1080x1920 / 1920x1080 output.
   Rules for this cut: one idea on screen at a time, three or four words per window, every text up for 2 s or more.
   The concert is the stage scene of the levels video (part_side.js, pulled in by build.py), shown inside an app window. */
let FMT='portrait';const isL=()=>FMT==='landscape';
function setFormat(f){FMT=f==='landscape'?'landscape':'portrait';const l=isL();LG.width=NSC.width=l?384:216;LG.height=NSC.height=l?216:384;
  cv.width=l?1920:1080;cv.height=l?1080:1920;ctx=LG.getContext('2d');ctx.imageSmoothingEnabled=false;W=LG.width;H=LG.height;}

/* ---------------- the night ---------------- */
const SECRET='BANANA',STL={venue:"MONKEY'S BAR",scene:'bar',date:'SAB 14 NOV'};
/* ---------------- timeline: 150 BPM, beat 0.4 s, bar 1.6 s, 15 bars = 24 s ----------------
   hook ("find the secret word", on screen from the first frame) > the monkey asks, clicks yes and the download starts
   > the sofa blocks it > the monkey pushes it into the recycle bin, which sucks it in > the bin spits out SEGRETO.TXT (hidden frame)
   > download complete > the app opens on the stage > date and place > "send it to whoever is on the sofa" */
const EV={tip:[0,2.4],
  asst:{in:2.4,cur:[3.2,3.8],click:4.0,out:4.2},
  dl:{open:4.3,freeze:6.4,resume:13.3,done:14.0},
  sofa:{rise:6.4,up:6.7},
  pop1:[6.8,8.8],
  push:{bin:8.8,walk:[8.8,9.2],push:[9.2,10.4],lid:10.0,suck:[10.4,11.2],crown:[11.2,11.6],slam:11.7,wob:[11.7,12.2]},
  secret:{pop:12.2,full:[12.4,13.2],back:13.3},
  open:14.4,stage:14.65,info:16.2,share:21.6,shareCur:[22.1,22.6],shareClick:22.8,off:23.6};
const MUSIC_GAPS=[];
const STAGE0=3.45;               /* stage-scene time when the app opens: the duo is a few steps from the stage */
const stT=t=>t-EV.stage+STAGE0;  /* hop on stage at 4.4-4.8, party from 4.8 (= 16.0 s, on the downbeat) */

/* ---------------- layout ---------------- */
function LY(){
  if(isL())return{tb:200,tip:[94,40,196,118],ball:[70,40,184,84],monk:[262,100],dl:[16,16,200,108],pop1:[222,16,156,82],sofa:[200,140],bin:[112,134],pushTo:158,
    app:[0,0,384,200],info:[8,22,220,170],share:[16,60,196,96]};
  return{tb:368,tip:[10,118,196,118],ball:[16,128,184,84],monk:[112,226],dl:[4,128,208,108],pop1:[18,40,180,82],sofa:[64,250],bin:[8,252],pushTo:54,
    app:[0,204,216,164],info:[0,48,216,154],share:[10,150,196,96]};}

const ss=u=>{u=clamp(u);return u*u*(3-2*u);};
const mid=(s,cx,y,sc,col)=>dt(s,Math.round(cx-tw(s)*sc/2),y,sc,col);
const MONK_L=MONK_SPR.map(flipX);

/* ---------------- desktop ---------------- */
function taskbar(){const L=LY(),y=L.tb,h=H-y;face(0,y,W,h);rr(0,y,W,1,C95.light);rr(0,y+1,W,1,C95.hi);
  face(2,y+2,44,h-4);ctx.drawImage(NOTES[0],5,y+3);dt('AVVIO',16,y+Math.round((h-7)/2),1,C95.txt);dt('AVVIO',17,y+Math.round((h-7)/2),1,C95.txt);
  face(W-40,y+2,38,h-4,true);mid('18:00',W-21,y+Math.round((h-7)/2),1,C95.txt);}

/* 1. hook: tip of the day with the challenge, readable from the very first frame (the modem screeches underneath) */
function tipWin(t){const L=LY(),[x,y,w]=win(L.tip,'SUGGERIMENTO');
  ctx.drawImage(BULB,x+6,y+10,BULB.width*2,BULB.height*2);
  if(Math.floor(t*6)%2===0)for(let k=0;k<3;k++)rr(x+6+[2,12,22][k],y+5,1,3,'#ffe03a');
  const tx=x+36;dt('TROVA LA',tx,y+6,3,C95.txt);dt('PAROLA',tx,y+34,3,C95.navy);dt('SEGRETA!',tx,y+62,3,C95.red);}

/* 2. the monkey as the office assistant: one question, two yes buttons; the click starts the download right away */
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

/* 5. the monkey pushes it to the recycle bin: the lid flips open, a vortex sucks the sofa in column by column, the crown goes last */
function sofaPos(t){const L=LY(),P=EV.push,[sx,sy]=L.sofa,u=clamp((t-EV.sofa.rise)/(EV.sofa.up-EV.sofa.rise));
  const y=Math.round(H+(sy-H)*easeOut(u))-(u>=1&&t<EV.sofa.up+0.15?Math.round(Math.sin((t-EV.sofa.up)/0.15*Math.PI)*4):0);
  const k=ss((t-P.push[0])/(P.push[1]-P.push[0])),x=Math.round(sx+(L.pushTo-sx)*k)+(t>=P.push[0]&&t<P.push[1]?Math.round(Math.sin(t*40)):0);return[x,y];}
const BS3=3,binMouth=()=>{const[bx,by]=LY().bin;return[bx+21,by+10];};
function drawSofa(t){const P=EV.push;if(t<EV.sofa.rise)return;const S=SOFA.angry,sw=S.width,sh=S.height;
  if(t<P.suck[0]){let[x,y]=sofaPos(t);if(t<P.walk[0])x+=Math.round(Math.sin(t*20));ctx.drawImage(S,x,y);ctx.drawImage(CROWN,x+44,y-5);return;}
  const[x0,y0]=sofaPos(P.suck[0]),[mx,my]=binMouth(),k=clamp((t-P.suck[0])/(P.suck[1]-P.suck[0]));
  /* funnel: the columns nearest the bin go first, each one stretched thin and pulled into the mouth */
  if(k<1)for(let c=0;c<sw;c++){const d=c/(sw-1),p=ss(clamp(k*1.8-d*0.8));if(p>=1)continue;
    const h=Math.max(1,Math.round(sh*(1-p))),cx=x0+c+(mx-(x0+c))*p,cy=y0+sh/2+(my-(y0+sh/2))*p-Math.sin(Math.PI*p)*10+Math.round(Math.sin(t*30+c*0.3)*p*3);
    ctx.drawImage(S,c,0,1,sh,Math.round(cx),Math.round(cy-h/2),1,h);}
  /* the crown hangs in the air, spins, then gets gulped */
  if(t<P.crown[1]){const hang=t<P.crown[0],a=hang?0:ss((t-P.crown[0])/(P.crown[1]-P.crown[0])),bx=x0+44,by=y0-5-Math.round(Math.min(1,k*2)*6),
    cx=Math.round(bx+(mx-6-bx)*a),cy=Math.round(by+(my-4-by)*a-Math.sin(Math.PI*a)*14),im=Math.floor(t*12)%2&&!hang?flipX(CROWN):CROWN,s=1-a*0.8;
    ctx.drawImage(im,cx,cy,Math.max(1,Math.round(CROWN.width*s)),Math.max(1,Math.round(CROWN.height*s)));}}
function vortex(t){const P=EV.push;if(t<P.suck[0]-0.15||t>=P.crown[1])return;const[mx,my]=binMouth(),a=clamp((t-P.suck[0]+0.15)/0.2);
  for(let k=0;k<40;k++){const an=t*14+k*0.55,r=(34-k*0.8)*a;rr(Math.round(mx+Math.cos(an)*r),Math.round(my-6+Math.sin(an)*r*0.4),k%3?2:3,k%3?1:2,['#ffffff','#5fe0ff','#b8f4ff'][k%3]);}}
function drawBin(t){const P=EV.push;if(t<P.bin)return;const[bx,by]=LY().bin,a=t-P.bin,pop=a<0.15?Math.round((1-a/0.15)*8):0,k=BS3;
  const ws=t>=P.wob[0]&&t<P.wob[1]?(t-P.wob[0]):-1,wob=ws>=0?Math.round(Math.sin(ws*40)*2):0,sq=ws>=0&&ws<0.12?6:0;
  const bw=BINBODY.width*k+sq,bh=BINBODY.height*k-sq;ctx.drawImage(BINBODY,bx+wob-sq/2,by+12+pop+sq,bw,bh);
  const open=t>=P.lid&&t<P.slam,lidUp=open&&t<P.lid+0.1?6:0;
  if(open){rr(bx+3,by+12+pop,BINBODY.width*k-6,4,'#1a1a1a');const hov=Math.round(Math.sin(t*36)*2);ctx.drawImage(BINLID,bx-3+hov,by-16+pop-lidUp+Math.abs(hov),BINLID.width*k,BINLID.height*k);}
  else ctx.drawImage(BINLID,bx-3+wob,by+pop+sq-(t>=P.slam&&t<P.slam+0.08?5:0),BINLID.width*k,BINLID.height*k);
  dt('CESTINO',bx+21-Math.round(tw('CESTINO')/2),by+12+BINBODY.height*k+3,1,'#ffffff');
  if(t>=P.slam&&t<P.slam+0.4){sparks(bx+21,by+6,(t-P.slam)/0.4,8,30);}}
function pushMonkey(t){const P=EV.push,L=LY();if(t<P.walk[0])return;const s=MONK_L[0],w2=s.width*2,h2=s.height*2,feet=L.sofa[1]+58,y0=feet-h2;
  const[sx]=sofaPos(Math.min(t,P.suck[0])),contact=sx+98;let x,f;
  if(t<P.walk[1]){const k=easeOut(clamp((t-P.walk[0])/(P.walk[1]-P.walk[0])));x=Math.round(W+(contact-W)*k);f=[1,2][Math.floor(t*10)%2];}
  else if(t<P.push[1]){x=contact;f=t>=P.push[0]?[1,2][Math.floor(t*8)%2]:0;}
  else{x=contact+Math.round(clamp((t-P.push[1])/0.3)*8);f=t>=P.slam?(Math.floor(t/0.2)%2?3:0):0;}
  const hop=t>=P.slam&&Math.floor(t/0.2)%2?4:0;ctx.drawImage(MONK_L[f],x,y0-hop,w2,h2);}

/* 6. hidden frame: the bin spits out SEGRETO.TXT, which opens full screen in the notepad for 0.8 s */
function secretPaper(t){const S=EV.secret;if(t<S.pop||t>=S.full[0])return;const[mx,my]=binMouth(),a=(t-S.pop)/(S.full[0]-S.pop),
  x=Math.round(mx+(W/2-mx)*a-PAPER.width),y=Math.round(my+(H/2-my)*a-Math.sin(Math.PI*a)*40-PAPER.height),s=2+a*2;
  ctx.drawImage(PAPER,x,y,Math.round(PAPER.width*s),Math.round(PAPER.height*s));}
function notepad(t){const l=isL(),c=win([0,0,W,H],'SEGRETO.TXT - BLOCCO NOTE');rr(c[0],c[1],c[2],10,C95.face);dt('FILE  MODIFICA  CERCA  ?',c[0]+4,c[1]+2,1,C95.txt);
  field(c[0],c[1]+11,c[2],c[3]-11);const x=c[0]+8;let y=c[1]+(l?20:46);
  const L=l?[['HAI MESSO IN PAUSA?',2,C95.txt,22],["DI'",2,C95.txt,18],["'"+SECRET+"'",3,C95.red,30],['AL BANCONE:',2,C95.txt,22],['TI DEDICHIAMO UN PEZZO.',2,C95.txt,0]]
    :[['HAI MESSO',2,C95.txt,18],['IN PAUSA?',2,C95.txt,30],["DI'",2,C95.txt,18],["'"+SECRET+"'",3,C95.red,32],['AL BANCONE:',2,C95.txt,30],['TI DEDICHIAMO',2,C95.txt,18],['UN PEZZO.',2,C95.txt,0]];
  L.forEach(([s,sc,col,step])=>{dt(s,x,y,sc,col);y+=step;});if(Math.floor(t*4)%2===0)rr(x+tw(L[L.length-1][0])*2+3,y,2,14,C95.txt);}

function drawCursor(t){const A=EV.asst;if(t<A.cur[0]||t>A.click+0.3)return;const st=[W-26,H-70],to=asstBtn(),u=ss((t-A.cur[0])/(A.cur[1]-A.cur[0])),pr=t>=A.click&&t<A.click+0.15;
  ctx.drawImage(CURSOR,Math.round(st[0]+(to[0]-st[0])*u)+(pr?1:0),Math.round(st[1]+(to[1]-st[1])*u)+(pr?1:0));}

function deskScene(t){const S=EV.secret,P=EV.push;
  if(t>=S.full[0]&&t<S.full[1]){notepad(t);return;}
  rr(0,0,W,H,C95.teal);taskbar();
  if(t<EV.tip[1])tipWin(t);
  if(t>=EV.asst.in&&t<EV.asst.out+0.3)assistant(t);
  if(t>=EV.dl.open){const L=LY();if(t<EV.dl.open+0.12)zoomRect([asstBtn()[0]-20,asstBtn()[1]-8,40,16],L.dl,(t-EV.dl.open)/0.12);else dlWin(t);}
  drawBin(t);drawSofa(t);vortex(t);pushMonkey(t);
  if(t>=EV.pop1[0]&&t<EV.pop1[1])popWin(t);
  secretPaper(t);
  if(t>=S.full[0]-0.05&&t<S.full[0])zoomRect([W/2-10,H/2-12,20,24],[0,0,W,H],(t-S.full[0]+0.05)/0.05);
  if(t>=S.full[1]&&t<S.back)zoomRect([0,0,W,H],[W/2-10,H/2-12,20,24],(t-S.full[1])/(S.back-S.full[1]));
  drawCursor(t);
}

/* ---------------- 7. the app opens: the stage at the Monkey's (scene from the levels video) in a window ---------------- */
const INFO=[['2DEEP LIVE',3,'#ffffff',{shadow:'#ff7ad8',sd:2},25],['SABATO 14 NOVEMBRE',2,'#ffe03a',{},17],['DALLE 18:00',2,'#ffffff',{},22],
  ["MONKEY'S BAR",3,'#ff7ad8',{shadow:'#5a1450',sd:2},24],['CUGNAN',2,'#5fe0ff',{},16],['PONTE NELLE ALPI',2,'#5fe0ff',{},0]];
/* draws the stage inside a client rectangle: W and H become the viewport so the camera and the crowd frame it as in the original */
function stageIn(c,t){const lt=stT(t),s=duoAt(lt),sw=W,sh=H;ctx.save();ctx.beginPath();ctx.rect(c[0],c[1],c[2],c[3]);ctx.clip();ctx.translate(c[0],c[1]);W=c[2];H=c[3];
  const camX=camFor(lt,s.x),oy=H-IH;rr(0,0,W,H,'#05050e');drawInterior(lt,STL,camX,oy);
  confetti(lt,oy,H);heartsUp(lt,W-34,oy+IH-4,130);fgCrowd(lt,camX,oy+IH+8,0);sideFlashes(lt);sideHUD(lt,2);
  W=sw;H=sh;ctx.restore();}
function appWin(t,r){const c=win(r,"2DEEP_LIVE.EXE - MONKEY'S BAR");stageIn(c,t);}
function infoWin(t){const L=LY(),a=t-EV.info;if(a<0.15){zoomRect([L.info[0]+L.info[2]/2,L.info[1]+L.info[3]/2,4,4],L.info,a/0.15);return;}
  const[x,y,w,h]=win(L.info,'INFO SERATA');rr(x,y,w,h,'#0c0a2a');bevel(x,y,w,h,true);const tot=INFO.reduce((s,r)=>s+r[4],0)+14;let cy=Math.round(y+(h-tot)/2);
  INFO.forEach(([s,sc,col,o,step],k)=>{const b=a-0.15-k*0.2;if(b>=0)ftext(s,x+w/2,cy-(b<0.08?4:0),w-4,sc,b<0.06?'#ffffff':col,o);cy+=step;});}
function shareWin(t){const L=LY(),[x,y,w,h]=L.share,a=t-EV.share;if(a<0.12){zoomRect([x+w/2,y+h/2,4,4],L.share,a/0.12);return;}
  const c=win(L.share,'INVIA A UN AMICO');ctx.drawImage(MAIL,c[0]+6,c[1]+8);dt('MANDALO A CHI',c[0]+32,c[1]+4,2,C95.txt);dt('STA SUL DIVANO',c[0]+32,c[1]+22,2,C95.red);
  const pr=t>=EV.shareClick&&t<EV.shareClick+0.15;btn(x+w/2-64,y+h-28,58,20,'SI',{sc:2,pressed:pr,def:true});btn(x+w/2+6,y+h-28,58,20,'SI',{sc:2});
  if(t>=EV.shareCur[0]){const st=[W-26,H-40],to=[x+w/2-36,y+h-18],u=ss((t-EV.shareCur[0])/(EV.shareCur[1]-EV.shareCur[0]));ctx.drawImage(CURSOR,Math.round(st[0]+(to[0]-st[0])*u)+(pr?1:0),Math.round(st[1]+(to[1]-st[1])*u)+(pr?1:0));}
  if(t>=EV.shareClick&&t<EV.shareClick+0.4)sparks(x+w/2-35,y+h-18,(t-EV.shareClick)/0.4,8,26);}
function finaleScene(t){const L=LY();rr(0,0,W,H,C95.teal);taskbar();
  if(t<EV.stage){zoomRect(L.dl,L.app,(t-EV.open)/(EV.stage-EV.open));return;}
  appWin(t,L.app);if(t>=EV.info)infoWin(t);if(t>=EV.share)shareWin(t);}

/* ---------------- master render: the CRT flickers on over the first frame (never black) and switches off at the end ---------------- */
function crt(t){const on=clamp(t/0.25),off=clamp((t-EV.off)/(DUR-EV.off-0.04)),cw=cv.width,ch=cv.height;
  OUTX.imageSmoothingEnabled=false;
  if(off<=0){OUTX.drawImage(LG,0,0,W,H,0,0,cw,ch);if(on<1){OUTX.globalAlpha=0.3*(1-on);OUTX.fillStyle='#ffffff';OUTX.fillRect(0,0,cw,ch);OUTX.globalAlpha=0.35*(1-on);OUTX.fillRect(0,Math.round(ch*on)-30,cw,60);OUTX.globalAlpha=1;}return;}
  OUTX.fillStyle='#000000';OUTX.fillRect(0,0,cw,ch);OUTX.fillStyle='#ffffff';
  if(off<0.5){const f=1-off/0.5,hh=Math.max(6,Math.round(ch*f*f));OUTX.drawImage(LG,0,0,W,H,0,(ch-hh)>>1,cw,hh);OUTX.globalAlpha=0.7*(1-f);OUTX.fillRect(0,(ch-hh)>>1,cw,hh);OUTX.globalAlpha=1;return;}
  if(off<0.8){const w=Math.max(10,Math.round(cw*(1-(off-0.5)/0.3)));OUTX.fillRect((cw-w)>>1,(ch>>1)-3,w,6);return;}
  OUTX.globalAlpha=1-(off-0.8)/0.2;OUTX.fillRect((cw>>1)-6,(ch>>1)-6,12,12);OUTX.globalAlpha=1;}
function render(t){
  t=clamp(t,0,DUR-1e-4);ctx=LG.getContext('2d');ctx.imageSmoothingEnabled=false;
  if(t<EV.open)deskScene(t);else finaleScene(t);
  crt(t);
}
/* what the shared player/renderer needs to know about this scene */
const VIDEO_NAME='2Deep_SabatoSera_exe',COVER_T=20.0,AUDIO_KEY=()=>'';
window.__render=render;window.__DUR=DUR;window.__setFormat=setFormat;
