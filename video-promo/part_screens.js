/* ---------------- formats: portrait 216x384 (9:16) and landscape 384x216 (16:9), both drawn at 5x on export ---------------- */
let FMT='portrait';
const isL=()=>FMT==='landscape';
function setFormat(f){FMT=f==='landscape'?'landscape':'portrait';W=isL()?384:216;H=isL()?216:384;cv.width=W;cv.height=H;MAINCTX.imageSmoothingEnabled=false;}
/* draw with the usual helpers into another canvas (the landscape map view, for instance) */
function withTarget(c,fn){const pc=ctx,pw=W,ph=H;ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;W=c.width;H=c.height;try{fn();}finally{ctx=pc;W=pw;H=ph;}}
const cxAt=(s,sc,cx)=>Math.round(cx-tw(s)*(Array.isArray(sc)?sc[0]:sc)/2);
function recapBG(w,h){
  const c=mk(w,h),g=c.getContext('2d'),id=g.createImageData(w,h),D=id.data,base=Math.round(h*0.86);
  const sp=(x,y,col)=>{if(x<0||y<0||x>=w||y>=h)return;const v=hx(col),i=(y*w+x)*4;D[i]=v[0];D[i+1]=v[1];D[i+2]=v[2];D[i+3]=255;};
  const cs=['#05061a','#090c28','#0e1440','#141d54','#1b2862'].map(hx);
  for(let y=0;y<h;y++){const f=clamp(y/base)*(cs.length-1),k=Math.min(cs.length-2,Math.floor(f)),fr_=f-k;for(let x=0;x<w;x++){const v=fr_>bay(x,y)?cs[k+1]:cs[k],i=(y*w+x)*4;D[i]=v[0];D[i+1]=v[1];D[i+2]=v[2];D[i+3]=255;}}
  for(let x=0;x<w;x++){const u=x*216/w,hh=Math.max(30-Math.abs(u-40)*0.7,44-Math.abs(u-130)*0.6,26-Math.abs(u-205)*0.5)*(h/384)*1.4+(R(x*3.1)*2|0);for(let y=Math.round(base-hh);y<base;y++)sp(x,y,y<base-30*(h/384)?'#3a4a8a':(u>130?'#121a40':'#18214c'));}
  for(let y=base-4;y<h;y++)for(let x=0;x<w;x++){const n=R(Math.floor(x/7)*13.1+Math.floor(y/5)*7.7);sp(x,y,y<base-1?'#1a4a28':((n>0.7&&bay(x,y)<0.5)?'#1c4f2c':'#245f31'));}
  for(let k=0;k<Math.round(70*w/216);k++){const x=R(k*3.3)*w|0,y=base+2+(R(k*5.1)*(h-base-4)|0);sp(x,y,'#378a44');sp(x-1,y+1,'#378a44');sp(x+1,y+1,'#378a44');}
  const mx=w>h?146:190,my=22;for(let y=-9;y<=9;y++)for(let x=-9;x<=9;x++){const d=x*x+y*y;if(d<=80)sp(mx+x,my+y,d>64?'#cfc390':'#f1e6b4');}
  g.putImageData(id,0,0);return c;
}
const RECAPBG_L=recapBG(384,216);

/* ---------------- level select ---------------- */
function gateIcon(x,y){rr(x,y+4,7,18,'#6c6c8c');rr(x+17,y+4,7,18,'#6c6c8c');rr(x+7,y+9,10,13,'#5c5c7c');[0,4,17,21].forEach(o=>rr(x+o,y+2,3,2,'#6c6c8c'));rr(x+9,y+13,6,9,'#ffb03a');rr(x+10,y+12,4,1,'#ffb03a');rr(x+2,y+8,2,3,'#ffcf4a');rr(x+19,y+8,2,3,'#ffcf4a');rr(x+3,y-3,1,5,'#3a2a20');rr(x+4,y-3,3,2,'#e8384a');}
function hutIcon(x,y){for(let j=0;j<10;j++){rr(x+10-j,y+j,j+2,1,j<1?'#ffffff':'#f2f6ff');rr(x+12,y+j,j+2,1,'#c6d0f2');}rr(x,y+10,24,1,'#4a2412');rr(x+3,y+11,18,10,'#8a4e26');rr(x+3,y+14,18,1,'#5e3218');rr(x+3,y+18,18,1,'#5e3218');rr(x+6,y+13,8,4,'#ffcf4a');rr(x+16,y+14,3,7,'#4a2412');rr(x+17,y+1,3,5,'#6a6a88');rr(x+17,y,3,1,'#ffffff');rr(x+1,y+21,22,1,'#eef3ff');}
function houseIcon(x,y){for(let j=0;j<10;j++)rr(x+11-j,y+j,2*j+2,1,j%3===2?'#6a2014':'#a8402a');rr(x+2,y+10,20,11,'#c9b48a');rr(x+2,y+10,20,1,'#4a160e');rr(x+4,y+12,16,3,'#3a1e0e');rr(x+5,y+13,14,1,'#ffe03a');rr(x+4,y+16,5,4,'#ffcf4a');rr(x+14,y+16,5,5,'#140a06');rr(x+1,y+21,22,1,'#1a4426');}
function soonIcon(x,y,t){rr(x+3,y+1,18,18,'#5a3a1e');rr(x+4,y+2,16,16,'#8a5a2c');dt('?',x+7,y+3,2,Math.floor(t*3)%2?'#ffe03a':'#ffb52e');rr(x+11,y+19,2,3,'#5a3a1e');}
function sceneIcon(k,ix,y,t){if(k==='bar')ctx.drawImage(NEON.mOn,ix,y+4);else if(k==='borgo')gateIcon(ix-1,y+8);else if(k==='baita')hutIcon(ix-1,y+4);else if(k==='locale')houseIcon(ix-1,y+4);else soonIcon(ix-1,y+4,t);}
/* st: on (highlighted), pd (seconds since the virtual player pressed it, or <0), dim (other cards after the press), glint (0..1 sweep) */
function levelCard(L,i,x,y,w,st,t){
  const h=60,pd=st.pd,pr=pd>=0&&pd<0.1;
  if(pr){x+=1;y+=2;}
  let bc='#3a4aa8';
  if(st.on){if(pd<0)bc=Math.floor(t*6)%2?'#ffe03a':'#ffb52e';else if(pr)bc='#a07810';else if(pd<0.7)bc=RAIN[Math.floor(t*30)%7];else bc=Math.floor(t*8)%2?'#ffffff':'#ffe03a';}
  const fillOn=st.on?(pd>=0.1&&pd<0.34&&Math.floor(pd*20)%2===0?'#ffffff':(pr?'#22286a':'#151a48')):'#0e1236';
  rr(x+1,y,w-2,h,bc);rr(x,y+1,w,h-2,bc);rr(x+1,y+1,w-2,h-2,fillOn);rr(x+1,y+1,w-2,1,st.on?'#2a3070':'#1a2050');
  if(st.on&&pd>=0)rr(x+2,y+2,w-4,2,'#ffffff');
  const inv=fillOn==='#ffffff';
  const lv='LV'+L.n,bw=Math.max(25,tw(lv)+6),dx=x+bw+11;rr(x+6,y+6,bw,11,inv?'#120a2a':'#ffe03a');dt(lv,x+9,y+8,1,inv?'#ffe03a':'#120a2a');
  const fd=fitTxt(L.date,w-68-(dx-x-36),2),fv=fitTxt(L.venue,w-38,2);
  dt(fd.s,dx,y+5+dy(2,fd),fd.sc,inv?'#c02a9a':'#ffe03a',{shadow:inv?null:'#000000'});
  dt(fv.s,x+6,y+25+dy(2,fv),fv.sc,inv?'#120a2a':'#ffffff',{shadow:inv?null:'#000000'});
  const pl=L.place&&L.time?L.place+' · ':L.place,ft=fitTxt(pl+L.time,w-12,1);
  if(ft.s===pl+L.time){dt(pl,x+6,y+45,1,inv?'#123e78':'#5fe0ff');if(L.time)dt(L.time,x+6+tw(pl)+(pl?1:0),y+45,1,inv?'#a04a00':'#ff9a2e');}else dt(ft.s,x+6,y+45,1,'#5fe0ff');
  sceneIcon(L.scene,x+w-27,y,t);
  if(st.glint>0&&st.glint<1){ctx.globalAlpha=0.55;const gx=x-30+Math.round(st.glint*(w+60));for(let yy=0;yy<h;yy++){const xx=gx+Math.round(yy*0.5);if(xx>=x+1&&xx<x+w-4)rr(xx,y+yy,4,1,'#ffffff');}ctx.globalAlpha=1;}
  if(st.dim){ctx.globalAlpha=0.55;rr(x,y,w,h,'#05050e');ctx.globalAlpha=1;}
  if(st.on){const bob=pd>=0?Math.round(Math.abs(Math.sin(t*14))*3):0;if(pd>=0||Math.floor(t*4)%2===0)dt('>',x-9+bob,y+26,1,pd>=0?'#ffffff':'#ffe03a');}
  /* coin-op confirm: rings bouncing off the card and sparks from its corners */
  if(st.on&&pd>=0&&pd<0.75){[[0.03,'#ffe03a'],[0.2,'#ffffff'],[0.37,'#5fe0ff']].forEach(([d,c])=>{const a=pd-d;if(a<0||a>0.35)return;if(a>0.25&&Math.floor(a*30)%2)return;const g=Math.round(2+a*48);
      rr(x-g,y-g,w+2*g,1,c);rr(x-g,y+h+g-1,w+2*g,1,c);rr(x-g,y-g,1,h+2*g,c);rr(x+w+g-1,y-g,1,h+2*g,c);});
    if(pd<0.45)[[x,y,-1,-1],[x+w,y,1,-1],[x,y+h,-1,1],[x+w,y+h,1,1]].forEach(([cx,cy,sx,sy])=>{for(let j=0;j<3;j++){const an=0.25+j*0.55,r=4+pd*60;ctx.drawImage(SPARK,Math.round(cx+sx*Math.cos(an)*r-2),Math.round(cy+sy*Math.sin(an)*r-2));}});}
}
function lsScene(t,phase){
  const tl=phase===1?t:t-T.ls2,L_=isL();
  ctx.drawImage(L_?RECAPBG_L:RECAPBG,0,0);
  STARS.forEach(s=>{if(s.y>200)return;const v=Math.sin(t*s.sp+s.ph);if(v<-0.3)return;rr(L_?Math.round(s.x*384/216):s.x,Math.round(s.y*(L_?0.8:1.3)),1,1,v>0.6?'#ffffff':'#6a76c0');});
  const pd=phase===1?t-T.start:-1,pressed=pd>=0;
  const st=i=>phase===1?{on:i===0,pd:i===0?pd:-1,dim:pressed&&i!==0,glint:0}:{on:false,pd:-1,dim:false,glint:(tl-0.5-i*0.9)/0.45};
  let msg,mcol,msc=1;
  if(pressed){msg=Math.floor(pd*10)%2===0||pd>0.6?'1P START!':'';mcol=Math.floor(t*12)%2?'#ffffff':'#ffe03a';msc=2;}
  else{msg=Math.floor(tl+(phase===2?0.4:0))%2?'PRESS START':'VI ASPETTIAMO!';mcol=msg==='PRESS START'?'#ffe03a':'#5fe0ff';}
  if(L_){const cx=76;
    logo('2DEEP',cxAt('2DEEP',3,cx),16,3);
    dt('PROSSIMI',cxAt('PROSSIMI',2,cx),48,2,'#ffe03a',{outline:'#120a2a'});dt('LIVELLI',cxAt('LIVELLI',2,cx),66,2,'#ffe03a',{outline:'#120a2a'});
    dt('2DEEP.IT',cxAt('2DEEP.IT',2,cx),100,2,'#ffffff',{outline:'#120a2a'});
    if(msg)dt(msg,cxAt(msg,msc,cx),msc===2?120:124,msc,mcol,{outline:'#120a2a'});
    LV.forEach((L,i)=>levelCard(L,i,160,10+i*68,216,st(i),t));
    drawPair(cx,204,false,0,t,true,12);
  }else{
    logo('2DEEP',cx_('2DEEP',3),16,3);
    dt('PROSSIMI LIVELLI',cx_('PROSSIMI LIVELLI',2),52,2,'#ffe03a',{outline:'#120a2a'});
    LV.forEach((L,i)=>levelCard(L,i,12,72+i*66,196,st(i),t));
    dt('2DEEP.IT',cx_('2DEEP.IT',2),276,2,'#ffffff',{outline:'#120a2a'});
    if(msg)dt(msg,cx_(msg,msc),msc===2?294:297,msc,mcol,{outline:'#120a2a'});
    drawPair(108,374,false,0,t,true,12);
  }
  if(pressed&&pd<0.06){ctx.globalAlpha=0.35;rr(0,0,W,H,'#ffffff');ctx.globalAlpha=1;}
  if(phase===1&&t>T.ls1End-0.25)blinds((t-(T.ls1End-0.25))/0.25);
  if(phase===2&&tl<0.25)blinds(1-tl/0.25);
  if(phase===2&&t>T.close-0.25)blinds((t-(T.close-0.25))/0.25);
}

/* ---------------- map ---------------- */
function bannerAt(i,t,cx,by,bw,bh){
  const tl=t-T.arrive[i];if(tl<0.15||tl>2.7)return;
  let k=clamp((tl-0.15)/0.2);if(tl>2.45)k=1-clamp((tl-2.45)/0.25);
  const w=Math.max(6,Math.round(bw*k)),h=Math.max(4,Math.round(bh*clamp(k*1.6)));
  panel(Math.round(cx-w/2),Math.round(by+bh/2-h/2),w,h);if(k<1)return;
  const L=LV[i],typ=a=>Math.max(0,Math.floor((tl-a)/0.022)),lab='LIVELLO '+L.n,mw=bw-10,sp=(bh-20)/86;
  if(tl>0.35){const lx=cxAt(lab,1,cx),x0=Math.round(cx-bw/2)+10,x1=Math.round(cx+bw/2)-10;dt(lab,lx,by+8,1,'#ff7ad8',{max:typ(0.35)});rr(x0,by+11,lx-6-x0,1,'#3a3a7a');rr(lx+tw(lab)+6,by+11,x1-(lx+tw(lab)+6),1,'#3a3a7a');}
  const fl=(s,y,sc,col,max,flash)=>{if(!s)return;const f=fitTxt(s,mw,sc);dt(f.s,cxAt(f.s,f.sc,cx),y+dy(sc,f),f.sc,flash?'#ffffff':col,{shadow:'#000000',max});};
  if(tl>0.5)fl(L.date,by+20,3,'#ffe03a',typ(0.5),tl-0.5<0.07);
  if(tl>0.66)fl(L.venue,Math.round(by+20+28*sp),2,'#ffffff',typ(0.66));
  if(tl>0.82)fl(L.place,Math.round(by+20+47*sp),2,'#5fe0ff',typ(0.82));
  if(tl>0.96)fl(L.time,Math.round(by+20+66*sp),2,'#ff9a2e',typ(0.96));
}
function mapView(t,o){
  const c=chars(t),cy=clamp(Math.round(c.y-H*0.47),0,WH-H);
  ctx.drawImage(world,0,cy,W,H,0,0,W,H);
  if(cy<180)for(const s of STARS){const y=s.y-cy;if(y<0||y>=H)continue;const v=Math.sin(t*s.sp+s.ph);if(v<-0.6)continue;rr(s.x,y,1,1,v>0.5?'#ffffff':'#8a96e0');if(s.big&&v>0.5){rr(s.x-1,y,3,1,'#c8d0ff');rr(s.x,y-1,1,3,'#c8d0ff');rr(s.x,y,1,1,'#ffffff');}}
  sceneDyn(t,cy);
  LV.forEach((L,i)=>node(L.node,cy,unlocked(i,t),t));
  drawPair(c.x,c.y-cy,c.walk,c.d,t,!c.walk&&t<T.walks[3][0]);
  LV.forEach((_,i)=>padlock(i,t,cy));
  snow(t,cy);fogDrift(t,cy);
  if(o.hud)hud(t,LV[t>=T.walks[2][0]?2:t>=T.walks[1][0]?1:0].n);
  if(t>3.3&&t<3.95&&Math.floor(t*8)%2===0)dt('READY!',cx_('READY!',3),Math.round(H*0.26),3,'#ffe03a',{outline:'#120a2a',shadow:'#120a2a',sd:2});
  if(o.banner)LV.forEach((_,i)=>bannerAt(i,t,108,192,200,106));
  return{c,cy};
}
function iris(t,cx,cy,r0){if(t<=T.iris[0])return;const p=clamp((t-T.iris[0])/(T.iris[1]-T.iris[0])),r=Math.round(r0*(1-p)*(1-p));
  ctx.fillStyle='#000';for(let y=0;y<H;y++){const d=y-cy;if(Math.abs(d)>=r){ctx.fillRect(0,y,W,1);continue;}const dx=Math.floor(Math.sqrt(r*r-d*d));ctx.fillRect(0,y,Math.max(0,cx-dx),1);ctx.fillRect(cx+dx,y,W,1);}}
const MAPV=mk(216,216);
function sidePanelList(t,x0,y0){
  const cur=t>=T.walks[2][0]?2:t>=T.walks[1][0]?1:0;
  LV.forEach((L,i)=>{const y=y0+i*46,on=i===cur,open=unlocked(i,t);
    rr(x0,y,160,40,on?'#ffe03a':'#2a3474');rr(x0+1,y+1,158,38,on?'#151a48':'#0c0f2e');
    const lv='LV'+L.n;rr(x0+5,y+5,tw(lv)+6,11,open?'#7dff8a':'#ffe03a');dt(lv,x0+8,y+7,1,'#120a2a');
    const fd=fitTxt(L.date,160-tw(lv)-26,1).s;dt(fd,x0+tw(lv)+17,y+7,1,'#ffe03a');
    const fv=fitTxt(L.venue,150,1).s;dt(fv,x0+5,y+20,1,'#ffffff');
    const ln=[L.place,L.time].filter(Boolean).join(' · '),fl=fitTxt(ln,150,1).s;dt(fl,x0+5,y+30,1,'#5fe0ff');});
}
function mapScene(t){
  if(!isL()){const{c,cy}=mapView(t,{hud:true,banner:true});iris(t,Math.round(c.x),Math.round(c.y-cy-22),240);if(t<T.ls1End+0.25)blinds(1-(t-T.ls1End)/0.25);return;}
  let st;withTarget(MAPV,()=>{st=mapView(t,{hud:false,banner:false});});
  ctx.drawImage(MAPV,0,0);
  rr(216,0,168,216,'#070a1e');rr(216,0,1,216,'#ffe03a');for(let y=0;y<216;y+=4)rr(217,y,167,1,'#0a0e28');
  logo('2DEEP',cxAt('2DEEP',2,300),8,2);dt('PROSSIMI LIVELLI',cxAt('PROSSIMI LIVELLI',1,300),28,1,'#f4f2ff',{outline:'#120a2a'});
  const ban=LV.findIndex((_,i)=>{const tl=t-T.arrive[i];return tl>=0.15&&tl<=2.7;});
  if(ban<0)sidePanelList(t,220,44);else bannerAt(ban,t,300,44,162,150);
  iris(t,Math.round(st.c.x),Math.round(st.c.y-st.cy-22),420);
  if(t<T.ls1End+0.25)blinds(1-(t-T.ls1End)/0.25);
}

/* ---------------- levels already cleared ---------------- */
const ROWC=['#ffffff','#ffe03a','#5fe0ff','#ff7ad8','#7dff8a','#ff9a2e'];
const RAIN=['#ff4a5a','#ff9a2e','#ffe03a','#5ae06a','#5fe0ff','#7a8aff','#ff6ad8'];
function scoreRows(ts,x0,yh,rh){
  dt('DATA',x0+14,yh,1,'#6a6a9a');dt('LOCALE',x0+60,yh,1,'#6a6a9a');
  let rank=RANK0,count=RANK0,lastInc=-9;
  PAST.forEach(([d,v,ok],i)=>{const ta=0.5+i*0.32;if(ok)rank++;if(ts<ta)return;if(ok){count++;lastInc=ta;}
    const p=clamp((ts-ta)/0.15),ox=Math.round((1-easeOut(p))*150),y=yh+14+i*rh,col=ok?ROWC[i%6]:'#5a5a7a';
    const rs=ok?String(rank):'-';dt(rs,x0+Math.min(0,12-tw(rs))+ox,y,1,col);dt(fitTxt(d,...BOX.rowDate).s,x0+14+ox,y,1,col);dt(fitTxt(v,...(ok?BOX.rowVenue:BOX.rowVenueSkip)).s,x0+60+ox,y,1,col);
    if(ok)ctx.drawImage(CHECK,x0+186+ox,y+1);else{dt('SALTATO',x0+134+ox,y,1,'#5a5a7a');ctx.drawImage(STORM,x0+179+ox,y-1);}});
  return{count,lastInc};
}
function scoreScene(t){
  const ts=t-T.score;rr(0,0,W,H,'#05050e');
  for(let i=0;i<(isL()?70:50);i++){const y=Math.round((R(i*7.3)*H+ts*(8+R(i*2.9)*14))%H),x=R(i*3.7)*W|0;rr(x,y,1,1,R(i)>0.7?'#8a96e0':'#3a4278');}
  const rain=i=>RAIN[(i+Math.floor(ts*10))%7];
  if(isL()){
    dt('LIVELLI',cxAt('LIVELLI',2,82),22,2,rain,{shadow:'#000000'});dt('SUPERATI',cxAt('SUPERATI',2,82),40,2,i=>rain(i+7),{shadow:'#000000'});
    for(let y=14;y<200;y+=3)rr(170,y,1,2,'#3a3a6a');
    const r=scoreRows(ts,186,14,24);
    dt('TOTALE',cxAt('TOTALE',2,82),70,2,'#ffffff',{shadow:'#000000'});
    const n=String(r.count);dt(n,cxAt(n,4,82),90,4,ts-r.lastInc<0.09?'#ffffff':'#ffe03a',{shadow:'#7a4a12',sd:2});
    drawPair(82,206,false,0,t,true,14);
  }else{
    dt('LIVELLI SUPERATI',cx_('LIVELLI SUPERATI',2),58,2,rain,{shadow:'#000000'});
    for(let x=14;x<W-14;x+=3)rr(x,78,2,1,'#3a3a6a');
    const r=scoreRows(ts,12,86,15);
    for(let x=14;x<W-14;x+=3)rr(x,206,2,1,'#3a3a6a');
    dt('TOTALE',28,220,2,'#ffffff',{shadow:'#000000'});
    dt(String(r.count),150,214,4,ts-r.lastInc<0.09?'#ffffff':'#ffe03a',{shadow:'#7a4a12',sd:2});
    drawPair(108,334,false,0,t,true,16);
  }
  if(ts<0.25)fade(1-ts/0.25);
  if(t>T.ls2-0.25)blinds((t-(T.ls2-0.25))/0.25);
}
function render(t){
  t=((t%DUR)+DUR)%DUR;
  if(t<T.ls1End)lsScene(t,1);else if(t<T.score)mapScene(t);else if(t<T.ls2)scoreScene(t);else if(t<T.close)lsScene(t,2);else closingScene(t-T.close);
}
window.__setCfg=c=>setCfg(c);window.__cfg=()=>JSON.parse(JSON.stringify({CFG,LV:LV.map(({node,...r})=>r)}));
window.__render=render;window.__DUR=DUR;window.__setFormat=setFormat;
