export type Role = 'superadmin' | 'admin' | 'gerente' | 'cocinero' | 'cliente'

// small helpers
export const ALL_ROLES: Role[] = ['superadmin', 'admin', 'gerente', 'cocinero', 'cliente']
export const hasAnyRole = (userRoles: string[] | undefined, allow: Role[]) =>
  (userRoles ?? []).some(r => (allow as string[]).includes(r))

// staff = roles con acceso al dashboard (excluye cliente)
export const STAFF_ROLES: Role[] = ['superadmin', 'admin', 'gerente', 'cocinero']

// Rol principal "resuelto" para lógica de UI/negocio
export type StaffRole = (typeof STAFF_ROLES)[number] | 'other'
