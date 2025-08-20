import api from './baseService'
import {
  ArticuloInsumo,
  ArticuloInsumoCreateInput,
  ArticuloInsumoUpdateInput,
} from './types/articulo'

const BASE = '/articuloInsumo' // TODO(back): cuando migre a kebab-case, actualizar a '/articulo-insumo'

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

export async function updateArticuloInsumo(
  id: number,
  data: ArticuloInsumoUpdateInput
): Promise<ArticuloInsumo> {
  const res = await api.put<ArticuloInsumo>(`${BASE}/${id}`, data)
  return res.data
}

export async function deleteArticuloInsumo(id: number): Promise<boolean> {
  const res = await api.delete<boolean>(`${BASE}/${id}`)
  // API devuelve `true`; si alguna instancia devuelve 200 sin body, normalizamos a true
  return res.data ?? true
}
