/* the WhatsApp/Facebook preview for 2deep.it/libera: 1200x630, a frame of the game (no dates on it) on the left, the title on the right */
const W0=1200,H0=630,c=document.getElementById('c');c.width=W0;c.height=H0;ctx=c.getContext('2d');
function big(s,x,y,sc,col,sd){glyphs(s,x+sd,y+sd,sc,'#0a0716');glyphs(s,x,y,sc,col);}
const img=new Image();img.onload=()=>{ctx.imageSmoothingEnabled=false;
  const bg=ctx.createLinearGradient(0,0,0,H0);bg.addColorStop(0,'#0b0720');bg.addColorStop(1,'#1d1036');ctx.fillStyle=bg;ctx.fillRect(0,0,W0,H0);
  for(let i=0;i<90;i++){ctx.fillStyle=`rgba(255,255,255,${0.15+R(i*3.3)*0.35})`;ctx.fillRect((R(i*7.1)*W0)|0,(R(i*1.9+2)*H0)|0,2,2);}
  /* the game, 270x480 shown at 1.25x with a neon frame */
  const fw=338,fh=600,fx=70,fy=15,gl=ctx.createRadialGradient(fx+fw/2,fy+fh/2,50,fx+fw/2,fy+fh/2,420);gl.addColorStop(0,'rgba(255,122,216,0.25)');gl.addColorStop(1,'rgba(255,122,216,0)');ctx.fillStyle=gl;ctx.fillRect(0,0,W0,H0);
  ctx.drawImage(img,fx,fy,fw,fh);ctx.strokeStyle='#ff7ad8';ctx.lineWidth=3;ctx.strokeRect(fx-2,fy-2,fw+4,fh+4);
  const tx=480;big('LIBERA',tx,120,12,'#f2d27a',7);big('LA SERATA',tx,222,8,'#f2d27a',5);
  big('IL GIOCO DEI 2DEEP',tx+4,330,5,'#e897c8',3);
  big('CHIUDI LE AREE, SCOPRI',tx+4,410,4,'#f6eedf',2);big('DOVE SUONIAMO DAL VIVO',tx+4,456,4,'#f6eedf',2);
  big('2DEEP.IT/LIBERA',tx+4,540,4,'#86cfdc',2);
  window.DONE=true;};img.src='frame.png';
