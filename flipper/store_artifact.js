/* ---------------- where the band's song is kept: the claude.ai page's own database ----------------
   Everyone who can edit the page is an admin; viewers who are signed in read the song, the others hear the 2Deep loop. */
const STORE={edit:false,db:null,
  preload(){return undefined;},
  async init(){const cl=window.claude;if(!cl||typeof cl.use!=='function')return;const[db,user]=await Promise.all([cl.use('db'),cl.use('user')]);this.db=db;this.edit=!!(db&&user&&await user.canEdit());},
  async load(){if(!this.db)return undefined;const s=await this.db.doc('pinball/song').get();return s.exists?s.data():undefined;},
  shared(){return this.edit;},
  async save(cfg){await this.db.doc('pinball/song').set(cfg);},
  localNote:'Salvato solo su questo browser: da qui non posso salvarlo per tutti.'};
