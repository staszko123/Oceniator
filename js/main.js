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

(function(){
  if(localStorage.getItem('pep_sb_collapsed')==='1'){
    var sb=document.getElementById('sidebar');
    var ch=document.getElementById('sb-chev');
    if(sb){sb.classList.add('collapsed');if(ch)ch.textContent='▶';}
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
