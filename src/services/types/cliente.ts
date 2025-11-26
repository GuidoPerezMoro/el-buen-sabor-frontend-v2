import {BaseEntity} from './base'
import {Domicilio} from './domicilio'

/**
 * Cliente entity as returned by the backend.
 * Mirrors the payload from /clientes endpoints.
 */
export interface Cliente extends BaseEntity {
  nombre: string
  apellido: string
  telefono: string
  email: string
  /** ISO date string, e.g. "1999-07-21" */
  fechaNacimiento: string
  /** Backend may return "CLIENTE" or null for existing rows */
  rol: string | null

  /** One or more domicilios with nested localidad info */
  domicilios: Domicilio[]

  /** Optional avatar / profile image URL */
  imagenUrl: string | null
}
