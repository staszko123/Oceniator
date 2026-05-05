export function initEwidencjaPremium(){

  window.renderEwTable = function(rows){
    const tbody=document.getElementById('ew-tbody');
    if(!tbody) return;

    const safe=v=>typeof escHtml==='function'?escHtml(v):String(v==null?'':v);
    const jsArg=v=>JSON.stringify(String(v==null?'':v));
    const scoreClass=v=>v>=92?'ep-great':v>=82?'ep-good':'ep-below';
    const scoreVal=(e,key)=>{
      const val=e&&e.secAvg&&e.secAvg[key];
      return Number.isFinite(Number(val))?Number(val):0;
    };

    if(!rows.length){
      tbody.innerHTML=`<tr><td colspan="13">
        <div class="ew-empty">
          <div class="ew-empty-icon">📋</div>
          <div class="ew-empty-title">Brak danych</div>
          <div class="ew-empty-sub">Zmien filtry lub dodaj karte, aby zobaczyc wyniki.</div>
        </div>
      </td></tr>`;
      return;
    }

    tbody.innerHTML=rows.map((e,i)=>{
      const skLocal={r:['mery','jak','sys'],m:['mery','jak','sys'],s:['obs','dok','eff']};
      const sk=skLocal[e.p]||skLocal.r;
      const final=Number(e.avgFinal)||0;
      const s0=scoreVal(e,sk[0]);
      const s1=scoreVal(e,sk[1]);
      const s2=scoreVal(e,sk[2]);
      const colorClass=scoreClass(final);
      const id=jsArg(e.id);

      return `<tr>
        <td class="mu">${i+1}</td>

        <td>
          <div class="ew-person">
            <div class="ew-person-name">${safe(e.spec)}</div>
            <div class="ew-person-sub">${safe(e.dzial||'')}</div>
          </div>
        </td>

        <td class="ew-muted">${safe(e.data)}</td>

        <td class="r ew-section-score ${scoreClass(s0)}">${s0}%</td>
        <td class="r ew-section-score ${scoreClass(s1)}">${s1}%</td>
        <td class="r ew-section-score ${scoreClass(s2)}">${s2}%</td>

        <td class="r ew-score-cell">
          <div class="ew-final-score ${colorClass}">${final}%</div>
          <div class="ew-score-track">
            <div class="ew-score-fill ${colorClass}" style="width:${final}%"></div>
          </div>
        </td>

        <td class="row-actions-cell">
          <button class="row-action-btn" onclick="editScores(${id})">Edytuj</button>
          <button class="row-more-btn" onclick="toggleRowActions(${id},event)">Wiecej</button>
          <div class="row-actions-menu" id="row-actions-${safe(e.id)}">
            <button onclick="copyRow(${id})"><span class="ram-icon">📋</span>Kopiuj</button>
            <button onclick="previewEntry(${id})"><span class="ram-icon">👁</span>Podglad</button>
            <button onclick="archiveEntry(${id})"><span class="ram-icon">📦</span>Archiwizuj</button>
            <button class="danger" onclick="deleteEntry(${id})"><span class="ram-icon">🗑</span>Usun</button>
          </div>
        </td>
      </tr>`;
    }).join('');
  };
}
