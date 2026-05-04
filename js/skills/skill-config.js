export const SKILL_CONFIG = {
  version: '1.0.0',
  enabled: true,
  forms: {
    r: {
      label: 'Rozmowy',
      skills: ['qualityGuard', 'commentGenerator', 'specialistSummary']
    },
    m: {
      label: 'Maile',
      skills: ['qualityGuard', 'commentGenerator', 'specialistSummary']
    },
    s: {
      label: 'Systemy',
      skills: ['qualityGuard', 'commentGenerator', 'specialistSummary']
    }
  },
  roleAccess: {
    admin: ['qualityGuard', 'commentGenerator', 'specialistSummary'],
    director: ['qualityGuard', 'commentGenerator', 'specialistSummary'],
    leader: ['qualityGuard', 'commentGenerator', 'specialistSummary'],
    assessor: ['qualityGuard', 'commentGenerator'],
    viewer: ['specialistSummary']
  }
};

export function skillAccessForRole(role) {
  return SKILL_CONFIG.roleAccess[role] || SKILL_CONFIG.roleAccess.viewer;
}
