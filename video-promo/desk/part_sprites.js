/* ---------------- SABATO_SERA.EXE: the 90s desktop kit (original look-alike, no real logos) ---------------- */
/* extra glyphs for file names and percentages */
Object.assign(FONT,{
'_':[".....",".....",".....",".....",".....",".....","#####"],
'%':["##...","##..#","...#.","..#..",".#...","#..##","...##"],
'[':["##","#.","#.","#.","#.","#.","##"],']':["##",".#",".#",".#",".#",".#","##"],
'=':[".....",".....","#####",".....","#####",".....","....."],
'<':["...#","..#.",".#..","#...",".#..","..#.","...#"]
});
const C95={teal:'#008080',face:'#c0c0c0',light:'#dfdfdf',hi:'#ffffff',sh:'#808080',dk:'#000000',navy:'#000080',blue:'#1084d0',tip:'#ffffe1',txt:'#000000',red:'#c00000',green:'#007a00',bsod:'#0000aa'};
/* raised or sunken 2-pixel bevel */
function bevel(x,y,w,h,sunk){
  const[a,b,c,d]=sunk?[C95.sh,C95.dk,C95.hi,C95.light]:[C95.light,C95.hi,C95.dk,C95.sh];
  rr(x,y,w,1,a);rr(x,y,1,h,a);rr(x+1,y+1,w-2,1,b);rr(x+1,y+1,1,h-2,b);
  rr(x,y+h-1,w,1,c);rr(x+w-1,y,1,h,c);rr(x+1,y+h-2,w-2,1,d);rr(x+w-2,y+1,1,h-2,d);}
function face(x,y,w,h,sunk){rr(x,y,w,h,C95.face);bevel(x,y,w,h,sunk);}
function field(x,y,w,h,bg){rr(x,y,w,h,bg||'#ffffff');bevel(x,y,w,h,true);}
/* title bar: navy to light blue, white title, close box */
function tbar(x,y,w,h,title,active){
  const a=hx(active?C95.navy:'#808080'),b=hx(active?C95.blue:'#b4b4b4');
  for(let i=0;i<w;i++){const f=w>1?i/(w-1):0;ctx.fillStyle='rgb('+Math.round(a[0]+(b[0]-a[0])*f)+','+Math.round(a[1]+(b[1]-a[1])*f)+','+Math.round(a[2]+(b[2]-a[2])*f)+')';ctx.fillRect(Math.round(x+i),Math.round(y),1,h);}
  const bs=h-2,bx=x+w-bs-3,by=y+1;
  dt(title,x+3,y+Math.round((h-7)/2),1,active?'#ffffff':'#d8d8d8',{max:Math.max(1,Math.floor((bx-x-6)/6))});
  face(bx,by,bs+1,bs);for(let k=0;k<5;k++){rr(bx+2+k,by+2+k,2,1,C95.dk);rr(bx+6-k,by+2+k,2,1,C95.dk);}
}
/* window frame; returns the client rectangle */
function win(r,title,o={}){const[x,y,w,h]=r.map(Math.round);face(x,y,w,h);tbar(x+3,y+3,w-6,11,title,o.active!==false);return[x+4,y+16,w-8,h-20];}
function btn(x,y,w,h,label,o={}){const p=!!o.pressed,sc=o.sc||1;face(x,y,w,h,p);
  if(o.def){rr(x-1,y-1,w+2,1,C95.dk);rr(x-1,y+h,w+2,1,C95.dk);rr(x-1,y-1,1,h+2,C95.dk);rr(x+w,y-1,1,h+2,C95.dk);}
  dt(label,Math.round(x+(w-tw(label)*sc)/2)+(p?1:0),Math.round(y+(h-7*sc)/2)+(p?1:0),sc,C95.txt);}
/* plain text block, one entry per line */
function lines(arr,x,y,sc,col,lh,center){arr.forEach((s,i)=>{const yy=y+i*lh;if(center)dt(s,Math.round(x-tw(s)*sc/2),yy,sc,col);else dt(s,x,yy,sc,col);});}
/* zoom-rectangle animation used when a window opens (three outlines growing from a point) */
function zoomRect(from,to,u){for(let k=0;k<3;k++){const v=clamp(u-k*0.18);if(v<=0||v>=1)continue;const r=from.map((a,i)=>a+(to[i]-a)*v);
  const[x,y,w,h]=r.map(Math.round);for(let i=0;i<w;i+=2){rr(x+i,y,1,1,C95.dk);rr(x+i,y+h-1,1,1,C95.dk);}for(let j=0;j<h;j+=2){rr(x,y+j,1,1,C95.dk);rr(x+w-1,y+j,1,1,C95.dk);}}}
/* pixel triangle from a horizontal base [xa,xb] at ya to an apex, with a black outline */
function tail(xa,xb,ya,px,py,fill){const n=Math.max(1,Math.abs(py-ya));for(let k=0;k<=n;k++){const f=k/n,y=Math.round(ya+(py-ya)*f),l=Math.round(xa+(px-xa)*f),r=Math.round(xb+(px-xb)*f);rr(Math.min(l,r),y,Math.abs(r-l)+1,1,fill);rr(l,y,1,1,C95.dk);rr(r,y,1,1,C95.dk);}}

/* same, with a vertical base at x=xa from ya to yb (balloon tail coming out of the side) */
function tailV(xa,ya,yb,px,py,fill){const n=Math.max(1,Math.abs(px-xa));for(let k=0;k<=n;k++){const f=k/n,x=Math.round(xa+(px-xa)*f),a=Math.round(ya+(py-ya)*f),b=Math.round(yb+(py-yb)*f);rr(x,Math.min(a,b),1,Math.abs(b-a)+1,fill);rr(x,a,1,1,C95.dk);rr(x,b,1,1,C95.dk);}}

/* ---------------- icons ---------------- */
const FOLDER=(()=>{const P=new PG(18,14);P.r(1,1,7,3,'#e8c860');P.r(1,1,7,1,'#fff2a0');P.r(0,3,18,11,'#e8c860');P.r(0,4,18,1,'#fff2a0');P.r(1,5,16,1,'#ffe890');P.r(0,13,18,1,'#8a6a10');P.r(17,3,1,11,'#8a6a10');return P.canvas('#000000');})();
const TRASH=(()=>{const P=new PG(14,17);P.r(0,2,14,2,'#d8d8d8');P.r(5,0,4,2,'#d8d8d8');P.r(1,4,12,13,'#ececec');for(let x=3;x<12;x+=3)P.r(x,6,1,9,'#8a8a8a');P.r(12,4,1,13,'#9a9a9a');return P.canvas('#000000');})();
const PC=(()=>{const P=new PG(18,16);P.r(0,0,18,12,'#d4d4d4');P.r(2,2,14,8,'#008080');P.r(3,3,5,2,'#5fe0ff');P.r(16,1,1,10,'#8a8a8a');P.r(6,12,6,2,'#9a9a9a');P.r(2,14,14,2,'#d4d4d4');return P.canvas('#000000');})();
const GLOBE=(()=>{const P=new PG(16,16);P.el(7.5,7.5,7.6,7.6,'#2a6ae0');P.r(3,3,4,3,'#3ac85a');P.r(2,6,5,3,'#3ac85a');P.r(9,8,4,4,'#3ac85a');P.r(10,2,3,2,'#3ac85a');P.r(4,2,2,1,'#9ad0ff');return P.canvas('#000000');})();
const ERRX=(()=>{const P=new PG(17,17);P.el(8,8,8.2,8.2,'#d01818');P.el(7,6,5,4,'#e83a3a');P.ln(4,4,12,12,'#ffffff',2);P.ln(12,4,4,12,'#ffffff',2);return P.canvas('#000000');})();
const WARN=(()=>{const P=new PG(17,15);for(let y=0;y<15;y++){const hw=Math.round(y*8/14);P.r(8-hw,y,hw*2+1,1,'#ffd400');}P.r(7,4,3,6,'#000000');P.r(7,11,3,2,'#000000');return P.canvas('#000000');})();
const CURSOR=sprite(["#..........","##.........","#W#........","#WW#.......","#WWW#......","#WWWW#.....","#WWWWW#....","#WWWWWW#...","#WWWWWWW#..","#WWWWWWWW#.","#WWWWW#####","#WW#WW#....","#W#.#WW#...","##..#WW#...","#....#WW#..",".....#WW#..","......##..."],{'#':'#000000',W:'#ffffff'});
/* solitaire-style cards with a note or a guitar pick */
const CARDS=[0,1,2,3].map(k=>{const P=new PG(18,24),c=k%2?'#d01020':'#141414';P.r(0,0,18,24,'#141414');P.r(1,1,16,22,'#ffffff');P.p(0,0,null);P.p(17,0,null);P.p(0,23,null);P.p(17,23,null);
  P.r(2,2,2,3,c);P.r(14,19,2,3,c);
  if(k<2){P.r(10,5,2,10,c);P.r(12,5,3,2,c);P.r(13,7,2,2,c);P.el(8.5,15,3.2,2.4,c);}
  else{for(let y=0;y<12;y++){const hw=Math.round(5.5*Math.sqrt(1-Math.pow(Math.max(0,y-2)/10,1.6))-(y<2?2-y:0));P.r(9-hw,6+y,hw*2,1,c);}}
  return P.canvas();});
/* Katia's face for the chat window */
const KFACE=(()=>{const c=mk(22,20),g=c.getContext('2d');g.drawImage(SPR.kat[0],0,0,22,20,0,0,22,20);return c;})();
/* light bulb for the tip-of-the-day window, and the recycle bin filled up with the sofa */
const BULB=sprite(["...####...","..#YYYY#..",".#YYWYYY#.","#YYWYYYYY#","#YYYYYYYY#","#YYYYYYYY#",".#YYYYYY#.","..#YYYY#..","...#YY#...","...GGGG...","...gggg...","...GGGG...","....gg...."],{'#':'#000000',Y:'#ffe03a',W:'#ffffff',G:'#b0b0b0',g:'#6a6a6a'});
const TRASHF=(()=>{const P=new PG(16,20);P.r(1,5,14,2,'#d8d8d8');P.r(2,7,12,13,'#ececec');for(let x=4;x<13;x+=3)P.r(x,9,1,9,'#8a8a8a');P.r(13,7,1,13,'#9a9a9a');
  P.r(3,1,5,4,'#e8384a');P.r(4,2,3,1,'#ff6a74');P.r(8,0,5,5,'#c02a3a');P.r(9,1,3,2,'#e8384a');P.r(2,3,2,2,'#ffe03a');return P.canvas('#000000');})();
/* recycle bin in two pieces, so the lid can flip open; a text file; an envelope for the share dialog */
const BINBODY=(()=>{const P=new PG(14,14);P.r(0,0,14,14,'#ececec');for(let x=3;x<12;x+=3)P.r(x,2,1,10,'#8a8a8a');P.r(12,0,2,14,'#a8a8a8');P.r(0,0,14,1,'#ffffff');return P.canvas('#000000');})();
const BINLID=(()=>{const P=new PG(16,4);P.r(0,2,16,2,'#d8d8d8');P.r(0,2,16,1,'#ffffff');P.r(5,0,6,2,'#d8d8d8');return P.canvas('#000000');})();
const BINLIDO=(()=>{const P=new PG(4,16);P.r(0,0,2,16,'#d8d8d8');P.r(1,0,1,16,'#ffffff');P.r(2,5,2,6,'#d8d8d8');return P.canvas('#000000');})();
const PAPER=(()=>{const P=new PG(11,14);P.r(0,0,8,14,'#ffffff');P.r(8,3,3,11,'#ffffff');P.r(8,0,1,3,'#c8c8c8');P.r(9,2,2,1,'#c8c8c8');for(let y=4;y<12;y+=2)P.r(2,y,7,1,'#5a5a8a');return P.canvas('#000000');})();
const MAIL=(()=>{const P=new PG(18,13);P.r(0,0,18,13,'#fff6c8');for(let k=0;k<9;k++){P.p(k,k*0.7|0,'#8a6a2a');P.p(17-k,k*0.7|0,'#8a6a2a');}P.r(7,7,4,3,'#e8384a');return P.canvas('#000000');})();
