import api from './baseService'
import {Categoria} from '@/services/types/categoria'

export interface CreateCategoriaPayload {
  denominacion: string
  idSucursales: number[]
  idCategoriaPadre?: number | null
  esInsumo?: boolean
}
export interface UpdateCategoriaPayload {
  denominacion?: string
  esInsumo?: boolean
  idSucursales?: number[]
  idCategoriaPadre?: number | null
}

const BASE = '/categorias'

export async function fetchAllCategorias(): Promise<Categoria[]> {
  const res = await api.get<Categoria[]>(BASE)
  return res.data
}
export async function fetchCategoriaById(id: number): Promise<Categoria> {
  const res = await api.get<Categoria>(`${BASE}/${id}`)
  return res.data
}
export async function createCategoria(data: CreateCategoriaPayload): Promise<Categoria> {
  const res = await api.post<Categoria>(BASE, data)
  return res.data
}
export async function updateCategoria(
  id: number,
  data: UpdateCategoriaPayload
): Promise<Categoria> {
  const res = await api.put<Categoria>(`${BASE}/${id}`, data)
  return res.data
}
export async function deleteCategoria(id: number): Promise<void> {
  await api.delete(`${BASE}/${id}`)
}
