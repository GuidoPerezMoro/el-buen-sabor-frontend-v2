import {Localidad, Provincia, Pais} from './types/localidad'

/**
 * Dedupe whole localidades list.
 * 1) Prefer unique by (nombre|provincia.id) to collapse logical duplicates even if ids differ.
 * 2) Fall back to unique by id to remove exact duplicates.
 */
export function dedupeLocalidades(list: Localidad[]): Localidad[] {
  const byNameProv = new Map<string, Localidad>()
  for (const l of list) {
    const key = `${l.nombre}|${l.provincia.id}`
    if (!byNameProv.has(key)) byNameProv.set(key, l)
  }
  // also ensure unique by id in the final array (extra safety)
  const byId = new Map<number, Localidad>()
  for (const l of byNameProv.values()) {
    if (!byId.has(l.id)) byId.set(l.id, l)
  }
  return Array.from(byId.values())
}

// Distinct helpers
export function distinctPaises(list: Localidad[]): Pais[] {
  const map = new Map<number, Pais>()
  list.forEach(l => {
    if (!map.has(l.provincia.pais.id)) map.set(l.provincia.pais.id, l.provincia.pais)
  })
  return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre))
}

export function provinciasByPaisId(list: Localidad[], paisId: number | null): Provincia[] {
  if (!paisId) return []
  const map = new Map<number, Provincia>()
  list.forEach(l => {
    if (l.provincia.pais.id === paisId && !map.has(l.provincia.id)) {
      map.set(l.provincia.id, l.provincia)
    }
  })
  return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre))
}

export function localidadesByProvinciaId(
  list: Localidad[],
  provinciaId: number | null
): Localidad[] {
  if (!provinciaId) return []
  // Deduplicate by (nombre|provincia.id) to avoid repeated labels with different ids
  const byNameProv = new Map<string, Localidad>()
  for (const l of list) {
    if (l.provincia.id !== provinciaId) continue
    const key = `${l.nombre}|${l.provincia.id}`
    if (!byNameProv.has(key)) byNameProv.set(key, l)
  }
  return Array.from(byNameProv.values()).sort((a, b) => a.nombre.localeCompare(b.nombre))
}

// Option builders for  Dropdown
export type DD = {value: string; label: string}
export const toPaisOptions = (paises: Pais[]): DD[] => {
  const seen = new Set<string>()
  const out: DD[] = []
  for (const p of paises) {
    const key = `${p.nombre}|${p.id}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push({value: String(p.id), label: p.nombre})
  }
  return out
}
export const toProvinciaOptions = (provs: Provincia[]): DD[] => {
  const seen = new Set<string>()
  const out: DD[] = []
  for (const p of provs) {
    const key = `${p.nombre}|${p.id}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push({value: String(p.id), label: p.nombre})
  }
  return out
}
export const toLocalidadOptions = (locs: Localidad[]): DD[] => {
  const seen = new Set<string>()
  const out: DD[] = []
  for (const l of locs) {
    const key = `${l.nombre}|${l.provincia.id}` // avoid dup labels in the same province
    if (seen.has(key)) continue
    seen.add(key)
    out.push({value: String(l.id), label: l.nombre})
  }
  return out
}

// Resolve hierarchy from an idLocalidad (for EDIT)
export function resolveHierarchyByLocalidadId(list: Localidad[], idLocalidad: number | null) {
  if (!idLocalidad) return {paisId: null as number | null, provinciaId: null as number | null}
  const loc = list.find(l => l.id === idLocalidad)
  if (!loc) return {paisId: null, provinciaId: null}
  return {paisId: loc.provincia.pais.id, provinciaId: loc.provincia.id}
}
