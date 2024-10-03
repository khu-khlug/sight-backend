export const UserRole = {
  USER: 'USER',
  MANAGER: 'MANAGER',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
