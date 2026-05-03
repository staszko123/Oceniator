/* ══════════════════════════════════════════════
   DRAFT — auto-save / restore form drafts
══════════════════════════════════════════════ */

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


