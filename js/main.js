/* updated with premium ewidencja */

initTheme();
loadRegistry();
loadAdminData();
installDemoData(false);
if(registry.length===0){seedTestData();seedAdminFromRegistry();}
restoreDraftsOnBoot();
['r','m','s'].forEach(buildForm);
buildEwidencjaTab();

(function(){
  const add=(id,href)=>{
    if(!document.getElementById(id)){
      const l=document.createElement('link');
      l.id=id;l.rel='stylesheet';l.href=href;document.head.appendChild(l);
    }
  };
  add('theme-overrides-css','css/theme-overrides.css');
  add('score-sidebar-css','css/score-sidebar.css');
  add('hybrid-css','css/hybrid-mode.css');
  add('forms-saas-css','css/forms-saas.css');
  add('dark-premium-css','css/dark-premium.css');
  add('ew-actions-css','css/ewidencja-actions.css');
  add('ew-premium-css','css/ewidencja-premium.css');
})();

import('./ewidencja-actions.js').then(m=>m.initEwidencjaActions&&m.initEwidencjaActions());
import('./ewidencja-premium.js').then(m=>m.initEwidencjaPremium&&m.initEwidencjaPremium());
