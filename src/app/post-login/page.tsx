import {redirect} from 'next/navigation'
import {auth0} from '@/lib/auth0'

const NS = 'https://elbuensabor/'

export default async function PostLoginPage() {
  const session = await auth0.getSession()
  if (!session?.user) redirect('/')

  const user = session.user as Record<string, any>
  const roles: string[] = user[`${NS}roles`] || []
  const empresaId = user[`${NS}empresa_id`] ?? '1'
  const sucursalId = user[`${NS}sucursal_id`] ?? '1'

  const rset = new Set(roles)
  if (rset.has('superadmin')) redirect('/empresa')
  if (rset.has('admin')) redirect(`/empresa/${empresaId}/sucursal`)
  if (rset.has('gerente') || rset.has('cocinero')) {
    redirect(`/empresa/${empresaId}/sucursal/${sucursalId}`)
  }
  redirect('/')
}
