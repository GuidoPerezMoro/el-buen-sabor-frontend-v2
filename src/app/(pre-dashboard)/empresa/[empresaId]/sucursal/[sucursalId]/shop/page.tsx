'use client'

import {useCallback, useEffect, useMemo, useState} from 'react'
import {useParams} from 'next/navigation'

import ShopToolbar from '@/components/domain/shop/ShopToolbar'
import ShopSection from '@/components/domain/shop/ShopSection'
import ShopGrid from '@/components/domain/shop/ShopGrid'
import ShopCard, {ShopItemType} from '@/components/domain/shop/ShopCard'
import ShopEmptyState from '@/components/domain/shop/ShopEmptyState'

import {useRoles} from '@/hooks/useRoles'

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

  // When sortByPrice is active, merge active promos + productos + insumos into one list
  const sortedUnifiedItems = useMemo(() => {
    if (!sortByPrice) return []

    type Unified = {
      type: ShopItemType
      id: number
      title: string
      price: number
      categoryLabel?: string | null
      imageUrl?: string | null
      promoBadge?: string | null
    }

    const list: Unified[] = []

    activePromos.forEach(p => {
      list.push({
        type: 'promo',
        id: p.id,
        title: p.denominacion,
        price: p.precioPromocional,
        categoryLabel: null,
        imageUrl: p.imagenUrl,
        promoBadge: null,
      })
    })

    filteredManufacturados.forEach(m => {
      list.push({
        type: 'manufacturado',
        id: m.id,
        title: m.denominacion,
        price: m.precioVenta,
        categoryLabel: m.categoria?.denominacion ?? null,
        imageUrl: m.imagenUrl,
      })
    })

    filteredInsumos.forEach(i => {
      list.push({
        type: 'insumo',
        id: i.id,
        title: i.denominacion,
        price: i.precioVenta,
        categoryLabel: i.categoria?.denominacion ?? null,
        imageUrl: i.imagenUrl,
      })
    })

    return list.sort((a, b) => a.price - b.price)
  }, [sortByPrice, activePromos, filteredManufacturados, filteredInsumos])

  return (
    <main className="p-4 sm:p-6 space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Tienda</h1>
        {isStaff && (
          <p className="text-sm text-muted">
            Explora las promociones, productos e insumos disponibles en esta sucursal.
          </p>
        )}
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

      {/* If sortByPrice is ON, show unified grid; otherwise sections */}
      {sortByPrice ? (
        <>
          <ShopSection
            title="Catálogo ordenado por precio"
            subtitle="Mostrando promociones vigentes, productos e insumos."
            count={sortedUnifiedItems.length}
          >
            {sortedUnifiedItems.length === 0 ? (
              <ShopEmptyState scope="items" filtered={Boolean(search.trim() || categoryValue)} />
            ) : (
              <ShopGrid>
                {sortedUnifiedItems.map(item => (
                  <ShopCard
                    key={`${item.type}-${item.id}`}
                    type={item.type}
                    title={item.title}
                    price={item.price}
                    categoryLabel={item.categoryLabel}
                    imageUrl={item.imageUrl}
                    promoBadge={item.promoBadge ?? null}
                  />
                ))}
              </ShopGrid>
            )}
          </ShopSection>

          {isStaff && inactivePromos.length > 0 && (
            <ShopSection
              title="Promociones fuera de vigencia"
              subtitle="Solo visible para personal interno."
              count={inactivePromos.length}
              defaultOpen={false}
            >
              <ShopGrid>
                {inactivePromos.map(p => (
                  <ShopCard
                    key={p.id}
                    type="promo"
                    title={p.denominacion}
                    price={p.precioPromocional}
                    imageUrl={p.imagenUrl}
                    inactive
                  />
                ))}
              </ShopGrid>
            </ShopSection>
          )}
        </>
      ) : (
        <>
          {/* Promociones (sección propia) */}
          <ShopSection
            title="Promociones"
            subtitle="Promociones vigentes en esta sucursal."
            count={filteredPromos.length}
          >
            {filteredPromos.length === 0 ? (
              <ShopEmptyState scope="promos" filtered={Boolean(search.trim() || categoryValue)} />
            ) : (
              <div className="space-y-3">
                {activePromos.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-success">
                      Vigentes ({activePromos.length})
                    </p>
                    <ShopGrid>
                      {activePromos.map(p => (
                        <ShopCard
                          key={p.id}
                          type="promo"
                          title={p.denominacion}
                          price={p.precioPromocional}
                          imageUrl={p.imagenUrl}
                        />
                      ))}
                    </ShopGrid>
                  </div>
                )}

                {isStaff && inactivePromos.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted">
                      Fuera de vigencia ({inactivePromos.length})
                    </p>
                    <ShopGrid>
                      {inactivePromos.map(p => (
                        <ShopCard
                          key={p.id}
                          type="promo"
                          title={p.denominacion}
                          price={p.precioPromocional}
                          imageUrl={p.imagenUrl}
                          inactive
                        />
                      ))}
                    </ShopGrid>
                  </div>
                )}
              </div>
            )}
          </ShopSection>

          {/* Productos + insumos no-para-elaborar */}
          <ShopSection
            title="Productos e insumos"
            subtitle="Artículos manufacturados e insumos listos para la venta."
            count={filteredManufacturados.length + filteredInsumos.length}
          >
            {filteredManufacturados.length === 0 && filteredInsumos.length === 0 ? (
              <ShopEmptyState scope="items" filtered={Boolean(search.trim() || categoryValue)} />
            ) : (
              <div className="space-y-4">
                {filteredManufacturados.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-text">
                      Artículos manufacturados ({filteredManufacturados.length})
                    </p>
                    <ShopGrid>
                      {filteredManufacturados.map(m => (
                        <ShopCard
                          key={m.id}
                          type="manufacturado"
                          title={m.denominacion}
                          price={m.precioVenta}
                          categoryLabel={m.categoria?.denominacion ?? null}
                          imageUrl={m.imagenUrl}
                        />
                      ))}
                    </ShopGrid>
                  </div>
                )}

                {filteredInsumos.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-text">
                      Insumos ({filteredInsumos.length})
                    </p>
                    <ShopGrid>
                      {filteredInsumos.map(i => (
                        <ShopCard
                          key={i.id}
                          type="insumo"
                          title={i.denominacion}
                          price={i.precioVenta}
                          categoryLabel={i.categoria?.denominacion ?? null}
                          imageUrl={i.imagenUrl}
                        />
                      ))}
                    </ShopGrid>
                  </div>
                )}
              </div>
            )}
          </ShopSection>
        </>
      )}
    </main>
  )
}
