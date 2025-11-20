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

  // Treat as PUBLIC *only* if it's exactly ["cliente"].
  // Empty roles are considered "unknown yet" → don't redirect.
  const isOnlyCliente = roles.length === 1 && roles[0] === 'cliente'
  if (isOnlyCliente) {
    redirect(`/empresa/${empresaId}/sucursal/${sucursalId}/shop`)
  }

  return <DashboardShell>{children}</DashboardShell>
}
