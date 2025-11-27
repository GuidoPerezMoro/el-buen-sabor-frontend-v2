import {filterArticuloInsumosBySucursalId} from './articuloInsumo.utils'
import {filterManufacturadosBySucursalId} from './articuloManufacturado.utils'
import {ArticuloInsumo} from './types/articuloInsumo'
import {ArticuloManufacturado} from './types/articuloManufacturado'
import {Promocion, TipoPromocion} from './types/promocion'

export const TIPO_PROMOCION_OPTIONS = [
  {value: TipoPromocion.PROMOCION, label: 'Promoción'},
  {value: TipoPromocion.HAPPY_HOUR, label: 'Happy Hour (20% OFF)'},
  {value: TipoPromocion.CINCUENTAOFF, label: '50% OFF'},
  {value: TipoPromocion.DOSXUNO, label: '2x1'},
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
  const prodsHere = filterManufacturadosBySucursalId(manufacturados, sucursalId)

  const insumoOpts = insumosHere.map(i => ({
    value: String(i.id),
    label: `${i.denominacion} [Insumo]`,
  }))
  const prodOpts = prodsHere.map(p => ({
    value: String(p.id),
    label: `${p.denominacion} [Prod]`,
  }))
  return [...prodOpts, ...insumoOpts]
}

// ── Date / time helpers for Shop ────────────────────────────────────────────

function parseYMD(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

/** Is the promotion within its calendar date range? (ignores time of day) */
export function isPromocionDateValid(p: Promocion, now = new Date()): boolean {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const from = parseYMD(p.fechaDesde)
  const to = parseYMD(p.fechaHasta)
  return today.getTime() >= from.getTime() && today.getTime() <= to.getTime()
}

/** Is the current time within the promotion's time window (HH:mm:ss)? */
export function isPromocionTimeValid(p: Promocion, now = new Date()): boolean {
  const [fh, fm] = p.horaDesde.split(':').map(Number)
  const [th, tm] = p.horaHasta.split(':').map(Number)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const fromMinutes = (fh ?? 0) * 60 + (fm ?? 0)
  const toMinutes = (th ?? 0) * 60 + (tm ?? 0)
  return nowMinutes >= fromMinutes && nowMinutes <= toMinutes
}

/** Human-readable vigencia label for staff (date + time). */
export function buildPromocionVigenciaLabel(p: Promocion): string {
  const fromDate = p.fechaDesde
  const toDate = p.fechaHasta
  const fromTime = p.horaDesde.slice(0, 5)
  const toTime = p.horaHasta.slice(0, 5)
  return `Vigente del ${fromDate} al ${toDate}, de ${fromTime} a ${toTime}`
}
