import {BaseEntity} from './base'

// The shape returned by GET /unidad-de-medida
export interface UnidadDeMedida extends BaseEntity {
  denominacion: string | null
}

// Payload for creating/updating
export interface UnidadDeMedidaPayload {
  denominacion: string
}
