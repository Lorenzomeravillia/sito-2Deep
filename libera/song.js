/* ---- the music: the same song as the flipper (site_content pinball/song, set up in the BRANO panel), five layers that come in
   as the poster is uncovered. The engine (flipper/music.js), the panel (flipper/songui.js) and where the song is kept
   (flipper/store_site.js) are the flipper's; this file tells them what is different in Libera. ---- */
let MUTED=false;const LOOP=12.8,MSTEPS=[0,0.15,0.3,0.5,0.75];
const up=s=>String(s||'').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
const SONG_LAYERS={names:['Dall’inizio','Al 15% di locandina scoperta','Al 30% scoperto','Al 50% scoperto','Alla vittoria e a fine partita'],keys:['INIZIO','15%','30%','50%','FINE']};
/* how many layers play: one more at every step of the uncovered share, everything at the end */
function gameLayers(){if(G.state==='win'||G.state==='over')return LAYERDEF.length;return Math.max(1,MSTEPS.filter(s=>G.pct>=s).length);}
/* the BRANO button (admins only) shows on the start screen */
function songBtnScreen(){return G.state==='intro';}
function initAudio(){audioOn();}
/* the layers follow the game; when one comes in during play its name pops up (IL BASSO! ...) */
function songLayers(){const before=LAYERS;applyLayers();if(G.state!=='play'||before<1||LAYERS<=before)return;
  /* the newest group that has something to play (a group left empty in the panel stays silent) */
  for(let k=LAYERS-1;k>=before;k--){if(!SONG||!SONG.steps[k]||!SONG.steps[k].events.length)continue;const n=CFG.px(stepLabel(k)),t=n&&tw(n+'!')<=TW-20?n+'!':'ENTRA UN ALTRO STRUMENTO!';
    pop(t,TW/2,FY+FH/2,C.cyan,tw(t)*2<=TW-20?2:1);return;}}
