/* ---- what the game shows: the next gig and, when the admin linked one, the venue's own photos and texts ----
   window.__GAME_DATA (read from the database when the page opens, or the snapshot taken at build time) =
     {events:[site_events rows], venues:[game_venues rows], songs:[{song_title,artist}], photos:[url], settings:'{video settings json}',
      evento:id|null (?evento= in the address), scheda:id|null (?scheda=, admin preview of a profile), today:'YYYY-MM-DD'|null}
   The game only reads CFG. Without a profile linked to the date the game is the neutral one: the 2Deep poster, generic
   helpers and four songs of the repertoire as the secrets. Without any future date it still works, with no date on it. */
FONT['%']=['##..#','##.#.','...#.','..#..','.#...','.#.##','#..##'];
const CFG=(function(){
  const D=window.__GAME_DATA||{},WD=['DOMENICA','LUNEDI\'','MARTEDI\'','MERCOLEDI\'','GIOVEDI\'','VENERDI\'','SABATO'],WD3=['DOM','LUN','MAR','MER','GIO','VEN','SAB'],
    MO=['GENNAIO','FEBBRAIO','MARZO','APRILE','MAGGIO','GIUGNO','LUGLIO','AGOSTO','SETTEMBRE','OTTOBRE','NOVEMBRE','DICEMBRE'],SKIP=/annull|rinviat|cancellat|saltat/i;
  /* text for the pixel font: capitals, accents as apostrophes (E'), nothing the font cannot draw */
  const ACC={'À':"A'",'Á':"A'",'È':"E'",'É':"E'",'Ì':"I'",'Í':"I'",'Ò':"O'",'Ó':"O'",'Ù':"U'",'Ú':"U'"};
  const px=s=>String(s||'').toUpperCase().replace(/[ÀÁÈÉÌÍÒÓÙÚ]/g,c=>ACC[c]).replace(/[’‘`´]/g,"'").normalize('NFD').replace(/[̀-ͯ]/g,'')
    .split('').map(c=>c==='"'||c==='«'||c==='»'||c==='“'||c==='”'?'':(FONT[c]?c:' ')).join('').replace(/\s+/g,' ').trim();
  const fits=(s,w,sc)=>tw(s)*(sc||1)<=w;
  const pad=n=>String(n).padStart(2,'0');
  const local=()=>{const d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());};
  const today=D.today||local();
  let set={ev:{}};try{set=JSON.parse(D.settings||'{}')||set;}catch(e){}
  const events=(D.events||[]).filter(e=>e&&e.event_date);
  /* which date: the one in the address, otherwise the next published one that is not cancelled */
  let ev=D.evento?events.find(e=>String(e.id)===String(D.evento)):null;
  if(!ev)ev=events.filter(e=>e.is_published!==false&&e.event_date>=today&&!SKIP.test(e.description||''))
    .sort((a,b)=>a.event_date<b.event_date?-1:a.event_date>b.event_date?1:String(a.event_time||'').localeCompare(String(b.event_time||'')))[0]||null;
  const venues=D.venues||[];
  let V=D.scheda?venues.find(v=>String(v.id)===String(D.scheda)):null;
  if(!V&&ev&&ev.game_venue_id)V=venues.find(v=>String(v.id)===String(ev.game_venue_id))||null;
  /* "IL CANTONET" -> "DEL CANTONET": the article decides the preposition */
  const delOf=s=>{const m=/^(IL|LO|LA|I|GLI|LE)\s+(.+)$/.exec(s),a=/^L'\s*(.+)$/.exec(s);
    if(m)return({IL:'DEL',LO:'DELLO',LA:'DELLA',I:'DEI',GLI:'DEGLI',LE:'DELLE'})[m[1]]+' '+m[2];if(a)return "DELL'"+a[1];return 'DI '+s;};
  const short=V?px(V.short_name):'';
  const title=short&&fits('LIBERA '+short,150)?'LIBERA '+short:'LIBERA LA SERATA';
  /* ---- the gig ---- */
  let gig=null;
  if(ev){const [y,m,d]=ev.event_date.split('-').map(Number),dt0=new Date(y,m-1,d),wd=dt0.getDay(),lv=(set.ev&&set.ev[ev.id]&&set.ev[ev.id].lv)||{};
    const hm=ev.event_time?String(ev.event_time).slice(0,5):'',hh=hm?+hm.slice(0,2):-1;
    let venue=px(ev.venue),place=px(String(ev.city||'').replace(/\s*\(.*?\)\s*/g,' '));
    if(!fits(venue,240,2)&&lv.venue)venue=px(lv.venue);if(!fits(place,240,2)&&lv.place)place=px(lv.place);
    const tbc=/confermar/i.test(ev.description||'');
    const [ty,tm,td]=today.split('-').map(Number),days=Math.round((dt0-new Date(ty,tm-1,td))/864e5);
    const evening=hh<0||hh>=18;
    const when=days<0?'IL '+d+' '+MO[m-1]:days===0?(evening?'STASERA':'OGGI'):days===1?'DOMANI'+(evening&&hh>=0?' SERA':''):days<7?WD[wd]+(evening&&hh>=0?' SERA':''):'IL '+d+' '+MO[m-1];
    const ds=y+pad(m)+pad(d),nx=new Date(y,m-1,d+1),de=nx.getFullYear()+pad(nx.getMonth()+1)+pad(nx.getDate());
    const dates=hm?ds+'T'+hm.replace(':','')+'00/'+(hh+3<24?ds+'T'+pad(hh+3)+hm.slice(3)+'00':ds+'T235900'):ds+'/'+de;
    const full=(ev.venue||'').trim()+', '+String(ev.city||'').trim();
    gig={id:ev.id,venue,place,date:WD3[wd]+' '+d+' '+MO[m-1].slice(0,3),time:tbc?'DATA DA CONFERMARE':hm?'ORE '+hm:'',when,
      cal:'https://calendar.google.com/calendar/render?'+new URLSearchParams({action:'TEMPLATE',text:'2Deep live · '+(ev.venue||'').trim(),dates,ctz:'Europe/Rome',location:full,details:'Musica dal vivo con Katia e Lorenzo.\nhttps://www.2deep.it'})};}
  /* ---- colours of the poster ---- */
  const hex=(s,def)=>/^#[0-9a-f]{6}$/i.test(s||'')?s:def,dark=(h,k)=>'#'+[1,3,5].map(i=>pad(Math.round(parseInt(h.slice(i,i+2),16)*k).toString(16))).join('');
  const col=(V&&V.colors)||{},neonC=hex(col.neon,'#ff4a5a'),counter=hex(col.counter,'#9a5a35'),gold=hex(col.date,'#c9ad62');
  const pal={neon:neonC,neonHalo:dark(neonC,0.35),neonHi:'#ffe6e6',counter,bord:dark(counter,0.72),grain:dark(counter,0.79),grainHi:dark(counter,1.14),gold};
  /* ---- helpers you catch out at sea: three products, each with its power, and the mystery box ---- */
  const FXS=['freeze','life','slow'],FXT={freeze:'NEMICI CONGELATI',life:"UNA VITA IN PIU'",slow:'NEMICI LENTI PER 8 SECONDI'};
  const NEUTRAL=[{icon:'cocktail',label:'DRINK'},{icon:'cuore',label:'CUORE'},{icon:'nota',label:'NOTA'}];
  const prods=V&&Array.isArray(V.items)?V.items.filter(x=>x&&(x.name||x.title)).slice(0,3):[];
  const ICONS=['cocktail','birra','vino','caffe','brioche','crescia','pizza'];
  const items=FXS.map((fx,i)=>{const p=prods[i];
    if(!p)return{icon:NEUTRAL[i].icon,label:NEUTRAL[i].label,fx,txt:(i===0?'UN DRINK':i===1?'UN CUORE':'UNA NOTA')+': '+FXT[fx]};
    const label=px(p.name||p.title),t1=px(p.title)+': '+FXT[fx];
    return{icon:ICONS.includes(p.icon)?p.icon:'cocktail',cut:p.cut||null,label,fx,txt:fits(t1,250)?t1:label+': '+FXT[fx]};});
  const M=V&&V.mystery&&(V.mystery.name||V.mystery.title)?V.mystery:null;
  const mName=M?px(M.name||M.title):'';
  const mystery=M?{pop:mName+'!',txt:fits(mName+'! '+px(M.invite),250)?mName+'! '+px(M.invite):mName+'! UN AIUTO A SORPRESA'}:{pop:'SORPRESA!',txt:'SORPRESA! UN AIUTO A CASO'};
  /* ---- the four secrets: polaroids in the poster and the cards at the end ---- */
  const songs=(D.songs||[]).map(s=>({t:String(s.song_title||'').trim(),a:String(s.artist||'').trim()})).filter(s=>s.t&&fits('IN REPERTORIO: '+px(s.t),250));
  for(let i=songs.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[songs[i],songs[j]]=[songs[j],songs[i]];}
  const photos=(D.photos||[]).filter(Boolean);
  const secrets=[];
  prods.forEach(p=>{const label=px(p.name||p.title),t=px(p.title||p.name);
    secrets.push({img:p.photo||null,icon:ICONS.includes(p.icon)?p.icon:'cocktail',label:fits(label,48)?label:label.split(' ')[0].slice(0,8),
      cap:fits('HAI SCOPERTO: '+t,250)?'HAI SCOPERTO: '+t:'HAI SCOPERTO: '+label,title:p.title||p.name,hand:p.title||p.name,labelHand:p.name||'',text:p.text||''});});
  let si=0;const songSecret=()=>{const s=songs[si++%Math.max(1,songs.length)];if(!s)return null;
    return{song:true,label:'BRANO',cap:'IN REPERTORIO: '+px(s.t),title:s.t,hand:'♪ '+s.t,labelHand:'♪ un nostro brano',img:photos.length?photos[(si-1)%photos.length]:null,
      text:'È uno dei brani del nostro repertorio'+(s.a?', l\'originale è di '+s.a:'')+'. Vieni a sentirlo dal vivo.'};};
  while(secrets.length<3){const s=songSecret();if(!s)break;secrets.push(s);}
  if(M)secrets.push({img:M.photo||null,q:true,label:fits(mName,48)?mName:mName.slice(0,8),cap:'HAI SCOPERTO: '+(fits('HAI SCOPERTO: '+px(M.title),250)?px(M.title):mName),title:M.title||M.name,hand:M.title||M.name,labelHand:M.name||'',text:M.text||''});
  else{const s=songSecret();if(s)secrets.push(s);}
  /* the chalkboard on the counter */
  const board=M?[fits(px(M.title),180)?px(M.title):mName,fits(px(M.invite),180)?px(M.invite):'']:['2DEEP · MUSICA DAL VIVO','SEGUICI: @2DEEPLIVEMUSIC'];
  const venueSet=!!V,ofH=venueSet?delOf(String(V.short_name||'').toUpperCase().trim()):'DEI 2DEEP',mNameH=M?String(M.name||M.title).toUpperCase().trim():'';
  return{px,fits,gig,title,win:title==='LIBERA LA SERATA'?'HAI LIBERATO LA SERATA!':'HAI LIBERATO '+short+'!',pal,
    tagline:V&&V.tagline?px(V.tagline):'MUSICA DAL VIVO',board,items,mystery,secrets,venueSet,
    galleryTitle:venueSet?'I SEGRETI '+ofH:'I BRANI SEGRETI DEI 2DEEP',
    prizeSub:venueSet?'I '+secrets.length+' SEGRETI '+ofH+(M?', '+mNameH+' COMPRESO':''):secrets.length+' BRANI SEGRETI DEI 2DEEP',
    endAsk:M?board[0]:(gig?gig.venue+' · '+gig.place:'NUOVE DATE IN ARRIVO')};
})();
