import {ArticuloManufacturado} from '@/services/types/articuloManufacturado'

export function filterManufacturadosBySucursalId(
  items: ArticuloManufacturado[],
  sucursalId: number
) {
  return items.filter(a => a.sucursal?.id === sucursalId)
}

export function filterManufacturadosByText(items: ArticuloManufacturado[], text: string) {
  const q = text.trim().toLowerCase()
  if (!q) return items
  return items.filter(a => {
    const name = a.denominacion?.toLowerCase() ?? ''
    const cat = a.categoria?.denominacion?.toLowerCase() ?? ''
    return name.includes(q) || cat.includes(q)
  })
}

// optional helper: count of insumos
export const countDetalles = (a: ArticuloManufacturado) => a.detalles?.length ?? 0
