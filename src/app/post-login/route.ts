import {NextRequest, NextResponse} from 'next/server'
import {decodeJwt} from 'jose'

const NS = 'https://elbuensabor/'

export async function GET(req: NextRequest) {
  // Ask the SDK endpoint for the AT, forwarding cookies
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
  let dest = '/empresa'
  if (r.has('admin')) {
    dest = empresaId && empresaId !== 'null' ? `/empresa/${empresaId}/sucursal` : '/empresa'
  }
  console.log('dest: ', dest)
  if (r.has('gerente') || r.has('cocinero')) {
    if (empresaId && sucursalId && empresaId !== 'null' && sucursalId !== 'null') {
      dest = `/empresa/${empresaId}/sucursal/${sucursalId}`
    } else {
      dest = '/empresa' // safe fallback
    }
  }
  if (r.has('superadmin') || r.has('cliente')) dest = '/empresa'

  return NextResponse.redirect(new URL(dest, req.url))
}
