export function initStartDashboard(){

  function getData(){
    return (window.getAllEntries?getAllEntries():[])||[];
  }

  function render(){
    const wrap=document.querySelector('#tab-start .start-inner');
    if(!wrap) return;

    const data=getData();
    const today=new Date().toISOString().slice(0,10);

    const todayList=data.filter(x=>x.data===today);
    const avg=todayList.length
      ? Math.round(todayList.reduce((a,b)=>a+(b.avgFinal||0),0)/todayList.length)
      : 0;

    const last=data.slice(-5).reverse();

    let el=document.getElementById('start-extra');
    if(!el){
      el=document.createElement('div');
      el.id='start-extra';
      el.style.marginTop='20px';
      el.style.gridColumn='1 / -1';
      wrap.appendChild(el);
    }

    el.innerHTML=`
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
        <div class="spec-kpi"><div class="spec-kpi-lbl">Dziś</div><div class="spec-kpi-val">${todayList.length}</div></div>
        <div class="spec-kpi"><div class="spec-kpi-lbl">Średnia</div><div class="spec-kpi-val">${avg}%</div></div>
        <div class="spec-kpi"><div class="spec-kpi-lbl">Wszystkie</div><div class="spec-kpi-val">${data.length}</div></div>
      </div>

      <div style="margin-top:16px" class="spec-profile-card">
        <div class="spec-profile-card-h">Ostatnie oceny</div>
        <div class="spec-profile-card-b">
          ${last.map(x=>`<div style="display:flex;justify-content:space-between;padding:6px 0"><span>${x.spec||''}</span><b>${x.avgFinal||0}%</b></div>`).join('')}
        </div>
      </div>
    `;
  }

  // HARD FIX: render cykliczny (pewność działania w SPA)
  setInterval(render,1000);

  // pierwszy render
  setTimeout(render,300);
}
