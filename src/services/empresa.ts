import api from './baseService'
import {Empresa} from './types'

// Obtener todas las empresas
export async function fetchAllEmpresas(): Promise<Empresa[]> {
  const response = await api.get<Empresa[]>('/Empresas')
  return response.data
}

// Obtener una empresa por ID
export async function fetchEmpresaById(id: number): Promise<Empresa> {
  const response = await api.get<Empresa>(`/Empresas/${id}`)
  return response.data
}

// Crear nueva empresa
export async function createEmpresa(data: Omit<Empresa, 'id'>): Promise<Empresa> {
  const response = await api.post<Empresa>('/Empresas', data)
  return response.data
}

// Actualizar empresa
export async function updateEmpresa(id: number, data: Partial<Empresa>): Promise<Empresa> {
  const response = await api.put<Empresa>(`/Empresas/${id}`, data)
  return response.data
}

// Eliminar empresa
export async function deleteEmpresa(id: number): Promise<void> {
  await api.delete(`/Empresas/${id}`)
}
