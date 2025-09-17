import {Articulo, CategoriaRef, UnidadDeMedidaRef} from './articulo'
import {ArticuloInsumo} from './articuloInsumo'

// Allow sparse embeds + the occasional null
export type ArticuloInsumoRef = Pick<ArticuloInsumo, 'id' | 'denominacion'> & {
  unidadDeMedida?: UnidadDeMedidaRef | null
  categoria?: CategoriaRef | null
}

// ── Manufacturado ───────────────────────────────────────────────────────────
export interface ArticuloManufacturadoDetalle {
  id?: number
  cantidad: number
  articuloInsumo: ArticuloInsumoRef | null
}

export interface ArticuloManufacturado extends Articulo {
  // image is usually allowed for productos; keep same field as insumo:
  imagenUrl: string | null

  descripcion: string | null
  tiempoEstimadoMinutos: number // int >= 0
  preparacion: string | null

  detalles: ArticuloManufacturadoDetalle[]
}

// Payloads (create/update)
export interface ArticuloManufacturadoDetallePayload {
  cantidad: number
  idArticuloInsumo: number
}

export interface ArticuloManufacturadoCreatePayload {
  denominacion: string
  precioVenta: number
  descripcion?: string | null
  tiempoEstimadoMinutos: number
  preparacion?: string | null

  idSucursal: number
  idUnidadDeMedida: number
  idCategoria: number

  detalles: ArticuloManufacturadoDetallePayload[]
}

export interface ArticuloManufacturadoUpdatePayload {
  denominacion?: string
  precioVenta?: number
  descripcion?: string | null
  tiempoEstimadoMinutos?: number
  preparacion?: string | null

  idUnidadDeMedida?: number
  idCategoria?: number

  // depending on API semantics: full replace vs partial edits.
  // We'll treat as full replace when provided:
  detalles?: ArticuloManufacturadoDetallePayload[]
}
