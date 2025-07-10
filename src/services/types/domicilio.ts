import {BaseEntity} from './base'

export interface Domicilio extends BaseEntity {
  calle: string
  numero: number
  cp: number
  idLocalidad: number
}

// Para crear/editar domicilio (sin id)
export interface DomicilioPayload {
  calle: string
  numero: number
  cp: number
  idLocalidad: number
}
