/* ---------------- SABATO_SERA.EXE soundtrack: modem, start-up chime, 8-bit ska at 150 BPM (bar 1.6 s, 18 bars), silence on the blue screen ---------------- */
function defaultSong(){
  const ev=[],E=0.2,BAR=1.6,gap=t=>MUSIC_GAPS.some(([a,b])=>t>=a-0.01&&t<b),push=(t,d,n,i,v=127)=>{if(gap(t))return;ev.push({t,d,m:typeof n==='number'?n:NN(n),v,i});};
  const CH={C:['C4','E4','G4'],Am:['A3','C4','E4'],F:['A3','C4','F4'],G:['G3','B3','D4'],E:['G#3','B3','E4']};
  const BS={C:['C3','G2','C3','E3'],Am:['A2','E2','A2','C3'],F:['F2','C3','F2','A2'],G:['G2','D3','G2','B2'],E:['E2','B2','E2','G#2']};
  /* chords per half bar. 0-1 modem and chime, 2-3 assistant, 4 download, 5b-7a the sofa, 7b-8 Katia, 9 the nudge and the blue screen,
     10 the sofa falls and the download completes, 11 cards, 12-13 the band arrives, 14-16 card and call, 17 ending */
  const PROG={2:['C','C'],3:['F','G'],4:['C','C'],5:['F','Am'],6:['Am','F'],7:['Am','F'],8:['F','G'],9:['E','E'],
    10:['G','G'],11:['C','G'],12:['Am','F'],13:['C','G'],14:['F','G'],15:['C','G'],16:['F','G']};
  const R1=[['A4',1],['C5',1],['E5',1],['A5',1],['F5',1],['A5',1],['C6',1],['A5',1]];
  const MEL={2:[['E5',1],['G5',1],['C6',2],['B5',1],['G5',1],['E5',2]],3:[['F5',1],['A5',1],['C6',2],['D6',1],['B5',1],['G5',2]],
    4:[['C6',1],['B5',1],['G5',2],['E5',1],['G5',1],['C6',2]],6:R1,7:[['A4',1],['C5',1],['E5',1],['A5',1],['A5',1],['C6',1],['F6',2]],
    8:[['A5',1],['C6',1],['F6',2],['G6',2],['D6',2]],9:[['E5',1],['G#5',1],['B5',1],['E6',1],['B5',1],['G#5',1],['E5',1],['B4',1]],
    11:[['C6',1],['E6',1],['G6',2],['E6',1],['C6',1],['D6',2]],12:[['C6',1],['A5',1],['C6',2],['F6',2],['E6',2]],13:[['G5',1],['C6',1],['E6',2],['D6',1],['C6',1],['B5',2]],
    14:[['A5',2],['C6',2],['D6',2],['B5',2]],15:[['E6',1],['G6',1],['C7',2],['G6',2],['E6',2]],16:[['A5',1],['C6',1],['F6',2],['G6',2],['B6',2]]};
  const DRIVE=[6,9];
  Object.keys(PROG).map(Number).forEach(b=>{const t0=b*BAR,light=b===10;
    for(let h=0;h<2;h++){const c=PROG[b][h],th=t0+h*0.8;
      if(DRIVE.includes(b))for(let i=0;i<4;i++)push(th+i*E,0.17,BS[c][i%2?1:0],'bass');else BS[c].slice(h*2,h*2+2).forEach((n,i)=>push(th+i*0.4,0.34,n,'bass'));
      for(let i=0;i<2;i++)CH[c].forEach(n=>push(th+i*0.4+E,0.075,n,'skank'));}
    for(let i=0;i<8;i++)push(t0+i*E,0.03,42,'drums',i%2?110:80);
    [0,2].forEach(k=>push(t0+k*0.4,0.1,36,'drums'));if(!light)[1,3].forEach(k=>push(t0+k*0.4,0.1,38,'drums'));
    if(MEL[b]){let tt=t0;MEL[b].forEach(([n,d])=>{push(tt,d*E,n,DRIVE.includes(b)?'sq':'lead');tt+=d*E;});}});
  /* start-up chime when the desktop appears, then the hi-hat counts in */
  ['C5','E5','G5','B5','D6','G6'].forEach((n,i)=>push(EV.desk+i*0.08,0.8-i*0.06,n,'lead',100));
  ['C4','E4','G4','B4'].forEach(n=>push(EV.desk,0.8,n,'p125',70));push(EV.desk,0.8,'C2','bass',110);push(EV.desk,0.6,49,'drums',60);
  for(let i=0;i<4;i++)push(2.4+i*E,0.03,42,'drums',70+i*10);
  /* crashes on the big moments */
  [EV.sofa.rise,EV.dl.done,EV.card].forEach(t=>push(t,0.6,49,'drums',95));
  /* bar 9: snare roll into the blue screen */
  for(let k=0;k<8;k++)push(EV.trillo+0.8+k*0.1,0.05,38,'drums',60+k*8);
  /* tom fill into the download completing */
  [47,45,43,41].forEach((m,k)=>push(EV.dl.done-0.4+k*0.1,0.08,m,'drums'));
  /* bar 17: ending chord and a little tag before the screen switches off */
  const T=17*BAR;push(T,0.6,49,'drums');push(T,0.1,36,'drums');['C4','E4','G4','C5'].forEach(n=>push(T,0.7,n,'sq',90));push(T,1.0,'C2','bass');
  [['C6',0.35,0.4],['G5',0.15,0.2],['C6',0.9,0]].reduce((tt,[n,d,step])=>{push(tt,d,n,'lead');return tt+step;},T);
  push(T+0.8,0.1,36,'drums');push(T+0.8,0.1,38,'drums');
  return ev;
}
function scheduleSfx(X){
  const sn=(t,d,f,v,o={})=>X.osc(t,d,f,'sine',v,o),bl=(t,n,d,v,duty=0.5,dec=0)=>X.osc(t,d,mtof(NN(n)),duty,v,dec?{decay:dec}:{});
  const arp=(t,ns,st,d,v,duty=0.5)=>ns.forEach((n,i)=>bl(t+i*st,n,d,v,duty));
  const click=t=>{X.noise(t,0.02,0.16,{hp:3000,decay:0.006});X.noise(t+0.11,0.02,0.1,{hp:3500,decay:0.005});};
  const whoosh=t=>X.noise(t,0.25,0.06,{hp:1500,decay:0.1});
  const ding=(t,v=1,up=0)=>{[1046.5,1318.5,1568].forEach(f=>sn(t,0.3,f*Math.pow(2,up/12),0.05*v,{decay:0.12}));X.osc(t,0.2,523.25*Math.pow(2,up/12),'tri',0.05*v,{decay:0.08});};
  /* CRT on */
  X.noise(0,0.15,0.14,{lp:300,decay:0.06});sn(0.02,0.4,7800,0.015,{decay:0.12});
  /* modem: dial tone, digits, answer tone, handshake screech, connected */
  sn(EV.dial[0],0.3,350,0.12);sn(EV.dial[0],0.3,440,0.12);
  const LOW=[697,770,852,941],HIGH=[1209,1336,1477];[[0,1],[2,0],[1,2],[3,1],[0,0],[2,2],[1,1]].forEach(([a,b],i)=>{const t=0.5+i*0.065;sn(t,0.05,LOW[a],0.11);sn(t,0.05,HIGH[b],0.09);});
  sn(EV.hand[0],0.25,2100,0.1);
  for(let k=0;k<14;k++)sn(1.25+k*0.02,0.02,k%2?980:1180,0.09);
  X.noise(1.35,0.5,0.13,{hp:1600,lp:5200});X.osc(1.42,0.35,1800,0.5,0.05,{sweep:700});
  for(let k=0;k<8;k++)X.osc(1.5+k*0.04,0.03,k%2?2400:1650,0.25,0.06);
  arp(EV.conn,['C6','E6','G6','C7'],0.1,0.09,0.06);
  /* assistant pops in, the click on SI, the monkey hops away */
  X.osc(EV.asst.in,0.25,300,0.5,0.06,{sweep:900});X.osc(EV.asst.in+0.05,0.2,600,0.25,0.04,{sweep:1200});
  click(EV.asst.click);arp(EV.asst.click+0.05,['C6','E6','G6'],0.05,0.06,0.07,0.25);
  [0,0.2].forEach(o=>X.osc(EV.asst.out+o,0.14,250,0.5,0.05,{sweep:700}));
  /* download: window opens, ticks while it fills */
  whoosh(EV.dl.open);for(let t=EV.dl.open+0.4;t<EV.dl.freeze;t+=0.4)X.noise(t,0.01,0.025,{hp:5000,decay:0.004});
  /* the sofa breaks in, its popup dings */
  X.osc(EV.sofa.rise,0.35,90,'tri',0.25,{sweep:50});X.noise(EV.sofa.rise,0.3,0.12,{lp:400,decay:0.12});
  X.osc(EV.sofa.up+0.05,0.35,420,0.5,0.06,{sweep:110});X.osc(EV.sofa.up+0.17,0.2,300,0.25,0.05,{sweep:90});
  ding(EV.pop1[0]);
  /* Katia's message, then the nudge rattles until the crash */
  arp(EV.chat,['E6','B6'],0.08,0.06,0.06);click(EV.trillo-0.02);
  for(let t=EV.trillo;t<EV.bsod[0]-0.02;t+=0.08){X.noise(t,0.06,0.09,{lp:350,decay:0.03});X.osc(t,0.05,62,0.5,0.06);}
  X.osc(EV.trillo,0.3,500,0.25,0.06,{sweep:1500});
  /* blue screen: one PC-speaker beep in the silence */
  X.osc(EV.bsod[0]+0.05,0.14,880,0.5,0.045);
  /* the dizzy sofa drops off the screen (slide whistle down), the download picks up again */
  for(let k=0;k<3;k++)bl(EV.bsod[1]+0.05+k*0.12,['E7','C7','A6'][k],0.05,0.04,0.25);
  X.osc(EV.sofa.fall,0.6,1100,'sine',0.08,{sweep:140});X.noise(EV.sofa.fall+0.55,0.2,0.12,{lp:300,decay:0.08});
  for(let t=EV.dl.resume+0.2;t<EV.dl.done;t+=0.2)X.noise(t,0.01,0.03,{hp:5000,decay:0.004});
  /* download complete: fanfare */
  arp(EV.dl.done,['C6','E6','G6','C7','E7'],0.06,0.1,0.08);X.noise(EV.dl.done,1.2,0.06,{hp:900,lp:4000,decay:0.4});
  /* cards: a launch blip and a knock on every bounce */
  cardPaths().forEach((c,i)=>{bl(c.pts[0][0],['C7','E7','G7','A7'][i%4],0.04,0.03,0.25);c.bounces.forEach((t,j)=>{if(t>EV.player.open+0.3)return;X.osc(t,0.06,[392,440,494,523,587,659,698,784][i]*(1+j*0.06),'tri',0.12,{decay:0.03});X.noise(t,0.02,0.05,{lp:1200,decay:0.01});});});
  /* the file opens full screen, the card comes up, then the call to find the word */
  whoosh(EV.player.open);X.osc(EV.player.open,0.4,300,0.5,0.03,{sweep:1200});
  arp(EV.card,['G6','C7'],0.08,0.06,0.07);arp(EV.cta,['C7','E7','G7','C8'],0.06,0.06,0.05,0.25);
  /* CRT off */
  X.osc(EV.off,0.35,1400,0.5,0.04,{sweep:60});X.noise(EV.off,0.3,0.06,{lp:800,decay:0.1});
}
