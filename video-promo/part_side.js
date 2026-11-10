/* ---------------- closing screen: side-scrolling level start inside the venue ---------------- */
/* The venue is one long strip (IW x IH). The camera follows the duo and, as they reach the stage, eases until the
   band sits about two thirds across the frame. Everything is a pure function of the closing's local time, so the
   MP4 render and the live preview always match. */
const IW=760,IH=176,FEET=158,STAGEY=138,CL=DUR-T.close;
const SIDE={walk:[0.4,4.4],hop:[4.4,4.8],play:4.8,cta:6.0,x0:40,x1:556,xs:616};
const BEAT=0.4;
function trap(k,a,b){k=clamp(k);const v=1/(1-a/2-b/2);if(k<a)return v*k*k/(2*a);if(k<=1-b)return v*(a/2+(k-a));const r=1-k;return 1-v*r*r/(2*b);}
function duoAt(t){
  const[a,b]=SIDE.walk;if(t<a)return{x:SIDE.x0,y:FEET,walk:false};
  if(t<b)return{x:SIDE.x0+(SIDE.x1-SIDE.x0)*trap((t-a)/(b-a),0.12,0.1),y:FEET,walk:true};
  const[h0,h1]=SIDE.hop;if(t<h1){const p=(t-h0)/(h1-h0);return{x:SIDE.x1+(SIDE.xs-SIDE.x1)*p,y:FEET+(STAGEY-FEET)*p-Math.round(18*Math.sin(Math.PI*p)),walk:false};}
  return{x:SIDE.xs,y:STAGEY,walk:false,play:true};
}
function tAt(x){let lo=SIDE.walk[0],hi=SIDE.walk[1];for(let i=0;i<32;i++){const m=(lo+hi)/2;if(duoAt(m).x<x)lo=m;else hi=m;}return(lo+hi)/2;}
/* camera: leads the duo while walking, then eases so the stage ends up framed with the band at 2/3 */
function camFor(t,x){const k=clamp((t-(SIDE.walk[1]-1.2))/(SIDE.hop[1]-(SIDE.walk[1]-1.2))),e=k*k*(3-2*k),lead=W*(0.42+(2/3-0.42)*e);return clamp(Math.round(x-lead),0,IW-W);}
const party=t=>t>=SIDE.play;
const hopOf=(t,ph)=>party(t)?Math.round(Math.abs(Math.sin(Math.PI*((t-SIDE.play)/BEAT+ph)))*5):0;
/* things that happen on the way to the stage; the soundtrack schedules its effects from the same list */
const NOTEX=[88,130,168,252,292,332,372,412,462,506];
const WAITER=t=>520-70*t;
let EV=null;
function sideEvents(){
  if(EV)return EV;
  let lo=SIDE.walk[0],hi=SIDE.walk[1];for(let i=0;i<32;i++){const m=(lo+hi)/2;if(duoAt(m).x+10<WAITER(m))lo=m;else hi=m;}
  EV={notes:NOTEX.map(x=>tAt(x-4)),bang:tAt(74),cin:tAt(170),neon:tAt(222),spritz:(lo+hi)/2,flash:tAt(504),land:SIDE.hop[1]};
  return EV;
}
/* people: 16x38 sprites facing right, feet on the bottom row; sitting ones bring their own chair */
function person(o,pose){
  const P=new PG(16,38),S=o.skin,sit=pose==='sit'||pose==='toast',hy=sit?6:0,r=(x,y,w,h,c)=>P.r(x,y+2,w,h,c),p=(x,y,c)=>P.p(x,y+2,c);
  if(sit){r(1,12,1,24,'#5a3420');r(1,25,10,2,'#6e4024');r(9,27,1,9,'#5a3420');r(3,27,1,9,'#4a2a18');r(3,23,11,3,o.pants);r(11,26,3,8,o.pants);r(11,34,4,2,'#1c1c24');}
  else{r(4,20,6,2,o.pants);r(4,22,2,12,o.pants);r(8,22,2,12,o.pants);r(3,34,4,2,'#1c1c24');r(7,34,4,2,'#1c1c24');}
  r(3,9+hy,8,sit?9:11,o.shirt);r(3,9+hy,1,sit?9:11,o.shirtL);
  r(4,2+hy,6,6,S);r(3,1+hy,8,3,o.hair);r(4,hy,6,1,o.hair);if(o.long){r(3,3+hy,1,6,o.hair);r(10,3+hy,1,6,o.hair);}else{p(3,4+hy,o.hair);p(10,4+hy,o.hair);}
  p(5,4+hy,'#140c1c');p(8,4+hy,'#140c1c');r(6,6+hy,2,1,'#8a2a3a');if(pose==='cheer'){p(5,6+hy,'#8a2a3a');p(8,6+hy,'#8a2a3a');}r(6,8+hy,2,1,S);
  if(pose==='cheer'){r(1,1,2,9,o.shirt);r(11,1,2,9,o.shirt);r(1,0,2,1,S);r(11,0,2,1,S);}
  else if(pose==='phone'){r(1,10,2,8,o.shirt);r(1,18,2,1,S);r(11,3,2,7,o.shirt);r(11,2,2,1,S);r(10,-2,4,4,'#1c1c24');r(11,-1,2,2,'#d8f4ff');}
  else if(pose==='sit'){r(11,17,3,2,o.shirt);r(14,17,1,2,S);}
  else if(pose==='toast'){r(11,10,2,6,o.shirt);r(11,9,2,1,S);r(11,6,2,3,o.drink);p(11,6,'#ffffff');}
  return P.canvas(OUTC);
}
function flipX(c){const f=mk(c.width,c.height),g=f.getContext('2d');g.translate(c.width,0);g.scale(-1,1);g.drawImage(c,0,0);return f;}
function waiter(leg,glasses){
  const P=new PG(16,32),S='#f2b48c',r=(x,y,w,h,c)=>P.r(x,y+2,w,h,c),p=(x,y,c)=>P.p(x,y+2,c);
  r(4,2,6,6,S);r(3,1,8,3,'#5a3218');r(4,0,6,1,'#5a3218');p(5,4,'#140c1c');p(8,4,'#140c1c');r(5,6,4,1,'#4a2814');
  r(6,8,2,1,S);r(3,9,8,9,'#f0eef8');r(5,9,4,1,'#d8303a');r(3,12,8,10,'#1c1c2c');
  const a=leg?1:0;r(4+a,22,2,6,'#1c1c2c');r(8-a,22,2,6,'#1c1c2c');r(3+a,28,4,2,'#0a0716');r(7-a,28,4,2,'#0a0716');
  r(11,9,2,4,'#f0eef8');r(11,6,2,3,S);r(9,5,7,1,'#c8c8dc');
  [[10,1],[13,1]].slice(0,glasses).forEach(([x,y])=>{r(x,y+1,2,3,'#ff7a1a');p(x,y,'#ffffff');p(x+1,y+1,'#ffc070');});
  return P.canvas(OUTC);
}
const BARMAP={h:'#2a1a12',S:'#f2b48c',s:'#c47e58',e:'#140c1c',m:'#4a2814',W:'#f0eef8',r:'#d8303a',V:'#1c1c2c',g:'#9ad8ff'};
const BARMAN=sprite(["............","............","...hhhh.....","..hhhhhh....","..hSSSSh....","..SeSSeS....","..SSssSS....","..SmmmmS....","...SSSS.....",".WWrrrrWW...","WWVWrrWVWW..","WVVWWWWVVW..","WVVWWWWVVWSg","WVVWWWWVVSSg","WVVWWWWVV.gg"],BARMAP,OUTC);
const BARMANW=sprite([".........SS.",".........WW.","...hhhh..WW.","..hhhhhh.WW.","..hSSSSh.WW.","..SeSSeS.WW.","..SSssSSWW..","..SmmmmS....","...SSSS.....",".WWrrrrWW...","WWVWrrWVW...","WVVWWWWVV...","WVVWWWWVV...","WVVWWWWVV...","WVVWWWWVV..."],BARMAP,OUTC);
const HEARTROWS=[".##.##.","#######","#######",".#####.","..###..","...#..."];
const HEART=sprite(HEARTROWS,{'#':'#ff4a7a'},OUTC);
const HEARTS=['#ff4a7a','#ff7ad8','#ffe03a','#5fe0ff'].map(c=>sprite(HEARTROWS,{'#':c},OUTC));
const GOHAND=sprite(["....#.......","....##......","#######.....","########....","#########...","########....","#######.....","....##......","....#......."],{'#':'#ffe03a'},'#120a2a');
const BUBBLE=sprite([".#######.","#WWWWWWW#","#WWWrWWW#","#WWWrWWW#","#WWWrWWW#","#WWWWWWW#","#WWWrWWW#","#WWWWWWW#",".###.###.","....#...."],{'#':'#120a2a',W:'#ffffff',r:'#e8384a'});
/* collectible: a big shiny note, one per colour */
const BIGNOTE=['#ffe03a','#ff7ad8','#5fe0ff','#7dff8a'].map(c=>sprite(["....##....","....###...","....#.##..","....#..##.","....#...#.","....#.....","....#.....",".####.....","#####.....","####W.....",".###......"],{'#':c,W:'#ffffff'},OUTC));
const SPRITZ=sprite(["#.....#","#OOOOO#","#OoOOO#","#OOOOO#",".#OOO#.","..###..","...#...","...#...",".#####."],{'#':'#e8f4ff',O:'#ff7a1a',o:'#ffd090'},OUTC);
let ISET=null;
function interiorAssets(){
  if(ISET)return ISET;
  const P=new PG(IW,IH),BC=['#3ec86a','#e8a03a','#7ad0ff','#e8384a','#c8e86a','#b070ff'];
  P.r(0,0,IW,16,'#0c0716');P.r(0,14,IW,2,'#2a2438');
  for(let x=0;x<IW;x++){const pl=Math.floor(x/10);for(let y=16;y<118;y++){let c=pl%2?'#43251a':'#3a1f14';if(x%10===0)c='#24120c';if(y<34&&bay(x,y)<(34-y)/34*0.55)c='#24120c';if(y>=92)c=x%10===0?'#1a0c08':'#2a160e';P.p(x,y,c);}}
  P.r(0,92,IW,1,'#6a3e22');P.r(0,93,IW,1,'#1a0c08');
  for(let y=118;y<IH;y++){const row=Math.floor((y-118)/8),ty=(y-118)%8;for(let x=0;x<IW;x++){const col=Math.floor((x+row*6)/16);P.p(x,y,ty===0?'#140a06':((col+row)%2?'#5a3a22':'#4a2e1a'));}}
  P.r(0,118,IW,1,'#7a4a2a');
  P.r(10,40,34,78,'#120a10');P.r(13,43,28,75,'#0a1440');for(let i=0;i<9;i++)P.p(15+((i*11)%25),46+((i*17)%30),'#c8d0ff');P.r(13,96,28,22,'#1a2050');P.r(41,43,3,75,'#5a3a22');
  P.r(44,46,12,70,'#5a3420');P.r(45,47,10,68,'#6e4024');P.r(46,80,2,4,'#d8b058');
  P.r(8,118,40,4,'#7a2030');P.r(10,119,36,2,'#a03040');
  P.r(70,30,34,44,'#d8b058');P.r(72,32,30,40,'#120a2a');
  P.r(146,34,40,36,'#5a3420');P.r(148,36,36,32,'#0a1440');P.r(165,36,2,32,'#5a3420');P.r(148,51,36,2,'#5a3420');P.p(154,42,'#c8d0ff');P.p(176,40,'#ffe6a0');
  P.r(232,30,150,24,'#120a10');P.r(233,31,148,22,'#1a0f16');
  [[240,66],[240,82]].forEach(([x,y])=>{P.r(x,y,136,2,'#6a3e22');P.r(x,y+2,136,1,'#2a160e');});
  [66,82].forEach((y,row)=>{for(let x=244,k=row;x<372;x+=5,k++){const h=7+(k*5)%5,col=BC[(k*3+row)%BC.length];P.r(x,y-h+2,2,h-2,col);P.p(x,y-h,col);P.p(x,y-h+1,col);P.p(x,y-h+3,'#ffffff');}});
  P.r(228,100,160,4,'#8a5a34');P.r(228,103,160,1,'#c88a54');P.r(228,104,160,26,'#4a2a18');for(let x=232;x<388;x+=12)P.r(x,105,1,24,'#2e180c');P.r(228,128,160,2,'#1a0c08');
  P.r(250,92,3,8,'#c8c8dc');P.r(249,91,5,1,'#e8e8f0');P.r(340,95,4,5,'#7ad0ff');P.r(340,95,4,1,'#ffffff');
  [246,290,334,370].forEach(x=>{P.r(x,132,10,3,'#8a2a3a');P.r(x+4,135,2,16,'#3a3a48');P.r(x+1,150,8,2,'#3a3a48');});
  [[400,40,'#5fe0ff'],[436,48,'#ff7ad8'],[470,38,'#7dff8a']].forEach(([x,y,c])=>{P.r(x,y,22,18,'#d8b058');P.r(x+2,y+2,18,14,'#1a1030');P.r(x+5,y+9,12,5,c);});
  P.r(520,138,240,6,'#7a4a2a');P.r(520,138,240,1,'#c88a54');P.r(520,144,240,10,'#3a2012');P.r(520,153,240,1,'#ffe03a');
  P.r(660,112,20,26,'#1c1c24');P.r(661,113,18,24,'#2c2c38');for(let y=116;y<134;y+=2)P.r(663,y,14,1,'#141418');P.r(661,113,18,2,'#d8b058');
  P.r(700,118,16,20,'#1c1c24');P.r(701,119,14,18,'#2c2c38');for(let y=122;y<134;y+=2)P.r(703,y,10,1,'#141418');
  P.r(646,100,1,38,'#9a9ab0');P.r(643,137,7,1,'#9a9ab0');P.r(645,97,3,4,'#3a3a48');
  const G=[{hair:'#26161e',skin:'#f2b48c',shirt:'#e8384a',shirtL:'#ff6a74',pants:'#2a3a6a',drink:'#ff7a1a',long:true},{hair:'#5a3218',skin:'#e0a070',shirt:'#3ec86a',shirtL:'#7ae89a',pants:'#3a2a1a',drink:'#ffe03a'},
           {hair:'#c8a040',skin:'#f2c8a0',shirt:'#5fe0ff',shirtL:'#b0f4ff',pants:'#1c1c2c',drink:'#ff7a1a',long:true},{hair:'#1a1010',skin:'#c47e58',shirt:'#b070ff',shirtL:'#d0a8ff',pants:'#2a2a3a',drink:'#ffe03a'}];
  const F=[{hair:'#3a2010',skin:'#f2b48c',shirt:'#ff7ad8',shirtL:'#ffb0e8',pants:'#2a3a6a'},{hair:'#c8a040',skin:'#e0a070',shirt:'#ffe03a',shirtL:'#fff3b0',pants:'#1c1c2c'},{hair:'#26161e',skin:'#c47e58',shirt:'#5fe0ff',shirtL:'#b0f4ff',pants:'#3a2a5a',long:true}];
  const mkSet=o=>{const s={sit:person(o,'sit'),toast:person(o,'toast'),cheer:person(o,'cheer')};return{R:s,L:{sit:flipX(s.sit),toast:flipX(s.toast),cheer:flipX(s.cheer)}};};
  ISET={bg:P.canvas(),guests:G.map(mkSet),fans:F.map(o=>({phone:person(o,'phone'),cheer:person(o,'cheer')})),
    waiter:[[waiter(0,2),waiter(1,2)],[waiter(0,1),waiter(1,1)]],
    face:{k:sprite(KHEAD,KHMAP,OUTC),l:sprite(LHEAD,LHMAP,OUTC)},
    live:neon(textRows('LIVE'),'#ff4a5a','#5a1420','#ffd0d0'),liveOff:neon(textRows('LIVE'),'#3a1018',null),
    noteN:neon(["..#.","..##","..#.",".##.","##.."],'#5fe0ff','#123e58')};
  return ISET;
}
/* ---- effects helpers: everything on whole pixels ---- */
function starBurst(cx,cy,ro,ri,n,col,rot){const pts=[];for(let k=0;k<n*2;k++){const a=(rot||0)+k*Math.PI/n,r=k%2?ri:ro;pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}
  ctx.fillStyle=col;for(let y=Math.floor(cy-ro);y<=Math.ceil(cy+ro);y++)for(let x=Math.floor(cx-ro);x<=Math.ceil(cx+ro);x++){let ins=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const[xi,yi]=pts[i],[xj,yj]=pts[j];if(((yi>y+0.5)!==(yj>y+0.5))&&(x+0.5<(xj-xi)*(y+0.5-yi)/(yj-yi)+xi))ins=!ins;}if(ins)ctx.fillRect(x,y,1,1);}}
function glow(cx,cy,r,col,d){ctx.fillStyle=col;for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){const q=(x*x+y*y)/(r*r);if(q<=1&&bay(cx+x,cy+y)<d*(1-q))ctx.fillRect(cx+x,cy+y,1,1);}}
function disc(cx,cy,r,col){ctx.fillStyle=col;for(let y=-r;y<=r;y++){const dx=Math.round(Math.sqrt(r*r-y*y));ctx.fillRect(cx-dx,cy+y,dx*2+1,1);}}
function flashScreen(a){if(a<=0)return;ctx.globalAlpha=a;rr(0,0,W,H,'#ffffff');ctx.globalAlpha=1;}
/* big pop-up text: punches in at 3x, settles at 2x, rises and blinks out; optional starburst behind */
function smallPop(s,x,y,t,t0,col){const a=t-t0;if(a<0||a>0.6)return;if(a>0.45&&Math.floor(a*20)%2)return;dt(s,Math.round(x-tw(s)/2),Math.round(y-a*18),1,a<0.06?'#ffffff':col,{outline:'#120a2a'});}
function bigPop(s,x,y,t,t0,col,burst){const a=t-t0;if(a<0||a>0.9)return;if(a>0.7&&Math.floor(a*20)%2)return;
  const sc=a<0.07?3:2,yy=Math.round(y-Math.min(a,0.6)*22),xx=Math.round(x-tw(s)*sc/2);
  if(burst&&a<0.35){const ro=Math.min(30,tw(s)*sc/2+8);starBurst(x,yy+3*sc,ro,Math.round(ro*0.62),10,burst,a*3);}
  glyphs(s,xx+2,yy+2,sc,'#120a2a');for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(Math.abs(dx)+Math.abs(dy)>=2&&(dx||dy))glyphs(s,xx+dx,yy+dy,sc,'#120a2a');
  glyphs(s,xx,yy,sc,a<0.07?'#ffffff':col);}
function sparks(cx,cy,a,n,rad){for(let k=0;k<n;k++){const an=k*2*Math.PI/n+0.4,r=a*rad;ctx.drawImage(SPARK,Math.round(cx+Math.cos(an)*r-2),Math.round(cy+Math.sin(an)*r-2));}}
function nameNeon(s,x,y,on){const rows=textRows(s);
  if(on)for(let r=0;r<7;r++)for(let i=0;i<rows[r].length;i++)if(rows[r][i]==='#'){ctx.fillStyle='#7a2468';ctx.fillRect(x+i-2,y+r,5,1);ctx.fillRect(x+i,y+r-2,1,5);}
  if(on)for(let r=0;r<7;r++)for(let i=0;i<rows[r].length;i++)if(rows[r][i]==='#'){ctx.fillStyle='#b8308f';ctx.fillRect(x+i-1,y+r,3,1);ctx.fillRect(x+i,y+r-1,1,3);}
  for(let r=0;r<7;r++)for(let i=0;i<rows[r].length;i++)if(rows[r][i]==='#'){ctx.fillStyle=on?((i+r)%4===0?'#ffffff':'#ff7ae0'):'#46163f';ctx.fillRect(x+i,y+r,1,1);}}
function table(x,y){rr(x-13,y,26,3,'#8a5a34');rr(x-13,y,26,1,'#c88a54');rr(x-12,y+3,24,1,'#3a2012');rr(x-1,y+4,3,12,'#2a160e');rr(x-7,y+15,14,2,'#2a160e');}
const WEEKDAY={LUN:'LUNEDI',MAR:'MARTEDI',MER:'MERCOLEDI',GIO:'GIOVEDI',VEN:'VENERDI',SAB:'SABATO',DOM:'DOMENICA'};
const isMonkey=L=>L.scene==='bar';
function drawInterior(t,L,camX,oy0){
  const A=interiorAssets(),E=sideEvents(),s=duoAt(t),pt=party(t),ld=t-E.land,shake=ld>0&&ld<0.18?(Math.floor(ld*40)%2?2:-2):0;
  const ox=-Math.round(camX),oy=oy0+shake;
  ctx.drawImage(A.bg,ox,oy);
  for(let i=0;i<IW/8;i++){const x=ox+4+i*8;if(x<-4||x>W+4)continue;const y=oy+9+Math.round(Math.sin((i%12)/11*Math.PI)*5),on=(i+Math.floor(t*(pt?8:4)))%3!==0;rr(x,y-1,1,1,'#2a2438');rr(x-1,y,2,2,on?['#ffe03a','#ff5fd8','#5fe0ff','#7dff8a'][i%4]:'#4a3a50');}
  ctx.drawImage(SPR.kat[0],ox+74,oy+40,11,22);ctx.drawImage(SPR.lor[0],ox+85,oy+39,15,23);dt('2DEEP',ox+75,oy+64,1,'#ffe03a');
  /* neon board: wakes up with a burst of sparks as the duo walks in front of it */
  const dn=t-E.neon,neonOn=dn>0&&(dn>0.45||[1,0,1,1,0,1,1,0][Math.floor(dn/0.056)]===1)&&!((t*0.43)%1<0.02);
  if(neonOn&&dn<1.0)glow(ox+307,oy+42,40,'#ff5fd8',0.22*(1-dn));
  if(isMonkey(L)){ctx.drawImage(neonOn?NEON.mOn:NEON.mOff,ox+236,oy+32);nameNeon(fitTxt(L.venue,112,1).s,ox+264,oy+38,neonOn);}
  else{const n=fitTxt(L.venue,120,1).s,nx=ox+307-Math.round(tw(n)/2);nameNeon(n,nx,oy+38,neonOn);if(neonOn){ctx.drawImage(A.noteN,nx-12,oy+36);ctx.drawImage(A.noteN,nx+tw(n)+5,oy+36);}}
  if(dn>0.45&&dn<0.85){sparks(ox+240,oy+31,(dn-0.45)/0.4,6,26);sparks(ox+378,oy+53,(dn-0.45)/0.4,6,26);}
  /* LIVE sign over the stage: lights up when the duo lands */
  if(pt||t>E.land-0.05){glow(ox+616,oy+73,30,'#ff4a5a',0.16);ctx.drawImage(Math.floor(t*4)%2===0&&pt?A.liveOff:A.live,ox+590,oy+64,A.live.width*2,A.live.height*2);}else ctx.drawImage(A.liveOff,ox+590,oy+64,A.live.width*2,A.live.height*2);
  /* tables: the second one toasts as the duo passes, everyone gets up and dances once the music starts */
  [[122,0,1],[200,2,3],[420,1,0]].forEach(([tx,a,b],k)=>{
    const ga=A.guests[a].R,gb=A.guests[b].L,toast=k===1&&t>E.cin-0.3&&t<E.cin+0.9,feet=oy+141;
    if(pt){ctx.drawImage(ga.cheer,ox+tx-19,feet-38-hopOf(t,k*0.5));ctx.drawImage(gb.cheer,ox+tx+3,feet-38-hopOf(t,k*0.5+0.5));table(ox+tx,oy+125);}
    else{ctx.drawImage(toast?ga.toast:ga.sit,ox+tx-17,feet-38);ctx.drawImage(toast?gb.toast:gb.sit,ox+tx+1,feet-38);table(ox+tx,oy+125);}
    rr(ox+tx-4,oy+122,2,3,'#ff7a1a');rr(ox+tx+3,oy+122,2,3,'#ffe03a');});
  const bg=t-E.bang;if(bg>0&&bg<0.9){const by=oy+74-(bg<0.1?4:0)-Math.round(Math.abs(Math.sin(bg*14))*2);glow(ox+110,by+10,16,'#ffffff',0.35);ctx.drawImage(BUBBLE,ox+101,by,BUBBLE.width*2,BUBBLE.height*2);}
  const ci=t-E.cin;if(ci>0&&ci<0.3){glow(ox+200,oy+112,20,'#fff6c0',0.5);sparks(ox+200,oy+112,ci/0.3,8,22);}
  ctx.drawImage(pt&&Math.floor(t/BEAT)%2===0?BARMANW:BARMAN,ox+310,oy+86+(pt?0:Math.floor(t*2.5)%2));
  /* waiter with spritz: one glass flies into Lorenzo's hand */
  const wx=WAITER(t);if(wx>-40){const wl=Math.floor(t*6)%2,got=t>E.spritz?1:0;ctx.drawImage(A.waiter[got][wl],ox+Math.round(wx),oy+FEET-38);}
  const sp=t-E.spritz;if(sp>0&&sp<0.4){const k=sp/0.4,x0=WAITER(E.spritz)+13,y0=FEET-38,x1=duoAt(t).x+10,y1=FEET-30,gx=ox+Math.round(x0+(x1-x0)*k),gy=oy+Math.round(y0+(y1-y0)*k-26*Math.sin(Math.PI*k));
    glow(gx+5,gy+6,14,'#ffd090',0.5);ctx.drawImage(SPRITZ,gx,gy,SPRITZ.width*2,SPRITZ.height*2);for(let j=1;j<4;j++)ctx.drawImage(SPARK,gx-j*7,gy+8+j*2);}
  /* fans near the stage: one takes a selfie as the duo passes, all of them jump once the band starts */
  [[446,1],[474,0],[498,2]].forEach(([fx,k],i)=>{const f=A.fans[k];ctx.drawImage(pt?f.cheer:(i===2?f.phone:f.cheer),ox+fx,oy+FEET-38-hopOf(t,i*0.33));});
  if(pt){const wd=WEEKDAY[(L.date||'').split(' ')[0]]||'CI VEDIAMO',sg=wd+'!',sw=tw(sg)+6,sx=ox+482-Math.round(sw/2),sy=oy+FEET-62-hopOf(t,0.33);rr(sx+Math.round(sw/2)-1,sy+11,2,14,'#8a5a34');rr(sx,sy,sw,11,'#120a2a');rr(sx+1,sy+1,sw-2,9,'#f0eef8');dt(sg,sx+3,sy+2,1,'#d8303a');}
  const fl=t-E.flash;if(fl>0&&fl<0.25){glow(ox+510,oy+FEET-36,22,'#ffffff',0.5);disc(ox+510,oy+FEET-36,Math.min(12,Math.round(4+fl*50)),'#ffffff');}
  /* music notes to collect along the way */
  E.notes.forEach((tn,i)=>{const nx=ox+NOTEX[i],ny=oy+92+Math.round(Math.sin(t*5+i)*3),a=t-tn;
    if(a<0){glow(nx,ny+1,11,['#ffe03a','#ff7ad8','#5fe0ff','#7dff8a'][i%4],0.28+0.12*Math.sin(t*10+i));ctx.drawImage(BIGNOTE[i%4],nx-5,ny-5);}
    else if(a<0.35){if(a<0.07)disc(nx,ny,7,'#ffffff');sparks(nx,ny,a/0.35,8,24);}});
  E.notes.forEach((tn,i)=>smallPop('+10',ox+NOTEX[i],oy+82,t,tn,'#ffe03a'));
  drawPair(ox+s.x,oy+s.y,s.walk,s.x*0.5,t,!!s.play,s.play?22:0);
  if(ld>0&&ld<0.35){for(let k=0;k<6;k++){const a=ld/0.35,dx=(k-2.5)*6*a*2,r=Math.round(2+a*3);if(a>0.7&&k%2)continue;disc(ox+s.x+Math.round(dx),oy+STAGEY-2-Math.round(a*4),r,'#c8b8a0');}}
  if(t>=SIDE.hop[1]-0.05){ctx.globalAlpha=0.15;for(let y=0;y<138;y++){const w0=Math.round(3+y*0.16);rr(ox+616-w0,oy+y,w0*2+1,1,'#fff6c0');}ctx.globalAlpha=1;}
  /* pop-up words on top of everything in the room */
  bigPop('CIN!',ox+200,oy+100,t,E.cin,'#ff7ad8','#ffe03a');
  bigPop('+1 SPRITZ!',ox+Math.round(s.x)+6,oy+94,t,E.spritz+0.35,'#ffe03a','#ff8a24');
  bigPop('CLICK!',ox+500,oy+FEET-60,t,E.flash,'#ffffff','#2a8aff');
}
function confetti(t,y0,y1){if(!party(t))return;const C=['#ff4a5a','#ffe03a','#5fe0ff','#7dff8a','#ff7ad8','#ffffff'];
  for(let i=0;i<90;i++){const t0=SIDE.play+(i%15)*0.05,a=t-t0;if(a<0)continue;const y=y0-6+a*(42+R(i*3.1)*40);if(y>y1)continue;
    const x=Math.round(R(i*7.7)*W+Math.sin(a*4+i)*6),flat=Math.floor(a*10+i)%2;rr(x,Math.round(y),flat?3:2,flat?2:3,C[i%C.length]);}}
function heartsUp(t,x0,yb,h){if(!party(t))return;for(let i=0;i<14;i++){const a=((t-SIDE.play)*0.9+i/14)%1,born=SIDE.play+i/14/0.9;if(t<born)continue;
  const y=Math.round(yb-a*h),x=Math.round(x0+Math.sin(a*8+i)*7+(i%3)*9);if(a>0.85&&Math.floor(t*16)%2)continue;const big=i%3===0;ctx.drawImage(HEARTS[i%4],x,y,big?18:9,big?16:8);}}
function fgCrowd(t,camX,yb,lift){const pt=party(t),fx=-Math.round(camX*1.35);
  for(let i=0;i<36;i++){const x=fx+i*30+Math.round(R(i*3.1)*12);if(x<-30||x>W+30)continue;const r=10+Math.round(R(i*5.3)*3),j=pt?Math.round(Math.abs(Math.sin(Math.PI*((t-SIDE.play)/BEAT+i*0.37)))*7):0,hy=yb+lift+Math.round(R(i*1.9)*10)-j;
    ctx.fillStyle='#0d0716';
    if(pt&&i%2===0){ctx.fillRect(x-r-1,hy-r-14,3,16);ctx.fillRect(x+r-2,hy-r-14,3,16);}
    for(let dy=-r;dy<=r;dy++){const dx=Math.round(Math.sqrt(r*r-dy*dy));ctx.fillRect(x-dx,hy+dy,dx*2+1,1);}ctx.fillRect(x-r-8,hy+r-2,2*r+17,90);
    ctx.fillStyle=['#ff5fd8','#5fe0ff','#ffe03a'][i%3];for(let dy=-r;dy<=-2;dy++){const dx=Math.round(Math.sqrt(r*r-dy*dy));ctx.fillRect(x-dx,hy+dy,1,1);ctx.fillRect(x+dx,hy+dy,1,1);}
    if(!pt&&i%4===1){const ax=x+r-2,ay=hy-26;ctx.fillStyle='#0d0716';ctx.fillRect(ax,ay+8,4,20);ctx.fillRect(ax-2,ay,8,11);ctx.fillStyle='#d8f4ff';ctx.fillRect(ax-1,ay+1,6,9);ctx.fillStyle='#ff7ad8';ctx.fillRect(ax,ay+4,4,3);}}}
function likesAt(t){const E=sideEvents();let n=80+10*E.notes.filter(x=>t>=x).length;if(party(t))n+=Math.floor(Math.min(999-n,(t-SIDE.play)*220));return Math.min(999,n);}
function likes(t,x,y){const E=sideEvents(),n=String(likesAt(t)).padStart(4,'0'),hit=E.notes.some(tn=>t>=tn&&t<tn+0.14)||(party(t)&&Math.floor(t*10)%2);
  if(hit){ctx.drawImage(HEART,x-3,y-3,14,12);dt(n,x+13,y,1,'#ffe03a',{outline:'#120a2a'});}else{ctx.drawImage(HEART,x,y);dt(n,x+11,y,1,'#ffffff',{outline:'#120a2a'});}}
function goArrow(t,x,y){if(t>SIDE.walk[1]-0.4||t<0.3||Math.floor(t*3)%2)return;ctx.drawImage(GOHAND,x+12,y);dt('GO',x-6,y+1,1,'#ffe03a',{outline:'#120a2a'});}
function sideHUD(t,y0){const A=interiorAssets();
  ctx.drawImage(A.face.k,6,y0+2);dt('1P',24,y0+3,1,'#ff7ad8',{outline:'#120a2a'});dt('KATIA',24,y0+12,1,'#ffffff',{outline:'#120a2a'});
  ctx.drawImage(A.face.l,W-24,y0+1);dt('2P',W-26-tw('2P'),y0+3,1,'#5fe0ff',{outline:'#120a2a'});dt('LORENZO',W-26-tw('LORENZO'),y0+12,1,'#ffffff',{outline:'#120a2a'});}
/* indirect call to action: the empty third-player slot of an arcade cabinet, inviting the viewer in */
function joinSlot(t,cx,y){if(Math.floor(t*2.5)%2)return;const s='3P · UNISCITI!';dt(s,Math.round(cx-tw(s)/2),y,1,'#7dff8a',{outline:'#120a2a'});}
function ctaLines(L){const tm=L.time.replace(/^ORE /,'');return{cta:CFG.cta||DEF_CTA,info:[L.date,tm?'ORE '+tm:'',L.place].filter(Boolean).join(' · '),follow:'SEGUICI @2DEEPLIVEMUSIC'};}
function sideFlashes(t){const E=sideEvents(),fl=t-E.flash,pp=t-SIDE.play;flashScreen(fl>0&&fl<0.05?0.55:fl>=0.05&&fl<0.1?0.25:0);flashScreen(pp>=0&&pp<0.06?0.4:0);}
function sideScene(t,L){
  const s=duoAt(t),C=ctaLines(L),cta=t>=SIDE.cta,ck=clamp((t-SIDE.cta)/0.2),camX=camFor(t,s.x);
  if(FMT==='landscape'){
    rr(0,0,W,H,'#05050e');drawInterior(t,L,camX,22);
    confetti(t,24,190);heartsUp(t,W-40,186,140);
    if(party(t))fgCrowd(t,camX,176,Math.round((1-clamp((t-SIDE.play)/0.3))*40));
    sideFlashes(t);
    rr(0,0,W,24,'#05050e');rr(0,23,W,1,'#ffe03a');sideHUD(t,1);
    likes(t,cx_('0000',1)-6,3);if(Math.floor(t*1.25)%2&&!party(t))joinSlot(t,W/2,13);else{const lv='LIVELLO '+L.n;dt(lv,cx_(lv,1),13,1,'#ffe03a',{outline:'#120a2a'});}
    rr(0,192,W,24,'#05050e');rr(0,192,W,1,'#ffe03a');const f=fitTxt(L.venue,150,2);dt(f.s,8,197+dy(2,f),f.sc,'#ffffff',{outline:'#120a2a'});
    dt(C.info,W-8-tw(C.info),201,1,'#5fe0ff',{outline:'#120a2a'});
    goArrow(t,W-40,46);
    if(t<0.95){const k=t<0.7?1:1-(t-0.7)/0.25,card='LIVELLO '+L.n,w=Math.round((tw(card)*3+24)*Math.min(1,k*1.4));if(k>0){rr(Math.round(W/2-w/2),66,w,40,'#120a2a');rr(Math.round(W/2-w/2)+1,67,w-2,38,'#0a0b22');rr(Math.round(W/2-w/2)+1,67,w-2,1,'#ffe03a');if(k>=1){dt(card,cx_(card,3),72,3,'#ffe03a',{shadow:'#000000'});const v=fitTxt(L.venue,w-12,1).s;dt(v,cx_(v,1),95,1,'#ffffff');}}}
    if(cta){const w=Math.round(316*Math.min(1,ck*1.3)),h=Math.round(58*ck),x=Math.round(W/2-w/2),y=34+Math.round(29-h/2);if(w>8&&h>4){rr(x,y,w,h,'#ffe03a');rr(x+1,y+1,w-2,h-2,'#7a4a12');rr(x+2,y+2,w-4,h-4,'#0a0b22');}
      if(ck>=1){const f1=fitTxt(C.cta,300,2);dt(f1.s,cx_(f1.s,f1.sc),40+dy(2,f1),f1.sc,'#ffe03a',{shadow:'#000000'});dt(C.info,cx_(C.info,1),61,1,'#ffffff');dt(C.follow,cx_(C.follow,1),74,1,'#5fe0ff');}}
  }else{
    const oy=112;
    rr(0,0,W,H,'#05050e');drawInterior(t,L,camX,oy);
    for(let y=oy+IH;y<H;y++)rr(0,y,W,1,bay(0,y)<0.5?'#1e1208':'#160d06');
    confetti(t,oy,oy+IH+40);heartsUp(t,W-36,oy+IH-4,150);
    sideFlashes(t);
    rr(0,0,W,oy,'#05050e');rr(0,oy-1,W,1,'#ffe03a');rr(0,oy+IH,W,1,'#ffe03a');
    fgCrowd(t,camX,318,0);
    sideHUD(t,6);likes(t,cx_('0000',1)-6,8);if(!party(t))joinSlot(t,W/2,19);
    if(!cta){const lv='LIVELLO '+L.n;dt(lv,cx_(lv,2),34,2,'#ffe03a',{outline:'#120a2a',shadow:'#000000'});
      const f=fitTxt(L.venue,204,3);dt(f.s,cx_(f.s,f.sc),56+dy(3,f),f.sc,'#ffffff',{outline:'#120a2a',shadow:'#c02a9a',sd:2});
      dt(C.info,cx_(C.info,1),86,1,'#5fe0ff',{outline:'#120a2a'});}
    else if(ck>0.5){const f1=fitTxt(C.cta,204,2);dt(f1.s,cx_(f1.s,f1.sc),32+dy(2,f1),f1.sc,'#ffe03a',{outline:'#120a2a',shadow:'#000000'});
      const f=fitTxt(L.venue,204,3);dt(f.s,cx_(f.s,f.sc),54+dy(3,f),f.sc,'#ffffff',{outline:'#120a2a',shadow:'#c02a9a',sd:2});
      dt(C.info,cx_(C.info,1),86,1,'#5fe0ff',{outline:'#120a2a'});}
    goArrow(t,W-40,oy+44);
    if(!cta){dt('VI ASPETTIAMO!',cx_('VI ASPETTIAMO!',2),344,2,'#ffe03a',{outline:'#120a2a',shadow:'#000000'});dt('2DEEP.IT',cx_('2DEEP.IT',2),364,2,'#ffffff',{outline:'#120a2a'});}
    else{dt('SEGUICI SU INSTAGRAM',cx_('SEGUICI SU INSTAGRAM',1),334,1,'#ffffff',{outline:'#120a2a'});const hd='@2DEEPLIVEMUSIC';dt(hd,cx_(hd,2),346,2,'#5fe0ff',{outline:'#120a2a',shadow:'#000000'});dt('2DEEP.IT',cx_('2DEEP.IT',1),366,1,'#ffe03a',{outline:'#120a2a'});}
  }
}
function closingScene(t){sideScene(t,LV[0]);if(t<0.25)blinds(1-t/0.25);if(t>CL-0.25)blinds((t-(CL-0.25))/0.25);}
