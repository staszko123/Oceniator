export function initHybrid(){
  ['r','m','s'].forEach(p=>injectHybrid(p));

  if(typeof window.buildForm === 'function' && !window.__hybridBuildWrapped){
    const originalBuildForm=window.buildForm;
    window.__hybridBuildWrapped=true;
    window.buildForm=function(p){
      originalBuildForm(p);
      setTimeout(()=>injectHybrid(p),0);
    };
  }
}

const hybridModes={r:'std',m:'std',s:'std'};
const hybridSelections={r:{},m:{},s:{}};

function injectHybrid(p){
  const root=document.getElementById(`tab-${{r:'rozmowy',m:'maile',s:'systemy'}[p]}`);
  if(!root) return;

  const container=root.querySelector('.form-main');
  if(!container) return;

  if(container.querySelector('.hybrid-switch')) return;

  const switchEl=document.createElement('div');
  switchEl.className='hybrid-switch';
  switchEl.innerHTML=`
    <div>
      <div class="hybrid-title">Tryb oceny</div>
      <div class="hybrid-sub">Standard lub szybkie zaznaczanie błędów</div>
    </div>
    <div class="hybrid-tabs">
      <button class="hybrid-tab on" data-mode="std">Standard</button>
      <button class="hybrid-tab" data-mode="quick">Błędy</button>
    </div>
  `;

  container.prepend(switchEl);

  const quick=document.createElement('div');
  quick.className='hybrid-quick';
  container.insertBefore(quick,container.children[1]);

  buildQuick(p,quick);

  function setMode(mode){
    hybridModes[p]=mode;
    switchEl.querySelectorAll('.hybrid-tab').forEach(b=>b.classList.toggle('on',b.dataset.mode===mode));
    container.classList.toggle('hybrid-mode',mode==='quick');
    quick.classList.toggle('on',mode==='quick');
  }

  switchEl.querySelectorAll('.hybrid-tab').forEach(btn=>{
    btn.onclick=()=>{
      setMode(btn.dataset.mode);
    };
  });

  setMode(hybridModes[p]||'std');
}

function buildQuick(p,wrap){
  const def=DEFS[p];
  const suggestions=SUGGESTIONS;

  wrap.innerHTML='';

  def.sections.forEach(sec=>{
    const secEl=document.createElement('div');
    secEl.className='hybrid-section';

    secEl.innerHTML=`
      <div class="hybrid-section-head">
        <div class="hybrid-section-name">${sec.lbl}</div>
        <div class="hybrid-section-weight">${Math.round(sec.w*100)}%</div>
      </div>
      <div class="hybrid-rows"></div>
    `;

    const rows=secEl.querySelector('.hybrid-rows');

    (suggestions[sec.key]||[]).forEach((err,idx)=>{
      const selected=hybridSelections[p]?.[sec.key]?.[idx]||'ok';
      const row=document.createElement('div');
      row.className='hybrid-error-row';

      const left=document.createElement('div');
      left.innerHTML=`
        <div class="hybrid-error-name">${err}</div>
        <div class="hybrid-error-hint">Kliknij aby oznaczyć wpływ na ocenę</div>
      `;

      const actions=document.createElement('div');
      actions.className='hybrid-error-actions';

      ['ok','partial','error'].forEach(state=>{
        const b=document.createElement('button');
        b.className='hybrid-error-btn';
        b.dataset.state=state;
        b.textContent=state==='ok'?'OK':state==='partial'?'Częściowo':'Błąd';
        if(state===selected) b.classList.add('on');

        b.onclick=()=>{
          actions.querySelectorAll('.hybrid-error-btn').forEach(x=>x.classList.remove('on'));
          b.classList.add('on');

          applyError(p,sec.key,idx,state);
        };

        actions.appendChild(b);
      });

      row.appendChild(left);
      row.appendChild(actions);
      rows.appendChild(row);
    });

    wrap.appendChild(secEl);
  });
}

function applyError(p,secKey,idx,impact){
  const value=impact==='ok'?1:impact==='partial'?0.5:0;
  const appState=stateObj();
  const target=appState[p]?.scores?.[secKey]?.[idx];
  if(!target) return;

  if(!hybridSelections[p]) hybridSelections[p]={};
  if(!hybridSelections[p][secKey]) hybridSelections[p][secKey]={};
  hybridSelections[p][secKey][idx]=impact;

  appState[p].scores[secKey][idx]=target.map(()=>value);
  syncStandardButtons(p,secKey,idx,value);

  recalc(p);
  if(typeof saveDraft==='function') saveDraft(p);
}

function syncStandardButtons(p,secKey,idx,value){
  const row=document.querySelector(`#${p}-sec-${secKey} tbody tr:nth-child(${idx+1})`);
  if(!row) return;
  row.querySelectorAll('.td-score').forEach(cell=>{
    const buttons=cell.querySelectorAll('.sbtn');
    buttons.forEach(btn=>btn.classList.remove('s1','s05','s0','snd'));
    const cls=value===1?'s1':value===0.5?'s05':value===0?'s0':'snd';
    const target=Array.from(buttons).find(btn=>btn.textContent.trim()===(value===1?'1':value===0.5?'½':value===0?'0':'N/D'));
    if(target) target.classList.add(cls);
  });
}

function stateObj(){
  return window.state || state;
}
