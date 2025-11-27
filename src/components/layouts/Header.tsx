'use client'

import {useEffect, useMemo, useState} from 'react'
import {useParams, usePathname, useRouter} from 'next/navigation'

import {ShoppingCart} from 'lucide-react'

import CurrentUserLabel from '@/components/auth/CurrentUserLabel'
import Breadcrumbs from '@/components/layouts/Breadcrumbs'
import UserMenu from '@/components/auth/UserMenu'

import {fetchEmpresaById} from '@/services/empresa'
import {fetchSucursalById} from '@/services/sucursal'

import {useRoles} from '@/hooks/useRoles'
import {useCart} from '@/contexts/cart'

export default function Header() {
  const {empresaId, sucursalId} = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const [empresaName, setEmpresaName] = useState<string>('Empresa')
  const [sucursalName, setSucursalName] = useState<string>('Sucursal')

  const {roles, loading: rolesLoading, has} = useRoles()
  const {totalQuantity} = useCart()

  const STAFF_ROLES = ['superadmin', 'admin', 'gerente', 'cocinero'] as const
  const isStaff = roles ? has([...STAFF_ROLES]) : false

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
      unidadesDeMedida: 'Unidades de medida',
      shop: 'Tienda',
      carrito: 'Carrito',
      // add more as needed
    }
    const pretty = map[tail] ?? tail.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    return {label: pretty} as const
  }, [pathname, sucursalId])

  const handleCart = () => {
    const isCliente = roles ? has('cliente') : false

    if (!isCliente) {
      router.push('/auth/login')
      return
    }

    router.push('/carrito')
  }

  return (
    <header className="w-full min-h-[48px] bg-primary/10 border-surface px-4 py-3 flex items-center justify-between relative overflow-visible z-40">
      {/* Left section: user + breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-y-1 max-w-full">
        <CurrentUserLabel />

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

      {/* Right section: cart (cliente/invitado only) + user menu */}
      <div className="flex items-center gap-3">
        {!rolesLoading && !isStaff && (
          <button
            type="button"
            onClick={handleCart}
            className="inline-flex items-center text-text hover:text-primary focus:outline-none"
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            {totalQuantity > 0 && (
              <span className="ml-1 text-xs font-medium">({totalQuantity})</span>
            )}
            <span className="sr-only">Abrir carrito</span>
          </button>
        )}
        <UserMenu />
      </div>
    </header>
  )
}
