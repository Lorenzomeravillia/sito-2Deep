/* Skanoid, the 2Deep's breakout (two builds of this code, one per music: the build puts the music in the slots below) (Arkanoid with ska in the name): candy-glass bricks over a neon sign with the next gig, music made by the ball.
   window.__GAME_DATA={events:[site_events rows], evento:id|null} comes before; window.__LAB=true shows the music lab. */
window.__GAME__=function(){
/* settings saved under the game's first name are carried over once */
const LS=k=>{try{let v=localStorage.getItem('skanoid_'+k);if(v==null){v=localStorage.getItem('mattoncini_'+k);if(v!=null)localStorage.setItem('skanoid_'+k,v);}return v;}catch(e){return null;}};
"use strict";
const W=270,H=480,TOP=40;
const cv=document.getElementById('c'),g=cv.getContext('2d'),wrap=document.getElementById('wrap'),optB=document.getElementById('opt'),moodB=document.getElementById('mood');
let scale=1,dpr=1,K=1;
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w));c.height=Math.max(1,Math.ceil(h));return c;};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function fit(){const r=wrap.getBoundingClientRect();scale=Math.min(r.width/W,r.height/H);dpr=Math.min(3,window.devicePixelRatio||1);K=scale*dpr;
  cv.style.width=Math.floor(W*scale)+'px';cv.style.height=Math.floor(H*scale)+'px';cv.width=Math.round(W*K);cv.height=Math.round(H*K);bake();}
function placeOpt(){const r=cv.getBoundingClientRect(),w=wrap.getBoundingClientRect();optB.style.left=(r.right-w.left-optB.offsetWidth-8)+'px';optB.style.top=(r.bottom-w.top-optB.offsetHeight-8)+'px';
  moodB.style.left=(r.left-w.left+8)+'px';moodB.style.top=(r.bottom-w.top-moodB.offsetHeight-8)+'px';}

/* ---- settings and record, per viewer ---- */
const SPEED={lenta:150,normale:185,veloce:225},PADW={S:38,M:48,L:60};
let S={speed:'normale',pad:'M',quant:'tempo',tune:432},best=0;
try{Object.assign(S,JSON.parse(LS('opts')||'{}'));best=+LS('best')||0;}catch(e){}
const save=()=>{try{localStorage.setItem('skanoid_opts',JSON.stringify(S));localStorage.setItem('skanoid_best',String(best));}catch(e){}};

/* ---- the gig, from the site's dates: the one in the address, otherwise the next published one that is not cancelled ---- */
const GIG=(function(){const D=window.__GAME_DATA||{},SKIP=/annull|rinviat|cancellat|saltat/i,pad=n=>String(n).padStart(2,'0'),d0=new Date(),
    today=d0.getFullYear()+'-'+pad(d0.getMonth()+1)+'-'+pad(d0.getDate()),ev0=(D.events||[]).filter(e=>e&&e.event_date);
  let ev=D.evento?ev0.find(e=>String(e.id)===String(D.evento)):null;
  if(!ev)ev=ev0.filter(e=>e.is_published!==false&&e.event_date>=today&&!SKIP.test(e.description||''))
    .sort((a,b)=>a.event_date<b.event_date?-1:a.event_date>b.event_date?1:String(a.event_time||'').localeCompare(String(b.event_time||'')))[0]||null;
  if(!ev)return null;const [y,m,d]=ev.event_date.split('-').map(Number),wd=new Date(y,m-1,d).getDay();
  const up=s=>String(s||'').replace(/\s*\(.*?\)\s*/g,' ').trim().toUpperCase();
  return{venue:up(ev.venue),city:up(ev.city),date:['DOM','LUN','MAR','MER','GIO','VEN','SAB'][wd]+' '+d+' '+['GEN','FEB','MAR','APR','MAG','GIU','LUG','AGO','SET','OTT','NOV','DIC'][m-1],
    time:ev.event_time?'ORE '+String(ev.event_time).slice(0,5):'',tbc:/confermar/i.test(ev.description||'')};})();
/* what each level's sign says: the gig first, then the band */
const SIGNS=[
  GIG?[['2DEEP LIVE',15,'#ff5fd2'],[GIG.venue,24,'#ff3d6e'],[GIG.date,30,'#ffd36b'],[[GIG.time,GIG.city].filter(Boolean).join(' · ')+(GIG.tbc?' (DA CONFERMARE)':''),16,'#4fe3ff']]
     :[['2DEEP LIVE',17,'#ff5fd2'],['ACOUSTIC',26,'#ff3d6e'],['SKA & REGGAE',26,'#ffd36b'],['2DEEP.IT',16,'#4fe3ff']],
  [['2DEEP',18,'#ff5fd2'],['DUE VOCI',28,'#ffd36b'],['DUE STRUMENTI',24,'#ff3d6e'],["UN'UNICA PROFONDITÀ",16,'#4fe3ff']],
  [['IL MURO SUONA',16,'#4fe3ff'],['A 432 HZ',32,'#ffd36b'],['ACOUSTIC',22,'#ff5fd2'],['SKA & REGGAE',18,'#ff3d6e']]];

/*__MUSIC__*/

/* =====================================================================================================
   GAME. The physics runs on a fixed step of 1/240 s, the same code for the game and for the forecast.
   ===================================================================================================== */
const COLS=10,ROWS=12,BW=25,BH=12,BX=(W-COLS*BW)/2,BY=TOP+34,STEP=1/240;
/* the wall in the colours of 70s neon signs, warm at the top and cool at the bottom; the second row of each pair leans toward the next colour */
const NEON70=['#ff2e88','#ff4b2b','#ff9a1f','#ffd23f','#2ee8c4','#3d8bff','#a35bff'];
const ROWCOL=Array.from({length:12},(_,r)=>r%2?mixHex(NEON70[r>>1],NEON70[(r>>1)+1],0.4):NEON70[r>>1]);
/* the walls, level by level: hit points per cell (1, or 2 and 3 for the bricks with extra tubes inside); the top rows are the ones that light the sign */
const LAYOUTS=[
  (r,c)=>r<2?2:1,
  (r,c)=>{const hx=Math.abs(c-4.5),heart=(r>=2&&r<=9)&&((r<=3&&(Math.abs(hx-2)<=1.2))||(r>3&&hx<=5.6-(r-3)*0.95));return heart?2:(r===0?3:1);},
  (r,c)=>(c===1||c===8)&&r>=1?3:((r+c)%3===0?2:1)];
const FCLOG=[];let notesLvl=0,bricks=[],balls=[],caps=[],parts=[],pops=[],trail=[],orbs=[],boss=null,bossDone=false,SIGN=[],lvl=1,flashSign=0;
let comboT=-9,paddle,st,lives=3,score=0,combo=0,hits=0,shake=0,wideT=[],slowUntil=0,t=0,sim=0,acc=0,stT=0,flash=0,slowT=0,slowF=1,zoom={x:W/2,y:H/2,t:-9},bannerTxt=null,bannerT=-9;
function banner(s){bannerTxt=s;bannerT=t;}
function buildLevel(){bricks=[];const lay=LAYOUTS[(lvl-1)%LAYOUTS.length],gold=new Set(),ng=6+Math.min(4,lvl);
  while(gold.size<ng)gold.add((2+Math.floor(Math.random()*10))*COLS+Math.floor(Math.random()*COLS));
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const hp=Math.min(3,lay(r,c)+(lvl>3&&r<3?1:0)),isG=hp===1&&gold.has(r*COLS+c),cap=isG?pickW([['M',0.45],['L',0.25],['S',0.15],['V',0.15]]):null;
    bricks.push({x:BX+c*BW,y:BY+r*BH,c,r,hp,max:hp,gift:isG,cap,col:isG?CAPS[cap].col:ROWCOL[r],alive:true,hitT:-9,wob:0});}
  bakeBricks();setSign(SIGNS[(lvl-1)%SIGNS.length]);notesLvl=0;boss=null;bossDone=false;caps=[];hits=Math.min(40,(lvl-1)*12);wideT=[];slowUntil=0;}
function newGame(){lvl=1;lives=3;score=0;paddle={x:W/2,y:H-46,h:10,base:PADW[S.pad],w:PADW[S.pad],sq:0,hitT:-9};buildLevel();newKey();ready();}
function nextLevel(){lvl++;lives=Math.min(5,lives+1);buildLevel();newKey();banner('LIVELLO '+lvl);ready();}
function ready(){st='ready';stT=t;combo=0;balls=[{x:paddle.x,y:paddle.y-4,vx:0,vy:0,r:3.2,stuck:true}];}
const alive=()=>bricks.reduce((n,b)=>n+(b.alive?1:0),0);
const targets=()=>alive()+(boss&&boss.hp>0?1:0)+(!bossDone&&!boss?1:0);
const speedOf=(h,su,tt)=>SPEED[S.speed]*speedFactor(h)*(tt<su?0.68:1);
function launch(){if(st!=='ready')return;st='play';const a=(Math.random()*0.5-0.25),sp=speedOf(hits,slowUntil,sim);
  for(const b of balls){b.stuck=false;b.vx=Math.sin(a)*sp;b.vy=-Math.cos(a)*sp;forecast(b);}startGroove();}

/* ---- the sign ---- */
const SIGNFONT=s=>s+'px "Tilt Neon", "Fredoka", sans-serif';
function setSign(lines){const ys=[16,46,86,122];SIGN=lines.map(([txt,size,col],i)=>({txt,size,col,y:BY+ys[i],letters:[],done:false}));layoutSign();bakeSign();}
function layoutSign(){const c=mk(10,10).getContext('2d');for(const L of SIGN){let size=L.size;c.font=SIGNFONT(size);let w=c.measureText(L.txt).width;const maxW=COLS*BW-14;if(w>maxW){size*=maxW/w;c.font=SIGNFONT(size);w=c.measureText(L.txt).width;}
  L.fs=size;let x=W/2-w/2;const old=L.letters;L.letters=[];for(let i=0;i<L.txt.length;i++){const ch=L.txt[i],cw=c.measureText(ch).width,o=old[i];
    L.letters.push({ch,x,w:cw,lit:o?o.lit:false,litT:o?o.litT:-9,space:ch===' '});x+=cw;}}}
function covered(l,L){const x0=l.x+l.w*0.2,x1=l.x+l.w*0.8,y0=L.y-L.fs*0.35,y1=L.y+L.fs*0.35;
  for(const b of bricks)if(b.alive&&b.x<x1&&b.x+BW>x0&&b.y<y1&&b.y+BH>y0)return true;return false;}
function checkSign(){for(const L of SIGN){let all=true;for(const l of L.letters){if(l.space)continue;if(!l.lit&&!covered(l,L)){l.lit=true;l.litT=t;letterBuzz();}if(!l.lit)all=false;}
  if(all&&!L.done){L.done=true;L.doneT=t;lineChime();slowT=Math.max(slowT,0.45);slowF=0.45;flash=Math.max(flash,0.25);}}}
function spawnBoss(){const hp=6+2*(lvl-1);boss={x:-40,y:BY+ROWS*BH+44,w:56,h:42,hp,max:hp,hitT:-9,t0:sim};banner(lvl>1?'RE DIVANO È TORNATO':'RE DIVANO!');}

/* ---- input: drag anywhere moves the paddle; a short tap launches; a mouse follows the pointer ---- */
let down=null;
cv.addEventListener('pointerdown',e=>{audio();if(AC&&AC.state==='suspended')AC.resume();startGroove();down={id:e.pointerId,t:performance.now(),moved:0,lx:e.clientX};try{cv.setPointerCapture(e.pointerId);}catch(_){}e.preventDefault();});
cv.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'&&!down){const r=cv.getBoundingClientRect();paddle.x=(e.clientX-r.left)/scale;clampPaddle();}});
/* drags and releases are heard on the whole window, each matched to the finger that started it: some phone browsers keep a touch
   that began on the Suono button on the button instead of handing it to the canvas, and the tap was lost there */
addEventListener('pointermove',e=>{if(!down||e.pointerId!==down.id)return;if(down.mood){down.my+=Math.abs(e.clientY-down.ly);down.ly=e.clientY;}paddle.x+=(e.clientX-down.lx)/scale*1.15;down.moved+=Math.abs(e.clientX-down.lx);down.lx=e.clientX;clampPaddle();e.preventDefault();});
moodB.addEventListener('pointerdown',e=>{down={id:e.pointerId,t:performance.now(),moved:0,lx:e.clientX,mood:true,my:0,ly:e.clientY};try{cv.setPointerCapture(e.pointerId);}catch(_){}e.preventDefault();});
moodB.addEventListener('click',e=>{if(e.detail===0)nextMood();});
/* touch defaults off on the game surface: no browser gesture starts from a drag on the canvas */
for(const el of [cv,moodB]){el.addEventListener('touchstart',e=>e.preventDefault(),{passive:false});el.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});}
addEventListener('pointerup',e=>{if(!down||e.pointerId!==down.id)return;const tap=down.moved<10&&performance.now()-down.t<350,fromMood=down.mood,still=down.moved+(down.my||0)<14;down=null;arm();
  if(fromMood){if(still)nextMood();return;}/* on the Suono button: a touch that stays put changes the tone, however long; a swipe only moves the paddle */
  if(st==='ready'&&(tap||e.pointerType==='mouse'))launch();else if(st==='over'&&t-stT>1.2)newGame();else if(st==='win'&&t-stT>1.6)nextLevel();});
addEventListener('pointercancel',e=>{if(down&&e.pointerId===down.id)down=null;});
function clampPaddle(){paddle.x=clamp(paddle.x,paddle.w/2+4,W-paddle.w/2-4);}
const keys={};addEventListener('keydown',e=>{keys[e.key]=true;if(e.key===' '){audio();startGroove();if(st==='ready')launch();else if(st==='over'&&t-stT>1.2)newGame();else if(st==='win'&&t-stT>1.6)nextLevel();e.preventDefault();}});
addEventListener('keyup',e=>{keys[e.key]=false;});

/* ---- the physics step, shared by the game and by the forecast ---- */
function collideRect(b,x0,y0,w,h){const nx=clamp(b.x,x0,x0+w),ny=clamp(b.y,y0,y0+h),dx=b.x-nx,dy=b.y-ny;if(dx*dx+dy*dy>b.r*b.r)return false;
  const ox=Math.min(b.x+b.r-x0,x0+w-(b.x-b.r)),oy=Math.min(b.y+b.r-y0,y0+h-(b.y-b.r));
  if(ox<oy){b.vx=b.x<x0+w/2?-Math.abs(b.vx):Math.abs(b.vx);b.x+=b.vx>0?ox:-ox;}else{b.vy=b.y<y0+h/2?-Math.abs(b.vy):Math.abs(b.vy);b.y+=b.vy>0?oy:-oy;}return true;}
function bossMove(B,tt){const life=B.hp/B.max,sp=0.9+(1-life)*1.6,u=tt-B.t0,tx=W/2+Math.sin(u*sp)*(W/2-40);B.x+=(tx-B.x)*Math.min(1,STEP*(u<1.2?2.2:5));}
/* one step of one ball in a world {bricks, boss, sim, hits, slowUntil}; on(kind, thing) reports what it touched */
function ballStep(b,Wd,on){const sp=speedOf(Wd.hits,Wd.slowUntil,Wd.sim),cur=Math.hypot(b.vx,b.vy)||1;b.vx*=sp/cur;b.vy*=sp/cur;
  b.x+=b.vx*STEP;b.y+=b.vy*STEP;
  if(b.x<b.r+3){b.x=b.r+3;b.vx=Math.abs(b.vx);on('wall');}
  if(b.x>W-b.r-3){b.x=W-b.r-3;b.vx=-Math.abs(b.vx);on('wall');}
  if(b.y<TOP+b.r+3){b.y=TOP+b.r+3;b.vy=Math.abs(b.vy);on('wall');}
  const B=Wd.boss;if(B&&B.hp>0&&collideRect(b,B.x-B.w/2,B.y-B.h/2,B.w,B.h)){if(Wd.sim-B.hitT>0.25){B.hitT=Wd.sim;B.hp--;on('boss',B);}}
  const c0=Math.floor((b.x-b.r-BX)/BW),c1=Math.floor((b.x+b.r-BX)/BW),r0=Math.floor((b.y-b.r-BY)/BH),r1=Math.floor((b.y+b.r-BY)/BH);
  for(let r=Math.max(0,r0);r<=Math.min(ROWS-1,r1);r++)for(let c=Math.max(0,c0);c<=Math.min(COLS-1,c1);c++){const k=Wd.bricks[r*COLS+c];if(!k.alive)continue;
    if(!collideRect(b,k.x,k.y,BW,BH))continue;if(Math.abs(b.vy)<sp*0.25)b.vy=(b.vy<0?-1:1)*sp*0.25;
    if(k.hp>1){k.hp--;on('tough',k);}else{k.alive=false;Wd.hits++;on('brick',k);}return;}}
/* the forecast: copy the world and run the ball until it comes back to the paddle's height */
function forecast(b){const Wd={bricks:bricks.map(k=>({x:k.x,y:k.y,r:k.r,c:k.c,alive:k.alive,hp:k.hp})),boss:boss?{...boss}:null,sim,hits,slowUntil},bb={...b},ev=[];let ret=null;
  for(let n=0;n<240*8;n++){Wd.sim+=STEP;if(Wd.boss)bossMove(Wd.boss,Wd.sim);
    ballStep(bb,Wd,(k,x)=>{if(k==='brick'||k==='boss')ev.push({k,t:Wd.sim-sim,r:x.r});else if(k==='tough')ev.push({k:'tough'});});
    if(bb.vy>0&&bb.y+bb.r>=paddle.y){ret=Wd.sim-sim;break;}if(bb.y>H)break;}
  startVolley(b,ev,ret);b.fc=ev.filter(e=>e.k!=='tough').length;}

/* ---- what happens when the real ball touches things ---- */
function burst(x,y,col,n,sp){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=(sp||70)*(0.35+Math.random());parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-35,life:0.5+Math.random()*0.4,t:0,col,s:1.5+Math.random()*2.5,rot:Math.random()*6,vr:(Math.random()-0.5)*14,shard:Math.random()<0.6});}
  if(parts.length>420)parts.splice(0,parts.length-420);}
function pop(txt,x,y,col,big){pops.push({txt,x:clamp(x,40,W-40),y,col:col||'#fff',t:0,big:!!big});}
function onReal(b){return (k,x)=>{
  if(k==='wall')wallNote();
  else if(k==='tough'){x.hitT=t;x.wob=1;toughNote();burst(b.x,b.y,x.col||'#ffffff',6,45);}
  else if(k==='brick'){const br=x;br.hitT=t;b.real=(b.real||0)+1;combo++;comboT=t;score+=10*Math.min(combo,12);ballNote(b,br);
    for(const n of bricks)if(n.alive&&Math.abs(n.c-br.c)<=1&&Math.abs(n.r-br.r)<=1){n.wob=Math.max(n.wob,0.6);n.hitT=Math.max(n.hitT,t-0.06);}
    burst(br.x+BW/2,br.y+BH/2,br.col,12,80);shake=Math.min(3.5,shake+0.8);
    if(br.gift||Math.random()<0.065){/* a gift brick always drops the capsule it shows; any other brick now and then a surprise */const kk=br.cap||pickW([['M',0.45],['L',0.25],['S',0.15],['V',0.15]]);caps.push({k:kk,x:br.x+BW/2,y:br.y+BH/2,vy:60});}
    const p=1-alive()/bricks.length;musicLevel(p);checkSign();if(!boss&&!bossDone&&p>=0.5)spawnBoss();
    if(targets()<=3)nearEnd();zoom.x=br.x+BW/2;zoom.y=br.y+BH/2;if(!targets())win();}
  else if(k==='boss'){const B=x;B.flashT=t;b.real=(b.real||0)+1;bossThump();ballNote(b,null);shake=Math.min(5,shake+2.5);burst(B.x,B.y,'#ff3d6e',10,70);burst(B.x,B.y-10,'#ffffff',6,50);score+=60;
    if(B.hp<=0){bossDone=true;burst(B.x,B.y,'#ff3d6e',40,140);burst(B.x,B.y,'#ffd36b',24,120);pop('RE DIVANO K.O.',B.x,B.y,'#ff5fd2',true);score+=500;lineChime();
      zoom.x=B.x;zoom.y=B.y;boss=null;if(targets()<=3)nearEnd();if(!targets())win();}}};}
const CAPS={L:{col:'#4fe3ff',txt:'RACCHETTA LARGA'},S:{col:'#5cf5a8',txt:'PALLINA LENTA'},M:{col:'#ff5fd2',txt:'TRE PALLINE'},V:{col:'#ff3d6e',txt:'VITA IN PIÙ'}};
function catchCap(c){const d=CAPS[c.k];let tx=d.txt;capNote();score+=50;
  /* wide paddle: up to two at once, each with its own 12 seconds; a third one only renews the older */
  if(c.k==='L'){const on=wideT.filter(x=>x>t).sort((a,b)=>a-b);if(on.length<2)on.push(t+12);else{on[0]=t+12;tx+=' · MAX';}if(on.length===2&&!tx.endsWith('MAX'))tx+=' x2';wideT=on;}
  pop(tx,c.x,paddle.y-20,d.col);
  if(c.k==='S')slowUntil=sim+10;else if(c.k==='V')lives=Math.min(5,lives+1);
  else if(c.k==='M'){const src=balls.find(b=>!b.stuck)||balls[0];if(!src)return;for(const a of [-0.5,0.5]){if(balls.length>=9)break;const sp=Math.hypot(src.vx,src.vy)||speedOf(hits,slowUntil,sim),ang=Math.atan2(src.vx,-src.vy)+a;
    const nb={x:src.x,y:src.y,vx:Math.sin(ang)*sp,vy:-Math.cos(ang)*sp,r:3.2,stuck:false};balls.push(nb);forecast(nb);}}}
function win(){st='win';stT=t;slowT=1.3;slowF=0.3;zoom.t=t;flash=1;balls=[];caps=[];SIGN.forEach(L=>L.letters.forEach(l=>{if(!l.lit){l.lit=true;l.litT=t;}}));
  if(score>best){best=score;save();}finaleMusic();for(let i=0;i<5;i++)setTimeout(()=>{burst(40+Math.random()*190,BY+Math.random()*140,['#ff5fd2','#4fe3ff','#ffd36b','#5cf5a8'][i%4],30,150);},i*180);}
function lose(){lives--;combo=0;loseNotes();shake=4;if(lives<=0){st='over';stT=t;if(score>best){best=score;save();}}else ready();}
function physStep(){sim+=STEP;if(boss)bossMove(boss,sim);const Wd={bricks,boss,get sim(){return sim;},get hits(){return hits;},set hits(v){hits=v;},slowUntil};
  for(const b of balls){if(b.stuck)continue;const prevVy=b.vy;ballStep(b,Wd,onReal(b));if(st!=='play')return;
    const p=paddle;if(b.vy>0&&b.y+b.r>=p.y&&b.y-b.r<=p.y+p.h&&b.x>=p.x-p.w/2-b.r&&b.x<=p.x+p.w/2+b.r){
      const sp=speedOf(hits,slowUntil,sim),rel=clamp((b.x-p.x)/(p.w/2),-1,1),ang=rel*1.05;b.vx=Math.sin(ang)*sp;b.vy=-Math.cos(ang)*sp;b.y=p.y-b.r;combo=0;p.sq=1;p.hitT=t;paddleNote();if(b.fc!=null){FCLOG.push([b.fc,b.real||0]);if(FCLOG.length>200)FCLOG.shift();}b.real=0;forecast(b);}}
  balls=balls.filter(b=>b.y<H+12);if(st==='play'&&!balls.length)lose();}
function update(dt){t+=dt;flash=Math.max(0,flash-dt*3);shake=Math.max(0,shake-dt*10);flashSign=Math.max(0,flashSign-dt*2.5);
  const kv=(keys.ArrowLeft?-1:0)+(keys.ArrowRight?1:0);if(kv){paddle.x+=kv*280*dt;clampPaddle();}
  const nw=wideT.filter(x=>x>t).length,tw=Math.min(96,paddle.base*[1,1.4,1.75][nw]);paddle.w+=(tw-paddle.w)*Math.min(1,dt*10);clampPaddle();paddle.sq=Math.max(0,paddle.sq-dt*5);
  for(const b of bricks)b.wob=Math.max(0,b.wob-dt*2.6);
  if(st==='ready'){for(const b of balls){b.x=paddle.x;b.y=paddle.y-b.r-1;}}
  if(st==='play'){acc+=dt;let n=0;while(acc>=STEP&&n<24){physStep();acc-=STEP;n++;if(st!=='play')break;}if(n>=24)acc=0;for(const b of balls)trail.push({x:b.x,y:b.y,t});}
  else acc=0;
  if(boss&&st!=='play'){/* the boss keeps breathing on the spot between lives */}
  for(const c of caps){c.y+=c.vy*dt;const p=paddle;if(c.y+5>=p.y&&c.y-5<=p.y+p.h&&Math.abs(c.x-p.x)<=p.w/2+8){c.got=true;catchCap(c);}}
  caps=caps.filter(c=>!c.got&&c.y<H+10);
  for(const q of parts){q.t+=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=240*dt;q.rot+=q.vr*dt;}parts=parts.filter(q=>q.t<q.life);
  for(const q of pops)q.t+=dt;pops=pops.filter(q=>q.t<1.4);trail=trail.filter(q=>t-q.t<0.14);
  for(const o of orbs){o.y-=o.v*dt;o.x+=Math.sin(t*0.3+o.p)*4*dt;if(o.y<-30){o.y=H+30;o.x=Math.random()*W;}}}

/* =====================================================================================================
   DRAWING: pre-baked at the screen's real resolution, candy glass, neon glows
   ===================================================================================================== */
const SPR={};
function hexA(h,a){const n=parseInt(h.slice(1),16);return 'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+a+')';}
function lighten(h,f){const n=parseInt(h.slice(1),16);return 'rgb('+[n>>16&255,n>>8&255,n&255].map(v=>Math.round(v+(255-v)*f)).join(',')+')';}
function darken(h,f){const n=parseInt(h.slice(1),16);return 'rgb('+[n>>16&255,n>>8&255,n&255].map(v=>Math.round(v*(1-f))).join(',')+')';}
const M=8;
/* the bricks: dark glass with a neon tube inside, in the row's colour. Bricks that need more hits have short extra tubes inside,
   one for every extra hit, that go dark one by one; the gift bricks show the letter of the capsule they drop and flicker */
const rnd=(a,b,c)=>{let h=(a*73856093)^(b*19349663)^(c*83492791);h=(h^(h>>>13))*1274126177;return ((h^(h>>>16))>>>0)/4294967296;};
function mixHex(a,b,f){const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16),m=(x,y)=>Math.round(x+(y-x)*f);
  return '#'+[m(A>>16&255,B>>16&255),m(A>>8&255,B>>8&255),m(A&255,B&255)].map(v=>clamp(v,0,255).toString(16).padStart(2,'0')).join('');}
function brickColour(b){if(b.gift)return CAPS[b.cap].col;const next=ROWCOL[Math.min(ROWS-1,b.r+1)];return mixHex(b.col,next,clamp(0.35*(b.c/(COLS-1))+0.08*(rnd(b.r,b.c,lvl)-0.5),0,1));}
function bakeNeon(col,hp,maxhp,letter){const c=mk((BW+2*M)*K,(BH+2*M)*K),x=c.getContext('2d');x.scale(K,K);x.translate(M+1,M+1);const w=BW-2,h=BH-2;
  x.beginPath();x.roundRect(0,0,w,h,2);x.fillStyle=mixHex(col,'#0a0418',0.8);x.fill();
  const gl=x.createLinearGradient(0,0,0,h);gl.addColorStop(0,hexA(col,0.3));gl.addColorStop(1,hexA(col,0.1));x.fillStyle=gl;x.beginPath();x.roundRect(0.5,0.5,w-1,h-1,1.8);x.fill();
  x.strokeStyle=hexA(col,0.5);x.lineWidth=0.5;x.beginPath();x.roundRect(0.25,0.25,w-0.5,h-0.5,2);x.stroke();
  const tube=(path,lit)=>{x.save();x.lineCap='round';x.lineJoin='round';
    if(lit){x.shadowColor=col;x.shadowBlur=4;x.strokeStyle=lighten(col,0.3);x.lineWidth=1.4;path();x.stroke();x.shadowBlur=0;x.strokeStyle='rgba(255,255,255,0.9)';x.lineWidth=0.45;path();x.stroke();}
    else{x.strokeStyle=hexA(col,0.3);x.lineWidth=1.1;path();x.stroke();}x.restore();};
  tube(()=>{x.beginPath();x.roundRect(2.1,2.1,w-4.2,h-4.2,2.1);},true);
  if(letter){x.save();x.font='700 7.5px "Fredoka", sans-serif';x.textAlign='center';x.textBaseline='middle';x.shadowColor=col;x.shadowBlur=3;x.fillStyle='#ffffff';x.fillText(letter,w/2,h/2+0.4);x.restore();}
  else if(maxhp>1){/* the extra tubes: one bar across the middle, or two side by side */const bars=maxhp===2?[[w/2-4.6,w/2+4.6]]:[[w/2-6.4,w/2-1.4],[w/2+1.4,w/2+6.4]];bars.forEach(([x0,x1],k)=>tube(()=>{x.beginPath();x.moveTo(x0,h/2);x.lineTo(x1,h/2);},k<hp-1));}
  x.fillStyle='rgba(255,255,255,0.22)';x.fillRect(1.2,0.9,w-2.4,0.55);
  return c;}
function bakeFlash(){const c=mk((BW+2*M)*K,(BH+2*M)*K),x=c.getContext('2d');x.scale(K,K);x.shadowColor='#ffffff';x.shadowBlur=5;x.fillStyle='#ffffff';x.beginPath();x.roundRect(M+1,M+1,BW-2,BH-2,2);x.fill();return c;}
function bakeBricks(){if(!K)return;for(const b of bricks){b.tint=brickColour(b);b.spr={};for(let hp=1;hp<=b.max;hp++)b.spr[hp]=bakeNeon(b.tint,hp,b.max,b.gift?b.cap:null);}SPR.whiteV=bakeFlash();}
const glowFor=col=>SPR.glow[col]||(SPR.glow[col]=bakeGlow(col));
function bakeGlow(col){const c=mk((BW+2*M)*K,(BH+2*M)*K),x=c.getContext('2d');x.scale(K,K);x.shadowColor=col;x.shadowBlur=7;x.fillStyle=col;x.beginPath();x.roundRect(M+1,M+1,BW-2,BH-2,3.6);x.fill();
  x.globalCompositeOperation='destination-out';x.shadowBlur=0;x.beginPath();x.roundRect(M+1,M+1,BW-2,BH-2,3.6);x.fill();return c;}
function bakeDot(r,col){const s=r*2,c=mk(s*K,s*K),x=c.getContext('2d');x.scale(K,K);const gr=x.createRadialGradient(r,r,0,r,r,r);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.25,col);gr.addColorStop(1,hexA(col,0));x.fillStyle=gr;x.fillRect(0,0,s,s);return c;}
function bakeLetter(l,L,lit){const pad=L.fs*0.8,c=mk((l.w+pad*2)*K,(L.fs*1.6+pad)*K),x=c.getContext('2d');x.scale(K,K);x.font=SIGNFONT(L.fs);x.textAlign='center';x.textBaseline='middle';const cx=l.w/2+pad,cy=(L.fs*1.6+pad)/2;
  if(lit){x.shadowColor=L.col;x.shadowBlur=L.fs*0.7;x.fillStyle=L.col;x.fillText(l.ch,cx,cy);x.shadowBlur=L.fs*0.25;x.fillText(l.ch,cx,cy);x.shadowBlur=0;x.fillStyle=lighten(L.col,0.75);x.fillText(l.ch,cx,cy);}
  else{x.fillStyle=hexA(L.col,0.13);x.fillText(l.ch,cx,cy);x.lineWidth=0.5;x.strokeStyle=hexA(L.col,0.22);x.strokeText(l.ch,cx,cy);}
  return {c,ox:-pad,oy:-cy};}
function bakeBg(){const c=mk(W*K,H*K),x=c.getContext('2d');x.scale(K,K);const gr=x.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#14072e');gr.addColorStop(0.55,'#0b0620');gr.addColorStop(1,'#05030c');x.fillStyle=gr;x.fillRect(0,0,W,H);
  x.globalAlpha=0.18;x.strokeStyle='#3d2a6e';x.lineWidth=0.5;for(let y=BY-6,r=0;y<BY+ROWS*BH+10;y+=9,r++){x.beginPath();x.moveTo(BX-4,y);x.lineTo(BX+COLS*BW+4,y);x.stroke();for(let xx=BX-4+(r%2)*9;xx<BX+COLS*BW+4;xx+=18){x.beginPath();x.moveTo(xx,y);x.lineTo(xx,y+9);x.stroke();}}
  x.globalAlpha=1;const fl=x.createLinearGradient(0,H-90,0,H);fl.addColorStop(0,'rgba(79,227,255,0)');fl.addColorStop(1,'rgba(79,227,255,0.10)');x.fillStyle=fl;x.fillRect(0,H-90,W,90);return c;}
/*__SOFA__*/
const CROWN=new Image();CROWN.src='/*__CROWN__*/';
function bakeSofa(){const w=60,h=w*(58+22)/104,c=mk((w+16)*K,(h+16)*K),x=c.getContext('2d');x.scale(K,K);x.translate(8,8);x.shadowColor='rgba(255,61,110,0.9)';x.shadowBlur=10;paintSofa(x,w,h,true);
  x.shadowBlur=0;if(CROWN.complete&&CROWN.naturalWidth){const cw=w*0.33;x.drawImage(CROWN,w/2-cw/2,-h*0.02,cw,cw*CROWN.naturalHeight/CROWN.naturalWidth);}return {c,w,h};}
CROWN.onload=()=>{if(K)SPR.sofa=bakeSofa();};
function bakeSign(){if(!K)return;for(const L of SIGN)for(const l of L.letters){if(l.space)continue;l.on=bakeLetter(l,L,true);l.off=bakeLetter(l,L,false);}}
/* the off-beat pulse: a pink glow from the edges of the screen */
function bakeVignette(){const c=mk(W*K,H*K),x=c.getContext('2d');x.scale(K,K);const gr=x.createRadialGradient(W/2,H/2,H*0.28,W/2,H/2,H*0.62);gr.addColorStop(0,'rgba(255,95,210,0)');gr.addColorStop(1,'rgba(255,95,210,0.55)');x.fillStyle=gr;x.fillRect(0,0,W,H);return c;}
const RM=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
function bake(){SPR.glow={};SPR.spark={};for(const col of new Set(ROWCOL.concat(Object.values(CAPS).map(d=>d.col),['#ffffff','#ffd36b'])))SPR.spark[col]=bakeDot(4,col);
  SPR.ball=bakeDot(9,'#bff6ff');SPR.orb=bakeDot(24,'#7a3cff');SPR.bg=bakeBg();SPR.vig=bakeVignette();layoutSign();bakeSign();SPR.sofa=bakeSofa();bakeBricks();}
function flick(d){if(d<0)return 0;for(const [e,v] of [[0.05,1],[0.12,0],[0.16,1],[0.27,0.2],[0.32,1]])if(d<e)return v;return 1;}
function txt(s,x,y,size,col,o={}){g.save();g.font=(o.w||700)+' '+size+'px '+getComputedStyle(document.body).fontFamily;g.textAlign=o.align||'center';g.textBaseline='middle';
  if(o.maxW){const w=g.measureText(s).width;if(w>o.maxW){g.translate(x,y);g.scale(o.maxW/w,o.maxW/w);g.translate(-x,-y);}}
  if(o.sc&&o.sc!==1){g.translate(x,y);g.scale(o.sc,o.sc);g.translate(-x,-y);}
  if(o.a!==undefined)g.globalAlpha=clamp(o.a,0,1);if(o.glow){g.shadowColor=o.glow;g.shadowBlur=o.blur||8;}
  if(o.stroke){g.lineJoin='round';g.lineWidth=o.stroke;g.strokeStyle='rgba(5,3,12,0.85)';g.strokeText(s,x,y);}
  g.fillStyle=col;g.fillText(s,x,y);g.restore();}
const spr=(c,x,y,w,h)=>g.drawImage(c,x,y,w,h);
function draw(){const be=beatEnv();g.setTransform(K,0,0,K,0,0);spr(SPR.bg,0,0,W,H);
  let zk=1;if(st==='win'){const u=t-zoom.t;zk=1+0.16*Math.sin(clamp(u/1.6,0,1)*Math.PI);}
  if(LEVARE_PULSE&&!RM&&be>0.01){const pz=1+0.006*be;g.translate(W/2,H/2);g.scale(pz,pz);g.translate(-W/2,-H/2);}
  const sx=shake?(Math.random()-0.5)*shake:0,sy=shake?(Math.random()-0.5)*shake:0;g.save();g.translate(sx+zoom.x,sy+zoom.y);g.scale(zk,zk);g.translate(-zoom.x,-zoom.y);
  g.globalCompositeOperation='lighter';for(const o of orbs){g.globalAlpha=0.10+0.10*be;spr(SPR.orb,o.x-o.s,o.y-o.s,o.s*2,o.s*2);}g.globalAlpha=1;
  for(const L of SIGN){const lf=Math.max(L.done?Math.max(0,1-(t-L.doneT)/0.6):0,flashSign*0.5);for(const l of L.letters){if(l.space||!l.on)continue;const off=l.off,on=l.on;
      g.globalCompositeOperation='source-over';spr(off.c,l.x+off.ox,L.y+off.oy,off.c.width/K,off.c.height/K);
      if(l.lit){g.globalCompositeOperation='lighter';g.globalAlpha=clamp(flick(t-l.litT)*(0.82+0.18*be),0,1);spr(on.c,l.x+on.ox,L.y+on.oy,on.c.width/K,on.c.height/K);
        if(lf>0){g.globalAlpha=lf*0.6;spr(on.c,l.x+on.ox,L.y+on.oy,on.c.width/K,on.c.height/K);}g.globalAlpha=1;}}}
  g.globalCompositeOperation='source-over';
  let sweep=-1;if(MLV()>=2&&st==='play'){const u=sweepPhase();if(u>=0&&u<0.7)sweep=u/0.7*1.25-0.12;}
  for(const b of bricks){if(!b.alive)continue;const u=t-b.hitT,wob=b.wob*Math.sin(u*38)*0.14,cx=b.x+BW/2,cy=b.y+BH/2;
    g.save();g.translate(cx,cy);g.scale(1+wob,1-wob);g.translate(-cx,-cy);
    /* a gift brick flickers now and then, like a neon tube about to go */const fl=b.gift?flick((t+b.c*0.37+b.r*0.53)%2.6):1;
    g.globalCompositeOperation='lighter';g.globalAlpha=(0.35+0.45*be)*(b.gift?1.25*fl:1);spr(glowFor(b.tint||b.col),b.x-M,b.y-M,BW+2*M,BH+2*M);g.globalAlpha=1;g.globalCompositeOperation='source-over';
    const img=u<0.07?SPR.whiteV:b.spr&&b.spr[b.hp];if(img){g.globalAlpha=0.45+0.55*fl;spr(img,b.x-M,b.y-M,BW+2*M,BH+2*M);g.globalAlpha=1;}
    if(sweep>=0){const d=(b.x+b.y*0.9)/(W+H*0.45),a=Math.max(0,1-Math.abs(d-sweep)/0.07);if(a>0){g.globalCompositeOperation='lighter';g.globalAlpha=a*0.32;spr(SPR.whiteV,b.x-M,b.y-M,BW+2*M,BH+2*M);g.globalAlpha=1;g.globalCompositeOperation='source-over';}}
    g.restore();}
  if(boss&&SPR.sofa){const u=t-(boss.flashT||-9),sq=u<0.3?Math.sin(u*30)*0.18*(1-u/0.3):0,br=Math.sin(t*3)*0.03,s=SPR.sofa;g.save();g.translate(boss.x,boss.y+boss.h/2);g.scale(1+sq+br,1-sq-br);
    spr(s.c,-s.w/2-8,-s.h-4,s.w+16,s.h+16);if(u<0.08){g.globalCompositeOperation='lighter';g.globalAlpha=0.6;spr(s.c,-s.w/2-8,-s.h-4,s.w+16,s.h+16);g.globalAlpha=1;g.globalCompositeOperation='source-over';}g.restore();
    for(let i=0;i<boss.max;i++){g.fillStyle=i<boss.hp?'#ff3d6e':'rgba(255,61,110,0.2)';g.beginPath();g.roundRect(boss.x-boss.max*3.5+i*7+1,boss.y-boss.h/2-10,5,3,1.5);g.fill();}}
  g.globalCompositeOperation='lighter';
  for(const q of trail){const a=1-(t-q.t)/0.14;g.globalAlpha=0.5*a;const r=6*a+2;spr(SPR.ball,q.x-r,q.y-r,r*2,r*2);}
  g.globalAlpha=1;for(const b of balls)spr(SPR.ball,b.x-9,b.y-9,18,18);
  for(const q of parts){const a=Math.max(0,1-q.t/q.life);g.globalAlpha=a;if(q.shard){g.globalCompositeOperation='source-over';g.save();g.translate(q.x,q.y);g.rotate(q.rot);g.fillStyle=q.col;g.fillRect(-q.s/2,-q.s/3,q.s,q.s*0.66);g.fillStyle='rgba(255,255,255,0.6)';g.fillRect(-q.s/2,-q.s/3,q.s,q.s*0.2);g.restore();}
    else{g.globalCompositeOperation='lighter';spr(SPR.spark[q.col]||SPR.spark['#ffffff'],q.x-4,q.y-4,8,8);}}
  g.globalAlpha=1;g.globalCompositeOperation='source-over';
  for(const c of caps){const d=CAPS[c.k];g.save();g.shadowColor=d.col;g.shadowBlur=10;const gr=g.createLinearGradient(0,c.y-6,0,c.y+6);gr.addColorStop(0,lighten(d.col,0.6));gr.addColorStop(1,darken(d.col,0.2));g.fillStyle=gr;g.beginPath();g.roundRect(c.x-12,c.y-6,24,12,6);g.fill();g.restore();
    g.fillStyle='rgba(255,255,255,0.7)';g.beginPath();g.roundRect(c.x-9,c.y-5,18,4,2);g.fill();txt(c.k,c.x,c.y+0.8,9,'#1a0f2e');}
  const p=paddle,sq=p.sq*3,ph=t-p.hitT<0.12;g.save();g.shadowColor='#4fe3ff';g.shadowBlur=14+8*be+(ph?14:0);const gr=g.createLinearGradient(0,p.y,0,p.y+p.h);gr.addColorStop(0,ph?'#ffffff':'#d8fbff');gr.addColorStop(0.5,'#4fe3ff');gr.addColorStop(1,'#1677a6');g.fillStyle=gr;
  g.beginPath();g.roundRect(p.x-p.w/2-sq/2,p.y+sq*0.35,p.w+sq,p.h-sq*0.35,5);g.fill();g.restore();
  g.strokeStyle='rgba(255,255,255,0.45)';g.lineWidth=0.4;for(let i=0;i<3;i++){const yy=p.y+3+i*2+sq*0.3;g.beginPath();g.moveTo(p.x-p.w/2+5,yy);g.lineTo(p.x+p.w/2-5,yy);g.stroke();}
  g.fillStyle='rgba(255,255,255,0.75)';g.beginPath();g.roundRect(p.x-p.w/2+4,p.y+1.2+sq*0.35,p.w-8,2.2,1.1);g.fill();
  for(const q of pops){const u=q.t/1.4,s=q.big?1.6:1.1;txt(q.txt,q.x,q.y-u*18,9*s,q.col,{a:Math.min(1,(1-u)*2.4),sc:1+0.25*Math.max(0,1-q.t*6),stroke:3,glow:q.col,blur:8});}
  g.restore();
  if(LEVARE_PULSE&&be>0.01&&SPR.vig&&st!=='over'){g.globalCompositeOperation='lighter';g.globalAlpha=0.16*be;spr(SPR.vig,0,0,W,H);g.globalAlpha=1;g.globalCompositeOperation='source-over';}
  if(flash>0){g.fillStyle='rgba(255,255,255,'+flash*0.45+')';g.fillRect(0,0,W,H);}
  if(combo>=3&&st==='play'){const u=t-comboT,k=1+0.35*Math.max(0,1-u*5),hot=Math.min(1,combo/12);
    txt('x'+Math.min(combo,12),14,H-72,13+hot*7,hot>0.6?'#ffd36b':'#ff5fd2',{align:'left',sc:k,glow:hot>0.6?'#ffb347':'#ff5fd2',blur:10+hot*8,stroke:4});txt('combo',15,H-58,8,'#a99cc8',{align:'left',w:600});}
  txt(String(score),12,18,16,'#ffffff',{align:'left',glow:'rgba(79,227,255,0.6)',blur:6});
  {const on432=S.tune===432,col=on432?'#ffd36b':'#4fe3ff',amp=1.6+4*be+3*flashSign,x0=W/2-44,y0=17;g.save();g.shadowColor=col;g.shadowBlur=8;g.strokeStyle=col;g.lineWidth=1.3;g.beginPath();
    for(let i=0;i<=26;i++){const xx=x0+i,yy=y0+Math.sin(i*0.75-t*9)*amp*Math.sin(i/26*Math.PI);if(i)g.lineTo(xx,yy);else g.moveTo(xx,yy);}g.stroke();g.restore();
    g.save();g.font='17px "Tilt Neon", "Fredoka", sans-serif';g.textAlign='left';g.textBaseline='middle';g.shadowColor=col;g.shadowBlur=10+8*be;g.fillStyle=lighten(col,0.4);g.fillText(S.tune+' Hz',W/2-12,y0+1);g.restore();}
  for(let i=0;i<lives;i++){const x=W-16-i*15,y=18;g.save();g.shadowColor='#ff3d6e';g.shadowBlur=6;g.fillStyle='#ff3d6e';g.beginPath();g.moveTo(x,y+4);g.bezierCurveTo(x-7,y-1,x-4,y-7,x,y-3);g.bezierCurveTo(x+4,y-7,x+7,y-1,x,y+4);g.fill();g.restore();}
  const pct=bricks.length?1-alive()/bricks.length:0;g.fillStyle='rgba(255,255,255,0.08)';g.beginPath();g.roundRect(12,30,W-24,4,2);g.fill();g.save();g.shadowColor='#ff5fd2';g.shadowBlur=8;g.fillStyle='#ff5fd2';g.beginPath();g.roundRect(12,30,Math.max(4,(W-24)*pct),4,2);g.fill();g.restore();
  txt('livello '+lvl+' · record '+Math.max(best,score),12,BY-14,8,'#a99cc8',{align:'left',w:600});{const hl=hudLabel();if(hl)txt(hl,W-12,BY-14,8,'rgba(79,227,255,0.8)',{align:'right',w:600,maxW:110});}
  if(LAB&&balls[0]&&balls[0].vol)txt('previsti '+balls[0].fc+' · suonati '+balls[0].vol.k,W/2+30,BY-14,8,'rgba(255,211,107,0.8)',{align:'center',w:600});
  if(bannerTxt&&t-bannerT<1.4){const u=(t-bannerT)/1.4;txt(bannerTxt,W/2,H-150,15,'#ffffff',{maxW:W-30,a:Math.min(1,(1-u)*3),sc:0.8+0.3*Math.min(1,u*6),glow:'#ff5fd2',blur:14,stroke:4});}
  const blink=0.6+0.4*Math.sin(t*5);
  if(st==='ready'){txt(lives===3&&score===0?'Tocca per lanciare':'Tocca per ripartire',W/2,H-86,13,'#ffd36b',{a:blink,glow:'rgba(255,211,107,0.7)',blur:10});
    if(lives===3&&score===0&&lvl===1){txt(startTitle(),W/2,H-124,15,'#ffd36b',{glow:'#ffb347',blur:12,stroke:3});txt(START_SUB,W/2,H-106,9.5,'#4fe3ff',{w:500,maxW:W-30});}}
  if(st==='over'||st==='win'){const u=t-stT;if(st==='over'){g.fillStyle='rgba(5,3,12,0.68)';g.fillRect(0,0,W,H);txt('Fine partita',W/2,H/2-30,26,'#ff3d6e',{glow:'#ff3d6e',blur:16});txt(score+' punti · livello '+lvl,W/2,H/2+4,14,'#ffffff');}
    else if(u>1){const a=clamp((u-1)/0.4,0,1);txt('Insegna accesa!',W/2,BY+ROWS*BH+40,22,'#ffd36b',{a,glow:'#ffd36b',blur:16,stroke:5});txt(winLine(),W/2,BY+ROWS*BH+66,12,'#ffffff',{a,maxW:W-30});}
    if(score>=best&&score>0&&u>1)txt('Nuovo record',W/2,st==='win'?BY+ROWS*BH+86:H/2+26,11,'#4fe3ff',{});
    if(u>(st==='win'?1.6:1.2))txt(st==='win'?'Tocca per il livello '+(lvl+1):'Tocca per rigiocare',W/2,H-80,13,'#ffd36b',{a:blink});}}

/* ---- options and the music lab, open to everyone (settings stay in this browser); ?lab=1 also shows the forecast check ---- */
const LAB=!!window.__LAB||/[?&]lab=1/.test(location.search);
const sheet=document.getElementById('sheet'),$=id=>document.getElementById(id);
function syncSeg(){document.querySelectorAll('.seg[data-k]').forEach(s=>s.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(String(S[s.dataset.k])===b.dataset.v))));}
document.querySelectorAll('.seg[data-k]').forEach(s=>s.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const k=s.dataset.k;S[k]=k==='tune'?+b.dataset.v:b.dataset.v;save();syncSeg();
  if(k==='pad')paddle.base=PADW[S.pad];if(k==='tune')onTune();}));
/*__MUSIC_UI__*/
/* a back swipe pauses instead of leaving: one history entry of our own, added on a release (a real user gesture).
   In apps like Facebook the back gesture walks the page history first, so the first swipe lands here */
let guard=false;
function arm(){if(guard)return;try{history.pushState({skanoid:1},'',location.href);guard=true;}catch(e){}}
addEventListener('popstate',()=>{if(!guard)return;guard=false;if(st==='over'){history.back();return;}
  if(sheet.hidden){$('pauseNote').hidden=false;sheet.hidden=false;syncSeg();syncMusic();}});
/* the music to play, also in the options: changing it loads the page again with the other one */
document.querySelectorAll('#musicSeg button').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.mode===MODE));
  b.addEventListener('click',()=>{if(b.dataset.mode===MODE)return;try{localStorage.setItem('skanoid_musica',b.dataset.mode);}catch(e){}const u=new URL(location.href);u.searchParams.set('musica',b.dataset.mode);location.replace(u.toString());});});
optB.addEventListener('click',()=>{$('pauseNote').hidden=true;sheet.hidden=false;syncSeg();syncMusic();});
$('close').addEventListener('click',()=>{sheet.hidden=true;$('pauseNote').hidden=true;arm();audio();if(AC&&AC.state==='suspended')AC.resume();startGroove();});
$('close2').addEventListener('click',()=>$('close').click());/* the same Play, always at the top of the sheet */
document.addEventListener('visibilitychange',()=>{if(!AC)return;if(document.hidden)AC.suspend();else AC.resume();});
for(let i=0;i<9;i++)orbs.push({x:Math.random()*W,y:Math.random()*H,v:4+Math.random()*7,s:14+Math.random()*22,p:Math.random()*6});
paddle={x:W/2,y:H-46,h:10,base:PADW[S.pad],w:PADW[S.pad],sq:0,hitT:-9};
setSign(SIGNS[0]);showMood();addEventListener('resize',()=>{fit();placeOpt();});fit();placeOpt();
if(document.fonts){document.fonts.load('30px "Tilt Neon"').then(()=>document.fonts.load('700 16px "Fredoka"')).then(()=>{bake();placeOpt();}).catch(()=>{});}
newGame();let last=performance.now();
window.__SKANOID=Object.defineProperties({MODE,startAudio(){audio();if(AC&&AC.state==='suspended')AC.resume();startGroove();},FCLOG,get bricks(){return bricks;},get balls(){return balls;},get boss(){return boss;},get st(){return st;},onReal,forecast,win,nextLevel,get lvl(){return lvl;},catchCap,get paddle(){return paddle;},get t(){return t;},get sim(){return sim;},get lives(){return lives;},set lives(v){lives=v;}},Object.getOwnPropertyDescriptors(musicDebug()));
function frame(now){let dt=Math.min(1/30,(now-last)/1000);last=now;if(slowT>0){slowT-=dt;dt*=slowF;}if(sheet.hidden&&!document.hidden)update(dt);if(!document.hidden)musicTick();draw();requestAnimationFrame(frame);}
requestAnimationFrame(frame);
};
