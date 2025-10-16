import {BaseEntity} from './base'

/** Represents a parent category (simplified) */
export interface CategoriaPadre extends BaseEntity {
  denominacion: string
}

/** Category extended to show children on page */
export interface CategoriaNode extends Categoria {
  children: CategoriaNode[]
}

/** Category entity returned by the API */
export interface Categoria extends BaseEntity {
  denominacion: string
  esInsumo: boolean
  categoriaPadre: CategoriaPadre | null
  sucursales: Array<{id: number; nombre: string}>
}
