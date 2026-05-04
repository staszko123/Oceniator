export function initSpecProfile(){

  window.openSpecProfile=function(name){
    const data=(window.getAllEntries?getAllEntries():[]);
    const list=data.filter(e=>e.spec===name);

    if(!list.length){alert('Brak danych');return;}

    const avg=Math.round(list.reduce((a,b)=>a+(b.avgFinal||0),0)/list.length);

    const last=list.slice(-6);

    const trend=last.map(x=>x.avgFinal||0);

    const errors={};
    list.forEach(x=>{
      (x.notes||'').split(' ').forEach(w=>{
        if(w.length>4){errors[w]=(errors[w]||0)+1;}
      });
    });

    const topErrors=Object.entries(errors).sort((a,b)=>b[1]-a[1]).slice(0,3);

    const trendBars=trend.map((v,i)=>{
      return '<div class="spec-trend-bar">'+
        '<div class="spec-trend-fill" style="height:'+v+'%"></div>'+
        '<div class="spec-trend-lbl">'+(i+1)+'</div>'+
      '</div>';
    }).join('');

    const lastHtml=last.reverse().map(x=>{
      return '<div class="spec-list-item">'+
        '<div><div class="spec-list-title">'+(x.data||'')+'</div><div class="spec-list-sub">'+(x.dzial||'')+'</div></div>'+
        '<div class="spec-list-score">'+(x.avgFinal||0)+'%</div>'+
      '</div>';
    }).join('');

    const errHtml=topErrors.map(e=>e[0]+' ('+e[1]+')').join('<br>')||'Brak danych';

    const html=''+
    '<div class="modal spec-profile-modal">'+
      '<div class="spec-profile-head">'+
        '<div class="spec-profile-name">'+name+'</div>'+
        '<div class="spec-profile-sub">Profil jakościowy</div>'+
      '</div>'+
      '<div class="spec-profile-body">'+
        '<div class="spec-profile-kpis">'+
          '<div class="spec-kpi"><div class="spec-kpi-lbl">Średnia</div><div class="spec-kpi-val">'+avg+'%</div></div>'+
          '<div class="spec-kpi"><div class="spec-kpi-lbl">Oceny</div><div class="spec-kpi-val">'+list.length+'</div></div>'+
          '<div class="spec-kpi"><div class="spec-kpi-lbl">Trend</div><div class="spec-kpi-val">'+(trend[trend.length-1]||0)+'%</div></div>'+
          '<div class="spec-kpi"><div class="spec-kpi-lbl">Top błędy</div><div class="spec-kpi-val">'+topErrors.length+'</div></div>'+
        '</div>'+

        '<div class="spec-profile-grid">'+
          '<div class="spec-profile-card">'+
            '<div class="spec-profile-card-h">Trend</div>'+
            '<div class="spec-profile-card-b"><div class="spec-trend-bars">'+trendBars+'</div></div>'+
          '</div>'+

          '<div class="spec-profile-card">'+
            '<div class="spec-profile-card-h">Najczęstsze błędy</div>'+
            '<div class="spec-profile-card-b">'+errHtml+'</div>'+
          '</div>'+
        '</div>'+

        '<div class="spec-profile-card" style="margin-top:14px">'+
          '<div class="spec-profile-card-h">Ostatnie oceny</div>'+
          '<div class="spec-profile-card-b"><div class="spec-list">'+lastHtml+'</div></div>'+
        '</div>'+

        '<div class="spec-reco" style="margin-top:14px">Najczęstszy problem sugeruje potrzebę dodatkowego szkolenia.</div>'+

      '</div>'+
      '<div class="spec-profile-actions">'+
        '<button class="btn btn-primary btn-sm" onclick="closeModal(\'spec-profile-modal\')">Zamknij</button>'+
      '</div>'+
    '</div>';

    let overlay=document.getElementById('spec-profile-modal');
    if(!overlay){
      overlay=document.createElement('div');
      overlay.id='spec-profile-modal';
      overlay.className='modal-overlay';
      document.body.appendChild(overlay);
    }

    overlay.innerHTML=html;
    overlay.style.display='flex';
  }
}
