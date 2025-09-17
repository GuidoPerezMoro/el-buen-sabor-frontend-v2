import {ArticuloInsumo} from './types/articuloInsumo'

/** Filtra por sucursal (como hicimos con categorías) */
export function filterArticuloInsumosBySucursalId(
  list: ArticuloInsumo[],
  sucursalId: number
): ArticuloInsumo[] {
  return list.filter(a => a.sucursal?.id === sucursalId)
}

/** (Opcional) Validación de consistencia: categoría debe ser de insumo */
export function assertCategoriaIsInsumoForArticuloInsumo(categoriaEsInsumo: boolean) {
  if (!categoriaEsInsumo) {
    throw new Error('La categoría seleccionada no es de tipo Insumo.')
  }
}

/** Case/accents-insensitive text filter over denominación y categoría. */
export function filterArticuloInsumosByText(list: ArticuloInsumo[], q: string): ArticuloInsumo[] {
  const term = q.trim()
  if (!term) return list
  const fold = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
  const t = fold(term)
  return list.filter(a => {
    const name = fold(a.denominacion)
    const cat = fold(a.categoria?.denominacion ?? '')
    return name.includes(t) || cat.includes(t)
  })
}
