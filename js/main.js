initTheme();
loadRegistry();
loadAdminData();
installDemoData(false);
if(registry.length===0){seedTestData();seedAdminFromRegistry();}
restoreDraftsOnBoot();
['r','m','s'].forEach(buildForm);
buildEwidencjaTab();
const today=new Date().toISOString().split('T')[0];
const bootDrafts=getDrafts();
['r','m','s'].forEach(p=>{
  const d=document.getElementById(`${p}-data`);
  if(d&&!formHasContent(bootDrafts[p])) d.value=today;
  recalc(p);
  refreshSpecContext(p);
});
draftDirty=Object.values(bootDrafts).some(formHasContent);
updateDraftStartButton();
updateRoleBadge();

(function(){
  const add=(id,href)=>{
    if(!document.getElementById(id)){
      const link=document.createElement('link');
      link.id=id;
      link.rel='stylesheet';
      link.href=href;
      document.head.appendChild(link);
    }
  };
  add('theme-overrides-css','css/theme-overrides.css');
  add('score-sidebar-css','css/score-sidebar.css');
  add('hybrid-css','css/hybrid-mode.css');
  add('forms-saas-css','css/forms-saas.css');
  add('dark-premium-css','css/dark-premium.css');
  add('ew-actions-css','css/ewidencja-actions.css');
  add('ew-premium-css','css/ewidencja-premium.css');
  add('forms-ux-css','css/forms-ux-spacing.css');
  add('spec-search-css','css/specialist-search.css');
  add('login-mobile-css','css/login-mobile.css');
})();

function enterApp(tab){switchTab(tab||'rozmowy');}

document.addEventListener('keydown',function(e){
  if((e.ctrlKey||e.metaKey)&&e.key==='s'){
    e.preventDefault();
    ['r','m','s'].forEach(function(p){
      const panel=document.getElementById('tab-'+{r:'rozmowy',m:'maile',s:'systemy'}[p]);
      if(panel&&panel.classList.contains('on')) saveDraft(p);
    });
  }
});

setInterval(function(){
  ['r','m','s'].forEach(function(p){
    const panel=document.getElementById('tab-'+{r:'rozmowy',m:'maile',s:'systemy'}[p]);
    if(panel&&panel.classList.contains('on')) saveDraft(p);
  });
},30000);

import('./auth-module.js').then(function(mod){if(mod&&mod.authInit) mod.authInit();}).catch(function(err){console.error('Błąd modułu logowania',err);});
import('./hybrid-mode.js').then(function(mod){if(mod&&mod.initHybrid) mod.initHybrid();}).catch(function(err){console.error('Błąd hybrid mode',err);});
import('./layout-adjustments.js').then(function(mod){if(mod&&mod.initLayoutAdjustments) mod.initLayoutAdjustments();}).catch(function(err){console.error('Błąd layout',err);});
import('./ewidencja-actions.js').then(function(mod){if(mod&&mod.initEwidencjaActions) mod.initEwidencjaActions();}).catch(function(err){console.error('Błąd ewidencja actions',err);});
import('./ewidencja-premium.js').then(function(mod){if(mod&&mod.initEwidencjaPremium) mod.initEwidencjaPremium();}).catch(function(err){console.error('Błąd ewidencja premium',err);});
import('./specialist-search.js').then(function(mod){if(mod&&mod.initSpecialistSearch) mod.initSpecialistSearch();});
import('./copyright.js').then(function(mod){if(mod&&mod.initCopyright) mod.initCopyright();});
