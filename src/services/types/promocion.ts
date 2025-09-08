import {BaseEntity} from './base'
import {Articulo} from './articulo'
import {Sucursal} from './sucursal'

// API uses a string enum. Extend as backend grows.
export enum TipoPromocion {
  HAPPY_HOUR = 'HAPPY HOUR',
  PROMOCION = 'PROMOCION',
}

// Narrow references we actually get/use in promo responses
export type SucursalRef = Pick<Sucursal, 'id' | 'nombre' | 'habilitado'>
export type ArticuloRef = Pick<Articulo, 'id' | 'denominacion' | 'imagenUrl' | 'precioVenta'>

export interface PromocionDetalle extends BaseEntity {
  cantidad: number
  articulo: ArticuloRef // puede ser insumo o manufacturado
}

export interface Promocion extends BaseEntity {
  denominacion: string
  fechaDesde: string // 'YYYY-MM-DD'
  fechaHasta: string // 'YYYY-MM-DD'
  horaDesde: string // 'HH:mm:ss'
  horaHasta: string // 'HH:mm:ss'
  descripcionDescuento: string | null
  precioPromocional: number
  tipoPromocion: TipoPromocion
  sucursales: SucursalRef[]
  detalles: PromocionDetalle[]
}

// Payloads
export interface PromocionDetallePayload {
  cantidad: number
  idArticulo: number
}

export interface PromocionCreatePayload {
  denominacion: string
  fechaDesde: string
  fechaHasta: string
  horaDesde: string
  horaHasta: string
  descripcionDescuento?: string | null
  precioPromocional: number
  tipoPromocion: TipoPromocion
  idSucursales: number[]
  detalles: PromocionDetallePayload[]
}

export interface PromocionUpdatePayload {
  denominacion?: string
  fechaDesde?: string
  fechaHasta?: string
  horaDesde?: string
  horaHasta?: string
  descripcionDescuento?: string | null
  precioPromocional?: number
  tipoPromocion?: TipoPromocion
  idSucursales?: number[]
  detalles?: PromocionDetallePayload[]
}
