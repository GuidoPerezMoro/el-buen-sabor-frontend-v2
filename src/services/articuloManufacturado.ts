import api from './baseService'
import {
  ArticuloManufacturado,
  ArticuloManufacturadoCreatePayload,
  ArticuloManufacturadoUpdatePayload,
} from '@/services/types/articuloManufacturado'

// NOTE: switch to '/articulo-manufacturado' when backend flips to hyphenated.
const BASE = '/articulo-manufacturado'

// Basic CRUD
export async function fetchAllManufacturados(): Promise<ArticuloManufacturado[]> {
  const res = await api.get<ArticuloManufacturado[]>(BASE)
  return res.data
}

export async function fetchManufacturadoById(id: number): Promise<ArticuloManufacturado> {
  const res = await api.get<ArticuloManufacturado>(`${BASE}/${id}`)
  return res.data
}

export async function createManufacturado(
  data: ArticuloManufacturadoCreatePayload
): Promise<ArticuloManufacturado> {
  const res = await api.post<ArticuloManufacturado>(BASE, data)
  return res.data
}

export async function updateManufacturado(
  id: number,
  data: ArticuloManufacturadoUpdatePayload
): Promise<ArticuloManufacturado> {
  const res = await api.put<ArticuloManufacturado>(`${BASE}/${id}`, data)
  return res.data
}

export async function deleteManufacturado(id: number): Promise<boolean> {
  const res = await api.delete<boolean>(`${BASE}/${id}`)
  return res.data ?? true
}

export async function createManufacturadoWithImage(
  data: ArticuloManufacturadoCreatePayload,
  file: File
): Promise<ArticuloManufacturado> {
  const form = new FormData()
  form.append('data', new Blob([JSON.stringify(data)], {type: 'application/json'}))
  form.append('file', file)
  const res = await api.post<ArticuloManufacturado>(`${BASE}/with-image`, form)
  return res.data
}

export async function updateManufacturadoWithImage(
  id: number,
  data: ArticuloManufacturadoUpdatePayload,
  file: File
): Promise<ArticuloManufacturado> {
  const form = new FormData()
  form.append('data', new Blob([JSON.stringify(data)], {type: 'application/json'}))
  form.append('file', file)
  const res = await api.put<ArticuloManufacturado>(`${BASE}/${id}/with-image`, form)
  return res.data
}
