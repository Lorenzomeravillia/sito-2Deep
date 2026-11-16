/* ---------------- LIBERA: a calm Xonix ----------------
   The field is a grid of 3x3 cells. Land (1) is safe and shows the hidden poster, sea (0) is where Re Divano and his
   friends bounce, trail (2) is the line the note is drawing. Close a loop and every sea cell Re Divano cannot reach turns
   into land (his friends caught there are evicted). 75% of the field and the poster of the next gig is yours. On land nothing can touch you: stop, look, decide. */
const GIG=CFG.gig;
const TW=270,TH=480,CS=3,FX=6,FY=48,COLS=86,ROWS=139,FW=COLS*CS,FH=ROWS*CS,GOAL=0.75,BORDER=2;
/* the venue's palette (content.js), on a soft brown-black wall */
const PAL={bord:CFG.pal.bord,copper:CFG.pal.counter,black:'#120e0c',gold:CFG.pal.gold};
const C={yel:'#f2d27a',pink:'#e897c8',cyan:'#86cfdc',red:'#f0646e',white:'#f6eedf',dim:'#9a90c0'};
const grid=new Uint8Array(COLS*ROWS),at=(c,r)=>c<0||r<0||c>=COLS||r>=ROWS?1:grid[r*COLS+c];
const INNER=(COLS-2*BORDER)*(ROWS-2*BORDER);

/* ---- the poster under the sea: the dark bar, the venue in neon, the gig, colourful cocktails, the duo on stage ---- */
const POSTER=mk(FW,FH);
(function drawPoster(){const g=POSTER.getContext('2d'),sv=ctx;ctx=g;g.imageSmoothingEnabled=false;
  const B=['#1d1511','#231812','#2a1b14','#191210'];g.fillStyle=PAL.black;g.fillRect(0,0,FW,FH);
  for(let y=0,row=0;y<FH;y+=7,row++)for(let x=-(row%2)*6;x<FW;x+=12){g.fillStyle=B[(R(x*3.1+y*7.7)*4)|0];g.fillRect(x+1,y+1,11,6);}
  const shade=(y0,y1,a)=>{for(let y=y0;y<y1;y++){g.fillStyle=`rgba(138,53,64,${a*(1-(y-y0)/(y1-y0))})`;g.fillRect(0,y,FW,1);}};shade(0,150,0.35);
  /* neon */
  /* the name in neon, as big as it fits (3x, 2x or 1x) */
  const nn=neon(textRows(GIG?GIG.venue:'PROSSIMA SERATA'),CFG.pal.neon,CFG.pal.neonHalo,CFG.pal.neonHi),ns=nn.width*3<=FW-8?3:nn.width*2<=FW-8?2:1,ny=18+Math.round((3-ns)*nn.height/2);
  for(let k=0;k<3;k++){g.globalAlpha=0.18;g.drawImage(nn,Math.round(FW/2-nn.width*ns/2)-2+k*2,ny-2,nn.width*ns,nn.height*ns);}g.globalAlpha=1;
  g.drawImage(nn,Math.round(FW/2-nn.width*ns/2),ny,nn.width*ns,nn.height*ns);
  const c=(s,y,sc,col,o)=>dt(s,Math.round(FW/2-tw(s)*sc/2),y,sc,col,Object.assign({shadow:'#000000',sd:Math.max(1,sc>>1)},o||{}));
  c('2DEEP LIVE',52,2,C.pink);
  if(GIG){c(GIG.date,74,tw(GIG.date)*4<=FW-8?4:3,PAL.gold);
    /* time and place on one line: at 2x if it fits, else the place at 2x with the time under it, else everything at 1x */
    const full=GIG.time?GIG.time+' · '+GIG.place:GIG.place;
    if(tw(full)*2<=FW-8)c(full,108,2,C.white);else if(GIG.time&&tw(GIG.place)*2<=FW-8){c(GIG.place,104,2,C.white);c(GIG.time,119,1,C.white,{sd:1});}else c(full,110,1,C.white,{sd:1});}
  else{c('IN ARRIVO',74,4,PAL.gold);c('LE DATE SU 2DEEP.IT',108,2,C.white);}
  /* the duo on stage, under the date */
  const sy=222;g.fillStyle='#2a1610';g.fillRect(0,sy,FW,10);g.fillStyle='#4a2614';g.fillRect(0,sy,FW,2);
  for(let k=0;k<3;k++){const x=40+k*90;const gr=g.createRadialGradient(x,sy-50,4,x,sy-30,80);gr.addColorStop(0,'rgba(255,220,160,0.2)');gr.addColorStop(1,'rgba(255,220,160,0)');g.fillStyle=gr;g.fillRect(x-80,sy-110,160,110);}
  const kat=buildKat(1);g.drawImage(kat,72,sy-kat.height*2+4,kat.width*2,kat.height*2);
  const lb=buildLor(2,'back'),lf=buildLor(2,'front'),hg=buildHarpHi(),lx=138,ly=sy-lb.height*2+4;
  g.drawImage(lb,lx,ly,lb.width*2,lb.height*2);g.drawImage(hg,lx,ly,lb.width*2,lb.height*2);g.drawImage(lf,lx,ly,lb.width*2,lb.height*2);
  [[118,sy-92,1]].forEach(([x,y,k])=>g.drawImage(NOTES[k],x,y,12,14));
  /* the counter with the cocktails */
  const cy=262;g.fillStyle=PAL.bord;g.fillRect(0,cy,FW,8);g.fillStyle=PAL.copper;g.fillRect(0,cy+8,FW,32);g.fillStyle=PAL.black;g.fillRect(0,cy,FW,2);g.fillRect(0,cy+36,FW,4);
  for(let x=4;x<FW;x+=16){g.fillStyle=CFG.pal.grain;g.fillRect(x,cy+12,1,22);g.fillStyle=CFG.pal.grainHi;g.fillRect(x+6,cy+14,1,16);}
  g.fillStyle=PAL.gold;g.fillRect(0,cy+8,FW,1);
  const glass=(x,y,h,cols,kind)=>{const w=kind==='tall'?12:kind==='mart'?18:14;
    if(kind==='mart'){for(let i=0;i<10;i++){const half=Math.round(9-i*0.8);g.fillStyle=cols[Math.min(cols.length-1,(i/4)|0)];g.fillRect(x+9-half,y+i,half*2,1);}g.fillStyle='#d8d8e8';g.fillRect(x+8,y+10,2,9);g.fillRect(x+4,y+19,10,2);g.fillStyle='#ffe03a';g.fillRect(x+13,y-2,3,3);return;}
    const n=cols.length,lh=Math.ceil(h/n);for(let i=0;i<n;i++){g.fillStyle=cols[i];g.fillRect(x+1,y+i*lh,w-2,Math.min(lh,h-i*lh));}
    g.fillStyle='rgba(255,255,255,0.35)';g.fillRect(x+2,y+1,1,h-2);g.fillStyle='#d8d8e8';g.fillRect(x,y-2,1,h+2);g.fillRect(x+w-1,y-2,1,h+2);g.fillRect(x,y+h,w,2);
    g.fillStyle='#ff5fd8';g.fillRect(x+w-4,y-8,1,9);g.fillRect(x+w-4,y-8,4,1);};
  glass(14,cy-22,20,['#ff9a2e','#ff5f6d','#ff2e88'],'tall');glass(40,cy-20,0,['#5fe0ff','#3aa0ff','#2a6ad0'],'mart');
  glass(70,cy-16,14,['#7dff8a','#f2e24a'],'short');glass(96,cy-22,20,['#c86bff','#ff7ad8','#ffd0f0'],'tall');
  glass(122,cy-20,0,['#ffe03a','#ffb52e','#ff7a2e'],'mart');glass(152,cy-16,14,['#ff4a5a','#ff9ab0'],'short');
  glass(178,cy-22,20,['#5fe0ff','#7dff8a','#f2e24a'],'tall');glass(204,cy-20,0,['#ff7ad8','#c86bff','#6b4aff'],'mart');glass(232,cy-16,14,['#ffb52e','#ffe8a0'],'short');
  /* a small chalkboard hanging on the counter: the venue's mystery (or the band's handle), visible but not in the way */
  {const bw=184,bh=25,bx=Math.round(FW/2-bw/2),by=cy+10;g.fillStyle='#3a1f10';g.fillRect(bx-2,by-2,bw+4,bh+4);g.fillStyle='#1c2620';g.fillRect(bx,by,bw,bh);
   g.fillStyle='rgba(255,255,255,0.05)';for(let i=0;i<14;i++)g.fillRect(bx+((R(i*7.3)*bw)|0),by+((R(i*3.1+1)*bh)|0),(R(i*1.7)*14+4)|0,1);
   if(CFG.board[1]){c(CFG.board[0],by+4,1,C.yel,{sd:0,shadow:null});c(CFG.board[1],by+14,1,'#e8e4d8',{sd:0,shadow:null});}else c(CFG.board[0],by+9,1,C.yel,{sd:0,shadow:null});}
  c(CFG.tagline,cy+48,1,C.cyan,{sd:1});
  c('VIENI A SENTIRCI!',cy+66,2,C.white);
  ctx=sv;})();

/* ---- the cast ---- */
const ENEMY=(()=>{const mkI=(img,w,h,crown)=>{const c=mk(w,h+(crown?7:0)),g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(img,0,crown?7:0,w,h);if(crown)g.drawImage(CROWN,Math.round(w/2-7),0,14,7);return c;};
  return{sofa:mkI(SOFA.angry,26,15,true),slip:mkI(SLIP.sad,22,13,false),remote:mkI(REMOTE.sad,9,20,false)};})();
const PNOTE=mk(9,10);(()=>{const g=PNOTE.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(NOTES[0],0,0,9,10);})();

/* ---- state ---- */
const G={found:{},items:[],itemN:0,nextItem:7,freezeUntil:0,slowUntil:0,infoQ:[],parts:[],state:'intro',t:0,lives:3,score:0,pct:0,px:43,py:0,dx:0,dy:0,draw:false,trail:[],moveAcc:0,inv:0,pops:[],winT:0,shake:0,enemies:[]};
const SPEED=30;   /* cells per second */
let MASK=mk(COLS,ROWS),REVEAL=mk(FW,FH),COVER=mk(COLS,ROWS),EDGE=null,WAVE=null;
/* the field still to uncover, drawn once: like the art on the flipper's table, the venue, the date and the time in one colour
   just lighter than the background, readable if you look */
const FIELD=(()=>{const c=mk(FW,FH),g=c.getContext('2d'),sv=ctx;g.fillStyle='#0d1030';g.fillRect(0,0,FW,FH);
  const rows=GIG?[GIG.venue,GIG.date,GIG.time?GIG.time:'',GIG.place]:['PROSSIMA','SERATA','IN ARRIVO'];
  const lines=rows.filter(Boolean).map(s=>({s,sc:Math.max(1,Math.min(4,Math.floor((FW-36)/Math.max(1,tw(s)))))}));
  const gap=10,tot=lines.reduce((a,l)=>a+l.sc*7,0)+gap*(lines.length-1);let y=Math.round(FH/2-tot/2);ctx=g;
  for(const l of lines){dt(l.s,Math.round(FW/2-tw(l.s)*l.sc/2),y,l.sc,'#171c4d');y+=l.sc*7+gap;}ctx=sv;
  g.fillStyle='#1b2056';for(let y=4;y<FH;y+=9)for(let x=4+((y/9)%2)*4;x<FW;x+=9)g.fillRect(x,y,1,1);return c;})();
function rebuildReveal(){const m=MASK.getContext('2d'),id=m.createImageData(COLS,ROWS);for(let i=0;i<grid.length;i++)if(grid[i]===1)id.data[i*4+3]=255;m.putImageData(id,0,0);
  const r=REVEAL.getContext('2d');r.globalCompositeOperation='source-over';r.clearRect(0,0,FW,FH);r.drawImage(POSTER,0,0);r.globalCompositeOperation='destination-in';r.imageSmoothingEnabled=false;r.drawImage(MASK,0,0,FW,FH);r.globalCompositeOperation='source-over';rebuildEdge();hdClip();}
/* the edge between land and sea, drawn once per change as a cyan neon line (cached at the screen's resolution) */
function rebuildEdge(){EDGE=mk(FW*K+8*K,FH*K+8*K);const g=EDGE.getContext('2d');g.setTransform(K,0,0,K,4*K,4*K);g.beginPath();
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){if(grid[r*COLS+c]!==1)continue;const x=c*CS,y=r*CS;
    if(at(c+1,r)===0){g.moveTo(x+CS,y);g.lineTo(x+CS,y+CS);}if(at(c-1,r)===0){g.moveTo(x,y);g.lineTo(x,y+CS);}
    if(at(c,r+1)===0){g.moveTo(x,y+CS);g.lineTo(x+CS,y+CS);}if(at(c,r-1)===0){g.moveTo(x,y);g.lineTo(x+CS,y);}}
  g.lineCap='square';g.shadowColor='rgba(95,224,255,0.9)';g.shadowBlur=5*K;g.strokeStyle='rgba(95,224,255,0.55)';g.lineWidth=1.6;g.stroke();
  g.shadowBlur=0;g.strokeStyle='#d8f8ff';g.lineWidth=0.7;g.stroke();}
function landPct(){let n=0;for(let r=BORDER;r<ROWS-BORDER;r++)for(let c=BORDER;c<COLS-BORDER;c++)if(grid[r*COLS+c]===1)n++;return n/INNER;}
function newGame(){grid.fill(0);for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(r<BORDER||c<BORDER||r>=ROWS-BORDER||c>=COLS-BORDER)grid[r*COLS+c]=1;
  WAVE=null;Object.assign(G,{found:{},items:[],itemN:0,nextItem:G.t+7,freezeUntil:0,slowUntil:0,infoQ:[],nearP:null,parts:[],newBest:false,lives:3,score:0,pct:0,px:43,py:0,dx:0,dy:0,draw:false,trail:[],moveAcc:0,inv:0,pops:[],shake:0});
  const sp=46;G.enemies=[{k:'sofa',boss:true,x:FW*0.5,y:FH*0.45,vx:sp,vy:sp*0.8,r:9},{k:'slip',x:FW*0.3,y:FH*0.7,vx:sp*1.1,vy:-sp*0.7,r:7},{k:'remote',x:FW*0.72,y:FH*0.25,vx:-sp*0.9,vy:sp,r:6}];
  rebuildReveal();PANEL.hidden=true;}

/* ---- closing an area: the trail becomes land, then every sea cell no enemy can reach ---- */
function closeArea(){for(const [c,r] of G.trail)grid[r*COLS+c]=1;const reach=new Uint8Array(grid.length),st=[];
  /* as in Qix, only Re Divano keeps his side of the sea; everything else becomes land */
  for(const e of G.enemies){if(!e.boss)continue;const c=Math.floor(e.x/CS),r=Math.floor(e.y/CS),i=r*COLS+c;if(grid[i]===0&&!reach[i]){reach[i]=1;st.push(i);}}
  while(st.length){const i=st.pop(),c=i%COLS,r=(i/COLS)|0;for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){const cc=c+dc,rr=r+dr;if(cc<0||rr<0||cc>=COLS||rr>=ROWS)continue;const j=rr*COLS+cc;if(!reach[j]&&grid[j]===0){reach[j]=1;st.push(j);}}}
  /* the new cells uncover in a wave from the point where the line closed (drawWave) */
  const nw=[];for(const [c,r] of G.trail)nw.push(r*COLS+c);
  let got=G.trail.length,sx=0,sy=0;for(let i=0;i<grid.length;i++)if(grid[i]===0&&!reach[i]){grid[i]=1;got++;sx+=i%COLS;sy+=(i/COLS)|0;nw.push(i);}
  const dist=new Float32Array(nw.length);let mx=1;nw.forEach((i,k)=>{const d=Math.hypot(i%COLS-G.px,((i/COLS)|0)-G.py);dist[k]=d;if(d>mx)mx=d;});
  WAVE={cells:nw,dist,max:mx,t0:G.t,dur:Math.min(0.9,0.25+mx/150)};
  const before=G.pct;G.pct=landPct();const gain=Math.round((G.pct-before)*100);
  /* the bigger the area, the more each cell is worth: from 10% up it is a COLPO GROSSO */
  const mult=gain>=10?1+Math.floor(gain/5):1;G.score+=got*10*mult;
  const cx=got>G.trail.length?sx/(got-G.trail.length):G.px,cy=got>G.trail.length?sy/(got-G.trail.length):G.py;
  if(gain>0)pop('+'+gain+'%',FX+cx*CS,FY+cy*CS,gain>=10?C.yel:C.white,gain>=10?3:2);
  if(mult>1){pop('COLPO GROSSO! X'+mult,FX+cx*CS,FY+cy*CS+28,C.pink,2);G.shake=0.18;}
  for(let k=0;k<Math.min(30,8+gain*2);k++){const t=G.trail[(Math.random()*G.trail.length)|0];if(!t)break;const a=Math.random()*Math.PI*2,sp=30+Math.random()*60;
    G.parts.push({x:FX+t[0]*CS+1.5,y:FY+t[1]*CS+1.5,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,t:G.t+Math.random()*0.15,col:Math.random()<0.5?'#ffe8a0':'#ffffff'});}
  sfx('wave',{n:Math.min(8,2+Math.ceil(gain/3)),dur:WAVE.dur});
  /* friends caught on the claimed side are evicted */
  G.enemies=G.enemies.filter(e=>{if(e.boss)return true;const i=Math.floor(e.y/CS)*COLS+Math.floor(e.x/CS);if(grid[i]!==1)return true;G.score+=1000;pop('SFRATTATO!',FX+e.x,FY+e.y-8,C.yel,2);return false;});
  G.trail=[];G.draw=false;G.dx=G.dy=0;rebuildReveal();
  if(G.pct>=GOAL){G.state='win';G.winT=G.t;G.items=[];for(const p of POLA)if(!(p.k in G.found))G.found[p.k]=G.t;sfx('win');saveBest();return;}
  /* polaroids uncovered, products caught */
  checkPolaroids();checkItems();}

/* ---- the venue inside the game, never in the way: polaroids hidden in the poster, helpers to catch, photos at the end ----
   Texts and photos come from the venue's profile in the admin (content.js); the neutral version uses songs of the repertoire. */
/* four polaroids pinned on the poster, slightly turned (drawn in high definition by hd.js) */
const SLOTS=[{x:2,y:126,rot:-0.07},{x:198,y:126,rot:0.06},{x:4,y:344,rot:-0.05},{x:194,y:342,rot:0.05}].map(o=>Object.assign(o,{w:PW,h:PH}));
const POLA=CFG.secrets.slice(0,4).map((sc,i)=>Object.assign({k:'s'+i},SLOTS[i],sc));
function checkPolaroids(){for(const p of POLA){if(p.k in G.found)continue;let n=0,t=0;for(let r=Math.floor(p.y/CS);r<=Math.floor((p.y+p.h)/CS);r++)for(let c=Math.floor(p.x/CS);c<=Math.floor((p.x+p.w)/CS);c++){t++;if(at(c,r)===1)n++;}
  if(n/t>=0.6){G.found[p.k]=G.t;G.score+=500;info(p.cap);sfx('chime');}}}
/* products to catch: one at a time out at sea; close it inside an area and it helps you */
const ITEMSPR={birra:sprite([".wwwww...","#yyyyy#..","#yyyyy###","#yyyyy#.#","#yyyyy#.#","#yyyyy###","#yyyyy#..","#######.."],{'#':'#d8d8e8',w:'#fff6e0',y:'#f0b030'},'#0a0716'),
  vino:sprite(["#.....#","#.....#","#rrrrr#",".#rrr#.","..###..","...#...","...#...",".#####."],{'#':'#e8e8f4',r:'#b0204a'},'#0a0716'),
  caffe:sprite(["..w..w...","...w..w..","#######..","#bbbbb###","#bbbbb#.#","#bbbbb###",".#bbb#...","#########"],{'#':'#f4f0ea',w:'#c8c8d8',b:'#6a3a1a'},'#0a0716'),
  pizza:sprite(["#########","#yryyyry#",".#yyryy#.",".#yyyyy#.","..#yry#..","...#y#...","....#...."],{'#':'#c88a3a',y:'#ffd060',r:'#e8384a'},'#0a0716'),
  cuore:sprite([".##.##.","#rr#rr#","#rrrrr#","#rrrrr#",".#rrr#.","..#r#..","...#..."],{'#':'#ff8a9a',r:'#f0465a'},'#0a0716'),
  nota:sprite(["...####","...#yy#","...#..#","...#..#",".###.##","####.##",".##...."],{'#':'#ff7ad8',y:'#ffb0e8'},'#0a0716'),
  cocktail:sprite(["#########",".#ppppp#.","..#ooo#..","...#y#...","....#....","....#....","..#####.."],{'#':'#e8e8f4',p:'#ff5fd8',o:'#ff9a2e',y:'#ffe03a'},'#0a0716'),
  crescia:sprite(["...#####...",".##yyyyy##.","#yyyyyyyyy#","#rrppprrpp#","#ppwwwwwpp#",".#########."],{'#':'#c88a3a',y:'#f2d27a',r:'#e8384a',p:'#f0b0a0',w:'#f6f2f0'},'#0a0716'),
  dau:sprite(["#########","#yywwwyy#","#ywyyywy#","#yyyyywy#","#yyywwyy#","#yyywyyy#","#yyyyyyy#","#yyywyyy#","#########"],{'#':'#8a5a10',y:'#ffc838',w:'#fff6d8'},'#0a0716'),
  brioche:sprite(["..#####..",".#ooooo#.","#oo###oo#","#o#ooo#o#","#o#o#o#o#","#oo##o#o#",".#ooooo#.","..#####.."],{'#':'#8a4a1a',o:'#e0a050'},'#0a0716')};
const FXPOP={freeze:{pop:'GHIACCIO!',col:'#86cfdc'},life:{pop:"VITA IN PIU'!",col:'#f0646e'},slow:{pop:'RALLENTATI!',col:'#f2d27a'}};
/* the order they come out: first product, the mystery box, then the other two */
function spawnItem(){const k=['i0','m','i1','i2'][G.itemN++%4];
  for(let tries=0;tries<60;tries++){const c=6+((Math.random()*(COLS-12))|0),r=6+((Math.random()*(ROWS-12))|0),x=(c+0.5)*CS,y=(r+0.5)*CS;let ok=true;
    for(let rr=r-3;rr<=r+3&&ok;rr++)for(let cc=c-3;cc<=c+3;cc++)if(at(cc,rr)!==0){ok=false;break;}
    if(!ok||G.enemies.some(e=>Math.hypot(e.x-x,e.y-y)<40)||Math.hypot((G.px+0.5)*CS-x,(G.py+0.5)*CS-y)<30)continue;
    G.items.push({k,c,r,x,y,t:G.t});sfx('spawn');return;}
  G.nextItem=G.t+2;}
const itemIcon=k=>k==='m'?'dau':CFG.items[+k.slice(1)].icon;
function checkItems(){G.items=G.items.filter(it=>{if(at(it.c,it.r)!==1)return true;let k=it.k;
  /* the mystery box: a big bonus, one of the three helps at random, and the venue's mystery to ask about */
  if(k==='m'){k='i'+((Math.random()*3)|0);G.score+=1500;pop(CFG.mystery.pop,FX+it.x,FY+it.y-40,C.pink,tw(CFG.mystery.pop)*3<=TW-20?3:2);info(CFG.mystery.txt);}
  const itm=CFG.items[+k.slice(1)],f=FXPOP[itm.fx];
  if(itm.fx==='freeze')G.freezeUntil=G.t+4;else if(itm.fx==='life')G.lives=Math.min(5,G.lives+1);else G.slowUntil=G.t+8;
  G.score+=750;pop(f.pop,FX+it.x,FY+it.y-10,f.col,2);info(itm.txt);sfx('power');G.nextItem=G.t+8;return false;});}
/* a line in the top bar; it waits while you are out drawing, so you read it when you stop */
function info(txt){if(G.infoQ.length<3)G.infoQ.push({txt,left:3});}

function lose(){G.nearP=null;G.lives--;G.shake=0.35;sfx('hit');for(const [c,r] of G.trail)grid[r*COLS+c]=0;if(G.trail.length){G.px=G.trail[0][2];G.py=G.trail[0][3];}
  G.trail=[];G.draw=false;G.dx=G.dy=0;G.inv=1.2;pop(G.lives>0?'GNAM!':'',FX+G.px*CS,FY+G.py*CS-10,C.red,2);
  if(G.lives<=0){G.state='over';G.winT=G.t;sfx('over');saveBest();}}
/* personal record, kept only in this browser */
let BEST=0;try{BEST=+localStorage.getItem('libera_best')||0;}catch(e){}
function saveBest(){G.newBest=G.score>BEST;if(G.newBest){BEST=G.score;try{localStorage.setItem('libera_best',String(BEST));}catch(e){}}}

function step(){const nc=G.px+G.dx,nr=G.py+G.dy;if(nc<0||nr<0||nc>=COLS||nr>=ROWS){G.dx=G.dy=0;return;}
  const v=grid[nr*COLS+nc];
  if(v===2){G.dx=G.dy=0;return;}                       /* never into your own line */
  if(G.draw){if(v===1){G.px=nc;G.py=nr;closeArea();return;}grid[nr*COLS+nc]=2;G.trail.push([nc,nr,G.px,G.py]);}
  else if(v===0){G.draw=true;grid[nr*COLS+nc]=2;G.trail.push([nc,nr,G.px,G.py]);}
  G.px=nc;G.py=nr;}

function moveEnemies(dt){const f=G.t<G.freezeUntil?0:(G.t<G.slowUntil?0.45:1)*(1+0.5*G.pct);for(const e of G.enemies){
  for(const ax of ['x','y']){const v=ax==='x'?'vx':'vy',n=e[ax]+e[v]*dt*f,lead=n+Math.sign(e[v])*e.r*0.6,ox=ax==='x'?e.y:e.x;
    const c=Math.floor((ax==='x'?lead:ox)/CS),r=Math.floor((ax==='x'?ox:lead)/CS);if(at(c,r)===1){e[v]=-e[v];}else e[ax]=n;}
  if(G.inv>0||G.state!=='play')continue;
  /* touching the line, or the note while it is out at sea */
  const NEAR=e.r+8,rr=Math.ceil(NEAR/CS),ec=Math.floor(e.x/CS),er=Math.floor(e.y/CS);let md=1e9;
  for(let r=er-rr;r<=er+rr;r++)for(let c=ec-rr;c<=ec+rr;c++){if(at(c,r)!==2)continue;const dx=(c+0.5)*CS-e.x,dy=(r+0.5)*CS-e.y,d=dx*dx+dy*dy;if(d<md)md=d;}
  if(md<=e.r*e.r){lose();return;}
  /* brushing the line without touching it: PER UN PELO! */
  if(md<=NEAR*NEAR&&G.t-(e.near||-9)>1.5&&!G.nearP){e.near=G.t;G.nearP={t:G.t,x:FX+e.x,y:FY+e.y-14,lives:G.lives};}}}

/* ---- the pop-up words (+19%, SFRATTATO!, GHIACCIO!, IL BASSO! ...): they last long enough to read, never start together
   (a quarter of a second apart) and never sit on top of each other: a new one moves up, or down, until it is clear.
   Where it can, it sits on the dark part still to uncover, not on the poster just revealed (venue, date and time stay readable) ---- */
const POPL=1.9;
const popRise=q=>{const u=Math.min(1,Math.max(0,(G.t-q.t)/POPL));return (1-(1-u)*(1-u))*12;};
function popBox(p,y){const w=tw(p.txt)*p.sc,h=7*p.sc,hw=w/2+FX+4,x=Math.max(hw,Math.min(TW-hw,p.x));return{x,x0:x-w/2-4,x1:x+w/2+4,y0:y-3,y1:y+h+3};}
function pop(txt,x,y,col,sc){if(!txt)return;const p={txt,x,y,col,sc,t:G.t};
  const last=G.pops.reduce((m,q)=>Math.max(m,q.t),-9);if(last>G.t-0.25)p.t=last+0.25;
  const clear=yy=>{const a=popBox(p,yy);return !G.pops.some(q=>{const b=popBox(q,q.y-popRise(q)),c=popBox(q,q.y-12);
    return a.x0<b.x1&&a.x1>b.x0&&((a.y0<b.y1&&a.y1>b.y0)||(a.y0<c.y1&&a.y1>c.y0));});};
  const step=7*sc+8,lo=FY+4,hi=FY+FH-7*sc-4,y0=Math.max(lo,Math.min(hi,y)),cand=[y0];
  for(let k=1;k<=12;k++){const c=y0+(k%2?-1:1)*step*Math.ceil(k/2);if(c>=lo&&c<=hi)cand.push(c);}
  const land=yy=>{const a=popBox(p,yy);let n=0,l=0;const c0=Math.max(0,Math.floor((a.x0-FX)/CS)),c1=Math.min(COLS-1,Math.floor((a.x1-FX)/CS)),r0=Math.max(0,Math.floor((a.y0-FY)/CS)),r1=Math.min(ROWS-1,Math.floor((a.y1-FY)/CS));
    for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++){n++;if(grid[r*COLS+c]===1)l++;}return n?l/n:0;};
  const free=cand.filter(clear),ok=free.find(yy=>land(yy)<0.35)??free[0];
  /* nowhere clear: it waits, in its place, until the ones in the way have faded */
  if(ok===undefined){p.y=y0;const a=popBox(p,y0);p.t=Math.max(p.t,...G.pops.filter(q=>{const b=popBox(q,q.y-6);return a.x0<b.x1&&a.x1>b.x0&&a.y0<b.y1+12&&a.y1>b.y0-12;}).map(q=>q.t+POPL-0.3));}
  else p.y=ok;G.pops.push(p);}
function update(dt){G.t+=dt;if(G.shake>0)G.shake-=dt;if(G.inv>0)G.inv-=dt;G.pops=G.pops.filter(p=>G.t-p.t<POPL);G.parts=G.parts.filter(p=>G.t-p.t<0.8);if(AC)songLayers();{const sb=document.getElementById('songBtn'),sv=songBtnVisible();if(sb.hidden===sv){sb.hidden=!sv;if(sv)placeSongBtn();}}
  /* PER UN PELO! only once the note has survived another half second */
  if(G.nearP&&G.t-G.nearP.t>=0.5){const n=G.nearP;G.nearP=null;if(G.state==='play'&&G.lives===n.lives){G.score+=250;pop('PER UN PELO!',n.x,n.y,C.pink,1);sfx('near');}}
  if(G.infoQ.length&&!G.draw&&G.state==='play'){G.infoQ[0].left-=dt;if(G.infoQ[0].left<=0)G.infoQ.shift();}
  if(G.state==='play'){if(!G.items.length&&G.t>=G.nextItem)spawnItem();G.items=G.items.filter(it=>{if(G.t-it.t<16)return true;G.nextItem=G.t+6;return false;});}
  if(G.state==='play'||G.state==='win'||G.state==='over')moveEnemies(dt);
  if(G.state!=='play')return;
  if(G.dx||G.dy){G.moveAcc+=dt*SPEED;while(G.moveAcc>=1&&(G.dx||G.dy)&&G.state==='play'){G.moveAcc-=1;step();}}else G.moveAcc=0;}

/* ---- drawing ---- */
const OUT=cv.getContext('2d');let K=1;
function fit(){const st=document.getElementById('stage'),aw=st.clientWidth,ah=st.clientHeight,dpr=window.devicePixelRatio||1,s=Math.min(aw/TW,ah/TH);K=Math.max(1,Math.ceil(s*dpr));
  cv.width=TW*K;cv.height=TH*K;cv.style.width=Math.floor(TW*s)+'px';cv.style.height=Math.floor(TH*s)+'px';rebuildEdge();placePanel();}
function draw(){ensureHD();ctx=OUT;ctx.setTransform(K,0,0,K,0,0);ctx.imageSmoothingEnabled=false;ctx.fillStyle='#07050f';ctx.fillRect(0,0,TW,TH);
  const sh=G.shake>0?Math.round(Math.sin(G.t*90)*2):0;ctx.save();ctx.translate(sh,0);
  /* the field still to uncover: deep blue, a faint grid of dots and the gig written in large, barely visible letters */
  ctx.drawImage(FIELD,FX,FY);
  /* land shows the poster; at the end the sea washes away too */
  ctx.drawImage(REVEAL,FX,FY);drawPolaroidsHD(false);
  if(G.state==='win'||G.state==='over'){const u=Math.min(1,(G.t-G.winT-0.3)/0.9);if(u>0){ctx.globalAlpha=u;ctx.drawImage(POSTER,FX,FY);ctx.globalAlpha=1;drawPolaroidsHD(true,u);}}
  drawWave();
  if(EDGE&&G.state!=='win'&&G.state!=='over'){ctx.globalAlpha=0.8+0.2*Math.sin(G.t*3);ctx.drawImage(EDGE,FX-4,FY-4,FW+8,FH+8);ctx.globalAlpha=1;}
  /* the line being drawn: a thin neon thread that turns from gold to red the further you go out */
  if(G.trail.length){const pts=[[G.trail[0][2],G.trail[0][3]],...G.trail.map(t=>[t[0],t[1]])],risk=Math.min(1,G.trail.length/160),
      col=risk<0.5?`rgb(255,${Math.round(224-104*risk*2)},${Math.round(58+20*risk*2)})`:`rgb(255,${Math.round(120-60*(risk-0.5)*2)},${Math.round(78+10*(risk-0.5)*2)})`;
    ctx.beginPath();pts.forEach(([c,r],i)=>{const x=FX+c*CS+CS/2,y=FY+r*CS+CS/2;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.lineJoin='miter';ctx.lineCap='square';
    ctx.save();ctx.shadowColor=col;ctx.shadowBlur=(4+3*Math.sin(G.t*14))*K;ctx.strokeStyle=col;ctx.globalAlpha=0.55;ctx.lineWidth=2.4;ctx.stroke();ctx.restore();
    ctx.strokeStyle='#fff6d8';ctx.lineWidth=1;ctx.stroke();}
  /* products out at sea, with a gold halo; they blink before leaving */
  if(G.state==='play')for(const it of G.items){const age=G.t-it.t;if(age>13&&Math.floor(G.t*8)%2)continue;const x=FX+it.x,y=FY+it.y;
    if(drawObj(HD.spr[it.k],x,y+Math.sin(G.t*4)*1.5,Math.sin(G.t*2+it.c)*0.07,false,HALOS.prize))continue;const hg=ctx.createRadialGradient(x,y,2,x,y,17+Math.sin(G.t*5)*2);hg.addColorStop(0,'rgba(255,224,58,0.55)');hg.addColorStop(1,'rgba(255,224,58,0)');ctx.fillStyle=hg;ctx.fillRect(x-20,y-20,40,40);
    const im=ITEMSPR[itemIcon(it.k)],bob=Math.round(Math.sin(G.t*4)*1.5);ctx.drawImage(im,Math.round(x-im.width),Math.round(y-im.height)+bob,im.width*2,im.height*2);}
  /* enemies */
  /* at the end the enemies leave the poster; after a defeat only Re Divano stays */
  const ef=Math.max(0,1-(G.t-G.winT)/0.6),fade=e=>G.state==='win'||(G.state==='over'&&!e.boss)?ef:1;
  {const hdE=e=>HD.spr[e.k];for(const e of G.enemies){ctx.globalAlpha=fade(e);if(!ctx.globalAlpha||hdE(e))continue;const hx=FX+e.x,hy=FY+e.y,hg=ctx.createRadialGradient(hx,hy,2,hx,hy,e.r+9);hg.addColorStop(0,'rgba(255,60,80,0.32)');hg.addColorStop(1,'rgba(255,60,80,0)');ctx.fillStyle=hg;ctx.fillRect(hx-e.r-9,hy-e.r-9,2*e.r+18,2*e.r+18);}
    for(const e of G.enemies){ctx.globalAlpha=fade(e);if(!ctx.globalAlpha)continue;const flip=e.vx<0,wob=e.k==='slip'?Math.sin(G.t*7+e.r)*0.18:e.k==='remote'?Math.sin(G.t*3)*0.12:0;
      if(!drawObj(hdE(e),FX+e.x,FY+e.y,wob,flip,HALOS.enemy)){const im=ENEMY[e.k];ctx.save();ctx.translate(Math.round(FX+e.x),Math.round(FY+e.y));if(flip)ctx.scale(-1,1);ctx.drawImage(im,-Math.round(im.width/2),-Math.round(im.height/2));ctx.restore();}
      if(G.t<G.freezeUntil){ctx.fillStyle='rgba(150,220,255,0.45)';ctx.beginPath();ctx.arc(FX+e.x,FY+e.y,e.r+2,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffffff';ctx.fillRect(Math.round(FX+e.x+e.r-2),Math.round(FY+e.y-e.r),1,1);}}ctx.globalAlpha=1;}
  /* the note */
  if((G.state==='play'||G.state==='intro'||(G.state==='win'&&G.t-G.winT<0.6))&&!(G.inv>0&&Math.floor(G.t*12)%2)){const x=FX+G.px*CS+1,y=FY+G.py*CS+1;if(!drawObj(HD.spr.note,x+0.5,y-0.5,0,false,HALOS.note)){const pg=ctx.createRadialGradient(x+0.5,y+0.5,1,x+0.5,y+0.5,9+Math.sin(G.t*6));pg.addColorStop(0,'rgba(255,236,150,0.55)');pg.addColorStop(1,'rgba(255,224,58,0)');ctx.fillStyle=pg;ctx.beginPath();ctx.arc(x+0.5,y+0.5,10,0,Math.PI*2);ctx.fill();ctx.drawImage(PNOTE,x-4,y-6);}}
  for(const p of G.parts){const u=(G.t-p.t)/0.8;if(u<0)continue;ctx.globalAlpha=1-u;ctx.fillStyle=p.col;ctx.fillRect(Math.round(p.x+p.vx*u*0.8),Math.round(p.y+p.vy*u*0.8),2,2);}ctx.globalAlpha=1;
  /* pop-ups: a quick pop in, a dark backing to read them on the poster, a slow rise, a fade at the end */
  for(const p of G.pops){const age=G.t-p.t;if(age<0)continue;const y=Math.round(p.y-popRise(p)),b=popBox(p,y),a=Math.min(1,(POPL-age)/0.45),s=age<0.12?0.7+0.3*age/0.12:1;
    ctx.save();ctx.globalAlpha=Math.max(0,a);ctx.translate(b.x,y+3.5*p.sc);ctx.scale(s,s);ctx.translate(-b.x,-(y+3.5*p.sc));
    ctx.fillStyle='rgba(7,5,15,0.82)';ctx.fillRect(b.x0,b.y0,b.x1-b.x0,b.y1-b.y0);ctext(p.txt,b.x,y,p.sc,p.col);ctx.restore();}
  ctx.restore();hud();
  if(G.state==='intro')intro();else if(G.state==='win')ending(true);else if(G.state==='over')ending(false);}
/* cells not yet reached by the wave are painted as sea again; the front shines gold */
function drawWave(){if(!WAVE)return;const u=(G.t-WAVE.t0)/WAVE.dur;if(u>=1.25){WAVE=null;return;}const front=u*WAVE.max,g=COVER.getContext('2d'),id=g.createImageData(COLS,ROWS),d=id.data;
  WAVE.cells.forEach((i,k)=>{const dd=WAVE.dist[k],j=i*4;if(dd>front){d[j]=13;d[j+1]=16;d[j+2]=48;d[j+3]=255;}else if(front-dd<5){const a=1-(front-dd)/5;d[j]=255;d[j+1]=230;d[j+2]=150;d[j+3]=Math.round(200*a);}});
  g.putImageData(id,0,0);ctx.drawImage(COVER,FX,FY,FW,FH);}
function heart(x,y,on){const rows=['.##.##.','#######','#######','.#####.','..###..','...#...'];ctx.fillStyle=on?C.red:'#3a2a4a';rows.forEach((r,j)=>{for(let i=0;i<7;i++)if(r[i]==='#')ctx.fillRect(x+i,y+j,1,1);});}
function hud(){if((G.state==='win'||G.state==='over')&&G.t-G.winT>1.3){const w=G.state==='win';
    const l2=w?(GIG?'CI VEDIAMO '+GIG.when:'NUOVE DATE IN ARRIVO'):'SCONFIGGILO DAL VIVO!',s2=w&&tw(l2)*2<=TW-8?2:1;
    ctext(w?CFG.win:'PER QUESTA VOLTA HA VINTO IL DIVANO',TW/2,4,1,w?C.yel:C.red,{outline:null});ctext(l2,TW/2,s2===2?15:19,s2,C.white,{outline:null});
    ctext(CFG.endAsk,TW/2,35,1,C.pink,{outline:null});return;}
  dt(CFG.title,FX,8,1,C.pink);for(let i=0;i<Math.max(3,G.lives);i++)heart(TW-FX-8-i*10,8,i<G.lives);
  const bx=FX,by=22,bw=FW,bh=10,u=Math.min(1,G.pct/GOAL);ctx.fillStyle='#1b1636';ctx.fillRect(bx,by,bw,bh);ctx.fillStyle=u>=1?C.yel:'#ff7ad8';ctx.fillRect(bx,by,Math.round(bw*u),bh);
  ctx.strokeStyle='rgba(134,207,220,0.6)';ctx.strokeRect(bx-0.5,by-0.5,bw+1,bh+1);const s=Math.round(G.pct*100)+'% DI 75%';dt(s,Math.round(bx+bw/2-tw(s)/2),by+2,1,'#ffffff');
  const inf=G.infoQ[0];if(inf&&!G.draw&&G.state==='play'){ctext(inf.txt,TW/2,36,1,inf.left>2.75||inf.left<0.25?'#3a7f8c':C.cyan,{outline:null});return;}
  dt(fmt(G.score),FX,36,1,C.yel);const h=G.t<G.freezeUntil?'NEMICI CONGELATI':G.t<G.slowUntil?'NEMICI RALLENTATI':'SUL BORDO SEI AL SICURO';dt(h,TW-FX-tw(h),36,1,G.t<G.slowUntil||G.t<G.freezeUntil?C.cyan:'#6a5f96');}
const fmt=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
function card(y,h){ctx.fillStyle='rgba(10,7,22,0.88)';ctx.fillRect(14,y,TW-28,h);ctx.strokeStyle='rgba(232,151,200,0.8)';ctx.strokeRect(14.5,y+0.5,TW-29,h-1);}
const HELP=(()=>{const L=CFG.items.map(i=>i.label),a='CHIUDI DENTRO '+L[0]+', '+L[1],b='E '+L[2]+': TI DANNO UNA MANO.';
  return CFG.venueSet&&tw(a)<=TW-40&&tw(b)<=TW-40?[a,b]:['CHIUDI DENTRO I PREMI CHE COMPAIONO:','TI DANNO UNA MANO.'];})();
function intro(){card(110,246);ctext(CFG.title,TW/2,122,tw(CFG.title)*2<=TW-40?2:1,C.yel);
  const L=['QUI SOTTO SI NASCONDE LA LOCANDINA','DELLA PROSSIMA SERATA DEI 2DEEP.','','SCORRI IL DITO PER MUOVERE LA NOTA.','CHIUDI LE AREE PER SCOPRIRLA.','','RE DIVANO NON DEVE TOCCARE','LA TUA LINEA. SUL BORDO E SULLE','PARTI SCOPERTE SEI AL SICURO.','',...HELP,'','SCOPRI IL 75% E LA SERATA E TUA.'];
  L.forEach((s,i)=>ctext(s,TW/2,148+i*12,1,i>=6&&i<=8?C.pink:i>=10&&i<=11?C.yel:C.white,{outline:null}));
  if(Math.floor(G.t*2)%2)ctext('TOCCA PER INIZIARE',TW/2,330,1,C.cyan,{outline:null});
  if(BEST)ctext('IL TUO RECORD: '+fmt(BEST)+' · BATTILO',TW/2,366,1,C.yel,{outline:null});}
function ending(won){const u=G.t-G.winT;if(u<1.3)return;
  ctx.fillStyle='rgba(10,7,22,0.85)';ctx.fillRect(FX,FY,FW,13);ctx.fillStyle=`rgba(18,14,12,${Math.min(0.92,(u-1.3)*3)})`;ctx.fillRect(FX,FY+302,FW,FH-302);const rs=G.newBest?'NUOVO RECORD! '+fmt(G.score):'PUNTI '+fmt(G.score)+' · RECORD '+fmt(BEST);ctext(rs,TW/2,FY+3,1,G.newBest?C.yel:C.white,{outline:null});
  if(PANEL.hidden){const n=POLA.filter(p=>p.k in G.found).length;
    document.getElementById('spec1').textContent=won?'APRI IL TUO PREMIO':'PREMIO DI CONSOLAZIONE';
    document.getElementById('spec2').textContent=won||!n?CFG.prizeSub:('HAI TROVATO '+n+' SEGRETI SU '+POLA.length+' · APRILI TUTTI').replace('TROVATO 1 SEGRETI','TROVATO 1 SEGRETO');
    document.getElementById('spec').hidden=!POLA.length;
    PANEL.hidden=false;placePanel();}}

/* ---- sound: a few blips ---- */
let AC=null;function sfx(k,a){if(!AC)return;const t=AC.currentTime,o=(f,d,type,v,f2,s=0)=>{const a=AC.createOscillator(),g=AC.createGain();a.type=type;a.frequency.setValueAtTime(f,t+s);if(f2)a.frequency.exponentialRampToValueAtTime(f2,t+s+d);g.gain.setValueAtTime(v,t+s);g.gain.exponentialRampToValueAtTime(0.001,t+s+d);a.connect(g);g.connect(AC.destination);a.start(t+s);a.stop(t+s+d+0.02);};
  if(k==='wave'){const P=[523,587,659,784,880,1047,1175,1319,1568];for(let i=0;i<a.n;i++)o(P[i],0.14,'square',0.045,0,i*a.dur/a.n);}
  else if(k==='chime'){[1047,1319,1568].forEach((f,i)=>o(f,0.18,'sine',0.06,0,i*0.08));}
  else if(k==='spawn'){o(880,0.08,'triangle',0.05,1320);}
  else if(k==='power'){[659,880,1175,1568].forEach((f,i)=>o(f,0.1,'square',0.05,0,i*0.05));}
  else if(k==='near'){o(1400,0.12,'sine',0.05,500);}
  else if(k==='close'){o(523,0.08,'square',0.05);o(784,0.12,'square',0.05,0,0.07);}
  else if(k==='big'){[523,659,784,1047].forEach((f,i)=>o(f,0.12,'square',0.05,0,i*0.07));}
  else if(k==='hit'){o(330,0.35,'sawtooth',0.07,90);}
  else if(k==='win'){[523,659,784,1047,784,1047,1319].forEach((f,i)=>o(f,0.16,'square',0.05,0,i*0.1));}
  else if(k==='over'){[392,330,262,196].forEach((f,i)=>o(f,0.22,'triangle',0.08,0,i*0.16));}}
function audioOn(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}if(AC&&SONGBUF)playSong(SONGBUF);}if(AC&&AC.state==='suspended')AC.resume();}

/* ---- input: swipe sets the direction, a tap stops; arrows / WASD and space on a keyboard ---- */
function setDir(dx,dy){if(G.state!=='play')return;if(G.draw&&dx===-G.dx&&dy===-G.dy&&(dx||dy))return;G.dx=dx;G.dy=dy;}
let sw=null;
cv.addEventListener('pointerdown',e=>{audioOn();e.preventDefault();if(G.state==='intro'){G.state='play';return;}sw={x:e.clientX,y:e.clientY,moved:false,id:e.pointerId};try{cv.setPointerCapture(e.pointerId);}catch(_){}});
cv.addEventListener('pointermove',e=>{if(!sw||e.pointerId!==sw.id)return;const dx=e.clientX-sw.x,dy=e.clientY-sw.y,d=Math.max(Math.abs(dx),Math.abs(dy));
  if(d>=10){if(Math.abs(dx)>Math.abs(dy))setDir(Math.sign(dx),0);else setDir(0,Math.sign(dy));sw.x=e.clientX;sw.y=e.clientY;sw.moved=true;}});
const endSw=e=>{if(!sw||e.pointerId!==sw.id)return;if(!sw.moved&&G.state==='play'){G.dx=G.dy=0;}sw=null;};
cv.addEventListener('pointerup',endSw);cv.addEventListener('pointercancel',()=>{sw=null;});
addEventListener('keydown',e=>{const k=e.key;audioOn();if(G.state==='intro'&&(k===' '||k==='Enter'||k.startsWith('Arrow'))){G.state='play';e.preventDefault();return;}
  const m={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1],a:[-1,0],d:[1,0],w:[0,-1],s:[0,1]}[k];if(m){setDir(m[0],m[1]);e.preventDefault();}else if(k===' '){G.dx=G.dy=0;e.preventDefault();}});

/* ---- end panel ---- */
const PANEL=document.getElementById('panel');
/* the BRANO button sits under the start card, left */
function placeSongBtn(){const r=cv.getBoundingClientRect(),s=document.getElementById('stage').getBoundingClientRect(),sc=r.width/TW,b=document.getElementById('songBtn');b.style.left=(r.left-s.left+FX*sc)+'px';b.style.top=(r.top-s.top+(FY+FH-30)*sc)+'px';}
function placePanel(){if(PANEL.hidden)return;const r=cv.getBoundingClientRect(),s=document.getElementById('stage').getBoundingClientRect(),sc=r.width/TW,top=FY+307,bot=FY+FH-3;
  PANEL.style.left=(r.left-s.left+20*sc)+'px';PANEL.style.width=(r.width-40*sc)+'px';PANEL.style.top=(r.top-s.top+top*sc)+'px';PANEL.style.height=((bot-top)*sc)+'px';}
{const cal=document.getElementById('cal');if(GIG)cal.href=GIG.cal;else{cal.href='https://www.2deep.it/#events-section';cal.innerHTML='VEDI LE<br>PROSSIME DATE';}}
document.getElementById('again').addEventListener('click',()=>{GAL.hidden=true;newGame();G.state='play';});
/* ---- the secrets at the end: the venue's photos, sharp, with their texts (or the songs, with the band's photos) ---- */
const SPECS=POLA.map(p=>({img:p.img,q:!!p.q,song:!!p.song,t:p.title,p:p.text}));
document.getElementById('gtitle').textContent=CFG.galleryTitle;
const GAL=document.getElementById('gal'),GI=document.getElementById('gimg'),GT=document.getElementById('gt'),GP=document.getElementById('gp'),GD=document.getElementById('gdots');let gi=0;
function galShow(i){gi=(i+SPECS.length)%SPECS.length;const s=SPECS[gi];if(s.img){GI.src=s.img;GI.hidden=false;}else{GI.removeAttribute('src');GI.hidden=true;}GI.alt=s.t;GT.textContent=s.t;document.getElementById('gnote').hidden=!(s.song&&!s.img);document.getElementById('gn').textContent='SEGRETO N. '+(gi+1);GP.textContent=s.p;document.getElementById('gq').hidden=!(s.q||(!s.img&&!s.song));GD.textContent=(gi+1)+' / '+SPECS.length;}
function galPlace(){const r=cv.getBoundingClientRect(),st=document.getElementById('stage').getBoundingClientRect();Object.assign(GAL.style,{left:(r.left-st.left)+'px',top:(r.top-st.top)+'px',width:r.width+'px',height:r.height+'px'});}
document.getElementById('spec').addEventListener('click',()=>{galShow(0);GAL.hidden=false;galPlace();document.getElementById('gnext').focus();});
document.getElementById('gprev').addEventListener('click',()=>galShow(gi-1));document.getElementById('gnext').addEventListener('click',()=>galShow(gi+1));
document.getElementById('gclose').addEventListener('click',()=>{GAL.hidden=true;document.getElementById('spec').focus();});
addEventListener('keydown',e=>{if(GAL.hidden)return;if(e.key==='Escape'){GAL.hidden=true;}else if(e.key==='ArrowRight')galShow(gi+1);else if(e.key==='ArrowLeft')galShow(gi-1);e.stopImmediatePropagation();},true);
let gx=null;GAL.addEventListener('pointerdown',e=>{gx=e.clientX;});GAL.addEventListener('pointerup',e=>{if(gx!==null&&Math.abs(e.clientX-gx)>40)galShow(gi+(e.clientX<gx?1:-1));gx=null;});
addEventListener('resize',()=>{if(!GAL.hidden)galPlace();});

/* ---- loop ---- */
let last=0;function loop(ts){const dt=Math.min(0.05,(ts-(last||ts))/1000);last=ts;let a=dt;while(a>0){const s=Math.min(a,1/120);update(s);a-=s;}draw();requestAnimationFrame(loop);}
addEventListener('resize',()=>{fit();placeSongBtn();});newGame();fit();requestAnimationFrame(loop);
rebuildReveal();
window.__X={G,grid,update,draw,closeArea,setDir,mus:()=>({buf:!!SONGBUF,midi:!!(SONG&&SONG.midi),name:SONG&&SONG.name,layers:MLG.length,on:MLG.map(g=>+g.gain.value.toFixed(2)),lay:LAYERS}),best:()=>BEST};
