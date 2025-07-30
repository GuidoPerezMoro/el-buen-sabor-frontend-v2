import api from './baseService'
import {Empresa} from './types'
import {EmpresaInput} from '@/schemas/empresaSchema'

// Obtener todas las empresas
export async function fetchAllEmpresas(): Promise<Empresa[]> {
  const response = await api.get<Empresa[]>('/empresas')
  return response.data
}

// Obtener una empresa por ID
export async function fetchEmpresaById(id: number): Promise<Empresa> {
  const response = await api.get<Empresa>(`/empresas/${id}`)
  return response.data
}

// Crear nueva empresa
export async function createEmpresa(data: EmpresaInput): Promise<Empresa> {
  const response = await api.post<Empresa>('/empresas', data)
  // imagen? No. El Nico va a agregarlo al constructor
  return response.data
}

// Crear nueva empresa con imagen
export async function createEmpresaWithImage(data: EmpresaInput, image: File): Promise<Empresa> {
  // prepare JSON payload as a Blob so Spring can bind @RequestPart("data")
  const payload = {
    nombre: data.nombre.trim(),
    razonSocial: data.razonSocial.trim(),
    cuil: data.cuil,
  }
  const dataBlob = new Blob([JSON.stringify(payload)], {
    type: 'application/json',
  })

  const formData = new FormData()
  formData.append('data', dataBlob)
  formData.append('file', image)

  console.log('[empresaService] create-with-image formData keys →', Array.from(formData.keys()))

  // interceptor in baseService will strip JSON header and let the browser set multipart boundary
  const response = await api.post<Empresa>('/empresas/create-with-image', formData)

  console.log('[empresaService] create-with-image response →', response.data)
  return response.data
}

// Actualizar empresa
export async function updateEmpresa(id: number, data: Partial<Empresa>): Promise<Empresa> {
  const response = await api.put<Empresa>(`/empresas/${id}`, data)
  return response.data
}

// Eliminar empresa
export async function deleteEmpresa(id: number): Promise<void> {
  await api.delete(`/Empresas/${id}`)
}
