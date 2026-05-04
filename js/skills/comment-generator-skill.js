function cgValue(id) {
  var el = document.getElementById(id);
  return el && el.value ? String(el.value).trim() : '';
}

function cgScore(type, sectionKey) {
  var el = document.getElementById(type + '-ss-' + sectionKey);
  var raw = el ? String(el.textContent || '') : '';
  var num = parseInt(raw.replace('%', ''), 10);
  return isNaN(num) ? 0 : num;
}

function cgSectionSentence(label, score) {
  if (score >= 92) return label + ' jest na wysokim poziomie. Kryteria spełniono zgodnie ze standardem.';
  if (score >= 82) return label + ' jest na dobrym poziomie. Warto doprecyzować elementy obniżające wynik.';
  return label + ' wymaga poprawy. Należy wskazać braki i dalsze działania.';
}

function cgCollectNotes(type, sectionKey) {
  var count = window.state && window.state[type] ? window.state[type].count : 0;
  var parts = [];
  for (var i = 0; i < count; i += 1) {
    var note = cgValue('sn-' + type + '-' + sectionKey + '-' + i);
    if (note) parts.push(note);
  }
  return parts.join(' ');
}

function cgFinalScore(type) {
  var el = document.getElementById(type + '-rp-f');
  var raw = el ? String(el.textContent || '') : '';
  var num = parseInt(raw.replace('%', ''), 10);
  return isNaN(num) ? 0 : num;
}

function cgFinalLabel(score) {
  if (score >= 92) return 'Bardzo dobry';
  if (score >= 82) return 'Dobry';
  return 'Poniżej standardu';
}

function cgBuild(type) {
  var def = window.DEFS ? window.DEFS[type] : null;
  if (!def) return '';
  var text = [];
  def.sections.forEach(function(section) {
    var score = cgScore(type, section.key);
    var label = String(section.lbl || '').replace('I. ', '').replace('II. ', '').replace('III. ', '');
    var line = cgSectionSentence(label, score);
    var notes = cgCollectNotes(type, section.key);
    if (notes) line += ' Uwagi: ' + notes;
    line += ' Wynik sekcji: ' + score + '%.';
    text.push(line);
  });
  var finalScore = cgFinalScore(type);
  if (finalScore) text.push('Wynik końcowy wynosi ' + finalScore + '%. Ocena: ' + cgFinalLabel(finalScore) + '.');
  return text.join('\n\n');
}

function cgRun(type) {
  var text = cgBuild(type);
  var target = document.getElementById(type + '-gnotes');
  if (target && text) {
    target.value = text;
    target.dispatchEvent(new Event('input', { bubbles: true }));
  }
  return {
    skillId: 'comment-generator',
    targetType: type,
    status: text ? 'ok' : 'warning',
    title: 'Generator komentarza',
    generalComment: text,
    summary: text ? 'Wygenerowano podsumowanie oceny.' : 'Nie udało się wygenerować podsumowania.'
  };
}

export const CommentGeneratorSkill = {
  id: 'commentGenerator',
  label: 'Wygeneruj podsumowanie',
  run: cgRun
};
