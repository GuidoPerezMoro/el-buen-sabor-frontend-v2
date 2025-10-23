import {ReactNode} from 'react'
import {redirect} from 'next/navigation'
import {getServerRoles} from '@/lib/authz-server'

export default async function AdminEmpresaLayout({children}: {children: ReactNode}) {
  const roles = await getServerRoles()
  if (!roles.some(r => r === 'superadmin' || r === 'admin')) redirect('/')
  return <>{children}</>
}
