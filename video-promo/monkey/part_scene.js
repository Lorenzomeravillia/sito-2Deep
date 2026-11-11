/* ---------------- 2Deep · Monkey's Bar: beat'em-up promo for one night ---------------- */
/* The scene is drawn on a small logical canvas (216x384 portrait, 384x216 landscape) and copied 5x onto the
   1080x1920 / 1920x1080 output. For the final zoom-out the scene switches to a wider canvas (270x480 / 480x270)
   that lands on the output at exactly 4x, so the wide shot stays pixel-sharp. */
let FMT='portrait';const isL=()=>FMT==='landscape';
const BGS={};
function useView(wide){const c=wide?LGW:LG;ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;W=c.width;H=c.height;}
function setFormat(f){FMT=f==='landscape'?'landscape':'portrait';const l=isL();LG.width=l?384:216;LG.height=l?216:384;LGW.width=l?480:270;LGW.height=l?270:480;
  cv.width=l?1920:1080;cv.height=l?1080:1920;useView(false);}
const wideView=()=>W===270||W===480;
/* layout. Reel safe zone (portrait): text between y 42 and ~250 (wide: 53-312), clear of the right-hand buttons */
function LAY(wide=wideView()){
  if(isL())return wide?{feet:227,lane:211,vx0:48,vy0:45,barX:206,card:[90,12,272,248],clearY:16,trioEnd:386}
    :{feet:182,lane:166,hud:6,cap:38,mid:98,heroX:96,hitX:292,bossX:250};
  return wide?{feet:352,lane:336,vx0:27,vy0:90,barX:62,card:[14,50,242,246],clearY:64,trioEnd:178}
    :{feet:262,lane:246,hud:42,cap:82,mid:154,heroX:40,hitX:172,bossX:118};}

/* ---------------- the night ---------------- */
const NIGHT={date:'SAB 14 NOV',place:'CUGNAN'};

/* ---------------- timeline: 150 BPM, beat 0.4 s, bar 1.6 s, 20 bars = 32 s ---------------- */
const BEAT=0.4;
const EV={
  menu:{move:0.8,press:1.6,angry:2.0,out:3.0},
  sel:{t0:3.2,cards:[3.2,3.6,4.0],ready:4.8,out:6.2},
  stage:{t0:6.4,title:[6.4,7.6],stop:[16.4,17.4]},
  alarm:[16.4,17.6],
  boss:{t0:17.6,land:18.0,pillows:[18.8,19.2],hops:[19.0,19.4],special:20.0,launch:21.6,impact:21.9,ko:22.6,legs:22.75,crownLand:23.2},
  end:{t0:24.0,zoom:[24.0,24.8],neon:24.9,clear:[25.0,27.7],line:24.9,card:28.0,fade:31.8}
};
const FOES=[
  {k:'cloud',ts:7.6,th:8.8,y:40},{k:'cloud',ts:8.0,th:9.6,y:58},
  {k:'slip',ts:10.0,th:11.2},{k:'slip',ts:10.4,th:12.0},
  {k:'remote',ts:12.4,th:14.4,zap:13.6,spin:13.9},
  {k:'cloud',ts:14.5,th:15.2,y:48},{k:'slip',ts:14.8,th:15.6},{k:'remote',ts:15.1,th:16.0}
];
const COMBO=FOES.slice(5).map(f=>f.th);
const CAPS=[
  {t:7.6,d:2.4,name:'NOIA',sub:['SBADIGLI DA','SABATO SERA'],col:'#d8d8ec'},
  {t:10.0,d:2.4,name:'PANTOFOLE',sub:['VOGLIONO','TENERTI A CASA'],col:'#ff86b8'},
  {t:12.4,d:2.6,name:'TELECOMANDO',sub:['ANCORA UN','EPISODIO...'],col:'#a8a8ff'}
];
const SHOTS=[];FOES.forEach((f,i)=>{if(f.zap)return;SHOTS.push({t0:f.th-0.36,t1:f.th,foe:i,from:i%2?'kat':'lor'},{t0:f.th-0.26,t1:f.th+0.02,foe:i,from:i%2?'lor':'kat'});});
const PARTY_AT=t=>FOES.filter(f=>t>=f.th).length+(t>=EV.boss.ko?1:0);

/* ---------------- camera ---------------- */
const VW=28,S_A=(16.4-6.4)*VW,S_B=S_A+VW*1.0/2,S_D=220;
function scrollAt(t){
  if(t<6.4)return 0;if(t<16.4)return (t-6.4)*VW;
  if(t<17.4){const u=t-16.4;return S_A+VW*u-VW*u*u/2;}
  if(t<EV.end.t0)return S_B;const u=clamp((t-EV.end.zoom[0])/(EV.end.zoom[1]-EV.end.zoom[0])),e=u*u*(3-2*u);return S_B+S_D*e;}
const walking=t=>(t>=6.4&&t<17.3)||(t>=24.0&&t<25.3);
const fogAt=t=>t<6.4?0.75:clamp(0.75*(1-(t-7.0)/9.4),0,0.75);
const metersAt=t=>t<6.4?500:t<16.4?Math.round((500-(t-6.4)/10*450)/10)*10:t<24?50:0;
/* the band steps back when the boss arrives (portrait is narrow) */
function heroXAt(t){const L=LAY(false);if(isL())return L.heroX;if(t<16.4)return 40;if(t<17.4){const u=t-16.4;return Math.round(40-22*u*u*(3-2*u));}return 18;}

/* ---------------- background: the valley at night ---------------- */
function buildBG(){
  const wide=wideView(),L=LAY(),N=LAY(false),ox=wide?L.vx0:0,oy=wide?L.vy0:0,Wn=isL()?384:216,F=L.feet,sky=mk(W,H),g=sky.getContext('2d');
  const cs=['#05061a','#0b0e30','#151a4a','#2a2460','#46306e'].map(hx),D=g.createImageData(W,H),hz=N.feet-60;
  for(let y=0;y<H;y++){const f=clamp((y-oy)/hz)*(cs.length-1),k=Math.min(cs.length-2,Math.floor(f)),fr=f-k;for(let x=0;x<W;x++){const v=fr>bay(x,y)?cs[k+1]:cs[k],i=(y*W+x)*4;D.data[i]=v[0];D.data[i+1]=v[1];D.data[i+2]=v[2];D.data[i+3]=255;}}
  g.putImageData(D,0,0);
  const nst=Math.round(Wn*(hz-60)/700);for(let i=0;i<nst;i++){const x=(R(i*5.3)*Wn|0)+ox,y=(R(i*9.7)*(hz-60)|0)+oy;g.fillStyle=R(i*2.2)>0.85?'#ffffff':'#9aa0d8';g.fillRect(x,y,1,1);}
  if(wide)for(let i=0;i<120;i++){const x=R(i*2.9+7)*W|0,y=R(i*6.1+3)*(F-120)|0;if(x>=ox&&x<ox+Wn&&y>=oy)continue;g.fillStyle=R(i*1.7)>0.85?'#ffffff':'#9aa0d8';g.fillRect(x,y,1,1);}
  const mx=Wn-40+ox,my=isL()?26+oy:F-150;g.fillStyle='#f1e6b4';for(let y=-9;y<=9;y++)for(let x=-9;x<=9;x++)if(x*x+y*y<=80)g.fillRect(mx+x,my+y,1,1);
  g.fillStyle='#d6c992';[[mx-3,my-2,2],[mx+3,my+3,2]].forEach(([x,y,r])=>{for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++)if(i*i+j*j<=r*r)g.fillRect(x+i,y+j,1,1);});
  const MT=mk(640,140),mg=MT.getContext('2d'),peaks=[[40,96],[110,70],[170,104],[240,62],[300,90],[372,74],[430,112],[500,66],[566,98],[620,80]];
  for(let x=0;x<640;x++){let h=0,side=0;for(const[p,ph]of peaks){const v=ph-Math.abs(x-p)*(1.25+((p*7)%5)*0.08);if(v>h){h=v;side=x>p;}}
    for(const[p,ph]of peaks){const v=ph-Math.abs(x-640-p)*1.25;if(v>h){h=v;side=x>p;}}
    h+=(R(x*3.1)*3|0);const top=140-Math.round(h);
    for(let y=top;y<140;y++){let c=side?'#1c2050':'#262a64';if(y<top+10+(R(x*5.3)*4|0))c=side?'#8a94cc':'#c8d0f4';mg.fillStyle=c;mg.fillRect(x,y,1,1);}}
  const HL=mk(480,90),hg=HL.getContext('2d'),hh=x=>34+Math.sin(x*0.013)*14+Math.sin(x*0.041+1)*6;
  for(let x=0;x<480;x++){const h=hh(x);for(let y=Math.round(90-h);y<90;y++){hg.fillStyle=y<90-h+2?'#1e3a4a':'#132a36';hg.fillRect(x,y,1,1);}}
  for(let i=0;i<46;i++){const x=R(i*3.7)*480|0,h=hh(x),y=Math.round(90-h+4+R(i*1.9)*(h-8));hg.fillStyle=R(i*4.1)>0.5?'#ffd86a':'#ffb84a';hg.fillRect(x,y,1,1);if(R(i*2.3)>0.6)hg.fillRect(x+1,y,1,1);}
  [150,390].forEach(x=>{const by=Math.round(90-hh(x))+2;hg.fillStyle='#0c1c26';hg.fillRect(x,by-26,7,26);hg.fillRect(x+1,by-31,5,5);hg.fillRect(x+3,by-36,1,5);hg.fillStyle='#ffd86a';hg.fillRect(x+2,by-22,3,3);});
  const HS=mk(512,110),sg=HS.getContext('2d'),wall=['#8a7a68','#7a6a8a','#9a8a6a','#6a7a8a','#8a6a62'],rect=(x,y,w,h,c)=>{sg.fillStyle=c;sg.fillRect(x,y,w,h);};
  let x=0,k=0;while(x<512){const w=56+((k*29)%30),h=48+((k*17)%26),y=110-h;
    rect(x,y,w-2,h,wall[k%5]);for(let j=0;j<10;j++){const hw=Math.round((w+6)/2*(1-j/10));rect(x+(w-2)/2-hw,y-10+j,hw*2,1,j%3===2?'#3a1a14':'#6a2a1e');}
    const cols=Math.max(2,Math.floor((w-14)/16));for(let r=0;r<2;r++)for(let q=0;q<cols;q++){const wx=x+8+q*Math.floor((w-14)/cols),wy=y+8+r*20,lit=R(k*7.1+r*3+q)>0.35;
      rect(wx-1,wy-1,9,12,'#3a2a24');rect(wx,wy,7,10,lit?'#ffcf4a':'#1a1a30');if(lit){rect(wx,wy,7,2,'#fff0a0');rect(wx+3,wy,1,10,'#3a2a24');}}
    rect(x+(w>>1)-5,110-16,10,16,'#3a2014');x+=w;k++;}
  for(let lx=40;lx<512;lx+=128){rect(lx,30,2,80,'#2a2a3a');rect(lx-4,28,10,3,'#2a2a3a');rect(lx-3,31,8,3,'#ffe8a0');}
  return{sky,MT,HL,HS,F};
}
function getBG(){const k=W+'x'+H;return BGS[k]||(BGS[k]=buildBG());}
function tileDraw(img,off,y){const w=img.width;let x=-((Math.round(off)%w)+w)%w;for(;x<W;x+=w)ctx.drawImage(img,x,y);}
function drawBG(t,s,dim,cx=0){
  const B=getBG(),F=B.F;ctx.drawImage(B.sky,0,0);
  tileDraw(B.MT,s*0.06-cx,F-196);tileDraw(B.HL,s*0.22-cx,F-122);
  const fa=fogAt(t);if(fa>0){ctx.fillStyle='#8a8ab0';for(let y=F-110;y<F-24;y++){const d=fa*(1-Math.abs(y-(F-64))/46);if(d<=0)continue;for(let x=0;x<W;x++)if(bay(x+Math.round(t*6),y)<d)ctx.fillRect(x,y,1,1);}}
  tileDraw(B.HS,s*0.6-cx,F-136);
  rr(0,F-26,W,10,'#4a4a62');rr(0,F-26,W,1,'#6a6a82');rr(0,F-16,W,2,'#2a2a3a');rr(0,F-14,W,H-F+14,'#26263a');
  for(let x=-((Math.round(s-cx)%40)+40)%40;x<W;x+=40)rr(x,F+14,18,2,'#c8c8a0');
  rr(0,F+30,W,H,'#1c1c2c');
  const gy=F+46;rr(0,gy,W,3,'#5a5a72');rr(0,gy,W,1,'#8a8aa8');for(let x=-((Math.round(s*1.3-cx)%30)+30)%30;x<W;x+=30){rr(x,gy-4,3,22,'#3a3a4e');rr(x,gy-4,3,1,'#6a6a82');}
  rr(0,gy+18,W,H,'#14141f');
  if(fa>0){ctx.fillStyle='#9a9ac0';for(let y=F-30;y<F+6;y++){const d=fa*0.45*(1-Math.abs(y-(F-12))/18);if(d<=0)continue;for(let x=0;x<W;x++)if(bay(x-Math.round(t*10),y)<d)ctx.fillRect(x,y,1,1);}}
  if(dim>0){ctx.globalAlpha=dim;rr(0,0,W,H,'#05061a');ctx.globalAlpha=1;}
}

/* ---------------- characters ---------------- */
function drawTrio(t,x,F,o={}){
  const walk=o.walk!==undefined?o.walk:walking(t),d=o.d!==undefined?o.d:scrollAt(t)+t*20,play=o.play||false,hop=o.hop||0;
  const wf=walk?[1,0,2,0][Math.floor(d/8)%4]:0,bob=walk&&wf!==0?-1:0,bob2=walk&&wf===0?-1:0;
  const kx=x,ky=F-43+bob2-hop,lx=x+23,ly=F-46+bob-hop;
  ctx.drawImage(SPR.kat[wf],kx-1,ky-1);ctx.drawImage(SPR.lor[wf],lx-1,ly-1);
  const st=play?Math.floor(t/0.1)%2:0;rr(lx+9,ly+31-st,3,2,'#f2b48c');rr(kx+14,ky+28-st,3,2,'#f2b48c');
  const mf=o.mf!==undefined?o.mf:(walk?[1,0,2,0][Math.floor(d/8)%4]:0),mx=x+50+(o.mdx||0),my=F-39+(walk&&mf!==0?-1:0)-(o.mhop||0);
  ctx.drawImage(MONK_SPR[mf],mx-1,my-1);
  if(o.crown)ctx.drawImage(CROWN,mx+9,my-4);
  return{lor:[lx+22,ly+24],kat:[kx+13,ky+27],monk:[mx+17,my+14],mx,my};
}
const FLIPC=new Map();const flipX0=im=>{if(!FLIPC.has(im))FLIPC.set(im,flipX(im));return FLIPC.get(im);};
function foeImg(f,happy,t){if(f.k==='cloud')return happy?CLOUD.happy:CLOUD.sad[Math.floor(t*2.5)%2];if(f.k==='slip')return happy?SLIP.happy:SLIP.sad;return happy?REMOTE.happy[Math.floor(t*8)%6]:REMOTE.sad;}
/* a foe at screen x (left edge) standing on yFeet; faceRight flips walkers so they look where they go */
function drawFoe(f,x,yFeet,happy,t,faceRight){
  const im=foeImg(f,happy,t);
  if(f.k==='slip'){const sp=happy?11:7,a=faceRight?im:flipX0(im),h1=Math.round(Math.abs(Math.sin(t*sp))*(happy?5:3)),h2=Math.round(Math.abs(Math.sin(t*sp+1.5))*(happy?5:3));
    ctx.drawImage(a,Math.round(x),Math.round(yFeet-im.height-h1));ctx.drawImage(a,Math.round(x+13),Math.round(yFeet-im.height-h2+2));}
  else if(f.k==='cloud'){const a=faceRight?flipX0(im):im;ctx.drawImage(a,Math.round(x),Math.round(yFeet-im.height+Math.sin(t*3+(f.y||0))*2));if(!happy){const z=(t*1.2+(f.y||0))%1;ctx.drawImage(ZZZ,Math.round(x+24+z*6),Math.round(yFeet-im.height-6-z*12));}}
  else{const h=Math.round(Math.abs(Math.sin(t*(happy?9:6)))*(happy?4:2));ctx.drawImage(im,Math.round(x),Math.round(yFeet-im.height-h));}
}
/* approach: from the right edge to the hit point */
function foePos(i,t){const f=FOES[i],L=LAY(),end=f.zap||f.th,u=clamp((t-f.ts)/(end-f.ts)),e=1-(1-u)*(1-u),x0=W+8,x1=L.hitX-(f.k==='slip'?10:0);
  return{x:x0+(x1-x0)*e,y:f.k==='cloud'?L.feet-f.y:L.feet};}
/* after the hit: a happy hop on the spot, then off to the left behind the band and out of the picture */
const EXIT_AT=f=>f.th+0.4;
function exitPos(i,t){const f=FOES[i],L=LAY(),p=foePos(i,f.th),a=t-EXIT_AT(f),k=clamp(a/0.25),base=L.lane-(f.k==='cloud'?24:0);
  return{x:p.x-a*190,y:p.y+(base-p.y)*k-Math.sin(Math.PI*k)*10,gone:p.x-a*190<-50};}

/* ---------------- text helpers for readable overlays ---------------- */
function panel(x,y,w,h,border){rr(x+2,y+2,w,h,'#000000');rr(x,y,w,h,'#0a0716e8');if(border){rr(x,y,w,2,border);rr(x,y+h-2,w,2,border);rr(x,y,2,h,border);rr(x+w-2,y,2,h,border);}}
/* slam in: 3 frames of overshoot, then steady (no blinking while it has to be read) */
const slam=(t,t0)=>{const a=t-t0;return a<0.1?Math.round((1-a/0.1)*12):0;};

/* ---------------- HUD ---------------- */
function hud(t){
  const L=LAY(),y=L.hud,n=PARTY_AT(t),pulse=FOES.some(f=>t>=f.th&&t<f.th+0.15)||(t>=EV.boss.ko&&t<EV.boss.ko+0.15);
  dt('PARTY',8,y,1,'#ffe03a',{outline:INK});dt('X'+String(n).padStart(2,'0'),8,y+9,2,pulse?'#ffffff':'#7dff8a',{outline:INK});
  const m=metersAt(t),ms=m+' M';dt("MONKEY'S BAR",W-8-tw("MONKEY'S BAR"),y,1,'#ff7ad8',{outline:INK});dt(ms,W-8-tw(ms)*2,y+9,2,'#ffffff',{outline:INK});
  if(Math.floor(t*2.5)%2===0&&m>0)dt('>',W-8-tw(ms)*2-12,y+11,1,'#ffe03a',{outline:INK});
  const dl=NIGHT.date+' · ORE 18 · '+NIGHT.place;if(isL())ctext(dl,W/2,y+4,1,'#5fe0ff');else ctext(dl,W/2,y+27,1,'#5fe0ff');
}
/* enemy cards: big name, what it stands for in two lines, framed and steady for 2.4 s */
function captions(t){
  const L=LAY();
  CAPS.forEach(c=>{const a=t-c.t;if(a<0||a>c.d)return;const sl=slam(t,c.t),hgt=isL()?46:68,out=a>c.d-0.15?Math.round((a-(c.d-0.15))/0.15*W):0;
    panel(6-out,L.cap-4,W-12,hgt,c.col);
    ftext(c.name,W/2-out,L.cap+2-sl,W-28,3,c.col);
    if(isL())ctext(c.sub.join(' '),W/2-out,L.cap+26,2,'#ffffff');else{ctext(c.sub[0],W/2-out,L.cap+26,2,'#ffffff');ctext(c.sub[1],W/2-out,L.cap+44,2,'#ffffff');}});
}

/* ---------------- menu ---------------- */
function rainbowBorder(x,y,w,h,t){const C=['#ff4a5a','#ffb52e','#ffe03a','#5ae06a','#5fe0ff','#a77aff'];const per=2*(w+h),off=Math.floor(t*60);
  for(let i=0;i<per;i+=2){const c=C[Math.floor((i+off)/6)%6];let px,py;if(i<w){px=x+i;py=y;}else if(i<w+h){px=x+w-1;py=y+i-w;}else if(i<2*w+h){px=x+w-1-(i-w-h);py=y+h-1;}else{px=x;py=y+h-1-(i-2*w-h);}rr(px,py,2,2,c);}}
function menuScene(t){
  drawBG(0,0,0.55);
  const M=EV.menu,pr=M.press,sel=t>=M.move?1:0;
  const ty=isL()?16:56;ftext('SABATO SERA:',W/2,ty,W-24,3,'#ffe03a',{shadow:'#ff4a5a',sd:2});
  ctext(NIGHT.date+' · ORE 18 · '+NIGHT.place,W/2,ty+(isL()?27:30),1,'#5fe0ff');
  const cards=isL()?[[24,68,160,66],[200,68,160,66]]:[[18,116,180,58],[18,188,180,58]];
  cards.forEach(([x,y,w,h],i)=>{const on=sel===i,pressed=i===1&&t>=pr&&t<pr+0.12,dim=i===0&&t>=pr;
    const o=pressed?2:0,inv=i===1&&t>=pr&&t<pr+0.3&&Math.floor((t-pr)*14)%2===0;
    rr(x+3,y+3,w,h,'#000000');rr(x+o,y+o,w,h,inv?'#ffffff':dim?'#120e26':'#1a1640');
    if(i===1&&t>=pr)rainbowBorder(x+o,y+o,w,h,t);else{const bc=on?'#ffe03a':'#3a3474';rr(x+o,y+o,w,2,bc);rr(x+o,y+o+h-2,w,2,bc);rr(x+o,y+o,2,h,bc);rr(x+o+w-2,y+o,2,h,bc);}
    const ix=x+o+8,iy=y+o+(h>>1);
    if(i===0){const sh=t>=M.angry?Math.round(Math.sin(t*50)*1.5):0;ctx.drawImage(SOFA_ICON,ix+sh,iy-12);if(t>=M.angry){ctx.drawImage(CROWN,ix+12+sh,iy-19);dt('?!',ix+44,iy-14,1,'#ff4a5a',{outline:INK});}}
    else ctx.drawImage(NEON.mOn,ix+4,iy-10);
    const lab=i===0?'DIVANO':"MONKEY'S BAR",lc=inv?INK:dim?'#5a5680':i===1&&t>=pr?'#ff7ad8':'#ffffff';
    ftext(lab,x+o+(isL()?w/2+16:w/2+18),iy-7,w-60,2,lc,{outline:inv?null:INK});
    if(on&&t<pr&&Math.floor(t*3)%2===0)dt('>',isL()?x+w/2-8:x-12,isL()?y-12:iy-3,1,'#ffe03a',{outline:INK});
    if(i===1&&t>=pr){const a=t-pr;for(let r=0;r<3;r++){const k=a-r*0.08;if(k<0||k>0.4)continue;const g=Math.round(k*60);ctx.strokeStyle=['#ffe03a','#ff7ad8','#5fe0ff'][r];ctx.lineWidth=2;ctx.strokeRect(x-g+0.5,y-g+0.5,w+2*g,h+2*g);}
      if(a<0.5)sparks(x+w/2,y+h/2,a*2,8,w*0.6);}});
  if(t>=pr+0.15)ctext('SCELTA GIUSTA!',W/2,(isL()?150:262)-slam(t,pr+0.15),2,'#7dff8a');
  const f=t-pr;flashScreen(f>=0&&f<0.05?0.7:0);
}
/* ---------------- team ---------------- */
const CARD_INFO=[{n:'KATIA',r:'VOCE',spr:()=>SPR.kat[0],c:'#ff7ad8'},{n:'LORENZO',r:'CHITARRA',spr:()=>SPR.lor[0],c:'#5fe0ff'},{n:'MONKEY',r:'CODA',spr:()=>MONK_SPR[3],c:'#ffe03a'}];
function selectScene(t){
  drawBG(0,0,0.8);ftext('LA SQUADRA',W/2,isL()?12:52,W-24,3,'#ffe03a',{shadow:'#ff4a5a',sd:2});
  const cw=isL()?96:70,gap=isL()?20:2,x0=Math.round((W-(3*cw+2*gap))/2),cy=isL()?42:84,ch=isL()?134:152;
  CARD_INFO.forEach((c,i)=>{const a=t-EV.sel.cards[i];if(a<0)return;const drop=a<0.15?Math.round((1-a/0.15)*(H-cy)):(a<0.25?-Math.round(Math.sin((a-0.15)/0.1*Math.PI)*4):0);
    const x=x0+i*(cw+gap),y=cy+drop;rr(x+2,y+2,cw,ch,'#000000');rr(x,y,cw,ch,a<0.06?'#ffffff':'#1a1640');rr(x,y,cw,2,c.c);rr(x,y+ch-2,cw,2,c.c);rr(x,y,2,ch,c.c);rr(x+cw-2,y,2,ch,c.c);
    const im=c.spr(),iw=im.width*2,ih=im.height*2;ctx.drawImage(im,Math.round(x+(cw-iw)/2),y+(isL()?6:8),iw,ih);
    const ny=y+ch-(isL()?32:36);ftext(c.n,x+cw/2,ny,cw-6,2,'#ffffff');ctext(c.r,x+cw/2,ny+16,1,c.c);
    const fill=clamp((a-0.1)/0.5);for(let b=0;b<5;b++)rr(x+cw/2-17+b*7,ny+25,5,4,b<Math.round(fill*5)?c.c:'#3a3474');});
  if(t>=EV.sel.ready)ctext('SQUADRA PRONTA!',W/2,(isL()?184:248)-slam(t,EV.sel.ready),2,'#7dff8a');
  const f=t-EV.sel.ready;flashScreen(f>=0&&f<0.05?0.6:0);
}
function wipe(a){if(a<=0)return;const n=8,hh=Math.ceil(H/n);for(let i=0;i<n;i++)rr(0,i*hh,W,Math.ceil(hh*clamp(a)),'#05061a');}

/* ---------------- stage ---------------- */
function drawShot(sh,t,P){const u=(t-sh.t0)/(sh.t1-sh.t0);if(u<0||u>1)return;const f=FOES[sh.foe],tp=foePos(sh.foe,sh.t1),im=foeImg(f,false,t);
  const from=P[sh.from],tx=tp.x+im.width/2,ty=tp.y-im.height/2,x=from[0]+(tx-from[0])*u,y=from[1]+(ty-from[1])*u-Math.sin(Math.PI*u)*14;
  ctx.drawImage(BIGNOTE[(sh.foe+(sh.from==='kat'?1:0))%4],Math.round(x-5),Math.round(y-6));}
function hitFx(t,th,x,y){const a=t-th;if(a<0||a>0.5)return;if(a<0.14)starBurst(x,y,16-a*30,7,8,a<0.06?'#ffffff':'#ffe03a',a*4);
  if(a>0.05)dt('+1',Math.round(x-tw('+1')),Math.round(y-18-a*24),2,'#7dff8a',{outline:INK});}
function monkFrame(t){for(const f of FOES)if(f.spin&&t>=f.spin-0.05&&t<f.th)return 4;return walking(t)?[1,0,2,0][Math.floor((scrollAt(t)+t*20)/8)%4]:0;}
function monkDx(t){for(const f of FOES)if(f.zap){const a=(t-f.zap)/(f.th+0.3-f.zap);if(a>0&&a<1)return Math.round(Math.sin(Math.PI*a)*30);}return 0;}
function monkHop(t){for(const f of FOES)if(f.zap){const a=(t-(f.spin-0.15))/0.55;if(a>0&&a<1)return Math.round(Math.sin(Math.PI*a)*16);}return 0;}
/* converted foes running away behind the band */
function drawExits(t){FOES.forEach((f,i)=>{if(t<EXIT_AT(f))return;const p=exitPos(i,t);if(p.gone)return;drawFoe(f,p.x,p.y,true,t+i,false);});}

function stageScene(t){
  const L=LAY(),F=L.feet,s=scrollAt(t);
  drawBG(t,s,0);drawExits(t);
  const P=drawTrio(t,heroXAt(t),F,{play:FOES.some(f=>t>f.th-0.5&&t<f.th+0.1),mf:monkFrame(t),mdx:monkDx(t),mhop:monkHop(t)});
  FOES.forEach((f,i)=>{if(t<f.ts||t>=EXIT_AT(f))return;const p=foePos(i,Math.min(t,f.th));
    if(t<f.th)drawFoe(f,p.x,p.y,false,t);else{const a=(t-f.th)/0.4;drawFoe(f,p.x,p.y-Math.round(Math.abs(Math.sin(Math.PI*a*2))*8),true,t);}});
  SHOTS.forEach(sh=>drawShot(sh,t,P));
  FOES.forEach((f,i)=>{if(!f.zap)return;const p=foePos(i,t),z0=f.zap,z1=f.spin,z2=f.th;
    if(t>=z0&&t<z2){const out=t<z1,u=out?(t-z0)/(z1-z0):1-(t-z1)/(z2-z1),x1=p.x+2,x0=P.monk[0]+10,bx=x1+(x0-x1)*u,by=p.y-20;
      for(let k=0;k<7;k++){const xx=Math.round(bx+(out?k*6:-k*6)),yy=by+((k+Math.floor(t*30))%3)-1;rr(xx,yy,5,3,((k+Math.floor(t*40))%2)?'#ffffff':'#8a8aa8');}
      if(out)dt('ZAP!',Math.round(p.x-12),by-18,2,'#a8a8ff',{outline:INK});}
    if(t>=z1-0.05&&t<z2+0.1){const cx=P.monk[0],cy=P.monk[1]+6,a=(t-z1)*24;for(let k=0;k<12;k++){const an=a+k*0.52,r=18;rr(Math.round(cx+Math.cos(an)*r),Math.round(cy+Math.sin(an)*r*0.6),2,2,k%2?'#94603a':'#6e4220');}}
    if(t>=z1&&t<z2+0.8)ctext('CODA ROTANTE!',Math.max(52,P.monk[0]+6),P.my-30-slam(t,z1),2,'#ffe03a');});
  FOES.forEach((f,i)=>{const p=foePos(i,f.th),im=foeImg(f,false,f.th);hitFx(t,f.th,p.x+im.width/2,p.y-im.height/2);});
  const ci=COMBO.filter(x=>t>=x).length;if(ci>=2&&t<COMBO[COMBO.length-1]+0.8){const last=COMBO[ci-1];panel(W/2-90,L.cap-4,180,30,'#7dff8a');ctext('COMBO X'+ci+'!',W/2,L.cap+2-slam(t,last),3,['#ffe03a','#ff7ad8','#5fe0ff','#7dff8a'][ci%4]);}
  captions(t);
  const ta=t-EV.stage.t0;if(ta>=0&&ta<1.2){panel(W/2-80,L.cap-4,160,isL()?44:48,'#ffe03a');ctext('STAGE 1',W/2,L.cap+2-slam(t,EV.stage.t0),3,'#ffffff');ctext('CUGNAN  GO >',W/2,L.cap+(isL()?26:28),2,'#ffe03a');}
  const al=t-EV.alarm[0];if(al>=0&&t<EV.alarm[1]){const on=Math.floor(al*2.5)%2===0,hb=isL()?46:50;rr(0,L.cap-6,W,hb,on?'#c8102ae0':'#2a0610e0');
    for(let x=-((Math.floor(al*40))%16);x<W;x+=16){rr(x,L.cap-6,8,3,'#ffe03a');rr(x+4,L.cap-6+hb-3,8,3,'#ffe03a');}
    ctext('ATTENZIONE!',W/2,L.cap+1,3,'#ffffff');ctext('ARRIVA IL BOSS',W/2,L.cap+(isL()?26:28),2,'#ffe03a');}
  hud(t);
}

/* ---------------- boss: RE DIVANO and the sound wave ---------------- */
const sofaDance=t=>t>=EV.boss.legs+0.2?Math.round(Math.sin((t-EV.boss.legs)*Math.PI/BEAT*2)*3):0;
function bossGeom(t){const L=LAY(),B=EV.boss,F=L.feet,inA=clamp((t-B.t0)/(B.land-B.t0)),bx0=W+10,bx=Math.round(bx0+(L.bossX-bx0)*(1-(1-inA)*(1-inA)));
  const legs=t>=B.legs?Math.min(16,Math.round((t-B.legs)*80)):0,dance=t>=B.legs+0.2?Math.round(Math.sin((t-B.legs)*Math.PI/BEAT*2)*3):0;
  return{bx,by:F-58-legs-(t>=B.legs+0.2?Math.abs(dance):0),legs,dance};}
function drawSofa(x,y,legs,dance,happy,t,F,scale=1){
  if(legs>0){[[14,1],[84,-1]].forEach(([ox,dir],k)=>{const sw=Math.round(Math.sin(t*Math.PI/BEAT*2+k*Math.PI)*4),lx=x+Math.round(ox*scale);rr(lx,y+Math.round(52*scale),Math.max(2,Math.round(4*scale)),F-(y+Math.round(52*scale)),'#f2b48c');rr(lx-3+sw*dir,F-4,Math.round(10*scale)+2,4,'#e8384a');rr(lx-3+sw*dir,F-1,Math.round(10*scale)+2,1,'#ffffff');});}
  const im=happy?SOFA.happy:SOFA.angry;if(scale===1)ctx.drawImage(im,x+dance,y);else ctx.drawImage(im,x+dance,y,Math.round(im.width*scale),Math.round(im.height*scale));
}
/* the energy sphere: rainbow rings, white core, orbiting notes, sound-wave arcs */
function energyBall(cx,cy,r,t){
  const C=['#ff4a5a','#ffb52e','#ffe03a','#5ae06a','#5fe0ff','#a77aff'];
  glow(cx,cy,Math.round(r*1.8),'#ff7ad8',0.35);glow(cx,cy,Math.round(r*1.35),'#5fe0ff',0.5);
  for(let k=0;k<3;k++){const rk=Math.round(r*(1-k*0.22));ctx.strokeStyle=C[(k*2+Math.floor(t*20))%6];ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx+0.5,cy+0.5,rk,0,Math.PI*2);ctx.stroke();}
  disc(cx,cy,Math.max(2,Math.round(r*0.45)),'#ffffff');
  for(let k=0;k<6;k++){const an=t*6+k*Math.PI/3,rr_=r+6;ctx.drawImage(BIGNOTE[k%4],Math.round(cx+Math.cos(an)*rr_-5),Math.round(cy+Math.sin(an)*rr_*0.8-6));}
}
function bossScene(t){
  const L=LAY(),F=L.feet,B=EV.boss,s=scrollAt(t),G=bossGeom(t);
  const charging=t>=B.special&&t<B.launch,flying=t>=B.launch&&t<B.impact,boom=t>=B.impact&&t<B.impact+0.7;
  const shake=(t>=B.land&&t<B.land+0.25)||(t>=B.impact&&t<B.impact+0.5)?Math.round(Math.sin(t*90)*(t>=B.impact?3:2)):0;
  ctx.save();ctx.translate(shake,0);
  drawBG(t,s,charging||flying?Math.min(0.55,(t-B.special)*1.5):boom?0.55*(1-(t-B.impact)/0.7):0);drawExits(t);
  let hop=0;B.hops.forEach(h=>{const a=(t-h)/0.3;if(a>0&&a<1)hop=Math.max(hop,Math.round(Math.sin(Math.PI*a)*18));});
  const P=drawTrio(t,heroXAt(t),F,{walk:false,play:charging,hop,mhop:hop,mf:t>=B.ko?3:0,crown:t>=B.crownLand});
  const happy=t>=B.ko;drawSofa(G.bx,G.by,G.legs,G.dance,happy,t,F);
  if(t>=B.impact&&t<B.ko&&Math.floor(t*20)%2===0){ctx.globalAlpha=0.75;rr(G.bx+4,G.by+6,96,46,'#ffffff');ctx.globalAlpha=1;}
  const cA=clamp((t-B.ko)/(B.crownLand-B.ko)),cx0=G.bx+44,cy0=G.by-5,cx1=P.mx+9,cy1=P.my-4;
  if(t<B.ko)ctx.drawImage(CROWN,cx0,cy0);else if(t<B.crownLand){const x=cx0+(cx1-cx0)*cA,y=cy0+(cy1-cy0)*cA-Math.sin(Math.PI*cA)*44;ctx.drawImage(CROWN,Math.round(x),Math.round(y));}
  const dl=t-B.land;if(dl>=0&&dl<0.4)for(let k=0;k<8;k++){const r=dl*60,an=Math.PI+k*Math.PI/7;rr(Math.round(G.bx+52+Math.cos(an)*r*1.4),Math.round(F-2+Math.sin(an)*r*0.25),3,2,'#8a8aa8');}
  B.pillows.forEach(p0=>{const a=(t-p0)/0.55;if(a<0||a>1)return;const x=G.bx+30+(P.kat[0]-70-G.bx-30)*a,y=G.by+10-Math.sin(Math.PI*a)*30+a*20;ctx.drawImage(PILLOW,Math.round(x),Math.round(y));});
  /* the special move: two streams of notes from guitar and ukulele meet and grow a sphere of sound */
  const C0=[P.monk[0]+26,F-34],sphereR=t<B.special?0:Math.round(3+19*clamp((t-B.special)/(B.launch-B.special)));
  if(charging){const RB=['#ff4a5a','#ffb52e','#ffe03a','#5ae06a','#5fe0ff','#a77aff'];
    [P.lor,P.kat].forEach((src,si)=>{for(let k=0;k<7;k++){const u=((t*1.8+k/7+si*0.07)%1),x=src[0]+(C0[0]-src[0])*u,y=src[1]+(C0[1]-src[1])*u-Math.sin(Math.PI*u)*(si?18:12);
      ctx.drawImage(BIGNOTE[(k+si)%4],Math.round(x-5),Math.round(y-6));}
      for(let k=0;k<26;k++){const u=k/26,x=src[0]+(C0[0]-src[0])*u,y=src[1]+(C0[1]-src[1])*u-Math.sin(Math.PI*u)*(si?18:12)+Math.sin(u*12+t*20)*1.5;rr(Math.round(x),Math.round(y),2,2,RB[(k+Math.floor(t*30))%6]);}});
    energyBall(C0[0],C0[1],sphereR,t);sparks(C0[0],C0[1],1-((t-B.special)%0.4)/0.4,8,40);}
  const tgt=[G.bx+40,G.by+26];
  if(flying){const u=(t-B.launch)/(B.impact-B.launch),x=C0[0]+(tgt[0]-C0[0])*u,y=C0[1]+(tgt[1]-C0[1])*u;
    for(let k=1;k<6;k++){const xx=Math.round(x-k*10),rk=Math.max(2,22-k*4);ctx.strokeStyle=['#ff4a5a','#ffe03a','#5ae06a','#5fe0ff','#a77aff'][k-1];ctx.lineWidth=2;ctx.beginPath();ctx.arc(xx+0.5,Math.round(y)+0.5,rk,-Math.PI/2.4,Math.PI/2.4);ctx.stroke();}
    energyBall(Math.round(x),Math.round(y),22,t);}
  if(boom){const a=t-B.impact,cx=tgt[0],cy=tgt[1];
    for(let k=0;k<3;k++){const ka=a-k*0.08;if(ka<0)continue;const r=Math.round(ka*170);ctx.strokeStyle=['#ffffff','#ffe03a','#ff7ad8'][k];ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(cx+0.5,cy+0.5,r,r*0.7,0,0,Math.PI*2);ctx.stroke();}
    if(a<0.3)starBurst(cx,cy,Math.round(30+a*60),Math.round(14+a*30),12,a<0.08?'#ffffff':'#ffe03a',a*3);
    for(let k=0;k<16;k++){const an=k*Math.PI/8,r=a*150;ctx.drawImage(BIGNOTE[k%4],Math.round(cx+Math.cos(an)*r-5),Math.round(cy+Math.sin(an)*r*0.7-6));}}
  ctx.restore();
  /* boss card with energy bar */
  const nb=t>=B.t0+0.2&&t<B.ko+0.5;if(nb){const y=L.cap-4,hb=56;panel(6,y,W-12,hb,'#ff4a5a');ftext('RE DIVANO',W/2,y+5-slam(t,B.t0+0.2),W-28,3,'#ff4a5a');ctext('IL SABATO A CASA',W/2,y+28,isL()?2:[1,2],'#ffffff');
    const hp=t<B.impact?1:clamp(1-(t-B.impact)/(B.ko-B.impact)),bw=W-40;rr(19,y+hb-9,bw+2,6,INK);rr(20,y+hb-8,Math.round(bw*hp),4,hp>0.3?'#ff4a5a':'#ffe03a');}
  if(t>=B.special&&t<B.impact+0.4){const y=L.mid;panel(W/2-90,y-4,180,isL()?42:44,'#ffe03a');ctext('MOSSA SPECIALE',W/2,y,isL()?1:[1,2],'#ffffff');ctext('ONDA SONORA!',W/2,y+(isL()?14:18)-slam(t,B.special),isL()?3:[2,3],['#ffe03a','#ff7ad8','#5fe0ff'][Math.floor(t*6)%3]);}
  if(t>=B.ko+0.2){const y=L.mid;panel(W/2-90,y-4,180,30,'#7dff8a');ctext('ANCHE LUI VIENE!',W/2,y+3-slam(t,B.ko+0.2),2,'#7dff8a');}
  hitFx(t,B.ko,G.bx+52,G.by+20);
  const fb=t-B.impact;flashScreen(fb>=0&&fb<0.07?0.85:fb>=0.07&&fb<0.16?0.35:0);
  hud(t);
}

/* ---------------- ending, on the wide canvas: zoom out, everybody walks into the Monkey's ---------------- */
const LINE=[...FOES.map((f,i)=>({f,i})),{sofa:true}];
/* when each friend in the line starts, how fast it walks, where it goes in (same timing for picture and sound) */
function lineTiming(k){const m=LINE[k],L=LAY(true),door=L.barX+82,dx=door-(m.sofa?0:12),t0=EV.end.line+k*0.2+(m.sofa?0.25:0),sp=(dx+44)/(m.sofa?1.7:1.4);return{t0,sp,dx,door,tin:t0+(dx+44)/sp};}
function endScene(t){
  const L=LAY(),F=L.feet,E=EV.end,s=scrollAt(t),zu=clamp((t-E.zoom[0])/(E.zoom[1]-E.zoom[0])),ze=zu*zu*(3-2*zu);
  drawBG(t,s,0,L.vx0);
  /* bar slides in with the scroll */
  const bx=Math.round(L.barX+(S_B+S_D-s)),byT=F-12-BARIMG.height,door=bx+82;
  ctx.drawImage(BARIMG,bx,byT);
  const on=t>=E.neon&&!(t<E.neon+0.25&&Math.floor(t*25)%3===0);
  if(on)glow(bx+82,byT+14,44,'#ff5fd8',0.22);
  ctx.drawImage(on?NEON.mOn:NEON.mOff,bx+16,byT+5);ctx.drawImage(on?BAR_NEON.on:BAR_NEON.off,bx+44,byT+9);ctx.drawImage(on?NEON.bOn:NEON.bOff,bx+102,byT+9);
  for(let k=0,x=bx+6;x<bx+158;x+=8,k++)rr(x,byT+58,2,2,on?['#ff4a5a','#ffe03a','#5ae06a','#5fe0ff','#ff7ad8'][(k+Math.floor(t*5))%5]:'#3a3a4a');
  /* the sofa that was on screen slides away left with the camera */
  const sx0=LAY(false).bossX+L.vx0-(s-S_B)-Math.max(0,t-E.t0)*260;if(sx0>-110){const dn=sofaDance(t);drawSofa(Math.round(sx0),F-58-16-Math.abs(dn),16,dn,true,t,F);}
  /* the line: every converted friend comes back from the left and goes in through the door */
  LINE.forEach((m,k)=>{const{t0,sp,dx}=lineTiming(k),x=-40+(t-t0)*sp;if(t<t0||x>dx+4)return;
    if(m.sofa){const left=dx-x,sc=clamp(left/160,0.28,1),dn=sofaDance(t),h=Math.round(58*sc);drawSofa(Math.round(x-52*sc),F-14-h-Math.round(16*sc)-Math.abs(dn),Math.round(16*sc),dn,true,t,F-14,sc);}
    else{const f=m.f,y=L.lane-(f.k==='cloud'?24:0);drawFoe(f,x-8,y,true,t+k*0.3,true);}});
  /* sparkle at the door each time someone goes in */
  LINE.forEach((m,k)=>{const a=t-lineTiming(k).tin;if(a>=0&&a<0.3)sparks(door,F-30,a/0.3,6,18);});
  /* the band: walks right of the door and cheers, monkey wearing the crown */
  const tx0=heroXAt(E.t0)+L.vx0,tx=Math.round(tx0+(L.trioEnd-tx0)*clamp((t-E.t0)/1.3)),walk=t<E.t0+1.3;
  drawTrio(t,tx,F,{walk,d:t*40,mf:walk?undefined:3,crown:true});
  if(ze>=1){
    if(t>=E.clear[0]&&t<E.clear[1]){const C=['#ff4a5a','#ffe03a','#5fe0ff','#7dff8a','#ff7ad8','#ffffff'];for(let i=0;i<70;i++){const a=((t-E.clear[0])*0.4+R(i*3.3))%1,x=Math.round(R(i*7.7)*W+Math.sin(t*3+i)*5),y=Math.round(-10+a*(H+20));rr(x,y,2,i%3?2:1,C[i%6]);}
      panel(W/2-110,L.clearY-6,220,36,'#ffe03a');ftext('STAGE CLEAR!',W/2,L.clearY+1-slam(t,E.clear[0]),200,3,'#ffe03a',{shadow:'#ff4a5a',sd:2});}
    if(t>=E.card)infoCard(t);
  }
  const fd=(t-E.fade)/(DUR-E.fade);if(fd>0)wipe(fd);
}
function infoCard(t){
  const L=LAY(),[x,y,w,h]=L.card,a=clamp((t-EV.end.card)/0.2),hh=Math.round(h*a),yy=y+Math.round((h-hh)/2);
  rr(x+3,yy+3,w,hh,'#000000');rr(x,yy,w,hh,'#0c0a2af4');if(a<1)return;
  rainbowBorder(x,y,w,h,t);
  const cx=x+w/2;let cy=y+9;
  ftext('SABATO 14',cx,cy,w-16,3,'#ffe03a',{shadow:'#ff4a5a',sd:2});cy+=26;
  ftext('NOVEMBRE',cx,cy,w-16,3,'#ffe03a');cy+=25;
  ftext('DALLE 18:00',cx,cy,w-16,3,'#ffffff');cy+=29;
  ftext("MONKEY'S BAR",cx,cy,w-16,3,'#ff7ad8');cy+=26;
  ftext('CUGNAN',cx,cy,w-16,2,'#5fe0ff');cy+=17;
  ftext('PONTE NELLE ALPI',cx,cy,w-16,2,'#5fe0ff');cy+=22;
  ftext('2DEEP LIVE',cx,cy,w-16,3,'#ffffff',{shadow:'#ff7ad8',sd:2});cy+=29;
  const bl=Math.floor(t*2)%2===0;
  ftext('MANDALO A CHI',cx,cy,w-16,2,bl?'#7dff8a':'#ffffff');cy+=19;ftext('STA SUL DIVANO',cx,cy,w-16,2,bl?'#7dff8a':'#ffffff');cy+=21;
  ftext('@2DEEPLIVEMUSIC',cx,cy,w-16,2,'#5fe0ff');
}

/* ---------------- master render: logical scene, then copy to the output ---------------- */
function render(t){
  t=clamp(t,0,DUR-1e-4);
  const E=EV.end;let src,vx=0,vy=0,vw,vh;
  if(t<E.t0){useView(false);
    if(t<EV.sel.t0){menuScene(t);if(t>EV.menu.out)wipe((t-EV.menu.out)/(EV.sel.t0-EV.menu.out));}
    else if(t<EV.stage.t0){selectScene(t);if(t<EV.sel.t0+0.15)wipe(1-(t-EV.sel.t0)/0.15);if(t>EV.sel.out)wipe((t-EV.sel.out)/(EV.stage.t0-EV.sel.out));}
    else if(t<EV.boss.t0){stageScene(t);if(t<EV.stage.t0+0.15)wipe(1-(t-EV.stage.t0)/0.15);}
    else bossScene(t);
    src=LG;vw=W;vh=H;}
  else{useView(true);const L=LAY();endScene(t);const zu=clamp((t-E.zoom[0])/(E.zoom[1]-E.zoom[0])),ze=zu*zu*(3-2*zu),nw=LG.width,nh=LG.height;
    vw=nw+(W-nw)*ze;vh=nh+(H-nh)*ze;vx=L.vx0*(1-ze);vy=L.vy0*(1-ze);src=LGW;}
  OUTX.imageSmoothingEnabled=false;OUTX.drawImage(src,vx,vy,vw,vh,0,0,cv.width,cv.height);
  useView(false);
}
/* what the shared player/renderer needs to know about this scene */
const VIDEO_NAME='2Deep_Monkeys_14nov',COVER_T=29.5,AUDIO_KEY=()=>'';
window.__render=render;window.__DUR=DUR;window.__setFormat=setFormat;
