/* ---------------- world ---------------- */
const WH=1600,MAPW=216;
const S={x:108,y:230},N7={x:160,y:540},N8={x:56,y:860},N9={x:160,y:1180},EN={x:56,y:1500};
const LEGS=[[S,{x:160,y:262},N7],[N7,{x:160,y:566},{x:56,y:626},N8],[N8,{x:56,y:886},{x:160,y:946},N9],[N9,{x:160,y:1206},{x:56,y:1266},EN]];
const LEGLEN=LEGS.map(pts=>{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i].x-pts[i-1].x,pts[i].y-pts[i-1].y);return L;});
function legAt(li,d){const pts=LEGS[li];for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],l=Math.hypot(b.x-a.x,b.y-a.y);if(d<=l||i===pts.length-1){const k=l?clamp(d/l):0;return{x:a.x+(b.x-a.x)*k,y:a.y+(b.y-a.y)*k};}d-=l;}}
const MW=[[26,527,16,11],[78,527,16,11]],MDOOR=[54,527,10,21];
const GW=[[108,806,3,7],[108,824,3,7],[188,806,3,7],[188,824,3,7]];
const CW=[[36,1160,31,15],[80,1169,6,5]];
const inArch=(x,y)=>{if(x<138||x>162||y>=868||y<834)return false;if(y>=846)return true;const dx=x-150,dy=y-846;return dx*dx+dy*dy<=150;};

/* each level owns a 320 px band of the map: slot 0 (y 320-640, path on the right), slot 1 (640-960, path on the left), slot 2 (960-1280, right).
   A scene is drawn at its home slot; in another slot it moves down and is mirrored when the path runs on the other side. */
const SLOT0=320,SLOTH=320;
const SCN={
  bar:{home:0,terrain:'green',label:"BAR CON INSEGNA AL NEON (MONKEY'S)"},
  borgo:{home:1,terrain:'dark',label:'BORGO CON CASTELLO (FELTRE)'},
  baita:{home:2,terrain:'snow',label:'BAITA IN MONTAGNA (CIMOLAIS)'},
  locale:{home:0,terrain:'green',label:'OSTERIA CON INSEGNA (OGNI LOCALE)'},
  soon:{home:0,terrain:'dark',label:'IN ARRIVO'}};
const SCENE_KEYS=['bar','borgo','baita','locale'];
const SCENE_PINES={bar:[[204,520,30],[190,604,26],[12,600,24]],borgo:[[14,800,28],[20,922,24],[116,925,22]],baita:[[122,1150,32],[202,1222,30],[12,1242,24],[198,1120,26]],locale:[[204,520,30],[190,604,26],[12,600,24]],soon:[[204,520,30],[190,604,26],[12,600,24],[110,602,20]]};
const placeOf=(key,slot)=>{const d=slot-SCN[key].home;return{dy:d*SLOTH,m:d%2!==0};};
let world=mk(MAPW,WH),WORLDKEY='',WTER=['green','dark','snow'];
function buildWorld(keys){
  const W=MAPW,key=keys.join(',');if(key===WORLDKEY)return;WORLDKEY=key;WTER=keys.map(k=>SCN[k].terrain);
  const g=world.getContext('2d'),img=g.createImageData(W,WH),D=img.data;
  let TM=false,TDY=0;const withT=(p,fn)=>{TM=p.m;TDY=p.dy;try{fn();}finally{TM=false;TDY=0;}};
  const sp=(x,y,c)=>{x=Math.round(x);y=Math.round(y);if(TM)x=W-1-x;y+=TDY;if(x<0||y<0||x>=W||y>=WH)return;const v=typeof c==='string'?hx(c):c,i=(y*W+x)*4;D[i]=v[0];D[i+1]=v[1];D[i+2]=v[2];D[i+3]=255;};
  const fr=(x,y,w,h,c)=>{const v=hx(c);for(let j=0;j<h;j++)for(let i=0;i<w;i++)sp(x+i,y+j,v);};
  const grad=(y0,y1,cols)=>{const cs=cols.map(hx);for(let y=y0;y<y1;y++){const f=(y-y0)/(y1-y0)*(cs.length-1),k=Math.min(cs.length-2,Math.floor(f)),fr_=f-k;for(let x=0;x<W;x++)sp(x,y,fr_>bay(x,y)?cs[k+1]:cs[k]);}};
  const wtext=(s,x,y,sc,c)=>{let cx=x;for(const ch of s){const gg=gl(ch);for(let r=0;r<7;r++)for(let q=0;q<gg[r].length;q++)if(gg[r][q]==='#')fr(cx+q*sc,y+r*sc,sc,sc,c);cx+=(gg[0].length+1)*sc;}};
  function pine(cx,by,h,col,opt={}){
    const cs=col.map(hx),sn=opt.snow?hx('#eef2ff'):null,sn2=opt.snow?hx('#a9b6e6'):null;
    const tr=opt.noTrunk?0:Math.max(1,Math.round(h*0.12));if(tr)fr(cx-1,by-tr,2,tr,'#2e1c10');
    const body=h-tr,tiers=h>18?3:2,th=Math.round(body/(tiers*0.7+0.3));
    for(let i=0;i<tiers;i++){const ty=by-tr-body+Math.round(i*th*0.7),mh=Math.round(h*0.3*(0.55+0.45*(i+1)/tiers));
      for(let r=0;r<th;r++){const y=ty+r;if(y>=by-tr)break;const half=Math.max(0,Math.round(mh*(r+1)/th));
        for(let x=cx-half;x<=cx+half;x++){let c=x<cx-half/3?cs[2]:(x>cx+half/3?cs[0]:cs[1]);if(sn&&r<Math.max(1,Math.round(th*0.28)))c=x<cx?sn:sn2;sp(x,y,c);}}}
  }
  function mountains(base,peaks,col,shade,snow,snowSh,snowLine){
    for(let x=0;x<W;x++){let best=0,side=0;for(const p of peaks){const h=p.h-Math.abs(x-p.x)*p.s;if(h>best){best=h;side=x>p.x?1:0;}}
      best+=(R(x*3.1)*2|0);if(best<=0)continue;const top=Math.round(base-best);
      for(let y=top;y<base;y++){let c=side?shade:col;if(snowLine!=null&&y<snowLine+(R(x*5.3)*3|0))c=side?snowSh:snow;sp(x,y,c);}}
  }
  function grass(y0,y1,base,dark,light,seed){const b=hx(base),d=hx(dark),l=hx(light);
    for(let y=y0;y<y1;y++)for(let x=0;x<W;x++){const n=R(Math.floor(x/7)*13.1+Math.floor(y/5)*7.7+seed);sp(x,y,(n>0.7&&bay(x,y)<0.5)?d:b);}
    const nt=Math.round((y1-y0)*1.3);for(let k=0;k<nt;k++){const x=R(k*3.3+seed)*W|0,y=y0+(R(k*5.1+seed+1)*(y1-y0-2)|0);sp(x,y,l);sp(x-1,y+1,l);sp(x+1,y+1,l);}}
  function snowG(y0,y1,seed){const b=hx('#dde4ff'),d=hx('#b2bde8'),w=hx('#ffffff');
    for(let y=y0;y<y1;y++)for(let x=0;x<W;x++){const n=R(Math.floor(x/9)*11.3+Math.floor(y/6)*5.9+seed);sp(x,y,(n>0.62&&bay(x,y)<0.55)?d:b);}
    for(let k=0;k<160;k++)sp(R(k*7.1+seed)*W|0,y0+(R(k*2.9+seed)*(y1-y0)|0),w);}
  function cliff(y0,y1,stone,lt,dk,lip,lipDk,seed){
    fr(0,y0,W,y1-y0,dk);let y=y0+2,row=0;
    while(y<y1){const h=5+(R(row*9.1+seed)*2|0);let x=-(R(row*4.4+seed)*10|0);
      while(x<W){const w=8+(R(x*1.3+row*7+seed)*9|0);fr(x+1,y,w-1,h-1,stone);fr(x+1,y,w-1,1,lt);sp(x+1,y+1,lt);x+=w;}y+=h;row++;}
    for(let x=0;x<W;x++){const hang=1+(R(x*2.7+seed)*3|0);for(let j=0;j<=hang;j++)sp(x,y0+j,j===hang?lipDk:lip);}
  }
  function forest(y0,y1,bg,back,mid,mist,seed,snow){
    grad(y0,y1,bg);
    const fm=hx(back),fm2=hx(mist);
    for(let x=0;x<W;x++){const h=Math.max(46-Math.abs(x-30-seed%40)*0.8,62-Math.abs(x-110+seed%30)*0.7,50-Math.abs(x-190)*0.75)+(R(x*2.3+seed)*2|0);
      for(let y=Math.round(y0+92-h);y<y0+96;y++){const top=y<y0+92-h+3;sp(x,y,top&&snow?hx('#4a5490'):(bay(x,y)<0.5?fm:fm2));}}
    for(let k=0;k<26;k++){const cx=(k*9+(R(k+seed)*7|0))%W,h=34+(R(k*2.3+seed)*36|0);pine(cx,y1-18+(R(k*1.7+seed)*8|0),h,[back,back,back],{noTrunk:true,snow:snow==='back'||snow===true?false:false});
      if(snow){/* faint snow tips on back row */const hh=h;for(let r=0;r<3;r++)sp(cx+r-1,y1-18+(R(k*1.7+seed)*8|0)-hh+2+r,'#4a5490');}}
    const mc=hx(mist);for(let y=y1-16;y<y1;y++)for(let x=0;x<W;x++)if(bay(x,y)<(y-(y1-16))/16*0.4)sp(x,y,mc);
  }
  function midPines(y,cols,seed,snow){for(let k=0;k<20;k++){const cx=k*12+4+(R(k*4.1+seed)*8|0),h=24+(R(k*3.9+seed)*22|0);pine(cx,y+2+(R(k*2.2+seed)*5|0),h,cols,{snow});}}
  const PINE=['#0f3a2a','#1d5a3a','#2f7f4a'],PINED=['#0c2c24','#163f30','#215a3a'],PINES=['#143040','#1e4a52','#2e6a6a'];

  /* strip 0: sky, moon, mountains, start clearing */
  grad(0,176,['#070820','#0b0e30','#121947','#1b275e','#253574']);
  for(let y=-11;y<=11;y++)for(let x=-11;x<=11;x++){const d=x*x+y*y;if(d<=110)sp(176+x,70+y,d>90?'#cfc390':'#f1e6b4');}
  [[172,66,2],[180,74,3],[178,63,1],[170,74,1]].forEach(([x,y,r])=>{for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++)if(i*i+j*j<=r*r)sp(x+i,y+j,'#d6c992');});
  mountains(178,[{x:18,h:60,s:1.0},{x:70,h:82,s:0.95},{x:128,h:56,s:1.1},{x:186,h:74,s:0.9},{x:236,h:50,s:1}],'#2c3a80','#212c64','#cdd7ff','#97a4e2',124);
  for(let k=0;k<30;k++){const cx=k*8+(R(k*1.9)*6|0),h=16+(R(k*4.3)*20|0);pine(cx,186+(R(k*2.1)*5|0),h,['#0e1e36','#0e1e36','#12283e'],{noTrunk:true});}
  grass(182,290,'#2f7a3d','#245f31','#47a34d',3);
  midPines(184,['#0e2a2a','#133a32','#1a4a3a'],5,false);
  cliff(290,320,'#5a5a7c','#7c7ca0','#33334a','#2f7a3d','#1d5a2c',1);
  /* level bands: terrain follows the scene that sits there */
  const TERR={
    green:{bg:['#0a1226','#0d1a32','#112440'],back:'#132a46',mid:'#14363a',mist:'#2a3c5e',g:['#2b703a','#215a2f','#3f944a'],mp:['#0f2f2c','#164036','#205a40'],cl:['#55557a','#76769a','#30304a','#2b703a','#1a4a28'],pine:PINE},
    dark:{bg:['#080e20','#0a142a','#0e1a36'],back:'#0f2240',mid:'#102c34',mist:'#24324e',g:['#256638','#1c4f2c','#378a44'],mp:['#0c2a28','#123a30','#1a4e3a'],cl:['#505074','#707094','#2c2c44','#256638','#174226'],pine:PINED},
    snow:{bg:['#0c0a22','#120f30','#18153c'],back:'#1a1e40',mid:'#152a36',mist:'#3a3e70',snow:true,mp:PINES,cl:['#6a7098','#9aa4d0','#3a3e60','#dde4ff','#9aa6d8'],pine:PINES}};
  const SEED=[[11,13,17,2],[23,29,31,3],[41,43,47,4]];
  WTER.forEach((tk,s)=>{const P=TERR[tk],y0=SLOT0+s*SLOTH,[fs,gs,ms,cs]=SEED[s];
    forest(y0,y0+126,P.bg,P.back,P.mid,P.mist,fs,!!P.snow);
    if(P.snow)snowG(y0+126,y0+290,gs);else grass(y0+126,y0+290,P.g[0],P.g[1],P.g[2],gs);
    midPines(y0+126,P.mp,ms,!!P.snow);
    cliff(y0+290,y0+320,...P.cl,cs);});
  /* strip 4 end */
  grad(1280,1600,['#0a0818','#08061a','#050410']);
  mountains(1420,[{x:40,h:60,s:1.2},{x:120,h:90,s:1},{x:200,h:70,s:1.1}],'#120e2c','#0e0a24',null,null,null);
  wtext('?',96,1342,5,'#221c46');
  /* path */
  const PATH=[S,{x:160,y:262},N7,{x:160,y:566},{x:56,y:626},N8,{x:56,y:886},{x:160,y:946},N9,{x:160,y:1206},{x:56,y:1266},EN];
  const pc=y=>(y>=SLOT0&&y<SLOT0+3*SLOTH&&WTER[Math.floor((y-SLOT0)/SLOTH)]==='snow')?['#5e6aa0','#97a3d4','#c4ccef']:['#6a4424','#ae743c','#d6a062'];
  const stamp=fn=>{for(let s=0;s<PATH.length-1;s++){const a=PATH[s],b=PATH[s+1],n=Math.max(Math.abs(b.x-a.x),Math.abs(b.y-a.y));for(let k=0;k<=n;k++)fn(Math.round(a.x+(b.x-a.x)*k/n),Math.round(a.y+(b.y-a.y)*k/n));}};
  const disk=(cx,cy,r,c)=>{for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++)if(i*i+j*j<=r*r+1)sp(cx+i,cy+j,c);};
  stamp((x,y)=>disk(x,y,5,pc(y)[0]));stamp((x,y)=>disk(x,y,4,pc(y)[1]));
  stamp((x,y)=>{if(R(x*3.7+y*1.3)>0.82)sp(x+(R(y*1.1)*6|0)-3,y+(R(x*0.7)*6|0)-3,pc(y)[2]);});
  /* clearing pines (after path so they never get covered) */
  pine(14,262,30,PINE);pine(30,282,22,PINE);pine(198,250,34,PINE);pine(208,280,24,PINE);
  keys.forEach((k,s)=>withT(placeOf(k,s),()=>SCENE_PINES[k].forEach(([x,y,h])=>pine(x,y,h,TERR[WTER[s]].pine,{snow:WTER[s]==='snow'}))));
  /* signpost at start */
  fr(72,214,2,18,'#5a3a1e');fr(64,214,18,7,'#8a5a2c');fr(64,214,18,1,'#b07a40');
  [[69,217],[70,216],[70,218],[71,215],[71,219]].forEach(([x,y])=>sp(x+3,y,'#2a1a0c'));fr(66,217,7,1,'#2a1a0c');
  /* landmarks, drawn at their home slot */
  const LM={
  bar:()=>{const x0=20,x1=100,base=548,wt=506;
    fr(x0-3,base,x1-x0+8,2,'#1a4426');fr(x0,wt,x1-x0,base-wt,'#7a4422');
    for(let y=wt+3;y<base;y+=5)fr(x0,y,x1-x0,1,'#5a2e16');
    for(let k=0;k<14;k++){const x=x0+4+(R(k*7.7)*(x1-x0-8)|0),yy=wt+((R(k*3.3)*8|0))*5;fr(x,yy,1,3,'#5a2e16');}
    fr(x0,wt,2,base-wt,'#4a2410');fr(x1-2,wt,2,base-wt,'#4a2410');
    fr(x0-3,500,x1-x0+6,6,'#3a1e0e');fr(x0-3,500,x1-x0+6,1,'#a0602c');fr(x0-3,505,x1-x0+6,1,'#24120a');
    [40,48,62,74].forEach(x=>fr(x,493,1,7,'#2a2a3a'));
    for(let x=x0-3;x<x1+3;x++){const st=Math.floor((x-x0+3)/4)%2?'#f0e6dc':'#d6303a';fr(x,513,1,7,st);if(((x-x0+3)>>1)&1)sp(x,520,st);}
    fr(x0-3,512,x1-x0+6,1,'#7a1820');
    for(const[wx,wy,ww,wh]of MW){fr(wx-1,wy-1,ww+2,wh+2,'#3a1c0c');fr(wx,wy,ww,wh,'#1b1930');}
    fr(52,525,14,23,'#3a1c0c');fr(54,527,10,21,'#140a06');
    fr(104,538,7,10,'#8a5228');fr(104,538,7,1,'#a86a34');fr(104,540,7,1,'#4a2a14');fr(104,545,7,1,'#4a2a14');
    for(let y=502;y<base;y++){const x=Math.round(118-(base-y)*0.09+Math.sin(y*0.15)*0.6);fr(x,y,3,1,(y%4<2)?'#8a5a2a':'#6a4018');}
    const fx=114,fy=501;[[-2.9,1],[-2.4,1],[-1.9,0],[-1.2,0],[-0.6,1],[-0.1,1],[0.5,0],[-1.55,1]].forEach(([a,s])=>{for(let r=0;r<15;r++){const x=fx+Math.cos(a)*r,y=fy+Math.sin(a)*r*0.7+r*r*0.035;sp(x,y,s?'#2f9a4a':'#1f6a38');if(r<10)sp(x,y+1,'#1f6a38');}});
    sp(113,502,'#6a4018');sp(115,503,'#6a4018');
  },
  borgo:()=>{const base=868;
    const brick=(x,y,w,h)=>{fr(x,y,w,h,'#6c6c8c');for(let j=0;j<h;j++){const yy=y+j,row=Math.floor(j/4);if(j%4===3){fr(x,yy,w,1,'#47475f');continue;}for(let i=0;i<w;i++){const off=(row%2)*3;if(((i+off)%6)===5)sp(x+i,yy,'#47475f');else if(j%4===0&&((i+off)%6)<2)sp(x+i,yy,'#8e8eae');}}};
    const merl=(x,y,w)=>{for(let i=0;i<w;i++)if((i%6)<4){fr(x+i,y,1,6,'#6c6c8c');sp(x+i,y,'#8e8eae');}};
    fr(90,base,118,2,'#163a22');
    for(let y=base;y<base+7;y++)for(let x=92;x<208;x++)sp(x,y,((x+(y%2)*3)%6===0||y===base+3)?'#3e3e54':'#5c5c76');
    brick(98,794,25,base-794);merl(98,788,25);brick(178,794,25,base-794);merl(178,788,25);
    brick(123,814,55,base-814);merl(123,808,55);
    fr(121,794,2,base-794,'#55557a');fr(201,794,2,base-794,'#55557a');
    for(let y=832;y<base;y++)for(let x=136;x<165;x++){if(inArch(x,y))sp(x,y,'#120e1e');else if(inArch(x-1,y)||inArch(x+1,y)||inArch(x,y+1))sp(x,y,'#9a9aba');}
    for(const[sx,sy,sw,sh]of GW)fr(sx,sy,sw,sh,'#14101e');
    fr(110,772,1,16,'#3a2a20');fr(190,772,1,16,'#3a2a20');
    fr(88,834,2,base-834,'#2a1e18');fr(88,834,7,1,'#2a1e18');fr(92,835,5,8,'#2a1e18');fr(93,836,3,6,'#3a3424');
  },
  baita:()=>{const base=1188,x0=24,x1=100,wt=1152;
    fr(x0-4,base,x1-x0+10,2,'#9aa6d8');
    for(let y=wt;y<base;y++){const ln=(y-wt)%4;fr(x0,y,x1-x0,1,ln===3?'#5e3218':(ln===0?'#a8683a':'#8a4e26'));}
    for(let y=wt+1;y<base;y+=4){fr(x0-2,y,2,2,'#b07848');fr(x1,y,2,2,'#b07848');}
    const ax=62,ay=1116,ey=1152,hm=50;
    fr(80,1124,9,12,'#6a6a88');fr(80,1124,9,1,'#8a8aa8');fr(84,1128,1,3,'#47475f');
    for(let y=ay;y<ey;y++){const half=Math.round((y-ay)/(ey-ay)*hm);for(let x=ax-half;x<=ax+half;x++){if(x>=80&&x<=88&&y<1136&&y>=1124)continue;sp(x,y,y>=ey-2?'#4a2412':(x<ax?'#f2f6ff':'#c6d0f2'));}}
    fr(79,1121,11,3,'#f2f6ff');
    for(let x=ax-hm;x<=ax+hm;x++)if(R(x*2.1)>0.5)sp(x,ey,x<ax?'#f2f6ff':'#c6d0f2');
    for(let k=0;k<14;k++){const x=ax-hm+4+(R(k*5.5)*(hm*2-8)|0),l=1+(R(k*3.1)*3|0);fr(x,ey+1,1,l,'#cfe2ff');}
    fr(35,1159,33,17,'#3a1c0c');fr(36,1160,31,15,'#1a1630');
    fr(33,1175,37,2,'#a86a34');fr(33,1174,37,1,'#f2f6ff');
    fr(40,1154,24,4,'#a86a34');fr(40,1154,24,1,'#c8884a');
    fr(76,1165,14,23,'#3a1c0c');fr(78,1167,10,21,'#4a2412');fr(80,1169,6,5,'#1a1630');
    for(let x=x0-4;x<x1+6;x++){const h=1+(R(x*1.9)*3|0);fr(x,base-h,1,h,'#eef3ff');}
  },
  locale:()=>drawLocale(fr,sp),
  soon:()=>drawSoon(fr,sp,wtext)};
  keys.forEach((k,s)=>withT(placeOf(k,s),LM[k]));
  /* end fog (static) */
  const fc=hx('#2a2448'),fc2=hx('#3a3460');
  for(let y=1300;y<WH;y++)for(let x=0;x<W;x++){const d=clamp((y-1330)/220)*0.85,n=0.12*Math.sin(x*0.09+y*0.05);if(bay(x,y)<d+n)sp(x,y,d>0.55&&bay(x,y)<d-0.4?fc2:fc);}
  g.putImageData(img,0,0);
}
/* any venue: a plaster osteria with a tiled roof and a board where the venue name is painted at draw time (home slot 0) */
const LW=[[28,526,14,11],[78,526,14,11]],LDOOR=[54,528,12,20],LSIGN=[24,72];
function drawLocale(fr,sp){
  const base=548,x0=22,x1=98,wt=506,ax=60,ay=476,hm=50;
  fr(12,base,104,2,'#1a4426');
  for(let y=wt;y<base;y++)for(let x=x0;x<x1;x++){const n=R(x*1.7+y*3.1);sp(x,y,y>=base-6?((x+(y>>1))%5===0?'#5a5248':'#7a7066'):(n>0.93?'#b09a72':'#c9b48a'));}
  fr(x0,wt,2,base-wt-6,'#a8946c');fr(x1-2,wt,2,base-wt-6,'#a8946c');
  fr(78,482,9,16,'#6a6a88');fr(78,482,9,1,'#8a8aa8');fr(77,481,11,2,'#4a4a62');
  for(let y=ay;y<wt;y++){const half=Math.round((y-ay)/(wt-ay)*hm);for(let x=ax-half;x<=ax+half;x++){if(x>=77&&x<=87&&y<492)continue;sp(x,y,(y-ay)%4===3?'#5e1c12':(x<ax?'#a8402a':'#8a2e1e'));}}
  fr(ax-hm,wt-1,hm*2+1,2,'#4a160e');
  fr(x0+2,507,x1-x0-4,18,'#5a3418');fr(x0+3,508,x1-x0-6,16,'#3a1e0e');fr(x0+2,507,x1-x0-4,1,'#a0602c');
  for(const[wx,wy,ww,wh]of LW){fr(wx-1,wy-1,ww+2,wh+2,'#4a2a14');fr(wx,wy,ww,wh,'#1b1930');fr(wx-2,wy+wh+1,ww+4,2,'#8a6a48');
    for(let i=0;i<ww;i++)if(R(i*3.3+wx)>0.35)sp(wx+i,wy+wh+1,R(i*1.9+wx)>0.5?'#e8384a':'#ffcf4a');}
  fr(52,526,16,22,'#4a2a14');fr(54,528,12,20,'#140a06');fr(52,525,16,1,'#8a6a48');
  fr(70,527,5,1,'#2a1e18');fr(73,527,1,3,'#2a1e18');
  fr(103,538,9,10,'#7a4a22');fr(103,540,9,1,'#3a2410');fr(103,545,9,1,'#3a2410');fr(103,538,9,1,'#9a6a34');
}
/* coming soon: a lone wooden sign with a question mark, waiting for the next venue (home slot 0) */
function drawSoon(fr,sp,wtext){
  fr(12,548,104,2,'#174226');
  fr(57,512,3,36,'#5a3a1e');fr(60,512,1,36,'#3a2410');
  fr(34,494,52,32,'#5a3a1e');fr(36,496,48,28,'#8a5a2c');fr(36,496,48,1,'#b07a40');
  for(let y=502;y<524;y+=6)fr(36,y,48,1,'#7a4c24');
  wtext('?',53,499,3,'#3a2410');
  [[40,546],[78,545],[96,547]].forEach(([x,y])=>{fr(x,y,4,2,'#5a5a72');fr(x,y,4,1,'#7a7a92');});
}
