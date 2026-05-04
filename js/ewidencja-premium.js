export function initEwidencjaPremium(){

  window.renderEwTable = function(rows){
    const tbody=document.getElementById('ew-tbody');
    if(!tbody) return;

    if(!rows.length){
      tbody.innerHTML=`<tr><td colspan="13">
        <div class="ew-empty">
          <div class="ew-empty-icon">📋</div>
          <div class="ew-empty-title">Brak danych</div>
          <div class="ew-empty-sub">Zmień filtry lub dodaj kartę, aby zobaczyć wyniki.</div>
        </div>
      </td></tr>`;
      return;
    }

    tbody.innerHTML=rows.map((e,i)=>{
      const skLocal={r:['mery','jak','sys'],m:['mery','jak','sys'],s:['obs','dok','eff']};
      const sk=skLocal[e.p];

      const final=e.avgFinal;
      const colorClass=final>=92?'ep-great':final>=82?'ep-good':'ep-below';

      return `<tr>
        <td class="mu">${i+1}</td>

        <td>
          <div class="ew-person">
            <div class="ew-person-name">${e.spec}</div>
            <div class="ew-person-sub">${e.dzial||''}</div>
          </div>
        </td>

        <td class="ew-muted">${e.data}</td>

        <td class="r ew-section-score ${e.secAvg[sk[0]]>=92?'ep-great':e.secAvg[sk[0]]>=82?'ep-good':'ep-below'}">${e.secAvg[sk[0]]}%</td>
        <td class="r ew-section-score ${e.secAvg[sk[1]]>=92?'ep-great':e.secAvg[sk[1]]>=82?'ep-good':'ep-below'}">${e.secAvg[sk[1]]}%</td>
        <td class="r ew-section-score ${e.secAvg[sk[2]]>=92?'ep-great':e.secAvg[sk[2]]>=82?'ep-good':'ep-below'}">${e.secAvg[sk[2]]}%</td>

        <td class="r ew-score-cell">
          <div class="ew-final-score ${colorClass}">${final}%</div>
          <div class="ew-score-track">
            <div class="ew-score-fill ${colorClass}" style="width:${final}%"></div>
          </div>
        </td>

        <td class="row-actions-cell">
          <button class="row-more-btn" onclick="toggleRowActions(${e.id},event)">Więcej</button>
          <div class="row-actions-menu" id="row-actions-${e.id}">
            <button onclick="copyRow(${e.id})"><span class="ram-icon">📋</span>Kopiuj</button>
            <button onclick="previewEntry(${e.id})"><span class="ram-icon">👁</span>Podgląd</button>
            <button class="ram-sep" onclick="editEntry(${e.id})"><span class="ram-icon">✏️</span>Edytuj</button>
            <button onclick="archiveEntry(${e.id})"><span class="ram-icon">📦</span>Archiwizuj</button>
            <button class="danger" onclick="deleteEntry(${e.id})"><span class="ram-icon">🗑</span>Usuń</button>
          </div>
        </td>
      </tr>`;
    }).join('');
  }
}
