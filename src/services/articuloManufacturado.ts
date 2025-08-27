import api from './baseService'
import {
  ArticuloManufacturado,
  ArticuloManufacturadoCreatePayload,
  ArticuloManufacturadoUpdatePayload,
} from '@/services/types/articuloManufacturado'

const BASE = '/articulo-manufacturado'

export async function fetchAllArticuloManufacturados(): Promise<ArticuloManufacturado[]> {
  const res = await api.get<ArticuloManufacturado[]>(BASE)
  return res.data
}

export async function fetchArticuloManufacturadoById(id: number): Promise<ArticuloManufacturado> {
  const res = await api.get<ArticuloManufacturado>(`${BASE}/${id}`)
  return res.data
}

export async function createArticuloManufacturado(
  data: ArticuloManufacturadoCreatePayload
): Promise<ArticuloManufacturado> {
  const res = await api.post<ArticuloManufacturado>(BASE, data)
  return res.data
}

export async function updateArticuloManufacturado(
  id: number,
  data: ArticuloManufacturadoUpdatePayload
): Promise<ArticuloManufacturado> {
  const res = await api.put<ArticuloManufacturado>(`${BASE}/${id}`, data)
  return res.data
}

export async function deleteArticuloManufacturado(id: number): Promise<boolean> {
  const res = await api.delete<boolean>(`${BASE}/${id}`)
  return res.data ?? true
}

// — optional image variants (match your insumo pattern) —
export async function createArticuloManufacturadoWithImage(
  data: ArticuloManufacturadoCreatePayload,
  file: File
): Promise<ArticuloManufacturado> {
  const form = new FormData()
  form.append('payload', new Blob([JSON.stringify(data)], {type: 'application/json'}))
  form.append('file', file)
  const res = await api.post<ArticuloManufacturado>(`${BASE}`, form, {
    headers: {'Content-Type': 'multipart/form-data'},
  } as any)
  return res.data
}

export async function updateArticuloManufacturadoWithImage(
  id: number,
  data: ArticuloManufacturadoUpdatePayload,
  file: File
): Promise<ArticuloManufacturado> {
  const form = new FormData()
  form.append('payload', new Blob([JSON.stringify(data)], {type: 'application/json'}))
  form.append('file', file)
  const res = await api.put<ArticuloManufacturado>(`${BASE}/${id}`, form, {
    headers: {'Content-Type': 'multipart/form-data'},
  } as any)
  return res.data
}
