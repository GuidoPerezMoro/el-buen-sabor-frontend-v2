import {filterArticuloInsumosBySucursalId} from './articuloInsumo.utils'
import {ArticuloInsumo} from './types/articuloInsumo'
import {ArticuloManufacturado} from './types/articuloManufacturado'
import {Promocion, TipoPromocion} from './types/promocion'

export const TIPO_PROMOCION_OPTIONS = [
  {value: TipoPromocion.HAPPY_HOUR, label: 'Happy Hour'},
  {value: TipoPromocion.PROMOCION, label: 'Promoción'},
] as const

/** Returns true if the promo is linked to the given sucursal, regardless of API shape. */
function hasSucursal(p: Promocion, sucursalId: number): boolean {
  // case 1: embedded sucursales
  if (Array.isArray(p.sucursales) && p.sucursales.length) {
    if (p.sucursales.some(s => s.id === sucursalId)) return true
  }
  // case 2: only ids
  const ids = (p as any).idSucursales as number[] | undefined
  if (Array.isArray(ids) && ids.includes(sucursalId)) return true
  return false
}

export function filterPromocionesBySucursalId(list: Promocion[], sucursalId: number) {
  return list.filter(p => hasSucursal(p, sucursalId))
}

export function filterPromocionesByText(list: Promocion[], q: string) {
  const term = q.trim().toLowerCase()
  if (!term) return list
  return list.filter(p => {
    const inTitle = p.denominacion?.toLowerCase().includes(term)
    const inDesc = p.descripcionDescuento?.toLowerCase().includes(term)
    const inItems = p.detalles?.some(d => d.articulo?.denominacion?.toLowerCase().includes(term))
    return inTitle || inDesc || inItems
  })
}

/** Build dropdown options for artículos, limiting INSUMOS to the current sucursal. */
export function buildArticuloOptionsForSucursal(params: {
  insumos: ArticuloInsumo[]
  manufacturados: ArticuloManufacturado[]
  sucursalId: number
}) {
  const {insumos, manufacturados, sucursalId} = params
  const insumosHere = filterArticuloInsumosBySucursalId(insumos, sucursalId)
  const insumoOpts = insumosHere.map(i => ({
    value: String(i.id),
    label: `${i.denominacion} [Insumo]`,
  }))
  const prodOpts = manufacturados.map(p => ({
    value: String(p.id),
    label: `${p.denominacion} [Prod]`,
  }))
  return [...prodOpts, ...insumoOpts]
}
