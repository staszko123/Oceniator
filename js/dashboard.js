/* ══════════════════════════════════════════════
   DASHBOARD — KPI cards, goal tracker, charts, compare
══════════════════════════════════════════════ */

// ── DASHBOARD ──
var GOAL=9, dashCh={}, cmpSelected=[], cmpType='r', editingPersonIdx=-1, admSearch={assessors:'',specialists:'',departments:'',positions:''};
var DASHBOARD_LAYOUT_KEY='oceniator-dashboard-layout';
var DASHBOARD_PANEL_DEFS=[
  {id:'d-kpi',title:'KPI'},
  {id:'d-goal',title:'Realizacja celów'},
  {id:'d-r4',title:'Wyniki zespołów liderów'},
  {id:'d-r1',title:'Punkty jakości'},
  {id:'d-r2',title:'Ranking i rozkład'},
  {id:'d-r3',title:'Trend i porównanie'}
];
var dashLayoutState=loadDashboardLayout();
var dashLayoutObserver=null;
(function(){var s=DataStore.getGoal();if(s&&!isNaN(s))GOAL=parseInt(s);})();

function loadDashboardLayout(){
  var stored=localStorage.getItem(DASHBOARD_LAYOUT_KEY);
  var order=DASHBOARD_PANEL_DEFS.map(function(p){return p.id;});
  var sizes={};
  if(stored){
    try{
      var parsed=JSON.parse(stored);
      if(parsed && Array.isArray(parsed.order)){
        var safeOrder=parsed.order.filter(function(id){return order.indexOf(id)>=0;});
        order=safeOrder.concat(order.filter(function(id){return safeOrder.indexOf(id)<0;}));
      }
      if(parsed && typeof parsed.sizes==='object' && parsed.sizes) sizes=parsed.sizes;
    }catch(e){}
  }
  return {order:order,sizes:sizes};
}
function saveDashboardLayout(){
  try{localStorage.setItem(DASHBOARD_LAYOUT_KEY,JSON.stringify({order:dashLayoutState.order,sizes:dashLayoutState.sizes}));}catch(e){}
}
function getPanelSize(id){
  var size=dashLayoutState.sizes[id];
  if(size && typeof size.width==='number' && typeof size.height==='number') return size;
  return null;
}
function resetPanelSize(id){
  if(dashLayoutState.sizes[id]) delete dashLayoutState.sizes[id];
  saveDashboardLayout();
  var panel=document.querySelector('.dash-panel[data-panel="'+id+'"]');
  if(panel){panel.style.width='';panel.style.height='';}
}
function resetDashboardLayout(){
  dashLayoutState={order:DASHBOARD_PANEL_DEFS.map(function(p){return p.id;}),sizes:{}};
  saveDashboardLayout();
  buildDashboardPanels();
  renderDash();
  if(typeof showToast==='function') showToast('Układ dashboardu zresetowany','ok');
}
function reorderDashboardPanels(draggedId,targetId){
  var order=dashLayoutState.order;
  var from=order.indexOf(draggedId);
  var to=order.indexOf(targetId);
  if(from<0||to<0||from===to) return;
  order.splice(to,0,order.splice(from,1)[0]);
  saveDashboardLayout();
}
function initDashboardLayout(){
  var layout=document.getElementById('dash-layout');
  if(!layout) return;
  if(dashLayoutObserver){dashLayoutObserver.disconnect();dashLayoutObserver=null;}
  var dragSrc=null;
  Array.from(layout.querySelectorAll('.dash-panel')).forEach(function(panel){
    panel.classList.remove('dragging','drag-over');
    panel.setAttribute('draggable','true');
    panel.addEventListener('dragstart',function(e){dragSrc=panel.dataset.panel;panel.classList.add('dragging');e.dataTransfer.effectAllowed='move';try{e.dataTransfer.setData('text/plain',dragSrc);}catch(err){} });
    panel.addEventListener('dragend',function(){panel.classList.remove('dragging');dragSrc=null;});
    panel.addEventListener('dragover',function(e){e.preventDefault();if(panel.dataset.panel!==dragSrc) panel.classList.add('drag-over');});
    panel.addEventListener('dragleave',function(){panel.classList.remove('drag-over');});
    panel.addEventListener('drop',function(e){e.preventDefault();panel.classList.remove('drag-over');var targetId=panel.dataset.panel; if(dragSrc && targetId && dragSrc!==targetId){reorderDashboardPanels(dragSrc,targetId);buildDashboardPanels();renderDash();}});
  });
  dashLayoutObserver=new ResizeObserver(function(entries){entries.forEach(function(entry){var panel=entry.target; var id=panel.dataset.panel; if(!id) return; dashLayoutState.sizes[id]={width:Math.round(entry.contentRect.width),height:Math.round(entry.contentRect.height)}; saveDashboardLayout();});});
  Array.from(layout.querySelectorAll('.dash-panel')).forEach(function(panel){dashLayoutObserver.observe(panel);});
}
function buildDashboardPanels(){
  var wrap=document.getElementById('wrap-dash');
  if(!wrap) return;
  var layout=document.getElementById('dash-layout');
  var newLayout=document.createElement('div');
  newLayout.id='dash-layout';
  newLayout.className='dash-layout';
  dashLayoutState.order.forEach(function(panelId){
    var def=DASHBOARD_PANEL_DEFS.find(function(p){return p.id===panelId;});
    if(!def) return;
    var panel=document.createElement('div');
    panel.className='dash-panel';
    panel.dataset.panel=panelId;
    var size=getPanelSize(panelId);
    if(size){panel.style.width=size.width+'px'; panel.style.height=size.height+'px';}
    panel.innerHTML='<div class="dash-panel-header"><div class="dash-panel-title">'+def.title+'</div><div class="dash-panel-actions"><button class="btn btn-outline btn-sm btn-icon" onclick="event.stopPropagation();resetPanelSize(\''+panelId+'\')">↺</button></div></div><div class="dash-panel-content" id="'+panelId+'"></div>';
    newLayout.appendChild(panel);
  });
  if(layout){layout.replaceWith(newLayout);} else {wrap.appendChild(newLayout);}
  initDashboardLayout();
}

function dashRows(){
  var fp=document.getElementById('d-fp')?.value||'';
  var ft=document.getElementById('d-ft')?.value||'';
  var fs=document.getElementById('d-fs')?.value||'';
  var fl=document.getElementById('d-fl')?.value||'';
  var fd=document.getElementById('d-fd')?.value||'';
  var fr=document.getElementById('d-fr')?.value||'';
  var df=document.getElementById('d-df')?.value||'';
  var dt=document.getElementById('d-dt')?.value||'';
  return scopedRegistry().filter(function(e){
    if(entryIsArchived(e)) return false;
    return (!fp||(e.period||'').startsWith(fp))&&(!ft||e.p===ft)&&
           (!fs||e.spec===fs)&&(!fl||e.oce===fl)&&(!fd||e.dzial===fd)&&(!fr||e.rating===fr)&&
           (!df||e.data>=df)&&(!dt||e.data<=dt);
  });
}

function buildDashboard(){
  var wrap=document.getElementById('wrap-dash');
  if(!wrap) return;
  var baseRows=scopedRegistry().filter(function(e){return !entryIsArchived(e);});
  var years=[...new Set(baseRows.map(function(e){return (e.data||'').split('-')[0];}).filter(Boolean))].sort();
  var specs=[...new Set(baseRows.map(function(e){return e.spec;}).filter(Boolean))].sort();
  var leaders=[...new Set(baseRows.map(function(e){return e.oce;}).filter(Boolean))].sort();
  var dzialy=[...new Set(baseRows.map(function(e){return e.dzial;}).filter(Boolean))].sort();
  var currentPeriod=currentPeriodValue();
  var periodSet=new Set(baseRows.map(function(e){return e.period;}).filter(Boolean));
  if(currentPeriod) periodSet.add(currentPeriod);
  var periodOptions=[...periodSet].sort();
  var po=years.flatMap(function(y){return [1,2,3].map(function(n){return '<option value="P'+n+' '+y+'">P'+n+' '+y+'</option>';});}).join('');
  po=periodOptions.map(function(p){return '<option value="'+p+'">'+p+'</option>';}).join('');
  var so=specs.map(function(s){return '<option value="'+s+'">'+s+'</option>';}).join('');
  var lo=leaders.map(function(l){return '<option value="'+l+'">'+l+'</option>';}).join('');
  var dzo=dzialy.map(function(d){return '<option value="'+d+'">'+d+'</option>';}).join('');
  var leaderScope=activeLeaderScope();
  wrap.innerHTML='<div class="dash-filters">'+
    '<div class="df"><label>Okres:</label><select id="d-fp" onchange="renderDash()"><option value="">Wszystkie</option>'+po+'<option value="P1">Każde P1</option><option value="P2">Każde P2</option><option value="P3">Każde P3</option></select></div>'+
    '<div class="df"><label>Typ:</label><select id="d-ft" onchange="renderDash()"><option value="">Wszystkie</option><option value="r">Rozmowy</option><option value="m">Maile</option><option value="s">Systemy</option></select></div>'+
    '<div class="df"><label>Specjalista:</label><select id="d-fs" onchange="renderDash()"><option value="">Wszyscy</option>'+so+'</select></div>'+
    '<div class="df"><label>Lider:</label><select id="d-fl" onchange="renderDash()" '+(leaderScope?'disabled':'')+'><option value="">Wszyscy</option>'+lo+'</select></div>'+
    '<div class="df"><label>Dział:</label><select id="d-fd" onchange="renderDash()"><option value="">Wszystkie</option>'+dzo+'</select></div>'+
    '<div class="df"><label>Ocena:</label><select id="d-fr" onchange="renderDash()"><option value="">Wszystkie</option><option value="great">Bardzo dobry</option><option value="good">Dobry</option><option value="below">Poniżej std.</option></select></div>'+
    '<div class="df"><label>Od:</label><input type="date" id="d-df" onchange="renderDash()"></div>'+
    '<div class="df"><label>Do:</label><input type="date" id="d-dt" onchange="renderDash()"></div>'+
    '<button class="btn btn-outline btn-sm" onclick="resetDashF()" style="margin-left:auto">↺ Reset filtrów</button>'+
    '<button class="btn btn-outline btn-sm" onclick="resetDashboardLayout()">⚙️ Reset układu</button>'+
  '</div>'+
  '<div id="dash-layout" class="dash-layout">'+
    '<div class="dash-panel" data-panel="d-kpi"><div class="dash-panel-header"><div class="dash-panel-title">KPI</div><div class="dash-panel-actions"><button class="btn btn-outline btn-sm btn-icon" onclick="event.stopPropagation();resetPanelSize(\'d-kpi\')">↺</button></div></div><div class="dash-panel-content" id="d-kpi"></div></div>'+
    '<div class="dash-panel" data-panel="d-goal"><div class="dash-panel-header"><div class="dash-panel-title">Realizacja celów</div><div class="dash-panel-actions"><button class="btn btn-outline btn-sm btn-icon" onclick="event.stopPropagation();resetPanelSize(\'d-goal\')">↺</button></div></div><div class="dash-panel-content" id="d-goal"></div></div>'+
    '<div class="dash-panel" data-panel="d-r4"><div class="dash-panel-header"><div class="dash-panel-title">Wyniki zespołów liderów</div><div class="dash-panel-actions"><button class="btn btn-outline btn-sm btn-icon" onclick="event.stopPropagation();resetPanelSize(\'d-r4\')">↺</button></div></div><div class="dash-panel-content" id="d-r4"></div></div>'+
    '<div class="dash-panel" data-panel="d-r1"><div class="dash-panel-header"><div class="dash-panel-title">Punkty jakości</div><div class="dash-panel-actions"><button class="btn btn-outline btn-sm btn-icon" onclick="event.stopPropagation();resetPanelSize(\'d-r1\')">↺</button></div></div><div class="dash-panel-content" id="d-r1"></div></div>'+
    '<div class="dash-panel" data-panel="d-r2"><div class="dash-panel-header"><div class="dash-panel-title">Ranking i rozkład</div><div class="dash-panel-actions"><button class="btn btn-outline btn-sm btn-icon" onclick="event.stopPropagation();resetPanelSize(\'d-r2\')">↺</button></div></div><div class="dash-panel-content" id="d-r2"></div></div>'+
    '<div class="dash-panel" data-panel="d-r3"><div class="dash-panel-header"><div class="dash-panel-title">Trend i porównanie</div><div class="dash-panel-actions"><button class="btn btn-outline btn-sm btn-icon" onclick="event.stopPropagation();resetPanelSize(\'d-r3\')">↺</button></div></div><div class="dash-panel-content" id="d-r3"></div></div>'+
  '</div>';
  if(dashLayoutState.order && dashLayoutState.order.length){buildDashboardPanels();}
  renderDash();
  var fp=document.getElementById('d-fp');
  if(fp&&currentPeriod&&periodSet.has(currentPeriod)) fp.value=currentPeriod;
  var fl=document.getElementById('d-fl');
  if(fl&&leaderScope) fl.value=leaderScope;
  renderDash();
}
function resetDashF(){
  ['d-fp','d-ft','d-fs','d-fl','d-fd','d-fr','d-df','d-dt'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
  var fp=document.getElementById('d-fp'), cp=currentPeriodValue();
  if(fp&&cp) fp.value=cp;
  var fl=document.getElementById('d-fl'), leader=activeLeaderScope();
  if(fl&&leader) fl.value=leader;
  renderDash();
}
function renderDash(){
  var rows=dashRows();
  Object.values(dashCh).forEach(function(ch){try{ch.destroy();}catch(e){}});
  dashCh={};
  ['d-kpi','d-goal','d-r1','d-r2','d-r3','d-r4'].forEach(function(id){var el=document.getElementById(id);if(el)el.innerHTML='';});
  if(!rows.length){
    var el=document.getElementById('d-kpi');
    if(el)el.innerHTML='<div class="dash-empty">📊<br>Brak danych dla wybranych filtrów.</div>';
    return;
  }
  var isDark=document.documentElement.getAttribute('data-theme')==='dark';
  var tc=isDark?'#94A3B8':'#64748B', gc=isDark?'rgba(255,255,255,.07)':'rgba(0,0,0,.05)', sc=isDark?'#1E293B':'#fff';
  var bOpts={responsive:true,maintainAspectRatio:false,
    plugins:{legend:{labels:{color:tc,font:{family:'Poppins',size:10},boxWidth:12}},
      tooltip:{titleFont:{family:'Poppins'},bodyFont:{family:'Poppins'},backgroundColor:sc,titleColor:isDark?'#F1F5F9':'#0F172A',bodyColor:tc,borderColor:isDark?'#334155':'#E2E8F0',borderWidth:1}}};
  var total=rows.length, great=rows.filter(function(e){return e.rating==='great';}).length;
  var good=rows.filter(function(e){return e.rating==='good';}).length, below=total-great-good;
  var avg=Math.round(rows.reduce(function(a,b){return a+b.avgFinal;},0)/total);
  var specs=[...new Set(rows.map(function(e){return e.spec;}))];
  // KPI
  document.getElementById('d-kpi').innerHTML='<div class="dash-kpi-row">'+
    '<div class="kpi-card"><div class="kpi-icon">📋</div><div class="kpi-val">'+total+'</div><div class="kpi-label">Łącznie kart</div><div class="kpi-sub">'+specs.length+' spec.</div></div>'+
    '<div class="kpi-card"><div class="kpi-icon">✓</div><div class="kpi-val" style="color:var(--green)">'+great+'</div><div class="kpi-label">Bardzo dobry</div><div class="kpi-sub">'+Math.round(great/total*100)+'%</div></div>'+
    '<div class="kpi-card"><div class="kpi-icon">⚡</div><div class="kpi-val" style="color:var(--amber)">'+good+'</div><div class="kpi-label">Dobry</div><div class="kpi-sub">'+Math.round(good/total*100)+'%</div></div>'+
    '<div class="kpi-card"><div class="kpi-icon">⚠️</div><div class="kpi-val" style="color:var(--red)">'+below+'</div><div class="kpi-label">Poniżej std.</div><div class="kpi-sub">'+Math.round(below/total*100)+'%</div></div>'+
    '<div class="kpi-card"><div class="kpi-icon">🎯</div><div class="kpi-val" style="color:var(--teal)">'+avg+'%</div><div class="kpi-label">Średni wynik</div><div class="kpi-sub">z '+total+' kart</div></div>'+
  '</div>';
  // GOALS
  var gMap={};
  rows.forEach(function(e){
    var k=e.spec+'||'+(e.period||'—')+'||'+e.p;
    gMap[k]=(gMap[k]||0)+(e.contactCount||1);
  });
  var gEntries=Object.entries(gMap).map(function(arr){var p=arr[0].split('||');return{spec:p[0],period:p[1],type:p[2],cnt:arr[1],goal:goalForType(p[2])};}).sort(function(a,b){return (a.type>b.type?1:-1)||(b.cnt-a.cnt);});
  var gHtml=gEntries.length?gEntries.map(function(g){
    var pct=Math.min(100,Math.round(g.cnt/g.goal*100));
    var col=pct>=100?'var(--green)':pct>=67?'var(--amber)':'var(--red)';
    var bg=pct>=100?'var(--green-l)':pct>=67?'var(--amber-l)':'var(--red-l)';
    var cls=pct>=100?'g-done':pct>=67?'g-warn':'g-miss';
    return '<div class="goal-row"><div class="goal-spec" title="'+g.spec+'">'+g.spec+'</div>'+
      '<div class="goal-per">'+g.period+' · '+goalLabel(g.type)+'</div>'+
      '<div class="goal-bg"><div class="goal-fill" style="width:'+pct+'%;background:'+col+'"></div></div>'+
      '<div class="goal-cnt" style="color:'+col+'">'+g.cnt+'/'+g.goal+'</div>'+
      '<div class="goal-bdg '+cls+'">'+(pct>=100?'✓ Cel':pct+'%')+'</div></div>';
  }).join(''):'<div style="color:var(--text3);font-size:11px;padding:8px 0">Brak kart dla celów.</div>';
  document.getElementById('d-goal').innerHTML='<div class="dash-widget" style="margin-bottom:12px">'+
    '<div class="dw-title">🎯 Realizacja celów <span class="dw-sub">Rozmowy: '+goalForType('r')+' · Maile: '+goalForType('m')+' · Systemy: '+goalForType('s')+' / period / spec.</span></div>'+
    '<div class="dw-body"><div class="goal-list">'+gHtml+'</div></div></div>';
  // ZESPOŁY LIDERÓW
  var teamMap={};
  rows.forEach(function(e){
    var leader=e.oce||'Bez lidera';
    if(!teamMap[leader])teamMap[leader]={sum:0,n:0,great:0,below:0,specs:new Set(),deps:new Set()};
    teamMap[leader].sum+=e.avgFinal;teamMap[leader].n++;
    if(e.rating==='great')teamMap[leader].great++;
    if(e.rating==='below')teamMap[leader].below++;
    if(e.spec)teamMap[leader].specs.add(e.spec);
    if(e.dzial)teamMap[leader].deps.add(e.dzial);
  });
  var teamHtml=Object.entries(teamMap).map(function(a){
    var t=a[1],avgT=Math.round(t.sum/t.n),col=avgT>=92?'var(--green)':avgT>=82?'var(--amber)':'var(--red)';
    return '<div class="team-card"><div class="team-title">👤 '+escHtml(a[0])+'</div>'+
      '<div class="team-meta">'+t.specs.size+' spec. · '+t.n+' kart · '+t.deps.size+' dział/y</div>'+
      '<div class="team-score" style="color:'+col+'">'+avgT+'%</div>'+
      '<div class="team-meta">Bardzo dobre: '+t.great+' · Poniżej std.: '+t.below+'</div></div>';
  }).join('');
  document.getElementById('d-r4').innerHTML='<div class="dash-widget"><div class="dw-title">👥 Wyniki zespołów liderów <span class="dw-sub">na podstawie pola Oceniający</span></div><div class="team-grid">'+teamHtml+'</div></div>';
  // SŁABE + MOCNE
  var wMap={}, sMap={};
  rows.forEach(function(e){
    if(!e.snapshotScores) return;
    var def=DEFS[e.p];
    def.sections.forEach(function(sec){
      sec.criteria.forEach(function(cr,ci){
        var nm=cr.n.length>46?cr.n.slice(0,46)+'…':cr.n;
        if(!wMap[nm])wMap[nm]={f:0,t:0};
        if(!sMap[nm])sMap[nm]={ok:0,t:0};
        for(var c2=0;c2<(e.contactCount||1);c2++){
          var v=((e.snapshotScores[sec.key]||{})[ci]||[])[c2];
          if(v==='nd'||v===undefined)continue;
          wMap[nm].t++;sMap[nm].t++;
          if(v===0||v===0.5)wMap[nm].f++;
          if(v===1)sMap[nm].ok++;
        }
      });
    });
  });
  var wList=Object.entries(wMap).filter(function(a){return a[1].t>=2;}).map(function(a){return{name:a[0],rate:Math.round(a[1].f/a[1].t*100)};}).sort(function(a,b){return b.rate-a.rate;}).slice(0,8);
  var sList=Object.entries(sMap).filter(function(a){return a[1].t>=2;}).map(function(a){return{name:a[0],rate:Math.round(a[1].ok/a[1].t*100)};}).sort(function(a,b){return b.rate-a.rate;}).slice(0,8);
  var noData='<div style="color:var(--text3);font-size:11px;padding:8px 0">Brak danych szczegółowych.</div>';
  var wHtml=wList.map(function(w){var col=w.rate>=60?'var(--red)':w.rate>=30?'var(--amber)':'var(--green)';return '<div class="pt-row"><div class="pt-name" title="'+w.name+'">'+w.name+'</div><div class="pt-bg"><div class="pt-fill" style="width:'+w.rate+'%;background:'+col+'"></div></div><div class="pt-pct" style="color:'+col+'">'+w.rate+'%</div></div>';}).join('')||noData;
  var sHtml=sList.map(function(s){return '<div class="pt-row"><div class="pt-name">'+s.name+'</div><div class="pt-bg"><div class="pt-fill" style="width:'+s.rate+'%;background:var(--green)"></div></div><div class="pt-pct" style="color:var(--green)">'+s.rate+'%</div></div>';}).join('')||noData;
  document.getElementById('d-r1').innerHTML='<div class="dash-widget"><div class="dw-title">⚠️ Słabe punkty <span class="dw-sub">% ocen 0 lub ½</span></div><div class="dw-body"><div class="pt-list">'+wHtml+'</div></div></div>'+
    '<div class="dash-widget"><div class="dw-title">💪 Mocne punkty <span class="dw-sub">% ocen pełnych (1)</span></div><div class="dw-body"><div class="pt-list">'+sHtml+'</div></div></div>';
  // RANKING
  var bSpec={};
  rows.forEach(function(e){if(!bSpec[e.spec])bSpec[e.spec]={sum:0,n:0,gr:0,gd:0,bl:0};bSpec[e.spec].sum+=e.avgFinal;bSpec[e.spec].n++;if(e.rating==='great')bSpec[e.spec].gr++;else if(e.rating==='good')bSpec[e.spec].gd++;else bSpec[e.spec].bl++;});
  var ranked=Object.entries(bSpec).map(function(a){return{name:a[0],avg:Math.round(a[1].sum/a[1].n),n:a[1].n,gr:a[1].gr,gd:a[1].gd,bl:a[1].bl};}).sort(function(a,b){return b.avg-a.avg;});
  var medals=['🥇','🥈','🥉'];
  var rHtml=ranked.map(function(r,i){var col=r.avg>=92?'var(--green)':r.avg>=82?'var(--amber)':'var(--red)';return '<tr><td style="padding:7px 8px;font-size:'+(i<3?'15':'11')+'px">'+(medals[i]||(i+1)+'.')+'</td><td style="padding:7px 8px"><strong>'+r.name+'</strong><div style="font-size:9px;color:var(--text3)">'+r.n+' kart</div></td><td class="r" style="padding:7px 8px;color:'+col+';font-size:14px;font-weight:700">'+r.avg+'%</td><td class="r" style="padding:7px 8px;white-space:nowrap"><span style="color:var(--green);font-size:10px">✅'+r.gr+'</span> <span style="color:var(--amber);font-size:10px">⚡'+r.gd+'</span> <span style="color:var(--red);font-size:10px">⚠️'+r.bl+'</span></td></tr>';}).join('');
  document.getElementById('d-r2').innerHTML=
    '<div class="dash-widget"><div class="dw-title">🏆 Ranking specjalistów</div><div class="dw-body"><table class="rk-tbl"><thead><tr><th>#</th><th>Specjalista</th><th class="r">Wynik</th><th class="r">Oceny</th></tr></thead><tbody>'+rHtml+'</tbody></table></div></div>'+
    '<div class="dash-widget"><div class="dw-title">📊 Rozkład wyników</div><div class="ch240"><canvas id="ch-dist"></canvas></div></div>';
  document.getElementById('d-r3').innerHTML='<div class="dash-widget"><div class="dw-title">📈 Trend w czasie</div><div class="ch260"><canvas id="ch-trend"></canvas></div></div>';
  document.getElementById('d-r3').innerHTML+='<div class="dash-widget" style="margin-top:12px"><div class="dw-title">🔍 Porównanie specjalistów <span class="dw-sub">Wybierz 2–4 osoby (maks.)</span></div><div id="d-cmp-inner"></div></div>';
  // CHARTS
  setTimeout(function(){
    var de=document.getElementById('ch-dist');
    if(de){
      var bins=[0,0,0,0,0];
      rows.forEach(function(e){var v=e.avgFinal;if(v<70)bins[0]++;else if(v<82)bins[1]++;else if(v<92)bins[2]++;else if(v<100)bins[3]++;else bins[4]++;});
      var mx=Math.max.apply(null,bins.concat([1]));
      dashCh.dist=new Chart(de,{type:'bar',data:{labels:['<70%','70-81%','82-91%','92-99%','100%'],datasets:[{data:bins,backgroundColor:['#FCA5A5','#FCD34D','#FDE68A','#86EFAC','#16A34A'],borderRadius:5}]},options:Object.assign({},bOpts,{plugins:Object.assign({},bOpts.plugins,{legend:{display:false}}),scales:{y:{min:0,max:Math.ceil(mx*1.2)||5,ticks:{color:tc,font:{family:'Poppins',size:9},stepSize:1},grid:{color:gc}},x:{ticks:{color:tc,font:{family:'Poppins',size:10}},grid:{display:false}}}})});
    }
    var te=document.getElementById('ch-trend');
    if(te){
      var sorted=[].concat(rows).sort(function(a,b){return a.data<b.data?-1:1;});
      var selS=document.getElementById('d-fs')?.value||'';
      var colors=['#0D9488','#7C3AED','#D97706','#DC2626','#16A34A','#1B2E4B','#EC4899','#06B6D4'];
      var datasets;
      if(selS){
        datasets=[['r','Rozmowy'],['m','Maile'],['s','Systemy']].map(function(pt,i){
          return{label:pt[1],data:sorted.filter(function(e){return e.p===pt[0];}).map(function(e){return{x:e.data,y:e.avgFinal};}),borderColor:colors[i],backgroundColor:colors[i]+'20',tension:.3,fill:false,pointRadius:4};
        }).filter(function(d){return d.data.length>0;});
      } else if(specs.length<=6){
        datasets=specs.map(function(s,i){return{label:s,data:sorted.filter(function(e){return e.spec===s;}).map(function(e){return{x:e.data,y:e.avgFinal};}),borderColor:colors[i%colors.length],backgroundColor:'transparent',tension:.3,fill:false,pointRadius:3};});
      } else {
        var byD={};sorted.forEach(function(e){if(!byD[e.data])byD[e.data]={s:0,n:0};byD[e.data].s+=e.avgFinal;byD[e.data].n++;});
        var dates=Object.keys(byD).sort();
        datasets=[{label:'Śr. wynik',data:dates.map(function(d){return{x:d,y:Math.round(byD[d].s/byD[d].n)};}),borderColor:'#0D9488',backgroundColor:'rgba(13,148,136,.12)',tension:.3,fill:true,pointRadius:4}];
      }
      var allD=[...new Set(sorted.map(function(e){return e.data;}))].sort();
      if(allD.length>=2){
        datasets.push({label:'92% próg',data:allD.map(function(d){return{x:d,y:92};}),borderColor:'rgba(22,163,74,.4)',borderDash:[6,4],borderWidth:1.5,pointRadius:0,fill:false,tension:0});
        datasets.push({label:'82% próg',data:allD.map(function(d){return{x:d,y:82};}),borderColor:'rgba(217,119,6,.4)',borderDash:[6,4],borderWidth:1.5,pointRadius:0,fill:false,tension:0});
      }
      dashCh.trend=new Chart(te,{type:'line',data:{datasets:datasets},options:Object.assign({},bOpts,{scales:{x:{type:'category',ticks:{color:tc,font:{family:'Poppins',size:9},maxRotation:35,maxTicksLimit:12},grid:{color:gc}},y:{min:0,max:100,ticks:{color:tc,font:{family:'Poppins',size:9},callback:function(v){return v+'%';}},grid:{color:gc}}}})});
    }
    renderCompare();
  },80);
}

function renderCompare(){
  var inner=document.getElementById('d-cmp-inner');
  if(!inner) return;
  var rows=dashRows();
  var allSpecs=[...new Set(rows.map(function(e){return e.spec;}))].sort();
  cmpSelected=cmpSelected.filter(function(s){return allSpecs.indexOf(s)>=0;});
  var hasType=function(t){return rows.some(function(e){return e.p===t;});};
  if(!hasType(cmpType)){cmpType=hasType('r')?'r':hasType('m')?'m':'s';}
  var COLORS=['#0D9488','#7C3AED','#D97706','#EC4899'];
  // type buttons
  var typeH='<div class="cmp-types"><span class="cmp-lbl">Typ kart:</span>'+
    (hasType('r')?'<button class="cmp-tbtn'+(cmpType==='r'?' on':'')+'" onclick="setCmpType(\'r\')">📞 Rozmowy</button>':'')+
    (hasType('m')?'<button class="cmp-tbtn'+(cmpType==='m'?' on':'')+'" onclick="setCmpType(\'m\')">✉️ Maile</button>':'')+
    (hasType('s')?'<button class="cmp-tbtn'+(cmpType==='s'?' on':'')+'" onclick="setCmpType(\'s\')">🖥️ Systemy</button>':'')+
    '</div>';
  // spec picks
  var picksH='<div class="cmp-picks">';
  if(!allSpecs.length){
    picksH+='<span style="color:var(--text3);font-size:10px">Brak danych w wybranych filtrach.</span>';
  } else {
    picksH+=allSpecs.map(function(s){
      var si=cmpSelected.indexOf(s);
      var isOn=si>=0;
      var dis=!isOn&&cmpSelected.length>=4;
      var st=isOn?' style="background:'+COLORS[si]+';border-color:'+COLORS[si]+'"':'';
      return '<button class="cmp-pick'+(isOn?' on':'')+(dis?' disabled':'')+'"'+st+
        ' data-spec="'+s+'" onclick="toggleCmpSpec(this)">'+(isOn?'✓ ':'')+s+'</button>';
    }).join('');
  }
  var cntLbl=cmpSelected.length?cmpSelected.length+'/4 wybranych':'kliknij aby wybrać';
  picksH+='<span style="font-size:9px;color:var(--text3);margin-left:auto;white-space:nowrap">'+cntLbl+'</span></div>';
  // chart or hint
  var chartH;
  if(cmpSelected.length<2){
    var hint=cmpSelected.length===0?'Wybierz co najmniej 2 specjalistów powyżej':'Wybierz jeszcze '+(2-cmpSelected.length)+' specjalist'+(cmpSelected.length===1?'ę':'ów');
    chartH='<div class="cmp-empty">👆 '+hint+'</div>';
  } else {
    chartH='<div class="ch-std"><canvas id="ch-cmp"></canvas></div>';
  }
  inner.innerHTML=typeH+picksH+chartH;
  if(cmpSelected.length>=2){
    if(dashCh.cmp){try{dashCh.cmp.destroy();}catch(e){}}
    var typeRows=rows.filter(function(e){return e.p===cmpType;});
    var def=DEFS[cmpType];
    var labels=def.sections.map(function(sec){return sec.lbl.replace(/^[IVX]+\.\s*/,'');});
    var isDark=document.documentElement.getAttribute('data-theme')==='dark';
    var tc=isDark?'#94A3B8':'#64748B';
    var gc=isDark?'rgba(255,255,255,.1)':'rgba(0,0,0,.07)';
    var bgSurface=isDark?'#1E293B':'#fff';
    var datasets=cmpSelected.map(function(spec,i){
      var specRows=typeRows.filter(function(e){return e.spec===spec;});
      var secScores=def.sections.map(function(sec){
        if(!specRows.length) return 0;
        var tot=0,cnt=0;
        specRows.forEach(function(e){if(e.secAvg&&e.secAvg[sec.key]!==undefined){tot+=e.secAvg[sec.key];cnt++;}});
        return cnt?Math.round(tot/cnt):0;
      });
      var col=COLORS[i];
      return{label:spec,data:secScores,borderColor:col,backgroundColor:col+'28',
        pointBackgroundColor:col,pointBorderColor:col,pointHoverRadius:7,borderWidth:2,pointRadius:5};
    });
    var ce=document.getElementById('ch-cmp');
    if(ce){
      dashCh.cmp=new Chart(ce,{
        type:'radar',
        data:{labels:labels,datasets:datasets},
        options:{
          responsive:true,maintainAspectRatio:false,
          plugins:{
            legend:{labels:{color:tc,font:{family:'Poppins',size:10},boxWidth:12,padding:16}},
            tooltip:{titleFont:{family:'Poppins'},bodyFont:{family:'Poppins'},
              backgroundColor:bgSurface,titleColor:isDark?'#F1F5F9':'#0F172A',bodyColor:tc,
              borderColor:isDark?'#334155':'#E2E8F0',borderWidth:1,
              callbacks:{label:function(ctx){return ' '+ctx.dataset.label+': '+ctx.raw+'%';}}}
          },
          scales:{r:{
            min:0,max:100,
            ticks:{stepSize:25,color:tc,font:{family:'Poppins',size:9},backdropColor:'transparent',
              callback:function(v){return v+'%';}},
            grid:{color:gc},
            pointLabels:{color:tc,font:{family:'Poppins',size:11,weight:'600'}},
            angleLines:{color:gc}
          }}
        }
      });
    }
  }
}
function toggleCmpSpec(btn){
  var s=btn.dataset.spec;
  var idx=cmpSelected.indexOf(s);
  if(idx>=0){cmpSelected.splice(idx,1);}
  else if(cmpSelected.length<4){cmpSelected.push(s);}
  renderCompare();
}
function setCmpType(t){cmpType=t;renderCompare();}


