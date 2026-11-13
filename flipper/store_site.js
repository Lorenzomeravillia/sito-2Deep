/* ---------------- where the band's song is kept: the site's database (td.site_content, section pinball, key song) ----------------
   Read by everyone together with the dates, before the game starts; written by whoever is logged in to the admin panel
   (the same login as 2deep.it/admin: the session is shared by every page of the site). */
const STORE={edit:false,
  sb(){return window.__SB||null;},
  preload(){const d=window.__SITE_DATA;if(!d||!('song' in d))return undefined;if(!d.song)return null;try{return JSON.parse(d.song);}catch(e){return null;}},
  async init(){const sb=this.sb();if(!sb)return;try{const{data}=await sb.auth.getSession();this.edit=!!(data&&data.session);}catch(e){}},
  async load(){return undefined;},
  shared(){return this.edit&&!!this.sb();},
  async save(cfg){const{error}=await this.sb().from('site_content').upsert([{section:'pinball',content_key:'song',content_value:JSON.stringify(cfg),content_type:'json'}],{onConflict:'section,content_key'});if(error)throw error;},
  localNote:'Salvato solo su questo browser: per salvarlo per tutti entra prima in 2deep.it/admin con le tue credenziali, poi torna qui.'};
