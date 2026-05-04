export function initSpecialistSearch(){

  function getPeople(){
    if(window.adminData?.people?.length) return adminData.people.filter(p=>p.active!==false);
    const list = (window.getSpecialistOptions?.()||[]).map(n=>({name:n}));
    return list;
  }

  function buildItem(p,q){
    const name=p.name||'';
    const dep=p.department||'';
    const pos=p.position||'';
    const lead=p.leader||'';

    const mark = (txt)=> q ? txt.replace(new RegExp(`(${q})`,'ig'),'<span class="spec-search-mark">$1</span>') : txt;

    return `
      <button class="spec-search-item" data-name="${name}">
        <div class="spec-avatar">${name.split(' ').map(x=>x[0]).join('').slice(0,2)}</div>
        <div class="spec-main">
          <div class="spec-name">${mark(name)}</div>
          <div class="spec-meta">
            ${mark(dep)}
            ${pos?` · ${mark(pos)}`:''}
            ${lead?` · Lider: ${mark(lead)}`:''}
          </div>
        </div>
        ${lead?`<div class="spec-pill">${mark(lead)}</div>`:''}
      </button>`;
  }

  function enhance(input){
    if(!input || input.dataset.enhanced) return;

    input.dataset.enhanced=1;
    input.classList.add('spec-search-input');
    input.removeAttribute('list');

    const wrap=document.createElement('div');
    wrap.className='spec-search-wrap';

    input.parentNode.insertBefore(wrap,input);
    wrap.appendChild(input);

    const menu=document.createElement('div');
    menu.className='spec-search-menu';
    wrap.appendChild(menu);

    let activeIdx=-1;

    function render(q=''){
      const people=getPeople();
      const list=people.filter(p=>{
        const t=(p.name+' '+p.department+' '+p.position+' '+p.leader).toLowerCase();
        return t.includes(q.toLowerCase());
      }).slice(0,50);

      if(!list.length){
        menu.innerHTML='<div class="spec-search-empty">Brak wyników</div>';
        return;
      }

      menu.innerHTML='<div class="spec-search-help">Szukaj po imieniu, dziale, stanowisku</div>'+list.map(p=>buildItem(p,q)).join('');

      [...menu.querySelectorAll('.spec-search-item')].forEach((el,i)=>{
        el.onclick=()=>select(el.dataset.name);
      });
    }

    function open(){menu.classList.add('open');}
    function close(){menu.classList.remove('open');activeIdx=-1;}

    function select(name){
      input.value=name;
      const p=input.id.split('-')[0];
      if(window.onSpecChange) onSpecChange(p);
      if(window.refreshSpecContext) refreshSpecContext(p);
      if(window.saveDraft) saveDraft(p);
      close();
    }

    input.addEventListener('focus',()=>{render(input.value);open();});

    input.addEventListener('input',()=>{
      render(input.value);
      open();
    });

    input.addEventListener('keydown',(e)=>{
      const items=[...menu.querySelectorAll('.spec-search-item')];
      if(!items.length) return;

      if(e.key==='ArrowDown'){
        e.preventDefault();
        activeIdx=Math.min(items.length-1,activeIdx+1);
      }
      if(e.key==='ArrowUp'){
        e.preventDefault();
        activeIdx=Math.max(0,activeIdx-1);
      }
      if(e.key==='Enter' && activeIdx>-1){
        e.preventDefault();
        items[activeIdx].click();
      }

      items.forEach((el,i)=>el.classList.toggle('active',i===activeIdx));
    });

    document.addEventListener('click',(e)=>{
      if(!wrap.contains(e.target)) close();
    });
  }

  function scan(){
    ['r','m','s'].forEach(p=>enhance(document.getElementById(p+'-spec')));
  }

  setInterval(scan,600);
}
