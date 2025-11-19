export type Role = 'superadmin' | 'admin' | 'gerente' | 'cocinero' | 'cliente'

// small helpers
export const ALL_ROLES: Role[] = ['superadmin', 'admin', 'gerente', 'cocinero', 'cliente']
export const hasAnyRole = (userRoles: string[] | undefined, allow: Role[]) =>
  (userRoles ?? []).some(r => (allow as string[]).includes(r))
