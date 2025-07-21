import api from './baseService'
import {Sucursal} from './types'
import {SucursalInput} from '@/schemas/sucursalSchema'

// Obtener todas las sucursales (⚠️ incluye de todas las empresas)
export async function fetchAllSucursales(): Promise<Sucursal[]> {
  const response = await api.get<Sucursal[]>('/sucursales')
  return response.data
}

// Obtener una sucursal por ID
export async function fetchSucursalById(id: number): Promise<Sucursal> {
  const response = await api.get<Sucursal>(`/sucursales/${id}`)
  return response.data
}

// Crear nueva sucursal
export async function createSucursal(data: SucursalInput): Promise<Sucursal> {
  const response = await api.post<Sucursal>('/sucursales', data)
  return response.data
}

// Actualizar una sucursal
export async function updateSucursal(id: number, data: SucursalInput): Promise<Sucursal> {
  const response = await api.put<Sucursal>(`/sucursales/${id}`, data)
  return response.data
}

// Eliminar una sucursal
export async function deleteSucursal(id: number): Promise<void> {
  await api.delete(`/sucursales/${id}`)
}
