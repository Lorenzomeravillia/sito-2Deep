/* Skanoid's first guess for a new MIDI: the generated ska drums from the start, the chop with the first group, the bass with
   the second, the melody with the third, the other single lines with the last. The song's own drums and the chords played on
   the beat are left out (they would fight the levare); the band can bring them back */
function autoCfg(info,name){const c=autoCfgBase(info,name),T=c.tracks;c.levare='auto';
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
/* the reading of the levare (the select under the loop settings): changing it computes the three tracks again */
const LEVSEL=document.getElementById('sLev');
function renderPanel(){renderPanelBase();if(!PINFO)return;LEVSEL.value=PCFG.levare||'auto';const a=PINFO.levareAuto;
  LEVSEL.options[0].textContent='Automatico'+(a?' ('+LEV_WHY[a.why]+')':'');}
LEVSEL.addEventListener('change',()=>{if(!PINFO||!PMIDI)return;PCFG.levare=LEVSEL.value;PINFO=analyzeMidi(parseMidi(b64d(PMIDI)),PCFG.levare);PV.key='';renderPanel();changed();
  setS('Skank e batteria ricalcolati: '+LEVSEL.selectedOptions[0].textContent.toLowerCase()+'. Ascolta e confronta.');});
/* the admin, remembered on this device: once the BRANO panel has seen an admin login here (or the address had #brano), its button
   stays on this device; when the login has lapsed, the panel asks for it again in place, without going through 2deep.it/admin.
   The login is Supabase's, kept by the browser like the admin page's (the same one: logging in here also opens the admin) */
const ADMIN_KEY='skanoid_admin_device';
function adminDevice(){try{return localStorage.getItem(ADMIN_KEY)==='1';}catch(e){return false;}}
function markDevice(){try{localStorage.setItem(ADMIN_KEY,'1');}catch(e){}}
if(location.hash==='#brano')markDevice();
function updateLogin(){const can=!!STORE.sb();$('sLogin').hidden=!can||STORE.edit;$('sWho').hidden=!STORE.edit;}
{const init0=STORE.init.bind(STORE);STORE.init=async function(){await init0();if(STORE.edit)markDevice();updateLogin();};}
SBTN.addEventListener('click',updateLogin);
$('sLoginForm').addEventListener('submit',async e=>{e.preventDefault();const sb=STORE.sb();if(!sb)return;const btn=$('sLoginBtn');btn.disabled=true;setS('Accesso…');
  try{const{error}=await sb.auth.signInWithPassword({email:$('sEmail').value.trim(),password:$('sPass').value});if(error)throw error;
    STORE.edit=true;CANEDIT=true;markDevice();$('sPass').value='';updateLogin();setS('Accesso fatto: SALVA ora vale per tutti, e su questo dispositivo il pulsante BRANO resta visibile.');}
  catch(err){setS('Accesso non riuscito: '+(err.message||err)+'.',true);}finally{btn.disabled=false;}});
