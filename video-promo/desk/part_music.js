/* ---------------- SABATO_SERA.EXE soundtrack: modem, 8-bit ska at 150 BPM (bar 1.6 s, 15 bars) ---------------- */
function defaultSong(){
  const ev=[],E=0.2,BAR=1.6,push=(t,d,n,i,v=127)=>ev.push({t,d,m:typeof n==='number'?n:NN(n),v,i});
  const CH={C:['C4','E4','G4'],Am:['A3','C4','E4'],F:['A3','C4','F4'],G:['G3','B3','D4'],E:['G#3','B3','E4']};
  const BS={C:['C3','G2','C3','E3'],Am:['A2','E2','A2','C3'],F:['F2','C3','F2','A2'],G:['G2','D3','G2','B2'],E:['E2','B2','E2','G#2']};
  /* chords per half bar. 0-1 modem (tip window), 2-3 assistant and download, 4-5 the sofa, 6 the push, 7 into the bin and the secret,
     8 download complete, 9 the app opens, 10-13 on stage, info and share, 14 ending */
  const PROG={2:['C','C'],3:['F','G'],4:['Am','F'],5:['Am','E'],6:['F','G'],7:['C','C'],8:['G','G'],9:['C','G'],
    10:['C','G'],11:['Am','F'],12:['C','G'],13:['F','G']};
  const R1=[['A4',1],['C5',1],['E5',1],['A5',1],['F5',1],['A5',1],['C6',1],['A5',1]];
  const MEL={2:[['E5',1],['G5',1],['C6',2],['B5',1],['G5',1],['E5',2]],3:[['F5',1],['A5',1],['C6',2],['D6',1],['B5',1],['G5',2]],
    4:R1,5:[['A4',1],['C5',1],['E5',1],['A5',1],['G#5',1],['B5',1],['E6',2]],
    /* the push: a little climbing figure, one step per shove */
    6:[['F5',1],['G5',1],['A5',1],['C6',1],['D6',1],['E6',1],['F6',1],['G6',1]],
    7:[['C7',2],['G6',1],['E6',1],['C6',4]],
    9:[['G5',1],['C6',1],['E6',2],['D6',1],['C6',1],['B5',2]],
    10:[['C6',1],['E6',1],['G6',2],['E6',1],['C6',1],['D6',2]],11:[['C6',1],['A5',1],['C6',2],['F6',2],['E6',2]],
    12:[['E6',1],['G6',1],['C7',2],['G6',2],['E6',2]],13:[['A5',1],['C6',1],['F6',2],['G6',2],['B6',2]]};
  const DRIVE=[4,5];
  Object.keys(PROG).map(Number).forEach(b=>{const t0=b*BAR,light=b===8;
    for(let h=0;h<2;h++){const c=PROG[b][h],th=t0+h*0.8;
      if(DRIVE.includes(b))for(let i=0;i<4;i++)push(th+i*E,0.17,BS[c][i%2?1:0],'bass');else BS[c].slice(h*2,h*2+2).forEach((n,i)=>push(th+i*0.4,0.34,n,'bass'));
      for(let i=0;i<2;i++)CH[c].forEach(n=>push(th+i*0.4+E,0.075,n,'skank'));}
    for(let i=0;i<8;i++)push(t0+i*E,0.03,42,'drums',i%2?110:80);
    [0,2].forEach(k=>push(t0+k*0.4,0.1,36,'drums'));if(!light)[1,3].forEach(k=>push(t0+k*0.4,0.1,38,'drums'));
    if(MEL[b]){let tt=t0;MEL[b].forEach(([n,d])=>{push(tt,d*E,n,DRIVE.includes(b)?'sq':'lead');tt+=d*E;});}});
  /* the assistant's chime, hi-hats counting in to bar 2 */
  ['C5','E5','G5','B5','D6','G6'].forEach((n,i)=>push(EV.asst.in+i*0.06,0.5-i*0.04,n,'lead',100));push(EV.asst.in,0.6,'C2','bass',100);
  for(let i=0;i<2;i++)push(2.8+i*E,0.03,42,'drums',80+i*15);
  /* crashes on the big moments */
  [EV.sofa.rise,EV.push.slam,EV.dl.done,16.0].forEach(t=>push(t,0.6,49,'drums',95));
  /* tom fill into the stage */
  [47,45,43,41].forEach((m,k)=>push(15.6+k*0.1,0.08,m,'drums'));
  /* bar 14: ending chord and a little tag before the screen switches off */
  const T=14*BAR;push(T,0.6,49,'drums');push(T,0.1,36,'drums');['C4','E4','G4','C5'].forEach(n=>push(T,0.7,n,'sq',90));push(T,1.0,'C2','bass');
  [['C6',0.35,0.4],['G5',0.15,0.2],['C6',0.9,0]].reduce((tt,[n,d,step])=>{push(tt,d,n,'lead');return tt+step;},T);
  push(T+0.8,0.1,36,'drums');push(T+0.8,0.1,38,'drums');
  return ev;
}
function scheduleSfx(X){
  const sn=(t,d,f,v,o={})=>X.osc(t,d,f,'sine',v,o),bl=(t,n,d,v,duty=0.5,dec=0)=>X.osc(t,d,mtof(NN(n)),duty,v,dec?{decay:dec}:{});
  const arp=(t,ns,st,d,v,duty=0.5)=>ns.forEach((n,i)=>bl(t+i*st,n,d,v,duty));
  const click=t=>{X.noise(t,0.02,0.16,{hp:3000,decay:0.006});X.noise(t+0.11,0.02,0.1,{hp:3500,decay:0.005});};
  const whoosh=t=>X.noise(t,0.25,0.06,{hp:1500,decay:0.1});
  const ding=(t,v=1)=>{[1046.5,1318.5,1568].forEach(f=>sn(t,0.3,f,0.05*v,{decay:0.12}));X.osc(t,0.2,523.25,'tri',0.05*v,{decay:0.08});};
  const P=EV.push,S=EV.secret;
  /* CRT on, a ding for the tip window */
  X.noise(0,0.15,0.14,{lp:300,decay:0.06});sn(0.02,0.4,7800,0.015,{decay:0.12});ding(0.05,0.8);
  /* modem under the tip window: dial tone, digits, answer tone, handshake screech, connected */
  sn(0.15,0.3,350,0.12);sn(0.15,0.3,440,0.12);
  const LOW=[697,770,852,941],HIGH=[1209,1336,1477];[[0,1],[2,0],[1,2],[3,1],[0,0],[2,2],[1,1]].forEach(([a,b],i)=>{const t=0.5+i*0.065;sn(t,0.05,LOW[a],0.11);sn(t,0.05,HIGH[b],0.09);});
  sn(1.0,0.25,2100,0.1);
  for(let k=0;k<14;k++)sn(1.25+k*0.02,0.02,k%2?980:1180,0.09);
  X.noise(1.35,0.75,0.13,{hp:1600,lp:5200});X.osc(1.42,0.5,1800,0.5,0.05,{sweep:700});
  for(let k=0;k<12;k++)X.osc(1.5+k*0.06,0.03,k%2?2400:1650,0.25,0.06);
  arp(2.0,['C6','E6','G6','C7'],0.1,0.09,0.06);
  /* assistant pops in, the click on SI, the download window opens straight away */
  X.osc(EV.asst.in,0.25,300,0.5,0.06,{sweep:900});X.osc(EV.asst.in+0.05,0.2,600,0.25,0.04,{sweep:1200});
  click(EV.asst.click);arp(EV.asst.click+0.05,['C6','E6','G6'],0.05,0.06,0.07,0.25);
  [0,0.2].forEach(o=>X.osc(EV.asst.out+o,0.14,250,0.5,0.05,{sweep:700}));
  whoosh(EV.dl.open);for(let t=EV.dl.open+0.4;t<EV.dl.freeze;t+=0.4)X.noise(t,0.01,0.025,{hp:5000,decay:0.004});
  /* the sofa breaks in, its popup dings */
  X.osc(EV.sofa.rise,0.35,90,'tri',0.25,{sweep:50});X.noise(EV.sofa.rise,0.3,0.12,{lp:400,decay:0.12});
  X.osc(EV.sofa.up+0.05,0.35,420,0.5,0.06,{sweep:110});X.osc(EV.sofa.up+0.17,0.2,300,0.25,0.05,{sweep:90});
  ding(EV.pop1[0]);click(EV.pop1[1]-0.12);
  /* the bin pops up, the monkey runs in and shoves the sofa across the desk */
  X.osc(P.bin,0.12,600,0.25,0.05,{sweep:1200});
  for(let k=0,t=P.walk[0];t<P.walk[1];t+=0.1,k++)X.osc(t,0.04,k%2?1568:1318,0.25,0.03);
  for(let t=P.push[0];t<P.push[1];t+=0.2){X.noise(t,0.15,0.09,{lp:500,decay:0.06});X.osc(t,0.08,140,'tri',0.12,{sweep:110});}
  /* the lid flips open, the vortex sucks the sofa in, the crown goes last, the lid slams: gulp */
  X.osc(P.lid,0.08,700,0.25,0.05,{sweep:1400});X.noise(P.lid,0.05,0.08,{hp:2500,decay:0.02});
  X.noise(P.suck[0]-0.15,P.suck[1]-P.suck[0]+0.3,0.1,{hp:600,lp:3000,decay:0.4});X.osc(P.suck[0],P.suck[1]-P.suck[0],900,0.5,0.06,{sweep:120});
  for(let k=0;k<6;k++)X.osc(P.suck[0]+k*0.13,0.1,600-k*60,0.25,0.03,{sweep:200});
  X.osc(P.crown[0],P.crown[1]-P.crown[0],1600,0.25,0.04,{sweep:300});
  X.osc(P.slam,0.18,160,'sine',0.3,{sweep:60,decay:0.06});X.noise(P.slam,0.12,0.16,{lp:900,decay:0.04});X.osc(P.slam+0.12,0.22,240,0.5,0.06,{sweep:110});
  for(let k=0;k<3;k++)X.osc(P.wob[0]+0.1+k*0.13,0.1,500-k*80,0.5,0.04,{sweep:250});
  /* the bin spits out the paper, the notepad flashes open and closes */
  X.osc(S.pop,0.2,400,0.25,0.06,{sweep:1600});whoosh(S.full[0]-0.05);arp(S.full[0],['E7','G7','B7','E8'],0.04,0.05,0.04,0.25);
  X.osc(S.full[1],0.12,1600,0.25,0.04,{sweep:400});
  for(let t=EV.dl.resume+0.15;t<EV.dl.done;t+=0.15)X.noise(t,0.01,0.03,{hp:5000,decay:0.004});
  /* download complete: fanfare */
  arp(EV.dl.done,['C6','E6','G6','C7','E7'],0.06,0.1,0.08);X.noise(EV.dl.done,1.2,0.06,{hp:900,lp:4000,decay:0.4});
  /* the app opens, the duo lands on stage, the crowd roars */
  whoosh(EV.open);X.osc(EV.open,0.3,300,0.5,0.03,{sweep:1200});
  const land=EV.stage-STAGE0+4.8;X.osc(land,0.3,140,'sine',0.3,{sweep:40,decay:0.1});X.noise(land,0.25,0.16,{lp:400,decay:0.1});
  X.noise(land,2.2,0.07,{hp:700,lp:3200,decay:0.9});X.noise(land+0.1,1.6,0.05,{hp:2500,lp:6000,decay:0.6});
  /* the info lines drop in one by one, then the share dialog and its click */
  INFO.forEach((_,k)=>bl(EV.info+0.15+k*0.2,['C7','D7','E7','G7','A7','C8'][k],0.04,0.035,0.25));
  ding(EV.share,0.8);click(EV.shareClick);arp(EV.shareClick+0.05,['G6','C7','E7'],0.05,0.06,0.06,0.25);
  /* CRT off */
  X.osc(EV.off,0.35,1400,0.5,0.04,{sweep:60});X.noise(EV.off,0.3,0.06,{lp:800,decay:0.1});
}
