import {ReactNode} from 'react'
import {redirect} from 'next/navigation'
import {getServerClaims} from '@/lib/authz-server'

export default async function SucursalParentLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{empresaId: string; sucursalId: string}>
}) {
  const {empresaId, sucursalId} = await params
  const {roles, empresaId: empresaIdClaim, sucursalId: sucursalIdClaim} = await getServerClaims()

  const isGerente = roles.includes('gerente')
  const isCocinero = roles.includes('cocinero')
  const isStaffRestr = isGerente || isCocinero

  if (isStaffRestr) {
    // compute the canonical target for this user
    const targetEmpresa = empresaIdClaim ? String(empresaIdClaim) : empresaId
    const targetSucursal = sucursalIdClaim ? String(sucursalIdClaim) : sucursalId
    const targetUrl = `/empresa/${targetEmpresa}/sucursal/${targetSucursal}`
    const currentUrl = `/empresa/${empresaId}/sucursal/${sucursalId}`

    const empresaMismatch = empresaIdClaim && String(empresaIdClaim) !== empresaId
    const sucursalMismatch = sucursalIdClaim && String(sucursalIdClaim) !== sucursalId

    if ((empresaMismatch || sucursalMismatch) && targetUrl !== currentUrl) {
      redirect(targetUrl)
    }
  }

  return <>{children}</>
}
