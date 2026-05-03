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
