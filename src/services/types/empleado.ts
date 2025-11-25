export interface EmpresaLite {
  id: number
  nombre: string
}

export interface SucursalLite {
  id: number
  nombre: string
}

export interface Empleado {
  id: number
  nombre: string
  apellido: string
  telefono: string
  email: string
  /** ISO date string, e.g. "2000-01-01" */
  fechaNacimiento: string
  /** Backend returns uppercase roles, e.g. "ADMIN", "COCINERO" */
  rol: string
  sucursal: SucursalLite
  empresa: EmpresaLite | null
  imagenUrl: string | null
}
