export function initHybrid(){
  ['r','m','s'].forEach(p=>injectHybrid(p));
}

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

  switchEl.querySelectorAll('.hybrid-tab').forEach(btn=>{
    btn.onclick=()=>{
      switchEl.querySelectorAll('.hybrid-tab').forEach(b=>b.classList.remove('on'));
      btn.classList.add('on');
      const mode=btn.dataset.mode;
      container.classList.toggle('hybrid-mode',mode==='quick');
      quick.classList.toggle('on',mode==='quick');
    };
  });
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

function applyError(p,secKey,idx,state){
  const section=state==='ok'?1:state==='partial'?0.5:0;

  Object.keys(stateObj(p).scores[secKey]).forEach(ci=>{
    stateObj(p).scores[secKey][ci]=stateObj(p).scores[secKey][ci].map(()=>section);
  });

  recalc(p);
}

function stateObj(p){
  return window.state || state;
}
