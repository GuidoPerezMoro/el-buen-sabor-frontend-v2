import api from './baseService'
import {UnidadDeMedida, UnidadDeMedidaPayload} from './types/unidadDeMedida'

// GET all
export async function fetchAllUnidades(): Promise<UnidadDeMedida[]> {
  const res = await api.get<UnidadDeMedida[]>('/unidad-de-medida')
  return res.data
}

// GET one by ID
export async function fetchUnidadById(id: number): Promise<UnidadDeMedida> {
  const res = await api.get<UnidadDeMedida>(`/unidad-de-medida/${id}`)
  return res.data
}

// Create
export async function createUnidad(data: UnidadDeMedidaPayload): Promise<UnidadDeMedida> {
  const res = await api.post<UnidadDeMedida>('/unidad-de-medida', data)
  return res.data
}

// Update
export async function updateUnidad(
  id: number,
  data: Partial<UnidadDeMedidaPayload>
): Promise<UnidadDeMedida> {
  const res = await api.put<UnidadDeMedida>(`/unidad-de-medida/${id}`, data)
  return res.data
}

// Delete
export async function deleteUnidad(id: number): Promise<void> {
  await api.delete(`/unidad-de-medida/${id}`)
}
