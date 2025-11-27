import api from './baseService'
import {Pedido} from './types/pedido'
import {PedidoUpdateEstadoPayload} from '@/schemas/pedidoSchema'

const BASE = '/pedido'

// Obtener todos los pedidos (⚠️ incluye de todas las sucursales)
export async function fetchAllPedidos(): Promise<Pedido[]> {
  const res = await api.get<Pedido[]>(BASE)
  return res.data
}

// Obtener un pedido por ID
export async function fetchPedidoById(id: number): Promise<Pedido> {
  const res = await api.get<Pedido>(`${BASE}/${id}`)
  return res.data
}

// Actualizar estado de un pedido
export async function updatePedidoEstado(
  id: number,
  data: PedidoUpdateEstadoPayload
): Promise<Pedido> {
  const res = await api.put<Pedido>(`${BASE}/${id}`, data)
  return res.data
}

// Eliminar un pedido
export async function deletePedido(id: number): Promise<void> {
  await api.delete<void>(`${BASE}/${id}`)
}
