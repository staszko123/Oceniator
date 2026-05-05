export function initStartDashboard(){

  function getData(){
    return (window.registry ? window.registry.filter(e => !e.archived) : []) || [];
  }

  function render(){
    const data=getData();
    const today=new Date().toISOString().slice(0,10);

    const todayList=data.filter(x=>x.data===today);
    const avg=todayList.length
      ? Math.round(todayList.reduce((a,b)=>a+(b.avgFinal||0),0)/todayList.length)
      : 0;

    const last=data.slice(-5).reverse();

    // Update quick stats
    const statToday = document.getElementById('stat-today');
    const statAvg = document.getElementById('stat-avg');
    const statTotal = document.getElementById('stat-total');

    if(statToday) statToday.textContent = todayList.length;
    if(statAvg) statAvg.textContent = `${avg}%`;
    if(statTotal) statTotal.textContent = data.length;

    // Update recent activity
    const activityList = document.getElementById('activity-list');
    if(activityList){
      if(last.length > 0){
        activityList.innerHTML = last.map(entry => `
          <div class="activity-item">
            <div class="activity-icon">${getActivityIcon(entry.type)}</div>
            <div class="activity-content">
              <div class="activity-title">${entry.spec || 'Nieznany specjalista'}</div>
              <div class="activity-meta">${formatDate(entry.data)} • ${entry.avgFinal || 0}%</div>
            </div>
          </div>
        `).join('');
      } else {
        activityList.innerHTML = `
          <div class="activity-empty">
            <div class="activity-empty-icon">📝</div>
            <div class="activity-empty-text">Brak ostatnich ocen</div>
            <div class="activity-empty-subtext">Rozpocznij pracę, aby zobaczyć historię</div>
          </div>
        `;
      }
    }
  }

  function getActivityIcon(type){
    switch(type){
      case 'rozmowy': return '📞';
      case 'maile': return '✉️';
      case 'systemy': return '🖥️';
      default: return '📋';
    }
  }

  function formatDate(dateStr){
    if(!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // HARD FIX: render cykliczny (pewność działania w SPA)
  setInterval(render,1000);

  // pierwszy render
  setTimeout(render,300);
}
