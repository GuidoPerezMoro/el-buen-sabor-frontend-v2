import api from './baseService'
import type {Empleado} from './types/empleado'
import {
  empleadoCreateSchema,
  empleadoUpdateSchema,
  type EmpleadoCreatePayload,
  type EmpleadoUpdatePayload,
} from '@/schemas/empleadoSchema'

const BASE = '/empleados'

/** Obtener todos los empleados (⚠️ incluye de todas las sucursales) */
export async function fetchAllEmpleados(): Promise<Empleado[]> {
  const res = await api.get<Empleado[]>(BASE)
  return res.data
}

/** Obtener un empleado por ID */
export async function fetchEmpleadoById(id: number): Promise<Empleado> {
  const res = await api.get<Empleado>(`${BASE}/${id}`)
  return res.data
}

/** Crear empleado (incluye idSucursal oculto en UI) */
export async function createEmpleado(payload: EmpleadoCreatePayload): Promise<Empleado> {
  // Validate on the edge for friendly Zod errors in UI
  const data = empleadoCreateSchema.parse(payload)
  const res = await api.post<Empleado>(BASE, data)
  return res.data
}

/** Actualizar empleado (no cambiamos rol en UI, pero enviamos el valor actual) */
export async function updateEmpleado(
  id: number,
  payload: EmpleadoUpdatePayload
): Promise<Empleado> {
  const data = empleadoUpdateSchema.parse(payload)
  const res = await api.put<Empleado>(`${BASE}/${id}`, data)
  return res.data
}

/** Eliminar un empleado */
export async function deleteEmpleado(id: number): Promise<boolean> {
  const res = await api.delete<boolean>(`${BASE}/${id}`)
  // BE returns `true` on success per sample
  return res.data === true
}

/** Crear empleado + subir imagen en una sola request (multipart: { data, file }) */
export async function createEmpleadoWithImage(
  payload: EmpleadoCreatePayload,
  file: File
): Promise<Empleado> {
  const data = empleadoCreateSchema.parse(payload)
  const form = new FormData()
  form.append('data', new Blob([JSON.stringify(data)], {type: 'application/json'}))
  form.append('file', file)
  const res = await api.post<Empleado>(`${BASE}/create-with-image`, form)
  return res.data
}

/** Actualizar empleado + subir imagen en una sola request (multipart: { data, file }) */
export async function updateEmpleadoWithImage(
  id: number,
  payload: EmpleadoUpdatePayload,
  file: File
): Promise<Empleado> {
  const data = empleadoUpdateSchema.parse(payload)
  const form = new FormData()
  form.append('data', new Blob([JSON.stringify(data)], {type: 'application/json'}))
  form.append('file', file)
  const res = await api.put<Empleado>(`${BASE}/update-with-image/${id}`, form)
  return res.data
}
