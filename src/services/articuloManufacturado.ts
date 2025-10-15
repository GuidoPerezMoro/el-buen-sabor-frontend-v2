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
  // JSON part must be under key "data" to match backend @RequestPart("data")
  const form = new FormData()
  form.append('data', new Blob([JSON.stringify(data)], {type: 'application/json'}))
  form.append('file', file)
  // hit the dedicated multipart route; let axios/browser set boundary header
  const res = await api.post<ArticuloManufacturado>(`${BASE}/create-with-image`, form)

  return res.data
}

export async function updateArticuloManufacturadoWithImage(
  id: number,
  data: ArticuloManufacturadoUpdatePayload,
  file: File
): Promise<ArticuloManufacturado> {
  // JSON part must be under key "data" to match backend @RequestPart("data")
  const form = new FormData()
  form.append('data', new Blob([JSON.stringify(data)], {type: 'application/json'}))
  form.append('file', file)
  // hit the dedicated multipart route; let axios/browser set boundary header
  const res = await api.put<ArticuloManufacturado>(`${BASE}/update-with-image/${id}`, form)
  return res.data
}
