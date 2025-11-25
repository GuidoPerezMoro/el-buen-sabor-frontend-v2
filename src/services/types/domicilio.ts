import {BaseEntity} from './base'
import {Localidad} from './localidad'

export interface Domicilio extends BaseEntity {
  calle: string
  numero: number
  cp: number
  idLocalidad?: number

  localidad?: Localidad
}

// Para crear/editar domicilio (sin id)
export interface DomicilioPayload {
  calle: string
  numero: number
  cp: number
  idLocalidad: number
}
