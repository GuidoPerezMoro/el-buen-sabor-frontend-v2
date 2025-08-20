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

/** Artículo Insumo */
export interface ArticuloInsumo extends Articulo {
  precioCompra: number
  stockActual: number
  stockMaximo: number
  stockMinimo: number
  esParaElaborar: boolean
}

/** Artículo Manufacturado — se completará en la siguiente etapa */
export interface ArticuloManufacturado extends Articulo {
  descripcion: string
  tiempoEstimadoMinutos: number
  preparacion: string
  detalles: Array<{cantidad: number; idArticuloInsumo: number}>
}

/** Inputs — tal como espera la API */
export interface ArticuloInsumoCreateInput {
  denominacion: string
  precioVenta: number
  precioCompra: number
  stockActual: number
  stockMaximo: number
  stockMinimo: number
  esParaElaborar: boolean
  idSucursal: number
  idUnidadDeMedida: number
  idCategoria: number
}

export interface ArticuloInsumoUpdateInput {
  denominacion?: string
  precioVenta?: number
  precioCompra?: number
  stockActual?: number
  stockMaximo?: number
  stockMinimo?: number
  esParaElaborar?: boolean
  // Relaciones (confirmar con backend si son editables)
  idUnidadDeMedida?: number
  idCategoria?: number
  idSucursal?: number // probablemente inmutable
}
