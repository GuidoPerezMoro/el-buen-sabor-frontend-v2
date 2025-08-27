import {Articulo} from './articulo'

/** Artículo Manufacturado — se completará en la siguiente etapa */
export interface ArticuloManufacturado extends Articulo {
  descripcion: string
  tiempoEstimadoMinutos: number
  preparacion: string
  detalles: Array<{cantidad: number; idArticuloInsumo: number}>
}
