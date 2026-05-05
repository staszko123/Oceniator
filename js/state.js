/* ══════════════════════════════════════════════
   STATE — app state, registry, persistence, theme, permissions
══════════════════════════════════════════════ */

// ══════════════════════════════════════════════
// UTILS
// ══════════════════════════════════════════════
function escHtml(v){
  return String(v==null?'':v).replace(/[&<>"']/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}

// ══════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════
const state={
  r:{count:3,scores:{},gold:[],ids:[],notes:{},goldDesc:''},
  m:{count:3,scores:{},gold:[],ids:[],notes:{},goldDesc:''},
  s:{count:3,scores:{},gold:[],ids:[],notes:{},goldDesc:''},
};
window.state=state;
const MAX_CONTACTS=10,MIN_CONTACTS=1;
let registry=[];
let spConfig={url:'',sheet:''};
let sortCol='data';let sortDir=-1;
let editingId=null;
let ewArchiveMode='active';

// ══════════════════════════════════════════════
// PERSISTENCE
// ══════════════════════════════════════════════
const LS_KEY='pep_registry_v5';
const DRAFT_KEY='pep_form_drafts_v1';
let draftDirty=false,lastSavedEntry=null;
var ENTRY_STATUS={
  submitted:{label:'Do weryf.',cls:'status-submitted',next:'review'},
  review:{label:'W weryf.',cls:'status-review',next:'approved'},
  approved:{label:'Zatw.',cls:'status-approved',next:'submitted'},
  archived:{label:'Archiwum',cls:'status-archived',next:'submitted'}
};
function normalizeEntry(e){
  if(!e) return e;
  if(e.archived) e.status='archived';
  if(!e.status) e.status=e.locked?'approved':'submitted';
  if(!ENTRY_STATUS[e.status]) e.status='submitted';
  e.locked=e.status==='approved';
  e.archived=e.status==='archived';
  if(!e.statusHistory) e.statusHistory=[];
  return e;
}
function normalizeRegistry(){
  registry=(registry||[]).map(normalizeEntry);
}
function entryStatus(e){return normalizeEntry(e).status;}
function entryStatusMeta(e){return ENTRY_STATUS[entryStatus(e)]||ENTRY_STATUS.submitted;}
function entryStatusLabel(e){return entryStatusMeta(e).label;}
function entryStatusClass(e){return entryStatusMeta(e).cls;}
function entryIsArchived(e){return entryStatus(e)==='archived';}
function entryIsLocked(e){return entryStatus(e)==='approved'||entryIsArchived(e);}
function setEntryStatus(e,status,reason){
  if(!e||!ENTRY_STATUS[status]) return false;
  var old=entryStatus(e);
  e.status=status;
  e.locked=status==='approved';
  e.archived=status==='archived';
  if(status==='archived'){
    e.archivedAt=e.archivedAt||new Date().toISOString();
  }else{
    delete e.archivedAt;
  }
  e.statusHistory=e.statusHistory||[];
  if(old!==status){
    e.statusHistory.unshift({from:old,to:status,ts:new Date().toISOString(),role:activeRole(),reason:reason||''});
    e.statusHistory=e.statusHistory.slice(0,30);
  }
  return old!==status;
}
function saveRegistry(){
  normalizeRegistry();
  DataStore.saveRegistry(registry);
}
function loadRegistry(){
  try{
    registry=DataStore.loadRegistry();
    normalizeRegistry();
    updateBadge();
  }catch(e){registry=[];}
}
function getDrafts(){
  return DataStore.loadDrafts();
}
function setDrafts(drafts){
  DataStore.saveDrafts(drafts);
}
function formHasContent(d){
  if(!d) return false;
  return !!(d.spec||d.stand||d.dzial||d.oce||d.gnotes||d.goldDesc||
    (d.ids||[]).some(Boolean)||(d.gold||[]).some(v=>v>0)||
    Object.values(d.notes||{}).some(arr=>(arr||[]).some(Boolean)));
}

// ══════════════════════════════════════════════
// THEME
// ══════════════════════════════════════════════
function toggleTheme(){
  const isDark=document.documentElement.getAttribute('data-theme')==='dark';
  document.documentElement.setAttribute('data-theme',isDark?'light':'dark');
  var _ic=document.getElementById('theme-icon'); if(_ic) _ic.textContent=isDark?'🌙':'☀️';
  DataStore.setTheme(isDark?'light':'dark');
  setTimeout(()=>renderCharts(),50);
}
function initTheme(){
  var saved=DataStore.getTheme();
  document.documentElement.setAttribute('data-theme',saved);
  var ic=document.getElementById('theme-icon'); if(ic) ic.textContent=saved==='dark'?'☀️':'🌙';
}

// ══════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════
function periodOf(dateStr){
  if(!dateStr) return '';
  const parts=dateStr.split('-'), y=parts[0]||'', md=(parts[1]||'00')+'-'+(parts[2]||'00');
  const periods=(adminData.periods&&adminData.periods.length?adminData.periods:[]);
  for(const p of periods){
    if(md>=p.from&&md<=p.to) return `${p.name||p.code} ${y}`;
  }
  return '';
}
function currentPeriodValue(){
  return periodOf(new Date().toISOString().split('T')[0]);
}
function ratingLabel(r){return r==='great'?'Bardzo dobry':r==='good'?'Dobry':'Poniżej standardu';}
function applyCol(el,pct){el.style.color=pct>=92?'var(--green)':pct>=82?'var(--amber)':'var(--red)';}
function applyBadge(el,pct){
  el.classList.remove('bg-great','bg-good','bg-below');
  if(pct>=92){el.textContent='Bardzo dobry';el.classList.add('bg-great');}
  else if(pct>=82){el.textContent='Dobry';el.classList.add('bg-good');}
  else{el.textContent='Poniżej standardu';el.classList.add('bg-below');}
}

// ══════════════════════════════════════════════
// STATE INIT
// ══════════════════════════════════════════════
function normalizeAdminData(){
  ['assessors','specialists','departments','positions'].forEach(k=>{if(!Array.isArray(adminData[k])) adminData[k]=[];});
  if(!Array.isArray(adminData.people)) adminData.people=[];
  if(!adminData.ids||typeof adminData.ids!=='object') adminData.ids={};
  ['assessors','specialists','departments','positions'].forEach(k=>{if(!adminData.ids[k]||typeof adminData.ids[k]!=='object') adminData.ids[k]={};});
  if(!adminData.archived) adminData.archived={};
  ['assessors','specialists','departments','positions'].forEach(k=>{if(!Array.isArray(adminData.archived[k])) adminData.archived[k]=[];});
  if(!adminData.aliases||typeof adminData.aliases!=='object') adminData.aliases={};
  ['assessors','specialists','departments','positions'].forEach(k=>{if(!adminData.aliases[k]||typeof adminData.aliases[k]!=='object') adminData.aliases[k]={};});
  if(!Array.isArray(adminData.history)) adminData.history=[];
  if(!Array.isArray(adminData.periods)||!adminData.periods.length){
    adminData.periods=[{code:'P1',name:'P1',from:'01-01',to:'04-30'},{code:'P2',name:'P2',from:'05-01',to:'08-31'},{code:'P3',name:'P3',from:'09-01',to:'12-31'}];
  }
  adminData.goals=Object.assign({callsPerPeriod:9,mailsPerPeriod:9,systemsPerPeriod:9,minAvg:92,greatShare:60},adminData.goals||{});
  if(adminData.goals.mailsPerPeriod==null)    adminData.goals.mailsPerPeriod=adminData.goals.callsPerPeriod||9;
  if(adminData.goals.systemsPerPeriod==null)  adminData.goals.systemsPerPeriod=adminData.goals.callsPerPeriod||9;
  if(!adminData.rolePerms || typeof adminData.rolePerms !== 'object'){
    adminData.rolePerms = JSON.parse(JSON.stringify(ROLE_PERMS));
  }else{
    Object.keys(ROLE_PERMS).forEach(function(role){
      if(!Array.isArray(adminData.rolePerms[role])){
        adminData.rolePerms[role] = JSON.parse(JSON.stringify(ROLE_PERMS[role]));
      } else {
        adminData.rolePerms[role] = Array.from(new Set(adminData.rolePerms[role].filter(Boolean)));
      }
    });
  }
  adminData.access=Object.assign({role:'admin'},adminData.access||{});
  ensureStableRelations();
}
function stableId(prefix,value){
  var text=String(value||'').trim()||prefix;
  var hash=0;
  for(var i=0;i<text.length;i++) hash=((hash<<5)-hash)+text.charCodeAt(i)|0;
  return prefix+'_'+Math.abs(hash).toString(36);
}
function idForAdminItem(key,name){
  if(!name) return '';
  if(!adminData.ids) adminData.ids={};
  if(!adminData.ids[key]) adminData.ids[key]={};
  if(!adminData.ids[key][name]) adminData.ids[key][name]=stableId(key.slice(0,3),name);
  return adminData.ids[key][name];
}
function nameForAdminId(key,id){
  if(!id||!adminData.ids||!adminData.ids[key]) return '';
  var map=adminData.ids[key];
  return Object.keys(map).find(function(name){return map[name]===id;})||'';
}
function adminKeyForField(field){
  return {spec:'specialists',oce:'assessors',dzial:'departments',stand:'positions'}[field]||'';
}
function personById(id){
  return adminData.people.find(function(p){return String(p.id)===String(id);})||null;
}
function findPersonByAnyName(name){
  return adminData.people.find(function(p){return p&&p.name===name;})||null;
}
function ensureStableRelations(){
  ['assessors','specialists','departments','positions'].forEach(function(key){
    (adminData[key]||[]).forEach(function(name){idForAdminItem(key,name);});
  });
  adminData.people.forEach(function(p){
    if(!p.id) p.id=Date.now()+Math.floor(Math.random()*1000000);
    if(p.name){
      p.specId=String(p.id);
      adminData.ids.specialists[p.name]=String(p.id);
    }
    if(p.leader) p.leaderId=idForAdminItem('assessors',p.leader);
    if(p.department) p.departmentId=idForAdminItem('departments',p.department);
    if(p.position) p.positionId=idForAdminItem('positions',p.position);
  });
  if(Array.isArray(window.registry)){
    registry.forEach(function(e){
      var p=e.specId?personById(e.specId):findPersonByAnyName(e.spec);
      if(p){
        e.specId=String(p.id);
        if(!e.spec) e.spec=p.name;
        if(!e.oce) e.oce=p.leader||'';
        if(!e.dzial) e.dzial=p.department||'';
        if(!e.stand) e.stand=p.position||'';
      }
      if(e.spec&&!e.specId){
        e.specId=idForAdminItem('specialists',e.spec);
      }
      if(e.oce) e.leaderId=idForAdminItem('assessors',e.oce);
      if(e.dzial) e.departmentId=idForAdminItem('departments',e.dzial);
      if(e.stand) e.positionId=idForAdminItem('positions',e.stand);
    });
  }
}
var ROLE_PERMS={
  admin:['create','preview','copy','editOwn','archive','hardDelete','adminConfig','dashboard','reports','export','pdf'],
  director:['create','preview','copy','editOwn','archive','dashboard','reports','export','pdf'],
  leader:['create','preview','copy','editOwn','archive','dashboard','reports','export','pdf'],
  assessor:['create','preview','copy','editOwn','dashboard','reports','pdf'],
  viewer:['preview','copy','dashboard','reports']
};
function getRolePerms(role){
  normalizeAdminData();
  return (adminData.rolePerms && adminData.rolePerms[role])?adminData.rolePerms[role]:(ROLE_PERMS[role]||ROLE_PERMS.viewer);
}
var PERM_LABELS=[
  ['create','Dodawanie kart'],
  ['editOwn','Edycja ocen/notatek'],
  ['archive','Archiwizacja'],
  ['hardDelete','Trwałe usuwanie'],
  ['adminConfig','Konfiguracja admina'],
  ['dashboard','Dashboard'],
  ['reports','Raporty'],
  ['export','Eksport CSV'],
  ['pdf','Raport PDF']
];
function activeRole(){normalizeAdminData();return adminData.access.role||'admin';}
function can(action){
  var perms=getRolePerms(activeRole());
  return perms.indexOf(action)>-1;
}
function roleLabel(){return {admin:'Administrator',director:'Dyrektor',leader:'Lider',assessor:'Oceniający',viewer:'Podgląd'}[activeRole()]||'Administrator';}
function currentUser(){
  try{
    var session=JSON.parse(DataStore.getValue('oc_session_v1','null')||'null');
    if(!session) return null;
    var users=JSON.parse(DataStore.getValue('oc_users_v1','[]')||'[]');
    return users.find(function(u){return u.id===session.id;})||null;
  }catch(e){return null;}
}
function getAssessorAliases(){
  normalizeAdminData();
  var aliases=Object.assign({},(adminData.aliases&&adminData.aliases.assessors)||{});
  (adminData.history||[]).slice().reverse().forEach(function(item){
    var desc=(item&&item.desc)||'';
    var match=desc.match(/^Zmieniono wpis: (.+?)\s+→\s+(.+)$/);
    if(match&&!aliases[match[1]]) aliases[match[1]]=match[2];
  });
  return aliases;
}
function resolveAssessorAlias(name){
  var aliases=getAssessorAliases();
  var seen={};
  name=name||'';
  while(name&&aliases[name]&&aliases[name]!==name&&!seen[name]){
    seen[name]=true;
    name=aliases[name];
  }
  return name||'';
}
function demoLeaderForLogin(login){
  var idx=-1;
  var match=String(login||'').match(/^lider(\d+)$/);
  if(match) idx=parseInt(match[1],10)-1;
  if(login==='lider') idx=0;
  if(idx<0||typeof buildDemoOrg!=='function') return '';
  var leader=((buildDemoOrg().leaders||[])[idx])||'';
  leader=resolveAssessorAlias(leader);
  return getActiveAdminItems('assessors').indexOf(leader)>-1?leader:'';
}
function activeLeaderId(){
  var role=activeRole();
  if(role!=='leader'&&role!=='assessor') return '';
  var user=window.currentUserData||currentUser()||{};
  if(user.leaderId) return String(user.leaderId);
  var scope=resolveAssessorAlias(user.leaderScope||'');
  if(scope) return idForAdminItem('assessors',scope);
  var name=resolveAssessorAlias(user.n||user.name||user.fullName||'');
  if(getActiveAdminItems('assessors').indexOf(name)>-1) return idForAdminItem('assessors',name);
  var byLogin=demoLeaderForLogin(user.l||user.login||'');
  return byLogin?idForAdminItem('assessors',byLogin):'';
}
function activeLeaderScope(){
  return nameForAdminId('assessors',activeLeaderId());
}
function entryLeaderId(e){
  if(!e) return '';
  if(e.leaderId) return String(e.leaderId);
  if(e.specId){
    var p=personById(e.specId);
    if(p&&p.leaderId) return String(p.leaderId);
  }
  return e.oce?idForAdminItem('assessors',resolveAssessorAlias(e.oce)):'';
}
function entryInScope(e){
  var leaderId=activeLeaderId();
  return !leaderId || entryLeaderId(e)===leaderId;
}
function personInScope(p){
  var leaderId=activeLeaderId();
  if(!leaderId) return true;
  if(!p) return false;
  return String(p.leaderId||idForAdminItem('assessors',p.leader||''))===leaderId;
}
function scopedRegistry(){
  return registry.filter(entryInScope);
}
function logChange(type,desc){
  normalizeAdminData();
  adminData.history.unshift({id:Date.now(),ts:new Date().toISOString(),role:activeRole(),type,desc});
  adminData.history=adminData.history.slice(0,80);
  saveAdminData();
}
function getActiveAdminItems(key){
  normalizeAdminData();
  const archived=adminData.archived[key]||[];
  return (adminData[key]||[]).filter(v=>archived.indexOf(v)===-1);
}
function activePeople(){
  normalizeAdminData();
  return adminData.people.filter(p=>p&&p.active!==false&&p.name&&personInScope(p));
}
function getPersonByName(name){
  return activePeople().find(p=>p.name===name)||null;
}
function getSpecialistOptions(){
  var names=activePeople().map(p=>p.name);
  scopedRegistry().forEach(function(e){
    if(e.spec&&names.indexOf(e.spec)===-1) names.push(e.spec);
  });
  getActiveAdminItems('specialists').forEach(function(n){
    if(names.indexOf(n)!==-1) return;
    var person=adminData.people.find(function(p){return p.name===n;});
    if(!person || personInScope(person)) names.push(n);
  });
  return names.sort();
}
function goalForType(type){
  normalizeAdminData();
  if(type==='m') return adminData.goals.mailsPerPeriod||adminData.goals.callsPerPeriod||GOAL||9;
  if(type==='s') return adminData.goals.systemsPerPeriod||adminData.goals.callsPerPeriod||GOAL||9;
  return adminData.goals.callsPerPeriod||GOAL||9;
}
function goalLabel(type){
  return {r:'rozmów',m:'maili',s:'działań w systemach'}[type]||'kart';
}
function specPeriodStatsHtml(spec,period){
  if(!spec){
    return '<div class="spec-empty">Wybierz specjalistę, aby zobaczyć jego wynik, realizację celu i ostatnie oceny w aktualnym periodzie.</div>';
  }
  var person=getPersonByName(spec)||{};
  var rows=scopedRegistry().filter(function(e){return !entryIsArchived(e)&&e.spec===spec&&(!period||e.period===period);});
  var allRows=scopedRegistry().filter(function(e){return !entryIsArchived(e)&&e.spec===spec;});
  var cards=rows.length, avg=cards?Math.round(rows.reduce(function(a,b){return a+b.avgFinal;},0)/cards):0;
  var goalRows=['r','m','s'].map(function(type){
    var done=rows.filter(function(e){return e.p===type;}).reduce(function(a,b){return a+(b.contactCount||0);},0);
    var goal=goalForType(type);
    var pct=Math.min(100,Math.round(done/goal*100));
    var col=pct>=100?'var(--green)':pct>=67?'var(--amber)':'var(--red)';
    return '<div class="spec-mini-row"><span>'+goalLabel(type)+'</span><strong style="color:'+col+'">'+done+' / '+goal+'</strong></div><div class="spec-goal-bg"><div class="spec-goal-fill" style="width:'+pct+'%;background:'+col+'"></div></div>';
  }).join('');
  var avgCol=avg>=92?'var(--green)':avg>=82?'var(--amber)':'var(--red)';
  var last=rows.slice().sort(function(a,b){return a.data<b.data?1:-1;})[0]||allRows.slice().sort(function(a,b){return a.data<b.data?1:-1;})[0];
  var great=rows.filter(function(e){return e.rating==='great';}).length;
  var good=rows.filter(function(e){return e.rating==='good';}).length;
  var below=rows.filter(function(e){return e.rating==='below';}).length;
  var periodTxt=period||'wszystkie okresy';
  return '<div class="spec-metric"><div class="spec-metric-lbl">Specjalista</div><div class="spec-metric-val" style="font-size:15px">'+escHtml(spec)+'</div><div class="spec-metric-sub">'+escHtml(person.leader||'Brak lidera')+' · '+escHtml(person.department||'Brak działu')+'</div></div>'+
    '<div class="spec-metric"><div class="spec-metric-lbl">Wynik w periodzie</div><div class="spec-metric-val" style="color:'+avgCol+'">'+(cards?avg+'%':'—')+'</div><div class="spec-metric-sub">'+cards+' kart · '+periodTxt+'</div></div>'+
    '<div class="spec-metric"><div class="spec-metric-lbl">Stan celów</div><div class="spec-mini-list">'+goalRows+'</div><div class="spec-metric-sub">Realizacja w wybranym periodzie</div></div>'+
    '<div class="spec-metric"><div class="spec-metric-lbl">Rozkład ocen</div><div class="spec-mini-list"><div class="spec-mini-row"><span>Bardzo dobry</span><strong style="color:var(--green)">'+great+'</strong></div><div class="spec-mini-row"><span>Dobry</span><strong style="color:var(--amber)">'+good+'</strong></div><div class="spec-mini-row"><span>Poniżej standardu</span><strong style="color:var(--red)">'+below+'</strong></div></div></div>'+
    '<div class="spec-metric"><div class="spec-metric-lbl">Ostatnia karta</div><div class="spec-metric-sub">'+(last?escHtml(last.data+' · '+({r:'Rozmowa',m:'Mail',s:'System'}[last.p]||last.p)+' · '+last.avgFinal+'%'):'Brak wcześniejszych kart')+'</div></div>';
}
function refreshSpecContext(p){
  var spec=document.getElementById(p+'-spec')?.value||'';
  var data=document.getElementById(p+'-data')?.value||'';
  var period=periodOf(data);
  var body=document.getElementById(p+'-spec-context-body');
  var sub=document.getElementById(p+'-spec-context-sub');
  if(body) body.innerHTML=specPeriodStatsHtml(spec,period);
  if(sub) sub.textContent=period?('Statystyki dla '+period):'Statystyki dla wybranego periodu';
}

function initState(p){
  const def=DEFS[p];const n=state[p].count;
  state[p].gold=Array(n).fill(0);state[p].ids=Array(n).fill('');
  state[p].scores={};state[p].notes={};state[p].goldDesc='';
  def.sections.forEach(sec=>{
    state[p].scores[sec.key]={};
    state[p].notes[sec.key]=Array(n).fill('');
    sec.criteria.forEach((_,ci)=>{state[p].scores[sec.key][ci]=Array(n).fill(1);});
  });
}
['r','m','s'].forEach(initState);


