/* ===============================================================
   MY TEAM - leader scoped team view
=============================================================== */

var myTeamCharts={};

function myTeamRows(){
  return scopedRegistry().filter(function(e){return !entryIsArchived(e);});
}
function myTeamCurrentRows(){
  var cp=currentPeriodValue();
  return myTeamRows().filter(function(e){return e.period===cp;});
}
function myTeamPeople(){
  return activePeople().sort(function(a,b){return (a.name||'').localeCompare(b.name||'','pl');});
}
function myTeamAvg(rows){
  return rows.length?Math.round(rows.reduce(function(a,b){return a+(b.avgFinal||0);},0)/rows.length):0;
}
function myTeamTypeDone(rows,type){
  return rows.filter(function(e){return e.p===type;}).reduce(function(a,b){return a+(b.contactCount||0);},0);
}
function myTeamPersonSummary(person, rows, currentRows){
  var all=rows.filter(function(e){return e.spec===person.name;});
  var cur=currentRows.filter(function(e){return e.spec===person.name;});
  var last=all.slice().sort(function(a,b){return a.data<b.data?1:-1;})[0];
  var avg=myTeamAvg(cur.length?cur:all);
  var below=cur.filter(function(e){return e.rating==='below';}).length;
  var doneR=myTeamTypeDone(cur,'r'), doneM=myTeamTypeDone(cur,'m'), doneS=myTeamTypeDone(cur,'s');
  return {person:person,all:all,cur:cur,last:last,avg:avg,below:below,doneR:doneR,doneM:doneM,doneS:doneS};
}
function myTeamGoalPill(done,goal,label){
  var ok=done>=goal;
  return '<span class="mt-goal '+(ok?'ok':'miss')+'">'+label+' '+done+'/'+goal+'</span>';
}
function myTeamRisk(summary){
  if(!summary.cur.length) return {cls:'warn',txt:'Brak kart w periodzie'};
  if(summary.avg<82 || summary.below>0) return {cls:'bad',txt:'Wymaga uwagi'};
  if(summary.avg<92) return {cls:'warn',txt:'Do monitoringu'};
  return {cls:'ok',txt:'Stabilnie'};
}

function buildMyTeam(){
  var wrap=document.getElementById('wrap-myteam');
  if(!wrap) return;
  var leader=activeLeaderScope();
  if(!leader){
    wrap.innerHTML='<div class="dash-empty">Zakładka jest dostępna dla liderów z przypisanym zespołem.</div>';
    return;
  }
  var people=myTeamPeople();
  var rows=myTeamRows();
  var currentRows=myTeamCurrentRows();
  var cp=currentPeriodValue();
  var avg=myTeamAvg(currentRows);
  var prevRows=rows.filter(function(e){return e.period!==cp;});
  var prevAvg=myTeamAvg(prevRows.slice(-people.length*3));
  var delta=prevAvg?avg-prevAvg:0;
  var great=currentRows.filter(function(e){return e.rating==='great';}).length;
  var below=currentRows.filter(function(e){return e.rating==='below';}).length;
  var summaries=people.map(function(p){return myTeamPersonSummary(p,rows,currentRows);});
  var risk=summaries.filter(function(s){return myTeamRisk(s).cls==='bad'||myTeamRisk(s).cls==='warn';});
  var goalR=goalForType('r'), goalM=goalForType('m'), goalS=goalForType('s');

  var memberRows=summaries.map(function(s){
    var r=myTeamRisk(s);
    var last=s.last?escHtml(s.last.data+' · '+({r:'Rozmowa',m:'Mail',s:'System'}[s.last.p]||s.last.p)+' · '+s.last.avgFinal+'%'):'Brak kart';
    var avgCol=s.avg>=92?'var(--green)':s.avg>=82?'var(--amber)':'var(--red)';
    return '<tr><td><strong>'+escHtml(s.person.name)+'</strong><div>'+escHtml(s.person.position||'')+'</div></td>'+
      '<td class="r" style="color:'+avgCol+'"><strong>'+s.avg+'%</strong></td>'+
      '<td><div class="mt-goals">'+myTeamGoalPill(s.doneR,goalR,'R')+myTeamGoalPill(s.doneM,goalM,'M')+myTeamGoalPill(s.doneS,goalS,'S')+'</div></td>'+
      '<td>'+last+'</td>'+
      '<td><span class="mt-status '+r.cls+'">'+r.txt+'</span></td></tr>';
  }).join('');

  var attention=risk.slice(0,8).map(function(s){
    var r=myTeamRisk(s);
    var reason=!s.cur.length?'Brak kart w '+cp:(s.below+' kart poniżej standardu · średnia '+s.avg+'%');
    return '<div class="mt-attn-item"><div><strong>'+escHtml(s.person.name)+'</strong><span>'+reason+'</span></div><button class="adm-btn" onclick="myTeamOpenSpec(\''+escHtml(s.person.name).replace(/'/g,'&#39;')+'\')">Pokaż</button></div>';
  }).join('') || '<div class="adm-empty">Brak pilnych alertów dla zespołu.</div>';

  var latest=currentRows.slice().sort(function(a,b){return a.data<b.data?1:-1;}).slice(0,8).map(function(e){
    var col=e.avgFinal>=92?'var(--green)':e.avgFinal>=82?'var(--amber)':'var(--red)';
    return '<div class="mt-card-row"><div><strong>'+escHtml(e.spec)+'</strong><span>'+escHtml(e.data+' · '+({r:'Rozmowa',m:'Mail',s:'System'}[e.p]||e.p))+'</span></div><b style="color:'+col+'">'+e.avgFinal+'%</b></div>';
  }).join('') || '<div class="adm-empty">Brak kart w aktualnym periodzie.</div>';

  wrap.innerHTML='<div class="mt-shell">'+
    '<section class="mt-hero"><div><div class="adm-kicker">Mój Zespół</div><h2>'+escHtml(leader)+'</h2><p>'+people.length+' pracowników · '+escHtml(cp||'brak periodu')+' · dane ograniczone do Twojego zespołu</p></div><button class="btn btn-outline btn-sm" onclick="switchTab(\'dashboard\')">Pełny dashboard</button></section>'+
    '<section class="mt-kpis">'+
      '<div><strong>'+avg+'%</strong><span>Średnia w periodzie</span><em class="'+(delta>=0?'up':'down')+'">'+(prevAvg?(delta>=0?'+':'')+delta+' pp vs poprzednie':'brak porównania')+'</em></div>'+
      '<div><strong>'+currentRows.length+'</strong><span>Kart w periodzie</span><em>'+rows.length+' łącznie</em></div>'+
      '<div><strong>'+great+'</strong><span>Bardzo dobrych</span><em>'+Math.round((great/(currentRows.length||1))*100)+'% kart</em></div>'+
      '<div><strong>'+below+'</strong><span>Poniżej standardu</span><em>'+risk.length+' osób do obserwacji</em></div>'+
    '</section>'+
    '<section class="mt-grid">'+
      '<div class="mt-panel wide"><div class="mt-panel-hdr"><h3>Pracownicy i realizacja celów</h3><p>Rozmowy, maile i działania w aktualnym periodzie.</p></div><div class="mt-table-wrap"><table class="mt-table"><thead><tr><th>Specjalista</th><th class="r">Wynik</th><th>Cele</th><th>Ostatnia karta</th><th>Status</th></tr></thead><tbody>'+memberRows+'</tbody></table></div></div>'+
      '<div class="mt-panel"><div class="mt-panel-hdr"><h3>Do uwagi</h3><p>Priorytety na 1:1 i kalibrację.</p></div><div class="mt-attn">'+attention+'</div></div>'+
      '<div class="mt-panel"><div class="mt-panel-hdr"><h3>Ostatnie karty</h3><p>Najnowsze oceny w periodzie.</p></div><div class="mt-latest">'+latest+'</div></div>'+
      '<div class="mt-panel wide"><div class="mt-panel-hdr"><h3>Trend zespołu</h3><p>Średni wynik po datach ocen.</p></div><div class="mt-chart"><canvas id="mt-trend"></canvas></div></div>'+
    '</section>'+
  '</div>';
  setTimeout(renderMyTeamChart,30);
}

function renderMyTeamChart(){
  var el=document.getElementById('mt-trend');
  if(!el) return;
  if(typeof chartAvailable==='function'&&!chartAvailable(el)) return;
  if(typeof Chart==='undefined') return;
  if(myTeamCharts.trend) myTeamCharts.trend.destroy();
  var byDate={};
  myTeamRows().forEach(function(e){
    if(!byDate[e.data]) byDate[e.data]={sum:0,n:0};
    byDate[e.data].sum+=e.avgFinal;byDate[e.data].n++;
  });
  var labels=Object.keys(byDate).sort();
  var data=labels.map(function(d){return Math.round(byDate[d].sum/byDate[d].n);});
  var isDark=document.documentElement.getAttribute('data-theme')==='dark';
  myTeamCharts.trend=new Chart(el,{type:'line',data:{labels:labels,datasets:[{label:'Średni wynik zespołu',data:data,borderColor:'#0D9488',backgroundColor:'rgba(13,148,136,.14)',fill:true,tension:.32,pointRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{min:0,max:100,ticks:{callback:function(v){return v+'%';},color:isDark?'#94A3B8':'#64748B'},grid:{color:isDark?'rgba(255,255,255,.08)':'rgba(0,0,0,.06)'}},x:{ticks:{color:isDark?'#94A3B8':'#64748B',maxRotation:35},grid:{display:false}}}}});
}

function myTeamOpenSpec(name){
  switchTab('ewidencja');
  setTimeout(function(){
    var q=document.getElementById('ew-fq');
    if(q){q.value=name;renderEw();}
  },0);
}
