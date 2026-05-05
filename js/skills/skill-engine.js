import { SKILL_CONFIG, skillAccessForRole } from './skill-config.js';
import { QualityGuardSkill } from './quality-guard-skill.js';
import { CommentGeneratorSkill } from './comment-generator-skill.js';
import { SpecialistSummarySkill } from './specialist-summary-skill.js';

const SKILL_REGISTRY = {
  qualityGuard: QualityGuardSkill,
  commentGenerator: CommentGeneratorSkill,
  specialistSummary: SpecialistSummarySkill
};

function activeSkillRole() {
  if (typeof window.activeRole === 'function') return window.activeRole();
  return 'viewer';
}

function skillsForType(type) {
  const formConfig = SKILL_CONFIG.forms[type];
  const allowed = skillAccessForRole(activeSkillRole());
  if (!formConfig) return [];
  return formConfig.skills
    .filter(skillId => allowed.indexOf(skillId) > -1)
    .map(skillId => SKILL_REGISTRY[skillId])
    .filter(Boolean);
}

function escSkillHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function resultItems(items) {
  return (items || []).filter(Boolean).map(item => '<li>' + escSkillHtml(item) + '</li>').join('');
}

function renderSkillResult(type, result) {
  const target = document.getElementById(type + '-skill-output');
  if (!target || !result) return;
  const warnings = resultItems(result.warnings);
  const suggestions = resultItems(result.suggestions);
  const details = resultItems(result.details);
  target.style.display = 'block';
  target.innerHTML =
    '<div class="skill-result skill-result-' + escSkillHtml(result.status || 'ok') + '">' +
      '<div class="skill-result-title">' + escSkillHtml(result.title || 'Wynik skilla') + '</div>' +
      '<div class="skill-result-summary">' + escSkillHtml(result.summary || '') + '</div>' +
      (warnings ? '<div class="skill-result-block"><strong>Ryzyka</strong><ul>' + warnings + '</ul></div>' : '') +
      (suggestions ? '<div class="skill-result-block"><strong>Sugestie</strong><ul>' + suggestions + '</ul></div>' : '') +
      (details ? '<div class="skill-result-block"><strong>Szczegóły</strong><ul>' + details + '</ul></div>' : '') +
    '</div>';
}

function runSkill(type, skillId) {
  const skill = SKILL_REGISTRY[skillId];
  if (!skill || typeof skill.run !== 'function') return;
  try {
    const result = skill.run(type);
    renderSkillResult(type, result);
    if (window.showToast) window.showToast(skill.label + ': gotowe', 'ok');
  } catch (error) {
    renderSkillResult(type, {
      status: 'warning',
      title: 'Błąd skilla',
      summary: error && error.message ? error.message : 'Nie udało się uruchomić skilla.'
    });
    console.error(error);
  }
}

function buildSkillPanel(type) {
  const skills = skillsForType(type);
  if (!skills.length) return '';
  const buttons = skills.map(skill => {
    return '<button class="btn btn-outline btn-sm skill-btn" type="button" onclick="window.OceniatorSkills.run(\'' + type + '\',\'' + skill.id + '\')">' + escSkillHtml(skill.label) + '</button>';
  }).join('');
  return '<div class="skill-panel" id="' + type + '-skill-panel">' +
    '<div class="skill-panel-head">' +
      '<div><div class="skill-panel-kicker">Skille</div><div class="skill-panel-title">Asystent oceny</div></div>' +
      '<span class="skill-panel-badge">Beta</span>' +
    '</div>' +
    '<div class="skill-panel-actions">' + buttons + '</div>' +
    '<div class="skill-output" id="' + type + '-skill-output" style="display:none"></div>' +
  '</div>';
}

function attachPanel(type) {
  const wrap = document.getElementById('wrap-' + type);
  if (!wrap || document.getElementById(type + '-skill-panel')) return;
  const main = wrap.querySelector('.form-main');
  if (!main) return;
  const resultPanel = main.querySelector('.res-panel');
  if (resultPanel) {
    resultPanel.insertAdjacentHTML('afterend', buildSkillPanel(type));
    return;
  }
  const card = main.querySelector('.card');
  if (!card) return;
  card.insertAdjacentHTML('afterend', buildSkillPanel(type));
}

function patchBuildForm() {
  if (window.__oceniatorSkillsBuildPatched || typeof window.buildForm !== 'function') return;
  const originalBuildForm = window.buildForm;
  window.buildForm = function(type) {
    originalBuildForm(type);
    attachPanel(type);
  };
  window.__oceniatorSkillsBuildPatched = true;
}

function attachAllPanels() {
  ['r', 'm', 's'].forEach(attachPanel);
}

export function initSkills() {
  if (!SKILL_CONFIG.enabled) return;
  window.OceniatorSkills = {
    run: runSkill,
    attachAll: attachAllPanels,
    skillsForType: skillsForType
  };
  patchBuildForm();
  attachAllPanels();
}
