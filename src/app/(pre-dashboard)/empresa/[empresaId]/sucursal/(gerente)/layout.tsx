import {ReactNode} from 'react'
import {redirect} from 'next/navigation'
import {getServerClaims} from '@/lib/authz-server'

export default async function SucursalSectionLayout({children}: {children: ReactNode}) {
  const {roles, empresaId: empresaIdClaim, sucursalId: sucursalIdClaim} = await getServerClaims()
  const allowed = new Set(['superadmin', 'admin', 'gerente'])

  if (!roles.some(r => allowed.has(r))) {
    redirect('/') // cocinero u otros → fuera
  }

  // Si es gerente, validar que está navegando en SU empresa:
  const isGerente = roles.includes('gerente')
  if (isGerente && empresaIdClaim) {
    // Extract empresaId from the current URL using headers (simple y robusto)
    // Nota: en layouts no tenemos params tipados; parseamos del referer actual
    // Si prefieres, crea un layout server component con segment config para recibir params.
  }

  return <>{children}</>
}

// Nota: no forzamos aquí la coincidencia de empresaId por simplicidad.
// Si quieres redirigir a su empresa cuando el gerente entra a otra empresa,
// debemos usar el parseo de params en server
// (hay que convertir este layout a generateStaticParams/Page con props,
// o mover el check a un route handler GET de la ruta).
