import {BaseEntity} from './base'
import {Articulo} from './articulo'
import {Sucursal} from './sucursal'

// API uses a string enum. Extend as backend grows.
export enum TipoPromocion {
  PROMOCION = 'PROMOCION', // precio fijo enviado por la app
  HAPPY_HOUR = 'HAPPY_HOUR', // 20% OFF automático
  CINCUENTAOFF = 'CINCUENTAOFF', // 50% OFF automático
  DOSXUNO = 'DOSXUNO', // 2x1 automático
}

export type ArticuloRef = Pick<Articulo, 'id' | 'denominacion' | 'imagenUrl' | 'precioVenta'>

export interface PromocionDetalle extends BaseEntity {
  cantidad: number
  articulo: ArticuloRef // puede ser insumo o manufacturado
}

export interface Promocion extends BaseEntity {
  denominacion: string
  imagenUrl: string | null
  fechaDesde: string // 'YYYY-MM-DD'
  fechaHasta: string // 'YYYY-MM-DD'
  horaDesde: string // 'HH:mm:ss'
  horaHasta: string // 'HH:mm:ss'
  descripcionDescuento: string | null
  precioPromocional: number
  tipoPromocion: TipoPromocion

  idSucursales?: number[] // sometimes only ids
  sucursales?: Array<{id: number; nombre: string}> // or embedded

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
  precioPromocional?: number
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
