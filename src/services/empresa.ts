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
  const formData = new FormData()

  // → wrap JSON in a Blob so the part has Content-Type: application/json
  const payload = {
    nombre: data.nombre.trim(),
    razonSocial: data.razonSocial.trim(),
    cuil: data.cuil,
  }
  const jsonBlob = new Blob([JSON.stringify(payload)], {
    type: 'application/json',
  })
  formData.append('data', jsonBlob)

  // → file part must be called “file” to match @RequestPart("file")
  formData.append('file', image)

  console.log('[empresaService][fetch] formData keys →', Array.from(formData.keys()))

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/empresas/create-with-image`, {
    method: 'POST',
    body: formData,
    // no explicit headers!
  })

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return (await res.json()) as Empresa
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
