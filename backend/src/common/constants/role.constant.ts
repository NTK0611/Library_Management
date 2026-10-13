export const ROLES = {
  STUDENT: 'STUDENT',
  LECTURER: 'LECTURER',
  LIBRARIAN: 'LIBRARIAN',
  MANAGER: 'MANAGER',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

