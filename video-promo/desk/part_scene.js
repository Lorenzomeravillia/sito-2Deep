/* ---------------- 2Deep · SABATO_SERA.EXE: 90s desktop promo for the Monkey's Bar night ---------------- */
/* Drawn on a logical canvas (216x384 portrait, 384x216 landscape) copied 5x onto the 1080x1920 / 1920x1080 output.
   The closing night scene is drawn on a second canvas of the same size (NSC): the player window is a hole that shows it
   at 1:1, and maximising the window simply uncovers the rest, so nothing is ever rescaled. */
let FMT='portrait';const isL=()=>FMT==='landscape';
function setFormat(f){FMT=f==='landscape'?'landscape':'portrait';const l=isL();LG.width=NSC.width=l?384:216;LG.height=NSC.height=l?216:384;
  cv.width=l?1920:1080;cv.height=l?1080:1920;ctx=LG.getContext('2d');ctx.imageSmoothingEnabled=false;W=LG.width;H=LG.height;}

/* ---------------- the night ---------------- */
const SECRET='BANANA';
/* ---------------- timeline: 150 BPM, beat 0.4 s, bar 1.6 s, 18 bars = 28.8 s ----------------
   One idea per beat, every line on screen for 1.6 s or more:
   hook (modem) > joke (assistant) > goal (download) > obstacle (sofa) > ally (Katia's nudge) > crash (hidden frame)
   > K.O. > wow (solitaire cards) > payoff (the band at the bar) > card */
const EV={dial:[0.15,0.95],hand:[1.0,1.85],conn:1.9,desk:2.4,
  asst:{in:2.6,cur:[4.8,5.4],click:5.6,out:5.9},
  dl:{open:6.4,freeze:9.6,resume:17.6,done:19.2},
  sofa:{rise:9.6,up:9.9,happy:17.6},
  pop1:10.0,casc:{t0:12.0,n:12,gap:0.07},
  chat:12.8,trillo:14.4,shake:[14.4,16.0],fall:14.8,
  bsod:[16.0,16.6],ko:16.8,
  cards:{t0:19.2,n:8,gap:0.22},
  player:{open:21.6,max:[22.1,22.5]},
  card:24.4,off:28.4};
const MUSIC_GAPS=[EV.bsod];
const CASC_TXT=['RESTA QUI','FUORI FA FREDDO','ANCORA UN EPISODIO?','PANTOFOLE CALDE',"C'E' LA PARTITA",'SEI STANCO','COPERTINA?','DOMANI ESCI'];

/* ---------------- layout ---------------- */
function LY(){
  if(isL())return{tb:200,ic:{x:34,y:8,dy:47},dial:[96,44,192,112],ball:[60,8,236,144],monk:[304,116],dl:[92,24,200,150],sofa:[140,136],
    pop1:[102,50,180,96],casc:{x:56,y:6,dx:7,dy:6,w:124,h:42},chat:[94,16,196,116],trY:150,koY:176,err:[90,26,204,152],player:[198,22,180,178]};
  return{tb:368,ic:{x:34,y:50,dy:52},dial:[14,118,188,112],ball:[8,78,200,144],monk:[112,226],dl:[8,92,200,150],sofa:[56,246],
    pop1:[18,148,180,96],casc:{x:4,y:50,dx:5,dy:7,w:124,h:42},chat:[10,64,196,116],trY:204,koY:56,err:[6,100,204,152],player:[8,174,200,162]};}
function NL(){return isL()?{F:196,barX:272,trioX:240,trioFrom:110,card:[6,6,232,204]}:{F:326,barX:40,trioX:8,trioFrom:-90,card:[4,40,208,238]};}

const ss=u=>{u=clamp(u);return u*u*(3-2*u);};
const slam=(t,t0)=>{const a=t-t0;return a<0.1?Math.round((1-a/0.1)*12):0;};

/* ---------------- desktop ---------------- */
function icons(){const L=LY(),I=[[FOLDER,'SABATO SERA'],[SOFA_ICON,'DIVANO.EXE'],[BIGNOTE[1],'2DEEP LIVE'],[TRASH,'CESTINO']];
  I.forEach(([im,lab],k)=>{const cy=L.ic.y+k*L.ic.dy;ctx.drawImage(im,Math.round(L.ic.x-im.width/2),cy+Math.round((24-im.height)/2));
    dt(lab,Math.round(L.ic.x-tw(lab)/2),cy+27,1,'#ffffff');});}
function taskbar(t){const L=LY(),y=L.tb,h=H-y;face(0,y,W,h);rr(0,y,W,1,C95.light);rr(0,y+1,W,1,C95.hi);
  face(2,y+2,44,h-4);ctx.drawImage(NOTES[0],5,y+3);dt('AVVIO',16,y+Math.round((h-7)/2),1,C95.txt);dt('AVVIO',17,y+Math.round((h-7)/2),1,C95.txt);
  const ent=t<EV.desk?'CONNESSIONE':t<EV.dl.open?'':t<EV.player.open?(t<EV.dl.done?(isL()?'DOWNLOAD 1 GIORNO':'DOWNLOAD'):'DOWNLOAD OK'):'SABATO_SERA.EXE';
  const ew=isL()?120:76;if(ent){face(50,y+2,ew,h-4,true);dt(ent,54,y+Math.round((h-7)/2),1,C95.txt,{max:Math.floor((ew-8)/6)});}
  const done=t>=EV.dl.done,clk=done?'SAB 18:00':'VEN 18:00',cw=58,flash=done&&t<EV.dl.done+0.8&&Math.floor(t*6)%2===0;
  face(W-cw-2,y+2,cw,h-4,true);if(flash)rr(W-cw,y+4,cw-4,h-8,C95.navy);dt(clk,Math.round(W-2-cw/2-tw(clk)/2),y+Math.round((h-7)/2),1,flash?'#ffffff':C95.txt);}

/* dial-up dialog: the hook (modem sound underneath) */
function dialWin(t){const L=LY(),r=L.dial,[x,y,w]=win(r,'CONNESSIONE REMOTA');
  ctx.drawImage(PC,x+10,y+4);ctx.drawImage(GLOBE,x+w-28,y+5);
  const n=8,ph=Math.floor(t*12);for(let k=0;k<n;k++){const px=x+34+k*Math.round((w-70)/n);rr(px,y+11,3,3,(k+ph)%n<3&&t<EV.conn?C95.navy:t>=EV.conn?C95.green:C95.sh);}
  dt('CONNESSIONE A:',x+8,y+28,1,C95.txt);dt('SABATO SERA',x+8,y+38,2,C95.navy);
  if(t<EV.dial[1])dt('COMPOSIZIONE IN CORSO'+'...'.slice(0,1+Math.floor(t*6)%3),x+8,y+60,1,C95.txt);
  else if(t<EV.conn)dt('VERIFICA IN CORSO'+'...'.slice(0,1+Math.floor(t*6)%3),x+8,y+60,1,C95.txt);
  else dt('CONNESSO!',x+8,y+57,2,C95.green);
  btn(x+w-62,y+r[3]-42,58,16,'ANNULLA');}

/* the monkey as the office assistant with its balloon */
function assistant(t){const A=EV.asst,L=LY(),[bx,by,bw,bh]=L.ball,[mx0,my0]=L.monk;
  const ain=t-A.in,pop=ain<0.15?Math.round((1-ain/0.15)*16):0,out=t>A.out?clamp((t-A.out)/0.2):0;
  const cheer=t>=A.click&&t<A.out+0.3,mf=cheer?3:0,bob=cheer?0:Math.round(Math.sin(t*5)),my=my0+pop+bob-Math.round(Math.sin(Math.PI*out)*18)+Math.round(out*out*60);
  const im=MONK_SPR[mf];if(out<1)ctx.drawImage(im,mx0,my,im.width*2,im.height*2);
  if(t>=A.click&&t<A.click+0.4)sparks(mx0+34,my+30,(t-A.click)/0.4,10,44);
  if(t>=A.out||ain<0.12)return;
  /* balloon */
  rr(bx,by,bw,bh,C95.dk);rr(bx+1,by+1,bw-2,bh-2,C95.tip);rr(bx,by,1,1,C95.teal);rr(bx+bw-1,by,1,1,C95.teal);rr(bx,by+bh-1,1,1,C95.teal);rr(bx+bw-1,by+bh-1,1,1,C95.teal);
  if(my0+10>by+bh){const ta=Math.min(bx+bw-22,mx0+12);tail(ta,ta+12,by+bh-1,mx0+30,my0+8,C95.tip);rr(ta+1,by+bh-1,11,1,C95.tip);}
  else{const ty=Math.min(by+bh-22,my0+12);tailV(bx+bw-1,ty,ty+12,mx0+6,my0+24,C95.tip);rr(bx+bw-1,ty+1,1,11,C95.tip);}
  lines(['SEMBRA CHE','TU STIA PER','PASSARE IL','SABATO SUL'],bx+10,by+8,2,C95.txt,17);dt('DIVANO.',bx+10,by+8+68,2,C95.red);
  dt('VUOI AIUTO?',bx+10,by+8+91,2,C95.navy);
  const pr=t>=A.click&&t<A.click+0.15;btn(bx+12,by+bh-24,56,18,'SI',{sc:2,pressed:pr,def:true});btn(bx+78,by+bh-24,56,18,'SI',{sc:2});}
const asstBtn=()=>{const[bx,by,,bh]=LY().ball;return[bx+40,by+bh-17];};

/* download window */
function progAt(t){const D=EV.dl;if(t<D.open+0.1)return 0;if(t<D.freeze)return Math.floor(62*ss((t-D.open-0.1)/(D.freeze-D.open-0.1)));
  if(t<D.resume)return 62;if(t<D.done)return Math.floor(62+38*(t-D.resume)/(D.done-D.resume));return 100;}
function dlWin(t){const D=EV.dl,L=LY(),r=L.dl,done=t>=D.done,[x,y,w]=win(r,done?'DOWNLOAD COMPLETATO':'DOWNLOAD IN CORSO');
  const p=progAt(t),frozen=t>=D.freeze&&t<D.resume;
  /* file-copy animation: notes fly from the bar to Saturday */
  ctx.drawImage(FOLDER,x+10,y+4);ctx.drawImage(FOLDER,x+w-30,y+4);dt("MONKEY'S",x+4,y+21,1,C95.txt);dt('SABATO',x+w-38,y+21,1,C95.txt);
  if(!frozen&&!done)for(let k=0;k<3;k++){const u=(t*0.9+k/3)%1,nx=x+28+(w-62)*u,ny=y+10-Math.sin(Math.PI*u)*8;ctx.drawImage(NOTES[k],Math.round(nx),Math.round(ny));}
  if(frozen){ctx.drawImage(SOFA_ICON,Math.round(x+w/2-20),y+2);}
  dt('SABATO_SERA.EXE',x+8,y+33,2,C95.navy);
  dt("DA: MONKEY'S BAR, CUGNAN",x+8,y+53,1,C95.txt);dt('SAB 14 NOV, ORE 18:00',x+8,y+63,1,C95.txt);
  const pw=w-56;field(x+8,y+76,pw,14);const nb=Math.floor((pw-6)/8),on=Math.round(nb*p/100);for(let k=0;k<on;k++)rr(x+11+k*8,y+79,6,8,frozen?C95.red:C95.navy);
  const ps=p+'%';dt(ps,x+w-4-tw(ps)*2,y+76,2,frozen?C95.red:C95.txt);
  dt('TEMPO RESIDUO:',x+8,y+101,1,C95.txt);const vx=x+8+tw('TEMPO RESIDUO:')+6;
  if(done)dt('FATTO!',vx,y+97,2,C95.green);else if(frozen){if(Math.floor(t*2.5)%2===0)dt('IN PAUSA',vx,y+97,2,C95.red);}else dt('1 GIORNO',vx,y+97,2,C95.navy);}

/* the sofa breaks into the screen */
function sofaAt(t){const S=EV.sofa,L=LY(),[sx,sy]=L.sofa;if(t<S.rise)return null;const u=clamp((t-S.rise)/(S.up-S.rise)),y=Math.round(H+(sy-H)*easeOut(u))-(u>=1&&t<S.up+0.15?Math.round(Math.sin((t-S.up)/0.15*Math.PI)*4):0);return[sx,y];}
function drawSofa(t){const p=sofaAt(t);if(!p)return;let[x,y]=p;const S=EV.sofa;
  if(t<S.happy){if(t>=EV.trillo&&t<EV.bsod[0])x+=Math.round(Math.sin(t*70)*3);else if(t<EV.bsod[0])x+=Math.round(Math.sin(t*20));
    const crash=t>=EV.bsod[1];ctx.drawImage(SOFA.angry,x,y);ctx.drawImage(CROWN,x+44,y-5);
    if(crash){for(let k=0;k<3;k++){const an=t*7+k*2.09;ctx.drawImage(SPARK,Math.round(x+50+Math.cos(an)*20),Math.round(y-6+Math.sin(an)*5));}}}
  else{const a=t-S.happy,legs=Math.min(14,Math.round(a*70)),dn=a>0.25?Math.round(Math.sin(a*Math.PI/0.4*2)*3):0,yy=y-legs-Math.abs(dn),F=y+58;
    [[14,1],[84,-1]].forEach(([ox,dir],k)=>{const sw=Math.round(Math.sin(a*Math.PI/0.4*2+k*Math.PI)*3);rr(x+ox,yy+52,4,F-(yy+52),'#f2b48c');rr(x+ox-3+sw*dir,F-4,12,4,'#e8384a');rr(x+ox-3+sw*dir,F-1,12,1,'#ffffff');});
    ctx.drawImage(SOFA.happy,x+dn,yy);ctx.drawImage(CROWN,x+44+dn,yy-5);}}

/* the sofa's popups: one to read, then a cascade */
function popWin(r,title,txt,big,t){const[x,y,w,h]=r;const c=win(r,title);ctx.drawImage(WARN,c[0]+6,c[1]+(big?6:4));
  if(big){lines(txt,c[0]+30,c[1]+6,2,C95.txt,17);btn(x+w/2-62,y+h-24,50,16,'OK',{def:true});btn(x+w/2-6,y+h-24,64,16,'VA BENE');}
  else dt(txt,c[0]+26,c[1]+8,1,C95.txt,{max:Math.floor((w-36)/6)});}
function fallY(i,t){const a=t-(EV.fall+(i%7)*0.08);return a>0?Math.round(450*a*a+a*20):0;}
function popups(t){const L=LY();
  if(t>=EV.pop1){const fy=fallY(0,t);if(fy<H)popWin([L.pop1[0],L.pop1[1]+fy,L.pop1[2],L.pop1[3]],'DIVANO.EXE',['RESTA QUI!','FUORI FA','FREDDO.'],true,t);}
  const C=EV.casc,K=L.casc;for(let k=0;k<C.n;k++){if(t<C.t0+k*C.gap)break;const fy=fallY(k+1,t);if(fy>=H)continue;
    popWin([K.x+k*K.dx,K.y+k*K.dy+fy,K.w,K.h],'DIVANO.EXE',CASC_TXT[k%CASC_TXT.length],false,t);}}

/* chat with Katia: the nudge */
function chatWin(t){const L=LY(),a=t-EV.trillo,sh=a>=0?Math.round(Math.sin(t*80)*Math.min(4,1+a*6)):0,r=L.chat.slice();r[0]+=sh;r[1]+=a>=0?Math.round(Math.cos(t*67)*2):0;
  const[x,y,w]=win(r,'CHAT CON KATIA');field(x,y,w,64);rr(x+4,y+4,24,22,'#ffd6ea');bevel(x+4,y+4,24,22,true);ctx.drawImage(KFACE,x+5,y+5);
  dt('KATIA:',x+32,y+4,1,C95.navy);dt('SABATO',x+32,y+14,2,C95.txt);dt('CI SEI?',x+32,y+32,2,C95.txt);
  field(x,y+80,w-58,14);btn(x+w-54,y+80,54,14,'TRILLO',{pressed:a>=0&&a<0.12});}

/* solitaire win: cards bounce down leaving a trail (sampled at 30 fps so every render shows the same trail) */
const CARDP={};
function cardPaths(){const k=W+'x'+H;if(CARDP[k])return CARDP[k];const L=LY(),floor=L.tb-24,top=isL()?6:46,out=[];
  for(let i=0;i<EV.cards.n;i++){const t0=EV.cards.t0+i*EV.cards.gap,dir=i%3===2?1:-1;let x=W-26-(i%4)*24,y=top,vx=dir*(70+R(i*7.3)*70),vy=-40-R(i*3.1)*90;const pts=[],bounces=[];
    for(let s=0;s<150;s++){const tt=t0+s/30;pts.push([tt,x,y]);vy+=700/30;x+=vx/30;y+=vy/30;if(y>floor){y=floor-(y-floor)*0.6;vy=-vy*0.78;bounces.push(tt);}if(x<-20||x>W+2)break;}
    out.push({pts,bounces,im:CARDS[i%4]});}
  return CARDP[k]=out;}
function cardsTrail(t){if(t<EV.cards.t0)return;cardPaths().forEach(c=>{for(const[tt,x,y]of c.pts){if(tt>t)break;ctx.drawImage(c.im,Math.round(x),Math.round(y));}});}

/* the cursor */
function cursorAt(t){const st=[W-26,H-70];
  const go=(a,b,to,clk)=>{if(t<a[0]||t>clk+0.35)return null;const u=ss((t-a[0])/(a[1]-a[0])),p=st.map((s,i)=>s+(to[i]-s)*u);return[p[0],p[1],t>=clk&&t<clk+0.15];};
  return go(EV.asst.cur,0,asstBtn(),EV.asst.click);}
function drawCursor(t){const c=cursorAt(t);if(c)ctx.drawImage(CURSOR,Math.round(c[0])+(c[2]?1:0),Math.round(c[1])+(c[2]?1:0));}

function deskScene(t){
  const shake=t>=EV.shake[0]&&t<EV.shake[1]?Math.min(4,1+(t-EV.shake[0])*4):0,sx=shake?Math.round(Math.sin(t*90)*shake):0,sy=shake?Math.round(Math.cos(t*73)*shake*0.6):0;
  rr(0,0,W,H,C95.teal);ctx.save();ctx.translate(sx,sy);
  icons();taskbar(t);
  if(t<EV.desk)dialWin(t);
  if(t>=EV.dl.open&&t<EV.dl.done){if(t<EV.dl.open+0.12){const L=LY();zoomRect([60,L.tb,60,10],L.dl,(t-EV.dl.open)/0.12);}else dlWin(t);}
  drawSofa(t);
  if(t<EV.bsod[0])popups(t);
  if(t>=EV.chat&&t<EV.bsod[0])chatWin(t);
  cardsTrail(t);
  if(t>=EV.dl.done)dlWin(t);
  if(t>=EV.asst.in&&t<EV.asst.out+0.3)assistant(t);
  ctx.restore();
  if(t>=EV.ko&&t<EV.ko+1.6){const L=LY(),y=L.koY-slam(t,EV.ko),s='DIVANO K.O.!';panelT(y,tw(s)*3+20);ctext(s,W/2,y,3,'#ffe03a',{shadow:'#ff4a5a',sd:2});}
  if(t>=EV.trillo&&t<EV.bsod[0]){const L=LY(),a=t-EV.trillo,y=L.trY-slam(t,EV.trillo);panelT(y,140);ctext('TRILLO!',W/2,y,3,['#ffe03a','#ff7ad8','#5fe0ff'][Math.floor(t*8)%3],{shadow:'#ff4a5a',sd:2});}
  drawCursor(t);
}
function panelT(y,w){w=Math.min(W-4,w);rr(W/2-w/2+2,y-6,w,33,'#000000');rr(W/2-w/2,y-8,w,33,'#0c0a2a');}

/* ---------------- blue screen: the hidden frame with the password ---------------- */
function bsodScene(t){rr(0,0,W,H,C95.bsod);const l=isL(),wht='#ffffff';
  const items=l?[['h',16,14],['HAI MESSO IN PAUSA?',2,10],["DI'",2,4],["'"+SECRET+"'",3,6],['AL BANCONE:',2,10],['TI DEDICHIAMO UN PEZZO.',2,14],['PREMI UN TASTO PER CONTINUARE',1,0]]
    :[['h',16,14],['HAI MESSO',2,4],['IN PAUSA?',2,12],["DI'",2,4],["'"+SECRET+"'",3,6],['AL BANCONE:',2,12],['TI DEDICHIAMO',2,4],['UN PEZZO.',2,16],['PREMI UN TASTO',1,3],['PER CONTINUARE',1,0]];
  const hgt=items.reduce((s,[,sc,g])=>s+(sc===16?16:7*sc)+g,0);let y=Math.round((H-hgt)/2);
  items.forEach(([s,sc,g])=>{if(s==='h'){const lab=' 2DEEP 95 ',w=tw(lab)*2+8;rr(W/2-w/2,y,w,16,'#aaaaaa');dt(lab,Math.round(W/2-tw(lab)),y+1,2,C95.bsod);y+=16+g;return;}
    const col=s.includes(SECRET)?'#ffe03a':wht;dt(s,Math.round(W/2-tw(s)*sc/2),y,sc,col);y+=7*sc+g;});
  if(Math.floor(t*4)%2===0)rr(W/2+tw(l?'PREMI UN TASTO PER CONTINUARE':'PER CONTINUARE')/2+3,y-2,5,1,wht);}

/* ---------------- closing: the night at the Monkey's ---------------- */
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
  const on=t>=P.open+0.5&&!(t<P.open+0.8&&Math.floor(t*25)%3===0);
  if(on)glow(bx+82,byT+14,44,'#ff5fd8',0.22);
  ctx.drawImage(on?NEON.mOn:NEON.mOff,bx+16,byT+5);ctx.drawImage(on?BAR_NEON.on:BAR_NEON.off,bx+44,byT+9);ctx.drawImage(on?NEON.bOn:NEON.bOff,bx+102,byT+9);
  for(let k=0,x=bx+6;x<bx+158;x+=8,k++)rr(x,byT+58,2,2,on?['#ff4a5a','#ffe03a','#5ae06a','#5fe0ff','#ff7ad8'][(k+Math.floor(t*5))%5]:'#3a3a4a');
  const a=clamp((t-P.open-0.1)/1.7),x=Math.round(N.trioFrom+(N.trioX-N.trioFrom)*a),walk=a<1;trio(t,x,F,{walk,play:!walk});
  if(!walk){const door=bx+82;for(let k=0;k<2;k++){const u=((t-P.max[1])*0.8+k*0.5)%1;sparks(door,F-36,u,6,16);}}}

function finaleScene(t){const P=EV.player,L=LY();
  const sv=ctx;ctx=NSC.getContext('2d');ctx.imageSmoothingEnabled=false;nightScene(t);ctx=sv;
  if(t<P.max[1]){
    /* desktop stays behind the player window */
    rr(0,0,W,H,C95.teal);icons();taskbar(t);cardsTrail(t);
    const u=ss((t-P.max[0])/(P.max[1]-P.max[0])),full=[-4,-16,W+8,H+20],r=L.player.map((v,i)=>Math.round(v+(full[i]-v)*u));
    if(t<P.open+0.15){zoomRect(L.dl,L.player,(t-P.open)/0.15);return;}
    const[cx,cy,cw,ch]=win(r,'SABATO_SERA.EXE');ctx.drawImage(NSC,cx,cy,cw,ch,cx,cy,cw,ch);
  }else ctx.drawImage(NSC,0,0);
  if(t>=EV.card)infoCard(t);}

/* ---------------- the card with the date ---------------- */
function infoCard(t){const N=NL(),r=N.card,a=t-EV.card;
  if(a<0.15){zoomRect([W/2,H/2,4,4],r,a/0.15);return;}
  const[x,y,w,h]=win(r,'SABATO_SERA.EXE');rr(x,y,w,h,'#0c0a2a');bevel(x,y,w,h,true);
  const cx=x+w/2,mw=w-2;let cy=y+6;const bl=Math.floor(t*2)%2===0;
  if(isL()){ftext('SABATO 14 NOVEMBRE',cx,cy,mw,2,'#ffe03a',{shadow:'#ff4a5a',sd:1});cy+=18;}
  else{ftext('SABATO 14',cx,cy,mw,3,'#ffe03a',{shadow:'#ff4a5a',sd:2});cy+=24;ftext('NOVEMBRE',cx,cy,mw,3,'#ffe03a');cy+=25;}
  ftext('DALLE 18:00',cx,cy,mw,3,'#ffffff');cy+=27;
  ftext("MONKEY'S BAR",cx,cy,mw,3,'#ff7ad8');cy+=isL()?24:25;
  const l=isL();ftext('CUGNAN',cx,cy,mw,2,'#5fe0ff');cy+=l?16:17;ftext('PONTE NELLE ALPI',cx,cy,mw,2,'#5fe0ff');cy+=l?19:21;
  ftext('2DEEP LIVE',cx,cy,mw,3,'#ffffff',{shadow:'#ff7ad8',sd:2});cy+=l?25:27;
  ftext('TROVA LA PAROLA',cx,cy,mw,2,bl?'#7dff8a':'#ffffff');cy+=l?16:17;ftext('SEGRETA NEL VIDEO',cx,cy,mw,2,bl?'#7dff8a':'#ffffff');cy+=l?17:19;
  ftext('@2DEEPLIVEMUSIC',cx,cy,mw,1,'#5fe0ff');}

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
const VIDEO_NAME='2Deep_SabatoSera_exe',COVER_T=26.5,AUDIO_KEY=()=>FMT;   /* card bounces differ a little between the two formats */
window.__render=render;window.__DUR=DUR;window.__setFormat=setFormat;
