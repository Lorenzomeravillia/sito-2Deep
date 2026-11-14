/* the WhatsApp/Facebook preview for 2deep.it/gioca: 1200x630, the logo in the middle (it survives a square crop), the duo on
   the left, the real table on the right, RE DIVANO taking a ball under the title */
const W0=1200,H0=630,c=document.getElementById('c');c.width=W0;c.height=H0;ctx=c.getContext('2d');
const oglow=(x,y,r,col,a)=>{const g=ctx.createRadialGradient(x,y,0,x,y,r);const [R_,G_,B_]=hx(col);g.addColorStop(0,`rgba(${R_},${G_},${B_},${a})`);g.addColorStop(1,`rgba(${R_},${G_},${B_},0)`);ctx.fillStyle=g;ctx.fillRect(x-r,y-r,2*r,2*r);};
function big(s,cx,y,sc,col,sh,sd,ol){const x=Math.round(cx-tw(s)*sc/2);
  if(ol)for(let a=0;a<16;a++){const dx=Math.round(Math.cos(a/16*Math.PI*2)*ol),dy=Math.round(Math.sin(a/16*Math.PI*2)*ol);glyphs(s,x+dx,y+dy,sc,'#0a0716');glyphs(s,x+dx+sd,y+dy+sd,sc,'#0a0716');}
  if(sh)glyphs(s,x+sd,y+sd,sc,sh);glyphs(s,x,y,sc,col);return x;}
function draw(table){
  ctx.imageSmoothingEnabled=false;
  const bg=ctx.createLinearGradient(0,0,0,H0);bg.addColorStop(0,'#0b0720');bg.addColorStop(0.6,'#140c2c');bg.addColorStop(1,'#22123e');ctx.fillStyle=bg;ctx.fillRect(0,0,W0,H0);
  /* a synthwave floor: magenta lines running to the horizon */
  ctx.save();ctx.globalAlpha=0.22;ctx.strokeStyle='#e897c8';ctx.lineWidth=1.5;const hy=455;
  for(let k=-14;k<=14;k++){ctx.beginPath();ctx.moveTo(600+k*14,hy);ctx.lineTo(600+k*120,H0);ctx.stroke();}
  for(let k=0;k<7;k++){const y=hy+Math.pow(k/6,1.8)*(H0-hy);ctx.globalAlpha=0.08+0.2*k/6;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W0,y);ctx.stroke();}ctx.restore();
  for(let k=0;k<140;k++){const x=R(k*3.7)*W0|0,y=R(k*9.1+2)*430|0,s=R(k*1.3)>0.85?3:2;ctx.fillStyle=R(k*5.5)>0.6?'#f6eedf':R(k*2.2)>0.5?'#86cfdc':'#e897c8';ctx.globalAlpha=0.25+R(k*7.7)*0.5;ctx.fillRect(x,y,s,s);}ctx.globalAlpha=1;
  oglow(600,250,380,'#e897c8',0.22);oglow(980,300,330,'#86cfdc',0.2);oglow(190,470,260,'#f2d27a',0.12);
  /* the table, leaning in from the right */
  ctx.save();ctx.translate(985,322);ctx.rotate(6*Math.PI/180);const th=612,tw_=th*table.width/table.height;
  ctx.shadowColor='rgba(134,207,220,0.75)';ctx.shadowBlur=36;ctx.fillStyle='#07050f';ctx.fillRect(-tw_/2-6,-th/2-6,tw_+12,th+12);ctx.shadowBlur=0;
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(table,-tw_/2,-th/2,tw_,th);ctx.imageSmoothingEnabled=false;
  ctx.strokeStyle='rgba(134,207,220,0.9)';ctx.lineWidth=3;ctx.strokeRect(-tw_/2-6,-th/2-6,tw_+12,th+12);ctx.restore();
  /* the duo on the left, Lorenzo with the high-resolution harp guitar */
  const S=6,ground=616;
  ctx.fillStyle='rgba(0,0,0,0.45)';ctx.beginPath();ctx.ellipse(112,ground-2,80,10,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(272,ground-2,96,11,0,0,Math.PI*2);ctx.fill();
  const kat=buildKat(1);ctx.drawImage(kat,44,ground-kat.height*S,kat.width*S,kat.height*S);
  const lb=buildLor(2,'back'),lf=buildLor(2,'front'),hg=buildHarpHi(),lx=176,ly=ground-lb.height*S;
  ctx.drawImage(lb,lx,ly,lb.width*S,lb.height*S);ctx.drawImage(hg,lx,ly,lb.width*S,lb.height*S);ctx.drawImage(lf,lx,ly,lb.width*S,lb.height*S);
  [[60,300,0],[140,250,1],[330,262,2],[388,318,3]].forEach(([x,y,k])=>ctx.drawImage(NOTES[k],x,y,NOTES[k].width*4,NOTES[k].height*4));
  /* the logo */
  big('2DEEP',600,62,16,'#f2d27a','#b0485a',8,5);
  big('PINBALL',600,196,8,'#86cfdc','#24506a',5,4);
  big('BATTI IL DIVANO!',600,288,4,'#f6eedf',null,0,3);
  /* RE DIVANO takes a ball */
  const sx=600-80,sy=400;ctx.fillStyle='rgba(0,0,0,0.45)';ctx.beginPath();ctx.ellipse(604,sy+92,78,9,0,0,Math.PI*2);ctx.fill();
  ctx.save();ctx.translate(600,sy+48);ctx.rotate(0.06);ctx.drawImage(SOFA_ICON,-80,-48,160,96);ctx.drawImage(CROWN,-40,-84,76,36);ctx.restore();
  ctx.strokeStyle='rgba(246,238,223,0.55)';ctx.lineCap='round';[[0,4],[12,3],[-12,2.5]].forEach(([o,w])=>{ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(392+o*0.4,322+o);ctx.lineTo(486+o*0.4,378+o);ctx.stroke();});
  const bx=506,by=388,br=19,sg=ctx.createRadialGradient(bx-7,by-8,2,bx,by,br);sg.addColorStop(0,'#ffffff');sg.addColorStop(0.45,'#c9c6dc');sg.addColorStop(1,'#4a4866');
  ctx.fillStyle='rgba(0,0,0,0.35)';ctx.beginPath();ctx.arc(bx+4,by+6,br,0,Math.PI*2);ctx.fill();ctx.fillStyle=sg;ctx.beginPath();ctx.arc(bx,by,br,0,Math.PI*2);ctx.fill();
  [[540,372],[560,406],[528,420],[666,374],[690,410]].forEach(([x,y],i)=>ctx.drawImage(SPARK,x,y,SPARK.width*(i%2?3:4),SPARK.height*(i%2?3:4)));
  big('K.O.!',735,392,4,'#f0646e',null,0,3);
  big('2DEEP.IT',600,566,3,'#c9c0ea',null,0,2);
  window.DONE=true;}
const T=new Image();T.onload=()=>draw(T);T.src='table.png';
