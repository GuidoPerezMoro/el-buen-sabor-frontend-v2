import {ReactNode} from 'react'
import {redirect} from 'next/navigation'
import {getServerClaims} from '@/lib/authz-server'

export default async function SucursalListLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{empresaId: string}>
}) {
  const {empresaId} = await params
  const {roles, empresaId: empresaIdClaim, sucursalId: sucursalIdClaim} = await getServerClaims()

  const isCocinero = roles.includes('cocinero')
  const isGerente = roles.includes('gerente')

  if (isCocinero) {
    // send cocinero straight to their dashboard
    if (empresaIdClaim && sucursalIdClaim) {
      redirect(`/empresa/${empresaIdClaim}/sucursal/${sucursalIdClaim}`)
    }
    redirect('/') // fallback
  }

  // gerente on wrong empresa? bounce to their empresa's sucursal list
  if (isGerente && empresaIdClaim && empresaId !== String(empresaIdClaim)) {
    redirect(`/empresa/${empresaIdClaim}/sucursal`)
  }

  return <>{children}</>
}
