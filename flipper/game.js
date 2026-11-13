/* ---------------- 2Deep Pinball ----------------
   Logical table 270x480 (MSX-like: finer pixels, flat colours, thin lines) drawn 1:1 on LG and shown as large as the screen allows.
   Physics: 120 updates a second, 5 substeps each (600 Hz), so the ball never jumps through a wall.
   Rules: three balls (four for Instagram followers). Bumpers 100, slingshots 10, a lit lane 250, drop targets 250,
   the moving sofa 500 a hit (x2, x3, x4 if you hit it again before its timer runs out; the fifth in a row: SFRATTO, +5000), the ENCORE hole 500. D-E-E-P in the top lanes: +2000 and 20 s of LIVE, everything x2.
   The three B-I-S targets light the ENCORE hole: the next ball in it starts JAM SESSION, a two-ball multiball, x2 too.
   For the first 5 s of every ball the sofa gives it back (RIPROVA).
   The table is the next gig: the site's dates (bridge.js, window.__LVE) give the playfield lettering, the three level targets
   on the right (each one shows its date on the dot-matrix display, all three: TOUR COMPLETO), the ticker, the title picture
   and, at game over, the "Prossimi livelli" map in a window with the calendar link for the next date. */
const TW=270,TH=480,BR=4.5,GRAV=540,VMAX=1080,STEP=1/120,SUB=5,LOOP=12.8;
const IG_URL='https://www.instagram.com/2deeplivemusic/',FOLLOW_KEY='2deep_pinball_follow';
const C={wall:'#86cfdc',slope:'#e08fc4',post:'#e9c46a',dim:'#4a4280',red:'#f0646e',yel:'#f2d27a',cyan:'#86cfdc',pink:'#e897c8',white:'#f6eedf'};

/* ---------------- the next gigs, from the site ---------------- */
const LVE=window.__LVE||null,LVL=LVE?LVE.levels.filter(l=>l.venue):[],NEXT=LVL[0]||null;
const up=s=>String(s||'').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function dayWord(l){if(!l||!l.iso)return '';const[y,m,d]=l.iso.split('-').map(Number),t=new Date(),n=Math.round((new Date(y,m-1,d)-new Date(t.getFullYear(),t.getMonth(),t.getDate()))/864e5);
  return n===0?((parseInt(l.rawTime,10)||0)>=17?'STASERA':'OGGI'):n===1?'DOMANI':l.date;}
/* the display's second line: one short page at a time, held still, never a scrolling ticker */
const PAGES=(LVL.length?LVL.flatMap(l=>[l.date+' · LV'+l.n,up(l.venue),[l.place,l.time].filter(Boolean).map(up).join(' ')]):['NUOVE DATE IN ARRIVO']).concat(['SEGUI @2DEEPLIVEMUSIC']);
/* Google Calendar link for a date: three hours from the start time, Rome time; a whole day when the time is not set */
function calURL(l){const[y,m,d]=l.iso.split('-').map(Number),p=n=>String(n).padStart(2,'0'),day=x=>x.getFullYear()+p(x.getMonth()+1)+p(x.getDate());let dates;
  if(l.rawTime){const[h,mi]=l.rawTime.split(':').map(Number),hm=x=>day(x)+'T'+p(x.getHours())+p(x.getMinutes())+'00';dates=hm(new Date(y,m-1,d,h,mi))+'/'+hm(new Date(y,m-1,d,h+3,mi));}
  else dates=day(new Date(y,m-1,d))+'/'+day(new Date(y,m-1,d+1));
  const q={action:'TEMPLATE',text:'2Deep live · '+(l.name||l.venue),dates,ctz:'Europe/Rome',location:l.full||l.venue,details:'Musica dal vivo con Katia e Lorenzo.\nTutte le date: https://www.2deep.it\nInstagram: @2deeplivemusic'};
  return 'https://calendar.google.com/calendar/render?'+Object.entries(q).map(([k,v])=>k+'='+encodeURIComponent(v)).join('&');}

/* ---------------- table geometry ---------------- */
const WALLS=[],seg=(ax,ay,bx,by,o={})=>WALLS.push({ax,ay,bx,by,e:o.e??0.45,kick:o.kick||0,id:o.id||'',col:o.col||'wall',oneway:o.oneway||0,hide:o.hide||0});
{const cx=135,cy=140,rx=125,ry=100,N=32;let px=cx+rx,py=cy;for(let i=1;i<=N;i++){const th=Math.PI*i/N,x=cx+rx*Math.cos(th),y=cy-ry*Math.sin(th);seg(px,py,x,y,{e:0.6});px=x;py=y;}}
seg(10,140,10,365);seg(10,365,72,414,{col:'slope'});                   /* left wall and left inlane slope */
seg(260,140,260,478);seg(242,444,260,444,{hide:1});seg(242,187,242,478);         /* outer right wall, plunger lane floor (not drawn: the plunger's tip is the floor you see), lane divider */
seg(242,92,242,187,{col:'post',e:0.3,oneway:1});                        /* one-way gate: out of the lane yes, back in no */
seg(242,365,180,414,{col:'slope'});                                     /* right inlane slope */
const SLINGS=[{a:[33,315],b:[33,355],c:[65,377],id:'slL'},{a:[209,315],b:[209,355],c:[177,377],id:'slR'}];
SLINGS.forEach(s=>{seg(...s.a,...s.b,{col:'slope'});seg(...s.b,...s.c,{col:'slope'});seg(...s.a,...s.c,{kick:165,e:0.1,id:s.id,col:'slope'});});
const LANEX=[70,102,135,167,200],LETTERS=['D','E','E','P'];
LANEX.forEach(x=>seg(x,68,x,88,{e:0.3,col:'post'}));
const BUMPERS=[{x:80,y:188,r:12,c:'#e897c8',n:0},{x:172,y:188,r:12,c:'#86cfdc',n:1},{x:126,y:235,r:12,c:'#f2d27a',n:2}];
const HOLE={x:126,y:145};
const DROPS=[{y:212,up:true,t:0},{y:236,up:true,t:0},{y:260,up:true,t:0}],DROPX=[10,22],DROPL=['B','I','S'];
/* the three level targets on the right, the mirror image of B-I-S: one per upcoming date */
const LVT=[{y:212,up:true,t:0},{y:236,up:true,t:0},{y:260,up:true,t:0}],LVTX=[230,242];
const SOFAT={y:318,half:12,r:10};
/* the sofa slides on its own clock (a phase), so after a hit it starts again from where it stopped */
const SOFA_PER=4.5,SOFA_OUT=6,stunFor=c=>c>1?Math.max(1.4,2.4-0.25*c):2.4,comboWin=c=>Math.max(1.8,3.8-0.5*c);
/* each pivot sits 6 px below the end of its inlane slope, so the slope runs straight onto the top of the flipper with no step to get caught in.
   Flatter than a real machine on purpose: 22 degrees down at rest, 17 up when pressed */
const FLIP=[{px:68.3,py:418.7,len:52,rest:0.38,up:-0.3,a:0.38,w:0,on:false},{px:183.7,py:418.7,len:52,rest:Math.PI-0.38,up:Math.PI+0.3,a:Math.PI-0.38,w:0,on:false}];
const PLX=251,PLY=444-BR,TRAVEL=18;   /* the plunger's tip rests at y 444 and travels 18 px down when fully pulled */
const DX=6,DY=2,DC=121,DR=16;   /* dot-matrix display: 121x16 dots, 2 px apart, across the top of the table */

/* ---------------- game state ---------------- */
const G={state:'title',score:0,balls:3,lit:[0,0,0,0],liveUntil:0,jam:false,encoreLit:false,now:0,stateT:0,charge:0,charging:false,
  hold:null,holdT:0,holeCool:0,saveUntil:0,sofaHit:-9,sofaX:126,sofaPh:0,sofaSpd:1,stunUntil:0,combo:0,comboUntil:0,comboWinLen:1,sofaOut:-99,sofaOutX:126,lvGot:[0,0,0],readyT:0,launchT:-9,flash:{},pops:[],bandJam:0,continued:false,follower:false,msg:null,msgT:0,msgP:0,dance:0};
let BALLS=[],B=null;
const ball=(x,y,vx,vy)=>({x,y,vx,vy,still:0});
const live=()=>G.now<G.liveUntil,mult=()=>(live()?2:1)*(G.jam?2:1);
try{G.follower=localStorage.getItem(FOLLOW_KEY)==='1';}catch(e){}
function add(p,x,y){const v=p*mult();G.score+=v;if(x!==undefined)pop('+'+v,x,y,C.white,1);}
function pop(txt,x,y,col,sc,d=1){G.pops.push({txt,x,y,col,sc,t:G.now,d});}
function serve(){BALLS=[ball(PLX,PLY,0,0)];G.state='ready';G.readyT=G.now;if(typeof releaseAll==='function')releaseAll();G.charge=0;G.charging=false;}
function newGame(){G.score=0;G.combo=0;G.comboUntil=0;G.stunUntil=0;G.sofaSpd=1;G.sofaOut=-99;G.lvGot=[0,0,0];G.balls=G.follower?4:3;G.lit=[0,0,0,0];G.liveUntil=0;G.jam=false;G.encoreLit=false;G.pops=[];G.hold=null;G.continued=false;DROPS.forEach(d=>d.up=true);LVT.forEach(d=>d.up=true);serve();showIG(false);
  const intro=NEXT?[{big:'LIVELLO '+NEXT.n,d:1.1},{l1:up(NEXT.venue),l2:[dayWord(NEXT),NEXT.time].filter(Boolean).join(' '),d:2.2}]:[];
  if(SONG&&SONG.midi&&SONG.name)intro.push({l1:'IN SOTTOFONDO',l2:up(SONG.name),d:1.8});intro.push({l1:'OGNI LETTERA',l2:'UNO STRUMENTO',d:1.8});say(intro,2);}
function launch(){const p=G.charge,b=BALLS[0];b.vy=-(740+520*p);b.vx=0;G.state='play';G.launchT=G.now;G.charging=false;G.charge=0;G.saveUntil=G.now+5;sfx('launch',p);}

/* ---------------- collisions (on the current ball B) ---------------- */
function hitSeg(w){if(w.oneway&&(B.vx<=0||B.x>w.ax))return false;const dx=w.bx-w.ax,dy=w.by-w.ay,l2=dx*dx+dy*dy;let t=((B.x-w.ax)*dx+(B.y-w.ay)*dy)/l2;t=t<0?0:t>1?1:t;
  const px=w.ax+dx*t,py=w.ay+dy*t;let nx=B.x-px,ny=B.y-py;const d=Math.hypot(nx,ny);if(d>=BR||d<1e-6)return false;
  nx/=d;ny/=d;B.x=px+nx*BR;B.y=py+ny*BR;const vn=B.vx*nx+B.vy*ny;if(vn>=0)return false;
  B.vx-=(1+w.e)*vn*nx;B.vy-=(1+w.e)*vn*ny;
  if(w.kick&&-vn>100){B.vx+=nx*w.kick;B.vy+=ny*w.kick+40;G.flash[w.id]=G.now;add(10);sfx('sling');}
  else if(-vn>150&&w.col==='post')sfx('tick');
  return true;}
function hitCircle(cx,cy,r,e){let nx=B.x-cx,ny=B.y-cy;const d=Math.hypot(nx,ny),R=BR+r;if(d>=R||d<1e-6)return null;nx/=d;ny/=d;B.x=cx+nx*R;B.y=cy+ny*R;
  const vn=B.vx*nx+B.vy*ny;if(vn>=0)return null;B.vx-=(1+e)*vn*nx;B.vy-=(1+e)*vn*ny;return[nx,ny,-vn];}
function hitBumper(k){const m=BUMPERS[k],h=hitCircle(m.x,m.y,m.r,0);if(!h)return;B.vx+=h[0]*320;B.vy+=h[1]*320;G.flash['b'+k]=G.now;G.bandJam=G.now;add(100,m.x,m.y-21);sfx('bumper',k);}
function hitDrops(){DROPS.forEach((d,k)=>{if(!d.up)return;const w={ax:DROPX[1],ay:d.y-8,bx:DROPX[1],by:d.y+8,e:0.4};
  const before=B.vx;if(hitSeg(w)&&before<-40){d.up=false;d.t=G.now;add(250,34,d.y);sfx('drop',k);
    if(DROPS.every(x=>!x.up)){G.encoreLit=true;pop('BIS!',60,236,C.yel,3);sfx('bis');say([{big:'BIS!',d:1,blink:1},{l1:'ENCORE ACCESO',l2:'CENTRA LA BUCA',d:1.8}],2);setTimeout(()=>DROPS.forEach(x=>x.up=true),1500);}}
  hitSeg({ax:DROPX[0],ay:d.y-14,bx:DROPX[1],by:d.y-8,e:0.4});hitSeg({ax:DROPX[0],ay:d.y+8,bx:DROPX[1],by:d.y+8,e:0.4});});}
/* a level target: its date on the display; all three down is the whole tour */
function hitLvt(){LVT.forEach((d,k)=>{if(!d.up)return;const w={ax:LVTX[0],ay:d.y-8,bx:LVTX[0],by:d.y+8,e:0.4};
  const before=B.vx;if(hitSeg(w)&&before>40){d.up=false;d.t=G.now;add(250);sfx('level',k);levelHit(k);}
  hitSeg({ax:LVTX[1],ay:d.y-14,bx:LVTX[0],by:d.y-8,e:0.4});hitSeg({ax:LVTX[0],ay:d.y+8,bx:LVTX[1],by:d.y+8,e:0.4});});}
/* the date pops up next to the target, big, where the eye already is; the display then holds it steady */
function levelHit(k){const l=LVL[k];G.lvGot[k]=1;const seq=l?[{big:l.date,d:2.2},{l1:up(l.venue),l2:[l.place,l.time].filter(Boolean).map(up).join(' '),d:2.6}]:[{l1:'NUOVE DATE',l2:'IN ARRIVO',d:1.6}];
  if(l){const y=LVT[k].y;pop(l.date,164,y-27,C.cyan,2,2.4);pop(up(l.venue),164,y-9,C.white,1,2.4);}
  if(LVT.every(x=>!x.up)){const v=3000*mult();G.score+=v;G.bandJam=G.now;pop('TOUR COMPLETO!',126,290,C.yel,2,2);pop('+'+v,126,308,C.white,2,2);sfx('tour');
    seq.push({big:'TOUR',d:0.7,blink:1},{big:'COMPLETO!',d:0.9},{l1:'CI VEDIAMO',l2:NEXT?[dayWord(NEXT),up(NEXT.venue)].join(' '):'AL PROSSIMO LIVE',d:2.2});setTimeout(()=>LVT.forEach(x=>x.up=true),1500);}
  say(seq,2);}
const sofaGone=()=>G.now-G.sofaOut<SOFA_OUT,sofaStun=()=>G.now<G.stunUntil;
function sofaVX(){return sofaStun()||sofaGone()?0:46*Math.cos(G.sofaPh)*2*Math.PI/SOFA_PER*G.sofaSpd;}
function hitSofa(){if(sofaGone())return;const x=G.sofaX,ax=x-SOFAT.half,bx=x+SOFAT.half,y=SOFAT.y;let t=(B.x-ax)/(bx-ax);t=t<0?0:t>1?1:t;const px=ax+(bx-ax)*t;
  let nx=B.x-px,ny=B.y-y;const d=Math.hypot(nx,ny),R=BR+SOFAT.r;if(d>=R||d<1e-6)return;nx/=d;ny/=d;B.x=px+nx*R;B.y=y+ny*R;
  const vs=sofaVX(),vrx=B.vx-vs,vn=vrx*nx+B.vy*ny;if(vn>=0)return;B.vx=vrx-1.5*vn*nx+vs;B.vy=B.vy-1.5*vn*ny;
  if(-vn>120&&!sofaStun()){const c=G.combo=G.now<=G.comboUntil?G.combo+1:1;if(c>=5){sofaEvict();return;}
    G.sofaHit=G.now;G.stunUntil=G.now+stunFor(c);G.comboWinLen=comboWin(c);G.comboUntil=G.stunUntil+G.comboWinLen;add(500*c,x,y-26);
    pop(c===1?'DIVANO K.O.!':'COMBO X'+c+'!',x,y-40,c>1?C.yel:C.red,2);sfx('sofa',c);
    say([{big:c===1?'K.O.!':'COMBO X'+c,d:1.0},{l1:c===4?'ANCORA UNO: SFRATTO!':'COLPISCILO ANCORA',l2:'X'+(c+1)+' SE LO PRENDI',d:1.6}],c>1?2:1);}}
/* five hits in a row: the sofa is evicted, flies off the table and comes back a few seconds later */
function sofaEvict(){const v=5000*mult();G.score+=v;G.sofaOut=G.now;G.sofaOutX=G.sofaX;G.combo=0;G.stunUntil=0;G.comboUntil=0;G.bandJam=G.now;
  pop('SFRATTO!',126,292,C.yel,3);pop('+'+v,126,322,C.white,2);sfx('evict');say([{big:'SFRATTO!',d:1.3,blink:1},{l1:'IL DIVANO E FUORI',l2:'+'+v,d:1.8}],2);}
function hitFlipper(f){const ex=f.px+Math.cos(f.a)*f.len,ey=f.py+Math.sin(f.a)*f.len,dx=ex-f.px,dy=ey-f.py,l2=dx*dx+dy*dy;
  let t=((B.x-f.px)*dx+(B.y-f.py)*dy)/l2;t=t<0?0:t>1?1:t;const cx=f.px+dx*t,cy=f.py+dy*t,rad=6-3*t;
  let nx=B.x-cx,ny=B.y-cy;const d=Math.hypot(nx,ny),R=BR+rad;if(d>=R||d<1e-6)return;nx/=d;ny/=d;B.x=cx+nx*R;B.y=cy+ny*R;
  const rx=cx+nx*rad-f.px,ry=cy+ny*rad-f.py,vsx=-f.w*ry,vsy=f.w*rx,vrx=B.vx-vsx,vry=B.vy-vsy,vn=vrx*nx+vry*ny;
  if(vn<0){const e=0.32;B.vx=vrx-(1+e)*vn*nx+vsx;B.vy=vry-(1+e)*vn*ny+vsy;}}
function moveFlipper(f,dt){const tgt=f.on?f.up:f.rest,sp=f.on?26:16,d=tgt-f.a,stp=Math.sign(d)*Math.min(Math.abs(d),sp*dt);f.w=stp/dt;f.a+=stp;if(Math.abs(d)<1e-4)f.w=0;}
function ballsCollide(){for(let i=0;i<BALLS.length;i++)for(let j=i+1;j<BALLS.length;j++){const a=BALLS[i],b=BALLS[j];if(a===G.hold||b===G.hold)continue;
  let nx=b.x-a.x,ny=b.y-a.y;const d=Math.hypot(nx,ny);if(d>=2*BR||d<1e-6)continue;nx/=d;ny/=d;const o=(2*BR-d)/2;a.x-=nx*o;a.y-=ny*o;b.x+=nx*o;b.y+=ny*o;
  const va=a.vx*nx+a.vy*ny,vb=b.vx*nx+b.vy*ny;if(va-vb<=0)continue;const dv=(va-vb)*0.95;a.vx-=dv*nx;a.vy-=dv*ny;b.vx+=dv*nx;b.vy+=dv*ny;}}

/* ---------------- one physics substep ---------------- */
function substep(dt){
  FLIP.forEach(f=>moveFlipper(f,dt));
  /* the ball stays on the lane floor while the spring is pulled (it is only drawn lower): below the floor, a full-power
     shot would hit the floor from underneath and drop into the drain */
  if(G.state==='ready'){const b=BALLS[0];b.x=PLX;b.y=PLY;b.vx=b.vy=0;return;}
  if(G.state!=='play')return;
  for(const b of BALLS){B=b;if(b===G.hold){b.x=HOLE.x;b.y=HOLE.y;b.vx=b.vy=0;continue;}
    b.vy+=GRAV*dt;const damp=1-0.12*dt;b.vx*=damp;b.vy*=damp;
    let sp=Math.hypot(b.vx,b.vy);if(sp>VMAX){b.vx*=VMAX/sp;b.vy*=VMAX/sp;}
    const py=b.y;b.x+=b.vx*dt;b.y+=b.vy*dt;
    for(const w of WALLS)hitSeg(w);for(let k=0;k<3;k++)hitBumper(k);hitDrops();hitLvt();hitSofa();FLIP.forEach(hitFlipper);
    sp=Math.hypot(b.vx,b.vy);if(sp>VMAX){b.vx*=VMAX/sp;b.vy*=VMAX/sp;}
    if(py<90&&b.y>=90&&b.vy>0)for(let k=0;k<4;k++)if(b.x>LANEX[k]&&b.x<LANEX[k+1])laneHit(k);
    if(!G.hold&&G.now>G.holeCool&&Math.hypot(b.x-HOLE.x,b.y-HOLE.y)<6&&Math.hypot(b.vx,b.vy)<650)holeIn(b);}
  ballsCollide();
  const gone=BALLS.filter(b=>b.y>490);if(gone.length){BALLS=BALLS.filter(b=>b.y<=490);if(!BALLS.length)lostBall();else if(BALLS.length===1&&G.jam){G.jam=false;pop('FINE JAM',126,330,C.cyan,2);say([{big:'FINE JAM',d:1.2}]);}}
}
function holeIn(b){G.hold=b;G.holdT=G.now;add(500,HOLE.x,HOLE.y-17);
  if(G.encoreLit&&!G.jam){G.encoreLit=false;G.jam=true;pop('JAM SESSION!',126,262,C.yel,2);sfx('jam');say([{big:'JAM!',d:1,blink:1},{l1:'JAM SESSION',l2:'2 PALLINE · X2',d:1.8}],2);}
  else{pop('ENCORE!',HOLE.x,HOLE.y-30,C.yel,2);sfx('holeIn');say([{big:'ENCORE',d:1.2}]);}}
function lostBall(){if(G.now<G.saveUntil){pop('RIPROVA!',126,380,C.cyan,2);sfx('save');serve();say([{big:'RIPROVA',d:1.3}],3);return;}
  G.state='drain';G.stateT=G.now;G.jam=false;sfx('gnam');pop('GNAM!',126,436,C.red,2);
  say([{big:'GNAM!',d:0.9},{l1:'PALLINA PERSA',l2:G.balls>2?'NE RESTANO '+(G.balls-1):G.balls===2?'ULTIMA PALLINA':'PARTITA FINITA',d:1.4}],3);}
function laneHit(k){G.flash['l'+k]=G.now;if(!G.lit[k]){G.lit[k]=1;add(250,(LANEX[k]+LANEX[k+1])/2,77);sfx('lane',k);if(!G.lit.every(Boolean)){const n=G.lit.filter(Boolean).length,lb=stepLabel(n);say([{l1:'D-E-E-P  '+LETTERS.map((c,i)=>G.lit[i]?c:'.').join(' '),l2:lb?'+ '+lb:'',d:1.6}],lb?2:1);}}else add(50);
  if(G.lit.every(Boolean)){G.lit=[0,0,0,0];G.liveUntil=G.now+20;G.score+=2000;G.bandJam=G.now;pop('LIVE!',126,280,C.red,4);pop('+2000',126,322,C.yel,2);sfx('live');say([{big:'LIVE!',d:1.3,blink:1},{l1:'TUTTA LA BAND',l2:'TUTTO X2 PER 20 S',d:1.8}],2);}}

/* ---------------- per-frame logic ---------------- */
function update(dt){G.now+=dt;
  /* the sofa: still while stunned, faster with every combo; the combo ends when its timer runs out */
  if(G.combo&&!sofaStun()&&G.now>G.comboUntil){G.combo=0;if(G.state==='play')say([{l1:'COMBO FINITA',l2:'',d:1.0}]);}
  G.sofaSpd+=(1+0.25*G.combo-G.sofaSpd)*Math.min(1,dt*2);
  if(G.now-G.sofaOut>=SOFA_OUT&&G.now-G.sofaOut<SOFA_OUT+dt*1.5){G.sofaPh=0;G.sofaSpd=1;}
  if(!sofaStun()&&!sofaGone()){G.sofaPh+=dt*2*Math.PI/SOFA_PER*G.sofaSpd;G.sofaX=126+46*Math.sin(G.sofaPh);}
  if(G.state==='ready'&&G.charging)G.charge=Math.min(1,G.charge+dt/0.9);
  for(let i=0;i<SUB;i++)substep(dt/SUB);
  if(G.state==='play'){
    if(G.hold&&G.now-G.holdT>(G.jam&&BALLS.length===1?1.0:0.8)){const b=G.hold;G.hold=null;G.holeCool=G.now+0.6;b.vx=(Math.random()*2-1)*150;b.vy=320;sfx('holeOut');
      if(G.jam&&BALLS.length===1){BALLS.push(ball(PLX,PLY,0,-(740+520*0.6)));sfx('launch',0.6);}}
    for(const b of BALLS){
      /* back in the plunger lane, resting: the only ball goes back on the plunger, an extra one is fired again */
      if(b.x>242&&b.y>PLY-8&&Math.hypot(b.vx,b.vy)<25){if(BALLS.length===1){G.state='ready';G.readyT=G.now;G.charge=0;G.charging=false;}else{b.vy=-1000;}}
      if(b!==G.hold&&Math.hypot(b.vx,b.vy)<15){b.still+=dt;if(b.still>2.5){b.vy=-260;b.vx=(Math.random()*2-1)*100;b.still=0;}}else b.still=0;}}
  if(G.state==='drain'&&G.now-G.stateT>1.3){G.balls--;if(G.balls>0)serve();else{G.state='over';G.stateT=G.now;releaseAll();sfx('over');showIG(true);}}
  G.pops=G.pops.filter(p=>G.now-p.t<p.d);
  G.dance+=((live()||G.jam?1:0)-G.dance)*Math.min(1,dt*3);holdCheck();applyLayers();const sb=document.getElementById('songBtn'),sv=songBtnVisible();if(sb.hidden===sv)sb.hidden=!sv;}

/* ---------------- drawing: the table in smooth shapes at full screen resolution, characters and lettering in pixel art ---------------- */
let K=1;const STATIC=document.createElement('canvas'),TAU=Math.PI*2;
const rgba=(c,a)=>{const v=hx(c);return 'rgba('+v[0]+','+v[1]+','+v[2]+','+a+')';};
/* a colour pushed towards white (f>0) or black (f<0): the lit and the shaded faces of the same object */
Object.assign(FONT,{'%':["##...","##..#","...#.","..#..",".#...","#..##","...##"]});
const shade=(c,f)=>{const v=hx(c),t=f<0?0:255,a=Math.abs(f);return 'rgb('+[0,1,2].map(i=>Math.round(v[i]+(t-v[i])*a)).join(',')+')';};
function soft(x,y,r,col,a){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,rgba(col,a));g.addColorStop(1,rgba(col,0));ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();}
function circle(x,y,r,fill){ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fillStyle=fill;ctx.fill();}
function rrect(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function capsule(ax,ay,bx,by,ra,rb){const dx=bx-ax,dy=by-ay,L=Math.hypot(dx,dy),an=Math.atan2(dy,dx),q=Math.asin((ra-rb)/L);
  ctx.beginPath();ctx.arc(ax,ay,ra,an+Math.PI/2+q,an+3*Math.PI/2-q);ctx.arc(bx,by,rb,an-Math.PI/2-q,an+Math.PI/2+q);ctx.closePath();}
function sphere(x,y,r){ctx.fillStyle='rgba(0,0,0,0.35)';ctx.beginPath();ctx.ellipse(x+1.2,y+2,r,r*0.8,0,0,TAU);ctx.fill();
  const g=ctx.createRadialGradient(x-r*0.4,y-r*0.45,r*0.15,x,y,r);g.addColorStop(0,'#ffffff');g.addColorStop(0.45,'#cfd3e2');g.addColorStop(1,'#5e6480');circle(x,y,r,g);}
function buildStatic(){STATIC.width=TW*K;STATIC.height=TH*K;const g=STATIC.getContext('2d'),sv=ctx;ctx=g;g.setTransform(K,0,0,K,0,0);g.imageSmoothingEnabled=false;
  let gr=g.createLinearGradient(0,0,0,TH);gr.addColorStop(0,'#16132e');gr.addColorStop(0.55,'#1d1838');gr.addColorStop(1,'#291b3c');g.fillStyle=gr;g.fillRect(0,0,TW,TH);
  g.strokeStyle='rgba(150,140,230,0.05)';g.lineWidth=0.6;for(let x=8;x<TW;x+=16){g.beginPath();g.moveTo(x,0);g.lineTo(x,TH);g.stroke();}for(let y=8;y<TH;y+=16){g.beginPath();g.moveTo(0,y);g.lineTo(TW,y);g.stroke();}
  const vg=g.createRadialGradient(126,260,60,126,260,330);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,0.5)');g.fillStyle=vg;g.fillRect(0,0,TW,TH);
  /* playfield art: the next gig in big faded lettering (the 2Deep logo when no date is planned) */
  const art=(s,y,maxW,scs,col)=>{s=up(s);const sc=scs.find(c=>tw(s)*c<=maxW)||scs[scs.length-1];dt(s,Math.round(121-tw(s)*sc/2),y,sc,col);};   /* 121: halfway between the slingshots */
  g.globalAlpha=0.85;
  if(NEXT){art(NEXT.date,318,170,[2,1],'#4a3ea4');art(NEXT.venue,336,146,[2,1],'#6c3f92');art([NEXT.place,NEXT.time].filter(Boolean).join(' · '),354,140,[1],'#4a3ea4');}
  else{dt('2DEEP',Math.round(126-tw('2DEEP')*2.5),318,5,'#2c2462');dt('LIVE MUSIC',Math.round(126-tw('LIVE MUSIC')),358,2,'#2c2462');}
  g.globalAlpha=1;dt('LV',Math.round(236-tw('LV')/2),188,1,'#3e6a8c');
  /* dot-matrix display: dark glass, a thin warm frame, every dot faintly visible when off */
  rrect(DX-3.5,0.5,DC*2+6,DR*2+3,3);g.fillStyle='#0d0805';g.fill();g.strokeStyle='rgba(242,180,90,0.35)';g.lineWidth=1;g.stroke();
  g.fillStyle='rgba(255,170,70,0.09)';g.beginPath();for(let j=0;j<DR;j++)for(let i=0;i<DC;i++){const x=DX+i*2+1,y=DY+j*2+1;g.moveTo(x+0.8,y);g.arc(x,y,0.8,0,TAU);}g.fill();
  rrect(254,0.5,14,DR*2+3,3);g.fillStyle='#0d0805';g.fill();g.strokeStyle='rgba(242,180,90,0.25)';g.stroke();
  /* a broad light from above the top of the table */
  const lt=g.createRadialGradient(130,110,10,130,170,270);lt.addColorStop(0,'rgba(150,130,255,0.08)');lt.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=lt;g.fillRect(0,0,TW,TH);
  /* the plunger lane, sunk a little lower than the playfield */
  const pl=g.createLinearGradient(243,0,259,0);pl.addColorStop(0,'rgba(0,0,0,0.75)');pl.addColorStop(0.3,'rgba(5,4,14,0.55)');pl.addColorStop(1,'rgba(5,4,14,0.65)');g.fillStyle=pl;g.fillRect(243,140,16,325);
  /* lane inserts: coloured glass with a gloss on top */
  for(let k=0;k<4;k++){const cx=(LANEX[k]+LANEX[k+1])/2;rrect(cx-9,90,18,19,4);const ig=g.createLinearGradient(0,90,0,109);ig.addColorStop(0,'rgba(82,66,165,0.62)');ig.addColorStop(1,'rgba(22,16,56,0.8)');g.fillStyle=ig;g.fill();
    g.strokeStyle='rgba(255,255,255,0.13)';g.lineWidth=0.8;g.stroke();rrect(cx-7,91.5,14,5,2.5);g.fillStyle='rgba(255,255,255,0.09)';g.fill();}
  /* the ENCORE hole: a dark well with a raised lip, lit on the upper left */
  circle(HOLE.x+1,HOLE.y+1.5,12,'rgba(0,0,0,0.4)');
  let hg=g.createRadialGradient(HOLE.x,HOLE.y-2,1,HOLE.x,HOLE.y,10);hg.addColorStop(0,'#000000');hg.addColorStop(0.7,'#06041a');hg.addColorStop(1,'#2a2160');circle(HOLE.x,HOLE.y,10,hg);
  g.lineWidth=1.6;g.strokeStyle='rgba(190,180,255,0.45)';g.beginPath();g.arc(HOLE.x,HOLE.y,10.6,Math.PI*0.85,Math.PI*1.85);g.stroke();
  g.strokeStyle='rgba(0,0,0,0.55)';g.beginPath();g.arc(HOLE.x,HOLE.y,10.6,Math.PI*1.85,Math.PI*2.85);g.stroke();
  /* slingshots: a plastic top over a darker side wall, so they stand off the playfield */
  SLINGS.forEach(sl=>{const tri=dy=>{g.beginPath();g.moveTo(sl.a[0],sl.a[1]+dy);g.lineTo(sl.b[0],sl.b[1]+dy);g.lineTo(sl.c[0],sl.c[1]+dy);g.closePath();};
    tri(3.2);g.fillStyle='rgba(66,20,58,0.9)';g.fill();
    tri(0);const lg=g.createLinearGradient(sl.a[0],sl.a[1],sl.c[0],sl.c[1]);lg.addColorStop(0,'rgba(240,165,214,0.46)');lg.addColorStop(1,'rgba(190,100,160,0.2)');g.fillStyle=lg;g.fill();});
  /* rails as tubes: a shadow cast on the playfield, a dark glowing body, the lit face, a highlight on the upper-left edge */
  g.lineCap='round';g.lineJoin='round';
  const path=ws=>{g.beginPath();ws.forEach(w=>{g.moveTo(w.ax,w.ay);g.lineTo(w.bx,w.by);});};
  const groups=[['wall',C.wall],['slope',C.slope],['post',C.post]].map(([k,col])=>[WALLS.filter(w=>w.col===k&&!w.hide),col]);
  groups.forEach(([ws])=>{g.save();g.shadowColor='rgba(0,0,0,0.75)';g.shadowBlur=3*K;g.shadowOffsetX=1.8*K;g.shadowOffsetY=2.8*K;g.strokeStyle='rgba(0,0,0,0.6)';g.lineWidth=3;path(ws);g.stroke();g.restore();});
  groups.forEach(([ws,col])=>{g.save();g.shadowColor=rgba(col,0.4);g.shadowBlur=5*K;g.strokeStyle=shade(col,-0.5);g.lineWidth=3.3;path(ws);g.stroke();g.restore();
    g.save();g.translate(-0.25,-0.35);g.strokeStyle=shade(col,-0.05);g.lineWidth=2.1;path(ws);g.stroke();g.translate(-0.35,-0.4);g.strokeStyle=shade(col,0.65);g.lineWidth=0.8;path(ws);g.stroke();g.restore();});
  /* round posts at the ends of the lane guides and on the slingshot corners */
  const peg=(x,y,r,col)=>{circle(x+1,y+1.6,r+0.4,'rgba(0,0,0,0.45)');const pg=g.createRadialGradient(x-r*0.4,y-r*0.5,0.2,x,y,r);pg.addColorStop(0,'#ffffff');pg.addColorStop(0.4,shade(col,0.3));pg.addColorStop(1,shade(col,-0.45));circle(x,y,r,pg);};
  LANEX.forEach(x=>{peg(x,68,2.2,C.post);peg(x,88,2.2,C.post);});SLINGS.forEach(sl=>[sl.a,sl.b,sl.c].forEach(q=>peg(q[0],q[1],2,C.slope)));
  ctx=sv;}
const SOFA_OK=(()=>{const c=mk(40,24),g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(SOFA.happy,0,0,104,58,0,0,40,22);return c;})();
function drawFlipper(f){const ex=f.px+Math.cos(f.a)*f.len,ey=f.py+Math.sin(f.a)*f.len;let nx=Math.sin(f.a),ny=-Math.cos(f.a);if(ny>0){nx=-nx;ny=-ny;}
  ctx.save();ctx.translate(2,3.6);capsule(f.px,f.py,ex,ey,6,3);ctx.fillStyle='rgba(0,0,0,0.4)';ctx.fill();ctx.restore();
  ctx.save();ctx.translate(0,2.3);capsule(f.px,f.py,ex,ey,6,3);ctx.fillStyle='#6a4818';ctx.fill();ctx.restore();
  capsule(f.px,f.py,ex,ey,6,3);const g=ctx.createLinearGradient(f.px+nx*6,f.py+ny*6,f.px-nx*6,f.py-ny*6);g.addColorStop(0,f.on?'#fff6d2':'#f8e2a0');g.addColorStop(0.5,f.on?'#f2d27a':'#e2b860');g.addColorStop(1,f.on?'#c99a3e':'#a87a30');ctx.fillStyle=g;ctx.fill();
  ctx.strokeStyle='rgba(80,52,16,0.85)';ctx.lineWidth=0.8;ctx.stroke();
  ctx.strokeStyle='rgba(255,252,236,0.6)';ctx.lineWidth=1.1;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(f.px+nx*3.8,f.py+ny*3.8);ctx.lineTo(ex+nx*1.7,ey+ny*1.7);ctx.stroke();
  const bg=ctx.createRadialGradient(f.px-0.8,f.py-0.9,0.2,f.px,f.py,2.6);bg.addColorStop(0,'#ffd0d4');bg.addColorStop(1,'#a02a3a');circle(f.px,f.py,2.5,bg);}
function drawBumper(k){const m=BUMPERS[k],fl=G.now-(G.flash['b'+k]||-9)<0.12,lv=(live()||G.jam)&&Math.floor(G.now*6+k)%2===0,r=m.r,top=m.y-(fl?2.4:4.2);
  if(fl||lv)soft(m.x,top,r+13,m.c,0.5);
  ctx.fillStyle='rgba(0,0,0,0.42)';ctx.beginPath();ctx.ellipse(m.x+2.4,m.y+3.4,r+2.6,r*0.8+1.6,0,0,TAU);ctx.fill();
  circle(m.x,m.y+0.8,r+2.7,'#15112a');ctx.strokeStyle='rgba(255,255,255,0.13)';ctx.lineWidth=0.7;ctx.stroke();
  const sg=ctx.createLinearGradient(m.x-r,0,m.x+r,0);sg.addColorStop(0,shade(m.c,-0.62));sg.addColorStop(0.3,shade(m.c,-0.1));sg.addColorStop(0.62,shade(m.c,-0.35));sg.addColorStop(1,shade(m.c,-0.72));
  ctx.beginPath();ctx.moveTo(m.x+r,top);ctx.lineTo(m.x+r,m.y);ctx.arc(m.x,m.y,r,0,Math.PI);ctx.lineTo(m.x-r,top);ctx.closePath();ctx.fillStyle=sg;ctx.fill();
  circle(m.x,top,r+0.6,fl?'#ffffff':shade(m.c,0.6));
  const g=ctx.createRadialGradient(m.x-4,top-5,1.5,m.x,top,r);g.addColorStop(0,fl?'#ffffff':shade(m.c,0.5));g.addColorStop(0.55,fl?shade(m.c,0.55):m.c);g.addColorStop(1,shade(m.c,fl?0:-0.3));circle(m.x,top,r-0.5,g);
  circle(m.x,top,r-4.5,fl?'#ffffff':'#1c1634');ctx.strokeStyle='rgba(0,0,0,0.5)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(m.x,top,r-5,Math.PI*1.05,Math.PI*1.95);ctx.stroke();
  ctx.drawImage(NOTES[m.n%NOTES.length],m.x-4,Math.round(top-4));
  ctx.fillStyle='rgba(255,255,255,0.42)';ctx.beginPath();ctx.ellipse(m.x-5,top-6.2,3.2,1.5,-0.55,0,TAU);ctx.fill();
  if(fl)sparks(m.x,top,(G.now-G.flash['b'+k])/0.12,6,r+7);}
function drawLanes(){for(let k=0;k<4;k++){const cx=(LANEX[k]+LANEX[k+1])/2,on=G.lit[k],fl=G.now-(G.flash['l'+k]||-9)<0.25;
  if(on||fl)soft(cx,99,15,C.yel,0.45);dt(LETTERS[k],cx-5,92,2,on?C.yel:fl?C.white:C.dim,{outline:on||fl?'#3a2400':null});}}
function drawDrops(){DROPS.forEach((d,k)=>{const fl=G.now-d.t<0.15,x=DROPX[0],w=DROPX[1]-DROPX[0];
  if(d.up){const shp=dy=>{ctx.beginPath();ctx.moveTo(x,d.y-14+dy);ctx.lineTo(x+w,d.y-8+dy);ctx.lineTo(x+w,d.y+8+dy);ctx.lineTo(x,d.y+8+dy);ctx.closePath();};
    ctx.save();ctx.translate(1.5,2.5);shp(1);ctx.fillStyle='rgba(0,0,0,0.4)';ctx.fill();ctx.restore();shp(2.6);ctx.fillStyle=shade(C.pink,-0.6);ctx.fill();
    shp(0);const g=ctx.createLinearGradient(x,0,x+w,0);g.addColorStop(0,fl?'#ffffff':'#b46a9e');g.addColorStop(1,fl?'#ffffff':C.pink);ctx.fillStyle=g;ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.55)';ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(x+0.5,d.y-13.4);ctx.lineTo(x+w-0.5,d.y-7.6);ctx.stroke();dt(DROPL[k],x+4,d.y-3,1,'#3a0a30');}
  else{rrect(x,d.y+4,w,4,1.5);ctx.fillStyle='rgba(120,70,130,0.5)';ctx.fill();}});}
function drawLvt(){LVT.forEach((d,k)=>{const fl=G.now-d.t<0.15,x0=LVTX[0],x1=LVTX[1];
  if(d.up){const shp=dy=>{ctx.beginPath();ctx.moveTo(x1,d.y-14+dy);ctx.lineTo(x0,d.y-8+dy);ctx.lineTo(x0,d.y+8+dy);ctx.lineTo(x1,d.y+8+dy);ctx.closePath();};
    ctx.save();ctx.translate(-1,2.5);shp(1);ctx.fillStyle='rgba(0,0,0,0.4)';ctx.fill();ctx.restore();shp(2.6);ctx.fillStyle=shade(C.cyan,-0.6);ctx.fill();
    shp(0);const g=ctx.createLinearGradient(x0,0,x1,0);g.addColorStop(0,fl?'#ffffff':C.cyan);g.addColorStop(1,fl?'#ffffff':'#4f8fae');ctx.fillStyle=g;ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.6)';ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(x1-0.5,d.y-13.4);ctx.lineTo(x0+0.5,d.y-7.6);ctx.stroke();
    const s=LVL[k]?String(LVL[k].n):'?';dt(s,Math.round(236.5-tw(s)/2),d.y-3,1,'#0b2a3c');}
  else{rrect(x0,d.y+4,x1-x0,4,1.5);ctx.fillStyle='rgba(90,150,180,0.5)';ctx.fill();}});}
/* ---- dot-matrix display (121x16 dots): text is drawn 1:1 into DMDC with the usual font, then every lit pixel becomes a dot ---- */
const DMDC=mk(DC,DR),DMDG=DMDC.getContext('2d',{willReadFrequently:true});
/* pr: 1 small news, 2 dates and modes, 3 the ball itself; a message gives way only to one at least as important */
function say(seq,pr=1){if(G.msg&&curMsg()&&pr<G.msgP)return;G.msg=seq;G.msgT=G.now;G.msgP=pr;}
function curMsg(){if(!G.msg)return null;let t=G.now-G.msgT;for(const m of G.msg){if(t<m.d)return[m,t];t-=m.d;}G.msg=null;return null;}
const fmtN=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
/* one centred line; a line too long for the display slides across while it is shown */
function dline(s,y,t,d){const w=tw(s);let x;if(w<=DC-2)x=Math.round((DC-w)/2);else x=Math.round(1-(w-DC+2)*clamp((t-0.4)/Math.max(0.1,d-0.9)));dt(s,x,y,1,'#ffffff');}
function dmdText(){const sv=ctx;ctx=DMDG;DMDG.clearRect(0,0,DC,DR);const m=curMsg(),playing=G.state==='play'||G.state==='ready'||G.state==='drain';
  if(m&&playing){const[o,t]=m;if(!(o.blink&&Math.floor(t*6)%2)){
      if(o.big){const w=tw(o.big)*2;if(w<=DC)dt(o.big,Math.round((DC-w)/2),1,2,'#ffffff');else dline(o.big,4,t,o.d);}
      else{dline(o.l1||'',0,t,o.d);dline(o.l2||'',9,t,o.d);}}}
  else{
    if(G.state==='title'){const L=['2DEEP PINBALL','TOCCA PER GIOCARE',NEXT?[dayWord(NEXT),up(NEXT.venue)].join(' '):'PROSSIME DATE'];if(SONG&&SONG.midi&&SONG.name)L.push('BRANO: '+up(SONG.name));
      const k=Math.floor(G.now/2.6)%L.length,u=G.now%2.6;dline(L[k],0,u,2.6);}
    else if(G.state==='over'){dline('PUNTI '+fmtN(G.score),0,0,1);}
    else{dt(fmtN(G.score),1,0,1,'#ffffff');const lv=live(),st=lv&&G.jam?'X4 '+Math.ceil(G.liveUntil-G.now):lv?'LIVE X2 '+Math.ceil(G.liveUntil-G.now):G.combo&&G.now<G.comboUntil?'COMBO X'+G.combo:G.jam?'JAM X2':'PALLE '+G.balls;
      if(!(lv&&Math.floor(G.now*4)%2))dt(st,DC-1-tw(st),0,1,'#ffffff');}
    if(G.state==='ready'&&!G.pulling)dline(Math.floor(G.now*1.5)%2?'TIRA GIU LA MOLLA':'',9,0,1);else{const pg=Math.floor(G.now/2.4)%PAGES.length;dline(PAGES[pg],9,G.now%2.4,2.4);}}
  ctx=sv;}
function drawDMD(){dmdText();const d=DMDG.getImageData(0,0,DC,DR).data;ctx.beginPath();
  for(let j=0;j<DR;j++)for(let i=0;i<DC;i++)if(d[(j*DC+i)*4+3]>100){const x=DX+i*2+1,y=DY+j*2+1;ctx.moveTo(x+0.85,y);ctx.arc(x,y,0.85,0,TAU);}
  ctx.save();ctx.shadowColor='rgba(255,150,50,0.8)';ctx.shadowBlur=3*K;ctx.fillStyle='#ffc766';ctx.fill();ctx.restore();
  /* the sound switch at the right end of the display */
  const c=MUTED?'#7a5a3a':'#ffc766';ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(257,15);ctx.lineTo(259.5,15);ctx.lineTo(263,11.5);ctx.lineTo(263,24.5);ctx.lineTo(259.5,21);ctx.lineTo(257,21);ctx.closePath();ctx.fill();
  ctx.strokeStyle=c;ctx.lineWidth=0.9;ctx.lineCap='round';ctx.beginPath();if(MUTED){ctx.moveTo(258,28);ctx.lineTo(265,8);}else{ctx.arc(263,18,3,-0.9,0.9);ctx.moveTo(263+5.2*Math.cos(-0.9),18+5.2*Math.sin(-0.9));ctx.arc(263,18,5.2,-0.9,0.9);}ctx.stroke();}
/* the "Prossimi livelli" video drawn into the game: re-rendered at most 30 times a second */
let lvF=-1;function lvFrame(t){const f=Math.floor(t*30);if(f!==lvF){LVE.render(t);lvF=f;}return LVE.cv;}
function frameBox(x,y,w,h,title){ctx.save();ctx.shadowColor=rgba(C.cyan,0.35);ctx.shadowBlur=10*K;rrect(x-3,y-(title?14:3),w+6,h+(title?17:6),4);ctx.fillStyle='#1b1636';ctx.fill();ctx.restore();
  rrect(x-3,y-(title?14:3),w+6,h+(title?17:6),4);ctx.strokeStyle=rgba(C.cyan,0.7);ctx.lineWidth=1;ctx.stroke();
  if(title){dt(title,x+1,y-11,1,C.cyan);for(let k=0;k<3;k++)circle(x+w-3-k*7,y-7.5,2,[C.red,C.yel,C.pink][k]);}}
function drawHole(){const lit=G.encoreLit,bl=Math.floor(G.now*4)%2===0;if(G.hold)soft(HOLE.x,HOLE.y,18,C.yel,0.55);else if(lit&&bl)soft(HOLE.x,HOLE.y,16,C.yel,0.35);
  ctext(G.jam?'JAM':'ENCORE',HOLE.x,HOLE.y+13,1,lit?(bl?C.yel:C.white):G.jam?C.cyan:'#6a5ca6',{outline:null});}
function drawSofaTarget(){const y=SOFAT.y,tg=G.now-G.sofaOut;
  if(tg<SOFA_OUT){if(tg<0.9){const u=tg/0.9;ctx.save();ctx.globalAlpha=1-u;ctx.translate(G.sofaOutX+u*50,y-u*u*260);ctx.rotate(u*7);ctx.drawImage(SOFA_ICON,-20,-12);ctx.restore();}return;}
  const drop=tg-SOFA_OUT<0.45?Math.pow(1-(tg-SOFA_OUT)/0.45,2)*70:0,k=sofaStun(),x=Math.round(G.sofaX),st=G.stunUntil-G.sofaHit;
  const sh=k?Math.round(Math.sin((G.now-G.sofaHit)*30)*(1-(G.now-G.sofaHit)/st)*2):0;
  ctx.fillStyle='rgba(0,0,0,0.38)';ctx.beginPath();ctx.ellipse(x+1.5,y+12,18*(1-drop/140),3,0,0,TAU);ctx.fill();ctx.drawImage(k?SOFA_OK:SOFA_ICON,x-20+sh,Math.round(y-12-drop));
  if(k)for(let i=0;i<3;i++){const an=G.now*8+i*2.1;ctx.drawImage(SPARK,Math.round(x+Math.cos(an)*14-2),Math.round(y-16+Math.sin(an)*4-2));}
  /* the combo timer: the bar under the sofa runs down, the next multiplier blinks above it */
  if(G.combo&&!k&&G.now<G.comboUntil){const u=clamp((G.comboUntil-G.now)/G.comboWinLen),warn=G.comboUntil-G.now<1&&Math.floor(G.now*8)%2;
    rrect(x-16,y+16,32,3.5,1.75);ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fill();rrect(x-16,y+16,Math.max(3.5,32*u),3.5,1.75);ctx.fillStyle=warn?C.red:C.yel;ctx.fill();
    if(Math.floor(G.now*4)%2)ctext('X'+(G.combo+1),x,y-25,1,C.yel);}}
function drawSlings(){SLINGS.forEach(sl=>{if(G.now-(G.flash[sl.id]||-9)<0.1){ctx.save();ctx.shadowColor='#ffffff';ctx.shadowBlur=8*K;ctx.strokeStyle='#ffffff';ctx.lineWidth=2.5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(...sl.a);ctx.lineTo(...sl.c);ctx.stroke();ctx.restore();}});}
function drawLiveSign(){const on=live(),bl=on&&Math.floor(G.now*5)%2===0;if(on)soft(126,276,34,C.red,0.4);dt('LIVE',Math.round(126-tw('LIVE')*1.5),266,3,on?(bl?C.white:C.red):'#3e2440');}
/* the duo: in LIVE (and JAM) they dance on the spot in time with the song: knees bend on every beat, a little hop between beats,
   the upper body sways over two beats (Katia and Lorenzo mirrored, so they lean in and out together), strumming on the beat,
   a coloured light behind each. The dance fades in and out (G.dance) instead of starting with a jump */
function drawBand(){const d=G.dance,lv=live()||G.jam,jam=lv||G.now-G.bandJam<0.6,beat=(SONG&&SONG.beat)||0.4,ph=G.now/beat;
  const f=lv?[1,0,2,0][Math.floor(ph*2)%4]:jam?[1,0,2,0][Math.floor(G.now*8)%4]:0,bounce=(1-Math.cos(ph*TAU))/2,sway=Math.sin(ph*Math.PI);
  [[SPR.kat[f],14,418,1,C.pink],[SPR.lor[f],202,414,-1,C.cyan]].forEach(([sp,x,y,side,col])=>{const w=sp.width,h=sp.height,fx=x+w/2,fy=y+h;
    if(d>0.02){soft(fx,fy-h*0.55,h*0.8,col,0.22*d*(0.6+0.4*(1-bounce)));}
    const sq=1-0.08*d*(1-bounce),hop=-1.6*d*bounce,sh=0.11*d*sway*side;
    ctx.fillStyle='rgba(0,0,0,'+(0.32-0.1*d*bounce)+')';ctx.beginPath();ctx.ellipse(fx,fy-1,w*0.32*(1-0.12*d*bounce),2,0,0,TAU);ctx.fill();
    if(d<0.02&&!jam){ctx.drawImage(sp,x,y);return;}
    ctx.save();ctx.translate(fx,fy+hop);ctx.transform(1,0,-sh,sq,0,0);ctx.drawImage(sp,-w/2,-h-(jam&&!lv&&f?1:0));ctx.restore();});
  if(live()||G.jam)for(let k=0;k<3;k++){const u=(G.now*0.8+k/3)%1;ctx.drawImage(NOTES[k],Math.round(24+k*4+Math.sin(u*6)*3),Math.round(414-u*44));ctx.drawImage(NOTES[k+1],Math.round(216-k*4+Math.sin(u*6+1)*3),Math.round(410-u*44));}
  dt('KATIA',10,471,1,'#f3d8e6');dt('LORENZO',190,471,1,'#d8ecf3');}
function drawDrain(){const eat=G.state==='drain'&&G.now-G.stateT<0.5,y=458-(eat?Math.round(Math.sin((G.now-G.stateT)/0.5*Math.PI*3)*3):0);
  ctx.fillStyle='rgba(0,0,0,0.4)';ctx.beginPath();ctx.ellipse(127,481,19,3,0,0,TAU);ctx.fill();ctx.drawImage(SOFA_ICON,106,y);
  if(G.state==='play'&&G.now<G.saveUntil&&Math.floor(G.now*4)%2===0)ctext('SALVA',126,440,1,C.cyan,{outline:null});}
/* the plunger: a dark housing between the lane walls, a steel rod, a coil spring drawn as a helix (the back of each turn
   darker and behind the rod, the front lit and in front of it, so it reads as round) and a rubber tip the ball sits on */
function drawPlunger(){const p=G.state==='ready'?G.charge:0,tip=444+p*TRAVEL,cx=251,r=5.4,bot=479,n=8,top=tip+4.5,pitch=(bot-top)/n,e=1.5;
  const hg=ctx.createLinearGradient(243,0,259,0);hg.addColorStop(0,'#04030a');hg.addColorStop(0.5,'#17142e');hg.addColorStop(1,'#04030a');ctx.fillStyle=hg;ctx.fillRect(243,444,16,37);
  const coil=(i,front,style,w,dx=0,dy=0)=>{ctx.strokeStyle=style;ctx.lineWidth=w;ctx.lineCap='round';ctx.beginPath();
    for(let k=0;k<=10;k++){const t=i*TAU+(front?0:Math.PI)+Math.PI*k/10,x=cx+r*Math.cos(t)+dx,y=top+pitch*t/TAU+e*Math.sin(t)+dy;k?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();};
  for(let i=0;i<n;i++)coil(i,false,'#4a4a62',1.3);
  const rg=ctx.createLinearGradient(cx-1.5,0,cx+1.5,0);rg.addColorStop(0,'#5c5c74');rg.addColorStop(0.45,'#f4f4ff');rg.addColorStop(1,'#4c4c64');ctx.fillStyle=rg;ctx.fillRect(cx-1.4,tip+3,2.8,bot-tip);
  const fg=ctx.createLinearGradient(cx-r,0,cx+r,0);fg.addColorStop(0,'#70708a');fg.addColorStop(0.32,'#ffffff');fg.addColorStop(0.62,'#c4c4da');fg.addColorStop(1,'#62627c');
  for(let i=0;i<n;i++)coil(i,true,fg,1.7);for(let i=0;i<n;i++)coil(i,true,'rgba(255,255,255,0.55)',0.5,-1.2,-0.6);
  const cg=ctx.createLinearGradient(0,tip,0,tip+5);cg.addColorStop(0,'#e0606e');cg.addColorStop(0.5,'#8a1e30');cg.addColorStop(1,'#3a0a14');rrect(cx-6.6,tip,13.2,5,2.2);ctx.fillStyle=cg;ctx.fill();
  ctx.strokeStyle='rgba(255,220,225,0.6)';ctx.lineWidth=0.7;ctx.beginPath();ctx.moveTo(cx-5,tip+0.8);ctx.lineTo(cx+5,tip+0.8);ctx.stroke();
  const mg=ctx.createLinearGradient(243,0,259,0);mg.addColorStop(0,'#55556c');mg.addColorStop(0.4,'#e8e8f6');mg.addColorStop(1,'#4a4a60');rrect(243.5,477,15,3.5,1.2);ctx.fillStyle=mg;ctx.fill();
  if(G.state==='ready')drawSpringHint();}
/* the plunger lane shows the gesture: TIRA GIU written down the lane, three arrows, a fingertip sliding down onto the spring.
   While pulling, a power bar beside the lane fills from yellow to red */
/* while pulling, a magnifier above the thumb shows the spring and the ball 2.4x larger, framed by a ring that fills with the
   power (yellow to red). It copies that corner of the frame already drawn, so it shows exactly what is under the thumb */
function drawLoupe(){if(!G.pulling||!DRAG)return;const R=32,Z=2.1,sx=251,sy=453,half=R/Z;
  const cx=clamp(Math.min(DRAG.x-34,206),R+8,TW-R-8),cy=Math.max(R+44,Math.min(DRAG.y-88,sy-half-R-6));
  ctx.save();ctx.shadowColor='rgba(0,0,0,0.6)';ctx.shadowBlur=10*K;ctx.shadowOffsetY=3*K;circle(cx,cy,R+5,'#120d24');ctx.restore();
  ctx.save();ctx.beginPath();ctx.arc(cx,cy,R,0,TAU);ctx.clip();ctx.fillStyle='#16132e';ctx.fillRect(cx-R,cy-R,2*R,2*R);ctx.imageSmoothingEnabled=false;
  ctx.drawImage(cv,(sx-half)*K,(sy-half)*K,2*half*K,2*half*K,cx-R,cy-R,2*R,2*R);
  const gl=ctx.createLinearGradient(cx,cy-R,cx,cy);gl.addColorStop(0,'rgba(255,255,255,0.16)');gl.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=gl;ctx.fillRect(cx-R,cy-R,2*R,R);ctx.restore();
  ctx.lineWidth=4.5;ctx.lineCap='round';ctx.strokeStyle='rgba(255,255,255,0.12)';ctx.beginPath();ctx.arc(cx,cy,R+2.5,0,TAU);ctx.stroke();
  if(G.charge>0.005){const a0=-Math.PI/2,a1=a0+G.charge*TAU,c=G.charge<0.5?C.yel:G.charge<0.85?'#ffa040':C.red;ctx.strokeStyle=c;ctx.beginPath();ctx.arc(cx,cy,R+2.5,a0,a1);ctx.stroke();}
  ctext(Math.round(G.charge*100)+'%',cx,cy+R+9,1,G.charge>=1?C.red:C.white);}
function drawSpringHint(){
  if(G.pulling){const h=62*G.charge,g=ctx.createLinearGradient(0,444,0,382);g.addColorStop(0,C.yel);g.addColorStop(1,C.red);rrect(235.5,382,4.5,62,2);ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fill();
    if(h>0.5){rrect(235.5,444-h,4.5,h,2);ctx.fillStyle=g;ctx.fill();}return;}
  const fl=G.now-(G.hintFlash||-9)<1.2,on=!fl||Math.floor(G.now*8)%2===0;
  if(on){ctx.save();ctx.translate(255.5,286);ctx.rotate(Math.PI/2);dt('TIRA GIU',0,0,1,fl?C.white:C.yel,{outline:'#2a1a00'});ctx.restore();}
  for(let k=0;k<3;k++){const y=345+k*11,a=0.25+0.75*Math.max(0,Math.sin((G.now*3-k*0.7)*Math.PI)) ;ctx.strokeStyle=rgba(C.yel,a*(fl?1:0.85));ctx.lineWidth=1.6;ctx.lineCap='round';ctx.lineJoin='round';
    ctx.beginPath();ctx.moveTo(246.5,y);ctx.lineTo(251,y+4);ctx.lineTo(255.5,y);ctx.stroke();}
  const u=(G.now%1.5)/1.5;if(u<0.8){const v=u/0.8,y=344+v*62,a=v<0.12?v/0.12:v>0.8?(1-v)/0.2:1;
    ctx.strokeStyle='rgba(255,255,255,'+(0.28*a)+')';ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(251,344);ctx.lineTo(251,y);ctx.stroke();
    circle(251,y,4.6,'rgba(255,255,255,'+(0.9*a)+')');ctx.strokeStyle=rgba(C.yel,a);ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(251,y,6.2,0,TAU);ctx.stroke();}}
/* while the ball waits on the plunger: the three dates in big letters, ticked once their target has been hit in this game */
function drawTourCard(){if(!LVL.length)return;let a=0;
  if(G.state==='ready')a=clamp((G.now-G.readyT-0.15)/0.3);else if(G.state==='play')a=1-clamp((G.now-G.launchT)/0.35);if(a<=0)return;
  const x=22,w=206,n=Math.min(3,LVL.length),y=150,h=38+n*31;ctx.save();ctx.globalAlpha=a;
  ctx.save();ctx.shadowColor='rgba(0,0,0,0.6)';ctx.shadowBlur=12*K;ctx.shadowOffsetY=4*K;rrect(x,y,w,h,6);ctx.fillStyle='rgba(14,10,32,0.93)';ctx.fill();ctx.restore();
  rrect(x,y,w,h,6);ctx.strokeStyle=rgba(C.cyan,0.6);ctx.lineWidth=1;ctx.stroke();
  dt('PROSSIME DATE',x+8,y+7,1,C.cyan);const hint=G.lvGot.slice(0,n).every(Boolean)?'TOUR COMPLETO!':'BERSAGLI A DESTRA';dt(hint,x+w-8-tw(hint),y+7,1,G.lvGot.slice(0,n).every(Boolean)?C.yel:'#7d73a8');
  LVL.slice(0,3).forEach((l,k)=>{const ry=y+22+k*31,got=G.lvGot[k];
    circle(x+14,ry+7,7,got?C.cyan:'#2c2552');ctext(String(l.n),x+14,ry+4,1,got?'#0b2a3c':'#b8b0d8',{outline:null});
    dt(l.date,x+27,ry,2,got?C.yel:C.white);const pl=up(l.place);dt(pl,x+w-(got?22:9)-tw(pl),ry+4,1,'#9a90c0');
    if(got){ctx.strokeStyle=C.cyan;ctx.lineWidth=1.8;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(x+w-16,ry+7);ctx.lineTo(x+w-13,ry+10);ctx.lineTo(x+w-8,ry+3);ctx.stroke();}
    dt([up(l.venue),l.time].filter(Boolean).join(' · '),x+27,ry+17,1,got?C.cyan:'#b8b0d8');});
  const fy=y+h-12,pull='TIRA GIU LA MOLLA PER LANCIARE';ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+8,fy-5);ctx.lineTo(x+w-8,fy-5);ctx.stroke();
  dt(pull,x+8,fy,1,C.yel);const ax=x+w-14+Math.sin(G.now*5)*1.5;ctx.strokeStyle=C.yel;ctx.lineWidth=1.4;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(ax-5,fy+3.5);ctx.lineTo(ax+4,fy+3.5);ctx.moveTo(ax+1,fy+0.5);ctx.lineTo(ax+4,fy+3.5);ctx.lineTo(ax+1,fy+6.5);ctx.stroke();
  ctx.restore();}
function drawPops(){G.pops.forEach(p=>{const a=(G.now-p.t)/p.d;ctext(p.txt,Math.round(p.x),Math.round(p.y-a*(p.d>1.2?8:16)),p.sc,p.col);});}
function overlay(){if(G.state!=='title'&&G.state!=='over')return;ctx.fillStyle='rgba(10,8,24,0.88)';ctx.fillRect(0,37,TW,TH-37);const bl=Math.floor(G.now*2.5)%2===0;
  if(G.state==='title'){soft(135,70,90,C.pink,0.16);ctext('2DEEP',135,44,5,C.yel,{shadow:'#b0485a',sd:2});ctext('PINBALL',135,84,2,C.cyan);
    /* the backglass: the duo in front of the next venue, straight from the levels video */
    if(LVE&&NEXT){frameBox(63,106,144,144);ctx.imageSmoothingEnabled=false;ctx.drawImage(lvFrame(5.6+G.now%2),0,0,216,216,63,106,144,144);
      ctext('PROSSIMO LIVELLO '+NEXT.n,135,257,1,'#9a90c0',{outline:null});ftext(up(NEXT.venue),135,268,240,2,C.yel);
      ctext([dayWord(NEXT),NEXT.time,NEXT.place].filter(Boolean).map(up).join(' · '),135,286,1,C.white,{outline:null});}
    else{ctx.drawImage(SPR.kat[1],98,152);ctx.drawImage(SPR.lor[2],142,149);}
    [['TOCCA A SINISTRA E A DESTRA PER I FLIPPER',C.white],['TIRA GIU LA MOLLA PER LANCIARE','#9a90c0'],['D-E-E-P: OGNI LETTERA UNO STRUMENTO',C.yel],['TUTTE E QUATTRO: LIVE CON TUTTA LA BAND',C.yel],
     ['B-I-S A SINISTRA: ACCENDI ENCORE',C.pink],['ENCORE ACCESO: JAM SESSION',C.cyan],['LE TRE DATE A DESTRA: TOUR COMPLETO',C.cyan],['COLPISCI IL DIVANO DI FILA: COMBO',C.red]].forEach(([t,c],i)=>ctext(t,135,302+i*11,1,c,{outline:null}));
    if(bl)ctext('TOCCA PER GIOCARE',135,396,2,C.white);
    ctext(G.follower?'BONUS FOLLOWER ATTIVO: 4 PALLINE':'SEGUI @2DEEPLIVEMUSIC: +1 PALLINA',135,424,1,C.pink,{outline:null});ctext('TASTIERA: Z E M (O I DUE SHIFT), SPAZIO',135,440,1,'#6a5f96',{outline:null});}
  else{soft(135,110,110,C.pink,0.12);ctext('PARTITA FINITA',135,44,2,C.pink);ctext(fmtN(G.score),135,62,4,C.yel,{shadow:'#b0485a',sd:2});
    /* the levels map with the next dates, looping the first 17 seconds of the video */
    if(LVE&&NEXT){frameBox(15,112,240,135,'I PROSSIMI LIVELLI');ctx.imageSmoothingEnabled=false;ctx.drawImage(lvFrame(0.3+(G.now-G.stateT)%16.4),0,0,384,216,15,112,240,135);}
    else{ctx.drawImage(SOFA_ICON,115,150);ctext('NUOVE DATE IN ARRIVO',135,190,1,'#9a90c0',{outline:null});}
    if(IGF.hidden&&bl&&G.now-G.stateT>0.8)ctext('O TOCCA IL TAVOLO',135,TH-14,1,'#6a5f96',{outline:null});}}
function draw(){ctx=OUTX;ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;ctx.drawImage(STATIC,0,0);ctx.setTransform(K,0,0,K,0,0);ctx.imageSmoothingEnabled=false;
  drawLanes();drawDrops();drawLvt();drawSlings();drawLiveSign();drawHole();for(let k=0;k<3;k++)drawBumper(k);drawSofaTarget();
  drawBand();drawDrain();drawPlunger();FLIP.forEach(drawFlipper);
  if(G.state==='play'||G.state==='ready')for(const b of BALLS)sphere(b.x,b.y+(G.state==='ready'?G.charge*TRAVEL:0),BR);
  drawTourCard();drawPops();overlay();drawDMD();drawLoupe();}

/* ---------------- sound: live effects on the shared synth, the music pre-rendered as an 8-bar loop ---------------- */
let AC=null,SX=null,MUTED=false;
function gameSong(){const ev=[],E=0.2,BAR=1.6,push=(t,d,n,i,v=127)=>ev.push({t,d,m:typeof n==='number'?n:NN(n),v,i});
  const CH={C:['C4','E4','G4'],Am:['A3','C4','E4'],F:['A3','C4','F4'],G:['G3','B3','D4']},BS={C:['C3','G2','C3','E3'],Am:['A2','E2','A2','C3'],F:['F2','C3','F2','A2'],G:['G2','D3','G2','B2']};
  const PROG=['C','G','Am','F','C','G','F','G'];
  const MEL=[[['E5',1],['G5',1],['C6',2],['B5',1],['G5',1],['E5',2]],[['D5',1],['G5',1],['B5',1],['D6',2],['B5',1],['G5',2]],[['C5',1],['E5',1],['A5',1],['C6',2],['A5',1],['E5',2]],
    [['F5',1],['A5',1],['C6',1],['A5',1],['G5',1],['F5',1],['E5',1],['D5',1]],[['E5',1],['G5',1],['C6',2],['B5',1],['G5',1],['E5',2]],[['D5',1],['G5',1],['B5',1],['D6',2],['B5',1],['G5',2]],
    [['F5',1],['A5',1],['C6',1],['F6',2],['E6',1],['D6',1],['C6',1]],[['G5',1],['B5',1],['D6',1],['G6',1],['F6',1],['D6',1],['B5',2]]];
  PROG.forEach((c,b)=>{const t0=b*BAR;BS[c].forEach((n,i)=>push(t0+i*0.4,0.34,n,'bass'));for(let i=0;i<4;i++)CH[c].forEach(n=>push(t0+i*0.4+E,0.075,n,'skank'));
    for(let i=0;i<8;i++)push(t0+i*E,0.03,42,'drums',i%2?110:80);[0,2].forEach(k=>push(t0+k*0.4,0.1,36,'drums'));[1,3].forEach(k=>push(t0+k*0.4,0.1,38,'drums'));
    let tt=t0;MEL[b].forEach(([n,d])=>{push(tt,d*E,n,'lead',100);tt+=d*E;});});
  return ev;}
/* the song (music.js) is rendered as soon as the page opens; it starts with the first touch, when the browser allows sound */
function initAudio(){if(AC)return;const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;AC=new Ctx();try{AC.resume();}catch(e){}SX=new Engine(AC);SX.sfxBus.gain.value=0.9;
  if(SONGBUF)playSong(SONGBUF);}
function sfx(k,a){if(!SX||MUTED)return;const t=AC.currentTime+0.005,X=SX,bl=(tt,n,d,v,duty=0.25)=>X.osc(tt,d,mtof(NN(n)),duty,v,{decay:d*0.6});
  switch(k){
    case 'ratchet':X.noise(t,0.012,0.09,{hp:3500,decay:0.004});X.osc(t,0.03,500+a*90,0.25,0.05,{decay:0.015});if(a===10)bl(t+0.02,'C7',0.12,0.06);break;
    case 'flip':X.noise(t,0.03,0.1,{hp:2200,decay:0.01});X.osc(t,0.06,170,'sine',0.14,{sweep:80,decay:0.03});break;
    case 'bumper':X.noise(t,0.02,0.08,{hp:3000,decay:0.008});bl(t,['A5','C6','E6'][a],0.08,0.08);bl(t+0.03,['A6','C7','E7'][a],0.1,0.05,0.125);break;
    case 'sling':X.osc(t,0.06,300,0.5,0.08,{sweep:620,decay:0.03});break;
    case 'tick':X.noise(t,0.015,0.05,{hp:4000,decay:0.006});break;
    case 'drop':X.noise(t,0.05,0.12,{lp:900,decay:0.02});bl(t+0.02,['E6','G6','B6'][a],0.08,0.06,0.5);break;
    case 'bis':['B5','D6','G6','B6','D7'].forEach((n,i)=>bl(t+i*0.05,n,0.1,0.07));break;
    case 'sofa':X.osc(t,0.25,300,0.5,0.07,{sweep:900});X.osc(t+0.08,0.3,420,0.5,0.06,{sweep:110});X.noise(t,0.1,0.12,{lp:600,decay:0.04});
      [['C7','G6','C7'],['D7','A6','D7','F#7'],['E7','B6','E7','G#7','B7'],['F7','C7','F7','A7','C8']][Math.min(3,(a||1)-1)].forEach((n,i)=>bl(t+0.2+i*0.06,n,0.08,0.05));break;
    case 'evict':X.osc(t,0.6,200,0.5,0.07,{sweep:1800});X.noise(t,0.5,0.1,{hp:1200,decay:0.2});['C6','E6','G6','C7','E7','G7','C8','G7','C8'].forEach((n,i)=>bl(t+0.25+i*0.06,n,0.12,0.08,i%2?0.25:0.5));break;
    case 'lane':bl(t,['C6','E6','G6','C7'][a],0.14,0.08);bl(t+0.06,['C7','E7','G7','C8'][a],0.12,0.05);break;
    case 'live':['C6','E6','G6','C7','E7','G7','C8'].forEach((n,i)=>bl(t+i*0.05,n,0.12,0.08));X.noise(t,0.9,0.1,{hp:3000,decay:0.3});break;
    case 'jam':['G5','C6','E6','G6','C7','E7','G7','C8'].forEach((n,i)=>bl(t+i*0.06,n,0.14,0.08,0.5));X.noise(t,1.2,0.1,{hp:2500,decay:0.4});break;
    case 'holeIn':X.osc(t,0.15,160,'sine',0.25,{sweep:60,decay:0.06});X.noise(t,0.06,0.1,{lp:800,decay:0.03});['G6','C7'].forEach((n,i)=>bl(t+0.1+i*0.07,n,0.1,0.06));break;
    case 'holeOut':X.osc(t,0.18,300,0.5,0.06,{sweep:1200});X.noise(t,0.15,0.06,{hp:1500,decay:0.06});break;
    case 'launch':X.noise(t,0.2,0.08,{hp:1200,decay:0.08});X.osc(t,0.25,200,0.5,0.06,{sweep:700+a*500});break;
    case 'save':['E6','G6','E7'].forEach((n,i)=>bl(t+i*0.07,n,0.1,0.07));break;
    case 'gnam':X.osc(t,0.45,320,0.5,0.08,{sweep:60});X.noise(t+0.1,0.2,0.12,{lp:500,decay:0.08});X.osc(t+0.3,0.15,140,'sine',0.2,{sweep:70,decay:0.06});break;
    case 'over':['C6','G5','E5','C5'].forEach((n,i)=>bl(t+i*0.16,n,0.2,0.08,0.5));break;
    case 'level':X.noise(t,0.05,0.12,{lp:900,decay:0.02});['G5','C6','E6','G6'].forEach((n,i)=>bl(t+0.02+i*0.05,n,0.09,0.07,0.5));bl(t+0.24,['C7','D7','E7'][a],0.16,0.06);break;
    case 'tour':['C6','E6','G6','C7','G6','C7','E7','G7','C8'].forEach((n,i)=>bl(t+i*0.07,n,0.14,0.08,i%2?0.25:0.5));X.noise(t,1.4,0.1,{hp:2500,decay:0.45});break;
    case 'bonus':['C6','E6','G6','C7','E7'].forEach((n,i)=>bl(t+i*0.06,n,0.12,0.08));break;
    case 'start':['C6','E6','G6','C7'].forEach((n,i)=>bl(t+i*0.06,n,0.1,0.07));break;}}
function setMuted(m){MUTED=m;setMusicLevel();const b=document.getElementById('mute');b.setAttribute('aria-label',m?'Suono spento: tocca per accenderlo':'Suono acceso: tocca per spegnerlo');b.setAttribute('aria-pressed',m?'true':'false');}

/* ---------------- game over panel: follow and keep playing (Instagram does not let a page check a follow, so it works on trust),
   the next date into the calendar, play again ---------------- */
const IG=document.getElementById('ig'),IGF=document.getElementById('igFollow'),CAL=document.getElementById('cal'),MUTE=document.getElementById('mute');
if(NEXT){CAL.href=calURL(NEXT);CAL.querySelector('small').textContent=[NEXT.date,up(NEXT.venue),NEXT.time].filter(Boolean).join(' · ');document.getElementById('calDay').textContent=String(+NEXT.iso.slice(8,10));}else CAL.hidden=true;
function showIG(on){IG.hidden=!on;IGF.hidden=G.follower||G.continued;document.querySelector('#igSkip b').textContent=IGF.hidden?'RIGIOCA':'RIGIOCA DA CAPO';placeIG();}
function placeIG(){const r=cv.getBoundingClientRect(),s=stage.getBoundingClientRect(),X=r.left-s.left,Y=r.top-s.top;
  IG.style.left=(X+r.width*0.08)+'px';IG.style.width=(r.width*0.84)+'px';IG.style.top=(Y+r.height*256/480)+'px';
  const sb=document.getElementById('songBtn');sb.style.left=(X+r.width*6/270)+'px';sb.style.top=(Y+r.height*452/480)+'px';
  MUTE.style.left=(X+r.width*253/270)+'px';MUTE.style.top=Y+'px';MUTE.style.width=(r.width*16/270)+'px';MUTE.style.height=(r.height*37/480)+'px';}
IGF.addEventListener('click',()=>{initAudio();G.follower=true;try{localStorage.setItem(FOLLOW_KEY,'1');}catch(e){}
  G.continued=true;G.balls=1;serve();showIG(false);pop('GRAZIE! +1 PALLINA',135,300,C.pink,2);sfx('bonus');say([{big:'GRAZIE!',d:1.2},{l1:'+1 PALLINA',l2:'BUON DIVERTIMENTO',d:1.8}],3);});
CAL.addEventListener('click',()=>{sfx('bonus');});
document.getElementById('igSkip').addEventListener('click',()=>{initAudio();newGame();sfx('start');});
IG.addEventListener('pointerdown',e=>e.stopPropagation());

/* ---------------- input: touch halves, mouse, keyboard ----------------
   A flipper is up only while something still says it is held. Every pointer and every key keeps the time of its last sign of
   life; the state is checked again at every event, and a hold that nobody confirms any more is dropped:
   - pointers: the release is heard anywhere on the page, a lost capture counts as a release, a mouse moving with no button down
     is released, the touch list of every touch event says which fingers are really down;
   - keys: Shift is read from the event's own shiftKey (Windows does not report the release of one Shift while the other is held);
     a held letter or arrow repeats its keydown, so one that stops repeating has been let go;
   - leaving the window or the page, a new ball and the end of the game drop everything. */
const stage=document.getElementById('stage'),PTR=new Map(),KEYS={L:false,R:false},HELD=new Map();let chargePtr=null;
const nowMs=()=>performance.now(),isShift=c=>c==='ShiftLeft'||c==='ShiftRight';
function setFlips(){let l=KEYS.L,r=KEYS.R;for(const p of PTR.values()){if(p.side==='L')l=true;else r=true;}FLIP[0].on=l;FLIP[1].on=r;}
function keysNow(){KEYS.L=KL.some(c=>HELD.has(c));KEYS.R=KR.some(c=>HELD.has(c));setFlips();}
function press(side){if(!FLIP[side==='L'?0:1].on)sfx('flip');}
function startOrResume(){initAudio();if(G.state==='title'||(G.state==='over'&&IGF.hidden&&G.now-G.stateT>0.8)){newGame();sfx('start');return true;}return G.state==='over';}
function shiftCheck(e){if(!e.shiftKey&&(HELD.has('ShiftLeft')||HELD.has('ShiftRight'))){HELD.delete('ShiftLeft');HELD.delete('ShiftRight');keysNow();}}
/* the plunger: start in the plunger lane, pull the spring down and let go (finger or mouse); the further you pull, the
   stronger the shot. Holding anywhere else on the table still charges it, as before. */
let DRAG=null;const PULL=70;
const toTable=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*TW,(e.clientY-r.top)/r.height*TH];};
const inSpring=(x,y)=>x>=186&&y>=250;   /* the lower right of the table: the thumb can start well above the spring */
/* felt and heard while pulling: a ratchet click and, where the phone can, a short buzz at every tenth of the pull */
function springTicks(){const st=Math.floor(G.charge*10+1e-6);if(st===DRAG.step)return;if(st>DRAG.step){sfx('ratchet',st);try{if(navigator.vibrate)navigator.vibrate(st===10?18:6);}catch(e){}}DRAG.step=st;}
function springRelease(){const p=G.charge;DRAG=null;G.pulling=false;if(G.state!=='ready')return;if(p>=0.08)launch();else{G.charge=0;G.hintFlash=G.now;}}
stage.addEventListener('pointerdown',e=>{if(e.target.closest('#mute,#ig,#song,#songBtn'))return;e.preventDefault();if(e.pointerType==='mouse'&&e.button!==0)return;if(startOrResume())return;
  const tt=toTable(e);if(G.state==='ready'&&!DRAG&&inSpring(tt[0],tt[1])){DRAG={id:e.pointerId,y0:tt[1],x:tt[0],y:tt[1],step:0,type:e.pointerType,t:nowMs()};G.charge=0;G.charging=false;G.pulling=true;try{stage.setPointerCapture(e.pointerId);}catch(_){}return;}
  const r=cv.getBoundingClientRect(),side=e.clientX<r.left+r.width/2?'L':'R';press(side);PTR.set(e.pointerId,{side,type:e.pointerType,t:nowMs()});setFlips();
  if(G.state==='ready'&&chargePtr===null){chargePtr=e.pointerId;G.charging=true;}
  try{stage.setPointerCapture(e.pointerId);}catch(_){}});
const release=e=>{if(DRAG&&e.pointerId===DRAG.id){springRelease();return;}if(!PTR.has(e.pointerId))return;PTR.delete(e.pointerId);setFlips();if(e.pointerId===chargePtr){chargePtr=null;if(G.state==='ready'&&G.charging)launch();}};
stage.addEventListener('contextmenu',e=>e.preventDefault());
['pointerup','pointercancel'].forEach(t=>addEventListener(t,release,true));stage.addEventListener('lostpointercapture',release);
addEventListener('pointermove',e=>{shiftCheck(e);
  if(DRAG&&e.pointerId===DRAG.id){if(e.pointerType==='mouse'&&e.buttons===0)return springRelease();DRAG.t=nowMs();const tt=toTable(e);DRAG.x=tt[0];DRAG.y=tt[1];
    if(G.state==='ready'){G.charge=clamp((tt[1]-DRAG.y0)/PULL);springTicks();}return;}
  const p=PTR.get(e.pointerId);if(!p)return;if(e.pointerType==='mouse'&&e.buttons===0)release(e);else p.t=nowMs();},true);
/* the browser's own list of fingers on the glass: a finger that is not in it any more is not holding anything */
function touchCheck(e){const live=e.touches.length;if(DRAG&&DRAG.type==='touch'){if(live===0&&e.type!=='touchstart')springRelease();else DRAG.t=nowMs();}for(const[id,p]of PTR)if(p.type==='touch'&&live===0)release({pointerId:id});if(live)for(const p of PTR.values())if(p.type==='touch')p.t=nowMs();}
['touchstart','touchmove','touchend','touchcancel'].forEach(t=>addEventListener(t,touchCheck,{capture:true,passive:true}));
function releaseAll(){PTR.clear();HELD.clear();chargePtr=null;KEYS.L=KEYS.R=false;if(DRAG){DRAG=null;G.pulling=false;if(G.state==='ready')G.charge=0;}setFlips();}
addEventListener('blur',releaseAll);addEventListener('pagehide',releaseAll);document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseAll();});
/* called every frame: a key that stopped repeating, or a hold with no sign of life for 8 s, is let go */
function holdCheck(){const t=nowMs();let ch=false;
  for(const[c,k]of HELD)if((!isShift(c)&&t-k>1600)||t-k>8000){HELD.delete(c);ch=true;}if(ch)keysNow();
  for(const[id,p]of PTR)if(t-p.t>8000)release({pointerId:id});if(DRAG&&t-DRAG.t>8000){DRAG=null;G.pulling=false;G.charge=0;}}
const KL=['ArrowLeft','KeyZ','ShiftLeft','KeyA'],KR=['ArrowRight','KeyM','ShiftRight','KeyL','Slash'],KP=['Space','ArrowDown','Enter'];
addEventListener('keydown',e=>{if(!document.getElementById('song').hidden)return;if(!isShift(e.code))shiftCheck(e);
  const fl=KL.includes(e.code)||KR.includes(e.code);if(!fl&&!KP.includes(e.code))return;e.preventDefault();
  if(fl&&HELD.has(e.code))HELD.set(e.code,nowMs());if(e.repeat)return;if(startOrResume())return;
  if(fl){const side=KL.includes(e.code)?'L':'R';press(side);HELD.set(e.code,nowMs());keysNow();}
  if(KP.includes(e.code)&&G.state==='ready')G.charging=true;});
addEventListener('keyup',e=>{HELD.delete(e.code);if(isShift(e.code)){if(!e.shiftKey){HELD.delete('ShiftLeft');HELD.delete('ShiftRight');}}else shiftCheck(e);keysNow();
  if(KP.includes(e.code)&&G.state==='ready'&&G.charging)launch();});
document.getElementById('mute').addEventListener('click',()=>{initAudio();setMuted(!MUTED);});

/* ---------------- display: the table as large as the space allows, backing canvas a whole multiple ---------------- */
function fit(){const dpr=window.devicePixelRatio||1,aw=stage.clientWidth*dpr,ah=stage.clientHeight*dpr,s=Math.min(aw/TW,ah/TH),k=Math.max(1,Math.ceil(s));
  if(cv.width!==TW*k||K!==k){K=k;cv.width=TW*k;cv.height=TH*k;buildStatic();}cv.style.width=(TW*s/dpr)+'px';cv.style.height=(TH*s/dpr)+'px';placeIG();}
addEventListener('resize',fit);

/* ---------------- loop ---------------- */
let last=0,acc=0;
function frame(ts){const t=ts/1000;if(!last)last=t;acc+=Math.min(0.1,t-last);last=t;while(acc>=STEP){update(STEP);acc-=STEP;}draw();requestAnimationFrame(frame);}
function start(data){if(data&&data.state&&data.state!=='title'&&data.state!=='over'){G.score=data.score||0;G.balls=data.balls||1;G.lit=data.lit||[0,0,0,0];serve();}
  fit();if(!STATIC.width||STATIC.width!==TW*K)buildStatic();requestAnimationFrame(frame);}
window.claude?.hot?.snapshot?.(()=>({score:G.score,balls:G.balls,lit:G.lit,state:G.state}));
window.__G=G;window.__renderSong=renderSong;window.__song=()=>({SONG,SONGBUF,LAYERS,MLG:MLG.length});window.__LVT=LVT;window.__say=say;window.__balls=()=>BALLS;window.__setBalls=b=>{BALLS=b;};window.__FLIP=FLIP;window.__update=update;window.__draw=draw;window.__serve=serve;
window.claude?.hot?.ready?window.claude.hot.ready(start):start(window.claude?.hot?.data??{});
