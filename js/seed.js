/* ===============================================================
   SEED - demo data generator
=============================================================== */

var DEMO_SEED_VERSION = 'demo-4x12x120-current-period-2026-05-04';

function demoRand(seed){
  var x = seed % 2147483647;
  if(x <= 0) x += 2147483646;
  return function(){
    x = x * 16807 % 2147483647;
    return (x - 1) / 2147483646;
  };
}

function demoPick(arr, idx){
  return arr[idx % arr.length];
}

function buildDemoOrg(){
  var departments = [
    {
      name:'Dział Obsługi Klienta PeP',
      positions:['Specjalista ds. Obsługi Klienta','Starszy Specjalista ds. Obsługi Klienta','Młodszy Specjalista ds. Obsługi Klienta'],
      leaders:['Alicja Wrona','Mateusz Cieślak','Ewa Sobczak'],
    },
    {
      name:'Dział Rozliczeń P24',
      positions:['Specjalista ds. Rozliczeń','Starszy Specjalista ds. Rozliczeń','Młodszy Specjalista ds. Rozliczeń'],
      leaders:['Rafał Kubiak','Joanna Malinowska','Paweł Michalski'],
    },
    {
      name:'Dział Wsparcia Technicznego',
      positions:['Specjalista ds. Wsparcia Technicznego','Starszy Specjalista ds. Systemów','Młodszy Specjalista ds. Wsparcia'],
      leaders:['Magdalena Baran','Tomasz Król','Katarzyna Wójcik'],
    },
    {
      name:'Dział Operacji i Reklamacji',
      positions:['Specjalista ds. Operacji','Specjalista ds. Reklamacji','Starszy Specjalista ds. Procesów'],
      leaders:['Marcin Lis','Natalia Zielińska','Grzegorz Mazur'],
    },
  ];
  var firstNames = ['Anna','Piotr','Marta','Tomasz','Karolina','Michał','Natalia','Bartosz','Monika','Kamil','Aleksandra','Jakub','Patrycja','Adam','Dominika','Łukasz','Weronika','Daniel','Klaudia','Szymon'];
  var lastNames = ['Kowalska','Wiśniewski','Dąbrowska','Zając','Lewandowska','Kowalczyk','Szymańska','Nowak','Kamińska','Wójcik','Kaczmarek','Mazur','Piotrowska','Grabowski','Pawlak','Król','Jabłońska','Wieczorek','Stępień','Baran','Lis','Sikora','Olszewska','Czarnecki'];
  var people = [];
  var leaders = [];
  var id = 1000;

  departments.forEach(function(dep, depIdx){
    dep.leaders.forEach(function(leader, leaderIdx){
      leaders.push(leader);
      for(var i=0;i<10;i++){
        var name = firstNames[(depIdx*7 + leaderIdx*5 + i) % firstNames.length] + ' ' + lastNames[(depIdx*11 + leaderIdx*9 + i*3) % lastNames.length];
        if(people.some(function(p){return p.name === name;})){
          name += ' ' + String.fromCharCode(65 + depIdx) + (leaderIdx + 1);
        }
        people.push({
          id:id++,
          name:name,
          leader:leader,
          department:dep.name,
          position:dep.positions[i % dep.positions.length],
          active:true,
        });
      }
    });
  });

  return {
    departments:departments.map(function(d){return d.name;}),
    leaders:leaders,
    positions:departments.reduce(function(all,d){return all.concat(d.positions);},[]).filter(function(v,i,a){return a.indexOf(v)===i;}).sort(),
    people:people,
  };
}

function valueForScore(score, rnd){
  if(score >= .90) return rnd() < .88 ? 1 : (rnd() < .75 ? .5 : 'nd');
  if(score >= .78) return rnd() < .68 ? 1 : (rnd() < .72 ? .5 : 0);
  if(score >= .66) return rnd() < .45 ? 1 : (rnd() < .68 ? .5 : 0);
  return rnd() < .28 ? 1 : (rnd() < .62 ? .5 : 0);
}

function buildDemoCard(person, cardIdx, personIdx){
  var rnd = demoRand(9000 + personIdx * 37 + cardIdx * 101);
  var typeCycle = ['r','m','s','r','m','s','r','m','s','r'];
  var p = typeCycle[cardIdx % typeCycle.length];
  var def = DEFS[p];
  var contactCount = p === 'r' ? 3 + (cardIdx % 2) : (p === 'm' ? 2 + (cardIdx % 3 === 0 ? 1 : 0) : 2);
  var dates = [
    '2025-01-17','2025-02-21','2025-04-08','2025-05-16','2025-07-09',
    '2025-08-22','2025-09-18','2025-10-24','2025-12-05','2026-05-04'
  ];
  var data = dates[cardIdx];
  var leaderBias = ((personIdx % 12) - 5) * .012;
  var personBias = ((personIdx % 10) - 4) * .01;
  var trend = (cardIdx - 4) * .012;
  var base = Math.max(.58, Math.min(.99, .82 + leaderBias + personBias + trend));
  var ss = {};
  var sn = {};

  def.sections.forEach(function(sec, secIdx){
    ss[sec.key] = {};
    sn[sec.key] = Array(contactCount).fill('');
    sec.criteria.forEach(function(_, cri){
      ss[sec.key][cri] = Array.from({length:contactCount}, function(_, ci){
        var sectionBias = secIdx === 0 ? .02 : (secIdx === 1 ? 0 : -.015);
        var score = base + sectionBias + (rnd() - .5) * .16 - (cri % 5 === 0 && rnd() < .18 ? .18 : 0) + (ci % 3 === 0 ? .015 : 0);
        return valueForScore(score, rnd);
      });
    });
  });

  var results = Array.from({length:contactCount}, function(_, ci){
    var total = 0;
    var parts = {};
    var pts = {sum:0,max:0};
    def.sections.forEach(function(sec){
      var vals = sec.criteria.map(function(_, cri){return ss[sec.key][cri][ci];});
      var valid = vals.filter(function(v){return v !== 'nd';});
      var sum = valid.length ? valid.reduce(function(a,b){return a + b;}, 0) : valid.length;
      var ratio = valid.length ? sum / valid.length : 1;
      total += ratio * sec.w;
      parts[sec.key] = Math.round(ratio * 100);
      pts.sum += sum;
      pts.max += valid.length;
    });
    return {finalPct:Math.round(total * 100),parts:parts,pts:pts};
  });

  var gold = Array.from({length:contactCount}, function(_, i){return (cardIdx + i + personIdx) % 19 === 0 ? .5 : 0;});
  results = results.map(function(r, i){
    var bonus = gold[i] || 0;
    return Object.assign({}, r, {finalPct:bonus > 0 && r.finalPct < 100 ? Math.min(100, r.finalPct + bonus * 10) : r.finalPct});
  });

  var avg = Math.round(results.reduce(function(a,b){return a + b.finalPct;}, 0) / results.length);
  var secAvg = {};
  def.sections.forEach(function(sec){
    var vals = results.map(function(r){return r.parts[sec.key];});
    secAvg[sec.key] = Math.round(vals.reduce(function(a,b){return a + b;}, 0) / vals.length);
  });

  var statuses = ['submitted','review','approved','submitted','submitted','approved','review','submitted','submitted','review'];
  var status = statuses[(cardIdx + personIdx) % statuses.length];
  return {
    id:1800000000000 + personIdx * 100 + cardIdx,
    p:p,
    status:status,
    locked:status === 'approved',
    archived:status === 'archived',
    createdAt:data + 'T09:00:00.000Z',
    spec:person.name,
    stand:person.position,
    dzial:person.department,
    oce:person.leader,
    data:data,
    period:periodOf(data),
    avgFinal:avg,
    secAvg:secAvg,
    contactResults:results.map(function(r){return {pct:r.finalPct,pts:r.pts};}),
    rating:avg >= 92 ? 'great' : avg >= 82 ? 'good' : 'below',
    notes:demoPick([
      'Wynik do omówienia na najbliższym spotkaniu 1:1.',
      'Widoczna poprawa jakości w porównaniu do poprzedniego okresu.',
      'Do utrzymania standard komunikacji i kompletność zapisów.',
      'Warto dopracować konsekwencję w dokumentowaniu spraw.'
    ], personIdx + cardIdx),
    contactCount:contactCount,
    ids:Array.from({length:contactCount}, function(_, i){
      return ({r:'CALL',m:'MAIL',s:'SYS'}[p]) + '-' + data.replace(/-/g,'') + '-' + String(personIdx + 1).padStart(3,'0') + '-' + (i + 1);
    }),
    gold:gold,
    goldDesc:gold.some(function(v){return v > 0;}) ? 'Doceniono samodzielne domknięcie niestandardowej sprawy klienta.' : '',
    snapshotScores:ss,
    snapshotNotes:sn,
    statusHistory:[]
  };
}

function buildDemoRegistry(org){
  var cards = [];
  org.people.forEach(function(person, personIdx){
    for(var i=0;i<10;i++){
      cards.push(buildDemoCard(person, i, personIdx));
    }
  });
  return cards.sort(function(a,b){return a.data < b.data ? -1 : (a.data > b.data ? 1 : a.spec.localeCompare(b.spec,'pl'));});
}

function installDemoData(force){
  var versionKey = 'pep_demo_seed_version';
  if(!force && DataStore.getValue(versionKey, '') === DEMO_SEED_VERSION) return false;
  var org = buildDemoOrg();
  adminData.assessors = org.leaders.slice().sort(function(a,b){return a.localeCompare(b,'pl');});
  adminData.specialists = org.people.map(function(p){return p.name;}).sort(function(a,b){return a.localeCompare(b,'pl');});
  adminData.departments = org.departments.slice().sort(function(a,b){return a.localeCompare(b,'pl');});
  adminData.positions = org.positions.slice();
  adminData.people = org.people.slice().sort(function(a,b){return a.name.localeCompare(b.name,'pl');});
  adminData.archived = {assessors:[],specialists:[],departments:[],positions:[]};
  adminData.history = [{
    ts:new Date().toISOString(),
    type:'Demo',
    desc:'Wygenerowano strukturę: 4 działy, 12 liderów, 120 specjalistów i 1200 kart ocen.',
    role:'admin'
  }];
  registry = buildDemoRegistry(org);
  normalizeRegistry();
  saveAdminData();
  saveRegistry();
  setDrafts({});
  DataStore.setSavedAssessor('');
  DataStore.setValue(versionKey, DEMO_SEED_VERSION);
  if(typeof updateBadge === 'function') updateBadge();
  return true;
}

function seedTestData(){
  if(registry.length > 0) return;
  installDemoData(true);
}

function loadSeedData(){
  if(!confirm('Wyczyścić bazę specjalistów, liderów i ewidencję, a potem załadować dane demo: 4 działy, 12 liderów, 120 specjalistów i 1200 kart?')) return;
  installDemoData(true);
  if(typeof buildAdmin === 'function') buildAdmin();
  if(typeof buildForm === 'function') ['r','m','s'].forEach(buildForm);
  renderEw();
  showToast('Załadowano komplet danych demo: 120 specjalistów i 1200 kart','ok');
}
