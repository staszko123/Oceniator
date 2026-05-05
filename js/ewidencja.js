/* ══════════════════════════════════════════════
   EWIDENCJA — registry table, charts, export/import, score editor
══════════════════════════════════════════════ */

// EWIDENCJA
// ══════════════════════════════════════════════
const TL={r:'Rozmowy',m:'Maile',s:'Systemy'};
const SK={r:['mery','jak','sys'],m:['mery','jak','sys'],s:['obs','dok','eff']};
const SN={r:['Merytoryka','Jakość','Systemy'],m:['Merytoryka','Jakość','Systemy'],s:['Obsługa','Dokumentacja','Efektywność']};

function filterRows(){
  const ft=document.getElementById('ew-ft')?.value||'';
  const fr=document.getElementById('ew-fr')?.value||'';
  const fp=document.getElementById('ew-fp')?.value||'';
  const fs=document.getElementById('ew-fs')?.value||'';
  const fa=document.getElementById('ew-fa')?.value||'active';
  const fq=document.getElementById('ew-fq')?.value?.toLowerCase()||'';
  return scopedRegistry().filter(e=>
    (fa==='all'||(fa==='active'?!entryIsArchived(e):entryStatus(e)===fa))&&
    (!ft||e.p===ft)&&
    (!fr||e.rating===fr)&&
    (!fp||e.period?.startsWith(fp))&&
    (!fs||e.spec===fs)&&
    (!fq||e.spec?.toLowerCase().includes(fq)||e.dzial?.toLowerCase().includes(fq))
  ).sort((a,b)=>{
    let va=a[sortCol]??'',vb=b[sortCol]??'';
    if(sortCol==='avgFinal'){va=+va;vb=+vb;}
    return va<vb?sortDir:va>vb?-sortDir:0;
  });
}

let charts={};
function renderCharts(rows){
  const r=rows||filterRows();
  if(!r.length){
    document.getElementById('ew-charts-wrap').style.display='none';return;
  }
  document.getElementById('ew-charts-wrap').style.display='';
  if(typeof Chart==='undefined'){
    if(typeof chartAvailable==='function'){
      chartAvailable('chart-spec');
      chartAvailable('chart-trend');
    }
    return;
  }
  const isDark=document.documentElement.getAttribute('data-theme')==='dark';
  const textCol=isDark?'#94A3B8':'#64748B';
  const gridCol=isDark?'rgba(255,255,255,.06)':'rgba(0,0,0,.06)';
  const baseOpts={responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:textCol,font:{family:'Poppins',size:10}}},tooltip:{titleFont:{family:'Poppins'},bodyFont:{family:'Poppins'}}},scales:{y:{ticks:{color:textCol,font:{size:9}},grid:{color:gridCol},min:0,max:100},x:{ticks:{color:textCol,font:{size:9}},grid:{color:gridCol}}}};

  // Chart 1: wyniki po specjalistach (last entry per spec)
  const bySpec={};r.forEach(e=>{bySpec[e.spec]=e;});
  const specs=Object.keys(bySpec);
  const specScores=specs.map(s=>bySpec[s].avgFinal);
  const specColors=specScores.map(v=>v>=92?'#16A34A':v>=82?'#D97706':'#DC2626');
  const c1el=document.getElementById('chart-spec');
  if(charts.spec) charts.spec.destroy();
  charts.spec=new Chart(c1el,{type:'bar',data:{labels:specs,datasets:[{label:'Wynik końcowy (%)',data:specScores,backgroundColor:specColors,borderRadius:4}]},options:{...baseOpts,plugins:{...baseOpts.plugins,title:{display:false}}}});

  // Chart 2: trend po datach (all entries)
  const sorted=[...r].sort((a,b)=>a.data<b.data?-1:1);
  const c2el=document.getElementById('chart-trend');
  if(charts.trend) charts.trend.destroy();
  charts.trend=new Chart(c2el,{type:'line',data:{labels:sorted.map(e=>e.data),datasets:[{label:'Wynik (%)',data:sorted.map(e=>e.avgFinal),borderColor:'#0D9488',backgroundColor:'rgba(13,148,136,.12)',tension:.3,fill:true,pointRadius:4,pointBackgroundColor:'#0D9488'}]},options:{...baseOpts}});
}

function renderEw(){
  if(!document.getElementById('ew-stat-total')) buildEwidencjaTab();
  const rows=filterRows();
  const specSel=document.getElementById('ew-fs');
  if(specSel){
    const specs=[...new Set(scopedRegistry().filter(e=>!entryIsArchived(e)).map(e=>e.spec))].filter(Boolean).sort();
    const cur=specSel.value;
    specSel.innerHTML='<option value="">Wszyscy</option>'+specs.map(s=>`<option value="${s}"${s===cur?' selected':''}>${s}</option>`).join('');
  }
  const perSel=document.getElementById('ew-fp');
  if(perSel&&!perSel.dataset.dynamic){
    const opts=(adminData.periods||[]).map(p=>`<option value="${p.name||p.code}">${p.name||p.code} (${p.from} - ${p.to})</option>`).join('');
    perSel.innerHTML='<option value="">Wszystkie</option>'+opts;
    perSel.dataset.dynamic='1';
  }
  const total=rows.length,great=rows.filter(e=>e.rating==='great').length,good=rows.filter(e=>e.rating==='good').length;
  const avg=total?Math.round(rows.reduce((a,b)=>a+b.avgFinal,0)/total):0;
  const stTotal=document.getElementById('ew-stat-total'); if(stTotal) stTotal.textContent=total;
  const stGreat=document.getElementById('ew-stat-great'); if(stGreat) stGreat.textContent=great;
  const stGood=document.getElementById('ew-stat-good'); if(stGood) stGood.textContent=good+' / '+(total-great-good);
  const stAvg=document.getElementById('ew-stat-avg'); if(stAvg) stAvg.textContent=total?avg+'%':'—';
  renderCharts(rows);
  renderEwTable(rows);
}

function renderEwTable(rows){
  const tbody=document.getElementById('ew-tbody');
  if(!tbody) return;
  if(!rows.length){tbody.innerHTML=`<tr><td colspan="13"><div class="ew-empty"><div>📋</div>Brak danych dla wybranych filtrów.</div></td></tr>`;return;}
  tbody.innerHTML=rows.map((e,i)=>{
    const sk=SK[e.p];
    const pc=e.avgFinal>=92?'ep-great':e.avgFinal>=82?'ep-good':'ep-below';
    const bc=e.rating==='great'?'eb-great':e.rating==='good'?'eb-good':'eb-below';
    const tc={r:'eb-r',m:'eb-m',s:'eb-s'}[e.p];
    const status=entryStatusLabel(e);
    const statusCls=entryStatusClass(e);
    const archived=entryIsArchived(e);
    const locked=entryIsLocked(e);
    const statusAction=archived?'restoreEntry':'advanceEntryStatus';
    return `<tr style="${archived?'opacity:.62':''}">
      <td class="mu">${i+1}</td>
      <td><strong>${escHtml(e.spec)}</strong><br><span class="mu">${escHtml(e.dzial||'')}</span></td>
      <td><span class="ebadge ${tc}">${TL[e.p]}</span></td>
      <td><span class="ebadge" style="background:var(--navy-pale);color:var(--navy)">${e.period||'—'}</span></td>
      <td class="mu">${e.data}</td>
      <td class="mu">${escHtml(e.oce||'—')}</td>
      <td class="r epct ${e.secAvg[sk[0]]>=92?'ep-great':e.secAvg[sk[0]]>=82?'ep-good':'ep-below'}">${e.secAvg[sk[0]]}%</td>
      <td class="r epct ${e.secAvg[sk[1]]>=92?'ep-great':e.secAvg[sk[1]]>=82?'ep-good':'ep-below'}">${e.secAvg[sk[1]]}%</td>
      <td class="r epct ${e.secAvg[sk[2]]>=92?'ep-great':e.secAvg[sk[2]]>=82?'ep-good':'ep-below'}">${e.secAvg[sk[2]]}%</td>
      <td class="r"><strong class="epct ${pc}">${e.avgFinal}%</strong></td>
      <td><span class="ebadge ${bc}">${ratingLabel(e.rating)}</span></td>
      <td><span class="lock-badge status-badge ${statusCls}" onclick="${statusAction}(${e.id})">${status}</span></td>
      <td class="row-actions-cell">
        <button class="row-action-btn" onclick="editScores(${e.id})" ${(locked||!can('editOwn'))?'disabled':''}>Edytuj</button>
        <button class="ecopy row-more-btn" onclick="toggleRowActions(${e.id},event)">Więcej</button>
        <div class="row-actions-menu" id="row-actions-${e.id}">
          <button onclick="copyRow(${e.id})">Kopiuj</button>
          <button onclick="previewEntry(${e.id})">Podgląd</button>
          ${archived?`<button onclick="restoreEntry(${e.id})">Przywróć</button>`:`<button onclick="archiveEntry(${e.id})" ${(!can('archive'))?'disabled':''}>Archiwizuj</button>`}
          <button class="danger" onclick="deleteEntry(${e.id})" ${(!can('hardDelete')||entryStatus(e)==='approved')?'disabled':''}>Usuń trwale</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}
// EWIDENCJA render bootstrap
function buildEwidencjaTab(){
  var remoteMode=DataStore.isRemote&&DataStore.isRemote();
  document.getElementById('wrap-ew').innerHTML=`
    <div class="ew-top">
      <div class="ew-stat"><div class="ew-stat-lbl">Łącznie kart</div><div class="ew-stat-val" id="ew-stat-total">0</div><div class="ew-stat-sub">w widoku</div></div>
      <div class="ew-stat"><div class="ew-stat-lbl">Bardzo dobry</div><div class="ew-stat-val" style="color:var(--green)" id="ew-stat-great">0</div><div class="ew-stat-sub">≥ 92%</div></div>
      <div class="ew-stat"><div class="ew-stat-lbl">Dobry / Poniżej</div><div class="ew-stat-val" style="color:var(--amber)" id="ew-stat-good">0 / 0</div><div class="ew-stat-sub">82–91% / &lt;82%</div></div>
      <div class="ew-stat"><div class="ew-stat-lbl">Śr. wynik</div><div class="ew-stat-val" id="ew-stat-avg">—</div><div class="ew-stat-sub">z widoku</div></div>
    </div>
    <div id="ew-charts-wrap" style="display:none">
      <div class="charts-grid">
        <div class="chart-wrap"><div class="chart-title">📊 Wyniki per specjalista (ostatnia karta)</div><div class="chart-inner"><canvas id="chart-spec"></canvas></div></div>
        <div class="chart-wrap"><div class="chart-title">📈 Trend wyników w czasie</div><div class="chart-inner"><canvas id="chart-trend"></canvas></div></div>
      </div>
    </div>
    <div class="ew-toolbar">
      <div class="ew-fg"><label>Szukaj:</label><input type="text" id="ew-fq" placeholder="Specjalista / Dział..." oninput="renderEw()"></div>
      <div class="ew-fg"><label>Typ:</label><select id="ew-ft" onchange="renderEw()"><option value="">Wszystkie</option><option value="r">Rozmowy</option><option value="m">Maile</option><option value="s">Systemy</option></select></div>
      <div class="ew-fg"><label>Ocena:</label><select id="ew-fr" onchange="renderEw()"><option value="">Wszystkie</option><option value="great">Bardzo dobry</option><option value="good">Dobry</option><option value="below">Poniżej std.</option></select></div>
      <div class="ew-fg"><label>Okres:</label><select id="ew-fp" onchange="renderEw()"><option value="">Wszystkie</option><option value="P1">P1 (I–IV)</option><option value="P2">P2 (V–VIII)</option><option value="P3">P3 (IX–XII)</option></select></div>
      <div class="ew-fg"><label>Spec.:</label><select id="ew-fs" onchange="renderEw()"><option value="">Wszyscy</option></select></div>
      <div class="ew-fg"><label>Status:</label><select id="ew-fa" onchange="renderEw()"><option value="active">Aktywne</option><option value="submitted">Do weryfikacji</option><option value="review">W weryfikacji</option><option value="approved">Zatwierdzone</option><option value="archived">Archiwum</option><option value="all">Wszystkie</option></select></div>
      <div class="ew-toolbar-r">
        <button class="btn btn-outline btn-sm" onclick="copyTable()">📋 Kopiuj</button>
        <button class="btn btn-outline btn-sm" onclick="exportCSV()">⬇ CSV</button>
        <button class="btn btn-dark btn-sm" onclick="exportXLS()">⬇ Excel</button>
        <button class="btn btn-dark btn-sm" onclick="exportJSON()">⬇ JSON</button>
        ${remoteMode?'':'<button class="btn btn-outline btn-sm" onclick="openModal(&quot;import-modal&quot;)">📥 Import</button>'}
        <button id="sp-btn" class="btn btn-dark btn-sm" onclick="openInSharePoint()" style="display:none">📤 SharePoint</button>
        ${remoteMode?'':'<button class="btn btn-outline btn-sm" onclick="loadSeedData()">🧪 Dane testowe</button>'}
        <button class="btn btn-danger btn-sm" onclick="clearReg()">🗑 Wyczyść</button>
      </div>
    </div>
    <div class="ew-wrap">
      <table class="ewt">
        <thead><tr>
          <th onclick="sortBy('id')"># <span class="sort-arrow">↕</span></th>
          <th onclick="sortBy('spec')">Specjalista <span class="sort-arrow">↕</span></th>
          <th>Typ</th>
          <th onclick="sortBy('period')">Okres <span class="sort-arrow">↕</span></th>
          <th onclick="sortBy('data')">Data <span class="sort-arrow">↕</span></th>
          <th>Oceniający</th>
          <th class="r" onclick="sortBy('s1')">Sek.1 <span class="sort-arrow">↕</span></th>
          <th class="r" onclick="sortBy('s2')">Sek.2 <span class="sort-arrow">↕</span></th>
          <th class="r" onclick="sortBy('s3')">Sek.3 <span class="sort-arrow">↕</span></th>
          <th class="r" onclick="sortBy('avgFinal')">Wynik <span class="sort-arrow">↕</span></th>
          <th>Ocena</th>
          <th>Status</th>
          <th></th>
        </tr></thead>
        <tbody id="ew-tbody"></tbody>
      </table>
    </div>`;
  renderEw();
}

function sortBy(col){
  if(sortCol===col){sortDir*=-1;}else{sortCol=col;sortDir=-1;}
  document.querySelectorAll('.ewt thead th').forEach(th=>{th.classList.remove('sorted');});
  event?.target?.closest('th')?.classList.add('sorted');
  renderEw();
}

// ENTRY ACTIONS
function previewEntry(id){const e=registry.find(r=>r.id===id);if(e&&entryInScope(e)) openPrintView(e);}
function editEntry(id){
  const e=registry.find(r=>r.id===id);if(!e||!entryInScope(e)||entryIsLocked(e)||!can('editOwn')) return;
  editingId=id;
  document.getElementById('edit-notes').value=e.notes||'';
  openModal('edit-modal');
}
function saveEditNotes(){
  const e=registry.find(r=>r.id===editingId);
  if(e&&entryInScope(e)){e.notes=document.getElementById('edit-notes').value;saveRegistry();logChange('Edycja','Zmieniono notatkę: '+(e.spec||''));}
  closeModal('edit-modal');renderEw();showToast('Notatka zaktualizowana','ok');
}
function toggleLock(id){
  advanceEntryStatus(id);
}

function toggleRowActions(id,ev){
  if(ev) ev.stopPropagation();
  document.querySelectorAll('.row-actions-menu.open').forEach(function(menu){
    if(menu.id!=='row-actions-'+id) menu.classList.remove('open');
  });
  var menu=document.getElementById('row-actions-'+id);
  if(menu) menu.classList.toggle('open');
}
document.addEventListener('click',function(){
  document.querySelectorAll('.row-actions-menu.open').forEach(function(menu){menu.classList.remove('open');});
});
function advanceEntryStatus(id){
  const e=registry.find(r=>r.id===id);
  if(!e||!entryInScope(e)||entryIsArchived(e)||!can('archive')) return;
  var cur=entryStatus(e);
  var next=ENTRY_STATUS[cur].next;
  setEntryStatus(e,next,'Zmiana z ewidencji');
  saveRegistry();renderEw();logChange('Status',entryStatusLabel(e)+': '+(e.spec||''));
  showToast('Status: '+entryStatusLabel(e),'ok');
}
function archiveEntry(id){
  const e=registry.find(r=>r.id===id);
  if(!e||!entryInScope(e)||!can('archive')){showToast('Brak uprawnień','warn');return;}
  e.previousStatus=entryStatus(e);
  setEntryStatus(e,'archived','Archiwizacja');
  saveRegistry();updateBadge();renderEw();logChange('Archiwizacja','Zarchiwizowano kartę: '+(e.spec||''));showToast('Karta przeniesiona do archiwum','ok');
}
function restoreEntry(id){
  const e=registry.find(r=>r.id===id);
  if(!e||!entryInScope(e)||!can('archive')) return;
  setEntryStatus(e,e.previousStatus&&e.previousStatus!=='archived'?e.previousStatus:'submitted','Przywrócenie z archiwum');
  delete e.previousStatus;
  saveRegistry();updateBadge();renderEw();logChange('Archiwizacja','Przywrócono kartę: '+(e.spec||''));showToast('Karta przywrócona','ok');
}
async function deleteEntry(id){
  const e=registry.find(r=>r.id===id);
  if(!e||!entryInScope(e)||entryStatus(e)==='approved'||!can('hardDelete')){showToast('Tylko administrator może trwale usuwać niezatwierdzone karty','warn');return;}
  if(!confirm('Usunąć tę kartę trwale? Lepiej użyć archiwizacji, jeśli karta ma zostać w historii.')) return;
  try{
    if(DataStore.deleteRegistryEntry) await DataStore.deleteRegistryEntry(id);
  }catch(err){
    console.warn('[Ewidencja] Nie udało się usunąć karty z Supabase:',err);
    showToast('Nie udało się usunąć karty z Supabase','err');
    return;
  }
  registry=registry.filter(r=>r.id!==id);
  if(!DataStore.isRemote || !DataStore.isRemote()) saveRegistry();
  updateBadge();renderEw();logChange('Usunięcie','Trwale usunięto kartę: '+(e.spec||''));showToast('Karta usunięta trwale');
}
function copyRow(id){
  const e=registry.find(r=>r.id===id);if(!e||!entryInScope(e)) return;
  const sk=SK[e.p];
  const txt=[e.spec,TL[e.p],e.period||'',e.data,e.oce,e.secAvg[sk[0]]+'%',e.secAvg[sk[1]]+'%',e.secAvg[sk[2]]+'%',e.avgFinal+'%',ratingLabel(e.rating)].join('\t');
  navigator.clipboard.writeText(txt).then(()=>showToast('Skopiowano wiersz'));
}
function updateBadge(){var b=document.getElementById('ew-badge');if(b)b.textContent=scopedRegistry().filter(e=>!entryIsArchived(e)).length;}
function clearReg(){
  if(!can('archive')){showToast('Brak uprawnień','warn');return;}
  var active=scopedRegistry().filter(e=>!entryIsArchived(e)).length;
  if(!confirm(`Zarchiwizować wszystkie aktywne karty (${active})? Dane pozostaną dostępne w filtrze Archiwum.`)) return;
  registry.forEach(e=>{if(entryInScope(e)&&!entryIsArchived(e)){e.previousStatus=entryStatus(e);setEntryStatus(e,'archived','Archiwizacja zbiorcza');}});
  saveRegistry();updateBadge();renderEw();logChange('Archiwizacja','Zarchiwizowano wszystkie aktywne karty');showToast('Aktywne karty zarchiwizowane');
}
// EXPORT / IMPORT
function copyTable(){
  const rows=filterRows();if(!rows.length){showToast('Brak danych','err');return;}
  const hdr=['Lp','Specjalista','Dział','Typ','Okres','Data','Sek.1%','Sek.2%','Sek.3%','Wynik%','Ocena','Status'];
  const lines=[hdr.join('\t')];
  rows.forEach((e,i)=>{const sk=SK[e.p];lines.push([i+1,e.spec,e.dzial,TL[e.p],e.period||'',e.data,e.secAvg[sk[0]],e.secAvg[sk[1]],e.secAvg[sk[2]],e.avgFinal,ratingLabel(e.rating),entryStatusLabel(e)].join('\t'));});
  navigator.clipboard.writeText(lines.join('\n')).then(()=>showToast('Skopiowano '+rows.length+' wierszy'));
}
function exportCSV(){
  const rows=filterRows();if(!rows.length){showToast('Brak danych','err');return;}
  const hdr=['Lp','Specjalista','Stanowisko','Dział','Typ karty','Okres','Data oceny','Oceniający','Sekcja 1 (%)','Sekcja 2 (%)','Sekcja 3 (%)','Wynik końcowy (%)','Ocena','Status'];
  const csv='\uFEFF'+[hdr,  ...rows.map((e,i)=>{const sk=SK[e.p];return[i+1,e.spec,e.stand,e.dzial,TL[e.p],e.period||'',e.data,e.oce,e.secAvg[sk[0]],e.secAvg[sk[1]],e.secAvg[sk[2]],e.avgFinal,ratingLabel(e.rating),entryStatusLabel(e)];})].map(r=>r.map(v=>`"${v}"`).join(',')).join('\r\n');
  dl('Ewidencja_Ocen_PeP_P24.csv','text/csv;charset=utf-8',csv);showToast('CSV zapisany','ok');
}
function exportXLS(){
  const rows=filterRows();if(!rows.length){showToast('Brak danych','err');return;}
  const hdr=['Lp','Specjalista','Stanowisko','Dział','Typ karty','Okres','Data oceny','Oceniający','Sekcja 1 (%)','Sekcja 2 (%)','Sekcja 3 (%)','Wynik końcowy (%)','Ocena','Status'];
  let h='<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body><table>';
  h+='<tr style="background:#1B2E4B;color:white;font-weight:bold">'+hdr.map(v=>`<th>${v}</th>`).join('')+'</tr>';
  rows.forEach((e,i)=>{const sk=SK[e.p];const bg=e.rating==='great'?'#DCFCE7':e.rating==='good'?'#FEF3C7':'#FEE2E2';const vals=[i+1,escHtml(e.spec),escHtml(e.stand||''),escHtml(e.dzial||''),TL[e.p],e.period||'',e.data,escHtml(e.oce||''),e.secAvg[sk[0]]+'%',e.secAvg[sk[1]]+'%',e.secAvg[sk[2]]+'%',e.avgFinal+'%',ratingLabel(e.rating),entryStatusLabel(e)];h+=`<tr>${vals.map((v,vi)=>`<td style="${vi===11?'background:'+bg+';font-weight:bold':''}">${v}</td>`).join('')}</tr>`;});
  h+='</table></body></html>';dl('Ewidencja_Ocen_PeP_P24.xls','application/vnd.ms-excel',h);showToast('Excel zapisany','ok');
}
function exportJSON(){
  dl('Ewidencja_Ocen_PeP_P24.json','application/json',JSON.stringify(registry,null,2));
  showToast('JSON zapisany','ok');
}
function dl(fn,mime,content){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type:mime}));a.download=fn;a.click();}

// IMPORT
function dragOver(e){e.preventDefault();document.getElementById('import-drop').classList.add('drag');}
function dragLeave(){document.getElementById('import-drop').classList.remove('drag');}
function dropFile(e){e.preventDefault();dragLeave();const f=e.dataTransfer?.files[0];if(f) processImportFile(f);}
function handleImportFile(e){const f=e.target.files[0];if(f) processImportFile(f);}
function processImportFile(file){
  const reader=new FileReader();
  reader.onload=e=>{
    try{
      const data=JSON.parse(e.target.result);
      if(!Array.isArray(data)) throw new Error('Nieprawidłowy format');
      data.forEach(normalizeEntry);
      const merged=registry.filter(r=>!data.find(d=>d.id===r.id));
      registry=[...merged,...data].sort((a,b)=>a.data<b.data?-1:1);
      normalizeRegistry();
      saveRegistry();updateBadge();closeModal('import-modal');renderEw();
      showToast(`Zaimportowano ${data.length} kart`,'ok');
    }catch(err){showToast('Błąd importu: '+err.message,'err');}
  };
  reader.readAsText(file);
}

// SHAREPOINT
function saveSpConfig(){
  spConfig.url=document.getElementById('sp-url').value.trim();
  spConfig.sheet=document.getElementById('sp-sheet').value.trim();
  closeModal('sp-modal');
  document.getElementById('sp-btn').style.display=spConfig.url?'':'none';
  showToast(spConfig.url?'SharePoint skonfigurowany ✓':'Konfiguracja wyczyszczona');
}
function openInSharePoint(){
  if(!spConfig.url){showToast('Skonfiguruj URL SharePoint','err');return;}
  const rows=filterRows();if(!rows.length){showToast('Brak danych','err');return;}
  const last=rows[rows.length-1];const sk=SK[last.p];
  const txt=[last.spec,last.stand,last.dzial,TL[last.p],last.period||'',last.data,last.oce,last.secAvg[sk[0]]+'%',last.secAvg[sk[1]]+'%',last.secAvg[sk[2]]+'%',last.avgFinal+'%',ratingLabel(last.rating)].join('\t');
  navigator.clipboard.writeText(txt).then(()=>{showToast('Dane skopiowane — wklej w Excel Online (Ctrl+V)','ok');window.open(spConfig.url,'_blank');});
}

// ══════════════════════════════════════════════

// ── SCORE EDIT ──
var seId=null, seScores={}, seNotes={};
function editScores(id){
  var eid=Number(id);
  var e=registry.find(function(r){return r.id===eid;});
  if(!e){showToast('Nie znaleziono karty','err');return;}
  if(!entryInScope(e)){showToast('Brak dostępu do tej karty','warn');return;}
  if(entryIsArchived(e)||!can('editOwn')){showToast('Brak uprawnień lub karta w archiwum','warn');return;}
  if(entryStatus(e)==='approved'){showToast('Karta zatwierdzona','warn');return;}
  seId=eid;
  var def=DEFS[e.p],n=e.contactCount||3;
  seScores={};seNotes={};
  def.sections.forEach(function(sec){
    seScores[sec.key]={};
    sec.criteria.forEach(function(cr,ci){
      var sv=((e.snapshotScores||{})[sec.key]||{});
      seScores[sec.key][ci]=[].concat(sv[ci]||Array(n).fill(1));
    });
    var sn=(e.snapshotNotes||{})[sec.key]||[];
    seNotes[sec.key]=Array.from({length:n},function(_,i){return sn[i]||'';});
  });
  var body=document.getElementById('score-edit-body');
  if(!body) return;
  var sc={'sec-a':'#1B2E4B','sec-b':'#134E4A','sec-c':'#7C2D12'};
  var cw=Math.floor(55/n);
  var h='';
  def.sections.forEach(function(sec){
    var wPct=Math.round(sec.w*100);
    var ths=Array.from({length:n},function(_,i){return '<th style="width:'+cw+'%;text-align:center">'+def.cl+' '+(i+1)+'</th>';}).join('');
    var rows=sec.criteria.map(function(cr,ci){
      var tds=Array.from({length:n},function(_,c2){
        var v=seScores[sec.key][ci][c2];
        var s1=v===1?'s1':'',s05=v===0.5?'s05':'',s0=v===0?'s0':'',snd=v==='nd'?'snd':'';
        return '<td class="se-td-s"><div class="se-btns">'+
          '<button class="se-btn '+s1+'" onclick="seSet(\''+sec.key+'\','+ci+','+c2+',1,this)">1</button>'+
          '<button class="se-btn '+s05+'" onclick="seSet(\''+sec.key+'\','+ci+','+c2+',0.5,this)">½</button>'+
          '<button class="se-btn '+s0+'" onclick="seSet(\''+sec.key+'\','+ci+','+c2+',0,this)">0</button>'+
          '<button class="se-btn '+snd+'" onclick="seSet(\''+sec.key+'\','+ci+','+c2+',\'nd\',this)">N/D</button>'+
          '</div></td>';
      }).join('');
      return '<tr><td class="se-td-n">'+cr.n+'</td>'+tds+'</tr>';
    }).join('');
    var nc=Array.from({length:n},function(_,c2){
      return '<div class="se-note-cell"><div class="se-note-lbl">'+def.cl+' '+(c2+1)+'</div>'+
        '<textarea id="sen-'+sec.key+'-'+c2+'" rows="2">'+seNotes[sec.key][c2]+'</textarea></div>';
    }).join('');
    h+='<div class="se-sec">'+
      '<div class="se-sec-hdr '+sec.cls+'" style="background:'+sc[sec.cls]+'">'+
        '<span>'+sec.lbl+'</span><span class="se-sec-wt">waga '+wPct+'%</span>'+
      '</div>'+
      '<table class="se-tbl"><thead><tr><th class="se-th-c">Kryterium</th>'+ths+'</tr></thead><tbody>'+rows+'</tbody></table>'+
      '<div class="se-notes"><div class="se-notes-lbl">Uwagi</div><div class="se-notes-cells">'+nc+'</div></div>'+
    '</div>';
  });
  body.innerHTML=h;
  document.getElementById('score-edit-gnotes').value=e.notes||'';
  openModal('score-edit-modal');
}
function seSet(sk,ci,c2,val,btn){
  seScores[sk][ci][c2]=val;
  var cell=btn.closest('.se-td-s');
  cell.querySelectorAll('.se-btn').forEach(function(b){b.classList.remove('s1','s05','s0','snd');});
  if(val===1)btn.classList.add('s1');
  else if(val===0.5)btn.classList.add('s05');
  else if(val===0)btn.classList.add('s0');
  else btn.classList.add('snd');
}
function saveScoreEdit(){
  var e=registry.find(function(r){return r.id===seId;});
  if(!e) return;
  if(!entryInScope(e)){showToast('Brak dostępu do tej karty','warn');return;}
  var def=DEFS[e.p],n=e.contactCount||3;
  def.sections.forEach(function(sec){
    seNotes[sec.key]=Array.from({length:n},function(_,c2){
      var el=document.getElementById('sen-'+sec.key+'-'+c2);
      return el?el.value:'';
    });
  });
  e.snapshotScores={};e.snapshotNotes={};
  def.sections.forEach(function(sec){
    e.snapshotScores[sec.key]={};
    sec.criteria.forEach(function(_,ci){e.snapshotScores[sec.key][ci]=[].concat(seScores[sec.key][ci]);});
    e.snapshotNotes[sec.key]=[].concat(seNotes[sec.key]);
  });
  e.notes=document.getElementById('score-edit-gnotes').value;
  var results=Array.from({length:n},function(_,ci){
    var total=0,parts={};
    def.sections.forEach(function(sec){
      var vals=sec.criteria.map(function(_,cri){return seScores[sec.key][cri][ci];});
      var valid=vals.filter(function(v){return v!=='nd';});
      var sum=valid.length?valid.reduce(function(a,b){return a+b;},0):0;
      var ratio=valid.length?sum/valid.length:1;
      total+=ratio*sec.w;
      parts[sec.key]=Math.round(ratio*100);
    });
    var pct=Math.round(total*100);
    var g=(e.gold||[])[ci]||0;
    return{pct:g>0&&pct<100?Math.min(100,pct+g*10):pct,parts:parts};
  });
  e.avgFinal=Math.round(results.reduce(function(a,b){return a+b.pct;},0)/results.length);
  e.rating=e.avgFinal>=92?'great':e.avgFinal>=82?'good':'below';
  e.contactResults=results.map(function(r){return{pct:r.pct,pts:{sum:0,max:0}};});
  def.sections.forEach(function(sec){
    var vals=results.map(function(r){return r.parts[sec.key];});
    e.secAvg[sec.key]=Math.round(vals.reduce(function(a,b){return a+b;},0)/vals.length);
  });
  saveRegistry();logChange('Edycja','Zmieniono oceny: '+(e.spec||''));closeModal('score-edit-modal');renderEw();showToast('Oceny zaktualizowane','ok');
}


