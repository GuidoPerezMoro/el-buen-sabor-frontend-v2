export const ESTADO_PEDIDO_VALUES = [
  'PENDIENTE',
  'PREPARACION',
  'TERMINADO',
  'FACTURADO',
  'CANCELADO',
  'RECHAZADO',
  'ENTREGADO',
  'DELIVERY',
] as const

export type EstadoPedido = (typeof ESTADO_PEDIDO_VALUES)[number]

export const FORMA_PAGO_VALUES = ['EFECTIVO', 'MERCADO_PAGO', 'TARJETA'] as const
export type FormaPago = (typeof FORMA_PAGO_VALUES)[number]

export const TIPO_ENVIO_VALUES = ['DELIVERY', 'TAKE_AWAY'] as const
export type TipoEnvio = (typeof TIPO_ENVIO_VALUES)[number]

export interface PedidoCliente {
  nombre: string
  apellido: string
  telefono: string
}

export interface PedidoPais {
  id: number
  nombre: string
}

export interface PedidoProvincia {
  id: number
  nombre: string
  pais: PedidoPais
}

export interface PedidoLocalidad {
  id: number
  nombre: string
  provincia: PedidoProvincia
}

export interface PedidoDomicilio {
  id: number
  calle: string
  numero: number
  cp: number
  localidad: PedidoLocalidad
}

export interface PedidoSucursal {
  id: number
  nombre: string
}

export interface PedidoEmpleado {
  id: number
  nombre: string
  apellido: string
}

export interface PedidoArticulo {
  id: number
  denominacion: string
  precioVenta: number
  imagenUrl: string | null
}

export interface PedidoPromocionDetalle {
  id: number
  cantidad: number
  articulo: PedidoArticulo
}

export interface PedidoPromocion {
  id: number
  denominacion: string
  fechaDesde: string
  fechaHasta: string
  horaDesde: string
  horaHasta: string
  descripcionDescuento: string
  precioPromocional: number
  tipoPromocion: string
  sucursales: PedidoSucursal[]
  detalles: PedidoPromocionDetalle[]
  imagenUrl: string | null
}

export interface PedidoDetalle {
  id: number
  subTotal: number
  cantidad: number
  articulo: PedidoArticulo | null
  promocion?: PedidoPromocion | null
}

export interface Pedido {
  id: number
  horarioEstimada: string
  total: number
  costoTotal: number
  estado: EstadoPedido
  tipoDeEnvio: TipoEnvio
  formaDePago: FormaPago
  fechaDePedido: string
  cliente: PedidoCliente
  domicilio: PedidoDomicilio
  sucursal: PedidoSucursal
  empleado: PedidoEmpleado | null
  detalles: PedidoDetalle[]
}

// ── Checkout payloads ───────────────────────────────────────────────────────

export type PedidoDetalleCreate =
  | {
      cantidad: number
      idArticulo: number
      idPromocion?: never
    }
  | {
      cantidad: number
      idPromocion: number
      idArticulo?: never
    }

export interface PedidoCreatePayload {
  tipoDeEnvio: TipoEnvio
  formaDePago: FormaPago
  idCliente: number
  idDomicilio: number
  idSucursal: number
  detalles: PedidoDetalleCreate[]
}

export interface PedidoMercadoPagoPreference {
  id: string
  statusCode: number
  initPoint: string
}
