import {redirect} from 'next/navigation'
import {getServerClaims} from '@/lib/authz-server'
import ClientePerfilPage from '@/components/domain/cliente/ClientePerfilPage'

export default async function PerfilPage() {
  const {roles} = await getServerClaims()
  const normalized = Array.isArray(roles) ? roles : []

  const staffRoles = ['superadmin', 'admin', 'gerente', 'cocinero']
  const hasStaffRole = normalized.some(r => staffRoles.includes(r))
  const isCliente = normalized.includes('cliente')

  // "Cliente-like": tiene rol cliente o no tiene roles de staff.
  // - Staff se redirige al flujo habitual (/post-login).
  // - Clientes y nuevos logins sin rol todavía pueden ver /perfil.
  const isClienteLike = isCliente || !hasStaffRole

  if (!isClienteLike) {
    redirect('/post-login')
  }

  return <ClientePerfilPage />
}
