/* ══════════════════════════════════════════════
   SEED — test data generator
══════════════════════════════════════════════ */

function seedTestData(){
  if(registry.length>0) return;
  var SPECS=[
    {spec:'Anna Kowalska',stand:'Specjalista ds. Obsługi Klienta',dzial:'Dział Obsługi PeP'},
    {spec:'Piotr Wiśniewski',stand:'Młodszy Specjalista',dzial:'Dział Obsługi PeP'},
    {spec:'Marta Dąbrowska',stand:'Specjalista ds. Rozliczeń',dzial:'Dział Rozliczeń P24'},
    {spec:'Tomasz Zając',stand:'Specjalista ds. Obsługi Klienta',dzial:'Dział Obsługi PeP'},
    {spec:'Karolina Lewandowska',stand:'Starszy Specjalista',dzial:'Dział Rozliczeń P24'},
    {spec:'Michał Kowalczyk',stand:'Specjalista ds. Systemów',dzial:'Dział Wsparcia Technicznego'},
    {spec:'Natalia Szymańska',stand:'Młodszy Specjalista',dzial:'Dział Obsługi PeP'},
    {spec:'Bartosz Nowak',stand:'Specjalista ds. Rozliczeń',dzial:'Dział Rozliczeń P24'}
  ];
  var OCE=['Jan Kowalczyk (TL)','Agnieszka Maj (TL)','Robert Wróbel (TL)'];
  var CARDS=[
    {p:'r',si:0,period:'P1 2025',data:'2025-01-15',n:3},{p:'r',si:1,period:'P1 2025',data:'2025-01-22',n:3},
    {p:'r',si:2,period:'P1 2025',data:'2025-02-10',n:2},{p:'r',si:3,period:'P1 2025',data:'2025-02-18',n:3},
    {p:'m',si:0,period:'P1 2025',data:'2025-01-28',n:3},{p:'m',si:4,period:'P1 2025',data:'2025-03-05',n:2},
    {p:'s',si:5,period:'P1 2025',data:'2025-02-25',n:3},{p:'r',si:6,period:'P1 2025',data:'2025-03-14',n:3},
    {p:'r',si:7,period:'P1 2025',data:'2025-03-20',n:2},{p:'m',si:2,period:'P1 2025',data:'2025-03-28',n:3},
    {p:'r',si:0,period:'P2 2025',data:'2025-05-08',n:3},{p:'r',si:1,period:'P2 2025',data:'2025-05-15',n:3},
    {p:'r',si:3,period:'P2 2025',data:'2025-06-04',n:3},{p:'r',si:4,period:'P2 2025',data:'2025-06-11',n:2},
    {p:'m',si:0,period:'P2 2025',data:'2025-05-22',n:3},{p:'m',si:5,period:'P2 2025',data:'2025-06-19',n:2},
    {p:'s',si:1,period:'P2 2025',data:'2025-07-03',n:3},{p:'s',si:6,period:'P2 2025',data:'2025-07-10',n:2},
    {p:'r',si:2,period:'P2 2025',data:'2025-07-17',n:3},{p:'m',si:7,period:'P2 2025',data:'2025-08-05',n:3},
    {p:'r',si:0,period:'P3 2025',data:'2025-09-10',n:3},{p:'r',si:3,period:'P3 2025',data:'2025-09-18',n:3},
    {p:'r',si:1,period:'P3 2025',data:'2025-10-07',n:2},{p:'r',si:5,period:'P3 2025',data:'2025-10-15',n:3},
    {p:'m',si:2,period:'P3 2025',data:'2025-09-25',n:3},{p:'m',si:4,period:'P3 2025',data:'2025-10-22',n:2},
    {p:'s',si:0,period:'P3 2025',data:'2025-11-06',n:3},{p:'s',si:3,period:'P3 2025',data:'2025-11-13',n:3},
    {p:'r',si:6,period:'P3 2025',data:'2025-11-20',n:3},{p:'m',si:7,period:'P3 2025',data:'2025-12-04',n:2}
  ];
  var PROFILES=[[1,1,1,1,0.5],[1,1,0.5,1,1],[0.5,1,0.5,0.5,1],[1,1,1,0.5,0.5],[1,1,1,1,1],[0.5,0.5,1,0.5,0],[1,0.5,1,1,0.5],[0.5,1,0.5,1,1]];
  function rnd(prof){var pool=prof.concat([1,1,0.5,0,'nd']);return pool[Math.floor(Math.random()*pool.length)];}
  var cards=[];
  CARDS.forEach(function(def,idx){
    var sp=SPECS[def.si],prof=PROFILES[def.si],ddef=DEFS[def.p],n=def.n;
    var ss={},sn={};
    ddef.sections.forEach(function(sec){
      ss[sec.key]={};
      sec.criteria.forEach(function(_,ci){ss[sec.key][ci]=Array.from({length:n},function(){return rnd(prof);});});
      sn[sec.key]=Array(n).fill('');
    });
    var results=Array.from({length:n},function(_,ci){
      var total=0,parts={};
      ddef.sections.forEach(function(sec){
        var vals=sec.criteria.map(function(_,cri){return ss[sec.key][cri][ci];});
        var valid=vals.filter(function(v){return v!=='nd';});
        var sum=valid.length?valid.reduce(function(a,b){return a+b;},0):0;
        total+=valid.length?sum/valid.length*sec.w:sec.w;
        parts[sec.key]=Math.round(valid.length?sum/valid.length*100:100);
      });
      return{finalPct:Math.round(total*100),parts:parts};
    });
    var avg=Math.round(results.reduce(function(a,b){return a+b.finalPct;},0)/results.length);
    var sa={};ddef.sections.forEach(function(sec){var vals=results.map(function(r){return r.parts[sec.key];});sa[sec.key]=Math.round(vals.reduce(function(a,b){return a+b;},0)/vals.length);});
    cards.push({id:1700000000000+idx*10000,p:def.p,locked:false,spec:sp.spec,stand:sp.stand,dzial:sp.dzial,oce:OCE[idx%OCE.length],data:def.data,period:def.period,avgFinal:avg,secAvg:sa,contactResults:results.map(function(r){return{pct:r.finalPct,pts:{sum:0,max:0}};}),rating:avg>=92?'great':avg>=82?'good':'below',notes:'',contactCount:n,ids:Array.from({length:n},function(_,i){return 'ID-'+(10000+idx*10+i)+' / '+def.data;}),gold:Array(n).fill(0),goldDesc:'',snapshotScores:ss,snapshotNotes:sn});
  });
  registry.push.apply(registry,cards);
  saveRegistry();updateBadge();
}
function loadSeedData(){
  if(!confirm('Wyczyścić ewidencję i załadować 30 przykładowych kart?')) return;
  registry=[];seedTestData();renderEw();showToast('Załadowano 30 kart testowych','ok');
}


