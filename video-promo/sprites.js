/* ---- sprite builder (shared between test page and src.html) ---- */
function PG(w,h){this.w=w;this.h=h;this.g=[];for(let y=0;y<h;y++)this.g.push(new Array(w).fill(null));}
PG.prototype.p=function(x,y,c){x=Math.round(x);y=Math.round(y);if(x>=0&&y>=0&&x<this.w&&y<this.h)this.g[y][x]=c;};
PG.prototype.r=function(x,y,w,h,c){for(let j=0;j<h;j++)for(let i=0;i<w;i++)this.p(x+i,y+j,c);};
PG.prototype.ln=function(x0,y0,x1,y1,c,th){th=th||1;const n=Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0))*2)||1,o=Math.floor((th-1)/2);for(let k=0;k<=n;k++){const x=Math.round(x0+(x1-x0)*k/n),y=Math.round(y0+(y1-y0)*k/n);for(let j=0;j<th;j++)for(let i=0;i<th;i++)this.p(x+i-o,y+j-o,c);}};
PG.prototype.el=function(cx,cy,rx,ry,c){for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++){const dx=(x-cx)/rx,dy=(y-cy)/ry;if(dx*dx+dy*dy<=1)this.p(x,y,c);}};
PG.prototype.art=function(rows,map,ox,oy){rows.forEach((r,y)=>{for(let x=0;x<r.length;x++){const k=r[x];if(k!=='.'&&map[k])this.p(ox+x,oy+y,map[k]);}});};
PG.prototype.get=function(x,y){return(y>=0&&y<this.h&&x>=0&&x<this.w)?this.g[y][x]:null;};
PG.prototype.canvas=function(outline){const o=outline?1:0,c=document.createElement('canvas');c.width=this.w+2*o;c.height=this.h+2*o;const g=c.getContext('2d');
  if(outline){g.fillStyle=outline;for(let y=-1;y<=this.h;y++)for(let x=-1;x<=this.w;x++){if(this.get(x,y))continue;if(this.get(x-1,y)||this.get(x+1,y)||this.get(x,y-1)||this.get(x,y+1))g.fillRect(x+o,y+o,1,1);}}
  for(let y=0;y<this.h;y++)for(let x=0;x<this.w;x++){const v=this.g[y][x];if(v){g.fillStyle=v;g.fillRect(x+o,y+o,1,1);}}return c;};

const LC={T:'#30304a',Tl:'#46466c',Td:'#1c1c2c',btn:'#6a6a8a',belt:'#3a2616',buck:'#d8b870',J:'#6e94d4',Jl:'#93b6ee',Jd:'#4a6aaa',sh:'#141418',neo:'#c8ff3a',sole:'#44444e',U:'#07070c',Ul:'#7a7aa8',Ud:'#34344e',gold:'#d8b058',bridge:'#3a2416',nk:'#1e1620',nkl:'#4a3c50',str:'#c4c4dc',peg:'#e0e0f0',S:'#f2b48c',s:'#c47e58'};
const LHEAD=[
"....hHHhHHhH....",
"..HhHHHHhHHHhH..",
".HHHhHHiHHhHHHH.",
"HHhHHiHhHHHHhHHH",
"HHHHSSSSSSSSHHiH",
"HHHSBBSSSSBBSHHH",
"HHSGGGGSSGGGGSHH",
"HHSGkLGGGGkLGSHH",
"HHSGGGGssGGGGSHH",
".HSSSSSssSSSSSH.",
".HBSSSBBBBSSSBH.",
"..BBBBmmmmBBBB..",
"..BBBbmWWmbBBB..",
"...BBBBbbBBBB...",
"....BBBBBBBB....",
"......BBBB......"];
const LHMAP={H:'#5a3218',h:'#8f5a2c',i:'#b88048',S:'#f2b48c',s:'#c47e58',B:'#4a2814',b:'#6e4024',G:'#3ec8ff',k:'#140c1c',L:'#bfe8ff',m:'#5e1620',W:'#f6f2f0'};
/* part: 'all' (the whole figure, as always), 'back' (legs, torso, upper arms: what sits behind the guitar) or 'front' (forearms,
   fretting hand and head: what sits in front of it). back + buildHarpHi() + front is Lorenzo with the guitar drawn at 3x */
function buildLor(leg,part){part=(part==='back'||part==='front')?part:'all';   /* [0,1,2].map(buildLor) passes the index as part: that is 'all' */const back=part!=='front',guit=part==='all',front=part!=='back';
  const P=new PG(30,46),c=LC;
  if(back){
  [[6,'L'],[13,'R']].forEach(([lx,side])=>{
    const lifted=(leg===1&&side==='R')||(leg===2&&side==='L'),bot=lifted?40:42;
    P.r(lx,35,5,bot-34,c.J);P.r(lx,35,1,bot-34,c.Jl);P.r(lx+4,35,1,bot-34,c.Jd);P.p(lx+2,39,c.Jd);P.p(lx+1,37,c.Jl);
    const sx=side==='L'?lx-1:lx,sy=bot+1;
    P.r(sx,sy,6,2,c.sh);P.r(sx,sy+2,6,1,c.sole);P.r(sx+(side==='L'?1:2),sy+1,3,1,c.neo);P.p(sx+(side==='L'?0:5),sy,c.neo);
  });
  P.r(5,33,14,3,c.J);P.r(5,33,1,3,c.Jl);P.r(18,33,1,3,c.Jd);P.r(5,33,14,1,c.belt);P.r(11,33,2,1,c.buck);P.p(12,35,c.Jd);
  P.r(5,16,14,17,c.T);P.r(4,17,16,15,c.T);P.r(4,17,2,15,c.Tl);P.r(18,17,2,15,c.Td);
  P.r(11,17,1,16,c.Td);for(let y=19;y<33;y+=4)P.p(12,y,c.btn);
  P.p(8,16,c.Tl);P.p(9,17,c.Tl);P.p(15,16,c.Tl);P.p(14,17,c.Tl);
  P.ln(4,18,2,26,c.T,3);P.ln(3,18,1,25,c.Tl,1);
  P.ln(19,18,21,26,c.T,3);
  }
  if(guit){
  P.el(7,31,7.2,5.4,c.U);P.el(11,26.5,5.2,4,c.U);
  const isU=(x,y)=>P.get(x,y)===c.U,edge=[];
  for(let y=0;y<46;y++)for(let x=0;x<30;x++)if(isU(x,y)&&(!isU(x,y-1)||!isU(x-1,y)||!isU(x+1,y)||!isU(x,y+1)))edge.push([x,y,(!isU(x,y-1)||!isU(x-1,y))&&(y<30||x<6)]);
  edge.forEach(([x,y,tl])=>P.p(x,y,tl?c.Ul:c.Ud));
  P.el(9,27.4,2.5,2.5,c.gold);P.el(9,27.4,1.4,1.4,'#000000');
  P.r(8,34,5,1,c.bridge);P.p(7,34,c.gold);
  P.ln(14,26,26,19.5,c.nk,2);P.ln(15,24.8,26,18.6,c.nkl,1);
  P.r(26,17,3,4,c.U);P.p(29,17,c.peg);P.p(29,19,c.peg);P.p(27,16,c.peg);
  P.ln(24,10,9.5,34,c.str);P.ln(25.5,11,11.5,34,c.str);
  P.ln(12,24,24,9,c.U,2);P.ln(11,23,23,8,c.Ul,1);
  P.r(22,5,4,4,c.U);P.p(26,5,c.peg);P.p(26,7,c.peg);P.p(23,4,c.peg);P.p(22,5,c.Ul);
  }
  if(front){
  P.ln(2,27,9,32.5,c.T,3);
  P.ln(21,26,22,22,c.T,3);
  P.r(21,19,3,3,c.S);P.p(23,21,c.s);P.p(21,21,c.s);
  P.art(LHEAD,LHMAP,4,0);
  }
  return P.canvas('#0a0716');
}
/* Lorenzo's harp guitar at three times the resolution (pixels a third of the size), same footprint as his sprite (32x48 with
   the outline), to be drawn between buildLor(leg,'back') and buildLor(leg,'front'). Two separate arms: the neck, with its
   strings parallel, to its own headstock; above it the harp arm, which rises steeply and hooks forward, its strings opening
   in a fan from the bridge to the tuners along the hook */
function buildHarpHi(){const S=3,P=new PG(32*S,48*S),c=LC,X=v=>(v+1)*S,blk='#08080e',rim='#6c6c96',dk='#2a2a40';
  const L=(x0,y0,x1,y1,col,th)=>P.ln(X(x0),X(y0),X(x1),X(y1),col,th);
  /* body: lower and upper bout, a light rim on the upper left, a dark one elsewhere */
  P.el(X(7),X(31),7.2*S,5.4*S,blk);P.el(X(11),X(26.5),5.2*S,4*S,blk);
  /* the neck: a dark fretboard to its own headstock */
  L(13.2,27,25.4,20.6,'#16101a',7);
  /* the harp arm: from the upper bout, steeply up, then the hook forward */
  L(11.6,25,18.4,10.8,blk,6);L(18.4,10.8,20.6,7.2,blk,6);L(20.4,7.4,25.8,4.6,blk,6);
  P.el(X(25.8),X(4.7),2.2,2.6,blk);
  /* neck headstock */
  for(let k=0;k<9;k++)L(25.2,19.2+k*0.4,28.2,17.6+k*0.4,blk,2);
  const solid=(x,y)=>{const v=P.get(x,y);return v!==null&&v!==undefined;},W=P.w,H=P.h,rimPts=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(solid(x,y)&&(!solid(x,y-1)||!solid(x-1,y)||!solid(x+1,y)||!solid(x,y+1)))rimPts.push([x,y,!solid(x,y-1)||!solid(x-1,y)]);
  rimPts.forEach(([x,y,tl])=>P.p(x,y,tl?rim:dk));
  /* soundhole */
  P.el(X(8.6),X(28),2.3*S,2.3*S,c.gold);P.el(X(8.6),X(28),1.6*S,1.6*S,'#000000');
  /* neck strings: four, parallel to the neck's edges */
  for(let k=-1.5;k<=1.5;k++){const o=k*0.42;L(13.6+o*0.47,27+o*0.88-0.1,25.6+o*0.47,20.6+o*0.88-0.1,'#8c8cae',1);}
  /* pegs: neck headstock and the harp hook */
  [[26,16.7],[27.4,16],[28.8,15.4],[26.4,22.2],[27.8,21.5],[29.1,20.8]].forEach(([x,y])=>P.r(X(x),X(y),2,2,c.peg));
  [[20.6,5.3],[22,4.4],[23.4,3.7],[24.8,3.1],[26.2,2.8],[27.4,3.4]].forEach(([x,y])=>P.r(X(x),X(y),2,2,c.peg));
  /* harp strings: six, a fan from the bridge on the lower bout to the tuners along the hook */
  const top=[[19.8,9.4],[21.2,7.9],[22.6,7],[24,6.3],[25.4,5.7],[26.8,5.3]];
  top.forEach(([x,y],k)=>L(8.4+k*0.75,33+k*0.12,x,y,'#b4b4d0',1));
  /* bridges */
  L(5.6,33.2,10.8,33.9,c.bridge,3);P.r(X(5.4),X(33),2,2,c.gold);
  return P.canvas();}
const KC={D:'#2b4fc0',Dl:'#5a7ee8',Dd:'#1b2f7c',pk:'#14204e',pb:'#a87444',pc:'#e0c08c',pl:'#9cc0ff',belt:'#6e3e1e',ring:'#d8b058',S:'#f2b48c',s:'#c47e58',t1:'#e8609a',t2:'#3ec89a',t3:'#2e6fa8',t4:'#f0c040',O:'#c87e3a',Ol:'#eca45a',Od:'#8a4a1a',hole:'#3a1a08',nk:'#6a3a14',nst:'#e8dcc0',hs:'#4a2810',peg:'#e0e0f0',st1:'#d8303a',st2:'#f0ece0',st3:'#141414',sand:'#7a4a24',y:'#f0c040'};
const KHEAD=[
"....kKKkK.....",
"..KKKKkKKKK...",
".KKkKKKKKKkK..",
"KKKKKKKKKKKKK.",
"KKKSSSSSSSKKKK",
"KKSSSSSSSSSSKK",
"KKSeeSSSSeeSKK",
"KKSSSSSsSSSSKK",
".KrSSmmmmSSrK.",
".KSSSmWWmSSSK.",
"..SSSSmmSSSS..",
"...SSSSSSSS...",
"....SSSSSS....",
".....SSSS....."];
const KHMAP={K:'#26161e',k:'#563444',S:'#f2b48c',s:'#c47e58',e:'#2a1420',r:'#f0908a',m:'#b0304a',W:'#fff4f0'};
function buildKat(leg){
  const P=new PG(21,43),c=KC,hem=leg===1?-1:leg===2?1:0;
  for(let y=26;y<=40;y++){const t=(y-26)/14,sh=y>=37?hem:0,x0=Math.round(6-t*5)+sh,x1=Math.round(15+t*5)+sh;P.r(x0,y,x1-x0+1,1,y===40?c.Dd:c.D);P.p(x0,y,c.Dl);P.p(x1,y,c.Dd);}
  [[8,28],[13,29],[10,32],[6,34],[15,33],[12,36],[4,38],[9,38],[17,38],[14,39]].forEach(([x,y])=>{x+=y>=37?hem:0;P.p(x,y,c.pk);P.p(x-1,y,c.pb);P.p(x+1,y,c.pb);P.p(x,y-1,c.pc);P.p(x,y+1,c.pl);});
  P.r(6,15,10,10,c.D);P.r(6,15,1,10,c.Dl);P.r(15,15,1,10,c.Dd);
  [[8,18],[12,20],[9,22]].forEach(([x,y])=>{P.p(x,y,c.pk);P.p(x-1,y,c.pb);P.p(x+1,y,c.pb);P.p(x,y-1,c.pc);});
  P.r(8,14,6,1,c.S);P.r(9,15,4,1,c.S);P.r(10,16,2,1,c.S);P.p(7,14,c.D);P.p(14,14,c.D);
  P.r(6,24,10,2,c.belt);P.r(10,24,2,2,c.ring);
  P.r(5,14,2,2,c.S);P.r(15,14,2,2,c.S);
  P.ln(5,15,4,21,c.S,2);
  P.ln(16,15,18,22,c.S,2);P.ln(18,22,15,28,c.S,2);
  [[4,16,c.t1],[5,17,c.t2],[4,18,c.t3],[5,19,c.t1],[4,20,c.t4],[5,21,c.t2],[16,16,c.t3],[17,18,c.t1],[18,20,c.t2]].forEach(([x,y,cc])=>P.p(x,y,cc));
  P.el(15,30,3.8,2.9,c.O);P.el(12.4,28.4,2.6,2.2,c.O);
  [[11,27],[12,26],[13,26],[10,28]].forEach(([x,y])=>P.p(x,y,c.Ol));[[16,32],[17,32],[18,31],[18,30]].forEach(([x,y])=>P.p(x,y,c.Od));
  P.r(14,29,2,2,c.hole);P.r(16,31,2,1,c.Od);
  P.ln(11,27.5,2,21,c.nk,2);P.ln(10.5,27,1.5,20.5,c.nst,1);
  P.r(0,18,3,4,c.hs);P.p(0,17,c.peg);P.p(2,17,c.peg);P.p(3,18,c.peg);
  const sl=[[3,19],[3,18],[4,17],[4,16],[5,15],[5,14],[6,13],[7,13]];sl.forEach(([x,y],i)=>P.p(x,y,[c.st1,c.st2,c.st3][i%3]));
  P.r(4,21,3,2,c.S);P.p(4,23,c.s);P.p(6,23,c.s);
  P.art(KHEAD,KHMAP,4,0);
  P.p(5,10,c.y);
  if(leg!==1){P.r(5+hem,41,3,1,c.S);P.r(5+hem,42,4,1,c.sand);}
  if(leg!==2){P.r(13+hem,41,3,1,c.S);P.r(13+hem,42,4,1,c.sand);}
  return P.canvas('#0a0716');
}
