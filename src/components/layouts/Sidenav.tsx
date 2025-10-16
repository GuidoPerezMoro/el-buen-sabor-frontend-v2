'use client'

import {useParams, usePathname} from 'next/navigation'
import Divider from '@/components/ui/Divider'
import SidenavItem from '@/components/ui/SidenavItem'
import type {LucideIcon} from 'lucide-react'
import {Home, Percent, ChefHat, Wheat, Tags, Ruler, Settings} from 'lucide-react'

export default function Sidenav() {
  const {empresaId, sucursalId} = useParams()
  const pathname = usePathname() || ''

  const base = `/empresa/${empresaId}/sucursal/${sucursalId}`

  // Define a mixed array: either a nav item or a divider marker
  const navElements: Array<
    {type: 'item'; href: string; label: string; icon: LucideIcon} | {type: 'divider'}
  > = [
    {type: 'item', href: base, label: 'Dashboard', icon: Home},
    {type: 'divider'},
    {type: 'item', href: `${base}/promociones`, label: 'Promociones', icon: Percent},
    {type: 'item', href: `${base}/productos`, label: 'Productos', icon: ChefHat},
    {type: 'item', href: `${base}/insumos`, label: 'Insumos', icon: Wheat},
    {type: 'item', href: `${base}/categorias`, label: 'Categorías', icon: Tags},
    {type: 'item', href: `${base}/unidades-de-medida`, label: 'Unidades de medida', icon: Ruler},
    {type: 'divider'},
    {type: 'item', href: `${base}/configuracion`, label: 'Configuración', icon: Settings},
  ]

  return (
    <nav className="flex flex-col">
      {navElements.map((el, idx) =>
        el.type === 'divider' ? (
          <Divider key={`div-${idx}`} />
        ) : (
          <SidenavItem
            key={el.href}
            href={el.href}
            label={el.label}
            icon={el.icon}
            selected={pathname === el.href}
          />
        )
      )}
    </nav>
  )
}
