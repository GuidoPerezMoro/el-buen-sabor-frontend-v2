import {Articulo} from './articulo'

/** Artículo Insumo */
export interface ArticuloInsumo extends Articulo {
  precioCompra: number
  stockActual: number
  stockMaximo: number
  stockMinimo: number
  esParaElaborar: boolean
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
