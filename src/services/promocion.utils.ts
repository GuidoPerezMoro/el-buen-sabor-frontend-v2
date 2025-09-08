import {Promocion} from './types/promocion'

export function filterPromocionesBySucursalId(list: Promocion[], sucursalId: number) {
  return list.filter(p => p.sucursales?.some(s => s.id === sucursalId))
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
