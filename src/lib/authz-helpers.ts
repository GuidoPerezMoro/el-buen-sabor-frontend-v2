export function hasAny(roles: string[] = [], allow: string[]) {
  return allow.some(r => roles.includes(r))
}
