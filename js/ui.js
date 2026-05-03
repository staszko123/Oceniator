/* ══════════════════════════════════════════════
   UI — navigation, modals, toast, badge, sidebar
══════════════════════════════════════════════ */

function switchTab(name,el){
  if(name==='myteam'&&!activeLeaderScope()){showToast('Zakładka Mój Zespół jest dostępna dla liderów','warn');return;}
  if(name==='dashboard'&&!can('dashboard')){showToast('Bieżąca rola nie ma dostępu do Dashboardu','warn');return;}
  if(name==='raporty'&&!can('reports')){showToast('Bieżąca rola nie ma dostępu do Raportów','warn');return;}
  if(name==='admin'&&!can('adminConfig')){showToast('Bieżąca rola nie ma dostępu do Panelu Admina','warn');return;}
  var titles={start:'Start',rozmowy:'Ocena Rozmów',maile:'Ocena Maili',systemy:'Działania w Systemach',myteam:'Mój Zespół',dashboard:'Dashboard',ewidencja:'Ewidencja Kart',raporty:'Raporty',admin:'Panel administracyjny'};
  document.querySelectorAll('.panel').forEach(function(p){p.classList.remove('on');});
  document.querySelectorAll('.sb-item').forEach(function(b){b.classList.remove('on');});
  document.getElementById('tab-'+name).classList.add('on');
  var sbi=document.getElementById('sbi-'+name); if(sbi) sbi.classList.add('on');
  var pt=document.getElementById('page-bar-title'); if(pt) pt.textContent=titles[name]||name;
  if(name==='ewidencja') renderEw();
  if(name==='myteam') buildMyTeam();
  if(name==='dashboard') buildDashboard();
  if(name==='raporty') buildRaporty();
  if(name==='admin') buildAdmin();
}
function openModal(id){document.getElementById(id).classList.add('open');}
function closeModal(id){document.getElementById(id).classList.remove('open');}


function updateBadge(){var b=document.getElementById('ew-badge');if(b)b.textContent=scopedRegistry().filter(e=>!entryIsArchived(e)).length;}

// ══════════════════════════════════════════════
// ROLE BADGE (page-bar switcher)
// ══════════════════════════════════════════════
function updateRoleBadge(){
  var r=activeRole();
  var sw=document.getElementById('role-switcher');
  var sel=document.getElementById('role-sw-sel');
  var icon=document.getElementById('role-sw-icon');
  if(sel) sel.value=r;
  if(sw) sw.setAttribute('data-role',r);
  var icons={admin:'⚙️',leader:'👑',assessor:'✅',viewer:'👁️'};
  if(icon) icon.textContent=icons[r]||'⚙️';
  document.querySelectorAll('.leader-only').forEach(function(el){
    el.style.display=activeLeaderScope()?'flex':'none';
  });
}

function confirmReset(){
  if(!confirm('Wyczyścić wszystkie dane w formularzu? Ewidencja zostanie zachowana.')) return;
  setDrafts({});draftDirty=false;
  ['r','m','s'].forEach(p=>{state[p].count=3;initState(p);buildForm(p);});
  showToast('Formularz wyczyszczony');
}
function clearCurrentDraft(p){
  if(!confirm('Wyczyścić szkic tego formularza? Zapisane karty w ewidencji zostaną bez zmian.')) return;
  clearDraft(p);state[p].count=3;initState(p);buildForm(p);showToast('Szkic wyczyszczony','ok');
}
window.addEventListener('beforeunload',function(e){
  if(!draftDirty) return;
  e.preventDefault();
  e.returnValue='';
});

// ══════════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════════
let tt;
function showToast(msg,type=''){
  const el=document.getElementById('toast');
  el.textContent=msg;el.className='show '+(type||'');
  clearTimeout(tt);tt=setTimeout(()=>el.classList.remove('show'),3200);
}

function toggleSidebar(){
  var sb=document.getElementById('sidebar');
  var ch=document.getElementById('sb-chev');
  sb.classList.toggle('collapsed');
  var col=sb.classList.contains('collapsed');
  if(ch) ch.textContent=col?'▶':'◀';
  DataStore.setSidebarCollapsed(col);
}
(function(){
  if(DataStore.getSidebarCollapsed()){
    var sb=document.getElementById('sidebar');
    var ch=document.getElementById('sb-chev');
    if(sb){sb.classList.add('collapsed');if(ch)ch.textContent='▶';}
  }
})();

