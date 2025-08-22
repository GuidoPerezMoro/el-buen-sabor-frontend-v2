import api from './baseService'
import {
  ArticuloInsumo,
  ArticuloInsumoCreateInput,
  ArticuloInsumoUpdateInput,
} from './types/articulo'

const BASE = '/articuloInsumo' // TODO: cuando migre a kebab-case, actualizar a '/articulo-insumo'

export async function fetchAllArticuloInsumos(): Promise<ArticuloInsumo[]> {
  const res = await api.get<ArticuloInsumo[]>(BASE)
  return res.data
}

export async function fetchArticuloInsumoById(id: number): Promise<ArticuloInsumo> {
  const res = await api.get<ArticuloInsumo>(`${BASE}/${id}`)
  return res.data
}

export async function createArticuloInsumo(
  data: ArticuloInsumoCreateInput
): Promise<ArticuloInsumo> {
  const res = await api.post<ArticuloInsumo>(BASE, data)
  return res.data
}

/** Crear artículo insumo con imagen (multipart: { data: JSON, file: Binary }) */
export async function createArticuloInsumoWithImage(
  data: ArticuloInsumoCreateInput,
  image: File
): Promise<ArticuloInsumo> {
  const dataBlob = new Blob([JSON.stringify(data)], {type: 'application/json'})
  const form = new FormData()
  form.append('data', dataBlob)
  form.append('file', image)
  const res = await api.post<ArticuloInsumo>(`${BASE}/create-with-image`, form)
  return res.data
}

export async function updateArticuloInsumo(
  id: number,
  data: ArticuloInsumoUpdateInput
): Promise<ArticuloInsumo> {
  const res = await api.put<ArticuloInsumo>(`${BASE}/${id}`, data)
  return res.data
}

/** Actualizar artículo insumo + subir imagen nueva en una sola request */
export async function updateArticuloInsumoWithImage(
  id: number,
  data: ArticuloInsumoUpdateInput,
  image: File
): Promise<ArticuloInsumo> {
  const dataBlob = new Blob([JSON.stringify(data)], {type: 'application/json'})
  const form = new FormData()
  form.append('data', dataBlob)
  form.append('file', image)
  const res = await api.put<ArticuloInsumo>(`${BASE}/update-with-image/${id}`, form)
  return res.data
}

export async function deleteArticuloInsumo(id: number): Promise<boolean> {
  const res = await api.delete<boolean>(`${BASE}/${id}`)
  // API devuelve `true`; si alguna instancia devuelve 200 sin body, normalizamos a true
  return res.data ?? true
}
