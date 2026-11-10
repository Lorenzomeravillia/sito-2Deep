/* dithered fade masks */
const FADE=[];for(let k=0;k<=16;k++){const c=mk(384,384),g=c.getContext('2d'),id=g.createImageData(384,384);for(let y=0;y<384;y++)for(let x=0;x<384;x++)if(bay(x,y)<k/16)id.data[(y*384+x)*4+3]=255;g.putImageData(id,0,0);FADE.push(c);}
const fade=a=>{const k=Math.round(clamp(a)*16);if(k>0)ctx.drawImage(FADE[k],0,0);};

/* recap background */
const RECAPBG=mk(W,H);
(()=>{const g=RECAPBG.getContext('2d'),id=g.createImageData(W,H),D=id.data;
  const sp=(x,y,c)=>{if(x<0||y<0||x>=W||y>=H)return;const v=hx(c),i=(y*W+x)*4;D[i]=v[0];D[i+1]=v[1];D[i+2]=v[2];D[i+3]=255;};
  const cs=['#05061a','#090c28','#0e1440','#141d54','#1b2862'].map(hx);
  for(let y=0;y<H;y++){const f=clamp(y/330)*(cs.length-1),k=Math.min(cs.length-2,Math.floor(f)),fr_=f-k;for(let x=0;x<W;x++){const v=fr_>bay(x,y)?cs[k+1]:cs[k],i=(y*W+x)*4;D[i]=v[0];D[i+1]=v[1];D[i+2]=v[2];D[i+3]=255;}}
  for(let x=0;x<W;x++){const h=Math.max(30-Math.abs(x-40)*0.7,44-Math.abs(x-130)*0.6,26-Math.abs(x-205)*0.5)+(R(x*3.1)*2|0);for(let y=Math.round(330-h);y<330;y++)sp(x,y,y<300?'#3a4a8a':(x>130?'#121a40':'#18214c'));}
  for(let y=326;y<H;y++)for(let x=0;x<W;x++){const n=R(Math.floor(x/7)*13.1+Math.floor(y/5)*7.7);sp(x,y,y<329?'#1a4a28':((n>0.7&&bay(x,y)<0.5)?'#1c4f2c':'#245f31'));}
  for(let k=0;k<70;k++){const x=R(k*3.3)*W|0,y=332+(R(k*5.1)*48|0);sp(x,y,'#378a44');sp(x-1,y+1,'#378a44');sp(x+1,y+1,'#378a44');}
  for(let y=-9;y<=9;y++)for(let x=-9;x<=9;x++){const d=x*x+y*y;if(d<=80)sp(190+x,22+y,d>64?'#cfc390':'#f1e6b4');}
  g.putImageData(id,0,0);})();

