function ssValue(id) {
  var el = document.getElementById(id);
  return el && el.value ? String(el.value).trim() : '';
}

function ssTypeName(type) {
  return { r: 'rozmów', m: 'maili', s: 'działań w systemach' }[type] || 'kart';
}

function ssRows(type, specialist, period) {
  var rows = Array.isArray(window.registry) ? window.registry : [];
  return rows.filter(function(entry) {
    if (!entry || entry.archived) return false;
    if (entry.p !== type) return false;
    if (specialist && entry.spec !== specialist) return false;
    if (period && entry.period !== period) return false;
    if (typeof window.entryInScope === 'function' && !window.entryInScope(entry)) return false;
    return true;
  });
}

function ssAverage(rows) {
  if (!rows.length) return 0;
  var sum = rows.reduce(function(total, entry) { return total + Number(entry.avgFinal || 0); }, 0);
  return Math.round(sum / rows.length);
}

function ssLabel(score) {
  if (score >= 92) return 'Bardzo dobry';
  if (score >= 82) return 'Dobry';
  return 'Poniżej standardu';
}

function ssBuild(type) {
  var specialist = ssValue(type + '-spec');
  var date = ssValue(type + '-data');
  var period = typeof window.periodOf === 'function' ? window.periodOf(date) : '';
  var rows = ssRows(type, specialist, period);
  var avg = ssAverage(rows);
  var goal = typeof window.goalForType === 'function' ? window.goalForType(type) : 0;
  var done = rows.reduce(function(total, entry) { return total + Number(entry.contactCount || 0); }, 0);
  var best = rows.slice().sort(function(a, b) { return Number(b.avgFinal || 0) - Number(a.avgFinal || 0); })[0];
  var worst = rows.slice().sort(function(a, b) { return Number(a.avgFinal || 0) - Number(b.avgFinal || 0); })[0];

  if (!specialist) return 'Wybierz specjalistę, aby zobaczyć podsumowanie.';
  if (!rows.length) return 'Brak zapisanych kart typu ' + ssTypeName(type) + ' dla wybranego specjalisty w periodzie ' + (period || 'bieżącym') + '.';

  var text = [];
  text.push('Specjalista: ' + specialist + '.');
  text.push('Period: ' + (period || 'brak periodu') + '.');
  text.push('Liczba zapisanych kart: ' + rows.length + '. Liczba ocenionych kontaktów: ' + done + (goal ? ' / cel ' + goal + '.' : '.'));
  text.push('Średni wynik: ' + avg + '%. Ocena: ' + ssLabel(avg) + '.');
  if (best) text.push('Najwyższy wynik w tym periodzie: ' + best.avgFinal + '%, data ' + best.data + '.');
  if (worst && worst !== best) text.push('Najniższy wynik w tym periodzie: ' + worst.avgFinal + '%, data ' + worst.data + '.');
  return text.join(' ');
}

function ssRun(type) {
  var text = ssBuild(type);
  return {
    skillId: 'specialist-summary',
    targetType: type,
    status: 'ok',
    title: 'Podsumowanie specjalisty',
    summary: text,
    details: [text]
  };
}

export const SpecialistSummarySkill = {
  id: 'specialistSummary',
  label: 'Podsumuj specjalistę',
  run: ssRun
};
