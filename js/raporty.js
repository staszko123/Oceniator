/* ══════════════════════════════════════════════
   RAPORTY — report builder, CSV + PDF export
══════════════════════════════════════════════ */

// ══════════════════════════════════════════════
// RAPORTY
// ══════════════════════════════════════════════
function buildRaporty(){
  var wrap=document.getElementById('wrap-raporty');
  if(!wrap) return;
  var baseRows=scopedRegistry();
  var specs=[].concat([]).concat(baseRows.map(function(e){return e.spec;})).filter(Boolean).filter(function(v,i,a){return a.indexOf(v)===i;}).sort();
  var dzialy=baseRows.map(function(e){return e.dzial;}).filter(Boolean).filter(function(v,i,a){return a.indexOf(v)===i;}).sort();
  var periods=baseRows.map(function(e){return e.period;}).filter(Boolean).filter(function(v,i,a){return a.indexOf(v)===i;}).sort();
  var h='';
  h+='<div style="margin-bottom:14px"><div style="font-size:16px;font-weight:700;color:var(--text)">📊 Raporty</div>';
  h+='<div style="font-size:11px;color:var(--text3);margin-top:3px">Generuj i pobierz raporty CSV z danych ewidencji</div></div>';
  // Typ raportu
  h+='<div class="rep-card">';
  h+='<div class="rep-card-hdr">Typ raportu</div>';
  h+='<div class="rep-types">';
  var types=[
    {id:'detail', icon:'📄', lbl:'Szczegółowy', sub:'Jeden wiersz na kartę — wszystkie pola'},
    {id:'summary', icon:'👥', lbl:'Specjaliści', sub:'Wyniki zagregowane per specjalista'},
    {id:'trend',   icon:'📈', lbl:'Trendy',      sub:'Wyniki per specjalista × okres'},
    {id:'pdf',     icon:'🖨️', lbl:'PDF specjalisty', sub:'Podsumowanie, mocne strony i obszary do poprawy'},
  ];
  types.forEach(function(t,i){
    h+='<label class="rep-type-opt">';
    h+='<input type="radio" name="rep-type" value="'+t.id+'" '+(i===0?'checked':'')+' onchange="repPreviewReset()">';
    h+='<span class="rep-type-icon">'+t.icon+'</span>';
    h+='<span class="rep-type-lbl">'+t.lbl+'</span>';
    h+='<span class="rep-type-sub">'+t.sub+'</span>';
    h+='</label>';
  });
  h+='</div></div>';
  // Filtry
  h+='<div class="rep-card" style="margin-top:12px">';
  h+='<div class="rep-card-hdr">Filtry</div>';
  h+='<div class="rep-filters">';
  h+='<div class="rep-frow"><label class="rep-flbl">Specjalista</label>';
  h+='<select class="rep-sel" id="rep-f-spec"><option value="">Wszyscy</option>';
  specs.forEach(function(s){h+='<option>'+s+'</option>';});
  h+='</select></div>';
  h+='<div class="rep-frow"><label class="rep-flbl">Dział</label>';
  h+='<select class="rep-sel" id="rep-f-dzial"><option value="">Wszystkie</option>';
  dzialy.forEach(function(d){h+='<option>'+d+'</option>';});
  h+='</select></div>';
  h+='<div class="rep-frow"><label class="rep-flbl">Typ karty</label>';
  h+='<select class="rep-sel" id="rep-f-typ"><option value="">Wszystkie</option>';
  h+='<option value="r">Rozmowy</option><option value="m">Maile</option><option value="s">Systemy</option>';
  h+='</select></div>';
  h+='<div class="rep-frow"><label class="rep-flbl">Ocena</label>';
  h+='<select class="rep-sel" id="rep-f-ocena"><option value="">Wszystkie</option>';
  h+='<option value="great">Bardzo dobry (≥92%)</option><option value="good">Dobry (82–91%)</option><option value="below">Poniżej standardu (&lt;82%)</option>';
  h+='</select></div>';
  h+='<div class="rep-frow"><label class="rep-flbl">Okres</label>';
  h+='<select class="rep-sel" id="rep-f-period"><option value="">Wszystkie</option>';
  periods.forEach(function(p){h+='<option>'+p+'</option>';});
  h+='</select></div>';
  h+='<div class="rep-frow"><label class="rep-flbl">Data od</label>';
  h+='<input type="date" class="rep-date" id="rep-f-od"></div>';
  h+='<div class="rep-frow"><label class="rep-flbl">Data do</label>';
  h+='<input type="date" class="rep-date" id="rep-f-do"></div>';
  h+='</div></div>';
  // Podgląd i eksport
  h+='<div class="rep-card" style="margin-top:12px">';
  h+='<div class="rep-card-hdr">Podgląd i eksport</div>';
  h+='<div style="padding:14px">';
  h+='<div class="rep-preview" id="rep-preview">Ustaw filtry i kliknij <strong>Generuj podgląd</strong> aby zobaczyć ile rekordów zostanie wyeksportowanych.</div>';
  h+='<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">';
  h+='<button class="btn btn-outline btn-sm" onclick="repPreview()">🔍 Generuj podgląd</button>';
  h+='<button class="btn btn-primary btn-sm" id="rep-dl-btn" onclick="repDownload()" style="opacity:.45;pointer-events:none">⬇ Pobierz CSV</button>';
  h+='<button class="btn btn-dark btn-sm" id="rep-pdf-btn" onclick="repPdf()" style="opacity:.45;pointer-events:none">🖨️ Raport PDF</button>';
  h+='</div></div></div>';
  wrap.innerHTML=h;
  // Jawne ustawienie pierwszego radio — przeglądarka może przywrócić poprzedni stan
  var firstR=wrap.querySelector('input[name="rep-type"]');
  if(firstR) firstR.checked=true;
}

function repGetFiltered(){
  var spec=document.getElementById('rep-f-spec')?.value||'';
  var dzial=document.getElementById('rep-f-dzial')?.value||'';
  var typ=document.getElementById('rep-f-typ')?.value||'';
  var ocena=document.getElementById('rep-f-ocena')?.value||'';
  var period=document.getElementById('rep-f-period')?.value||'';
  var od=document.getElementById('rep-f-od')?.value||'';
  var doo=document.getElementById('rep-f-do')?.value||'';
  return scopedRegistry().filter(function(e){
    if(entryIsArchived(e)) return false;
    if(spec && e.spec!==spec) return false;
    if(dzial && e.dzial!==dzial) return false;
    if(typ && e.p!==typ) return false;
    if(ocena && e.rating!==ocena) return false;
    if(period && e.period!==period) return false;
    if(od && e.data<od) return false;
    if(doo && e.data>doo) return false;
    return true;
  });
}
function repGetType(){
  var el=document.querySelector('input[name="rep-type"]:checked');
  return el?el.value:'detail';
}
function repPreviewReset(){
  var prev=document.getElementById('rep-preview');
  if(prev) prev.innerHTML='Ustaw filtry i kliknij <strong>Generuj podgląd</strong>.';
  var btn=document.getElementById('rep-dl-btn');
  var pdf=document.getElementById('rep-pdf-btn');
  if(btn){btn.style.opacity='.45';btn.style.pointerEvents='none';}
  if(pdf){pdf.style.opacity='.45';pdf.style.pointerEvents='none';}
}
function repPreview(){
  if(!can('reports')){showToast('Brak uprawnień do raportów','warn');return;}
  var filtered=repGetFiltered();
  var type=repGetType();
  var prev=document.getElementById('rep-preview');
  var btn=document.getElementById('rep-dl-btn');
  var pdf=document.getElementById('rep-pdf-btn');
  if(!prev) return;
  if(!filtered.length){
    prev.innerHTML='<span style="color:var(--red)">Brak kart spełniających kryteria filtrów.</span>';
    if(btn){btn.style.opacity='.45';btn.style.pointerEvents='none';}
    if(pdf){pdf.style.opacity='.45';pdf.style.pointerEvents='none';}
    return;
  }
  var data=repPreviewRows(filtered,type);
  var rows=data.rows.length;
  var visibleRows=data.rows.slice(0,25);
  prev.innerHTML=
    '<div><strong>'+rows+'</strong> wierszy wynikowych <span style="color:var(--text3);font-size:10px">(z '+filtered.length+' kart po filtrach)</span></div>'+
    '<div class="rep-preview-table-wrap"><table class="rep-preview-table"><thead><tr>'+data.cols.map(function(c){return '<th>'+escHtml(c)+'</th>';}).join('')+'</tr></thead><tbody>'+
    visibleRows.map(function(row){return '<tr>'+row.map(function(v){return '<td>'+escHtml(v==null?'':v)+'</td>';}).join('')+'</tr>';}).join('')+
    '</tbody></table></div>'+
    (rows>visibleRows.length?'<div class="rep-preview-note">Pokazano pierwsze '+visibleRows.length+' wierszy. Pełny zakres pobierzesz w CSV.</div>':'');
  if(btn){btn.style.opacity=type==='pdf'?'.45':'1';btn.style.pointerEvents=type==='pdf'?'none':'auto';}
  if(pdf){pdf.style.opacity=type==='pdf'?'1':'.45';pdf.style.pointerEvents=type==='pdf'?'auto':'none';}
}
function repCsvVal(v){
  var s=v===null||v===undefined?'':String(v);
  if(/[,"\n]/.test(s)) s='"'+s.replace(/"/g,'""')+'"';
  return s;
}
function repRow(arr){return arr.map(repCsvVal).join(',');}
function repAvg(arr){return arr.length?Math.round(arr.reduce(function(a,b){return a+b;},0)/arr.length):'';}
function repPreviewRows(filtered,type){
  var TL={r:'Rozmowy',m:'Maile',s:'Systemy'};
  var RL={great:'Bardzo dobry',good:'Dobry',below:'Poniżej standardu'};
  var SK={r:['mery','jak','sys'],m:['mery','jak','sys'],s:['obs','dok','eff']};
  if(type==='detail'){
    return {
      cols:['Data','Typ','Specjalista','Dział','Stanowisko','Lider','Kontaktów','Wynik','Ocena','Status'],
      rows:filtered.slice().sort(function(a,b){return a.data<b.data?1:-1;}).map(function(e){
        return [e.data||'',TL[e.p]||e.p,e.spec||'',e.dzial||'',e.stand||'',e.oce||'',e.contactCount||'',(e.avgFinal||0)+'%',RL[e.rating]||e.rating,entryStatusLabel(e)];
      })
    };
  }
  if(type==='summary'||type==='pdf'){
    var sm={};
    filtered.forEach(function(e){
      if(!e.spec) return;
      if(!sm[e.spec]) sm[e.spec]={dzial:e.dzial||'',stand:e.stand||'',leader:e.oce||'',cards:[]};
      sm[e.spec].cards.push(e);
    });
    return {
      cols:['Specjalista','Dział','Stanowisko','Lider','Kart','Śr. wynik','Min','Max','Bardzo dobrych','Dobrych','Poniżej std.'],
      rows:Object.keys(sm).sort().map(function(spec){
        var d=sm[spec], avgs=d.cards.map(function(c){return c.avgFinal||0;});
        return [spec,d.dzial,d.stand,d.leader,d.cards.length,repAvg(avgs)+'%',Math.min.apply(null,avgs)+'%',Math.max.apply(null,avgs)+'%',
          d.cards.filter(function(c){return c.rating==='great';}).length,
          d.cards.filter(function(c){return c.rating==='good';}).length,
          d.cards.filter(function(c){return c.rating==='below';}).length];
      })
    };
  }
  var tm={};
  filtered.forEach(function(e){
    if(!e.spec||!e.period) return;
    var k=e.spec+'||'+e.period;
    if(!tm[k]) tm[k]={spec:e.spec,dzial:e.dzial||'',period:e.period,cards:[]};
    tm[k].cards.push(e);
  });
  return {
    cols:['Specjalista','Dział','Okres','Kart','Śr. wynik','Bardzo dobrych','Dobrych','Poniżej std.'],
    rows:Object.keys(tm).sort().map(function(k){
      var d=tm[k], avgs=d.cards.map(function(c){return c.avgFinal||0;});
      return [d.spec,d.dzial,d.period,d.cards.length,repAvg(avgs)+'%',
        d.cards.filter(function(c){return c.rating==='great';}).length,
        d.cards.filter(function(c){return c.rating==='good';}).length,
        d.cards.filter(function(c){return c.rating==='below';}).length];
    })
  };
}
function repBuildCsv(filtered,type){
  var SEP='\r\n';
  var TL={r:'Rozmowy',m:'Maile',s:'Systemy'};
  var RL={great:'Bardzo dobry',good:'Dobry',below:'Poniżej standardu'};
  var SK={r:['mery','jak','sys'],m:['mery','jak','sys'],s:['obs','dok','eff']};
  var lines=[];
  if(type==='detail'){
    lines.push(repRow(['ID','Data','Okres','Typ','Specjalista','Stanowisko','Dział','Oceniający','Kontaktów','Wynik %','Ocena','Status','Sekcja 1 %','Sekcja 2 %','Sekcja 3 %','Uwagi']));
    filtered.forEach(function(e){
      var sk=SK[e.p]||['s1','s2','s3'];
      lines.push(repRow([
        e.id,e.data,e.period,TL[e.p]||e.p,
        e.spec,e.stand,e.dzial,e.oce,
        e.contactCount||'',e.avgFinal||0,RL[e.rating]||e.rating,entryStatusLabel(e),
        e.secAvg?Math.round(e.secAvg[sk[0]]||0):'',
        e.secAvg?Math.round(e.secAvg[sk[1]]||0):'',
        e.secAvg?Math.round(e.secAvg[sk[2]]||0):'',
        e.notes||''
      ]));
    });
  } else if(type==='summary'){
    lines.push(repRow(['Specjalista','Dział','Stanowisko','Kart','Śr. wynik %','Min %','Max %','Bardzo dobrych','Dobrych','Poniżej stand.','Śr. sek.1 %','Śr. sek.2 %','Śr. sek.3 %']));
    var sm={};
    filtered.forEach(function(e){
      if(!e.spec) return;
      if(!sm[e.spec]) sm[e.spec]={dzial:e.dzial||'',stand:e.stand||'',cards:[]};
      sm[e.spec].cards.push(e);
    });
    Object.keys(sm).sort().forEach(function(spec){
      var d=sm[spec], avgs=d.cards.map(function(c){return c.avgFinal||0;});
      var s1=[],s2=[],s3=[];
      d.cards.forEach(function(e){var sk=SK[e.p]||[];if(e.secAvg){if(e.secAvg[sk[0]]!=null)s1.push(e.secAvg[sk[0]]);if(e.secAvg[sk[1]]!=null)s2.push(e.secAvg[sk[1]]);if(e.secAvg[sk[2]]!=null)s3.push(e.secAvg[sk[2]]);}});
      lines.push(repRow([spec,d.dzial,d.stand,d.cards.length,repAvg(avgs),Math.min.apply(null,avgs),Math.max.apply(null,avgs),
        d.cards.filter(function(c){return c.rating==='great';}).length,
        d.cards.filter(function(c){return c.rating==='good';}).length,
        d.cards.filter(function(c){return c.rating==='below';}).length,
        repAvg(s1),repAvg(s2),repAvg(s3)]));
    });
  } else {
    lines.push(repRow(['Specjalista','Dział','Okres','Kart','Śr. wynik %','Bardzo dobrych','Dobrych','Poniżej stand.']));
    var tm={};
    filtered.forEach(function(e){
      if(!e.spec||!e.period) return;
      var k=e.spec+'||'+e.period;
      if(!tm[k]) tm[k]={spec:e.spec,dzial:e.dzial||'',period:e.period,cards:[]};
      tm[k].cards.push(e);
    });
    Object.keys(tm).sort().forEach(function(k){
      var d=tm[k], avgs=d.cards.map(function(c){return c.avgFinal||0;});
      lines.push(repRow([d.spec,d.dzial,d.period,d.cards.length,repAvg(avgs),
        d.cards.filter(function(c){return c.rating==='great';}).length,
        d.cards.filter(function(c){return c.rating==='good';}).length,
        d.cards.filter(function(c){return c.rating==='below';}).length]));
    });
  }
  return ''+lines.join(SEP);
}
function repDownload(){
  if(!can('export')){showToast('Bieżąca rola nie może eksportować CSV','warn');return;}
  var filtered=repGetFiltered(), type=repGetType();
  if(type==='pdf'){showToast('Dla tego typu użyj przycisku Raport PDF','warn');return;}
  if(!filtered.length){showToast('Brak danych','warn');return;}
  var csv=repBuildCsv(filtered,type);
  var names={detail:'szczegolowy',summary:'specjalisci',trend:'trendy'};
  var fn='PeP_P24_raport_'+names[type]+'_'+new Date().toISOString().split('T')[0]+'.csv';
  try{
    var a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
    a.download=fn;a.click();
    showToast('Pobrano: '+fn,'ok');
  }catch(e){showToast('Błąd eksportu','err');}
}
function repPdfInsights(cards){
  var strengths={}, risks={};
  cards.forEach(function(e){
    if(!e.snapshotScores) return;
    var def=DEFS[e.p];
    def.sections.forEach(function(sec){
      sec.criteria.forEach(function(cr,ci){
        var ok=0,bad=0,total=0;
        for(var c=0;c<(e.contactCount||1);c++){
          var v=((e.snapshotScores[sec.key]||{})[ci]||[])[c];
          if(v==='nd'||v==null) continue;
          total++; if(v===1)ok++; if(v===0||v===0.5)bad++;
        }
        if(total){
          strengths[cr.n]=(strengths[cr.n]||0)+ok/total;
          risks[cr.n]=(risks[cr.n]||0)+bad/total;
        }
      });
    });
  });
  function top(obj,dir){
    return Object.entries(obj).map(function(a){return{name:a[0],score:a[1]};}).sort(function(a,b){return dir*(a.score-b.score);}).slice(0,5).map(function(x){return x.name;});
  }
  return {strong:top(strengths,-1),risk:top(risks,-1)};
}
function repPdf(){
  if(!can('pdf')){showToast('Bieżąca rola nie może generować PDF','warn');return;}
  var filtered=repGetFiltered();
  if(!filtered.length){showToast('Brak danych do raportu PDF','warn');return;}
  var spec=document.getElementById('rep-f-spec')?.value||filtered[0].spec;
  var cards=filtered.filter(function(e){return e.spec===spec;});
  if(!cards.length){showToast('Wybierz specjalistę do raportu PDF','warn');return;}
  var avg=Math.round(cards.reduce(function(a,b){return a+b.avgFinal;},0)/cards.length);
  var best=cards.filter(function(e){return e.rating==='great';}).length;
  var below=cards.filter(function(e){return e.rating==='below';}).length;
  var person=getPersonByName(spec)||{};
  var ins=repPdfInsights(cards);
  var rows=cards.sort(function(a,b){return a.data<b.data?1:-1;}).map(function(e){
    return '<tr><td>'+escHtml(e.data||'')+'</td><td>'+escHtml(e.period||'')+'</td><td>'+escHtml({r:'Rozmowa',m:'Mail',s:'Działania w systemach'}[e.p]||e.p)+'</td><td>'+e.avgFinal+'%</td><td>'+escHtml(ratingLabel(e.rating))+'</td></tr>';
  }).join('');
  var rec=below?'Priorytetem jest praca nad kryteriami z obszarów do poprawy oraz ponowna weryfikacja w następnym okresie.':'Utrzymać obecny standard i wykorzystać mocne strony jako dobre praktyki w zespole.';
  var html='<!DOCTYPE html><html lang="pl"><head><meta charset="UTF-8"><title>Raport PDF - '+escHtml(spec)+'</title><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet"><style>body{margin:0;background:#fff}.pdf-report table{width:100%;border-collapse:collapse;font-size:11px}.pdf-report th,.pdf-report td{padding:7px 8px;border-bottom:1px solid #E5E7EB;text-align:left}.pdf-report th{font-size:9px;text-transform:uppercase;color:#667085}@media print{button{display:none}.pdf-report{padding:0}}</style></head><body><div class="pdf-report">'+
    '<div class="pdf-title">Raport jakości specjalisty</div><div class="pdf-sub">'+escHtml(spec)+' · '+escHtml(person.department||cards[0].dzial||'')+' · '+escHtml(person.position||cards[0].stand||'')+' · Lider: '+escHtml(person.leader||cards[0].oce||'')+'</div>'+
    '<div class="pdf-kpis"><div class="pdf-kpi"><b>'+cards.length+'</b><span>Liczba kart</span></div><div class="pdf-kpi"><b>'+avg+'%</b><span>Średni wynik</span></div><div class="pdf-kpi"><b>'+best+'</b><span>Bardzo dobre</span></div><div class="pdf-kpi"><b>'+below+'</b><span>Poniżej standardu</span></div></div>'+
    '<div class="pdf-section"><h3>Podsumowanie</h3><p style="font-size:12px;line-height:1.7">Specjalista uzyskał średni wynik '+avg+'% na podstawie '+cards.length+' kart. Raport obejmuje wybrane filtry z zakładki Raporty.</p></div>'+
    '<div class="pdf-section"><h3>Mocne strony</h3><ul class="pdf-list">'+(ins.strong.length?ins.strong.map(function(x){return '<li>'+escHtml(x)+'</li>';}).join(''):'<li>Brak danych szczegółowych.</li>')+'</ul></div>'+
    '<div class="pdf-section"><h3>Obszary do poprawy</h3><ul class="pdf-list">'+(ins.risk.length?ins.risk.map(function(x){return '<li>'+escHtml(x)+'</li>';}).join(''):'<li>Brak istotnych obszarów ryzyka w wybranych danych.</li>')+'</ul></div>'+
    '<div class="pdf-section"><h3>Rekomendacja</h3><p style="font-size:12px;line-height:1.7">'+escHtml(rec)+'</p></div>'+
    '<div class="pdf-section"><h3>Lista ocen</h3><table><thead><tr><th>Data</th><th>Okres</th><th>Typ</th><th>Wynik</th><th>Ocena</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
    '<div style="margin-top:18px"><button onclick="window.print()" style="padding:9px 14px;border:0;border-radius:7px;background:#0F766E;color:white;font-family:Poppins;font-weight:700">Zapisz / drukuj PDF</button></div>'+
    '</div></body></html>';
  var w=window.open('','_blank');
  if(!w){showToast('Przeglądarka zablokowała okno raportu','err');return;}
  w.document.open();w.document.write(html);w.document.close();
  setTimeout(function(){try{w.focus();w.print();}catch(e){}},300);
}

// ── ADMIN ──








