/* ══════════════════════════════════════════════
   ADMIN — admin panel, dictionaries, roles, goals, periods
══════════════════════════════════════════════ */

// ══════════════════════════════════════════════
// ADMIN PANEL
// ══════════════════════════════════════════════

function escHtml(v){
  return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});
}
function optsHtml(items,sel){
  return '<option value="">— wybierz —</option>'+items.map(function(v){return '<option value="'+escHtml(v)+'" '+(v===sel?'selected':'')+'>'+escHtml(v)+'</option>';}).join('');
}
function getSpecStats(spec){
  var n=registry.filter(function(e){return e.spec===spec;}).length;
  if(!n) return 'Brak kart';
  var avg=Math.round(registry.filter(function(e){return e.spec===spec;}).reduce(function(a,b){return a+b.avgFinal;},0)/n);
  return n+' kart · śr. '+avg+'%';
}
function getAssessorStats(oce){
  var n=registry.filter(function(e){return e.oce===oce;}).length;
  return n?n+' ocen':'Brak ocen';
}
function loadAdminData(){
  try{
    var raw=localStorage.getItem(ADMIN_KEY);
    if(raw){
      var p=JSON.parse(raw);
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
  try{localStorage.setItem(ADMIN_KEY,JSON.stringify(adminData));}catch(e){}
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
}
function buildAdmin(){
  normalizeAdminData();
  var wrap=document.getElementById('wrap-admin');
  if(!wrap) return;
  var total=registry.filter(e=>!e.archived).length;
  var archived=registry.filter(e=>e.archived).length;
  var specs=[].concat(registry.filter(e=>!e.archived)).reduce(function(s,e){s.add(e.spec);return s;},new Set()).size;
  var periods=[].concat(registry.filter(e=>!e.archived)).reduce(function(s,e){if(e.period)s.add(e.period);return s;},new Set()).size;
  var roleOpts={admin:'Administrator',leader:'Lider',assessor:'Oceniający',viewer:'Podgląd'};
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

  h+='<div class="adm-card" style="margin-bottom:14px"><div class="adm-hdr"><div><div class="adm-title">Uprawnienia per rola</div><div class="adm-item-sub">Akcje są blokowane w formularzach, ewidencji, dashboardzie i raportach zgodnie z aktywnym trybem dostępu.</div></div></div><div class="adm-body">';
  h+='<div class="perm-grid"><div class="perm-head">Akcja</div><div class="perm-head">Administrator</div><div class="perm-head">Lider</div><div class="perm-head">Oceniający</div><div class="perm-head">Podgląd</div>';
  PERM_LABELS.forEach(function(row){
    h+='<div>'+row[1]+'</div>';
    ['admin','leader','assessor','viewer'].forEach(function(role){
      var ok=(ROLE_PERMS[role]||[]).indexOf(row[0])>-1;
      h+='<div class="'+(ok?'perm-yes':'perm-no')+'">'+(ok?'✓ Dostęp':'— Blokada')+'</div>';
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
function admEditPerson(i){
  if(!can('adminConfig')){showToast('Brak uprawnień','warn');return;}
  var p=adminData.people[i];if(!p)return;
  editingPersonIdx=i;
  ['name','leader','department','position'].forEach(function(k){
    var el=document.getElementById('adm-person-'+k);
    if(el) el.value=p[k]||'';
  });
  var nameEl=document.getElementById('adm-person-name');if(nameEl){nameEl.focus();nameEl.select();}
  showToast('Edytujesz przypisanie: '+p.name,'ok');
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
function admSaveItem(key,idx){
  if(!can('adminConfig')){showToast('Brak uprawnień','warn');return;}
  var inp=document.getElementById('adm-ei-'+key+'-'+idx);
  var nv=inp?inp.value.trim():'';
  if(!nv){showToast('Nazwa nie może być pusta','err');return;}
  var old=(adminData[key]||[])[idx];
  adminData[key][idx]=nv;adminData[key].sort();
  var upd=0;
  registry.forEach(function(e){
    if(key==='assessors'&&e.oce===old){e.oce=nv;upd++;}
    if(key==='specialists'&&e.spec===old){e.spec=nv;upd++;}
    if(key==='departments'&&e.dzial===old){e.dzial=nv;upd++;}
    if(key==='positions'&&e.stand===old){e.stand=nv;upd++;}
  });
  adminData.people.forEach(function(p){
    if(key==='assessors'&&p.leader===old)p.leader=nv;
    if(key==='specialists'&&p.name===old)p.name=nv;
    if(key==='departments'&&p.department===old)p.department=nv;
    if(key==='positions'&&p.position===old)p.position=nv;
  });
  saveAdminData();if(upd)saveRegistry();logChange('Słownik','Zmieniono wpis: '+old+' → '+nv);
  buildAdmin();['r','m','s'].forEach(buildForm);showToast('Zaktualizowano'+(upd?' ('+upd+' kart)':''),'ok');
}
function admChGoal(d){
  GOAL=Math.max(1,Math.min(30,GOAL+d));
  localStorage.setItem('pep_goal',String(GOAL));
  var el=document.getElementById('adm-goal-val');if(el)el.textContent=GOAL;
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

function admSetRole(role){
  normalizeAdminData();
  adminData.access.role=role;
  saveAdminData();logChange('Dostęp','Zmieniono tryb na: '+roleLabel());
  updateRoleBadge();
  buildAdmin();renderEw();['r','m','s'].forEach(buildForm);showToast('Tryb: '+roleLabel(),'ok');
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
  localStorage.setItem('pep_goal',String(GOAL));
  saveAdminData();logChange('Cele','Zmieniono cele jakościowe');showToast('Cele zapisane','ok');
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



