/* ══════════════════════════════════════════════
   MAIN — boot sequence, start screen, shortcuts,
          auto-save
══════════════════════════════════════════════ */

// ══════════════════════════════════════════════
// BOOT
// ══════════════════════════════════════════════
initTheme();
loadRegistry();
loadAdminData();
if(registry.length===0){seedTestData();seedAdminFromRegistry();}
restoreDraftsOnBoot();
['r','m','s'].forEach(buildForm);
buildEwidencjaTab();
const today=new Date().toISOString().split('T')[0];
const bootDrafts=getDrafts();
['r','m','s'].forEach(p=>{const d=document.getElementById(`${p}-data`);if(d&&!formHasContent(bootDrafts[p])) d.value=today;recalc(p);refreshSpecContext(p);});
draftDirty=Object.values(bootDrafts).some(formHasContent);
updateDraftStartButton();
updateRoleBadge();

// ── UI OVERRIDES — safe visual layer loaded after base CSS ──
(function(){
  if(!document.getElementById('theme-overrides-css')){
    var link=document.createElement('link');
    link.id='theme-overrides-css';
    link.rel='stylesheet';
    link.href='css/theme-overrides.css';
    document.head.appendChild(link);
  }
  if(!document.getElementById('score-sidebar-css')){
    var link2=document.createElement('link');
    link2.id='score-sidebar-css';
    link2.rel='stylesheet';
    link2.href='css/score-sidebar.css';
    document.head.appendChild(link2);
  }
  if(!document.getElementById('hybrid-css')){
    var link3=document.createElement('link');
    link3.id='hybrid-css';
    link3.rel='stylesheet';
    link3.href='css/hybrid-mode.css';
    document.head.appendChild(link3);
  }
  if(!document.getElementById('forms-saas-css')){
    var link4=document.createElement('link');
    link4.id='forms-saas-css';
    link4.rel='stylesheet';
    link4.href='css/forms-saas.css';
    document.head.appendChild(link4);
  }
  if(!document.getElementById('dark-premium-css')){
    var link5=document.createElement('link');
    link5.id='dark-premium-css';
    link5.rel='stylesheet';
    link5.href='css/dark-premium.css';
    document.head.appendChild(link5);
  }
})();

function enterApp(tab){
  var start=document.getElementById('start-screen');
  if(tab){
    var item=document.getElementById('sbi-'+tab);
    if(item) switchTab(tab,item);
  }
  if(start) start.classList.add('is-hidden');
}

// ── KEYBOARD SHORTCUTS — Ctrl+S saves all visible form drafts ──
document.addEventListener('keydown',function(e){
  if((e.ctrlKey||e.metaKey)&&e.key==='s'){
    e.preventDefault();
    ['r','m','s'].forEach(function(p){
      var panel=document.getElementById('tab-'+{r:'rozmowy',m:'maile',s:'systemy'}[p]);
      if(panel&&panel.classList.contains('on')) saveDraft(p);
    });
  }
});

// ── AUTO-SAVE every 30 s ──
setInterval(function(){
  ['r','m','s'].forEach(function(p){
    var panel=document.getElementById('tab-'+{r:'rozmowy',m:'maile',s:'systemy'}[p]);
    if(panel&&panel.classList.contains('on')) saveDraft(p);
  });
},30000);

// ── LOGIN MODULE ──
import('./auth-module.js').then(function(mod){
  if(mod && mod.authInit) mod.authInit();
}).catch(function(err){
  console.error('Błąd modułu logowania', err);
});

// ── HYBRID MODE ──
import('./hybrid-mode.js').then(function(mod){
  if(mod && mod.initHybrid) mod.initHybrid();
}).catch(function(err){
  console.error('Błąd hybrid mode', err);
});

// ── LAYOUT FIX ──
import('./layout-adjustments.js').then(function(mod){
  if(mod && mod.initLayoutAdjustments) mod.initLayoutAdjustments();
}).catch(function(err){
  console.error('Błąd layout', err);
});
