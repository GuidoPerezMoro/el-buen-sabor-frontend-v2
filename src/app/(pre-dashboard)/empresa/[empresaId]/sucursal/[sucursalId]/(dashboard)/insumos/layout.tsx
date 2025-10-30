import {ReactNode} from 'react'
import {redirect} from 'next/navigation'
import {getServerRoles} from '@/lib/authz-server'
import {hasAny} from '@/lib/authz-helpers'
import {forbiddenRedirect} from '@/lib/http'

export default async function EmpleadosGuard({children}: {children: ReactNode}) {
  const roles = await getServerRoles()
  if (!hasAny(roles, ['superadmin', 'admin', 'gerente'])) {
    redirect(forbiddenRedirect())
  }
  return <>{children}</>
}
