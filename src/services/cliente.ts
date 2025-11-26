import api from './baseService'
import type {Cliente} from './types/cliente'
import {
  clienteCreateSchema,
  clienteUpdateSchema,
  type ClienteCreatePayload,
  type ClienteUpdatePayload,
} from '@/schemas/clienteSchema'

const BASE = '/clientes'

/** Obtener todos los clientes (⚠️ probablemente de todas las sucursales/empresas) */
export async function fetchAllClientes(): Promise<Cliente[]> {
  const res = await api.get<Cliente[]>(BASE)
  return res.data
}

/** Obtener un cliente por ID */
export async function fetchClienteById(id: number): Promise<Cliente> {
  const res = await api.get<Cliente>(`${BASE}/${id}`)
  return res.data
}

/**
 * Crear cliente sin imagen.
 * - Valida el payload con Zod en el edge para mostrar errores amigables en UI.
 * - `rol` se fija a "CLIENTE" en el schema porque el backend solo setea el rol
 *   correctamente si lo enviamos explícitamente; si no, guarda null.
 */
export async function createCliente(payload: ClienteCreatePayload): Promise<Cliente> {
  const data = clienteCreateSchema.parse(payload)
  const res = await api.post<Cliente>(BASE, data)
  return res.data
}

/**
 * Crear cliente + subir imagen en una sola request (multipart: { data, file }).
 * - Sigue el mismo contrato que Sucursal/Empleado: "data" JSON + "file" binario.
 */
export async function createClienteWithImage(
  payload: ClienteCreatePayload,
  file: File
): Promise<Cliente> {
  const data = clienteCreateSchema.parse(payload)
  const form = new FormData()
  form.append('data', new Blob([JSON.stringify(data)], {type: 'application/json'}))
  form.append('file', file)
  const res = await api.post<Cliente>(`${BASE}/create-with-image`, form)
  return res.data
}

/**
 * Actualizar cliente (sin imagen).
 * - No enviamos domicilios: el backend hoy no maneja bien objetos anidados en update.
 */
export async function updateCliente(id: number, payload: ClienteUpdatePayload): Promise<Cliente> {
  const data = clienteUpdateSchema.parse(payload)
  // Asumimos mismo contrato que otras entidades: PUT /clientes/:id
  const res = await api.put<Cliente>(`${BASE}/${id}`, data)
  return res.data
}

/**
 * Actualizar cliente + subir nueva imagen.
 * - Multipart: { data: JSON, file: Binary }
 * - Ruta alineada a sucursales/empleados; si el backend difiere, solo se ajusta aquí.
 */
export async function updateClienteWithImage(
  id: number,
  payload: ClienteUpdatePayload,
  file: File
): Promise<Cliente> {
  const data = clienteUpdateSchema.parse(payload)
  const form = new FormData()
  form.append('data', new Blob([JSON.stringify(data)], {type: 'application/json'}))
  form.append('file', file)
  const res = await api.put<Cliente>(`${BASE}/update-with-image/${id}`, form)
  return res.data
}

/**
 * Buscar cliente por email usando GET /clientes y filtrando en FE.
 * - Por ahora el backend no expone endpoint dedicado.
 * - Si en el futuro existe /clientes/by-email, solo cambiamos esta función.
 */
export async function fetchClienteByEmail(email: string): Promise<Cliente | null> {
  const trimmed = email.trim().toLowerCase()
  if (!trimmed) return null

  const res = await api.get<Cliente[]>(BASE)
  const match = res.data.find(c => (c.email ?? '').toLowerCase() === trimmed)
  return match ?? null
}
