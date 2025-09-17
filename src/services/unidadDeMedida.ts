import api from './baseService'
import {UnidadDeMedida, UnidadDeMedidaPayload} from './types/unidadDeMedida'

const BASE = '/unidad-de-medida'

// GET all
export async function fetchAllUnidades(): Promise<UnidadDeMedida[]> {
  const res = await api.get<UnidadDeMedida[]>(BASE)
  return res.data
}

// GET one by ID
export async function fetchUnidadById(id: number): Promise<UnidadDeMedida> {
  const res = await api.get<UnidadDeMedida>(`${BASE}/${id}`)
  return res.data
}

// Create
export async function createUnidad(data: UnidadDeMedidaPayload): Promise<UnidadDeMedida> {
  const res = await api.post<UnidadDeMedida>(BASE, data)
  return res.data
}

// Update
export async function updateUnidad(
  id: number,
  data: Partial<UnidadDeMedidaPayload>
): Promise<UnidadDeMedida> {
  const res = await api.put<UnidadDeMedida>(`${BASE}/${id}`, data)
  return res.data
}

// Delete
export async function deleteUnidad(id: number): Promise<void> {
  await api.delete<void>(`${BASE}/${id}`)
}
