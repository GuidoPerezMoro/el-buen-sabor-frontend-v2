import api from './baseService'
import {Sucursal} from './types'
import {
  SucursalPayload,
  SucursalCreatePayload,
  SucursalUpdatePayload,
} from '@/schemas/sucursalSchema'

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
export async function createSucursal(data: SucursalCreatePayload): Promise<Sucursal> {
  const response = await api.post<Sucursal>(BASE, data)
  return response.data
}

// Actualizar una sucursal
export async function updateSucursal(id: number, data: SucursalUpdatePayload): Promise<Sucursal> {
  const response = await api.put<Sucursal>(`${BASE}/${id}`, data)
  return response.data
}

// Eliminar una sucursal
export async function deleteSucursal(id: number): Promise<void> {
  await api.delete<void>(`${BASE}/${id}`)
}

/** Crear sucursal con imagen (multipart: { data: JSON, file: Binary }) */
export async function createSucursalWithImage(
  data: SucursalCreatePayload,
  image: File
): Promise<Sucursal> {
  const dataBlob = new Blob([JSON.stringify(data)], {type: 'application/json'})
  const form = new FormData()
  form.append('data', dataBlob)
  form.append('file', image)
  const res = await api.post<Sucursal>(`${BASE}/create-with-image`, form)
  return res.data
}

/** Actualizar sucursal + subir imagen nueva en una sola request */
export async function updateSucursalWithImage(
  id: number,
  data: SucursalUpdatePayload,
  image: File
): Promise<Sucursal> {
  const dataBlob = new Blob([JSON.stringify(data)], {type: 'application/json'})
  const form = new FormData()
  form.append('data', dataBlob)
  form.append('file', image)
  const res = await api.put<Sucursal>(`${BASE}/update-with-image/${id}`, form)
  return res.data
}
