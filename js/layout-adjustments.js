export function initLayoutAdjustments(){
  applyAll();

  const originalBuildForm = window.buildForm;
  if(typeof originalBuildForm === 'function' && !window.__layoutBuildWrapped){
    window.__layoutBuildWrapped = true;
    window.buildForm = function(p){
      originalBuildForm(p);
      setTimeout(()=>applyLayout(p),0);
    };
  }
}

function applyAll(){
  ['r','m','s'].forEach(applyLayout);
}

function applyLayout(p){
  const wrap=document.getElementById(`wrap-${p}`);
  if(!wrap) return;

  const workspace=wrap.querySelector('.form-workspace');
  const context=wrap.querySelector(`#${p}-spec-context`);
  const formMain=wrap.querySelector('.form-main');
  const metaCard=formMain?.querySelector(':scope > .card');

  if(!workspace || !context || !formMain || !metaCard) return;
  if(workspace.querySelector(`.spec-meta-card[data-form="${p}"]`)) return;

  const metaRow=metaCard.querySelector('.meta-row');
  const autofill=metaCard.querySelector('.meta-autofill');
  const hidden=[...metaCard.querySelectorAll('input[type="hidden"]')];

  if(!metaRow) return;

  const leftPanel=document.createElement('div');
  leftPanel.className='spec-left-panel';

  const metaBox=document.createElement('div');
  metaBox.className='spec-meta-card';
  metaBox.dataset.form=p;

  metaBox.appendChild(metaRow);
  if(autofill) metaBox.appendChild(autofill);
  hidden.forEach(el=>metaBox.appendChild(el));

  leftPanel.appendChild(metaBox);
  workspace.insertBefore(leftPanel,context);
  leftPanel.appendChild(context);

  metaCard.classList.add('contact-data-card');
}
