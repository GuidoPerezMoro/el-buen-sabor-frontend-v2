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

export default function ShopPage() {
  const {sucursalId: sid} = useParams<{empresaId: string; sucursalId: string}>()
  const sucursalId = Number(sid)

  const {roles, loading: rolesLoading, has} = useRoles()
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
    return has(STAFF_ROLES)
  }, [roles, has])

  // Derived                                                           filtered collections
  const nonElaborarInsumos = useMemo(() => onlyNonElaborar(insumos), [insumos])

  const categoryValue = getOptValue(category)

  const {
    filteredPromos,
    filteredManufacturados,
    filteredInsumos,
    promosDateValid,
    promosDateInvalid,
    publicPromos,
  } = useMemo(() => {
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
    const byDateValid = promosCat.filter(p => isPromocionDateValid(p, now))
    const byDateInvalid = promosCat.filter(p => !isPromocionDateValid(p, now))
    const publicByDateAndTime = byDateValid.filter(p => isPromocionTimeValid(p, now))

    return {
      filteredPromos: promosCat,
      filteredManufacturados: manuCat,
      filteredInsumos: insCat,
      promosDateValid: byDateValid,
      promosDateInvalid: byDateInvalid,
      publicPromos: publicByDateAndTime,
    }
  }, [promos, manufacturados, nonElaborarInsumos, search, categoryValue])

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

    publicPromos.forEach(p => {
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
                  const promo =
                    item.type === 'promo' ? publicPromos.find(p => p.id === item.id) : undefined

                  return (
                    <ShopCard
                      key={`${item.type}-${item.id}`}
                      type={item.type}
                      title={item.title}
                      price={item.price}
                      categoryLabel={item.categoryLabel}
                      imageUrl={item.imageUrl}
                      promoBadge={item.promoBadge ?? null}
                      description={
                        item.type === 'promo'
                          ? (promo?.descripcionDescuento ?? null)
                          : item.type === 'manufacturado'
                            ? (manufacturados.find(m => m.id === item.id)?.descripcion ?? null)
                            : null
                      }
                      validityLabel={
                        item.type === 'promo' && promo && isStaff
                          ? buildPromocionVigenciaLabel(promo)
                          : null
                      }
                      onClick={() =>
                        openItemDialog({
                          type: item.type,
                          title: item.title,
                          description:
                            item.type === 'promo'
                              ? (promo?.descripcionDescuento ?? null)
                              : item.type === 'manufacturado'
                                ? (manufacturados.find(m => m.id === item.id)?.descripcion ?? null)
                                : null,
                          price: formatARS(item.price),
                          validityLabel:
                            item.type === 'promo' && promo && isStaff
                              ? buildPromocionVigenciaLabel(promo)
                              : null,
                          imageUrl: item.imageUrl ?? null,
                        })
                      }
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
                    onClick={() =>
                      openItemDialog({
                        type: 'promo',
                        title: p.denominacion,
                        description: p.descripcionDescuento,
                        price: formatARS(p.precioPromocional),
                        validityLabel: buildPromocionVigenciaLabel(p),
                        imageUrl: p.imagenUrl,
                      })
                    }
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
                            onClick={() =>
                              openItemDialog({
                                type: 'promo',
                                title: p.denominacion,
                                description: p.descripcionDescuento,
                                price: formatARS(p.precioPromocional),
                                validityLabel: isStaff ? buildPromocionVigenciaLabel(p) : null,
                                imageUrl: p.imagenUrl,
                              })
                            }
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
                              onClick={() =>
                                openItemDialog({
                                  type: 'promo',
                                  title: p.denominacion,
                                  description: p.descripcionDescuento,
                                  price: formatARS(p.precioPromocional),
                                  validityLabel: buildPromocionVigenciaLabel(p),
                                  imageUrl: p.imagenUrl,
                                })
                              }
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
                    {group.items.map(item => (
                      <ShopCard
                        key={`${item.type}-${item.id}`}
                        type={item.type}
                        title={item.title}
                        price={item.price}
                        imageUrl={item.imageUrl}
                        description={item.description ?? null}
                        onClick={() =>
                          openItemDialog({
                            type: item.type,
                            title: item.title,
                            description: item.description ?? null,
                            price: formatARS(item.price),
                            imageUrl: item.imageUrl ?? null,
                          })
                        }
                      />
                    ))}
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
