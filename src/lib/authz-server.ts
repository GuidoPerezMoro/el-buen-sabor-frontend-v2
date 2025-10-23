import {headers} from 'next/headers'
import {decodeJwt} from 'jose'

const NS = 'https://elbuensabor/'

export async function getServerRoles(): Promise<string[]> {
  // Pide el AT al endpoint del SDK, reenviando cookies del request actual
  const cookie = (await headers()).get('cookie') ?? ''
  const base = process.env.APP_BASE_URL || 'http://localhost:3000'
  const res = await fetch(
    `${base}/auth/access-token?audience=${encodeURIComponent(process.env.AUTH0_AUDIENCE!)}&scope=${encodeURIComponent(process.env.AUTH0_SCOPE || 'openid profile email')}`,
    {
      headers: {cookie},
      cache: 'no-store',
    }
  )
  if (!res.ok) return []
  const {token} = (await res.json()) as {token?: string}
  if (!token) return []
  const claims = decodeJwt(token) as Record<string, any>
  return (claims[`${NS}roles`] as string[]) || []
}
