import {BaseEntity} from './base'
import {Domicilio, DomicilioPayload} from './domicilio'
import {Empresa} from './empresa'

export interface Sucursal extends BaseEntity {
  nombre: string
  horarioApertura: string // formato HH:mm:ss
  horarioCierre: string // formato HH:mm:ss
  esCasaMatriz: boolean

  domicilio: Domicilio
  empresa: Empresa
}

// Payload para crear/editar sucursales (sin el id, ni empresa completa)
export interface SucursalPayload {
  nombre: string
  horarioApertura: string
  horarioCierre: string
  esCasaMatriz: boolean
  domicilio: DomicilioPayload
  idEmpresa: number
}
