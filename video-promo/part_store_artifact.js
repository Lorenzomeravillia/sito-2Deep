/* ---------------- artifact store: dates live in the artifact's db (config/main), so they survive reloads and Claude can update them too ---------------- */
(()=>{let dbDoc=null,lastSavedJson='';
  STORE={kind:'artifact',canAdd:true,
    async save(){
      if(!dbDoc)return{ok:true,msg:'Applicato. Sullo schermo vedi le nuove date.'};
      const body={cfg:JSON.parse(JSON.stringify(CFG)),savedAt:new Date().toISOString()};
      try{lastSavedJson=JSON.stringify(body.cfg);await dbDoc.set(body);return{ok:true,msg:'Applicato e salvato: le ritrovi alla prossima apertura.'};}
      catch(e){const c=e&&e.code;return{ok:false,msg:c==='invalid_argument'?'Applicato. Solo chi può modificare questa pagina salva le date: qui restano finché la tieni aperta.':'Applicato, ma il salvataggio non è riuscito: le date restano finché tieni aperta la pagina.'};}}};
  (async()=>{try{
    if(!window.claude||typeof window.claude.use!=='function')return;
    const db=await window.claude.use('db');if(!db)return;dbDoc=db.doc('config/main');
    dbDoc.onSnapshot(s=>{if(!s.exists)return;const d=s.data(),c=d&&d.cfg;if(!c||typeof c!=='object')return;
      const j=JSON.stringify(c);if(j===lastSavedJson)return;lastSavedJson=j;receiveCfg(c);},()=>{});
  }catch(e){}})();
})();
