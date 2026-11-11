/* ---------------- Monkey's night soundtrack (rendered by renderSoundtrack in part_audio.js): 12 bars of 8-bit ska at 150 BPM, events land on the beat ---------------- */
function defaultSong(){
  const ev=[],E=0.2,BAR=1.6,push=(t,d,n,i,v=127)=>ev.push({t,d,m:typeof n==='number'?n:NN(n),v,i});
  const CH={C:['C4','E4','G4'],Am:['A3','C4','E4'],F:['A3','C4','F4'],G:['G3','B3','D4'],E:['G#3','B3','E4']};
  const BS={C:['C3','G2','C3','E3'],Am:['A2','E2','A2','C3'],F:['F2','C3','F2','A2'],G:['G2','D3','G2','B2'],E:['E2','B2','E2','G#2']};
  /* chords per half bar: menu, team, stage, boss, ending (loops back to the menu's C) */
  const PROG=[['C','C'],['C','C'],['G','G'],['G','G'],['C','C'],['Am','Am'],['F','F'],['G','G'],['C','C'],['Am','Am'],['F','F'],
    ['Am','F'],['G','E'],['Am','F'],['G','E'],['C','C'],['F','G'],['C','C'],['F','G'],['F','G']];
  const A=[[['G4',1],['C5',1],['E5',2],['D5',1],['C5',1],['E5',2]],[['A4',1],['C5',1],['E5',2],['G5',2],['E5',2]],[['F5',2],['E5',1],['D5',1],['C5',2],['A4',2]],[['B4',1],['D5',1],['G5',2],['F5',1],['E5',1],['D5',2]]];
  const R1=[['A4',1],['C5',1],['E5',1],['A5',1],['F5',1],['A5',1],['C6',1],['A5',1]],R2=[['G5',1],['D5',1],['B4',1],['D5',1],['E5',1],['G#5',1],['B5',1],['E6',1]];
  const MEL={0:[['C5',1],['E5',1],['G5',1],['C6',2],['G5',1],['C6',2]],1:[['E5',1],['G5',1],['C6',1],['E6',2],['D6',1],['C6',2]],
    2:[['G5',1],['B5',1],['D6',2],['B5',1],['G5',1],['D6',2]],3:[['A5',1],['B5',1],['D6',2],['G6',4]],
    4:A[0],5:A[1],6:A[2],7:A[3],8:[['E5',1],['E5',1],['G5',1],['E5',1],['C6',2],['G5',2]],9:[['A5',2],['G5',1],['E5',1],['C5',2],['E5',2]],10:[['F5',2],['A5',2],['C6',2],['A5',2]],
    11:R1,12:R2,13:R1,14:R2,15:[['C5',1],['E5',1],['G5',1],['C6',1],['G5',1],['C6',3]],16:[['A5',2],['G5',1],['F5',1],['G5',2],['D5',2]],17:A[0],
    18:[['F5',2],['E5',1],['D5',1],['B4',2],['D5',2]],19:[['A5',2],['G5',2],['F5',2],['D5',2]]};
  const NBARS=20,BOSS=[11,12,13,14];
  for(let b=0;b<NBARS;b++){const t0=b*BAR,boss=BOSS.includes(b);
    for(let h=0;h<2;h++){const c=PROG[b][h],th=t0+h*0.8;
      /* bass: quarter notes, driving eighths in the boss fight */
      if(boss)for(let i=0;i<4;i++)push(th+i*E,0.17,BS[c][i%2===0?0:1],'bass');
      else BS[c].slice(h*2,h*2+2).forEach((n,i)=>push(th+i*0.4,0.34,n,'bass'));
      /* off-beat skank */
      for(let i=0;i<2;i++)CH[c].forEach(n=>push(th+i*0.4+E,0.075,n,'skank'));}
    /* drums */
    for(let i=0;i<8;i++)push(t0+i*E,0.03,42,'drums',i%2?110:80);
    if(boss)for(let i=0;i<8;i++)push(t0+i*E+0.1,0.03,42,'drums',70);
    if(b<=1)for(let k=0;k<4;k++)push(t0+k*0.4,0.1,36,'drums');
    else if(b===3){[0,2].forEach(k=>push(t0+k*0.4,0.1,36,'drums'));for(let k=0;k<8;k++)push(t0+0.8+k*0.1,0.05,38,'drums',70+k*7);}
    else{[0,2].forEach(k=>push(t0+k*0.4,0.1,36,'drums'));[1,3].forEach(k=>push(t0+k*0.4,0.1,38,'drums'));if(boss)[0.6,1.4].forEach(o=>push(t0+o,0.1,36,'drums'));}
    if(b===4||b===11||b===15)push(t0,0.6,49,'drums');
    if(b===10)[0,1,2,3].forEach(k=>push(t0+1.2+k*0.1,0.08,[47,45,43,41][k],'drums'));
    if(b===19)[0,1,2,3].forEach(k=>push(t0+1.2+k*0.1,0.05,38,'drums',90+k*10));
    if(MEL[b]){let tt=t0;MEL[b].forEach(([n,d])=>{push(tt,d*E,n,boss?'sq':'lead');tt+=d*E;});}}
  return ev;
}
function scheduleSfx(X){
  const bl=(t,n,d,v,duty=0.5,dec=0)=>X.osc(t,d,mtof(NN(n)),duty,v,dec?{decay:dec}:{});
  const arp=(t,ns,st,d,v,duty=0.5)=>ns.forEach((n,i)=>bl(t+i*st,n,d,v,duty));
  const whoosh=t=>X.noise(t,0.25,0.06,{hp:1500,decay:0.1});
  const M=EV.menu,S=EV.sel,B=EV.boss,N=EV.end;
  /* menu: coin in, cursor, confirm, the sofa gets angry */
  bl(0.0,'B5',0.06,0.09);bl(0.07,'E6',0.25,0.09,0.5,0.1);
  bl(M.move,'A5',0.03,0.07,0.25);bl(M.move+0.04,'E6',0.04,0.07,0.25);
  bl(M.press+0.16,'C7',0.3,0.08,0.5,0.1);X.noise(M.press,0.06,0.1,{hp:2500,decay:0.02});arp(M.press,['C6','E6','G6','C7'],0.045,0.07,0.11);
  X.osc(M.angry,0.35,420,0.5,0.07,{sweep:110});X.osc(M.angry+0.12,0.2,300,0.25,0.05,{sweep:90});
  whoosh(M.out);
  /* team select: card slams, ready */
  S.cards.forEach((t,i)=>{X.noise(t,0.08,0.16,{lp:600,decay:0.04});bl(t+0.02,['C6','E6','G6'][i],0.06,0.07,0.25);});
  arp(S.ready,['G5','C6','E6','G6','C7'],0.05,0.07,0.09);whoosh(S.out);
  arp(EV.stage.t0+0.05,['C6','G6'],0.1,0.08,0.08);
  /* caption stingers */
  CAPS.forEach(c=>{X.noise(c.t,0.1,0.12,{lp:500,decay:0.05});bl(c.t,'C5',0.08,0.06,0.5,0.05);bl(c.t+0.08,'G5',0.1,0.05,0.5,0.05);});
  /* note shots and conversions */
  SHOTS.forEach(sh=>X.osc(sh.t0,0.09,sh.from==='lor'?900:1200,0.25,0.035,{sweep:sh.from==='lor'?1800:2400}));
  let combo=0;FOES.forEach((f,i)=>{const t=f.th,inRush=i>=5;if(inRush)combo++;const up=inRush?combo:0;
    X.noise(t,0.05,0.12,{hp:1200,decay:0.02});
    arp(t+0.03,[['C6','E6','G6'],['D6','F#6','A6'],['E6','G#6','B6'],['F6','A6','C7'],['G6','B6','D7'],['A6','C#7','E7'],['B6','D#7','F#7']][up%7],0.04,0.05,0.07,0.25);
    bl(t+0.16,'E7',0.05,0.05);bl(t+0.21,'A7',0.12,0.04,0.5,0.06);});
  /* the remote zaps, the monkey's tail spins it back */
  FOES.forEach(f=>{if(!f.zap)return;X.noise(f.zap,0.2,0.08,{hp:3000,decay:0.08});for(let k=0;k<5;k++)X.noise(f.spin+k*0.08,0.06,0.07,{hp:800+k*300,lp:3000,decay:0.03});X.osc(f.spin,0.4,300,0.5,0.04,{sweep:1200});});
  /* alarm */
  for(let k=0;k<12;k++)bl(EV.alarm[0]+k*0.1,k%2?'E5':'A5',0.09,0.055,0.5);
  /* boss */
  X.osc(B.land,0.3,140,'sine',0.35,{sweep:40,decay:0.1});X.noise(B.land,0.25,0.18,{lp:400,decay:0.1});
  B.pillows.forEach(t=>X.osc(t,0.18,200,0.5,0.05,{sweep:500}));B.hops.forEach(t=>X.osc(t,0.15,350,0.25,0.05,{sweep:900}));
  X.osc(B.special,B.launch-B.special,160,0.5,0.045,{sweep:1400});X.osc(B.special,B.launch-B.special,240,0.25,0.03,{sweep:2100});
  for(let k=0;k<14;k++)bl(B.special+k*0.11,['C6','E6','G6','C7','E7','G7','C7','G7','E7','C7','G6','C7','E7','G7'][k],0.04,0.035,0.25);
  X.osc(B.launch,B.impact-B.launch,1600,0.5,0.06,{sweep:400});X.noise(B.launch,0.3,0.08,{hp:2000,decay:0.12});
  X.noise(B.impact,0.8,0.28,{hp:300,decay:0.25});X.osc(B.impact,0.6,120,'sine',0.38,{sweep:30,decay:0.18});X.noise(B.impact,1.1,0.1,{hp:3000,decay:0.35});
  arp(B.ko,['C6','E6','G6','C7'],0.05,0.07,0.09);bl(B.crownLand,'E7',0.05,0.06);bl(B.crownLand+0.05,'B7',0.2,0.05,0.5,0.08);
  [0,0.2].forEach(o=>X.osc(B.legs+o,0.14,250,0.5,0.05,{sweep:700}));
  /* arrival */
  whoosh(N.t0-0.05);X.osc(N.t0,0.8,300,0.5,0.03,{sweep:120});[0,0.1,0.2].forEach(o=>X.noise(N.neon+o,0.05,0.04,{lp:400,decay:0.02}));
  arp(N.clear[0],['C6','E6','G6','C7','E7','G7'],0.06,0.08,0.09);X.noise(N.clear[0],1.6,0.08,{hp:900,lp:4000,decay:0.6});
  LINE.forEach((m,k)=>{const tin=lineTiming(k).tin;bl(tin,['C7','D7','E7','G7','A7','C7','D7','E7','G7'][k%9],0.04,0.035,0.25);});
  arp(N.card,['G6','C7'],0.08,0.06,0.07);whoosh(N.fade);
}
