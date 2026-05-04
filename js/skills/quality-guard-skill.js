function readSkillField(id) {
  var el = document.getElementById(id);
  return el && el.value ? String(el.value).trim() : '';
}

function readSkillIds(type) {
  var count = window.state && window.state[type] ? window.state[type].count : 0;
  var ids = [];
  for (var i = 0; i < count; i += 1) {
    ids.push(readSkillField(type + '-id-' + i));
  }
  return ids;
}

function lowScoreCount(type) {
  var def = window.DEFS ? window.DEFS[type] : null;
  var current = window.state ? window.state[type] : null;
  if (!def || !current) return 0;
  var total = 0;
  def.sections.forEach(function(section) {
    section.criteria.forEach(function(_, criterionIndex) {
      var values = current.scores[section.key][criterionIndex] || [];
      values.forEach(function(value) {
        if (value === 0 || value === 0.5) total += 1;
      });
    });
  });
  return total;
}

function filledNotesCount(type) {
  var def = window.DEFS ? window.DEFS[type] : null;
  var count = window.state && window.state[type] ? window.state[type].count : 0;
  if (!def) return 0;
  var total = 0;
  def.sections.forEach(function(section) {
    for (var i = 0; i < count; i += 1) {
      if (readSkillField('sn-' + type + '-' + section.key + '-' + i)) total += 1;
    }
  });
  return total;
}

function runQualityGuard(type) {
  var warnings = [];
  var suggestions = [];
  var ids = readSkillIds(type);
  var filledIds = ids.filter(Boolean);
  var count = window.state && window.state[type] ? window.state[type].count : 0;
  var lowScores = lowScoreCount(type);
  var notes = filledNotesCount(type);
  var generalNotes = readSkillField(type + '-gnotes');
  var goldDesc = readSkillField(type + '-gold-desc');
  var gold = window.state && window.state[type] ? window.state[type].gold || [] : [];
  var hasGold = gold.some(function(value) { return Number(value) > 0; });

  if (!readSkillField(type + '-spec')) warnings.push('Brak specjalisty.');
  if (!readSkillField(type + '-data')) warnings.push('Brak daty oceny.');
  if (!filledIds.length) warnings.push('Brak ID kontaktu. Uzupełnij co najmniej jedno pole.');
  if (filledIds.length && filledIds.length < count) suggestions.push('Nie wszystkie pola ID są uzupełnione. Sprawdź, czy liczba kontaktów zgadza się z oceną.');
  if (lowScores > 0 && notes === 0 && !generalNotes) warnings.push('Są obniżone oceny, ale brakuje komentarzy do sekcji lub podsumowania.');
  if (hasGold && !goldDesc) warnings.push('Dodano Złote Punkty, ale brakuje opisu sytuacji.');
  if (lowScores === 0 && !generalNotes) suggestions.push('Ocena jest maksymalna. Dodaj krótkie podsumowanie, żeby karta była czytelna w ewidencji.');

  return {
    skillId: 'quality-guard',
    targetType: type,
    status: warnings.length ? 'warning' : 'ok',
    title: 'Kontrola jakości karty',
    warnings: warnings,
    suggestions: suggestions,
    summary: warnings.length ? 'Wykryto ryzyka przed zapisem: ' + warnings.length : 'Karta nie ma widocznych ryzyk przed zapisem.'
  };
}

export const QualityGuardSkill = {
  id: 'qualityGuard',
  label: 'Sprawdź kartę',
  run: runQualityGuard
};
