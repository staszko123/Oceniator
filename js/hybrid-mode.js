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
      <div class="hybrid-sub">Wybierz sposób pracy</div>
    </div>
    <div class="hybrid-tabs">
      <button class="hybrid-tab on" data-mode="std">Standard</button>
      <button class="hybrid-tab" data-mode="quick">Szybki</button>
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
  const def=window.DEFS[p];
  const count=window.state[p].count;

  wrap.innerHTML='';
  wrap.style.setProperty('--contact-count',count);

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

    sec.criteria.forEach((crit,ci)=>{
      const row=document.createElement('div');
      row.className='hybrid-row';

      const critEl=document.createElement('div');
      critEl.className='hybrid-crit';
      critEl.textContent=crit.n;

      row.appendChild(critEl);

      for(let i=0;i<count;i++){
        const cell=document.createElement('div');
        cell.className='hybrid-contact';

        [1,0.5,0,'nd'].forEach(val=>{
          const b=document.createElement('button');
          b.className='hybrid-score';
          b.dataset.val=val;
          b.textContent=val==='nd'?'ND':val;

          b.onclick=()=>{
            window.state[p].scores[sec.key][ci][i]=val;
            cell.querySelectorAll('.hybrid-score').forEach(x=>x.classList.remove('on'));
            b.classList.add('on');
            window.recalc(p);
          };

          cell.appendChild(b);
        });

        row.appendChild(cell);
      }

      rows.appendChild(row);
    });

    wrap.appendChild(secEl);
  });
}
