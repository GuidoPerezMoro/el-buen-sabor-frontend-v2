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
  // NOTE: no redirect logic here to avoid loops with partial/lagging claims.

  // const {empresaId, sucursalId} = await params
  // const {roles, empresaId: empresaIdClaim, sucursalId: sucursalIdClaim} = await getServerClaims()

  // const isGerente = roles.includes('gerente')
  // const isCocinero = roles.includes('cocinero')
  // const isStaffRestr = isGerente || isCocinero

  // // Only try to "snap" to the claimed route if BOTH claims exist.
  // const hasBothClaims = Boolean(empresaIdClaim && sucursalIdClaim)

  // if (isStaffRestr && hasBothClaims) {
  //   const claimedEmpresa = String(empresaIdClaim)
  //   const claimedSucursal = String(sucursalIdClaim)

  //   const currentUrl = `/empresa/${empresaId}/sucursal/${sucursalId}`
  //   const targetUrl = `/empresa/${claimedEmpresa}/sucursal/${claimedSucursal}`

  //   if (currentUrl !== targetUrl) {
  //     redirect(targetUrl)
  //   }
  // }

  return <>{children}</>
}
