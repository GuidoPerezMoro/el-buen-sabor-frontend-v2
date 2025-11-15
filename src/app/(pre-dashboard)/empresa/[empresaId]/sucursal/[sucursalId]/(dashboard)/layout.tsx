import {ReactNode} from 'react'
import {redirect} from 'next/navigation'
import {getServerClaims} from '@/lib/authz-server'
import DashboardShell from './shell'

export default async function DashboardLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{empresaId: string; sucursalId: string}>
}) {
  const {empresaId, sucursalId} = await params
  const {roles} = await getServerClaims()

  // "Public" means: no roles, or *only* cliente.
  // If someone accidentally has both cliente + staff, they are treated as staff.
  const isOnlyCliente = roles.length === 1 && roles[0] === 'cliente'
  const isPublic = roles.length === 0 || isOnlyCliente

  if (isPublic) {
    redirect(`/empresa/${empresaId}/sucursal/${sucursalId}/shop`)
  }

  return <DashboardShell>{children}</DashboardShell>
}
