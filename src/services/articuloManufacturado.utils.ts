import {ArticuloManufacturado} from '@/services/types/articuloManufacturado'

// by sucursal
export function filterManufacturadosBySucursalId(
  items: ArticuloManufacturado[],
  sucursalId: number
) {
  return items.filter(a => a.sucursal?.id === sucursalId)
}

// free-text: denom, categoria, descripcion
export function filterManufacturadosByText(items: ArticuloManufacturado[], text: string) {
  const q = text.trim().toLowerCase()
  if (!q) return items
  return items.filter(a => {
    const fields = [a.denominacion, a.categoria?.denominacion ?? '', a.descripcion ?? '']
    return fields.some(v => v.toLowerCase().includes(q))
  })
}

// optional helper: count of insumos
export const countDetalles = (a: ArticuloManufacturado) => a.detalles?.length ?? 0
