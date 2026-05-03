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
    goal: 'pep_goal',
    savedAssessor: 'pep_saved_oce',
    sidebarCollapsed: 'pep_sb_collapsed'
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

  function getValue(key, fallback){
    try{
      var value = localStorage.getItem(key);
      return value == null ? fallback : value;
    }catch(e){
      return fallback;
    }
  }

  function setValue(key, value){
    try{
      if(value == null) localStorage.removeItem(key);
      else localStorage.setItem(key, String(value));
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

    getValue: getValue,
    setValue: setValue,

    getTheme: function(){
      return getValue(keys.theme, 'light') || 'light';
    },

    setTheme: function(value){
      return setValue(keys.theme, value || 'light');
    },

    getGoal: function(){
      var value = getValue(keys.goal, '');
      return value && !isNaN(value) ? parseInt(value, 10) : null;
    },

    setGoal: function(value){
      return setValue(keys.goal, String(value));
    },

    getSavedAssessor: function(){
      return getValue(keys.savedAssessor, '') || '';
    },

    setSavedAssessor: function(value){
      return setValue(keys.savedAssessor, value || '');
    },

    getSidebarCollapsed: function(){
      return getValue(keys.sidebarCollapsed, '0') === '1';
    },

    setSidebarCollapsed: function(collapsed){
      return setValue(keys.sidebarCollapsed, collapsed ? '1' : '0');
    }
  };
})();
