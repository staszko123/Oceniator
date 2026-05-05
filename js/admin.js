/* ══════════════════════════════════════════════
   ADMIN — admin panel, dictionaries, roles, goals, periods
══════════════════════════════════════════════ */

// ══════════════════════════════════════════════
// ADMIN PANEL
// ══════════════════════════════════════════════

// escHtml zdefiniowany w state.js — tu zostawiamy alias dla pewności
if(typeof escHtml==='undefined'){window.escHtml=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};}
function optsHtml(items,sel){
  return '<option value="">— wybierz —</option>'+items.map(function(v){return '<option value="'+escHtml(v)+'" '+(v===sel?'selected':'')+'>'+escHtml(v)+'</option>';}).join('');
}
function getSpecStats(spec){
  var scoped=typeof scopedRegistry==='function'?scopedRegistry():registry;
  var rows=scoped.filter(function(e){return e.spec===spec;});
  var n=rows.length;
  if(!n) return 'Brak kart';
  var avg=Math.round(rows.reduce(function(a,b){return a+b.avgFinal;},0)/n);
  return n+' kart · śr. '+avg+'%';
}
function getAssessorStats(oce){
  var scoped=typeof scopedRegistry==='function'?scopedRegistry():registry;
  var n=scoped.filter(function(e){return e.oce===oce;}).length;
  return n?n+' ocen':'Brak ocen';
}
function loadAdminData(){
  try{
    var p=DataStore.loadAdmin(null);
    if(p){
      adminData=Object.assign(adminData,p);
      if(Array.isArray(p.assessors))   adminData.assessors=p.assessors;
      if(Array.isArray(p.specialists)) adminData.specialists=p.specialists;
      if(Array.isArray(p.departments)) adminData.departments=p.departments;
      if(Array.isArray(p.positions))   adminData.positions=p.positions;
      if(Array.isArray(p.people))      adminData.people=p.people;
    }
  }catch(e){}
  normalizeAdminData();
  GOAL=adminData.goals.callsPerPeriod||GOAL;
  seedAdminFromRegistry();
}
function saveAdminData(){
  DataStore.saveAdmin(adminData);
}
function seedAdminFromRegistry(){
  function addNew(arr,val){if(val&&arr.indexOf(val)===-1)arr.push(val);}
  registry.forEach(function(e){
    addNew(adminData.assessors,e.oce);
    addNew(adminData.specialists,e.spec);
    addNew(adminData.departments,e.dzial);
    addNew(adminData.positions,e.stand);
    if(e.spec&&adminData.people.every(function(p){return p.name!==e.spec;})){
      adminData.people.push({id:Date.now()+Math.floor(Math.random()*100000),name:e.spec,leader:e.oce||'',department:e.dzial||'',position:e.stand||'',active:true});
    }
  });
  adminData.people.forEach(function(p){if(p.active==null)p.active=true;});
  adminData.people.sort(function(a,b){return (a.name||'').localeCompare(b.name||'','pl');});
  ['assessors','specialists','departments','positions'].forEach(function(k){
    adminData[k].sort();
  });
  ensureStableRelations();
}
function buildAdminLegacyUnused(){
  normalizeAdminData();
  var wrap=document.getElementById('wrap-admin');
  if(!wrap) return;
  var total=registry.filter(e=>!entryIsArchived(e)).length;
  var archived=registry.filter(e=>entryIsArchived(e)).length;
  var specs=[].concat(registry.filter(e=>!entryIsArchived(e))).reduce(function(s,e){s.add(e.spec);return s;},new Set()).size;
  var periods=[].concat(registry.filter(e=>!entryIsArchived(e))).reduce(function(s,e){if(e.period)s.add(e.period);return s;},new Set()).size;
  var roleOpts={admin:'Administrator',director:'Dyrektor',leader:'Lider',assessor:'Oceniający',viewer:'Podgląd'};
  var leaders=getActiveAdminItems('assessors'), deps=getActiveAdminItems('departments'), pos=getActiveAdminItems('positions');
  var h='';
  h+='<div style="margin-bottom:14px;display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap">';
  h+='<div><div style="font-size:16px;font-weight:700;color:var(--text)">Panel administracyjny</div><div style="font-size:11px;color:var(--text3);margin-top:3px">Struktura bazy, przypisania zespołów, role, okresy, cele i historia zmian</div></div>';
  h+='<div class="adm-card" style="padding:10px 12px;min-width:220px"><label class="rep-flbl">Tryb dostępu</label><select class="rep-sel" id="adm-role" onchange="admSetRole(this.value)">'+Object.keys(roleOpts).map(k=>'<option value="'+k+'" '+(activeRole()===k?'selected':'')+'>'+roleOpts[k]+'</option>').join('')+'</select></div>';
  h+='</div>';
  h+='<div class="adm-stats">';
  h+='<div class="adm-stat"><div class="adm-stat-val">'+total+'</div><div class="adm-stat-lbl">Aktywnych kart</div></div>';
  h+='<div class="adm-stat"><div class="adm-stat-val">'+archived+'</div><div class="adm-stat-lbl">W archiwum</div></div>';
  h+='<div class="adm-stat"><div class="adm-stat-val">'+specs+'</div><div class="adm-stat-lbl">Specjalistów</div></div>';
  h+='<div class="adm-stat"><div class="adm-stat-val">'+periods+'</div><div class="adm-stat-lbl">Okresów w danych</div></div>';
  h+='</div>';

  var roleKeys=['admin','director','leader','assessor','viewer'];
  var roleOpts={admin:'Administrator',director:'Dyrektor',leader:'Lider',assessor:'Oceniający',viewer:'Podgląd'};
  h+='<div class="adm-card" style="margin-bottom:14px"><div class="adm-hdr"><div><div class="adm-title">Uprawnienia per rola</div><div class="adm-item-sub">Akcje są blokowane w formularzach, ewidencji, dashboardzie i raportach zgodnie z aktywnym trybem dostępu.</div></div></div><div class="adm-body">';
  h+='<div class="perm-grid"><div class="perm-head">Akcja</div>'+roleKeys.map(function(role){return '<div class="perm-head">'+roleOpts[role]+'</div>';}).join('');
  PERM_LABELS.forEach(function(row){
    h+='<div>'+row[1]+'</div>';
    roleKeys.forEach(function(role){
      var ok=getRolePerms(role).indexOf(row[0])>-1;
      if(can('adminConfig')){
        h+='<label class="perm-cell"><input type="checkbox" '+(ok?'checked':'')+' onchange="admToggleRolePerm(\''+role+'\',\''+row[0]+'\')"> '+(ok?'Tak':'Brak')+'</label>';
      } else {
        h+='<div class="'+(ok?'perm-yes':'perm-no')+'">'+(ok?'✓ Dostęp':'— Blokada')+'</div>';
      }
    });
  });
  h+='</div></div></div>';

  h+='<div class="adm-card" style="margin-bottom:14px"><div class="adm-hdr"><div><div class="adm-title">Struktura bazy: specjalista → lider → dział → stanowisko</div><div class="adm-item-sub">Ta tabela zasila formularze ocen i automatycznie uzupełnia dane po wyborze specjalisty.</div></div><button class="btn btn-outline btn-sm" onclick="admSync()">Synchronizuj z ewidencją</button></div><div class="adm-body org-scroll">';
  h+='<div class="org-grid" style="margin-bottom:12px">';
  h+='<div><label class="rep-flbl">Specjalista</label><input id="adm-person-name" placeholder="Imię i nazwisko"></div>';
  h+='<div><label class="rep-flbl">Lider / oceniający</label><select id="adm-person-leader">'+optsHtml(leaders,'')+'</select></div>';
  h+='<div><label class="rep-flbl">Dział</label><select id="adm-person-department">'+optsHtml(deps,'')+'</select></div>';
  h+='<div><label class="rep-flbl">Stanowisko</label><select id="adm-person-position">'+optsHtml(pos,'')+'</select></div>';
  h+='<button class="btn btn-primary btn-sm" onclick="admAddPerson()" '+(!can('adminConfig')?'disabled':'')+'>+ Dodaj przypisanie</button>';
  h+='</div>';
  h+='<table class="org-table"><thead><tr><th>Specjalista</th><th>Lider / oceniający</th><th>Dział</th><th>Stanowisko</th><th>Status</th><th></th></tr></thead><tbody>';
  h+=adminData.people.length?adminData.people.map(function(p,i){
    return '<tr><td><strong>'+escHtml(p.name)+'</strong><div class="adm-item-sub">'+getSpecStats(p.name)+'</div></td>'+
      '<td><span class="org-pill">👤 '+escHtml(p.leader||'—')+'</span></td>'+
      '<td><span class="org-pill">🏢 '+escHtml(p.department||'—')+'</span></td>'+
      '<td><span class="org-pill">💼 '+escHtml(p.position||'—')+'</span></td>'+
      '<td><span class="lock-badge '+(p.active===false?'locked':'')+'" onclick="admTogglePerson('+i+')">'+(p.active===false?'Nieaktywny':'Aktywny')+'</span></td>'+
      '<td class="r"><button class="adm-btn" onclick="admEditPerson('+i+')" '+(!can('adminConfig')?'disabled':'')+'>Edytuj</button></td></tr>';
  }).join(''):'<tr><td colspan="6"><div class="adm-empty">Brak przypisań. Dodaj specjalistę i powiąż go z liderem, działem oraz stanowiskiem.</div></td></tr>';
  h+='</tbody></table></div></div>';

  h+='<div class="adm-grid compact">';
  var DEFS_A=[
    {key:'assessors',icon:'👤',label:'Oceniający',inp:'adm-inp-assessors',ph:'Imię i nazwisko'},
    {key:'specialists',icon:'👥',label:'Specjaliści',inp:'adm-inp-specialists',ph:'Imię i nazwisko'},
    {key:'departments',icon:'🏢',label:'Działy',inp:'adm-inp-departments',ph:'Nazwa działu'},
    {key:'positions',icon:'💼',label:'Stanowiska',inp:'adm-inp-positions',ph:'Nazwa stanowiska'}
  ];
  DEFS_A.forEach(function(d){
    var cnt=getActiveAdminItems(d.key).length, ac=(adminData.archived[d.key]||[]).length;
    h+='<div class="adm-card"><div class="adm-hdr"><div class="adm-title">'+d.icon+' '+d.label+'</div><span style="font-size:10px;color:var(--text3)">'+cnt+' aktyw. / '+ac+' arch.</span></div><div class="adm-body">';
    h+='<input type="text" class="adm-search" id="adms-'+d.key+'" placeholder="Szukaj..." oninput="admFilter(\''+d.key+'\',this.value)">';
    h+='<div class="adm-list" id="adml-'+d.key+'"></div>';
    h+='<div class="adm-add"><input type="text" id="'+d.inp+'" placeholder="'+d.ph+'"><button class="btn btn-primary btn-sm" data-k="'+d.key+'" data-i="'+d.inp+'" onclick="admAdd(this)" '+(!can('adminConfig')?'disabled':'')+'>+ Dodaj</button></div>';
    h+='</div></div>';
  });
  h+='</div>';

  h+='<div class="adm-card" style="margin-top:14px"><div class="adm-hdr"><div class="adm-title">Cele jakościowe</div></div><div class="adm-body"><div class="rep-filters">';
  h+='<div class="rep-frow"><label class="rep-flbl">Rozmów / period / spec.</label><input class="rep-date" type="number" min="1" max="50" id="adm-goal-calls" value="'+adminData.goals.callsPerPeriod+'" onchange="admSaveGoals()"></div>';
  h+='<div class="rep-frow"><label class="rep-flbl">Maili / period / spec.</label><input class="rep-date" type="number" min="1" max="50" id="adm-goal-mails" value="'+adminData.goals.mailsPerPeriod+'" onchange="admSaveGoals()"></div>';
  h+='<div class="rep-frow"><label class="rep-flbl">Działań w systemach / period / spec.</label><input class="rep-date" type="number" min="1" max="50" id="adm-goal-systems" value="'+adminData.goals.systemsPerPeriod+'" onchange="admSaveGoals()"></div>';
  h+='<div class="rep-frow"><label class="rep-flbl">Minimalna średnia %</label><input class="rep-date" type="number" min="1" max="100" id="adm-goal-avg" value="'+adminData.goals.minAvg+'" onchange="admSaveGoals()"></div>';
  h+='<div class="rep-frow"><label class="rep-flbl">Udział bardzo dobrych %</label><input class="rep-date" type="number" min="0" max="100" id="adm-goal-great" value="'+adminData.goals.greatShare+'" onchange="admSaveGoals()"></div>';
  h+='</div></div></div>';

  h+='<div class="adm-card" style="margin-top:14px"><div class="adm-hdr"><div class="adm-title">Okresy rozliczeniowe</div><button class="btn btn-outline btn-sm" onclick="admAddPeriod()" '+(!can('adminConfig')?'disabled':'')+'>+ Okres</button></div><div class="adm-body" id="adm-periods">';
  adminData.periods.forEach(function(p,i){
    h+='<div class="adm-item"><div style="flex:1;display:grid;grid-template-columns:90px 1fr 100px 100px;gap:8px"><input class="adm-edit-input" value="'+p.code+'" onchange="admPeriodSet('+i+',\'code\',this.value)"><input class="adm-edit-input" value="'+p.name+'" onchange="admPeriodSet('+i+',\'name\',this.value)"><input class="adm-edit-input" value="'+p.from+'" onchange="admPeriodSet('+i+',\'from\',this.value)"><input class="adm-edit-input" value="'+p.to+'" onchange="admPeriodSet('+i+',\'to\',this.value)"></div><button class="adm-btn del" onclick="admDelPeriod('+i+')" '+(!can('adminConfig')?'disabled':'')+'>Usuń</button></div>';
  });
  h+='</div></div>';

  h+='<div class="adm-card" style="margin-top:14px"><div class="adm-hdr"><div class="adm-title">Historia zmian</div><button class="btn btn-outline btn-sm" onclick="admExport()">Eksportuj konfigurację</button></div><div class="adm-body"><div class="adm-list" style="max-height:260px">';
  h+=(adminData.history.length?adminData.history.map(function(x){return '<div class="adm-item"><div style="flex:1"><div class="adm-item-name">'+x.type+' · '+x.desc+'</div><div class="adm-item-sub">'+new Date(x.ts).toLocaleString('pl-PL')+' · '+({admin:'Administrator',leader:'Lider',assessor:'Oceniający',viewer:'Podgląd'}[x.role]||x.role)+'</div></div></div>';}).join(''):'<div class="adm-empty">Brak historii zmian.</div>');
  h+='</div></div></div>';
  wrap.innerHTML=h;
  DEFS_A.forEach(function(d){var inp=document.getElementById(d.inp);if(inp){var k=d.key,i=d.inp;inp.addEventListener('keydown',function(e){if(e.key==='Enter')admAddKey(k,i);});}});
  renderAdmLists();
}
function renderAdmLists(){
  ['assessors','specialists','departments','positions'].forEach(function(key){
    var el=document.getElementById('adml-'+key);
    if(!el) return;
    // restore search input value
    var sinp=document.getElementById('adms-'+key);
    var q=(admSearch[key]||'').toLowerCase();
    if(sinp&&sinp.value!==admSearch[key]) sinp.value=admSearch[key]||'';
    if(key==='specialists'){
      var people=(activeLeaderScope()?activePeople():adminData.people.filter(function(p){return p&&p.name;}));
      var filteredPeople=q?people.filter(function(p){return ((p.name||'')+' '+(p.leader||'')+' '+(p.department||'')+' '+(p.position||'')).toLowerCase().indexOf(q)>=0;}):people;
      if(!people.length){el.innerHTML='<div class="adm-empty">Brak specjalistów.</div>';return;}
      if(!filteredPeople.length){el.innerHTML='<div class="adm-empty">Brak wyników dla "'+admSearch[key]+'".</div>';return;}
      el.innerHTML=filteredPeople.map(function(p){
        var i=adminData.people.indexOf(p);
        return '<div class="adm-item adm-person-item" id="admi-specialists-'+i+'">'+
          '<span class="adm-person-avatar">'+escHtml((p.name||'?').split(' ').map(function(x){return x[0];}).join('').slice(0,2))+'</span>'+
          '<div style="flex:1;min-width:0"><div class="adm-item-name">'+escHtml(p.name||'')+'</div>'+
          '<div class="adm-item-sub">'+escHtml(p.department||'Brak działu')+' · '+escHtml(p.position||'Brak stanowiska')+' · Lider: '+escHtml(p.leader||'brak')+'</div></div>'+
          '<div class="adm-actions"><button class="adm-btn" onclick="admEditPerson('+i+')" '+(!can('adminConfig')?'disabled':'')+'>Edytuj</button></div>'+
        '</div>';
      }).join('')+(q?'<div style="font-size:10px;color:var(--text3);text-align:center;padding:4px 0">'+filteredPeople.length+' z '+people.length+' osób</div>':'');
      return;
    }
    var items=(adminData[key]||[]);
    var filtered=q?items.filter(function(it){return it.toLowerCase().indexOf(q)>=0;}):items;
    if(!items.length){
      el.innerHTML='<div class="adm-empty">Brak wpisów.</div>';
      return;
    }
    if(!filtered.length){
      el.innerHTML='<div class="adm-empty">Brak wyników dla "'+admSearch[key]+'".</div>';
      return;
    }
    var icon=ADMIN_ICONS[key]||'•';
    var h='';
    filtered.forEach(function(item){
      // use real index in adminData for edit/delete
      var i=items.indexOf(item);
      var sub='';
      if(key==='specialists') sub='<div class="adm-item-sub">'+getSpecStats(item)+'</div>';
      if(key==='assessors')   sub='<div class="adm-item-sub">'+getAssessorStats(item)+'</div>';
      h+='<div class="adm-item" id="admi-'+key+'-'+i+'">';
      h+='<span style="font-size:15px;margin-right:2px">'+icon+'</span>';
      h+='<div style="flex:1;min-width:0"><div class="adm-item-name">'+item+'</div>'+sub+'</div>';
      h+='<div class="adm-actions">';
      h+='<button class="adm-btn" data-k="'+key+'" data-i="'+i+'" onclick="admEditBtn(this)" title="Edytuj">✏️</button>';
      h+='<button class="adm-btn del" data-k="'+key+'" data-i="'+i+'" onclick="admDelBtn(this)" title="Usuń">🗑</button>';
      h+='</div></div>';
    });
    if(q){
      h+='<div style="font-size:10px;color:var(--text3);text-align:center;padding:4px 0">'+filtered.length+' z '+items.length+' wpisów</div>';
    }
    el.innerHTML=h;
  });
}
function admAddPerson(){
  if(!can('adminConfig')){showToast('Brak uprawnień do edycji konfiguracji','warn');return;}
  normalizeAdminData();
  var name=(document.getElementById('adm-person-name')?.value||'').trim();
  var leader=document.getElementById('adm-person-leader')?.value||'';
  var department=document.getElementById('adm-person-department')?.value||'';
  var position=document.getElementById('adm-person-position')?.value||'';
  if(!name){showToast('Wpisz specjalistę','err');return;}
  var idx=editingPersonIdx>-1?editingPersonIdx:adminData.people.findIndex(function(p){return p.name===name;});
  var old=idx>-1?adminData.people[idx]:null;
  var person={id:old?.id||Date.now(),name,leader,department,position,active:old?.active!==false};
  if(idx>-1) adminData.people[idx]=person; else adminData.people.push(person);
  [['specialists',name],['assessors',leader],['departments',department],['positions',position]].forEach(function(pair){
    var k=pair[0],v=pair[1];if(v&&adminData[k].indexOf(v)===-1) adminData[k].push(v);
  });
  adminData.people.sort(function(a,b){return (a.name||'').localeCompare(b.name||'','pl');});
  ['assessors','specialists','departments','positions'].forEach(function(k){adminData[k].sort();});
  editingPersonIdx=-1;
  saveAdminData();logChange('Struktura bazy',(old?'Zmieniono przypisanie: ':'Dodano przypisanie: ')+name);
  buildAdmin();['r','m','s'].forEach(buildForm);showToast(old?'Przypisanie zaktualizowane':'Przypisanie dodane','ok');
}
function admNewPerson(){
  if(!can('adminConfig')){showToast('Brak uprawnień','warn');return;}
  editingPersonIdx=-1;
  admOpenPersonModal({name:'',leader:'',department:'',position:'',active:true},'Dodaj specjalistę');
}
function admEditPerson(i){
  if(!can('adminConfig')){showToast('Brak uprawnień','warn');return;}
  var p=adminData.people[i];if(!p)return;
  editingPersonIdx=i;
  admOpenPersonModal(p,'Edytuj specjalistę');
}
function admOpenPersonModal(p,title){
  var old=document.getElementById('adm-person-modal');if(old) old.remove();
  var div=document.createElement('div');
  div.id='adm-person-modal';
  div.className='modal-overlay open';
  div.innerHTML='<div class="modal adm-person-modal">'+
    '<h3>'+title+'</h3>'+
    '<p>Uzupełnij dane osoby i przypisz ją do lidera, działu oraz stanowiska. Ten zapis zasila formularze, raporty i widoki zespołów.</p>'+
    '<div class="adm-modal-grid">'+
      '<label>Specjalista<input id="adm-modal-name" value="'+escHtml(p.name||'')+'"></label>'+
      '<label>Lider / oceniający<select id="adm-modal-leader">'+optsHtml(getActiveAdminItems('assessors'),p.leader||'')+'</select></label>'+
      '<label>Dział<select id="adm-modal-department">'+optsHtml(getActiveAdminItems('departments'),p.department||'')+'</select></label>'+
      '<label>Stanowisko<select id="adm-modal-position">'+optsHtml(getActiveAdminItems('positions'),p.position||'')+'</select></label>'+
      '<label>Status<select id="adm-modal-active"><option value="1" '+(p.active!==false?'selected':'')+'>Aktywny</option><option value="0" '+(p.active===false?'selected':'')+'>Nieaktywny</option></select></label>'+
    '</div>'+
    '<div class="modal-btns"><button class="btn btn-primary btn-sm" onclick="admSavePersonModal()">Zapisz zmiany</button><button class="btn btn-outline btn-sm" onclick="admClosePersonModal()">Anuluj</button></div>'+
  '</div>';
  document.body.appendChild(div);
  var nameEl=document.getElementById('adm-modal-name');if(nameEl){nameEl.focus();nameEl.select();}
}
function admClosePersonModal(){var el=document.getElementById('adm-person-modal');if(el) el.remove();editingPersonIdx=-1;}
function admSavePersonModal(){
  normalizeAdminData();
  var old=editingPersonIdx>-1?adminData.people[editingPersonIdx]:null;
  var name=(document.getElementById('adm-modal-name')?.value||'').trim();
  if(!name){showToast('Wpisz specjalistę','err');return;}
  var leader=document.getElementById('adm-modal-leader')?.value||'';
  var department=document.getElementById('adm-modal-department')?.value||'';
  var position=document.getElementById('adm-modal-position')?.value||'';
  var person={
    id:(old&&old.id)||Date.now(),
    name:name,
    specId:String((old&&old.id)||Date.now()),
    leader:leader,
    leaderId:idForAdminItem('assessors',leader),
    department:department,
    departmentId:idForAdminItem('departments',department),
    position:position,
    positionId:idForAdminItem('positions',position),
    active:(document.getElementById('adm-modal-active')?.value||'1')==='1'
  };
  person.specId=String(person.id);
  var duplicate=adminData.people.findIndex(function(p,i){return p.name===name&&i!==editingPersonIdx;});
  if(duplicate>-1){showToast('Taki specjalista już istnieje','warn');return;}
  if(old&&old.name!==name&&adminData.ids.specialists) delete adminData.ids.specialists[old.name];
  adminData.ids.specialists[name]=String(person.id);
  if(editingPersonIdx>-1) adminData.people[editingPersonIdx]=person; else adminData.people.push(person);
  [['specialists',person.name],['assessors',person.leader],['departments',person.department],['positions',person.position]].forEach(function(pair){
    var k=pair[0],v=pair[1];if(v&&adminData[k].indexOf(v)===-1) adminData[k].push(v);
  });
  if(old){
    registry.forEach(function(e){
      if(String(e.specId||'')===String(old.id)||e.spec===old.name){
        e.specId=String(person.id);e.leaderId=person.leaderId;e.departmentId=person.departmentId;e.positionId=person.positionId;
        e.spec=person.name;e.oce=person.leader;e.dzial=person.department;e.stand=person.position;
      }
    });
  }
  adminData.people.sort(function(a,b){return (a.name||'').localeCompare(b.name||'','pl');});
  ['assessors','specialists','departments','positions'].forEach(function(k){adminData[k].sort();});
  saveAdminData();if(old)saveRegistry();logChange('Struktura bazy',(old?'Zmieniono dane specjalisty: ':'Dodano specjalistę: ')+person.name);
  admClosePersonModal();buildAdmin();['r','m','s'].forEach(buildForm);showToast(old?'Dane specjalisty zaktualizowane':'Specjalista dodany','ok');
}
function admTogglePerson(i){
  if(!can('adminConfig')){showToast('Brak uprawnień','warn');return;}
  var p=adminData.people[i];if(!p)return;
  p.active=p.active===false;
  saveAdminData();logChange('Struktura bazy',(p.active?'Aktywowano: ':'Dezaktywowano: ')+p.name);
  buildAdmin();['r','m','s'].forEach(buildForm);
}
function admFilter(key,val){
  admSearch[key]=val;
  renderAdmLists();
}

function admAdd(btn){admAddKey(btn.getAttribute('data-k'),btn.getAttribute('data-i'));}
function admAddKey(key,inputId){
  if(!can('adminConfig')){showToast('Brak uprawnień do edycji konfiguracji','warn');return;}
  var inp=document.getElementById(inputId);
  var val=inp?inp.value.trim():'';
  if(!val){showToast('Wpisz nazwę','err');return;}
  if((adminData[key]||[]).indexOf(val)>-1){showToast('Już istnieje','warn');return;}
  if(!adminData[key])adminData[key]=[];
  adminData[key].push(val);adminData[key].sort();
  saveAdminData();if(inp)inp.value='';
  logChange('Słownik','Dodano wpis: '+val);
  buildAdmin();['r','m','s'].forEach(buildForm);showToast('Dodano: '+val,'ok');
}
function admDelBtn(btn){
  if(!can('adminConfig')){showToast('Brak uprawnień','warn');return;}
  var key=btn.getAttribute('data-k'),idx=parseInt(btn.getAttribute('data-i'));
  var item=(adminData[key]||[])[idx];if(!item)return;
  var n=0;
  if(key==='assessors')   n=registry.filter(function(e){return e.oce===item;}).length;
  if(key==='specialists') n=registry.filter(function(e){return e.spec===item;}).length;
  if(key==='departments') n=registry.filter(function(e){return e.dzial===item;}).length;
  if(key==='positions')   n=registry.filter(function(e){return e.stand===item;}).length;
  var el=document.getElementById('admi-'+key+'-'+idx);if(!el)return;
  var acts=el.querySelector('.adm-actions');
  if(acts){
    var warn=n?'<span style="font-size:10px;color:var(--red);margin-right:6px">Używ. w '+n+' kartach</span>':'';
    acts.innerHTML=warn+
      '<button class="adm-btn del" style="background:var(--red);color:#fff;border-color:var(--red);font-weight:700" data-k="'+key+'" data-i="'+idx+'" onclick="admDelConfirm(this)">✓ Usuń</button>'+
      '<button class="adm-btn" onclick="renderAdmLists()">×</button>';
  }
}
function admDelConfirm(btn){
  var key=btn.getAttribute('data-k'),idx=parseInt(btn.getAttribute('data-i'));
  var item=(adminData[key]||[])[idx];if(!item)return;
  if(!can('adminConfig')){showToast('Brak uprawnień','warn');return;}
  if((adminData.archived[key]||[]).indexOf(item)===-1) adminData.archived[key].push(item);
  saveAdminData();logChange('Archiwizacja słownika','Zarchiwizowano wpis: '+item);buildAdmin();['r','m','s'].forEach(buildForm);showToast('Zarchiwizowano: '+item,'ok');
}
function admEditBtn(btn){
  var key=btn.getAttribute('data-k'),idx=parseInt(btn.getAttribute('data-i'));
  var el=document.getElementById('admi-'+key+'-'+idx);if(!el)return;
  var item=(adminData[key]||[])[idx]||'';
  var nameEl=el.querySelector('.adm-item-name');
  if(nameEl){
    var iid='adm-ei-'+key+'-'+idx;
    nameEl.innerHTML='<input class="adm-edit-input" id="'+iid+'" value="'+item.replace(/[<>"]/g,function(c){return {'<':'&lt;','>':'&gt;','"':'&quot;'}[c];})+'">';
    var inp=document.getElementById(iid);
    if(inp){
      inp.focus();inp.select();
      var k=key,i=idx;
      inp.addEventListener('keydown',function(e){
        if(e.key==='Enter')admSaveItem(k,i);
        if(e.key==='Escape')buildAdmin();
      });
    }
  }
  var acts=el.querySelector('.adm-actions');
  if(acts){
    acts.innerHTML=
      '<button class="adm-btn" data-k="'+key+'" data-i="'+idx+'" onclick="admSaveBtn(this)">💾</button>'+
      '<button class="adm-btn" onclick="buildAdmin()">×</button>';
  }
}
function admSaveBtn(btn){admSaveItem(btn.getAttribute('data-k'),parseInt(btn.getAttribute('data-i')));}
function admUpdateAuthUsersForRename(key,oldName,newName){
  if(key!=='assessors'&&key!=='specialists') return;
  try{
    var raw=DataStore.getValue('oc_users_v1','null');
    var users=JSON.parse(raw||'null');
    if(!Array.isArray(users)) return;
    var changed=false;
    users.forEach(function(u){
      if(key==='assessors'){
        if(u.leaderScope===oldName){u.leaderScope=newName;changed=true;}
        if(u.n===oldName){u.n=newName;changed=true;}
        if(u.name===oldName){u.name=newName;changed=true;}
        if(u.fullName===oldName){u.fullName=newName;changed=true;}
        if(u.leaderScope===newName||u.n===newName){
          u.leaderId=idForAdminItem('assessors',newName);
          changed=true;
        }
      }
      if(key==='specialists'){
        if(u.n===oldName){u.n=newName;changed=true;}
        if(u.name===oldName){u.name=newName;changed=true;}
        if(u.fullName===oldName){u.fullName=newName;changed=true;}
      }
    });
    if(changed) DataStore.setValue('oc_users_v1',JSON.stringify(users));
    if(window.currentUserData){
      if(key==='assessors'&&window.currentUserData.leaderScope===oldName) window.currentUserData.leaderScope=newName;
      if(window.currentUserData.n===oldName) window.currentUserData.n=newName;
      if(window.currentUserData.name===oldName) window.currentUserData.name=newName;
      if(window.currentUserData.fullName===oldName) window.currentUserData.fullName=newName;
    }
  }catch(e){}
}
function admSaveItem(key,idx){
  if(!can('adminConfig')){showToast('Brak uprawnień','warn');return;}
  var inp=document.getElementById('adm-ei-'+key+'-'+idx);
  var nv=inp?inp.value.trim():'';
  if(!nv){showToast('Nazwa nie może być pusta','err');return;}
  var old=(adminData[key]||[])[idx];
  if(old===nv){buildAdmin();return;}
  normalizeAdminData();
  if(adminData[key].indexOf(nv)>-1){showToast('Taki wpis już istnieje','warn');return;}
  adminData.aliases[key][old]=nv;
  if(adminData.ids&&adminData.ids[key]){
    adminData.ids[key][nv]=adminData.ids[key][old]||idForAdminItem(key,old);
    delete adminData.ids[key][old];
  }
  adminData[key][idx]=nv;adminData[key].sort();
  var upd=0;
  registry.forEach(function(e){
    if(key==='assessors'&&e.oce===old){e.oce=nv;upd++;}
    if(key==='specialists'&&e.spec===old){e.spec=nv;upd++;}
    if(key==='departments'&&e.dzial===old){e.dzial=nv;upd++;}
    if(key==='positions'&&e.stand===old){e.stand=nv;upd++;}
  });
  adminData.people.forEach(function(p){
    if(key==='assessors'&&p.leader===old){p.leader=nv;p.leaderId=idForAdminItem('assessors',nv);}
    if(key==='specialists'&&p.name===old){p.name=nv;p.specId=String(p.id);adminData.ids.specialists[nv]=String(p.id);}
    if(key==='departments'&&p.department===old){p.department=nv;p.departmentId=idForAdminItem('departments',nv);}
    if(key==='positions'&&p.position===old){p.position=nv;p.positionId=idForAdminItem('positions',nv);}
  });
  admUpdateAuthUsersForRename(key,old,nv);
  saveAdminData();if(upd)saveRegistry();logChange('Słownik','Zmieniono wpis: '+old+' → '+nv);
  updateRoleBadge();
  buildAdmin();renderEw();['r','m','s'].forEach(buildForm);
  if(document.getElementById('tab-dashboard')?.classList.contains('on')) buildDashboard();
  if(document.getElementById('tab-raporty')?.classList.contains('on')) buildRaporty();
  if(document.getElementById('tab-myteam')?.classList.contains('on')) buildMyTeam();
  showToast('Zaktualizowano wszędzie'+(upd?' ('+upd+' kart)':''),'ok');
}
function admChGoal(d){
  normalizeAdminData();
  GOAL=Math.max(1,Math.min(30,GOAL+d));
  adminData.goals.callsPerPeriod=GOAL;
  DataStore.setGoal(GOAL);
  saveAdminData();
  var el=document.getElementById('adm-goal-val');if(el)el.textContent=GOAL;
  ['r','m','s'].forEach(refreshSpecContext);
  var dashPanel=document.getElementById('tab-dashboard');
  if(dashPanel&&dashPanel.classList.contains('on')) buildDashboard();
  showToast('Cel: '+GOAL+' rozmów / period','ok');
}
function admSync(){seedAdminFromRegistry();saveAdminData();buildAdmin();showToast('Zsynchronizowano','ok');}
function admExport(){
  try{
    var a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([JSON.stringify(adminData,null,2)],{type:'application/json'}));
    a.download='PeP_P24_slowniki.json';a.click();
    showToast('Wyeksportowano','ok');
  }catch(e){showToast('Błąd eksportu','err');}
}

function admSupabaseToolsHtml(){
  if(!DataStore.isRemote || !DataStore.isRemote()) return '';
  var st=DataStore.localMigrationStatus?DataStore.localMigrationStatus():{registryCount:0,hasAdmin:false,hasUsers:false,hasLocalSession:false};
  if(!st.registryCount && !st.hasAdmin && !st.hasUsers && !st.hasLocalSession) return '';
  return '<section class="adm-section"><div class="adm-section-head"><div><h3>Supabase i migracja</h3><p>Jednorazowo przenies stare dane z tej przegladarki do Supabase, a potem usun lokalne kopie produkcyjne.</p></div></div>'+
    '<div class="adm-bottom-grid">'+
      '<div class="adm-history">'+
        '<div class="adm-item"><div><div class="adm-item-name">Lokalne karty: '+st.registryCount+'</div><div class="adm-item-sub">Zrodlo: pep_registry_v5 w tej przegladarce.</div></div></div>'+
        '<div class="adm-item"><div><div class="adm-item-name">Lokalna konfiguracja: '+(st.hasAdmin?'tak':'nie')+'</div><div class="adm-item-sub">Zrodlo: pep_admin_v1.</div></div></div>'+
        '<div class="adm-item"><div><div class="adm-item-name">Lokalne konta demo: '+(st.hasUsers?'tak':'nie')+'</div><div class="adm-item-sub">Po przejsciu na Supabase Auth mozna je usunac.</div></div></div>'+
      '</div>'+
      '<div class="adm-history">'+
        '<button class="btn btn-primary btn-sm" onclick="admMigrateLocalToSupabase()" '+(!can('adminConfig')?'disabled':'')+'>Migruj lokalne dane do Supabase</button>'+
        '<button class="btn btn-outline btn-sm" onclick="admClearLocalProductionData()" '+(!can('adminConfig')?'disabled':'')+' style="margin-left:8px">Wyczysc lokalne kopie</button>'+
        '<div class="adm-item-sub" style="margin-top:10px">Szkice formularzy, motyw i ustawienia interfejsu zostaja lokalnie.</div>'+
      '</div>'+
    '</div></section>';
}
async function admMigrateLocalToSupabase(){
  if(!can('adminConfig')){showToast('Brak uprawnien','warn');return;}
  if(!DataStore.migrateLocalToSupabase){showToast('Migracja nie jest dostepna','warn');return;}
  if(!confirm('Przeniesc lokalne karty i konfiguracje z tej przegladarki do Supabase?')) return;
  try{
    var res=await DataStore.migrateLocalToSupabase();
    if(DataStore.fetchRegistry){
      var remote=await DataStore.fetchRegistry();
      if(Array.isArray(remote)){registry=remote;normalizeRegistry();}
    }
    if(DataStore.fetchAdmin){
      var remoteAdmin=await DataStore.fetchAdmin();
      if(remoteAdmin){Object.assign(adminData,remoteAdmin);normalizeAdminData();}
    }
    buildAdmin();renderEw();if(typeof updateBadge==='function')updateBadge();
    showToast('Migracja zakonczona: '+(res.registryCount||0)+' kart','ok');
  }catch(e){
    console.warn('[Admin] Migracja Supabase:',e);
    showToast('Migracja nie powiodla sie. Sprawdz konsole i RLS.','err');
  }
}
function admClearLocalProductionData(){
  if(!can('adminConfig')){showToast('Brak uprawnien','warn');return;}
  if(!DataStore.clearLocalProductionData){showToast('Czyszczenie nie jest dostepne','warn');return;}
  if(!confirm('Usunac lokalne kopie kart, konfiguracji i kont demo z tej przegladarki? Upewnij sie, ze migracja do Supabase juz dziala.')) return;
  DataStore.clearLocalProductionData();
  buildAdmin();
  showToast('Lokalne kopie produkcyjne wyczyszczone','ok');
}

function admSetRole(role){
  normalizeAdminData();
  adminData.access.role=role;
  saveAdminData();logChange('Dostęp','Zmieniono tryb na: '+roleLabel());
  updateRoleBadge();
  buildAdmin();renderEw();['r','m','s'].forEach(buildForm);showToast('Tryb: '+roleLabel(),'ok');
}
function admToggleRolePerm(role,perm){
  if(!can('adminConfig')) return;
  normalizeAdminData();
  var perms = adminData.rolePerms && Array.isArray(adminData.rolePerms[role]) ? adminData.rolePerms[role] : [];
  var idx = perms.indexOf(perm);
  if(idx > -1){
    perms.splice(idx,1);
  } else {
    perms.push(perm);
  }
  adminData.rolePerms[role] = perms.sort();
  var permLabel = (PERM_LABELS.find(function(item){return item[0]===perm;})||[])[1]||perm;
  var roleNames = {admin:'Administrator',director:'Dyrektor',leader:'Lider',assessor:'Oceniający',viewer:'Podgląd'};
  saveAdminData();
  logChange('Uprawnienia','Zmieniono uprawnienie: '+permLabel+' dla roli '+(roleNames[role]||role));
  buildAdmin();
  showToast('Uprawnienia zapisane','ok');
}
function admUsers(){
  try{return JSON.parse(DataStore.getValue('oc_users_v1','[]')||'[]')||[];}catch(e){return [];}
}
function admSaveUsers(users){
  DataStore.setValue('oc_users_v1',JSON.stringify(users));
  if(window.currentUserData){
    var cur=users.find(function(u){return u.id===window.currentUserData.id;});
    if(cur){window.currentUserData=cur;adminData.access.role=cur.r;saveAdminData();updateRoleBadge();}
  }
}
var admProfilesCache=null;
var admProfilesLoading=false;
function admCreateProfileHtml(roleOpts){
  if(!DataStore.createProfile) return '';
  var leaders=getActiveAdminItems('assessors');
  var roleOptions=Object.keys(roleOpts).map(function(k){return '<option value="'+k+'" '+(k==='viewer'?'selected':'')+'>'+roleOpts[k]+'</option>';}).join('');
  var scopeOptions='<option value="">Brak zakresu</option>'+leaders.map(function(name){return '<option value="'+escHtml(name)+'">'+escHtml(name)+'</option>';}).join('');
  return '<div class="adm-create-user" style="border:1px solid var(--border);border-radius:8px;background:var(--surface);padding:12px;margin-bottom:12px">'+
    '<div class="adm-section-head" style="padding:0;margin-bottom:10px"><div><h4>Dodaj konto Supabase</h4><p>Admin tworzy konto Auth i profil w jednym kroku. Bez hasła zostanie wysłane zaproszenie email.</p></div></div>'+
    '<div class="adm-grid compact">'+
      '<label class="rep-flbl">Email<input class="adm-search" id="adm-new-email" type="email" placeholder="email@firma.pl"></label>'+
      '<label class="rep-flbl">Imię i nazwisko<input class="adm-search" id="adm-new-name" type="text" placeholder="Nazwa użytkownika"></label>'+
      '<label class="rep-flbl">Rola<select class="rep-sel" id="adm-new-role">'+roleOptions+'</select></label>'+
      '<label class="rep-flbl">Zakres lidera<select class="rep-sel" id="adm-new-scope">'+scopeOptions+'</select></label>'+
      '<label class="rep-flbl">Hasło tymczasowe<input class="adm-search" id="adm-new-password" type="password" placeholder="opcjonalnie"></label>'+
    '</div>'+
    '<div style="margin-top:10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap"><button class="btn btn-primary btn-sm" onclick="admCreateProfile()">Dodaj konto</button><span class="adm-item-sub">Wymaga wdrożonej funkcji Supabase Edge: admin-users.</span></div>'+
  '</div>';
}
function admProfilesHtml(roleOpts){
  if(!DataStore.fetchProfiles){
    return '<div class="adm-empty">Integracja profili Supabase jest niedostępna.</div>';
  }
  if(!admProfilesCache && !admProfilesLoading){
    admProfilesLoading=true;
    DataStore.fetchProfiles().then(function(rows){
      admProfilesCache=rows||[];
      admProfilesLoading=false;
      buildAdmin();
    }).catch(function(e){
      console.warn('[Admin] Profile Supabase:',e);
      admProfilesLoading=false;
      admProfilesCache=[];
      buildAdmin();
      showToast('Nie udało się pobrać profili użytkowników','err');
    });
  }
  if(admProfilesLoading || !admProfilesCache){
    return '<div class="adm-empty">Ładowanie profili Supabase...</div>';
  }
  var leaders=getActiveAdminItems('assessors');
  var roleSelect=function(id,role){
    return '<select id="adm-prof-role-'+id+'">'+Object.keys(roleOpts).map(function(k){return '<option value="'+k+'" '+(role===k?'selected':'')+'>'+roleOpts[k]+'</option>';}).join('')+'</select>';
  };
  var scopeSelect=function(id,scope){
    return '<select id="adm-prof-scope-'+id+'"><option value="">Brak zakresu</option>'+leaders.map(function(name){return '<option value="'+escHtml(name)+'" '+(String(scope||'')===String(name)?'selected':'')+'>'+escHtml(name)+'</option>';}).join('')+'</select>';
  };
  var rows=admProfilesCache.map(function(p){
    var id=String(p.id);
    var arg=JSON.stringify(id);
    return '<tr>'+
      '<td><strong>'+escHtml(p.email||'')+'</strong><div class="adm-item-sub">'+escHtml(id)+'</div></td>'+
      '<td><input id="adm-prof-name-'+id+'" value="'+escHtml(p.full_name||'')+'" placeholder="Imię i nazwisko"></td>'+
      '<td>'+roleSelect(id,p.role||'viewer')+'</td>'+
      '<td>'+scopeSelect(id,p.leader_scope||'')+'</td>'+
      '<td><label class="perm-cell"><input type="checkbox" id="adm-prof-active-'+id+'" '+(p.is_active!==false?'checked':'')+'> Aktywny</label></td>'+
      '<td class="r"><button class="adm-btn" onclick="admSaveProfile('+arg+')">Zapisz</button></td>'+
    '</tr>';
  }).join('');
  return admCreateProfileHtml(roleOpts)+'<div class="adm-table-wrap"><table class="org-table adm-users-table"><thead><tr><th>Email</th><th>Nazwa</th><th>Rola</th><th>Zakres lidera</th><th>Status</th><th></th></tr></thead><tbody>'+
    (rows||'<tr><td colspan="6"><div class="adm-empty">Brak profili. Użytkownik pojawi się tu po pierwszym logowaniu lub po utworzeniu w Supabase Auth.</div></td></tr>')+
    '</tbody></table></div>'+
    '<div class="adm-user-add"><button class="btn btn-outline btn-sm" onclick="admReloadProfiles()">Odśwież profile</button><div class="adm-item-sub" style="margin-top:8px">Oceniator zarządza profilem, rolą, zakresem i aktywnością kont Supabase.</div></div>';
}
function admReloadProfiles(){
  admProfilesCache=null;
  admProfilesLoading=false;
  buildAdmin();
}
async function admSaveProfile(id){
  if(!can('adminConfig')) return;
  var profile={
    id:id,
    full_name:(document.getElementById('adm-prof-name-'+id)?.value||'').trim(),
    role:document.getElementById('adm-prof-role-'+id)?.value||'viewer',
    leader_scope:document.getElementById('adm-prof-scope-'+id)?.value||'',
    is_active:!!document.getElementById('adm-prof-active-'+id)?.checked
  };
  try{
    var saved=await DataStore.updateProfile(profile);
    if(DataStore.fetchProfiles){
      admProfilesCache=await DataStore.fetchProfiles();
      saved=(admProfilesCache||[]).find(function(p){return String(p.id)===String(id);})||saved;
    }else{
      admProfilesCache=(admProfilesCache||[]).map(function(p){return String(p.id)===String(id)?saved:p;});
    }
    if(window.currentUserData && String(window.currentUserData.id)===String(id)){
      window.currentUserData.n=saved.full_name||saved.email||'';
      window.currentUserData.r=saved.role||'viewer';
      window.currentUserData.leaderScope=saved.leader_scope||'';
      window.currentUserData.leaderId=saved.leader_scope?idForAdminItem('assessors',saved.leader_scope):'';
      adminData.access.role=window.currentUserData.r;
      updateRoleBadge();
    }
    logChange('Użytkownicy','Zmieniono profil: '+(saved.email||id));
    buildAdmin();
    showToast('Profil zapisany: '+(saved.role||profile.role),'ok');
  }catch(e){
    console.warn('[Admin] Zapis profilu:',e);
    var msg=(e&&e.message)?e.message:String(e||'Nieznany błąd');
    showToast('Nie udało się zapisać profilu: '+msg,'err');
  }
}
async function admCreateProfile(){
  if(!can('adminConfig')) return;
  var email=(document.getElementById('adm-new-email')?.value||'').trim();
  var password=document.getElementById('adm-new-password')?.value||'';
  var profile={
    email:email,
    password:password,
    full_name:(document.getElementById('adm-new-name')?.value||'').trim(),
    role:document.getElementById('adm-new-role')?.value||'viewer',
    leader_scope:document.getElementById('adm-new-scope')?.value||'',
    is_active:true
  };
  if(!email || email.indexOf('@')<1){showToast('Podaj poprawny email.','err');return;}
  if(password && password.length<8){showToast('Hasło musi mieć minimum 8 znaków.','err');return;}
  try{
    await DataStore.createProfile(profile);
    admProfilesCache=null;
    buildAdmin();
    showToast('Konto zostało utworzone.','ok');
  }catch(e){
    console.warn('[Admin] Tworzenie konta Supabase:',e);
    showToast('Nie udało się utworzyć konta. Sprawdź Edge Function admin-users.','err');
  }
}
function admUsersHtml(roleOpts){
  if(DataStore.isRemote && DataStore.isRemote()) return admProfilesHtml(roleOpts);
  var users=admUsers();
  var leaders=getActiveAdminItems('assessors');
  var roleSelect=function(id,role){
    return '<select id="adm-user-role-'+id+'">'+Object.keys(roleOpts).map(function(k){return '<option value="'+k+'" '+(role===k?'selected':'')+'>'+roleOpts[k]+'</option>';}).join('')+'</select>';
  };
  var leaderSelect=function(id,leaderId){
    return '<select id="adm-user-leader-'+id+'"><option value="">Brak przypisania</option>'+leaders.map(function(name){var lid=idForAdminItem('assessors',name);return '<option value="'+escHtml(lid)+'" '+(String(leaderId||'')===String(lid)?'selected':'')+'>'+escHtml(name)+'</option>';}).join('')+'</select>';
  };
  var rows=users.map(function(u){
    return '<tr><td><input id="adm-user-login-'+u.id+'" value="'+escHtml(u.l||'')+'"></td>'+
      '<td><input id="adm-user-name-'+u.id+'" value="'+escHtml(u.n||'')+'"></td>'+
      '<td><input id="adm-user-pass-'+u.id+'" value="'+escHtml(u.p||'')+'"></td>'+
      '<td>'+roleSelect(u.id,u.r)+'</td><td>'+leaderSelect(u.id,u.leaderId)+'</td>'+
      '<td class="r"><button class="adm-btn" onclick="admSaveUser('+u.id+')">Zapisz</button><button class="adm-btn del" onclick="admDeleteUser('+u.id+')">Usuń</button></td></tr>';
  }).join('');
  return '<div class="adm-table-wrap"><table class="org-table adm-users-table"><thead><tr><th>Login</th><th>Nazwa</th><th>Hasło</th><th>Rola</th><th>Lider / zakres</th><th></th></tr></thead><tbody>'+
    (rows||'<tr><td colspan="6"><div class="adm-empty">Brak kont użytkowników.</div></td></tr>')+
    '</tbody></table></div><div class="adm-user-add"><button class="btn btn-primary btn-sm" onclick="admAddUser()">Dodaj konto</button></div>';
}
function admSaveUser(id){
  if(!can('adminConfig')) return;
  var users=admUsers();
  var u=users.find(function(x){return x.id===id;});
  if(!u) return;
  u.l=(document.getElementById('adm-user-login-'+id)?.value||'').trim();
  u.n=(document.getElementById('adm-user-name-'+id)?.value||'').trim();
  u.p=document.getElementById('adm-user-pass-'+id)?.value||'';
  u.r=document.getElementById('adm-user-role-'+id)?.value||'viewer';
  u.leaderId=document.getElementById('adm-user-leader-'+id)?.value||'';
  u.leaderScope=nameForAdminId('assessors',u.leaderId)||'';
  if((u.r==='leader'||u.r==='assessor')&&u.leaderScope&&!u.n) u.n=u.leaderScope;
  admSaveUsers(users);
  logChange('Użytkownicy','Zmieniono konto: '+(u.l||u.n||id));
  buildAdmin();
  showToast('Konto zapisane','ok');
}
function admAddUser(){
  if(!can('adminConfig')) return;
  var users=admUsers();
  var id=Date.now();
  users.push({id:id,l:'user'+users.length,p:'haslo123',r:'viewer',n:'Nowy użytkownik',leaderId:'',leaderScope:''});
  admSaveUsers(users);
  logChange('Użytkownicy','Dodano konto');
  buildAdmin();
}
function admDeleteUser(id){
  if(!can('adminConfig')) return;
  var users=admUsers();
  var u=users.find(function(x){return x.id===id;});
  if(!u||u.l==='admin'){showToast('Tego konta nie można usunąć','warn');return;}
  admSaveUsers(users.filter(function(x){return x.id!==id;}));
  logChange('Użytkownicy','Usunięto konto: '+(u.l||id));
  buildAdmin();
}
function admSaveGoals(){
  if(!can('adminConfig')){showToast('Brak uprawnień','warn');buildAdmin();return;}
  normalizeAdminData();
  adminData.goals.callsPerPeriod=Math.max(1,parseInt(document.getElementById('adm-goal-calls')?.value||9));
  adminData.goals.mailsPerPeriod=Math.max(1,parseInt(document.getElementById('adm-goal-mails')?.value||adminData.goals.callsPerPeriod||9));
  adminData.goals.systemsPerPeriod=Math.max(1,parseInt(document.getElementById('adm-goal-systems')?.value||adminData.goals.callsPerPeriod||9));
  adminData.goals.minAvg=Math.max(1,Math.min(100,parseInt(document.getElementById('adm-goal-avg')?.value||92)));
  adminData.goals.greatShare=Math.max(0,Math.min(100,parseInt(document.getElementById('adm-goal-great')?.value||60)));
  GOAL=adminData.goals.callsPerPeriod;
  DataStore.setGoal(GOAL);
  saveAdminData();
  logChange('Cele','Zmieniono cele jakościowe');
  // odśwież wszystkie widoki używające celów
  ['r','m','s'].forEach(refreshSpecContext);
  var dashPanel=document.getElementById('tab-dashboard');
  if(dashPanel&&dashPanel.classList.contains('on')) buildDashboard();
  showToast('Cele zapisane','ok');
}
function admAddPeriod(){
  if(!can('adminConfig')) return;
  normalizeAdminData();
  adminData.periods.push({code:'PX',name:'Nowy okres',from:'01-01',to:'01-31'});
  saveAdminData();logChange('Okresy','Dodano okres rozliczeniowy');buildAdmin();
}
function admPeriodSet(i,key,val){
  if(!can('adminConfig')) return;
  normalizeAdminData();
  if(adminData.periods[i]){adminData.periods[i][key]=val;saveAdminData();logChange('Okresy','Zmieniono okres: '+(adminData.periods[i].name||adminData.periods[i].code));}
}
function admDelPeriod(i){
  if(!can('adminConfig')) return;
  normalizeAdminData();
  var p=adminData.periods[i];if(!p) return;
  adminData.periods.splice(i,1);saveAdminData();logChange('Okresy','Usunięto okres: '+(p.name||p.code));buildAdmin();
}

var admSelectedLeader='';

function adminScopedRows(){
  return scopedRegistry().filter(function(e){return !entryIsArchived(e);});
}
function adminTeamCards(){
  var rows=adminScopedRows();
  var byLeader={};
  activePeople().forEach(function(p){
    var key=p.leaderId||idForAdminItem('assessors',p.leader||'Bez lidera');
    if(!byLeader[key]) byLeader[key]={id:key,leader:p.leader||'Bez lidera',department:p.department||'',people:[],cards:0,sum:0,below:0,great:0};
    byLeader[key].people.push(p);
  });
  rows.forEach(function(e){
    var key=entryLeaderId(e)||idForAdminItem('assessors',e.oce||'Bez lidera');
    if(!byLeader[key]) byLeader[key]={id:key,leader:e.oce||nameForAdminId('assessors',key)||'Bez lidera',department:e.dzial||'',people:[],cards:0,sum:0,below:0,great:0};
    byLeader[key].cards++;
    byLeader[key].sum+=e.avgFinal||0;
    if(e.rating==='below') byLeader[key].below++;
    if(e.rating==='great') byLeader[key].great++;
    if(!byLeader[key].department&&e.dzial) byLeader[key].department=e.dzial;
  });
  return Object.values(byLeader).sort(function(a,b){return a.leader.localeCompare(b.leader,'pl');});
}
function adminTeamHtml(){
  var teams=adminTeamCards();
  if(!teams.length) return '<div class="adm-empty">Brak zespołów do pokazania.</div>';
  if(!admSelectedLeader || !teams.some(function(t){return t.leader===admSelectedLeader;})) admSelectedLeader=teams[0].leader;
  var opts=teams.map(function(t){return '<option value="'+escHtml(t.leader)+'" '+(t.leader===admSelectedLeader?'selected':'')+'>'+escHtml(t.leader)+'</option>';}).join('');
  var t=teams.find(function(x){return x.leader===admSelectedLeader;})||teams[0];
  var avg=t.cards?Math.round(t.sum/t.cards):0;
  var col=avg>=92?'var(--green)':avg>=82?'var(--amber)':'var(--red)';
  var people=t.people.map(function(p){
    var idx=adminData.people.indexOf(p);
    return '<tr><td><strong>'+escHtml(p.name)+'</strong><div class="adm-item-sub">'+getSpecStats(p.name)+'</div></td>'+
      '<td>'+escHtml(p.position||'—')+'</td>'+
      '<td><span class="lock-badge '+(p.active===false?'locked':'')+'" onclick="admTogglePerson('+idx+')">'+(p.active===false?'Nieaktywny':'Aktywny')+'</span></td>'+
      '<td class="r"><button class="adm-btn" onclick="admEditPerson('+idx+')" '+(!can('adminConfig')?'disabled':'')+'>Edytuj</button></td></tr>';
  }).join('');
  return '<div class="adm-team-picker"><label>Wybierz zespół</label><select id="adm-team-select" onchange="admSelectTeam(this.value)">'+opts+'</select></div>'+
    '<div class="adm-team-detail">'+
      '<div class="adm-team-summary"><div><div class="adm-team-name">'+escHtml(t.leader)+'</div><div class="adm-team-sub">'+escHtml(t.department||'Dział nieprzypisany')+'</div></div><div class="adm-team-score" style="color:'+col+'">'+(t.cards?avg+'%':'—')+'</div></div>'+
      '<div class="adm-team-table-wrap"><table class="org-table adm-team-table"><thead><tr><th>Specjalista</th><th>Stanowisko</th><th>Status</th><th></th></tr></thead><tbody>'+(people||'<tr><td colspan="4"><div class="adm-empty">Brak specjalistów w zespole.</div></td></tr>')+'</tbody></table></div>'+
    '</div>';
}
function admSelectTeam(leader){
  admSelectedLeader=leader||'';
  buildAdmin();
  var el=document.getElementById('adm-team-select');
  if(el) el.scrollIntoView({block:'nearest'});
}
function adminOrgHtmlLegacyUnused(){
  var teams=adminTeamCards();
  if(!teams.length) return '<div class="adm-empty">Brak zespołów do pokazania.</div>';
  var byDept={};
  teams.forEach(function(t){
    var dep=t.department||'Dział nieprzypisany';
    if(!byDept[dep]) byDept[dep]=[];
    byDept[dep].push(t);
  });
  return Object.keys(byDept).sort(function(a,b){return a.localeCompare(b,'pl');}).map(function(dep){
    return '<div class="adm-org-band"><div class="adm-org-band-head"><div><strong>'+escHtml(dep)+'</strong><span>'+byDept[dep].length+' zespołów</span></div></div>'+
      '<div class="adm-org-team-grid">'+byDept[dep].map(function(t){
        var avg=t.cards?Math.round(t.sum/t.cards):0;
        var col=avg>=92?'var(--green)':avg>=82?'var(--amber)':'var(--red)';
        var people=t.people.slice(0,5).map(function(p){
          var idx=adminData.people.indexOf(p);
          return '<button class="adm-org-person" onclick="admEditPerson('+idx+')" '+(!can('adminConfig')?'disabled':'')+'><span>'+escHtml(p.name)+'</span><small>'+escHtml(p.position||'Brak stanowiska')+'</small></button>';
        }).join('');
        return '<article class="adm-org-team-card">'+
          '<div class="adm-org-team-top"><div><div class="adm-org-leader">'+escHtml(t.leader)+'</div><div class="adm-item-sub">'+t.people.length+' specjalistów · '+t.cards+' kart</div></div><strong style="color:'+col+'">'+(t.cards?avg+'%':'—')+'</strong></div>'+
          '<div class="adm-org-team-kpis"><span>'+t.great+' bardzo dobrych</span><span>'+t.below+' poniżej</span></div>'+
          '<div class="adm-org-people">'+(people||'<div class="adm-empty">Brak specjalistów.</div>')+(t.people.length>5?'<div class="adm-org-more">+'+(t.people.length-5)+' kolejnych</div>':'')+'</div>'+
        '</article>';
      }).join('')+'</div></div>';
  }).join('');
}
function adminOrgHtml(){
  var teams=adminTeamCards();
  if(!teams.length) return '<div class="adm-empty">Brak zespołów do pokazania.</div>';
  var byDept={};
  teams.forEach(function(t){
    var dep=t.department||'Dział nieprzypisany';
    if(!byDept[dep]) byDept[dep]=[];
    byDept[dep].push(t);
  });
  return Object.keys(byDept).sort(function(a,b){return a.localeCompare(b,'pl');}).map(function(dep){
    var openAttr='';
    return '<details class="adm-org-band"'+openAttr+'><summary class="adm-org-band-head"><div><strong>'+escHtml(dep)+'</strong><span>'+byDept[dep].length+' zespołów</span></div><b class="adm-org-chev">⌄</b></summary>'+
      '<div class="adm-org-team-grid">'+byDept[dep].map(function(t){
        var people=t.people.slice(0,5).map(function(p){
          var idx=adminData.people.indexOf(p);
          return '<button class="adm-org-person" onclick="admEditPerson('+idx+')" '+(!can('adminConfig')?'disabled':'')+'><span>'+escHtml(p.name)+'</span><small>'+escHtml(p.position||'Brak stanowiska')+'</small></button>';
        }).join('');
        return '<article class="adm-org-team-card">'+
          '<div class="adm-org-team-top"><div><div class="adm-org-leader">'+escHtml(t.leader)+'</div><div class="adm-item-sub">'+t.people.length+' specjalistów · '+t.cards+' kart</div></div><button class="adm-team-manage" onclick="admOpenTeamModal(\''+escHtml(t.id)+'\')" '+(!can('adminConfig')?'disabled':'')+'>Zobacz/Edytuj zespół</button></div>'+
          '<div class="adm-org-team-kpis"><span>'+t.great+' bardzo dobrych</span><span>'+t.below+' poniżej</span></div>'+
          '<div class="adm-org-people">'+(people||'<div class="adm-empty">Brak specjalistów.</div>')+(t.people.length>5?'<div class="adm-org-more">+'+(t.people.length-5)+' kolejnych</div>':'')+'</div>'+
        '</article>';
      }).join('')+'</div></details>';
  }).join('');
}
function admOpenTeamModal(teamId){
  if(!can('adminConfig')){showToast('Brak uprawnień','warn');return;}
  normalizeAdminData();
  var team=adminTeamCards().find(function(t){return String(t.id)===String(teamId);});
  if(!team){showToast('Nie znaleziono zespołu','warn');return;}
  var old=document.getElementById('adm-team-modal');if(old) old.remove();
  var rows=team.people.map(function(p){
    var idx=adminData.people.indexOf(p);
    return '<tr><td><strong>'+escHtml(p.name)+'</strong><div class="adm-item-sub">'+escHtml(p.position||'Brak stanowiska')+'</div></td>'+
      '<td>'+escHtml(p.department||'—')+'</td>'+
      '<td><span class="lock-badge '+(p.active===false?'locked':'')+'" onclick="admTogglePerson('+idx+')">'+(p.active===false?'Nieaktywny':'Aktywny')+'</span></td>'+
      '<td class="r"><button class="adm-btn" onclick="admEditPerson('+idx+')">Edytuj</button></td></tr>';
  }).join('');
  var div=document.createElement('div');
  div.id='adm-team-modal';
  div.className='modal-overlay open';
  div.innerHTML='<div class="modal adm-team-modal">'+
    '<h3>'+escHtml(team.leader)+'</h3>'+
    '<p>'+escHtml(team.department||'Dział nieprzypisany')+' · '+team.people.length+' specjalistów · '+team.cards+' kart</p>'+
    '<div class="adm-team-modal-actions"><button class="btn btn-primary btn-sm" onclick="admNewPerson()">Dodaj specjalistę</button></div>'+
    '<div class="adm-table-wrap adm-team-modal-table"><table class="org-table adm-team-table"><thead><tr><th>Specjalista</th><th>Dział</th><th>Status</th><th></th></tr></thead><tbody>'+(rows||'<tr><td colspan="4"><div class="adm-empty">Brak specjalistów w zespole.</div></td></tr>')+'</tbody></table></div>'+
    '<div class="modal-btns"><button class="btn btn-outline btn-sm" onclick="admCloseTeamModal()">Zamknij</button></div>'+
  '</div>';
  document.body.appendChild(div);
}
function admCloseTeamModal(){var el=document.getElementById('adm-team-modal');if(el) el.remove();}
function adminDictionaryCard(d){
  var cnt=getActiveAdminItems(d.key).length, ac=(adminData.archived[d.key]||[]).length;
  var addBtn=d.key==='specialists'
    ? '<button class="btn btn-primary btn-sm" onclick="admNewPerson()" '+(!can('adminConfig')?'disabled':'')+'>Dodaj specjalistę</button>'
    : '<button class="btn btn-outline btn-sm" onclick="admFocusDict(\''+d.key+'\',\''+d.inp+'\')" '+(!can('adminConfig')?'disabled':'')+'>Dodaj</button>';
  return '<section class="adm-panel">'+
    '<div class="adm-panel-hdr"><div><h3>'+d.icon+' '+d.label+'</h3><p>'+cnt+' aktywnych, '+ac+' w archiwum</p></div>'+addBtn+'</div>'+
    '<div class="adm-panel-body">'+
      '<input type="text" class="adm-search" id="adms-'+d.key+'" placeholder="Szukaj..." oninput="admFilter(\''+d.key+'\',this.value)">'+
      '<div class="adm-list" id="adml-'+d.key+'"></div>'+
      (d.key==='specialists'?'':'<div class="adm-add"><input type="text" id="'+d.inp+'" placeholder="'+d.ph+'"><button class="btn btn-primary btn-sm" data-k="'+d.key+'" data-i="'+d.inp+'" onclick="admAdd(this)" '+(!can('adminConfig')?'disabled':'')+'>Zapisz</button></div>')+
    '</div></section>';
}
function admFocusDict(key,inputId){
  var inp=document.getElementById(inputId);
  if(inp){inp.focus();inp.select();}
}

function buildAdmin(){
  normalizeAdminData();
  var wrap=document.getElementById('wrap-admin');
  if(!wrap) return;
  var rows=adminScopedRows();
  var total=rows.length;
  var archived=scopedRegistry().filter(function(e){return entryIsArchived(e);}).length;
  var people=activePeople();
  var tablePeople=(activeLeaderScope()?activePeople():adminData.people.filter(function(p){return p&&p.name;}))
    .map(function(p){return {person:p,idx:adminData.people.indexOf(p)};});
  var leaders=getActiveAdminItems('assessors'), deps=getActiveAdminItems('departments'), pos=getActiveAdminItems('positions');
  var activeLeaderCount=adminTeamCards().filter(function(t){return t.people.length>0;}).length;
  var avg=total?Math.round(rows.reduce(function(a,b){return a+(b.avgFinal||0);},0)/total):0;
  var roleKeys=['admin','director','leader','assessor','viewer'];
  var roleOpts={admin:'Administrator',director:'Dyrektor',leader:'Lider',assessor:'Oceniający',viewer:'Podgląd'};
  var dicts=[
    {key:'assessors',icon:'👤',label:'Liderzy / oceniający',inp:'adm-inp-assessors',ph:'Imię i nazwisko lidera'},
    {key:'specialists',icon:'👥',label:'Specjaliści',inp:'adm-inp-specialists',ph:'Imię i nazwisko specjalisty'},
    {key:'departments',icon:'🏢',label:'Działy',inp:'adm-inp-departments',ph:'Nazwa działu'},
    {key:'positions',icon:'💼',label:'Stanowiska',inp:'adm-inp-positions',ph:'Nazwa stanowiska'}
  ];
  var h='';
  h+='<div class="adm-shell">';
  h+='<section class="adm-hero">';
  h+='<div><div class="adm-kicker">Administracja</div><h2>Struktura i ustawienia Oceniatora</h2><p>Zarządzaj zespołami, słownikami, celami i okresami. Dane w tym panelu zasilają formularze, raporty i widoki liderów.</p></div>';
  if(can('adminConfig')){
    h+='<div class="adm-role-box"><label>Tryb dostępu</label><select id="adm-role" onchange="admSetRole(this.value)">'+Object.keys(roleOpts).map(function(k){return '<option value="'+k+'" '+(activeRole()===k?'selected':'')+'>'+roleOpts[k]+'</option>';}).join('')+'</select></div>';
  }
  h+='</section>';

  h+='<section class="adm-metrics">';
  h+='<div><strong>'+people.length+'</strong><span>Specjalistów</span></div>';
  h+='<div><strong>'+activeLeaderCount+'</strong><span>Aktywnych liderów</span></div>';
  h+='<div><strong>'+total+'</strong><span>Aktywnych kart</span></div>';
  h+='<div><strong>'+archived+'</strong><span>W archiwum</span></div>';
  h+='<div><strong>'+(total?avg+'%':'—')+'</strong><span>Średni wynik</span></div>';
  h+='</section>';

  h+='<section class="adm-section">';
  h+='<div class="adm-section-head"><div><h3>Użytkownicy i konta</h3><p>Login, hasło, rola oraz zakres lidera są konfigurowane w jednym miejscu.</p></div></div>';
  h+=admUsersHtml(roleOpts);
  h+='</section>';
  h+=admSupabaseToolsHtml();

  h+='<section class="adm-section"><div class="adm-section-head"><div><h3>Zespoły liderów</h3><p>Działy są zwinięte, a zespołem zarządzasz z poziomu przycisku na kaflu.</p></div>'+(DataStore.isRemote&&DataStore.isRemote()?'':'<button class="btn btn-outline btn-sm" onclick="loadSeedData()">Wczytaj demo</button>')+'</div><div class="adm-team-single">'+adminOrgHtml()+'</div>';
  h+='</section>';

  h+='<section class="adm-section">';
  h+='<div class="adm-section-head"><div><h3>Specjaliści i przypisania</h3><p>Dodawanie i edycja odbywa się w oknie z kompletem danych osoby.</p></div><div class="adm-head-actions"><button class="btn btn-primary btn-sm" onclick="admNewPerson()" '+(!can('adminConfig')?'disabled':'')+'>Dodaj specjalistę</button><button class="btn btn-outline btn-sm" onclick="admSync()">Synchronizuj z ewidencją</button></div></div>';
  h+='<div class="adm-table-wrap"><table class="org-table adm-org-table"><thead><tr><th>Specjalista</th><th>Lider</th><th>Dział</th><th>Stanowisko</th><th>Status</th><th></th></tr></thead><tbody>';
  h+=tablePeople.length?tablePeople.map(function(row){
    var p=row.person,i=row.idx;
    return '<tr><td><strong>'+escHtml(p.name)+'</strong><div class="adm-item-sub">'+getSpecStats(p.name)+'</div></td>'+
      '<td>'+escHtml(p.leader||'—')+'</td><td>'+escHtml(p.department||'—')+'</td><td>'+escHtml(p.position||'—')+'</td>'+
      '<td><span class="lock-badge '+(p.active===false?'locked':'')+'" onclick="admTogglePerson('+i+')">'+(p.active===false?'Nieaktywny':'Aktywny')+'</span></td>'+
      '<td class="r"><button class="adm-btn" onclick="admEditPerson('+i+')" '+(!can('adminConfig')?'disabled':'')+'>Edytuj</button></td></tr>';
  }).join(''):'<tr><td colspan="6"><div class="adm-empty">Brak przypisań.</div></td></tr>';
  h+='</tbody></table></div></section>';

  h+='<div class="adm-two-col">';
  h+='<section class="adm-section"><div class="adm-section-head"><div><h3>Słowniki</h3><p>Listy używane w formularzach i filtrach.</p></div></div><div class="adm-dict-grid">'+dicts.map(adminDictionaryCard).join('')+'</div></section>';
  h+='<section class="adm-section"><div class="adm-section-head"><div><h3>Cele i okresy</h3><p>Konfiguracja dashboardu oraz kontekstu specjalisty.</p></div></div>';
  h+='<div class="adm-goals">';
  h+='<label>Rozmów / period<input type="number" min="1" max="50" id="adm-goal-calls" value="'+adminData.goals.callsPerPeriod+'" onchange="admSaveGoals()"></label>';
  h+='<label>Maili / period<input type="number" min="1" max="50" id="adm-goal-mails" value="'+adminData.goals.mailsPerPeriod+'" onchange="admSaveGoals()"></label>';
  h+='<label>Działań / period<input type="number" min="1" max="50" id="adm-goal-systems" value="'+adminData.goals.systemsPerPeriod+'" onchange="admSaveGoals()"></label>';
  h+='<label>Min. średnia %<input type="number" min="1" max="100" id="adm-goal-avg" value="'+adminData.goals.minAvg+'" onchange="admSaveGoals()"></label>';
  h+='<label>Udział bardzo dobrych %<input type="number" min="0" max="100" id="adm-goal-great" value="'+adminData.goals.greatShare+'" onchange="admSaveGoals()"></label>';
  h+='</div>';
  h+='<div class="adm-period-head"><strong>Okresy rozliczeniowe</strong><button class="adm-btn" onclick="admAddPeriod()" '+(!can('adminConfig')?'disabled':'')+'>Dodaj okres</button></div>';
  h+='<div class="adm-period-list">';
  adminData.periods.forEach(function(p,i){
    h+='<div class="adm-period-row"><input value="'+escHtml(p.code)+'" onchange="admPeriodSet('+i+',\'code\',this.value)"><input value="'+escHtml(p.name)+'" onchange="admPeriodSet('+i+',\'name\',this.value)"><input value="'+escHtml(p.from)+'" onchange="admPeriodSet('+i+',\'from\',this.value)"><input value="'+escHtml(p.to)+'" onchange="admPeriodSet('+i+',\'to\',this.value)"><button class="adm-btn del" onclick="admDelPeriod('+i+')" '+(!can('adminConfig')?'disabled':'')+'>Usuń</button></div>';
  });
  h+='</div></section></div>';

  h+='<section class="adm-section"><div class="adm-section-head"><div><h3>Uprawnienia i historia</h3><p>Matryca dostępu oraz ostatnie zmiany w konfiguracji.</p></div><button class="btn btn-outline btn-sm" onclick="admExport()">Eksportuj konfigurację</button></div>';
  h+='<div class="adm-bottom-grid">';
  h+='<details class="adm-perm-details"><summary>Rozwiń widok uprawnień</summary><div class="perm-grid adm-perm-grid"><div class="perm-head">Akcja</div>'+roleKeys.map(function(role){return '<div class="perm-head">'+roleOpts[role]+'</div>';}).join('');
  PERM_LABELS.forEach(function(row){
    h+='<div>'+row[1]+'</div>';
    roleKeys.forEach(function(role){
      var ok=getRolePerms(role).indexOf(row[0])>-1;
      if(can('adminConfig')){
        h+='<label class="perm-cell"><input type="checkbox" '+(ok?'checked':'')+' onchange="admToggleRolePerm(\''+role+'\',\''+row[0]+'\')"> '+(ok?'Tak':'Brak')+'</label>';
      } else {
        h+='<div class="'+(ok?'perm-yes':'perm-no')+'">'+(ok?'Dostęp':'Blokada')+'</div>';
      }
    });
  });
  h+='</div></details>';
  h+='<div class="adm-history">'+(adminData.history.length?adminData.history.slice(0,12).map(function(x){return '<div class="adm-item"><div><div class="adm-item-name">'+escHtml(x.type)+' · '+escHtml(x.desc)+'</div><div class="adm-item-sub">'+new Date(x.ts).toLocaleString('pl-PL')+' · '+escHtml((roleOpts[x.role]||x.role))+'</div></div></div>';}).join(''):'<div class="adm-empty">Brak historii zmian.</div>')+'</div>';
  h+='</div></section>';
  h+='</div>';
  wrap.innerHTML=h;
  dicts.forEach(function(d){var inp=document.getElementById(d.inp);if(inp){var k=d.key,i=d.inp;inp.addEventListener('keydown',function(e){if(e.key==='Enter')admAddKey(k,i);});}});
  renderAdmLists();
}


