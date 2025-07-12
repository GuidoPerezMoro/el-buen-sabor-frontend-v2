import {BaseEntity} from './base'
import {Sucursal} from './sucursal'

export interface Empresa extends BaseEntity {
  nombre: string
  razonSocial: string
  cuil: number

  sucursales: Sucursal[]
}
