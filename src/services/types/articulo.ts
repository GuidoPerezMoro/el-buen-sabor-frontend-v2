import {BaseEntity} from './base'
import {Categoria} from './categoria'
import {Sucursal} from './sucursal'
import {UnidadDeMedida} from './unidadDeMedida'

// Reuse existing types, but narrow to the fields actually returned by Artículo APIs
export type SucursalRef = Pick<Sucursal, 'id' | 'habilitado' | 'nombre'>
export type UnidadDeMedidaRef = Pick<UnidadDeMedida, 'id' | 'habilitado' | 'denominacion'>

/** Campos comunes a cualquier Artículo (ambos tipos comparten esta base) */
export interface Articulo extends BaseEntity {
  denominacion: string
  precioVenta: number
  imagenUrl: string | null
  sucursal: SucursalRef
  unidadDeMedida: UnidadDeMedidaRef
  categoria: Categoria
}
