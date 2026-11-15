function gameSong(){const ev=[],E=0.2,BAR=1.6,push=(t,d,n,i,v=127)=>ev.push({t,d,m:typeof n==='number'?n:NN(n),v,i});
  const CH={C:['C4','E4','G4'],Am:['A3','C4','E4'],F:['A3','C4','F4'],G:['G3','B3','D4']},BS={C:['C3','G2','C3','E3'],Am:['A2','E2','A2','C3'],F:['F2','C3','F2','A2'],G:['G2','D3','G2','B2']};
  const PROG=['C','G','Am','F','C','G','F','G'];
  const MEL=[[['E5',1],['G5',1],['C6',2],['B5',1],['G5',1],['E5',2]],[['D5',1],['G5',1],['B5',1],['D6',2],['B5',1],['G5',2]],[['C5',1],['E5',1],['A5',1],['C6',2],['A5',1],['E5',2]],
    [['F5',1],['A5',1],['C6',1],['A5',1],['G5',1],['F5',1],['E5',1],['D5',1]],[['E5',1],['G5',1],['C6',2],['B5',1],['G5',1],['E5',2]],[['D5',1],['G5',1],['B5',1],['D6',2],['B5',1],['G5',2]],
    [['F5',1],['A5',1],['C6',1],['F6',2],['E6',1],['D6',1],['C6',1]],[['G5',1],['B5',1],['D6',1],['G6',1],['F6',1],['D6',1],['B5',2]]];
  PROG.forEach((c,b)=>{const t0=b*BAR;BS[c].forEach((n,i)=>push(t0+i*0.4,0.34,n,'bass'));for(let i=0;i<4;i++)CH[c].forEach(n=>push(t0+i*0.4+E,0.075,n,'skank'));
    for(let i=0;i<8;i++)push(t0+i*E,0.03,42,'drums',i%2?110:80);[0,2].forEach(k=>push(t0+k*0.4,0.1,36,'drums'));[1,3].forEach(k=>push(t0+k*0.4,0.1,38,'drums'));
    let tt=t0;MEL[b].forEach(([n,d])=>{push(tt,d*E,n,'lead',100);tt+=d*E;});});
  return ev;}
