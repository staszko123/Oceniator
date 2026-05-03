/* ══════════════════════════════════════════════
   DATA STORE
   Jedna warstwa dostępu do danych aplikacji.
   Obecnie działa synchronicznie na localStorage.
   Struktura jest przygotowana pod dalsze podpięcie Supabase.
══════════════════════════════════════════════ */

var DataStore = (function(){
  var keys = {
    registry: 'pep_registry_v5',
    admin: 'pep_admin_v1',
    drafts: 'pep_form_drafts_v1',
    theme: 'pep_theme',
    goal: 'pep_goal'
  };

  function cfg(){
    return window.OCENIATOR_SUPABASE || {url:'',anonKey:'',enabled:false};
  }

  function remoteEnabled(){
    var c = cfg();
    return !!(c.enabled && c.url && c.anonKey && window.supabase);
  }

  function readJson(key, fallback){
    try{
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    }catch(e){
      return fallback;
    }
  }

  function writeJson(key, value){
    try{
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    }catch(e){
      return false;
    }
  }

  return {
    keys: keys,
    isRemote: remoteEnabled,

    loadRegistry: function(){
      return readJson(keys.registry, []);
    },

    saveRegistry: function(data){
      return writeJson(keys.registry, data || []);
    },

    loadAdmin: function(fallback){
      return readJson(keys.admin, fallback || null);
    },

    saveAdmin: function(data){
      return writeJson(keys.admin, data || {});
    },

    loadDrafts: function(){
      return readJson(keys.drafts, {});
    },

    saveDrafts: function(data){
      return writeJson(keys.drafts, data || {});
    },

    getTheme: function(){
      return localStorage.getItem(keys.theme) || 'light';
    },

    setTheme: function(value){
      localStorage.setItem(keys.theme, value || 'light');
    },

    getGoal: function(){
      var value = localStorage.getItem(keys.goal);
      return value && !isNaN(value) ? parseInt(value, 10) : null;
    },

    setGoal: function(value){
      localStorage.setItem(keys.goal, String(value));
    }
  };
})();
