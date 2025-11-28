import {NextRequest, NextResponse} from 'next/server'
import {decodeJwt} from 'jose'

const NS = 'https://elbuensabor/'

export async function GET(req: NextRequest) {
  const url = new URL('/auth/access-token', req.url)
  url.searchParams.set('audience', process.env.AUTH0_AUDIENCE ?? '')
  url.searchParams.set('scope', process.env.AUTH0_SCOPE ?? 'openid profile email')

  const atRes = await fetch(url.toString(), {
    headers: {cookie: req.headers.get('cookie') ?? ''},
    cache: 'no-store',
  })
  if (!atRes.ok) return NextResponse.redirect(new URL('/', req.url))

  const {token} = (await atRes.json()) as {token: string}
  const claims = decodeJwt(token) as Record<string, any>

  const roles: string[] = claims[`${NS}roles`] || []
  const empresaId = claims[`${NS}empresa_id`]
  const sucursalId = claims[`${NS}sucursal_id`]

  const r = new Set(roles)

  // Default for everyone if we don’t have enough info
  let dest = '/empresa'

  if (r.has('superadmin')) {
    dest = '/empresa'
  } else if (r.has('admin')) {
    dest = empresaId && empresaId !== 'null' ? `/empresa/${empresaId}/sucursal` : '/empresa'
  } else if (r.has('gerente') || r.has('cocinero')) {
    // Only send directly to the sucursal if BOTH claims are present
    if (empresaId && sucursalId && empresaId !== 'null' && sucursalId !== 'null') {
      dest = `/empresa/${empresaId}/sucursal/${sucursalId}/pedidos`
    } else {
      dest = '/empresa'
    }
  } else if (r.has('cliente')) {
    dest = '/empresa'
  }

  return NextResponse.redirect(new URL(dest, req.url))
}
