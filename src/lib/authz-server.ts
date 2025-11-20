import {headers} from 'next/headers'
import {decodeJwt} from 'jose'

const NS = 'https://elbuensabor/'

export async function getServerClaims() {
  const cookie = (await headers()).get('cookie') ?? ''
  const base = process.env.APP_BASE_URL || 'http://localhost:3000'
  const audience = process.env.AUTH0_AUDIENCE
  const scope = process.env.AUTH0_SCOPE || 'openid profile email'
  if (!audience) console.warn('AUTH0_AUDIENCE missing')

  const url = `${base}/auth/access-token?audience=${encodeURIComponent(audience || '')}&scope=${encodeURIComponent(scope)}`
  const res = await fetch(url, {headers: {cookie}, cache: 'no-store'})
  if (!res.ok) {
    // 401/403 → sesión sin AT; devolvemos forma estable
    return {
      roles: [] as string[],
      empresaId: null as string | null,
      sucursalId: null as string | null,
    }
  }
  const {token} = (await res.json()) as {token: string}
  const claims = decodeJwt(token) as Record<string, any>
  return {
    roles: (claims[`${NS}roles`] as string[]) || [],
    empresaId: (claims[`${NS}empresa_id`] as string) ?? null,
    sucursalId: (claims[`${NS}sucursal_id`] as string) ?? null,
  }
}

export async function getServerRoles() {
  const {roles} = await getServerClaims()
  return roles
}
