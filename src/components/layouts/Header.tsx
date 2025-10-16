'use client'

import {useEffect, useMemo, useState} from 'react'
import {useParams, usePathname} from 'next/navigation'
import PersonIcon from '@/assets/icons/person.svg'
import {fetchEmpresaById} from '@/services/empresa'
import {fetchSucursalById} from '@/services/sucursal'
import Breadcrumbs from '@/components/ui/Breadcrumbs'

export default function Header() {
  const {empresaId, sucursalId} = useParams()
  const pathname = usePathname()
  const [empresaName, setEmpresaName] = useState<string>('Empresa')
  const [sucursalName, setSucursalName] = useState<string>('Sucursal')

  // fetch empresa name when ruta includes empresaId
  useEffect(() => {
    if (empresaId) {
      fetchEmpresaById(+empresaId)
        .then(e => setEmpresaName(e.nombre))
        .catch(() => setEmpresaName('Empresa'))
    }
  }, [empresaId])

  // fetch sucursal name when ruta includes sucursalId
  useEffect(() => {
    if (sucursalId) {
      fetchSucursalById(+sucursalId)
        .then(s => setSucursalName(s.nombre))
        .catch(() => setSucursalName('Sucursal'))
    }
  }, [sucursalId])

  // detect if we're already on the sucursal dashboard root
  const sucursalDashboardPath =
    empresaId && sucursalId ? `/empresa/${empresaId}/sucursal/${sucursalId}` : null
  const isOnSucursalDashboard =
    !!sucursalDashboardPath &&
    (pathname === sucursalDashboardPath || pathname === `${sucursalDashboardPath}/`)

  // derive current page/tab from the URL tail (e.g., "promociones")
  const currentCrumb = useMemo(() => {
    if (!pathname) return null
    const parts = pathname.split('/').filter(Boolean)
    if (parts.length === 0) return null
    const tail = parts[parts.length - 1]
    // if tail is the sucursalId, there is no extra page segment
    if (sucursalId && tail === String(sucursalId)) return null
    // if we're at "/empresa/:empresaId/sucursal" (list of sucursales), don't add a "Sucursal" crumb
    if (!sucursalId && tail === 'sucursal') return null
    // map known tabs to pretty labels; fallback to Title Case
    const map: Record<string, string> = {
      promociones: 'Promociones',
      productos: 'Productos',
      insumos: 'Insumos',
      categorias: 'Categorías',
      configuracion: 'Configuración',
      // add more as needed
    }
    const pretty = map[tail] ?? tail.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    return {label: pretty} as const
  }, [pathname, sucursalId])

  return (
    <header className="w-full min-h-[48px] bg-primary/10 border-surface px-4 py-3 flex items-center justify-between overflow-hidden">
      {/* Left section: user + breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-y-1 max-w-full">
        <span className="text-xs sm:text-sm font-medium text-text">White Dragon</span>

        {empresaId && (
          <Breadcrumbs
            items={[
              {label: 'Empresas', href: '/empresa'},
              {
                label: empresaName,
                href: `/empresa/${empresaId}/sucursal`,
              },
              ...(sucursalId
                ? [
                    {
                      label: sucursalName,
                      // make sucursal breadcrumb clickable unless we're already at its dashboard
                      href: !isOnSucursalDashboard
                        ? (sucursalDashboardPath ?? undefined)
                        : undefined,
                    },
                  ]
                : []),
              ...(currentCrumb ? [currentCrumb] : []),
            ]}
          />
        )}
      </div>

      {/* Right section: user icon */}
      <button
        type="button"
        className="w-10 h-10 flex items-center justify-center rounded-full bg-surface hover:bg-surfaceHover transition-colors"
        title="Perfil de usuario"
      >
        <PersonIcon className="w-5 h-5 text-black" />
      </button>
    </header>
  )
}
