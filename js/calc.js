/* ══════════════════════════════════════════════
   CALC — score logic, recalculation, misc helpers
══════════════════════════════════════════════ */

function setScore(p,sk,ci,c,val,btn){
  state[p].scores[sk][ci][c]=val;
  const cell=btn.closest('.td-score');
  cell.querySelectorAll('.sbtn').forEach(b=>b.classList.remove('s1','s05','s0','snd'));
  if(val===1) btn.classList.add('s1');
  else if(val===0.5) btn.classList.add('s05');
  else if(val===0) btn.classList.add('s0');
  else btn.classList.add('snd');
  recalc(p);
  saveDraft(p);
}

function calcContact(p,ci){
  const def=DEFS[p];let total=0;const parts={};const rawPts={};
  def.sections.forEach(sec=>{
    const vals=Object.values(state[p].scores[sec.key]).map(arr=>arr[ci]??1);
    const valid=vals.filter(v=>v!=='nd');
    const maxPts=valid.length;const sum=valid.reduce((a,b)=>a+b,0);
    const ratio=maxPts>0?sum/maxPts:1;
    total+=ratio*sec.w;
    parts[sec.key]=Math.round(ratio*100);
    rawPts[sec.key]={sum:+sum.toFixed(1),max:maxPts};
  });
  const totalPts=def.sections.reduce((acc,sec)=>{const v=rawPts[sec.key];return{sum:+(acc.sum+v.sum).toFixed(1),max:acc.max+v.max};},{sum:0,max:0});
  return{pct:Math.round(total*100),parts,pts:totalPts};
}

function recalc(p){
  const n=state[p].count;
  const results=Array.from({length:n},(_,ci)=>{
    const{pct,parts,pts}=calcContact(p,ci);const g=state[p].gold[ci]||0;
    return{pct:g>0&&pct<100?Math.min(100,pct+g*10):pct,parts,pts,ci};
  });
  results.forEach(({pct,pts},ci)=>{
    const pel=document.getElementById(`${p}-rp-${ci}`);
    const ptsEl=document.getElementById(`${p}-rpts-${ci}`);
    const bel=document.getElementById(`${p}-rbg-${ci}`);
    if(pel){pel.textContent=pct+'%';applyCol(pel,pct);}
    if(ptsEl) ptsEl.textContent=`${pts.sum} / ${pts.max} pkt`;
    if(bel) applyBadge(bel,pct);
  });
  const avg=results.length?Math.round(results.reduce((a,b)=>a+b.pct,0)/results.length):0;
  const avgPts=results.length?{sum:+(results.reduce((a,b)=>a+b.pts.sum,0)/results.length).toFixed(1),max:results[0].pts.max}:{sum:0,max:0};
  const fe=document.getElementById(`${p}-rp-f`);const fpts=document.getElementById(`${p}-rpts-f`);const fb=document.getElementById(`${p}-rbg-f`);
  if(fe){fe.textContent=avg+'%';applyCol(fe,avg);}
  if(fpts) fpts.textContent=`${avgPts.sum} / ${avgPts.max} pkt (śr.)`;
  if(fb) applyBadge(fb,avg);
  DEFS[p].sections.forEach(sec=>{
    const badge=document.getElementById(`${p}-ss-${sec.key}`);if(!badge) return;
    const perC=Array.from({length:n},(_,ci)=>{
      const vals=Object.values(state[p].scores[sec.key]).map(arr=>arr[ci]??1);
      const valid=vals.filter(v=>v!=='nd');
      return valid.reduce((a,b)=>a+b,0).toFixed(1);
    });
    badge.textContent=perC.join(' / ')+' / '+sec.criteria.length;
  });
}

// ══════════════════════════════════════════════
// MISC UI
// ══════════════════════════════════════════════
function setGold(p,ci,val,btn){state[p].gold[ci]=val;btn.closest('.gold-btns').querySelectorAll('.gbtn').forEach(b=>b.classList.remove('on'));btn.classList.add('on');recalc(p);saveDraft(p);}
function toggleHint(id){document.getElementById(id).classList.toggle('open');}
function toggleSec(id){document.getElementById(id).classList.toggle('closed');}
function toggleChips(id){const el=document.getElementById(id);if(el) el.style.display=el.style.display==='none'?'flex':'none';}
function appendComment(textareaId,text){const el=document.getElementById(textareaId);if(!el) return;el.value=(el.value?el.value+' — ':'')+text;el.focus();el.dispatchEvent(new Event('input',{bubbles:true}));}
function updatePeriod(p){
  const data=document.getElementById(`${p}-data`)?.value||'';
  const period=periodOf(data);
  const el=document.getElementById(`${p}-period-badge`);
  if(el) el.innerHTML=period?`<span class="period-badge">📅 ${period}</span>`:'';
  refreshSpecContext(p);
}

