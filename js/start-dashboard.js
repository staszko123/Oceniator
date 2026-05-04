export function initStartDashboard(){

  function getData(){
    return (window.getAllEntries?getAllEntries():[])||[];
  }

  function build(){
    const wrap=document.querySelector('#tab-start .start-inner');
    if(!wrap) return;

    const data=getData();
    const today=new Date().toISOString().slice(0,10);

    const todayList=data.filter(x=>x.data===today);
    const avg=todayList.length?Math.round(todayList.reduce((a,b)=>a+(b.avgFinal||0),0)/todayList.length):0;

    const last=data.slice(-5).reverse();

    const html=`
      <div style="grid-column:1/-1;display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:12px">
        <div class="spec-kpi"><div class="spec-kpi-lbl">Dziś</div><div class="spec-kpi-val">${todayList.length}</div></div>
        <div class="spec-kpi"><div class="spec-kpi-lbl">Średnia</div><div class="spec-kpi-val">${avg}%</div></div>
        <div class="spec-kpi"><div class="spec-kpi-lbl">Wszystkie</div><div class="spec-kpi-val">${data.length}</div></div>
      </div>

      <div style="grid-column:1/-1;margin-top:16px">
        <div class="spec-profile-card">
          <div class="spec-profile-card-h">Ostatnie oceny</div>
          <div class="spec-profile-card-b">
            ${last.map(x=>`<div style="display:flex;justify-content:space-between;padding:6px 0"><span>${x.spec||''}</span><b>${x.avgFinal||0}%</b></div>`).join('')}
          </div>
        </div>
      </div>
    `;

    if(!document.getElementById('start-extra')){
      const el=document.createElement('div');
      el.id='start-extra';
      el.innerHTML=html;
      wrap.appendChild(el);
    }
  }

  setTimeout(build,500);
}
