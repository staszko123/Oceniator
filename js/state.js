/* ══════════════════════════════════════════════
   STATE — app state, registry, localStorage, theme, permissions
══════════════════════════════════════════════ */

// ══════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════
const state={
  r:{count:3,scores:{},gold:[],ids:[],notes:{},goldDesc:''},
  m:{count:3,scores:{},gold:[],ids:[],notes:{},goldDesc:''},
  s:{count:3,scores:{},gold:[],ids:[],notes:{},goldDesc:''},
};
const MAX_CONTACTS=10,MIN_CONTACTS=1;
let registry=[];
let spConfig={url:'',sheet:''};
let sortCol='data';let sortDir=-1;
let editingId=null;
let ewArchiveMode='active';

// ══════════════════════════════════════════════
// LOCALSTORAGE PERSISTENCE
// ══════════════════════════════════════════════
const LS_KEY='pep_registry_v5';
const DRAFT_KEY='pep_form_drafts_v1';
let draftDirty=false,lastSavedEntry=null;
function saveRegistry(){
  try{localStorage.setItem(LS_KEY,JSON.stringify(registry));}catch(e){}
}
function loadRegistry(){
  try{
    const raw=localStorage.getItem(LS_KEY);
    if(raw){registry=JSON.parse(raw);registry.forEach(e=>{if(e.archived==null)e.archived=false;});updateBadge();}
  }catch(e){registry=[];}
}
function getDrafts(){
  try{return JSON.parse(localStorage.getItem(DRAFT_KEY)||'{}')||{};}catch(e){return{};}
}
function setDrafts(drafts){
  try{localStorage.setItem(DRAFT_KEY,JSON.stringify(drafts));}catch(e){}
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
  localStorage.setItem('pep_theme',isDark?'light':'dark');
  setTimeout(()=>renderCharts(),50);
}
function initTheme(){
  var saved=localStorage.getItem('pep_theme')||'light';
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
  if(!adminData.archived) adminData.archived={};
  ['assessors','specialists','departments','positions'].forEach(k=>{if(!Array.isArray(adminData.archived[k])) adminData.archived[k]=[];});
  if(!Array.isArray(adminData.history)) adminData.history=[];
  if(!Array.isArray(adminData.periods)||!adminData.periods.length){
    adminData.periods=[{code:'P1',name:'P1',from:'01-01',to:'04-30'},{code:'P2',name:'P2',from:'05-01',to:'08-31'},{code:'P3',name:'P3',from:'09-01',to:'12-31'}];
  }
  adminData.goals=Object.assign({callsPerPeriod:9,mailsPerPeriod:9,systemsPerPeriod:9,minAvg:92,greatShare:60},adminData.goals||{});
  if(adminData.goals.mailsPerPeriod==null)    adminData.goals.mailsPerPeriod=adminData.goals.callsPerPeriod||9;
  if(adminData.goals.systemsPerPeriod==null)  adminData.goals.systemsPerPeriod=adminData.goals.callsPerPeriod||9;
  adminData.access=Object.assign({role:'admin'},adminData.access||{});
}
var ROLE_PERMS={
  admin:['create','preview','copy','editOwn','archive','hardDelete','adminConfig','dashboard','reports','export','pdf'],
  leader:['create','preview','copy','editOwn','archive','dashboard','reports','export','pdf'],
  assessor:['create','preview','copy','editOwn','dashboard','reports','pdf'],
  viewer:['preview','copy','dashboard','reports']
};
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
  var perms=ROLE_PERMS[activeRole()]||ROLE_PERMS.viewer;
  return perms.indexOf(action)>-1;
}
function roleLabel(){return {admin:'Administrator',leader:'Lider',assessor:'Oceniający',viewer:'Podgląd'}[activeRole()]||'Administrator';}
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
  return adminData.people.filter(p=>p&&p.active!==false&&p.name);
}
function getPersonByName(name){
  return activePeople().find(p=>p.name===name)||null;
}
function getSpecialistOptions(){
  var names=activePeople().map(p=>p.name);
  getActiveAdminItems('specialists').forEach(function(n){
    var hasRecord=adminData.people.some(function(p){return p.name===n;});
    if(!hasRecord&&names.indexOf(n)===-1) names.push(n);
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
  var rows=registry.filter(function(e){return !e.archived&&e.spec===spec&&(!period||e.period===period);});
  var allRows=registry.filter(function(e){return !e.archived&&e.spec===spec;});
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


