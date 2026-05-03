export function initEwidencjaActions(){
  window.toggleRowActions = function(id, ev){
    if(ev) ev.stopPropagation();

    document.querySelectorAll('.row-actions-menu.open').forEach(m=>{
      if(m.id !== 'row-actions-'+id) m.classList.remove('open');
    });

    const btn = ev?.currentTarget;
    const menu = document.getElementById('row-actions-'+id);
    if(!menu || !btn) return;

    const isOpen = menu.classList.contains('open');

    document.querySelectorAll('.row-more-btn.is-open').forEach(b=>b.classList.remove('is-open'));

    if(isOpen){
      menu.classList.remove('open');
      btn.classList.remove('is-open');
      return;
    }

    menu.classList.add('open');
    btn.classList.add('is-open');

    const rect = btn.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();

    const top = rect.bottom + 6;
    const left = rect.right - menuRect.width;

    menu.style.top = top + 'px';
    menu.style.left = left + 'px';
  };

  document.addEventListener('scroll', closeMenus, true);
  window.addEventListener('resize', closeMenus);

  function closeMenus(){
    document.querySelectorAll('.row-actions-menu.open').forEach(m=>m.classList.remove('open'));
    document.querySelectorAll('.row-more-btn.is-open').forEach(b=>b.classList.remove('is-open'));
  }
}
