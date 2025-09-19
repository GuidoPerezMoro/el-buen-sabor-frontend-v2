import api from './baseService'
import {Promocion, PromocionCreatePayload, PromocionUpdatePayload} from './types/promocion'

const BASE = '/promociones'

export async function fetchAllPromociones(): Promise<Promocion[]> {
  const {data} = await api.get<Promocion[]>(BASE)
  return data
}

export async function fetchPromocion(id: number): Promise<Promocion> {
  const {data} = await api.get<Promocion>(`${BASE}/${id}`)
  return data
}

export async function createPromocion(payload: PromocionCreatePayload): Promise<Promocion> {
  const {data} = await api.post<Promocion>(BASE, payload)
  return data
}

export async function updatePromocion(
  id: number,
  payload: PromocionUpdatePayload
): Promise<Promocion> {
  const {data} = await api.put<Promocion>(`${BASE}/${id}`, payload)
  return data
}

export async function deletePromocion(id: number): Promise<boolean> {
  const {data} = await api.delete<boolean>(`${BASE}/${id}`)
  return data
}

export async function createPromocionWithImage(
  payload: PromocionCreatePayload,
  image: File
): Promise<Promocion> {
  const dataBlob = new Blob([JSON.stringify(payload)], {type: 'application/json'})
  const form = new FormData()
  form.append('data', dataBlob)
  form.append('file', image)
  const {data} = await api.post<Promocion>(`${BASE}/create-with-image`, form)
  return data
}

export async function updatePromocionWithImage(
  id: number,
  payload: PromocionUpdatePayload,
  image: File
): Promise<Promocion> {
  const dataBlob = new Blob([JSON.stringify(payload)], {type: 'application/json'})
  const form = new FormData()
  form.append('data', dataBlob)
  form.append('file', image)
  const {data} = await api.put<Promocion>(`${BASE}/update-with-image/${id}`, form)
  return data
}
