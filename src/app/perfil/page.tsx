import {redirect} from 'next/navigation'
import {getServerClaims} from '@/lib/authz-server'
import ClientePerfilPage from '@/components/domain/cliente/ClientePerfilPage'

export default async function PerfilPage() {
  const {roles} = await getServerClaims()

  // Solo clientes pueden acceder a /perfil
  const isCliente = Array.isArray(roles) && roles.includes('cliente')
  if (!isCliente) {
    redirect('/') // o /post-login si preferís
  }

  return <ClientePerfilPage />
}
