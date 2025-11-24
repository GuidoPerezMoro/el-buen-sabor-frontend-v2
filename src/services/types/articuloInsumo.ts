import {Articulo} from './articulo'

/** Artículo Insumo */
export interface ArticuloInsumo extends Articulo {
  precioCompra: number
  stockActual: number
  stockMaximo: number
  stockMinimo: number
  esParaElaborar: boolean
}

/** Payload — tal como espera la API */
export interface ArticuloInsumoCreatePayload {
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

export interface ArticuloInsumoUpdatePayload {
  denominacion?: string
  precioVenta?: number
  precioCompra?: number
  stockActual?: number
  stockMaximo?: number
  stockMinimo?: number
  esParaElaborar?: boolean
}
