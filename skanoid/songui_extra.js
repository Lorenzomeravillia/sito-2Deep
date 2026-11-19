/* Skanoid's first guess for a new MIDI: the generated ska drums from the start, the chop with the first group, the bass with
   the second, the melody with the third, the other single lines with the last. The song's own drums and the chords played on
   the beat are left out (they would fight the levare); the band can bring them back */
function autoCfg(info,name){const c=autoCfgBase(info,name),T=c.tracks;
  info.list.forEach(g=>{const x=T[trackKey(g)];if(!x)return;
    if(g.gen==='skank'){x.label='SKANK';x.inst='skank';x.step=1;}
    else if(g.gen==='ska'){x.label='BATTERIA SKA';x.inst='drums';x.step=0;}
    else if(g.gen==='onedrop'){x.label='ONE DROP';x.inst='drums';x.step=-1;}
    else if(g.drum)x.step=-1;
    else if(isBass(g))x.step=x.step<0?-1:2;
    else if(x.inst==='lead')x.step=3;
    else if(x.step>=0)x.step=overlap(g)>=0.3?-1:4;});
  /* a short file: the loop is not longer than the song */
  const bs=barSec(info),fb=Math.floor(info.first/bs+1e-6)*bs;c.bars=Math.max(2,Math.min(c.bars,Math.floor((info.end-fb)/bs+0.1)));
  c.offset=bestOffset(info,T,c.bars);return c;}
/* the BRANO button: bottom left, where the Atmosfera button sits in the relaxing version */
function tick(){const v=songBtnVisible();if(SBTN.hidden===v)SBTN.hidden=!v;
  if(v){const r=cv.getBoundingClientRect(),w=wrap.getBoundingClientRect();SBTN.style.left=(r.left-w.left+8)+'px';SBTN.style.top=(r.bottom-w.top-SBTN.offsetHeight-8)+'px';}}
SONGUI={tick};
