import {Sucursal} from './types/sucursal'

export function filterSucursalesByEmpresaId(list: Sucursal[], empresaId: number): Sucursal[] {
  return list.filter(s => s.empresa.id === empresaId)
}

export function buildSucursalNameMap(list: Sucursal[]): Record<number, string> {
  const m: Record<number, string> = {}
  list.forEach(s => (m[s.id] = s.nombre))
  return m
}
