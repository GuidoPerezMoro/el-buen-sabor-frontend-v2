import type {Empleado} from './types/empleado'

/**
 * Filters empleados by the given sucursalId.
 * API currently returns all empleados (no server-side filter).
 */
export function filterEmpleadosBySucursalId(list: Empleado[], sucursalId: number): Empleado[] {
  return list.filter(e => e.sucursal?.id === sucursalId)
}

/** Simple client-side text filter (nombre, apellido, email, rol). */
export function filterEmpleadosByText(list: Empleado[], q: string): Empleado[] {
  const s = q.trim().toLowerCase()
  if (!s) return list
  return list.filter(e => {
    const haystack = [
      e.nombre,
      e.apellido,
      e.email,
      e.rol,
      e.sucursal?.nombre ?? '',
      String(e.telefono ?? ''),
      e.fechaNacimiento ?? '',
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(s)
  })
}
