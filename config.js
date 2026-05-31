// config.js — 2 Deep
const SUPABASE_URL      = 'https://jvcvxzampxopvihahwbh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_lL3AptihbW3bQT8Ve8_cTA_CvKlQbxD';

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SUPABASE_URL, SUPABASE_ANON_KEY };
} else {
  window.SUPABASE_URL      = SUPABASE_URL;
  window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
}
