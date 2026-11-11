/* ---------------- "Prossimi livelli": default song and game sound effects ---------------- */
function defaultSong(){
  const ev=[],BEAT=0.4,E=0.2,BAR=1.6;
  const CH={C:['C4','E4','G4'],Am:['A3','C4','E4'],F:['A3','C4','F4'],G:['G3','B3','D4']},BASS={C:['C3','E3','G3','E3'],Am:['A2','C3','E3','C3'],F:['F2','A2','C3','A2'],G:['G2','B2','D3','B2']};
  const chord=b=>b<2?'C':['C','Am','F','G'][(b-2)%4];
  const A=[[['G4',1],['C5',1],['E5',2],['D5',1],['C5',1],['E5',2]],[['A4',1],['C5',1],['E5',2],['G5',2],['E5',2]],[['F5',2],['E5',1],['D5',1],['C5',2],['A4',2]],[['B4',1],['D5',1],['G5',2],['F5',1],['E5',1],['D5',2]]];
  const B=[[['E5',1],['E5',1],['G5',1],['E5',1],['C6',2],['G5',2]],[['A5',2],['G5',1],['E5',1],['C5',2],['E5',2]],[['F5',1],['A5',1],['G5',1],['F5',1],['E5',2],['D5',2]],[['D5',1],['E5',1],['F5',1],['D5',1],['G5',4]]];
  const MEL={2:A[0],3:A[1],4:A[2],5:A[3],6:B[0],7:B[1],8:B[2],9:B[3],10:A[0],14:A[0],15:A[1],16:A[2],17:A[3],18:A[0],19:A[1],20:A[2],21:B[3],22:B[0]};
  const NB=Math.round(DUR/BAR);
  for(let b=0;b<NB;b++){const t0=b*BAR,c=chord(b),pat=b<2?['C3','G3','C3','G3']:BASS[c];
    pat.forEach((n,i)=>ev.push({t:t0+i*BEAT,d:0.34,m:NN(n),v:127,i:'bass'}));
    for(let i=0;i<4;i++)CH[c].forEach(n=>ev.push({t:t0+i*BEAT+E,d:0.075,m:NN(n),v:127,i:'skank'}));
    for(let i=0;i<8;i++)ev.push({t:t0+i*E,d:0.03,m:42,v:i%2?110:80,i:'drums'});
    if(b>=1){[0,2].forEach(k=>ev.push({t:t0+k*BEAT,d:0.1,m:36,v:127,i:'drums'}));[1,3].forEach(k=>ev.push({t:t0+k*BEAT,d:0.1,m:38,v:127,i:'drums'}));}
    if(b===19)[0,1,2,3].forEach(k=>ev.push({t:t0+3*BEAT+k*0.1,d:0.05,m:38,v:90+k*12,i:'drums'}));
    if(b>=20){if(b===20)ev.push({t:t0,d:0.6,m:49,v:127,i:'drums'});for(let i=0;i<4;i++)ev.push({t:t0+i*BEAT+E,d:0.1,m:46,v:100,i:'drums'});}
    if(MEL[b]){let tt=t0;MEL[b].forEach(([n,d])=>{ev.push({t:tt,d:d*E,m:NN(n),v:127,i:'lead'});tt+=d*E;});}}
  return ev;
}
function scheduleSfx(E){
  const bl=(t,n,d,v,duty=0.5,dec=0)=>E.osc(t,d,mtof(NN(n)),duty,v,dec?{decay:dec}:{});
  const arp=(t,ns,st,d,v,duty=0.5)=>ns.forEach((n,i)=>bl(t+i*st,n,d,v,duty));
  bl(T.start+0.16,'C7',0.3,0.08,0.5,0.1);E.noise(T.start,0.06,0.1,{hp:2500,decay:0.02});
  arp(T.start,['C6','E6','G6','C7'],0.045,0.07,0.11);E.noise(T.start,0.15,0.08,{hp:2000,decay:0.05});
  E.noise(T.ls1End-0.25,0.25,0.06,{hp:1500,decay:0.1});
  arp(3.32,['G5','C6'],0.09,0.06,0.07);
  T.walks.forEach(([a,b],i)=>{const e=i===3?T.iris[0]:b;for(let t=a+0.05;t<e-0.05;t+=0.19)E.noise(t,0.018,0.05,{lp:2500,decay:0.006});});
  T.arrive.forEach(ta=>{E.noise(ta,0.025,0.12,{hp:1500,decay:0.008});bl(ta,'C7',0.015,0.06);arp(ta+0.06,['G5','C6','E6','G6'],0.055,0.07,0.10);bl(ta+0.28,'C7',0.32,0.09,0.5,0.12);
    [0.35,0.5,0.66,0.82,0.96].forEach((o,k)=>bl(ta+o,['A5','C6','D6','E6','G6'][k],0.03,0.045,0.125));});
  for(let k=0;k<14;k++)E.noise(T.arrive[1]+0.1+k*0.042,0.02,0.05,{hp:800,decay:0.006});
  E.osc(T.iris[0],0.42,900,0.5,0.07,{sweep:140});
  PAST.forEach((row,i)=>{const t=T.score+0.5+i*0.32;if(!row[2]){E.noise(t,0.7,0.28,{lp:300,decay:0.25});E.noise(t,0.08,0.12,{hp:2000,decay:0.03});}else{bl(t,'E6',0.05,0.08);bl(t+0.05,'A6',0.2,0.08,0.5,0.07);}});
  arp(T.score+0.5+Math.max(0,PAST.length-1)*0.32+0.3,['C6','E6','G6','C7'],0.05,0.08,0.09);
  E.noise(T.ls2-0.25,0.25,0.06,{hp:1500,decay:0.1});
  [1.4,2.5,3.6].forEach(o=>bl(T.ls2+o,'C6',0.025,0.05,0.125));
  /* closing: walk to the stage, little events on the way, party */
  const C0=T.close,EV2=sideEvents(),NS=['E6','F#6','G#6','A6','B6','C#7','D#7','E7','F#7','G#7','A7'];
  E.noise(C0-0.25,0.25,0.06,{hp:1500,decay:0.1});arp(C0+0.15,['C5','E5','G5'],0.06,0.06,0.07);
  for(let t=SIDE.walk[0];t<SIDE.walk[1];t+=0.13)E.noise(C0+t,0.018,0.05,{lp:2500,decay:0.006});
  EV2.notes.forEach((tn,i)=>{bl(C0+tn,NS[i]||'E7',0.05,0.055,0.25);bl(C0+tn+0.045,NS[i]||'E7',0.08,0.035,0.25,0.04);});
  bl(C0+EV2.bang,'A5',0.04,0.07);bl(C0+EV2.bang+0.05,'E6',0.06,0.07);
  E.noise(C0+EV2.cin,0.05,0.06,{hp:5000,decay:0.02});bl(C0+EV2.cin,'C7',0.05,0.05,0.5,0.06);bl(C0+EV2.cin+0.06,'E7',0.06,0.04,0.5,0.06);
  [0,0.125,0.25,0.375].forEach(o=>E.noise(C0+EV2.neon+o,0.04,0.035,{lp:400,decay:0.02}));
  arp(C0+EV2.spritz,['G5','C6','E6','G6'],0.04,0.05,0.08);
  bl(C0+EV2.spritz+0.35,'G6',0.12,0.06,0.25,0.06);E.noise(C0+EV2.flash,0.03,0.1,{hp:3000,decay:0.01});E.noise(C0+EV2.flash+0.05,0.03,0.07,{hp:3000,decay:0.01});
  E.osc(C0+SIDE.hop[0],0.3,300,0.5,0.06,{sweep:900});E.noise(C0+SIDE.hop[1],0.12,0.14,{lp:500,decay:0.05});
  E.noise(C0+SIDE.play,2.4,0.11,{hp:900,lp:4000,decay:0.8});
  for(let i=0;i<8;i++)E.noise(C0+SIDE.play+0.05+i*0.09,0.02,0.04,{hp:4000,decay:0.01});
  arp(C0+SIDE.cta,['C6','E6','G6','C7'],0.05,0.07,0.09);
  E.noise(C0+CL-0.25,0.25,0.06,{hp:1500,decay:0.1});
}
