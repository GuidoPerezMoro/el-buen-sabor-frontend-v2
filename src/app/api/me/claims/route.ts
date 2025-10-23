import {NextRequest, NextResponse} from 'next/server'
import {decodeJwt} from 'jose'

const NS = 'https://elbuensabor/'

export async function GET(req: NextRequest) {
  // Pedimos el AT al endpoint del SDK reenviando cookies
  const url = new URL('/auth/access-token', req.url)
  url.searchParams.set('audience', process.env.AUTH0_AUDIENCE ?? '')
  url.searchParams.set('scope', process.env.AUTH0_SCOPE ?? 'openid profile email')

  const atRes = await fetch(url.toString(), {
    headers: {cookie: req.headers.get('cookie') ?? ''},
    cache: 'no-store',
  })

  if (!atRes.ok) {
    return NextResponse.json({ok: false, reason: 'no_token'}, {status: 401})
  }

  const {token} = (await atRes.json()) as {token: string}
  const claims = decodeJwt(token) as Record<string, any>

  const roles: string[] = claims[`${NS}roles`] || []
  const empresaId = claims[`${NS}empresa_id`] ?? null
  const sucursalId = claims[`${NS}sucursal_id`] ?? null

  return NextResponse.json({ok: true, roles, empresaId, sucursalId})
}
