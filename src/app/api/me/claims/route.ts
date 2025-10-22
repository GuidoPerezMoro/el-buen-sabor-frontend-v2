import {NextRequest, NextResponse} from 'next/server'
import {auth0} from '@/lib/auth0'
import {decodeJwt} from 'jose'

const NS = 'https://elbuensabor/'

export async function GET(req: NextRequest) {
  const session = await auth0.getSession()
  if (!session) return NextResponse.json({ok: false, reason: 'no_session'}, {status: 401})

  // Ask SDK for an AT for your API (uses cookies from this req)
  const {token} = await auth0.getAccessToken(req)

  if (!token) return NextResponse.json({ok: false, reason: 'no_token'}, {status: 401})

  const claims = decodeJwt(token) as Record<string, any>
  const roles: string[] = (claims[`${NS}roles`] as string[]) || []
  const empresaId = claims[`${NS}empresa_id`] ?? null
  const sucursalId = claims[`${NS}sucursal_id`] ?? null

  return NextResponse.json({ok: true, roles, empresaId, sucursalId, claims})
}

// TODO: Remove this file
