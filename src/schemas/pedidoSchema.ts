import {z} from 'zod'
import {ESTADO_PEDIDO_VALUES, FORMA_PAGO_VALUES, TIPO_ENVIO_VALUES} from '@/services/types/pedido'

export const estadoPedidoSchema = z.enum(ESTADO_PEDIDO_VALUES)
export const formaPagoSchema = z.enum(FORMA_PAGO_VALUES)
export const tipoEnvioSchema = z.enum(TIPO_ENVIO_VALUES)

export const pedidoUpdateEstadoSchema = z.object({
  estado: estadoPedidoSchema,
})

export type PedidoUpdateEstadoPayload = z.infer<typeof pedidoUpdateEstadoSchema>
