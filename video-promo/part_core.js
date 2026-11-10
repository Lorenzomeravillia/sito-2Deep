/* ---------------- data ---------------- */
const NODES=[N7,N8,N9];
const DEF_CFG={first:7,
  levels:[{date:'SAB 14 NOV',venue:"MONKEY'S BAR",place:'CUGNAN',time:'18:00'},{date:'SAB 21 NOV',venue:'AL CANTONET',place:'FELTRE',time:'21:00'},{date:'SAB 28 NOV',venue:'AL CHIOSCHETTO',place:'CIMOLAIS',time:'16:00'}],
  past:[['13 AGO','CISON',1],['22 AGO','PIAN FALCINA',0],['05 SET','CIMOLAIS',1],['09 SET','PINO SOLITARIO',1],['27 SET','LASTREGHE',1],['03 OTT','CIMOLAIS',1],['10 OTT','OLTRERAI',1]].map(([date,venue,ok])=>({date,venue,ok:!!ok}))};
const LIM={date:12,venue:18,place:18,time:11,pdate:8,pvenue:20,past:7,cta:26};
const DEF_CTA='TAGGA CHI VIENE CON TE!';
const clean=s=>[...String(s==null?'':s).toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[’‘`´]/g,"'").replace(/[–—]/g,'-').replace(/\s+/g,' ')].filter(ch=>FONT[ch]).join('').trim();
const fmtTime=s=>/^\d/.test(s)?'ORE '+s:s;
let CFG,LV,PAST,RANK0=0;
/* a level left empty (after the first) becomes a "coming soon" card */
const SOON={date:'IN ARRIVO',venue:'NUOVA TAPPA',place:'SEGUICI SU 2DEEP.IT'};
/* which scene a venue gets when the editor says "automatico": first rule that matches venue or place wins, everything else gets the generic osteria */
const SCENE_RULES=[[/MONKEY/,'bar'],[/FELTRE|CANTONET/,'borgo'],[/CIMOLAIS|CHIOSCHETTO/,'baita']];
function autoScene(l){const s=clean(l.venue)+' '+clean(l.place);for(const[re,k]of SCENE_RULES)if(re.test(s))return k;return 'locale';}
const lvlEmpty=l=>!l.date&&!l.venue;
function setCfg(c){
  const L=c&&Array.isArray(c.levels)?c.levels:[],P=c&&Array.isArray(c.past)?c.past:[];
  const first=Math.max(1,Math.min(96,Math.round(+(c&&c.first))||DEF_CFG.first));
  const lvl=d=>{const v={date:clean(d.date).slice(0,LIM.date),venue:clean(d.venue).slice(0,LIM.venue),place:clean(d.place).slice(0,LIM.place),time:clean(d.time).slice(0,LIM.time),scene:SCENE_KEYS.includes(d.scene)?d.scene:'auto'};if(d.id!=null)v.id=String(d.id);return v;};
  CFG={first,levels:[0,1,2].map(i=>{let v=lvl(L[i]||DEF_CFG.levels[i]);if(i===0&&lvlEmpty(v))v=lvl(DEF_CFG.levels[0]);return v;}),
    past:P.map(p=>{const v={date:clean(p&&p.date).slice(0,LIM.pdate),venue:clean(p&&p.venue).slice(0,LIM.pvenue),ok:!(p&&p.ok===false)};if(p&&p.id!=null)v.id=String(p.id);return v;}).filter(p=>p.date||p.venue).slice(-LIM.past),
    cta:(c&&typeof c.cta==='string'?clean(c.cta):DEF_CTA).slice(0,LIM.cta)};
  LV=CFG.levels.map((l,i)=>{const soon=i>0&&lvlEmpty(l);
    return soon?{n:first+i,date:SOON.date,venue:SOON.venue,place:SOON.place,time:'',node:NODES[i],soon:true,scene:'soon'}
      :{n:first+i,date:l.date,venue:l.venue,place:l.place,time:fmtTime(l.time),node:NODES[i],soon:false,scene:l.scene!=='auto'?l.scene:autoScene(l)};});
  PAST=CFG.past.map(p=>[p.date,p.venue,p.ok?1:0]);
  RANK0=Math.max(0,first-1-PAST.filter(p=>p[2]).length);
  buildWorld(LV.map(L=>L.scene));
}
setCfg(DEF_CFG);
/* shrink a line one scale step at a time, then shorten it, so long names never spill out of their box */
/* each box lists the cuts to try, biggest first: [sx,sy] pixels per font dot. Past the last cut the name gets shortened. */
const STEPS={3:[[3,3],[2,3],[2,2],[1,2],[1,1]],2:[[2,2],[1,2],[1,1]],1:[[1,1]]};
function fitTxt(s,maxW,sc){const st=STEPS[sc];for(const c of st)if(tw(s)*c[0]<=maxW)return{s,sc:c,step:st.indexOf(c)};
  const c=st[st.length-1];while(s.length>1&&tw(s+'.')*c[0]>maxW)s=s.slice(0,-1);return{s:s.trimEnd()+'.',sc:c,step:-1};}
const dy=(sc,f)=>Math.round(3.5*(sc-f.sc[1]));
const BOX={cardDate:[128,2],cardVenue:[158,2],cardLine:[184,1],banDate:[190,3],banLine:[190,2],rowDate:[44,1],rowVenue:[120,1],rowVenueSkip:[70,1]};
const T={start:1.9,ls1End:3.2,walks:[[3.5,5.0],[7.7,9.2],[11.9,13.4],[16.1,17.4]],arrive:[5.0,9.2,13.4],iris:[16.7,17.1],score:17.1,ls2:21.6,close:27.2,end:DUR};
const STARS=Array.from({length:46},(_,i)=>({x:R(i*5.3)*W|0,y:4+(R(i*9.7)*150|0),big:R(i*2.2)>0.86,ph:R(i*1.3)*6.28,sp:1.5+R(i*4.4)*2.5}));
const SPR={lor:[0,1,2].map(buildLor),kat:[0,1,2].map(buildKat)};

function chars(t){
  const w=T.walks;if(t<w[0][0])return{x:S.x,y:S.y,walk:false,d:0};
  for(let i=0;i<w.length;i++){const[a,b]=w[i];if(t<a)return{...LEGS[i][0],walk:false,d:0};
    if(t<=b){const s=(t-a)/(b-a),u=0.5*s+0.5*s*s*(3-2*s),d=u*LEGLEN[i],p=legAt(i,d);return{x:p.x,y:p.y,walk:true,d};}}
  const p=legAt(3,LEGLEN[3]);return{x:p.x,y:p.y,walk:false,d:0};
}
const unlocked=(i,t)=>!LV[i].soon&&t>=T.arrive[i]+0.08;

/* ---------------- drawing pieces ---------------- */
function drawPair(x,y,walk,d,t,play,rise=26){
  x=Math.round(x);y=Math.round(y);
  const wf=walk?[1,0,2,0][Math.floor(d/8)%4]:0,bob=walk&&wf!==0?-1:0,bob2=walk&&wf===0?-1:0;
  const kx=x-26,ky=y-43+bob2,lx=x-3,ly=y-46+bob;
  ctx.drawImage(SPR.kat[wf],kx-1,ky-1);ctx.drawImage(SPR.lor[wf],lx-1,ly-1);
  const s=play?Math.floor(t/0.2)%2:0;
  rr(lx+9,ly+31-s,3,2,'#f2b48c');rr(lx+9,ly+33-s,3,1,'#c47e58');rr(kx+14,ky+28-s,3,2,'#f2b48c');
  if(play&&rise>0){for(let k=Math.floor((t-1.3)/0.42);k<=Math.floor(t/0.42);k++){if(k<0)continue;const age=t-k*0.42;if(age<0||age>1.3)continue;
    const left=k%2===0,bx=left?kx+9:lx+13,by=(left?ky:ly)-3;
    const nx=bx+Math.round(Math.sin(age*5+k)*4+(left?-age*7:age*7)),ny=by-Math.round(age*rise);
    if(age>1.0&&Math.floor(age*20)%2)continue;ctx.drawImage(NOTES[k%4],nx-3,ny-7);}}
}
function ellipse(cx,cy,rx,ry,c){for(let dy=-ry;dy<=ry;dy++){const dx=Math.round(rx*Math.sqrt(1-(dy/ry)*(dy/ry)));rr(cx-dx,cy+dy,dx*2+1,1,c);}}
function node(n,cy,on,t){const x=Math.round(n.x),y=Math.round(n.y-cy)+1;
  ellipse(x,y,10,3,on?'#a06a10':'#26263c');ellipse(x,y,9,2,on?'#ffd34a':'#4a4a68');
  if(on&&Math.floor(t*4)%3===0){rr(x-5,y-1,1,1,'#fff6c0');rr(x+4,y,1,1,'#fff6c0');}}
/* dynamic scene layers draw in home coordinates; DM mirrors them when the scene sits on the other side of the path */
let DM=false;
const mrr=(x,y,w,h,c)=>rr(DM?MAPW-x-w:x,y,w,h,c);
const mimg=(im,x,y)=>ctx.drawImage(im,DM?MAPW-x-im.width:x,y);
function win([x,y,w,h],cy,c1='#ffcf4a',c2='#fff2a8',c3='#b8781e'){y-=cy;mrr(x,y,w,h,c1);mrr(x+1,y+1,Math.min(3,w-2),1,c2);if(w>=8){mrr(x+(w>>1),y,1,h,c3);if(h>=8)mrr(x,y+(h>>1),w,1,c3);}}
function flick(t,ta){const d=t-ta;if(d<0)return 0;if(d<0.6)return [1,0,1,1,0,0,1,0,1,1][Math.floor(d/0.06)]??1;return (t*0.43)%1<0.025?0:1;}
function dynMonkey(t,cy,i){
  if(cy>620||cy<120)return;const on=unlocked(i,t),f=on?flick(t,T.arrive[i]+0.08):0;
  mimg(f?NEON.mOn:NEON.mOff,31,476-cy);mimg(f?NEON.bOn:NEON.bOff,59,484-cy);
  for(let k=0,x=18;x<=102;x+=6,k++){const c=on?['#ff4a5a','#ffe03a','#5ae06a','#5fe0ff','#ff7ad8'][(k+Math.floor(t*5))%5]:'#3a3a4a';mrr(x,522-cy,2,2,c);}
  if(on){MW.forEach(w=>win(w,cy));win(MDOOR,cy,'#ffb03a','#ffe0a0','#ffb03a');for(let x=52;x<66;x++)if((x+Math.floor(t*2))%2===0)mrr(x,549-cy,1,1,'#c8a048');}
}
function dynGate(t,cy,i){
  if(cy<450||cy>940)return;const on=unlocked(i,t),ta=T.arrive[i],wf=Math.floor(t*6)%2;
  [[111,772],[191,772]].forEach(([x,y])=>{(wf?["#####.","####..","###..."]:["####..","#####.","###..."]).forEach((r,j)=>{for(let i=0;i<r.length;i++)if(r[i]==='#')mrr(x+i,y+j-cy,1,1,i===0?'#a02030':'#e8384a');});});
  const lift=on?Math.round(easeOut(clamp((t-ta-0.1)/0.6))*35):0;
  for(let y=834;y<868;y++)for(let x=138;x<=162;x++){if(!inArch(x,y))continue;
    if(on)mrr(x,y-cy,1,1,y<850?'#ffb03a':(y<860?'#f09a30':'#d87a22'));
    const yy=y+lift;if(yy>=868)continue;if((x-138)%4===1||(yy-834)%5===2)mrr(x,y-cy,1,1,((x-138)%4===1&&(yy-834)%5===2)?'#7a7a96':'#3e3e56');}
  if(on){GW.forEach(w=>win(w,cy));for(let x=140;x<161;x++)if((x+Math.floor(t*3))%3===0)mrr(x,869-cy,1,1,'#c8a048');}
  mrr(93,836-cy,3,6,on?(R(Math.floor(t*14))>0.35?'#ffd34a':'#ffae2e'):'#3a3424');if(on)mrr(92,844-cy,5,1,'#5a4a20');
}
function dynChalet(t,cy,i){
  if(cy<780)return;if(unlocked(i,t))CW.forEach(w=>win(w,cy,'#ffcf4a','#fff2a8','#ffcf4a'));
  for(let i=0;i<5;i++){const age=((t*0.7+i/5)%1),x=Math.round(84+Math.sin(age*6+i)*2+age*10),y=Math.round(1119-age*34-cy),r=1+Math.round(age*2.4);
    if(age>0.75&&(Math.floor(t*20)+i)%2)continue;const col=age<0.4?'#9a9ac0':'#6a6a92';for(let j=-r;j<=r;j++)for(let k=-r;k<=r;k++)if(j*j+k*k<=r*r)mrr(x+k,y+j,1,1,col);}
}
/* level scenes that are not tied to one venue */
function dynLocale(t,cy,i){
  if(cy>620||cy<120)return;const on=unlocked(i,t),L=LV[i];
  for(let k=0,x=14;x<=106;x+=6,k++){const c=on?['#ff4a5a','#ffe03a','#5ae06a','#5fe0ff','#ff7ad8'][(k+Math.floor(t*5))%5]:'#3a3a4a';mrr(x,505-cy,2,2,c);}
  const rx=DM?MAPW-LSIGN[0]-LSIGN[1]:LSIGN[0],lit=on?flick(t,T.arrive[i]+0.08):0,o=lit?{shadow:'#a0602c'}:{},col=lit?'#ffe03a':'#8a6a3a';
  signLines(L.venue,LSIGN[1]-4).forEach((s,k,a)=>dt(s,rx+((LSIGN[1]-tw(s))>>1),(a.length>1?509+k*8:512)-cy,1,col,o));
  if(on){LW.forEach(w=>win(w,cy));win(LDOOR,cy,'#ffb03a','#ffe0a0','#ffb03a');for(let x=54;x<66;x++)if((x+Math.floor(t*2))%2===0)mrr(x,549-cy,1,1,'#c8a048');}
  mrr(72,530-cy,3,4,on?(R(Math.floor(t*14))>0.35?'#ffd34a':'#ffae2e'):'#3a3424');
  for(let k=0;k<4;k++){const age=((t*0.6+k/4)%1),x=Math.round(82+Math.sin(age*6+k)*2+age*8),y=Math.round(478-age*30-cy),r=1+Math.round(age*2);
    if(age>0.75&&(Math.floor(t*20)+k)%2)continue;const col=age<0.4?'#9a9ac0':'#6a6a92';for(let j=-r;j<=r;j++)for(let q=-r;q<=r;q++)if(j*j+q*q<=r*r)mrr(x+q,y+j,1,1,col);}
}
function dynSoon(t,cy,i){
  if(cy>620||cy<120)return;
  dt('?',DM?MAPW-53-15:53,499-cy,3,Math.floor(t*3)%2?'#ffe03a':'#ffb52e');
  const mx=DM?MAPW-60:60;for(let k=0;k<3;k++){const a=t*1.6+k*2.1,x=Math.round(mx+Math.cos(a)*34),y=Math.round(510+Math.sin(a)*20-cy);if(Math.floor(t*8+k)%3)ctx.drawImage(SPARK,x-2,y-2);}
}
/* venue name on the osteria board: one line if it fits, else split at the most balanced space, else shortened */
function signLines(s,mw){if(tw(s)<=mw)return[s];const w=s.split(' ');let best=null;
  for(let i=1;i<w.length;i++){const a=w.slice(0,i).join(' '),b=w.slice(i).join(' ');if(tw(a)<=mw&&tw(b)<=mw){const d=Math.abs(tw(a)-tw(b));if(!best||d<best.d)best={a,b,d};}}
  return best?[best.a,best.b]:[fitTxt(s,mw,1).s];}
const DYN={bar:dynMonkey,borgo:dynGate,baita:dynChalet,locale:dynLocale,soon:dynSoon};
function sceneDyn(t,cy){LV.forEach((L,i)=>{const p=placeOf(L.scene,i);DM=p.m;try{DYN[L.scene](t,cy-p.dy,i);}finally{DM=false;}});}
function padlock(i,t,cy){
  const n=LV[i].node,dtl=LV[i].soon?-1:t-T.arrive[i];if(dtl>0.55)return;
  const x=Math.round(n.x-3),by=Math.round(n.y-64-cy+Math.sin(t*4+i)*1.5);
  if(dtl<0){ctx.drawImage(LOCKC,x-1,by-1);return;}
  const y=by-Math.round(dtl*36);if(dtl>0.2&&Math.floor(dtl*24)%2)return;ctx.drawImage(LOCKO,x-1,y-2);
  for(let k=0;k<6;k++){const a=k*Math.PI/3+0.4,r=dtl*46;ctx.drawImage(SPARK,Math.round(n.x+Math.cos(a)*r-2),Math.round(by+3+Math.sin(a)*r-2));}
}
function snow(t,cy){WTER.forEach((tk,s)=>{if(tk!=='snow')return;const y0=SLOT0+s*SLOTH+20,len=s===2?620:320,n=s===2?70:36;if(cy+H<y0+10||cy>y0+len)return;
  for(let i=0;i<n;i++){const yw=y0+((R(i*3.1)*len+t*(16+R(i*5.7)*18))%len),x=Math.round(((R(i*1.7)*W+Math.sin(t*1.2+i)*5)%W+W)%W),y=Math.round(yw-cy);if(y<0||y>=H)continue;const b=R(i*8.8)>0.8?2:1;rr(x,y,b,b,'#eef2ff');}});}
function fogDrift(t,cy){if(cy+H<1300)return;for(let y=Math.max(0,1300-cy);y<H;y+=2){const wy=y+cy,d=clamp((wy-1300)/200)*0.35;for(let x=0;x<W;x++){const xx=x+Math.floor(t*10+wy*0.3);if(bay(xx,wy)<d*(0.6+0.4*Math.sin(xx*0.05+wy*0.02)))rr(x,y,1,1,'#4a4478');}}}
function panel(x,y,w,h,b='#ffe03a'){rr(x+1,y,w-2,h,b);rr(x,y+1,w,h-2,b);rr(x+1,y+1,w-2,h-2,'#7a4a12');rr(x+2,y+2,w-4,h-4,'#0a0b22');rr(x+2,y+2,w-4,1,'#1c1f4c');}
function line(s,y,sc,col,max,flash){dt(s,cx_(s,sc),y,sc,flash?'#ffffff':col,{shadow:'#000000',max});}
function banner(i,t){
  const tl=t-T.arrive[i];if(tl<0.15||tl>2.7)return;
  let k=clamp((tl-0.15)/0.2);if(tl>2.45)k=1-clamp((tl-2.45)/0.25);
  const bw=200,bh=106,by=192,w=Math.max(6,Math.round(bw*k)),h=Math.max(4,Math.round(bh*clamp(k*1.6)));
  panel(Math.round(108-w/2),Math.round(by+bh/2-h/2),w,h);if(k<1)return;
  const L=LV[i],typ=a=>Math.max(0,Math.floor((tl-a)/0.022)),lab='LIVELLO '+L.n;
  if(tl>0.35){const lx=cx_(lab,1);dt(lab,lx,by+8,1,'#ff7ad8',{max:typ(0.35)});rr(18,by+11,lx-24,1,'#3a3a7a');rr(lx+tw(lab)+6,by+11,W-18-(lx+tw(lab)+6),1,'#3a3a7a');}
  const fl=(s,y,[mw,sc],col,max,flash)=>{if(!s)return;const f=fitTxt(s,mw,sc);line(f.s,y+dy(sc,f),f.sc,col,max,flash);};
  if(tl>0.5)fl(L.date,by+20,BOX.banDate,'#ffe03a',typ(0.5),tl-0.5<0.07);
  if(tl>0.66)fl(L.venue,by+48,BOX.banLine,'#ffffff',typ(0.66));
  if(tl>0.82)fl(L.place,by+67,BOX.banLine,'#5fe0ff',typ(0.82));
  if(tl>0.96)fl(L.time,by+86,BOX.banLine,'#ff9a2e',typ(0.96));
}
function hud(t,lvn){const k=clamp((t-T.ls1End-0.05)/0.25);if(k<=0)return;const y=Math.round(-15+k*43);
  rr(0,y,W,14,'#05050e');rr(0,y+14,W,1,'#ffe03a');dt('2DEEP',6,y+4,1,'#ffe03a');dt('PROSSIMI LIVELLI',cx_('PROSSIMI LIVELLI',1),y+4,1,'#f4f2ff');const r='LV '+lvn;dt(r,W-6-tw(r),y+4,1,'#5fe0ff');}
const LOGOROW=['#fff3b0','#fff3b0','#ffe03a','#ffe03a','#ffb52e','#ff8a24','#ff6a1a'];
function logo(s,x,y,sc){let cx=x;for(const ch of s){const g=gl(ch);glyphs(ch,cx+2,y+2,sc,'#120a2a');for(const[dx,dy]of OUT8)glyphs(ch,cx+dx,y+dy,sc,'#120a2a');glyphs(ch,cx,y,sc,(_,r)=>LOGOROW[r]);cx+=(g[0].length+1)*sc;}}
function blinds(k){const h=Math.round(12*clamp(k));if(h<=0)return;ctx.fillStyle='#000';for(let y=0;y<H;y+=12)ctx.fillRect(0,y,W,h);}

