/* ══════════════════════════════════════════════
   FORMS — form builder, submit, print view
══════════════════════════════════════════════ */

// BUILD FORM
// ══════════════════════════════════════════════
function buildForm(p){
  const def=DEFS[p];const n=state[p].count;
  const wrap=document.getElementById(`wrap-${p}`);
  const bootDraft=!document.getElementById(`${p}-spec`)?getDrafts()[p]:null;
  const savedSpec=document.getElementById(`${p}-spec`)?.value||bootDraft?.spec||'';
  const savedStand=document.getElementById(`${p}-stand`)?.value||bootDraft?.stand||'';
  const savedDzial=document.getElementById(`${p}-dzial`)?.value||bootDraft?.dzial||'';
  const savedOce=document.getElementById(`${p}-oce`)?.value||bootDraft?.oce||DataStore.getSavedAssessor()||'';
  const savedData=document.getElementById(`${p}-data`)?.value||bootDraft?.data||new Date().toISOString().split('T')[0];
  const savedGnotes=document.getElementById(`${p}-gnotes`)?.value||bootDraft?.gnotes||'';
  const savedGoldDesc=document.getElementById(`${p}-gold-desc`)?.value||state[p].goldDesc;
  // sync DOM→state before rebuild
  if(document.getElementById(`${p}-id-0`)){
    state[p].ids=Array.from({length:state[p].count},(_,i)=>document.getElementById(`${p}-id-${i}`)?.value||'');
  }
  DEFS[p].sections.forEach(sec=>{
    for(let c=0;c<state[p].count;c++){
      const el=document.getElementById(`sn-${p}-${sec.key}-${c}`);
      if(el) state[p].notes[sec.key][c]=el.value||'';
    }
  });
  const period=periodOf(savedData);
  const periodHtml=period?`<span class="period-badge">📅 ${period}</span>`:'';
  const countLabel={r:'rozmów',m:'maili',s:'kontaktów'}[p]||`${def.cl.toLowerCase()}ów`;
  const specialistOptions=getSpecialistOptions();
  const specListId=`${p}-spec-list`;
  const specOptionsHtml=specialistOptions.map(s=>`<option value="${String(s).replace(/"/g,'&quot;')}"></option>`).join('');

  const idsHtml=Array.from({length:n},(_,i)=>`
    <div class="id-cell">
      <div class="id-cell-lbl"><span>${def.cl} ${i+1}</span><span>${i+1}</span></div>
      <input type="text" id="${p}-id-${i}" value="${(state[p].ids[i]||'').replace(/"/g,'&quot;')}" placeholder="ID, numer sprawy lub dane kontaktu">
    </div>`).join('');

  const sectionsHtml=def.sections.map(sec=>{
    const wPct=Math.round(sec.w*100);
    const rowsHtml=sec.criteria.map((crit,ci)=>{
      const cells=Array.from({length:n},(_,c)=>{
        const val=state[p].scores[sec.key][ci]?.[c]??1;
        const cls=val===1?'s1':val===0.5?'s05':val===0?'s0':val==='nd'?'snd':'s1';
        return `<td class="td-score">
          <div class="sbtn-row">
            <button class="sbtn ${cls==='s1'?'s1':''}" onclick="setScore('${p}','${sec.key}',${ci},${c},1,this)" title="Spełniony">1</button>
            <button class="sbtn ${cls==='s05'?'s05':''}" onclick="setScore('${p}','${sec.key}',${ci},${c},0.5,this)" title="Częściowo">½</button>
            <button class="sbtn ${cls==='s0'?'s0':''}" onclick="setScore('${p}','${sec.key}',${ci},${c},0,this)" title="Niespełniony">0</button>
            <button class="sbtn ${cls==='snd'?'snd':''}" onclick="setScore('${p}','${sec.key}',${ci},${c},'nd',this)" title="Nie dotyczy">N/D</button>
          </div></td>`;
      }).join('');
      const hid=`h-${p}-${sec.key}-${ci}`;
      return `<tr class="crow">
        <td class="td-name">
          <div class="crit-nm">${crit.n}<span class="hint-btn" onclick="toggleHint('${hid}')">?</span></div>
          <div class="hint-box" id="${hid}">${crit.h}</div>
        </td>${cells}</tr>`;
    }).join('');
    const colW=Math.floor(64/n);
    const thCols=Array.from({length:n},(_,i)=>`<th style="width:${colW}%">${def.cl} ${i+1}</th>`).join('');
    const notesCells=Array.from({length:n},(_,c)=>{
      const suggestions=(SUGGESTIONS[sec.key]||[]).slice(0,4)
        .map(s=>`<span class="comment-chip" onclick="appendComment('sn-${p}-${sec.key}-${c}','${s}')">${s}</span>`).join('');
      return `<div class="snotes-cell">
        <div class="snotes-cl">${def.cl} ${c+1}</div>
        <textarea class="ntextarea" id="sn-${p}-${sec.key}-${c}" rows="2" placeholder="Uwagi...">${state[p].notes[sec.key]?.[c]||''}</textarea>
        <div class="comment-chips" id="chips-${p}-${sec.key}-${c}" style="display:none">${suggestions}</div>
        <div class="comment-suggest-btn" onclick="toggleChips('chips-${p}-${sec.key}-${c}')">💬 podpowiedzi</div>
      </div>`;
    }).join('');
    return `<div class="sec ${sec.cls}" id="${p}-sec-${sec.key}">
      <div class="sec-hdr" onclick="toggleSec('${p}-sec-${sec.key}')">
        <span class="sec-lbl">${sec.lbl}</span>
        <span class="sec-wt">waga ${wPct}%</span>
        <span class="sec-score" id="${p}-ss-${sec.key}">—</span>
        <span class="sec-chev">▾</span>
      </div>
      <div class="sec-body">
        <table class="ctable">
          <thead class="ctable-head"><tr><th class="th-crit">Kryterium</th>${thCols}</tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <div class="snotes-row">
          <div class="snotes-lbl">Uwagi do sekcji</div>
          <div class="snotes-cells">${notesCells}</div>
        </div>
      </div></div>`;
  }).join('');

  const goldItemsHtml=Array.from({length:n},(_,i)=>`
    <div class="gold-item">
      <label>${def.cl} ${i+1}</label>
      <div class="gold-btns">
        <button class="gbtn ${state[p].gold[i]===0?'on':''}" onclick="setGold('${p}',${i},0,this)">0</button>
        <button class="gbtn ${state[p].gold[i]===0.5?'on':''}" onclick="setGold('${p}',${i},0.5,this)">+0,5</button>
        <button class="gbtn ${state[p].gold[i]===1?'on':''}" onclick="setGold('${p}',${i},1,this)">+1</button>
      </div></div>`).join('');

  const resBoxesHtml=Array.from({length:n},(_,i)=>`
    <div class="res-box" id="${p}-rb-${i}">
      <div class="res-lbl">${def.cl} ${i+1}</div>
      <div class="res-pct" id="${p}-rp-${i}">—</div>
      <div class="res-pts" id="${p}-rpts-${i}">—</div>
      <div class="res-badge" id="${p}-rbg-${i}">—</div>
    </div>`).join('');

  wrap.innerHTML=`
    <div id="${p}-val-banner" style="display:none"></div>
    <div class="form-workspace">
    <aside class="spec-context" id="${p}-spec-context">
      <div class="spec-context-hdr">
        <div class="spec-context-title">Kontekst specjalisty</div>
        <div class="spec-context-sub" id="${p}-spec-context-sub">${period?`Statystyki dla ${period}`:'Statystyki dla wybranego periodu'}</div>
      </div>
      <div class="spec-context-body" id="${p}-spec-context-body">${specPeriodStatsHtml(savedSpec,period)}</div>
    </aside>
    <div class="form-main">
    <div class="card">
      <div class="meta-row meta-row-compact">
        <div class="mf mf-spec"><label>Specjalista</label>
          ${specialistOptions.length ?
            `<input type="text" id="${p}-spec" list="${specListId}" value="${savedSpec.replace(/"/g,'&quot;')}" placeholder="Zacznij wpisywać specjalistę..." oninput="onSpecChange('${p}')" autocomplete="off">
             <datalist id="${specListId}">${specOptionsHtml}</datalist>` :
            `<input type="text" id="${p}-spec" value="${savedSpec}" placeholder="Imię i nazwisko" oninput="onSpecChange('${p}')">`
          }
        </div>
        <div class="mf"><label>Data oceny</label><input type="date" id="${p}-data" value="${savedData}" oninput="updatePeriod('${p}')"></div>
      </div>
      <div class="meta-autofill" id="${p}-af" ${savedSpec?'':'style="display:none"'}>
        <span class="af-chip"><span class="af-lbl">Stanowisko</span><span class="af-val" id="${p}-af-stand">${savedStand||'—'}</span></span>
        <span class="af-sep">·</span>
        <span class="af-chip"><span class="af-lbl">Dział</span><span class="af-val" id="${p}-af-dzial">${savedDzial||'—'}</span></span>
        <span class="af-sep">·</span>
        <span class="af-chip"><span class="af-lbl">Oceniający</span><span class="af-val" id="${p}-af-oce">${savedOce||'—'}</span></span>
      </div>
      <input type="hidden" id="${p}-stand" value="${savedStand}">
      <input type="hidden" id="${p}-dzial" value="${savedDzial}">
      <input type="hidden" id="${p}-oce" value="${savedOce}">
      <div class="contact-bar">
        <span class="contact-bar-label">Liczba ${countLabel}:</span>
        <button class="cb-btn" onclick="changeCount('${p}',-1)" id="${p}-btn-minus" ${n<=MIN_CONTACTS?'disabled':''}>−</button>
        <span class="contact-count" id="${p}-count">${n}</span>
        <button class="cb-btn" onclick="changeCount('${p}',1)" id="${p}-btn-plus" ${n>=MAX_CONTACTS?'disabled':''}>+</button>
        <div class="cb-divider"></div>
        <span id="${p}-period-badge">${periodHtml}</span>
      </div>
      <div class="ids-grid" id="${p}-ids-grid" style="--contact-count:${n}">
        <div class="ids-spacer">
          <div class="ids-spacer-title">Dane kontaktów</div>
          <div class="ids-spacer-sub">Każde pole odpowiada kolumnie oceny po prawej.</div>
        </div>
        <div class="id-cols">${idsHtml}</div>
      </div>
      <div class="scale-bar">
        <div class="sc-item"><span class="sc-chip chip-1">1</span> W pełni spełniony</div>
        <div class="sc-item"><span class="sc-chip chip-05">½</span> Częściowo</div>
        <div class="sc-item"><span class="sc-chip chip-0">0</span> Niespełniony</div>
        <div class="sc-item"><span class="sc-chip chip-nd">N/D</span> Nie dotyczy</div>
      </div>
    </div>
    ${sectionsHtml}
    <div class="gold-blk">
      <div class="gold-ttl">⭐ Złote Punkty <span style="font-size:10px;font-weight:400;color:var(--text3)">— za wyjątkowe zaangażowanie</span></div>
      <div class="gold-items">${goldItemsHtml}</div>
      <div class="gold-desc"><label>Opis sytuacji</label>
        <textarea id="${p}-gold-desc" placeholder="Opisz co wyróżniało zachowanie specjalisty...">${savedGoldDesc}</textarea>
      </div>
    </div>
    <div class="gen-notes gen-notes-bottom"><label>Uwagi ogólne / podsumowanie oceny</label>
      <textarea id="${p}-gnotes" placeholder="Wnioski, plan działania, obszary do rozwoju...">${savedGnotes}</textarea>
    </div>
    <div class="res-panel">
      <div class="res-hdr">
        <span>Wynik końcowy</span>
      </div>
      <div class="res-body">
        <div class="res-grid">${resBoxesHtml}
          <div class="res-box final-box">
            <div class="res-lbl">Wynik końcowy (średnia)</div>
            <div class="res-pct" id="${p}-rp-f">—</div>
            <div class="res-pts" id="${p}-rpts-f">—</div>
            <div class="res-badge" id="${p}-rbg-f">—</div>
          </div>
        </div>
      </div>
    </div>
    <div class="act-bar">
      <span class="act-bar-txt">Po wypełnieniu — dodaj do ewidencji i wygeneruj kartę dla specjalisty <span id="${p}-draft-state" style="color:var(--text3);margin-left:8px"></span></span>
      <button class="btn btn-outline btn-sm" onclick="printCard('${p}')">🖨️ Drukuj kartę</button>
      <button class="btn btn-outline btn-sm" onclick="clearCurrentDraft('${p}')">Wyczyść szkic</button>
      <button class="btn btn-primary" onclick="submitCard('${p}')">+ Dodaj kartę</button>
    </div>
    </div></div>`;
  var fw=wrap.querySelector('.form-workspace');
  if(fw){
    fw.addEventListener('input',function(){saveDraft(p);});
    fw.addEventListener('change',function(){saveDraft(p);});
  }
  recalc(p);
}
// (buildForm called in boot sequence after adminData loads)

// ══════════════════════════════════════════════
// CONTACT COUNT
// ══════════════════════════════════════════════
function changeCount(p,delta){
  const def=DEFS[p];const oldN=state[p].count;
  const newN=Math.max(MIN_CONTACTS,Math.min(MAX_CONTACTS,oldN+delta));
  if(newN===oldN) return;
  state[p].ids=Array.from({length:oldN},(_,i)=>document.getElementById(`${p}-id-${i}`)?.value||'');
  def.sections.forEach(sec=>{for(let c=0;c<oldN;c++){const el=document.getElementById(`sn-${p}-${sec.key}-${c}`);if(el) state[p].notes[sec.key][c]=el.value||'';}});
  state[p].goldDesc=document.getElementById(`${p}-gold-desc`)?.value||'';
  const diff=Math.abs(newN-oldN);
  if(newN>oldN){
    state[p].gold.push(...Array(diff).fill(0));state[p].ids.push(...Array(diff).fill(''));
    def.sections.forEach(sec=>{state[p].notes[sec.key].push(...Array(diff).fill(''));sec.criteria.forEach((_,ci)=>{state[p].scores[sec.key][ci].push(...Array(diff).fill(1));});});
  } else {
    state[p].gold.splice(newN,diff);state[p].ids.splice(newN,diff);
    def.sections.forEach(sec=>{state[p].notes[sec.key].splice(newN,diff);sec.criteria.forEach((_,ci)=>{state[p].scores[sec.key][ci].splice(newN,diff);});});
  }
  state[p].count=newN;buildForm(p);saveDraft(p);
}


function validateForm(p){
  const errors=[];
  const spec=document.getElementById(`${p}-spec`)?.value?.trim();
  const data=document.getElementById(`${p}-data`)?.value?.trim();
  const oce=document.getElementById(`${p}-oce`)?.value?.trim();
  if(!spec){errors.push('Brak imienia i nazwiska specjalisty');document.getElementById(`${p}-spec`)?.classList.add('invalid');}
  if(spec && !getPersonByName(spec) && activeLeaderScope()){
    errors.push('Wybrany specjalista nie należy do Twojego zespołu');
    document.getElementById(`${p}-spec`)?.classList.add('invalid');
  }
  if(!data){errors.push('Brak daty oceny');document.getElementById(`${p}-data`)?.classList.add('invalid');}
  if(!oce){errors.push('Brak nazwiska oceniającego');}
  // check any ID filled
  const n=state[p].count;
  const anyId=Array.from({length:n},(_,i)=>document.getElementById(`${p}-id-${i}`)?.value?.trim()).some(Boolean);
  if(!anyId) errors.push('Brak ID kontaktu — uzupełnij co najmniej jeden');
  return errors;
}

function showValidation(p,errors){
  const banner=document.getElementById(`${p}-val-banner`);
  if(!banner) return;
  if(!errors.length){banner.style.display='none';return;}
  banner.style.display='block';
  banner.innerHTML=`<div class="val-banner">⚠️ <div><strong>Przed zapisem uzupełnij:</strong><ul>${errors.map(e=>`<li>${e}</li>`).join('')}</ul></div></div>`;
  banner.scrollIntoView({behavior:'smooth',block:'nearest'});
  setTimeout(()=>{document.querySelectorAll('.invalid').forEach(el=>el.classList.remove('invalid'));},3000);
}

// ══════════════════════════════════════════════
// SNAPSHOT & SUBMIT
// ══════════════════════════════════════════════
function snapshotForm(p){
  const def=DEFS[p];const n=state[p].count;
  state[p].ids=Array.from({length:n},(_,i)=>document.getElementById(`${p}-id-${i}`)?.value||'');
  def.sections.forEach(sec=>{for(let c=0;c<n;c++){const el=document.getElementById(`sn-${p}-${sec.key}-${c}`);if(el) state[p].notes[sec.key][c]=el.value||'';}});
  const snapshotScores={};
  def.sections.forEach(sec=>{snapshotScores[sec.key]={};sec.criteria.forEach((_,ci)=>{snapshotScores[sec.key][ci]=[...state[p].scores[sec.key][ci]];});});
  const snapshotNotes={};
  def.sections.forEach(sec=>{snapshotNotes[sec.key]=[...state[p].notes[sec.key]];});
  return{snapshotScores,snapshotNotes,ids:[...state[p].ids],gold:[...state[p].gold],goldDesc:document.getElementById(`${p}-gold-desc`)?.value||''};
}
function captureDraft(p){
  const snap=snapshotForm(p);
  return {
    count:state[p].count,
    spec:document.getElementById(`${p}-spec`)?.value||'',
    stand:document.getElementById(`${p}-stand`)?.value||'',
    dzial:document.getElementById(`${p}-dzial`)?.value||'',
    oce:document.getElementById(`${p}-oce`)?.value||'',
    data:document.getElementById(`${p}-data`)?.value||'',
    gnotes:document.getElementById(`${p}-gnotes`)?.value||'',
    scores:snap.snapshotScores,notes:snap.snapshotNotes,ids:snap.ids,gold:snap.gold,goldDesc:snap.goldDesc,
    savedAt:new Date().toISOString()
  };
}
function saveDraft(p){
  var wrap=document.getElementById(`wrap-${p}`);if(!wrap) return;
  var d=captureDraft(p), drafts=getDrafts();
  if(formHasContent(d)){drafts[p]=d;}else{delete drafts[p];}
  draftDirty=Object.values(drafts).some(formHasContent);
  setDrafts(drafts);
  updateDraftStartButton();
  var el=document.getElementById(`${p}-draft-state`);
  if(el) el.textContent='Roboczo zapisano '+new Date().toLocaleTimeString('pl-PL',{hour:'2-digit',minute:'2-digit'});
}
function clearDraft(p){
  var drafts=getDrafts();delete drafts[p];setDrafts(drafts);
  draftDirty=Object.values(drafts).some(formHasContent);
  updateDraftStartButton();
}
function applyDraft(p,d){
  if(!d) return;
  state[p].count=d.count||3;
  initState(p);
  state[p].ids=[...(d.ids||[])];
  state[p].gold=[...(d.gold||Array(state[p].count).fill(0))];
  state[p].goldDesc=d.goldDesc||'';
  if(d.scores) state[p].scores=d.scores;
  if(d.notes) state[p].notes=d.notes;
}
function restoreDraftsOnBoot(){
  var drafts=getDrafts();
  ['r','m','s'].forEach(function(p){if(formHasContent(drafts[p])){applyDraft(p,drafts[p]);}});
}
function firstDraftType(){
  var drafts=getDrafts();
  return ['r','m','s'].find(function(p){return formHasContent(drafts[p]);})||'r';
}
function updateDraftStartButton(){
  var btn=document.getElementById('continue-draft-btn');if(!btn)return;
  var drafts=getDrafts(), has=['r','m','s'].some(function(p){return formHasContent(drafts[p]);});
  btn.style.display=has?'inline-flex':'none';
}
function continueDraft(){
  enterApp({r:'rozmowy',m:'maile',s:'systemy'}[firstDraftType()]||'rozmowy');
}

function buildEntry(p){
  const n=state[p].count;
  const errors=validateForm(p);
  if(errors.length){showValidation(p,errors);return null;}
  showValidation(p,[]);
  const snap=snapshotForm(p);
  const results=Array.from({length:n},(_,ci)=>{
    const{pct,parts,pts}=calcContact(p,ci);const g=snap.gold[ci]||0;
    return{ci,finalPct:g>0&&pct<100?Math.min(100,pct+g*10):pct,parts,pts};
  });
  const avgFinal=Math.round(results.reduce((a,b)=>a+b.finalPct,0)/results.length);
  const secAvg={};
  DEFS[p].sections.forEach(sec=>{const vals=results.map(r=>r.parts[sec.key]);secAvg[sec.key]=Math.round(vals.reduce((a,b)=>a+b,0)/vals.length);});
  const data=document.getElementById(`${p}-data`)?.value||'';
  return{
    id:Date.now(),p,status:'submitted',locked:false,createdAt:new Date().toISOString(),
    spec:document.getElementById(`${p}-spec`)?.value?.trim()||'',
    stand:document.getElementById(`${p}-stand`)?.value||'',
    dzial:document.getElementById(`${p}-dzial`)?.value||'',
    oce:document.getElementById(`${p}-oce`)?.value||'',
    data,period:periodOf(data),avgFinal,secAvg,
    contactResults:results.map(r=>({pct:r.finalPct,pts:r.pts})),
    rating:avgFinal>=92?'great':avgFinal>=82?'good':'below',
    notes:document.getElementById(`${p}-gnotes`)?.value||'',
    contactCount:n,...snap,
  };
}

function submitCard(p){
  if(!can('create')){showToast('Bieżąca rola nie może dodawać kart','warn');return;}
  const entry=buildEntry(p);
  if(!entry) return;
  registry.push(entry);
  saveRegistry();
  clearDraft(p);
  lastSavedEntry=entry;
  logChange('Dodanie','Dodano kartę: '+(entry.spec||''));
  updateBadge();
  showToast('✓ Karta dodana','ok');
  showAfterSave(entry);
}
function printCard(p){const entry=buildEntry(p);if(entry) openPrintView(entry);}
function showAfterSave(entry){
  var old=document.getElementById('after-save-modal');if(old) old.remove();
  var div=document.createElement('div');
  div.className='modal-overlay open';div.id='after-save-modal';
  div.innerHTML='<div class="modal" style="max-width:430px"><h3>✓ Karta zapisana</h3><p>Co chcesz zrobić dalej?</p><div class="modal-btns" style="justify-content:flex-start;flex-wrap:wrap">'+
    '<button class="btn btn-primary btn-sm" onclick="newCardForLastSpec()">Nowa karta tego specjalisty</button>'+
    '<button class="btn btn-outline btn-sm" onclick="closeAfterSave();switchTab(&quot;ewidencja&quot;)">Przejdź do ewidencji</button>'+
    '<button class="btn btn-outline btn-sm" onclick="if(lastSavedEntry)openPrintView(lastSavedEntry)">Drukuj ponownie</button>'+
    '<button class="btn btn-outline btn-sm" onclick="closeAfterSave()">Zamknij</button>'+
    '</div></div>';
  document.body.appendChild(div);
}
function closeAfterSave(){var el=document.getElementById('after-save-modal');if(el)el.remove();}
function newCardForLastSpec(){
  if(!lastSavedEntry) return;
  var p=lastSavedEntry.p;
  state[p].count=lastSavedEntry.contactCount||3;initState(p);buildForm(p);
  ['spec','stand','dzial','oce'].forEach(function(k){var el=document.getElementById(p+'-'+k);if(el) el.value=lastSavedEntry[k]||'';});
  refreshSpecContext(p);closeAfterSave();switchTab({r:'rozmowy',m:'maile',s:'systemy'}[p]);
}

// ══════════════════════════════════════════════
// PRINT VIEW
// ══════════════════════════════════════════════
function openPrintView(entry){
  const p=entry.p;const def=DEFS[p];const n=entry.contactCount;
  const rl=ratingLabel(entry.rating);
  const rc=entry.rating==='great'?'#16A34A':entry.rating==='good'?'#D97706':'#DC2626';
  const rb=entry.rating==='great'?'#DCFCE7':entry.rating==='good'?'#FEF3C7':'#FEE2E2';
  const secColorMap={'sec-a':'#1B2E4B','sec-b':'#134E4A','sec-c':'#7C2D12'};
  const fileName=`${def.name} - ${(entry.spec||'').trim()} - ${entry.period||entry.data}`;

  const sectionsHtml=def.sections.map(sec=>{
    const sColor=secColorMap[sec.cls]||'#1B2E4B';
    const wPct=Math.round(sec.w*100);
    const colW=Math.floor(55/n);
    const ths=Array.from({length:n},(_,i)=>`<th style="width:${colW}%;text-align:center;padding:5px 7px;font-size:9px;font-weight:600;text-transform:uppercase;color:#64748B;background:#F1F5F9;border-bottom:1px solid #E2E8F0">${def.cl} ${i+1}</th>`).join('');
    const rows=sec.criteria.map((crit,ci)=>{
      const cells=Array.from({length:n},(_,c)=>{
        const val=(entry.snapshotScores[sec.key]||{})[ci]?.[c]??1;
        const dv=val===0.5?'½':val==='nd'?'N/D':String(val);
        const bg=val===1?'#DCFCE7':val===0.5?'#FEF3C7':val===0?'#FEE2E2':'#F1F5F9';
        const col=val===1?'#16A34A':val===0.5?'#D97706':val===0?'#DC2626':'#64748B';
        return `<td style="padding:5px 6px;text-align:center;border-bottom:1px solid #E2E8F0"><span style="display:inline-block;padding:2px 9px;border-radius:4px;font-size:11px;font-weight:700;background:${bg};color:${col}">${dv}</span></td>`;
      }).join('');
      return `<tr style="background:${ci%2?'#FAFBFC':'#fff'}"><td style="padding:6px 10px;font-size:10px;font-weight:500;border-bottom:1px solid #E2E8F0">${crit.n}</td>${cells}</tr>`;
    }).join('');
    const notesCells=Array.from({length:n},(_,c)=>{
      const v=((entry.snapshotNotes[sec.key]||[])[c]||'').trim();
      return `<td style="padding:6px 8px;font-size:10px;color:#475569;border-top:1.5px solid #CBD5E1;vertical-align:top">${v?`<div style="background:#fff;border:1px solid #E2E8F0;border-radius:3px;padding:4px 7px;line-height:1.5">${v}</div>`:'<span style="color:#CBD5E1">—</span>'}</td>`;
    }).join('');
    return `<div style="margin-bottom:10px;border:1px solid #E2E8F0;border-radius:6px;overflow:hidden;break-inside:avoid">
      <div style="background:${sColor};padding:7px 12px;display:flex;align-items:center;justify-content:space-between">
        <span style="font-size:11px;font-weight:700;color:#fff">${sec.lbl}</span>
        <span style="font-size:9px;color:rgba(255,255,255,.65);background:rgba(0,0,0,.2);padding:2px 8px;border-radius:20px">waga ${wPct}%</span>
      </div>
      <table style="width:100%;border-collapse:collapse;table-layout:fixed">
        <thead><tr><th style="width:45%;padding:5px 10px;font-size:9px;font-weight:600;text-transform:uppercase;color:#64748B;background:#F1F5F9;border-bottom:1px solid #E2E8F0;text-align:left">Kryterium</th>${ths}</tr></thead>
        <tbody>${rows}<tr style="background:#F8FAFC"><td style="padding:6px 10px;font-size:9px;font-weight:600;text-transform:uppercase;color:#64748B;border-top:1.5px solid #CBD5E1">Uwagi</td>${notesCells}</tr></tbody>
      </table></div>`;
  }).join('');

  const resBoxes=Array.from({length:n},(_,ci)=>{
    const r=entry.contactResults[ci];if(!r) return '';
    const pct=r.pct,pts=r.pts;
    const bg=pct>=92?'#DCFCE7':pct>=82?'#FEF3C7':'#FEE2E2';
    const col=pct>=92?'#16A34A':pct>=82?'#D97706':'#DC2626';
    return `<div style="flex:1;min-width:70px;border:1.5px solid ${col}30;border-radius:5px;padding:8px;text-align:center;background:${bg}">
      <div style="font-size:9px;font-weight:600;text-transform:uppercase;color:#64748B;margin-bottom:2px">${def.cl} ${ci+1}</div>
      <div style="font-size:20px;font-weight:700;color:${col}">${pct}%</div>
      <div style="font-size:9px;color:${col};margin-top:1px">${pts.sum}/${pts.max} pkt</div>
    </div>`;
  }).join('');

  const goldHtml=entry.gold.some(v=>v>0)||entry.goldDesc?`
    <div style="background:#FEF9EE;border:1px solid #FDE68A;border-radius:5px;padding:8px 12px;margin-bottom:10px;font-size:10px;color:#B45309;break-inside:avoid">
      ⭐ <strong>Złote punkty:</strong> ${Array.from({length:n},(_,i)=>`${def.cl} ${i+1}: ${entry.gold[i]}`).join(' | ')}
      ${entry.goldDesc?`<div style="margin-top:4px;font-style:italic">${entry.goldDesc}</div>`:''}
    </div>`:'';

  const notesHtml=entry.notes?`<div style="margin-top:10px">
    <div style="font-size:9px;font-weight:600;text-transform:uppercase;color:#64748B;margin-bottom:5px">Uwagi ogólne</div>
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:4px;padding:9px 12px;font-size:11px;line-height:1.6;white-space:pre-wrap">${entry.notes}</div>
  </div>`:'';

  const idsHtml=Array.from({length:n},(_,i)=>`
    <div style="flex:1;border:1.5px solid #E2E8F0;border-radius:5px;overflow:hidden;min-width:0">
      <div style="background:#EEF2F7;padding:4px 9px;font-size:8px;font-weight:600;text-transform:uppercase;color:#1B2E4B">${def.cl} ${i+1}</div>
      <div style="padding:5px 9px;font-size:10px;font-weight:500;min-height:22px;word-break:break-word">${entry.ids[i]||'—'}</div>
    </div>`).join('');

  const finalPts={sum:+(entry.contactResults.reduce((a,r)=>a+(r?r.pts.sum:0),0)/n).toFixed(1),max:entry.contactResults[0]?.pts.max||0};

  const html=`<!DOCTYPE html><html lang="pl"><head><meta charset="UTF-8">
<title>${fileName}</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Poppins',sans-serif;background:#fff;color:#0F172A;font-size:11px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{max-width:210mm;margin:0 auto;padding:10mm 12mm}
.nopr{position:fixed;top:0;left:0;right:0;background:#1B2E4B;padding:9px 18px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 2px 8px rgba(0,0,0,.2);z-index:99}
.nopr-title{color:#fff;font-size:12px;font-weight:600}
.nopr-sub{font-size:10px;color:rgba(255,255,255,.5);margin-top:1px}
.nbtn{background:#0D9488;color:#fff;border:none;padding:7px 18px;border-radius:5px;font-family:'Poppins',sans-serif;font-size:11px;font-weight:600;cursor:pointer;transition:background .15s}
.nbtn:hover{background:#0f7e73}
@media print{.nopr{display:none!important}.page{padding:8mm 10mm;margin-top:0!important}body{font-size:10px}}
</style></head>
<body>
<div class="nopr">
  <div><div class="nopr-title">📋 ${fileName}</div><div class="nopr-sub">Kliknij aby zapisać jako PDF — jakość druku z przeglądarki jest najlepsza</div></div>
  <button class="nbtn" onclick="window.print()">🖨️ Zapisz / Drukuj PDF</button>
</div>
<div class="page" style="margin-top:50px">
  <div style="background:linear-gradient(135deg,#1B2E4B,#243b60);padding:13px 16px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;border-radius:6px">
    <div>
      <div style="font-size:15px;font-weight:700;color:#fff;letter-spacing:-.01em">${def.name.toUpperCase()}</div>
      <div style="font-size:9px;color:rgba(255,255,255,.5);margin-top:2px">Polskie ePłatności — PeP &amp; P24 | System Oceny Jakości</div>
    </div>
    <div style="display:flex;gap:8px;align-items:center">
      ${entry.period?`<span style="background:#0D9488;color:#fff;font-size:10px;font-weight:700;padding:4px 12px;border-radius:20px">📅 ${entry.period}</span>`:''}
      <span style="background:${rb};color:${rc};font-size:10px;font-weight:700;padding:4px 12px;border-radius:20px">${rl}</span>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(5,1fr);border:1px solid #E2E8F0;border-radius:5px;overflow:hidden;margin-bottom:10px">
    ${[['Specjalista',entry.spec],['Stanowisko',entry.stand||'—'],['Dział',entry.dzial||'—'],['Oceniający',entry.oce||'—'],['Data oceny',entry.data]].map(([l,v],i)=>`
    <div style="padding:7px 11px;${i<4?'border-right:1px solid #E2E8F0;':''}background:#F8FAFC">
      <div style="font-size:8px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:#64748B;margin-bottom:2px">${l}</div>
      <div style="font-size:11px;font-weight:600;color:#1B2E4B">${v}</div>
    </div>`).join('')}
  </div>
  <div style="display:flex;gap:8px;margin-bottom:12px">${idsHtml}</div>
  ${sectionsHtml}
  ${goldHtml}
  <div style="break-inside:avoid">
    <div style="background:linear-gradient(135deg,#1B2E4B,#243b60);padding:7px 12px;border-radius:5px 5px 0 0;font-size:10px;font-weight:700;color:#fff">Wyniki końcowe</div>
    <div style="border:1px solid #E2E8F0;border-top:none;border-radius:0 0 5px 5px;padding:12px">
      <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap">
        ${resBoxes}
        <div style="flex:1.3;min-width:110px;border:2px solid ${rc};border-radius:5px;padding:9px;text-align:center;background:${rb}">
          <div style="font-size:9px;font-weight:600;text-transform:uppercase;color:#64748B;margin-bottom:2px">Wynik końcowy</div>
          <div style="font-size:28px;font-weight:700;color:${rc};line-height:1">${entry.avgFinal}%</div>
          <div style="font-size:10px;color:${rc};margin-top:2px">${finalPts.sum}/${finalPts.max} pkt (śr.)</div>
          <div style="display:inline-block;margin-top:5px;padding:2px 10px;border-radius:20px;font-size:9px;font-weight:700;text-transform:uppercase;background:${rb};color:${rc}">${rl}</div>
        </div>
      </div>
      ${notesHtml}
    </div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px;break-inside:avoid">
    <div style="border-top:1.5px solid #0F172A;padding-top:5px;font-size:9px;color:#64748B;text-align:center">Podpis oceniającego: ${entry.oce||'...................................'}</div>
    <div style="border-top:1.5px solid #0F172A;padding-top:5px;font-size:9px;color:#64748B;text-align:center">Podpis specjalisty (zapoznałem/am się): .........................................</div>
  </div>
  <div style="margin-top:14px;padding-top:8px;border-top:1px solid #E2E8F0;display:flex;justify-content:space-between;font-size:8px;color:#94A3B8">
    <span>System Oceny Jakości — PeP &amp; P24</span>
    <span>Wygenerowano: ${new Date().toLocaleString('pl-PL')}</span>
  </div>
</div></body></html>`;
  const w=window.open('','_blank');w.document.write(html);w.document.close();
}


function saveOce(val){if(val)DataStore.setSavedAssessor(val);}

function onSpecChange(p){
  var spec = document.getElementById(p+'-spec')?.value||'';
  var person = spec ? getPersonByName(spec) : null;
  var last = spec ? scopedRegistry().slice().reverse().find(function(e){return e.spec===spec;}) : null;
  var stand = (person&&person.position)||last?.stand||'';
  var dzial = (person&&person.department)||last?.dzial||'';
  var oce   = (person&&person.leader)||last?.oce||DataStore.getSavedAssessor()||'';
  // update hidden inputs
  var standEl=document.getElementById(p+'-stand');
  var dzialEl=document.getElementById(p+'-dzial');
  var oceEl=document.getElementById(p+'-oce');
  if(standEl) standEl.value=stand;
  if(dzialEl) dzialEl.value=dzial;
  if(oceEl){oceEl.value=oce;if(oce)saveOce(oce);}
  // update display chips
  var afEl=document.getElementById(p+'-af');
  if(afEl) afEl.style.display=spec?'':'none';
  var afStand=document.getElementById(p+'-af-stand');
  var afDzial=document.getElementById(p+'-af-dzial');
  var afOce=document.getElementById(p+'-af-oce');
  if(afStand) afStand.textContent=stand||'—';
  if(afDzial) afDzial.textContent=dzial||'—';
  if(afOce)   afOce.textContent=oce||'—';
  refreshSpecContext(p);
}

