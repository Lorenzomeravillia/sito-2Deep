/* ---------------- shared helpers (same behaviour as the "Prossimi livelli" engine) ---------------- */
const clean=s=>[...String(s==null?'':s).toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[’‘`´]/g,"'").replace(/\s+/g,' ')].filter(ch=>FONT[ch]).join('').trim();
const STEPS={3:[[3,3],[2,3],[2,2],[1,2],[1,1]],2:[[2,2],[1,2],[1,1]],1:[[1,1]]};
function fitTxt(s,maxW,sc){const st=STEPS[sc];for(const c of st)if(tw(s)*c[0]<=maxW)return{s,sc:c,step:st.indexOf(c)};
  const c=st[st.length-1];while(s.length>1&&tw(s+'.')*c[0]>maxW)s=s.slice(0,-1);return{s:s.trimEnd()+'.',sc:c,step:-1};}
function starBurst(cx,cy,ro,ri,n,col,rot){const pts=[];for(let k=0;k<n*2;k++){const a=(rot||0)+k*Math.PI/n,r=k%2?ri:ro;pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}
  ctx.fillStyle=col;for(let y=Math.floor(cy-ro);y<=Math.ceil(cy+ro);y++)for(let x=Math.floor(cx-ro);x<=Math.ceil(cx+ro);x++){let ins=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const[xi,yi]=pts[i],[xj,yj]=pts[j];if(((yi>y+0.5)!==(yj>y+0.5))&&(x+0.5<(xj-xi)*(y+0.5-yi)/(yj-yi)+xi))ins=!ins;}if(ins)ctx.fillRect(x,y,1,1);}}
function glow(cx,cy,r,col,d){ctx.fillStyle=col;for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){const q=(x*x+y*y)/(r*r);if(q<=1&&bay(cx+x,cy+y)<d*(1-q))ctx.fillRect(cx+x,cy+y,1,1);}}
function disc(cx,cy,r,col){ctx.fillStyle=col;for(let y=-r;y<=r;y++){const dx=Math.round(Math.sqrt(r*r-y*y));ctx.fillRect(cx-dx,cy+y,dx*2+1,1);}}
function flashScreen(a,c){if(a<=0)return;ctx.globalAlpha=Math.min(1,a);rr(0,0,W,H,c||'#ffffff');ctx.globalAlpha=1;}
function sparks(cx,cy,a,n,rad){for(let k=0;k<n;k++){const an=k*2*Math.PI/n+0.4,r=a*rad;ctx.drawImage(SPARK,Math.round(cx+Math.cos(an)*r-2),Math.round(cy+Math.sin(an)*r-2));}}
function flipX(c){const f=mk(c.width,c.height),g=f.getContext('2d');g.translate(c.width,0);g.scale(-1,1);g.drawImage(c,0,0);return f;}
const BIGNOTE=['#ffe03a','#ff7ad8','#5fe0ff','#7dff8a'].map(c=>sprite(["....##....","....###...","....#.##..","....#..##.","....#...#.","....#.....","....#.....",".####.....","#####.....","####W.....",".###......"],{'#':c,W:'#ffffff'},OUTC));
const SPR={lor:[0,1,2].map(buildLor),kat:[0,1,2].map(buildKat)};
const INK='#120a2a';
/* outlined text with optional drop shadow, x is the centre */
function ctext(s,cx,y,sc,col,o={}){const sx=Array.isArray(sc)?sc[0]:sc;dt(s,Math.round(cx-tw(s)*sx/2),y,sc,col,{outline:o.outline===undefined?INK:o.outline,shadow:o.shadow,sd:o.sd});}
function ftext(s,cx,y,maxW,sc,col,o){const f=fitTxt(s,maxW,sc);ctext(f.s,cx,y+Math.round(3.5*((Array.isArray(sc)?sc[1]:sc)-f.sc[1])),f.sc,col,o);return f;}

/* ---------------- the monkey: original mascot of the night (big head, long curly tail, bartender bow tie) ---------------- */
const MC={F:'#6e4220',Fl:'#94603a',Fd:'#4a2a14',M:'#f0c8a0',L:'#fae2c8',e:'#140c1c',w:'#ffffff',m:'#5a2214',E:'#e8a08a',R:'#e0303a',Rd:'#9a1a24',W:'#f4f0ea',ch:'#f08a8a'};
function buildMonkey(f){
  /* f: 0 stand, 1/2 walk, 3 arms up (cheer), 4 spin pose */
  const P=new PG(34,40),c=MC,sw=[0,1,-1,0,0][f];
  /* tail behind: thick curl ending in a spiral */
  const tail=[[12,31],[8,32],[4,30],[2,26],[2,21],[3+sw,16],[6+sw,12],[9+sw,11],[11+sw,13],[10+sw,16],[7+sw,16]];
  for(let i=1;i<tail.length;i++)P.ln(tail[i-1][0],tail[i-1][1],tail[i][0],tail[i][1],c.F,2);
  for(let i=1;i<5;i++)P.ln(tail[i-1][0],tail[i-1][1]-1,tail[i][0],tail[i][1]-1,c.Fl,1);
  /* legs and feet */
  const lift=f===1?[2,0]:f===2?[0,2]:[0,0];
  [[13,lift[0]],[19,lift[1]]].forEach(([x,l])=>{P.r(x,32-l,3,5,c.F);P.r(x-1,37-l,5,2,c.M);P.r(x-1,38-l,5,1,'#c89a74');});
  /* body + belly + collar + bow tie */
  P.el(16.5,27,6.5,6.5,c.F);P.el(17.5,28,4,4.5,c.M);
  P.r(13,21,8,2,c.W);P.r(15,22,4,2,c.R);P.p(14,22,c.R);P.p(19,22,c.R);P.p(14,23,c.Rd);P.p(19,23,c.Rd);P.p(16,22,c.Rd);P.p(17,22,c.Rd);
  /* arms */
  if(f===3){P.ln(12,24,8,16,c.F,2);P.ln(22,24,26,16,c.F,2);P.r(7,14,3,3,c.M);P.r(25,14,3,3,c.M);}
  else if(f===4){P.ln(12,24,6,24,c.F,2);P.ln(22,24,28,24,c.F,2);P.r(4,23,3,3,c.M);P.r(28,23,3,3,c.M);}
  else{const s=f===1?1:f===2?-1:0;P.ln(12,24,10,29+s,c.F,2);P.ln(22,24,24,29-s,c.F,2);P.r(9,29+s,3,3,c.M);P.r(23,29-s,3,3,c.M);}
  /* ears */
  P.el(5,12,3.5,4,c.F);P.el(5,12,1.8,2.4,c.E);P.el(29,12,3.5,4,c.F);P.el(29,12,1.8,2.4,c.E);
  /* big head */
  P.el(17,11,11,10,c.F);P.el(13,5,5,2.2,c.Fl);P.p(17,1,c.Fd);P.p(18,0,c.Fd);P.p(19,1,c.Fd);
  /* face mask: two eye lobes + muzzle area */
  P.el(19,14,7.5,6.5,c.M);P.el(15.5,10,3.6,3.6,c.M);P.el(22.5,10,3.6,3.6,c.M);
  P.el(20,16,5.5,3.2,c.L);
  /* eyes */
  P.r(15,9,3,4,c.e);P.r(22,9,3,4,c.e);P.p(15,9,c.w);P.p(22,9,c.w);P.p(16,10,c.w);P.p(23,10,c.w);
  P.r(14,7,4,1,c.Fd);P.r(21,7,4,1,c.Fd);
  /* nose, smile, blush */
  P.p(19,14,c.m);P.p(21,14,c.m);P.ln(16,17,24,17,c.m);P.p(15,16,c.m);P.p(25,16,c.m);P.r(18,18,4,1,'#c8505a');
  P.p(13,15,c.ch);P.p(14,15,c.ch);P.p(26,15,c.ch);P.p(27,15,c.ch);
  return P.canvas(OUTC);
}
const MONK_SPR=[0,1,2,3,4].map(buildMonkey);

/* ---------------- enemies: the things that keep people home on a Saturday night ---------------- */
/* NOIA: a grey yawning cloud; converted: a pink party cloud */
function buildCloud(happy,frame){
  const P=new PG(30,24),body=happy?'#ffb6e6':'#9a9ab8',top=happy?'#ffe0f6':'#c8c8dc',sh=happy?'#e07ac0':'#6e6e8c';
  [[8,13,7,6],[15,9,8,7],[22,13,7,6],[15,15,12,6]].forEach(([x,y,a,b])=>P.el(x,y,a,b,body));
  P.el(13,6,4,2,top);P.el(7,10,3,2,top);P.el(22,9,3,2,top);
  for(let x=4;x<27;x++)P.p(x,20,sh);for(let x=6;x<25;x++)P.p(x,21,sh);
  if(happy){/* closed happy eyes ^ ^ and a big smile */
    [[10,11],[18,11]].forEach(([x,y])=>{P.p(x,y+1,'#2a1430');P.p(x+1,y,'#2a1430');P.p(x+2,y,'#2a1430');P.p(x+3,y+1,'#2a1430');});
    P.el(15,16,3.5,2.2,'#7a1a40');P.r(13,15,5,1,'#ffffff');P.p(9,14,'#ff7aa0');P.p(21,14,'#ff7aa0');
  }else{/* droopy half-closed eyes and a huge yawn */
    [[9,11],[18,11]].forEach(([x,y])=>{P.r(x,y,4,1,'#2a2a3a');P.r(x,y+1,4,1,'#ffffff');P.r(x+1,y+1,2,1,'#2a2a3a');});
    P.el(15,16,2.6,3.4+(frame?0.6:0),'#3a1a2a');P.el(15,18,1.6,1.2,'#e8708a');
  }
  return P.canvas(OUTC);
}
const CLOUD={sad:[0,1].map(f=>buildCloud(false,f)),happy:buildCloud(true,0)};
/* PANTOFOLA: one fluffy pink slipper with googly eyes; drawn in pairs */
function buildSlipper(happy){
  /* facing right (toe on the right); flipped when it walks left */
  const P=new PG(30,17),pink='#ff86b8',pl='#ffc2dc',pd='#c8508a',sole='#f2e2cc';
  P.r(1,13,27,2,sole);P.r(2,15,25,1,'#b8a48c');
  P.el(19,9,9.5,5.5,pink);P.r(2,9,14,5,pink);P.r(2,9,14,1,pl);
  P.el(7,10,4.5,2.2,'#7a2048');P.el(7,10,3,1.2,'#4a1030');
  for(let k=0;k<20;k++){const x=11+((k*7)%15),y=5+((k*3)%7);P.p(x,y,pl);}
  for(let x=10;x<28;x++)P.p(x,13,pd);
  P.el(26,7,3.2,3.2,'#ffffff');P.p(25,6,'#ffe0ee');P.p(27,8,'#e8d0de');
  [[14,3],[20,3]].forEach(([x,y])=>{P.el(x,y+1,2.6,2.6,'#ffffff');if(happy){P.p(x-1,y,'#140c1c');P.p(x,y-1,'#140c1c');P.p(x+1,y,'#140c1c');}else{P.r(x,y+1,2,2,'#140c1c');}});
  if(!happy){P.ln(11,0,15,2,'#4a1030');P.ln(23,0,19,2,'#4a1030');}
  else{P.r(15,8,5,1,'#7a2048');P.p(14,7,'#7a2048');P.p(20,7,'#7a2048');}
  return P.canvas(OUTC);
}
const SLIP={sad:buildSlipper(false),happy:buildSlipper(true)};
/* TELECOMANDO: a grumpy remote control; converted: its buttons turn into disco lights */
function buildRemote(happy,ph){
  const P=new PG(14,32),b='#26263a',bl='#4a4a66',bd='#14141e';
  P.r(1,2,12,29,b);P.r(2,1,10,1,b);P.r(2,31,10,1,b);P.r(1,2,1,29,bl);P.r(12,3,1,28,bd);
  P.el(7,5,2,2,'#e8384a');P.p(6,4,'#ff9aa2');
  /* eyes */
  P.r(3,9,3,3,'#ffffff');P.r(8,9,3,3,'#ffffff');
  if(happy){P.p(4,9,'#140c1c');P.p(9,9,'#140c1c');P.r(4,13,6,1,'#ff9ad0');}
  else{P.p(5,11,'#140c1c');P.p(10,11,'#140c1c');P.ln(3,8,6,9,'#ffffff');P.ln(11,8,8,9,'#ffffff');P.r(5,13,4,1,'#8a8aa8');}
  const pal=['#ff4a5a','#ffe03a','#5ae06a','#5fe0ff','#ff7ad8','#ffffff'];
  for(let r=0;r<4;r++)for(let k=0;k<3;k++){const x=3+k*3,y=16+r*3;P.r(x,y,2,2,happy?pal[(r*3+k+ph)%6]:'#8a8aa8');}
  [['#e8384a',3],['#5ae06a',6],['#ffe03a',9]].forEach(([c,x],i)=>P.r(x,28,2,1,happy?pal[(i+ph+2)%6]:c));
  return P.canvas(OUTC);
}
const REMOTE={sad:buildRemote(false,0),happy:[0,1,2,3,4,5].map(p=>buildRemote(true,p))};

/* ---------------- boss: RE DIVANO, a red sofa wearing a crown ---------------- */
function buildSofa(happy){
  const P=new PG(104,58),R='#c43440',Rl='#e2606a',Rd='#8a1e2a',Rs='#5a1018',wood='#6a3a1a';
  /* backrest + two back cushions */
  P.r(10,8,84,24,R);P.r(12,6,80,2,R);P.r(12,6,80,1,Rl);
  [[14,50],[54,90]].forEach(([a,b])=>{P.r(a,10,b-a,21,R);P.r(a,10,b-a,1,Rl);P.r(a,10,1,21,Rl);P.r(b-1,10,1,21,Rd);P.r(a,30,b-a,1,Rd);});
  P.r(51,9,3,23,Rs);
  /* buttons on the cushions */
  [[24,24],[40,24],[64,24],[80,24]].forEach(([x,y])=>{P.p(x,y,Rs);P.p(x+1,y,Rd);});
  /* armrests with rolled tops */
  [[8,1],[95,-1]].forEach(([cx,dir])=>{P.r(cx-8,20,17,30,R);P.el(cx,20,8.5,5.5,R);P.el(cx-dir*2,19,4,2.2,Rl);P.r(cx-8,46,17,4,Rd);P.r(cx+dir*7-(dir>0?0:1),22,2,26,Rd);});
  /* seat cushions */
  P.r(16,31,72,11,R);P.r(16,31,72,2,Rl);P.r(51,31,2,11,Rs);P.r(16,41,72,1,Rd);
  /* base + legs */
  P.r(4,42,96,8,Rd);P.r(4,42,96,1,R);P.r(4,49,96,1,Rs);
  [10,24,78,92].forEach(x=>{P.r(x,50,3,6,wood);P.p(x,50,'#9a5a2a');});
  /* face on the backrest */
  if(happy){
    [[32,18],[72,18]].forEach(([x,y])=>{for(let k=-5;k<=5;k++){const yy=y-Math.round(Math.sqrt(25-k*k)*0.6);P.p(x+k,yy,'#2a0a10');P.p(x+k,yy+1,'#2a0a10');}});
    P.el(22,25,3,1.6,'#ff8a9a');P.el(82,25,3,1.6,'#ff8a9a');
    P.el(52,45,14,3,'#2a0a10');P.r(42,43,21,1,'#ffffff');
  }else{
    [[32,19],[72,19]].forEach(([x,y],i)=>{P.el(x,y,6.5,5,'#ffffff');P.el(x+(i?-2:-2),y+1,2.6,2.6,'#140c1c');P.p(x-3,y,'#ffffff');});
    P.ln(23,10,39,15,'#3a0a10',3);P.ln(81,10,65,15,'#3a0a10',3);
    for(let x=40;x<=64;x++)P.p(x,47-((x>>1)%2),'#2a0a10');for(let x=42;x<=62;x+=4){P.p(x,45,'#ffffff');P.p(x+1,45,'#ffffff');}
  }
  return P.canvas(OUTC);
}
const SOFA={angry:buildSofa(false),happy:buildSofa(true)};
const CROWN=sprite(["..#.....#.....#..","..##...###...##..",".####.#####.####.","#################","#rr##bb###bb##rr#","#################",".###############."],{'#':'#ffd34a',r:'#e8384a',b:'#5fc8ff'},OUTC);
const PILLOW=sprite([".#..........#.","##########.##.","#PPPPPPPPPP##.","#PpPPPPPPPP#..","#PPPPPPPPPP#..","#PPPPPPPPpP#..","##########.##.",".#..........#."],{'#':'#8a1e2a',P:'#e2606a',p:'#ffb0b8'},OUTC);
/* menu icons */
const SOFA_ICON=(()=>{const c=mk(40,24),g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(SOFA.angry,0,0,104,58,0,0,40,22);return c;})();
const ZZZ=sprite(["####.","...#.","..#..",".#...","####."],{'#':'#c8c8ff'},OUTC);

/* ---------------- Monkey's Bar facade (end of the stage): static part; neon tubes are drawn live ---------------- */
function buildBar(){
  const Wd=164,Hd=112,c=mk(Wd,Hd),P=new PG(Wd,Hd),wall='#7a4422',wd='#5a2e16',wl='#9a5a2e';
  /* roof board that holds the neon */
  P.r(10,0,144,30,'#1a1024');P.r(10,0,144,1,'#3a2a4a');P.r(10,29,144,1,'#0a0612');
  for(let x=14;x<150;x+=34){P.r(x,30,2,10,'#2a2a3a');}
  /* wooden wall */
  P.r(6,40,152,72,wall);for(let y=43;y<Hd;y+=5)P.r(6,y,152,1,wd);
  for(let k=0;k<26;k++){const x=8+((k*37)%146),y=44+((k*13)%13)*5;P.r(x,y,1,3,wd);}
  P.r(6,40,3,72,'#4a2410');P.r(155,40,3,72,'#4a2410');
  /* striped awning */
  for(let x=2;x<162;x++){const st=Math.floor((x-2)/6)%2?'#f0e6dc':'#d6303a';P.r(x,46,1,10,st);if(((x-2)%6)<3)P.p(x,56,st);}
  P.r(2,45,160,1,'#7a1820');
  /* windows */
  [[18,64,40,26],[106,64,40,26]].forEach(([x,y,w,h])=>{P.r(x-2,y-2,w+4,h+4,'#3a1c0c');P.r(x,y,w,h,'#ffcf4a');P.r(x,y,w,3,'#fff0a0');P.r(x+(w>>1),y,2,h,'#3a1c0c');P.r(x,y+(h>>1),w,2,'#3a1c0c');
    /* people inside */
    for(let k=0;k<3;k++){const px=x+5+k*12,py=y+h-12;P.el(px+3,py+2,3,3,'#7a3a1a');P.r(px,py+5,7,7,['#3a6ae0','#e0507a','#5ac86a'][k]);}});
  /* open door with light */
  P.r(66,62,32,50,'#3a1c0c');P.r(69,65,26,47,'#ffe08a');P.r(69,65,26,4,'#fff6c8');
  /* step + ground */
  P.r(60,108,44,4,'#5a5a72');
  return P.canvas();
}
const BARIMG=buildBar();
const BAR_NEON={on:neon(textRows("MONKEY'S"),'#ff5fd8','#5c1a50','#ffc6f2'),off:neon(textRows("MONKEY'S"),'#46163f',null)};
