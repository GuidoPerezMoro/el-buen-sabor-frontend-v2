'use client'

import {useEffect, useMemo, useState} from 'react'
import Dropdown from '@/components/ui/Dropdown'
import {fetchAllLocalidades} from '@/services/localidad'
import type {Localidad} from '@/services/types/localidad'
import {
  distinctPaises,
  provinciasByPaisId,
  localidadesByProvinciaId,
  toPaisOptions,
  toProvinciaOptions,
  toLocalidadOptions,
  resolveHierarchyByLocalidadId,
  dedupeLocalidades,
  type DD as DDOpt,
} from '@/services/localidad.utils'

interface LocalidadCascadeProps {
  /** id de localidad seleccionado (controlado por el form padre) */
  localidadId: number | null
  /** se invoca cuando cambia la localidad (en create). En edit normalmente disabled. */
  onChangeLocalidadId: (id: number | null) => void
  /** Deshabilita toda la cascada (útil para edición solo lectura) */
  disabled?: boolean
  /** Error a mostrar para idLocalidad (ej. 'domicilio.idLocalidad') */
  error?: string
}

/**
 * Selector en cascada País > Provincia > Localidad.
 * - Se auto-puebla a partir de `localidadId` cuando hay datos (modo EDIT).
 * - En CREATE, permite seleccionar y notifica al padre vía `onChangeLocalidadId`.
 * - Internamente se encarga de hacer fetch de todas las localidades.
 */
export default function LocalidadCascade({
  localidadId,
  onChangeLocalidadId,
  disabled = false,
  error,
}: LocalidadCascadeProps) {
  const [allLocalidades, setAllLocalidades] = useState<Localidad[]>([])
  const [pais, setPais] = useState<DDOpt | null>(null)
  const [provincia, setProvincia] = useState<DDOpt | null>(null)
  const [localidadOpt, setLocalidadOpt] = useState<DDOpt | null>(null)

  // Cargar localidades una sola vez
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const data = await fetchAllLocalidades()
        if (!active) return
        setAllLocalidades(dedupeLocalidades(data))
      } catch {
        // fail-open: lista vacía
      }
    })()
    return () => {
      active = false
    }
  }, [])

  // Derivar selección a partir de localidadId cuando ya tenemos localidades
  useEffect(() => {
    if (!allLocalidades.length) return

    if (localidadId != null) {
      const {paisId, provinciaId} = resolveHierarchyByLocalidadId(allLocalidades, localidadId)
      if (!paisId || !provinciaId) return

      const loc = allLocalidades.find(l => l.id === localidadId)
      const paisMatch = allLocalidades.find(l => l.provincia.pais.id === paisId)?.provincia.pais
      const provMatch = allLocalidades.find(l => l.provincia.id === provinciaId)?.provincia

      if (paisMatch) {
        setPais({value: String(paisMatch.id), label: paisMatch.nombre})
      }
      if (provMatch) {
        setProvincia({value: String(provMatch.id), label: provMatch.nombre})
      }
      if (loc) {
        setLocalidadOpt({value: String(loc.id), label: loc.nombre})
      }
      return
    }

    // CREATE: si solo hay un país, lo preseleccionamos
    const paises = distinctPaises(allLocalidades)
    if (paises.length === 1) {
      const p = paises[0]
      setPais({value: String(p.id), label: p.nombre})
    }
  }, [allLocalidades, localidadId])

  // Opciones derivadas
  const paisOptions = useMemo(() => toPaisOptions(distinctPaises(allLocalidades)), [allLocalidades])
  const provinciaOptions = useMemo(
    () => toProvinciaOptions(provinciasByPaisId(allLocalidades, pais ? Number(pais.value) : null)),
    [allLocalidades, pais]
  )
  const localidadOptions = useMemo(
    () =>
      toLocalidadOptions(
        localidadesByProvinciaId(allLocalidades, provincia ? Number(provincia.value) : null)
      ),
    [allLocalidades, provincia]
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Dropdown
        label="País"
        options={paisOptions}
        value={pais}
        onChange={v => {
          if (disabled) return
          const next = v as DDOpt | null
          setPais(next)
          setProvincia(null)
          setLocalidadOpt(null)
          onChangeLocalidadId(null)
        }}
        placeholder="Selecciona un país"
        disabled={disabled}
      />
      <Dropdown
        label="Provincia"
        options={provinciaOptions}
        value={provincia}
        onChange={v => {
          if (disabled) return
          const next = v as DDOpt | null
          setProvincia(next)
          setLocalidadOpt(null)
          onChangeLocalidadId(null)
        }}
        placeholder="Selecciona una provincia"
        disabled={disabled || !pais}
      />
      <Dropdown
        label="Localidad"
        options={localidadOptions}
        value={localidadOpt}
        onChange={v => {
          if (disabled) return
          const next = v as DDOpt | null
          setLocalidadOpt(next)
          onChangeLocalidadId(next ? Number(next.value) : null)
        }}
        placeholder="Selecciona una localidad"
        disabled={disabled || !provincia}
        error={error}
      />
    </div>
  )
}
