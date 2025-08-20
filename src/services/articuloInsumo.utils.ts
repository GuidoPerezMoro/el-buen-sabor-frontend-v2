import {ArticuloInsumo} from './types/articulo'

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
