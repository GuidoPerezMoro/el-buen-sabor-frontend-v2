import api from './baseService'
import {Sucursal} from './types'
import {SucursalPayload} from '@/schemas/sucursalSchema'

const BASE = '/sucursales'

// Obtener todas las sucursales (⚠️ incluye de todas las empresas)
export async function fetchAllSucursales(): Promise<Sucursal[]> {
  const response = await api.get<Sucursal[]>(BASE)
  return response.data
}

// Obtener una sucursal por ID
export async function fetchSucursalById(id: number): Promise<Sucursal> {
  const response = await api.get<Sucursal>(`${BASE}/${id}`)
  return response.data
}

// Crear nueva sucursal
export async function createSucursal(data: SucursalPayload): Promise<Sucursal> {
  const response = await api.post<Sucursal>(BASE, data)
  return response.data
}

// Actualizar una sucursal
export async function updateSucursal(id: number, data: SucursalPayload): Promise<Sucursal> {
  const response = await api.put<Sucursal>(`${BASE}/${id}`, data)
  return response.data
}

// Eliminar una sucursal
export async function deleteSucursal(id: number): Promise<void> {
  await api.delete<void>(`${BASE}/${id}`)
}

// TODO: With image
