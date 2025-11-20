'use client'

import {useParams, usePathname} from 'next/navigation'
import Divider from '@/components/ui/Divider'
import SidenavItem from '@/components/ui/SidenavItem'
import type {LucideIcon} from 'lucide-react'
import {
  Home,
  Percent,
  ChefHat,
  Wheat,
  Tags,
  Ruler,
  UsersRound,
  Settings,
  ShoppingBasketIcon,
} from 'lucide-react'
import type {Role} from '@/services/types'
import {useRoles} from '@/hooks/useRoles'

type NavItemBase = {
  type: 'item'
  makeHref: (base: string) => string
  label: string
  icon: LucideIcon
  allow: Role[]
}
type DividerEl = {type: 'divider'}
type NavEl = NavItemBase | DividerEl

type NavItemWithHref = Omit<NavItemBase, 'makeHref'> & {hrefStr: string}
type RenderEl = NavItemWithHref | DividerEl

const NAV: NavEl[] = [
  {
    type: 'item',
    makeHref: b => b,
    label: 'Dashboard',
    icon: Home,
    allow: ['superadmin', 'admin', 'gerente', 'cocinero'],
  },
  {type: 'divider'},
  {
    type: 'item',
    makeHref: b => `${b}/promociones`,
    label: 'Promociones',
    icon: Percent,
    allow: ['superadmin', 'admin', 'gerente'],
  },
  {
    type: 'item',
    makeHref: b => `${b}/productos`,
    label: 'Productos',
    icon: ChefHat,
    allow: ['superadmin', 'admin', 'gerente', 'cocinero'],
  },
  {
    type: 'item',
    makeHref: b => `${b}/insumos`,
    label: 'Insumos',
    icon: Wheat,
    allow: ['superadmin', 'admin', 'gerente'],
  },
  {
    type: 'item',
    makeHref: b => `${b}/categorias`,
    label: 'Categorías',
    icon: Tags,
    allow: ['superadmin', 'admin', 'gerente'],
  },
  {
    type: 'item',
    makeHref: b => `${b}/unidades-de-medida`,
    label: 'Unidades de medida',
    icon: Ruler,
    allow: ['superadmin', 'admin', 'gerente'],
  },
  {type: 'divider'},
  {
    type: 'item',
    makeHref: b => `${b}/shop`,
    label: 'Tienda',
    icon: ShoppingBasketIcon,
    allow: ['superadmin', 'admin', 'gerente'],
  },
  {type: 'divider'},
  {
    type: 'item',
    makeHref: b => `${b}/empleados`,
    label: 'Empleados',
    icon: UsersRound,
    allow: ['superadmin', 'admin', 'gerente'],
  },
  {type: 'divider'},
  {
    type: 'item',
    makeHref: b => `${b}/configuracion`,
    label: 'Configuración',
    icon: Settings,
    allow: ['superadmin', 'admin', 'gerente', 'cocinero'],
  },
]

// remove consecutive/edge dividers (typed)
function normalizeDividers(list: RenderEl[]): RenderEl[] {
  const out: RenderEl[] = []
  for (const el of list) {
    if (el.type === 'divider') {
      if (out.length === 0) continue
      if (out[out.length - 1].type === 'divider') continue
      out.push(el)
    } else {
      out.push(el)
    }
  }
  if (out.length && out[out.length - 1].type === 'divider') out.pop()
  return out
}

export default function Sidenav() {
  const {empresaId, sucursalId} = useParams()
  const pathname = usePathname() || ''
  const {roles, loading} = useRoles()

  if (loading) return null

  const base = `/empresa/${empresaId}/sucursal/${sucursalId}`
  const roleSet = new Set<Role>((roles ?? []) as Role[])

  // build concrete hrefs, filter by role
  const allowed: RenderEl[] = NAV.map<RenderEl>(el => {
    if (el.type === 'divider') return el
    return {...el, hrefStr: el.makeHref(base)}
  }).filter(el => {
    if (el.type === 'divider') return true
    return el.allow.some(r => roleSet.has(r))
  })

  const items = normalizeDividers(allowed)

  const isSelected = (href: string) => {
    // dashboard must match exactly (with/without trailing slash)
    if (href === base) return pathname === href || pathname === `${href}/`
    // sections: exact or any child route
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <nav className="flex flex-col">
      {items.map((el, idx) =>
        el.type === 'divider' ? (
          <Divider key={`div-${idx}`} />
        ) : (
          <SidenavItem
            key={el.hrefStr}
            href={el.hrefStr}
            label={el.label}
            icon={el.icon}
            selected={isSelected(el.hrefStr)}
          />
        )
      )}
    </nav>
  )
}
