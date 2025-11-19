'use client'

import {useCallback, useEffect, useMemo, useState} from 'react'
import {useParams} from 'next/navigation'

import StatusMessage from '@/components/ui/StatusMessage'
import ShopToolbar from '@/components/domain/shop/ShopToolbar'

import {useRoles} from '@/hooks/useRoles'
import {formatARS} from '@/lib/format'

import {fetchAllPromociones} from '@/services/promocion'
import {fetchAllArticuloManufacturados} from '@/services/articuloManufacturado'
import {fetchAllArticuloInsumos} from '@/services/articuloInsumo'

import {filterPromocionesBySucursalId, filterPromocionesByText} from '@/services/promocion.utils'
import {
  filterManufacturadosBySucursalId,
  filterManufacturadosByText,
} from '@/services/articuloManufacturado.utils'
import {
  filterArticuloInsumosBySucursalId,
  filterArticuloInsumosByText,
} from '@/services/articuloInsumo.utils'

import type {Promocion} from '@/services/types/promocion'
import type {ArticuloManufacturado} from '@/services/types/articuloManufacturado'
import type {ArticuloInsumo} from '@/services/types/articuloInsumo'

type Opt = string | {value: string; label: string}

const STAFF_ROLES = ['superadmin', 'admin', 'gerente']

function getOptValue(opt: Opt | null): string | null {
  if (!opt) return null
  return typeof opt === 'string' ? opt : opt.value
}

// Helper: only insumos that are NOT "para elaborar"
function onlyNonElaborar(insumos: ArticuloInsumo[]): ArticuloInsumo[] {
  return insumos.filter(i => !i.esParaElaborar)
}

// Build category options from manufacturados                                                           insumos                                                           special "Promociones"
function buildCategoryOptions(
  manufacturados: ArticuloManufacturado[],
  insumos: ArticuloInsumo[]
): Opt[] {
  const map = new Map<number, string>()

  manufacturados.forEach(m => {
    if (m.categoria) map.set(m.categoria.id, m.categoria.denominacion)
  })
  insumos.forEach(i => {
    if (i.categoria) map.set(i.categoria.id, i.categoria.denominacion)
  })

  const catOpts: Opt[] = Array.from(map.entries())
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([id, label]) => ({value: String(id), label}))

  // Special category for promos
  const promoOpt: Opt = {value: 'PROMO', label: 'Promociones'}

  return [promoOpt, ...catOpts]
}

// Simple "is active now?" check for promos
function isPromocionActive(p: Promocion, now = new Date()): boolean {
  // fecha: 'YYYY-MM-DD', hora: 'HH:mm:ss'
  const from = new Date(`${p.fechaDesde}T${p.horaDesde}`)
  const to = new Date(`${p.fechaHasta}T${p.horaHasta}`)
  const t = now.getTime()
  return t >= from.getTime() && t <= to.getTime()
}

export default function ShopPage() {
  const {sucursalId: sid} = useParams<{empresaId: string; sucursalId: string}>()
  const sucursalId = Number(sid)

  const {roles, loading: rolesLoading, has} = useRoles()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [promos, setPromos] = useState<Promocion[]>([])
  const [manufacturados, setManufacturados] = useState<ArticuloManufacturado[]>([])
  const [insumos, setInsumos] = useState<ArticuloInsumo[]>([])

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<Opt | null>(null)
  const [sortByPrice, setSortByPrice] = useState(false)

  const load = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)

      const [allPromos, allManu, allInsumos] = await Promise.all([
        fetchAllPromociones(),
        fetchAllArticuloManufacturados(),
        fetchAllArticuloInsumos(),
      ])

      setPromos(filterPromocionesBySucursalId(allPromos, sucursalId))
      setManufacturados(filterManufacturadosBySucursalId(allManu, sucursalId))
      setInsumos(filterArticuloInsumosBySucursalId(allInsumos, sucursalId))
    } catch (e: any) {
      setError(e?.message ?? 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [sucursalId])

  useEffect(() => {
    load()
  }, [load])

  const isStaff = useMemo(() => {
    if (!roles) return false
    return has(STAFF_ROLES)
  }, [roles, has])

  // Derived                                                           filtered collections
  const nonElaborarInsumos = useMemo(() => onlyNonElaborar(insumos), [insumos])

  const categoryValue = getOptValue(category)

  const {filteredPromos, filteredManufacturados, filteredInsumos, activePromos, inactivePromos} =
    useMemo(() => {
      const byTextPromos = filterPromocionesByText(promos, search)
      const byTextManu = filterManufacturadosByText(manufacturados, search)
      const byTextInsumos = filterArticuloInsumosByText(nonElaborarInsumos, search)

      // Category filtering
      const val = categoryValue

      const promosCat = byTextPromos.filter(p => {
        if (!val) return true
        if (val === 'PROMO') return true
        // if user picked a concrete categoría, hide promos
        return false
      })

      const manuCat = byTextManu.filter(m => {
        if (!val) return true
        if (val === 'PROMO') return false
        const catId = m.categoria?.id
        return catId != null && String(catId) === val
      })

      const insCat = byTextInsumos.filter(i => {
        if (!val) return true
        if (val === 'PROMO') return false
        const catId = i.categoria?.id
        return catId != null && String(catId) === val
      })

      const now = new Date()
      const active = promosCat.filter(p => isPromocionActive(p, now))
      const inactive = promosCat.filter(p => !isPromocionActive(p, now))

      return {
        filteredPromos: promosCat,
        filteredManufacturados: manuCat,
        filteredInsumos: insCat,
        activePromos: active,
        inactivePromos: inactive,
      }
    }, [promos, manufacturados, nonElaborarInsumos, search, categoryValue])

  const categoryOptions = useMemo(
    () => buildCategoryOptions(manufacturados, nonElaborarInsumos),
    [manufacturados, nonElaborarInsumos]
  )

  if (loading) {
    return <StatusMessage type="loading" title="Cargando tienda..." />
  }

  if (error) {
    return <StatusMessage type="error" message="Error al cargar la tienda." />
  }

  return (
    <main className="p-4 sm:p-6 space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Tienda</h1>
        <p className="text-sm text-muted">
          Explora las promociones, productos e insumos disponibles en esta sucursal.
        </p>
      </header>

      <ShopToolbar
        search={search}
        onSearchChange={setSearch}
        categoryOptions={categoryOptions}
        categoryValue={category}
        onCategoryChange={setCategory}
        sortByPrice={sortByPrice}
        onSortToggle={setSortByPrice}
      />

      {/* NOTE: For now, a simple debug-style layout to validate data & filters.
                                                                  Next steps: replace with ShopSection                                                           ShopGrid                                                           ShopCard components
                                                                  and implement merged sort behavior when sortByPrice === true. */}

      {/* Promociones */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Promociones</h2>
        {filteredPromos.length === 0 ? (
          <StatusMessage
            type="empty"
            message={
              search.trim() || categoryValue
                ? 'No se encontraron promociones con los filtros actuales.'
                : 'Aún no hay promociones disponibles para esta sucursal.'
            }
          />
        ) : (
          <div className="space-y-2">
            {/* Active promos */}
            {activePromos.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-success">Vigentes ({activePromos.length})</p>
                <ul className="space-y-1 text-sm">
                  {activePromos.map(p => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between rounded bg-white p-2"
                    >
                      <span className="truncate">{p.denominacion}</span>
                      <span className="ml-2 shrink-0 text-xs font-medium">
                        {formatARS(p.precioPromocional)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Inactive promos – only visible for staff */}
            {isStaff && inactivePromos.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted">
                  Fuera de vigencia ({inactivePromos.length})
                </p>
                <ul className="space-y-1 text-xs text-muted">
                  {inactivePromos.map(p => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between rounded border border-dashed border-border bg-muted px-2 py-1"
                    >
                      <span className="truncate">{p.denominacion}</span>
                      <span className="ml-2 shrink-0">{formatARS(p.precioPromocional)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Productos                                                           insumos no-para-elaborar */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Productos e insumos</h2>
        {filteredManufacturados.length === 0 && filteredInsumos.length === 0 ? (
          <StatusMessage
            type="empty"
            message={
              search.trim() || categoryValue
                ? 'No se encontraron artículos con los filtros actuales.'
                : 'Aún no hay artículos cargados para esta sucursal.'
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredManufacturados.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-text">
                  Artículos manufacturados ({filteredManufacturados.length})
                </p>
                <ul className="space-y-1 text-sm">
                  {filteredManufacturados.map(m => (
                    <li
                      key={m.id}
                      className="flex items-center justify-between rounded bg-white p-2"
                    >
                      <span className="truncate">{m.denominacion}</span>
                      <span className="ml-2 shrink-0 text-xs font-medium">
                        {formatARS(m.precioVenta)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {filteredInsumos.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-text">Insumos ({filteredInsumos.length})</p>
                <ul className="space-y-1 text-sm">
                  {filteredInsumos.map(i => (
                    <li
                      key={i.id}
                      className="flex items-center justify-between rounded bg-white p-2"
                    >
                      <span className="truncate">{i.denominacion}</span>
                      <span className="ml-2 shrink-0 text-xs font-medium">
                        {formatARS(i.precioVenta)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  )
}
