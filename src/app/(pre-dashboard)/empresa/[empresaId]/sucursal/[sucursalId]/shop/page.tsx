'use client'

import {useCallback, useEffect, useMemo, useState} from 'react'
import {useParams} from 'next/navigation'

import ShopToolbar from '@/components/domain/shop/ShopToolbar'
import ShopSection from '@/components/domain/shop/ShopSection'
import ShopGrid from '@/components/domain/shop/ShopGrid'
import ShopCard, {ShopItemType} from '@/components/domain/shop/ShopCard'
import ShopItemDialog, {ShopItemDialogData} from '@/components/domain/shop/ShopItemDialog'

import {formatARS} from '@/lib/format'

import {useRoles} from '@/hooks/useRoles'
import useDialog from '@/hooks/useDialog'

import {fetchAllPromociones} from '@/services/promocion'
import {fetchAllArticuloManufacturados} from '@/services/articuloManufacturado'
import {fetchAllArticuloInsumos} from '@/services/articuloInsumo'

import {
  buildPromocionVigenciaLabel,
  filterPromocionesBySucursalId,
  filterPromocionesByText,
  isPromocionDateValid,
  isPromocionTimeValid,
} from '@/services/promocion.utils'
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

const STAFF_ROLES = ['superadmin', 'admin', 'gerente'] as const

function getOptValue(opt: Opt | null): string | null {
  if (!opt) return null
  return typeof opt === 'string' ? opt : opt.value
}

// Helper: only insumos that are NOT "para elaborar"
function onlyNonElaborar(insumos: ArticuloInsumo[]): ArticuloInsumo[] {
  return insumos.filter(i => !i.esParaElaborar)
}

// Build category options from manufacturados + insumos + special "Promociones"
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

/** Centralized mapping from domain model → dialog payload */
function buildDialogDataFromPromo(p: Promocion, isStaff: boolean): ShopItemDialogData {
  return {
    type: 'promo',
    title: p.denominacion,
    description: p.descripcionDescuento ?? null,
    price: formatARS(p.precioPromocional),
    validityLabel: isStaff ? buildPromocionVigenciaLabel(p) : null,
    imageUrl: p.imagenUrl ?? null,
  }
}

function buildDialogDataFromManufacturado(m: ArticuloManufacturado): ShopItemDialogData {
  return {
    type: 'manufacturado',
    title: m.denominacion,
    description: m.descripcion ?? null,
    price: formatARS(m.precioVenta),
    imageUrl: m.imagenUrl ?? null,
    validityLabel: null,
  }
}

function buildDialogDataFromInsumo(i: ArticuloInsumo): ShopItemDialogData {
  return {
    type: 'insumo',
    title: i.denominacion,
    description: null,
    price: formatARS(i.precioVenta),
    imageUrl: i.imagenUrl ?? null,
    validityLabel: null,
  }
}

/** Small helper that encapsulates the text/category/date/time filtering for the shop. */
function deriveShopCollections(params: {
  promos: Promocion[]
  manufacturados: ArticuloManufacturado[]
  insumos: ArticuloInsumo[]
  search: string
  categoryValue: string | null
  now: Date
}) {
  const {promos, manufacturados, insumos, search, categoryValue, now} = params

  const byTextPromos = filterPromocionesByText(promos, search)
  const byTextManu = filterManufacturadosByText(manufacturados, search)
  const byTextInsumos = filterArticuloInsumosByText(insumos, search)

  const val = categoryValue

  const filteredPromos = byTextPromos.filter(p => {
    if (!val) return true
    if (val === 'PROMO') return true
    // If user picked a concrete categoría, hide promos
    return false
  })

  const filteredManufacturados = byTextManu.filter(m => {
    if (!val) return true
    if (val === 'PROMO') return false
    const catId = m.categoria?.id
    return catId != null && String(catId) === val
  })

  const filteredInsumos = byTextInsumos.filter(i => {
    if (!val) return true
    if (val === 'PROMO') return false
    const catId = i.categoria?.id
    return catId != null && String(catId) === val
  })

  const promosDateValid = filteredPromos.filter(p => isPromocionDateValid(p, now))
  const promosDateInvalid = filteredPromos.filter(p => !isPromocionDateValid(p, now))
  const publicPromos = promosDateValid.filter(p => isPromocionTimeValid(p, now))

  return {
    filteredPromos,
    filteredManufacturados,
    filteredInsumos,
    promosDateValid,
    promosDateInvalid,
    publicPromos,
  }
}

/** Unified item used only for the "sorted by price" grid. */
type UnifiedItem =
  | {type: Extract<ShopItemType, 'promo'>; promo: Promocion}
  | {type: Extract<ShopItemType, 'manufacturado'>; manu: ArticuloManufacturado}
  | {type: Extract<ShopItemType, 'insumo'>; insumo: ArticuloInsumo}

export default function ShopPage() {
  const {sucursalId: sid} = useParams<{empresaId: string; sucursalId: string}>()
  const sucursalId = Number(sid)

  const {roles, has} = useRoles()
  const {openDialog, closeDialog} = useDialog()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [promos, setPromos] = useState<Promocion[]>([])
  const [manufacturados, setManufacturados] = useState<ArticuloManufacturado[]>([])
  const [insumos, setInsumos] = useState<ArticuloInsumo[]>([])

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<Opt | null>(null)
  const [sortByPrice, setSortByPrice] = useState(false)
  const [showInactivePromos, setShowInactivePromos] = useState(true)
  const [selectedItem, setSelectedItem] = useState<ShopItemDialogData | null>(null)

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
    return has([...STAFF_ROLES])
  }, [roles, has])

  // Derived collections
  const nonElaborarInsumos = useMemo(() => onlyNonElaborar(insumos), [insumos])
  const categoryValue = getOptValue(category)

  const {
    filteredPromos,
    filteredManufacturados,
    filteredInsumos,
    promosDateValid,
    promosDateInvalid,
    publicPromos,
  } = useMemo(
    () =>
      deriveShopCollections({
        promos,
        manufacturados,
        insumos: nonElaborarInsumos,
        search,
        categoryValue,
        now: new Date(),
      }),
    [promos, manufacturados, nonElaborarInsumos, search, categoryValue]
  )

  const categoryOptions = useMemo(
    () => buildCategoryOptions(manufacturados, nonElaborarInsumos),
    [manufacturados, nonElaborarInsumos]
  )

  const hasFilters = Boolean(search.trim() || categoryValue)

  // Active / inactive promos depending on role:
  // - Staff: date-valid are "vigentes" even if fuera de horario (shown with schedule hint).
  // - Invitado/cliente: only date+time valid promos are visibles.
  const activePromos: Promocion[] = useMemo(
    () => (isStaff ? promosDateValid : publicPromos),
    [isStaff, promosDateValid, publicPromos]
  )
  const inactivePromos: Promocion[] = promosDateInvalid

  // When sortByPrice is active, merge active promos + productos + insumos into one list.
  const sortedUnifiedItems: UnifiedItem[] = useMemo(() => {
    if (!sortByPrice) return []

    const list: UnifiedItem[] = []

    publicPromos.forEach(p => {
      list.push({type: 'promo', promo: p})
    })

    filteredManufacturados.forEach(m => {
      list.push({type: 'manufacturado', manu: m})
    })

    filteredInsumos.forEach(i => {
      list.push({type: 'insumo', insumo: i})
    })

    const getPrice = (item: UnifiedItem): number => {
      switch (item.type) {
        case 'promo':
          return item.promo.precioPromocional
        case 'manufacturado':
          return item.manu.precioVenta
        case 'insumo':
          return item.insumo.precioVenta
      }
    }

    return list.sort((a, b) => getPrice(a) - getPrice(b))
  }, [sortByPrice, publicPromos, filteredManufacturados, filteredInsumos])

  // Group manufacturados + insumos by categoría
  const categoryGroups = useMemo(() => {
    type GroupItem = {
      type: ShopItemType
      id: number
      title: string
      price: number
      description?: string | null
      imageUrl?: string | null
    }

    type Group = {
      id: string
      label: string
      items: GroupItem[]
    }

    const map = new Map<string, Group>()

    const ensureGroup = (id: string, label: string) => {
      const existing = map.get(id)
      if (existing) return existing
      const g: Group = {id, label, items: []}
      map.set(id, g)
      return g
    }

    const addItemToGroup = (
      catId: number | null | undefined,
      catLabel: string | null | undefined,
      item: GroupItem
    ) => {
      const id = catId != null ? String(catId) : '__no_category__'
      const label = catLabel || 'Sin categoría'
      const group = ensureGroup(id, label)
      group.items.push(item)
    }

    filteredManufacturados.forEach(m => {
      addItemToGroup(m.categoria?.id, m.categoria?.denominacion, {
        type: 'manufacturado',
        id: m.id,
        title: m.denominacion,
        price: m.precioVenta,
        description: m.descripcion,
        imageUrl: m.imagenUrl,
      })
    })

    filteredInsumos.forEach(i => {
      addItemToGroup(i.categoria?.id, i.categoria?.denominacion, {
        type: 'insumo',
        id: i.id,
        title: i.denominacion,
        price: i.precioVenta,
        imageUrl: i.imagenUrl,
      })
    })

    const groups = Array.from(map.values())
    groups.sort((a, b) => a.label.localeCompare(b.label, 'es'))
    groups.forEach(g => g.items.sort((a, b) => a.title.localeCompare(b.title, 'es')))
    return groups
  }, [filteredManufacturados, filteredInsumos])

  const openItemDialog = (data: ShopItemDialogData) => {
    setSelectedItem(data)
    openDialog('shop-item')
  }

  return (
    <main className="space-y-4 p-4 sm:p-6">
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
          <ShopSection title="Catálogo ordenado por precio" count={sortedUnifiedItems.length}>
            {sortedUnifiedItems.length === 0 ? (
              <p className="text-xs text-muted">
                {hasFilters
                  ? 'No se encontraron artículos con los filtros actuales.'
                  : 'Aún no hay artículos cargados para esta sucursal.'}
              </p>
            ) : (
              <ShopGrid>
                {sortedUnifiedItems.map(item => {
                  if (item.type === 'promo') {
                    const p = item.promo
                    return (
                      <ShopCard
                        key={`promo-${p.id}`}
                        type="promo"
                        title={p.denominacion}
                        price={p.precioPromocional}
                        imageUrl={p.imagenUrl}
                        description={p.descripcionDescuento}
                        validityLabel={isStaff ? buildPromocionVigenciaLabel(p) : null}
                        onClick={() => openItemDialog(buildDialogDataFromPromo(p, isStaff))}
                      />
                    )
                  }

                  if (item.type === 'manufacturado') {
                    const m = item.manu
                    return (
                      <ShopCard
                        key={`manu-${m.id}`}
                        type="manufacturado"
                        title={m.denominacion}
                        price={m.precioVenta}
                        imageUrl={m.imagenUrl}
                        description={m.descripcion ?? null}
                        onClick={() => openItemDialog(buildDialogDataFromManufacturado(m))}
                      />
                    )
                  }

                  const i = item.insumo
                  return (
                    <ShopCard
                      key={`insumo-${i.id}`}
                      type="insumo"
                      title={i.denominacion}
                      price={i.precioVenta}
                      imageUrl={i.imagenUrl}
                      description={null}
                      onClick={() => openItemDialog(buildDialogDataFromInsumo(i))}
                    />
                  )
                })}
              </ShopGrid>
            )}
          </ShopSection>

          {isStaff && inactivePromos.length > 0 && (
            <ShopSection
              title="Promociones fuera de vigencia"
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
                    description={p.descripcionDescuento}
                    validityLabel={buildPromocionVigenciaLabel(p)}
                    inactive
                    onClick={() => openItemDialog(buildDialogDataFromPromo(p, isStaff))}
                  />
                ))}
              </ShopGrid>
            </ShopSection>
          )}
        </>
      ) : (
        <>
          {/* Promociones (sección propia).
              - Invitado/cliente: solo ve vigentes y el contador refleja solo esas.
              - Staff: ve vigentes + fuera de vigencia y el contador refleja todas. */}
          {(filteredPromos.length > 0 || hasFilters) && (
            <ShopSection
              title="Promociones"
              count={isStaff ? filteredPromos.length : activePromos.length}
            >
              {filteredPromos.length === 0 ? (
                <p className="text-xs text-muted">
                  No se encontraron promociones con los filtros actuales.
                </p>
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
                            description={p.descripcionDescuento}
                            validityLabel={isStaff ? buildPromocionVigenciaLabel(p) : null}
                            onClick={() => openItemDialog(buildDialogDataFromPromo(p, isStaff))}
                          />
                        ))}
                      </ShopGrid>
                    </div>
                  )}

                  {isStaff && inactivePromos.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <p className="font-medium text-muted">
                          Fuera de vigencia ({inactivePromos.length})
                        </p>
                        <button
                          type="button"
                          className="text-[11px] text-primary underline-offset-2 hover:underline"
                          onClick={() => setShowInactivePromos(v => !v)}
                        >
                          {showInactivePromos ? 'Ocultar' : 'Ver'}
                        </button>
                      </div>
                      {showInactivePromos && (
                        <ShopGrid>
                          {inactivePromos.map(p => (
                            <ShopCard
                              key={p.id}
                              type="promo"
                              title={p.denominacion}
                              price={p.precioPromocional}
                              imageUrl={p.imagenUrl}
                              description={p.descripcionDescuento}
                              validityLabel={buildPromocionVigenciaLabel(p)}
                              inactive
                              onClick={() => openItemDialog(buildDialogDataFromPromo(p, isStaff))}
                            />
                          ))}
                        </ShopGrid>
                      )}
                    </div>
                  )}
                </div>
              )}
            </ShopSection>
          )}

          {/* Productos + insumos agrupados por categoría */}
          {(categoryGroups.length > 0 || hasFilters) &&
            (categoryGroups.length === 0 ? (
              <p className="text-xs text-muted">
                No se encontraron artículos con los filtros actuales.
              </p>
            ) : (
              categoryGroups.map(group => (
                <ShopSection key={group.id} title={group.label} count={group.items.length}>
                  <ShopGrid>
                    {group.items.map(item => {
                      if (item.type === 'manufacturado') {
                        const m = filteredManufacturados.find(m2 => m2.id === item.id) // just for dialog
                        return (
                          <ShopCard
                            key={`manu-${item.id}`}
                            type="manufacturado"
                            title={item.title}
                            price={item.price}
                            imageUrl={item.imageUrl}
                            description={item.description ?? null}
                            onClick={() => m && openItemDialog(buildDialogDataFromManufacturado(m))}
                          />
                        )
                      }

                      const insumo = filteredInsumos.find(i => i.id === item.id)
                      return (
                        <ShopCard
                          key={`insumo-${item.id}`}
                          type="insumo"
                          title={item.title}
                          price={item.price}
                          imageUrl={item.imageUrl}
                          description={item.description ?? null}
                          onClick={() =>
                            insumo && openItemDialog(buildDialogDataFromInsumo(insumo))
                          }
                        />
                      )
                    })}
                  </ShopGrid>
                </ShopSection>
              ))
            ))}
        </>
      )}

      <ShopItemDialog name="shop-item" item={selectedItem} onClose={() => setSelectedItem(null)} />
    </main>
  )
}
