'use client'

import {useState, useEffect, useMemo} from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import TimePicker from '@/components/ui/TimePicker'
import Dropdown from '@/components/ui/Dropdown'
import Toggle from '@/components/ui/Toggle'
import useDialog from '@/hooks/useDialog'
import {
  createSucursal,
  createSucursalWithImage,
  updateSucursal,
  updateSucursalWithImage,
} from '@/services/sucursal'
import {Sucursal} from '@/services/types'
import {
  sucursalSchema,
  SucursalPayload,
  sucursalUpdateSchema,
  SucursalUpdatePayload,
  SucursalCreatePayload,
} from '@/schemas/sucursalSchema'
import {fetchAllLocalidades} from '@/services/localidad'
import {
  distinctPaises,
  resolveHierarchyByLocalidadId,
  DD as DDOpt,
  toPaisOptions,
  toProvinciaOptions,
  provinciasByPaisId,
  toLocalidadOptions,
  localidadesByProvinciaId,
  dedupeLocalidades,
} from '@/services/localidad.utils'
import ImageDropzone from '@/components/ui/ImageDropzone'

interface SucursalFormProps {
  initialData?: Sucursal
  empresaId: number
  onSuccess?: () => void
  onCancel?: () => void
  dialogName?: string
}

export default function SucursalForm({
  initialData,
  empresaId,
  onSuccess,
  onCancel,
  dialogName,
}: SucursalFormProps) {
  const {closeDialog} = useDialog()
  const isEdit = Boolean(initialData)

  // ── form fields ─────────────────────────────────────────────────────────
  const [nombre, setNombre] = useState(initialData?.nombre ?? '')
  const [horarioApertura, setHorarioApertura] = useState(initialData?.horarioApertura ?? '')
  const [horarioCierre, setHorarioCierre] = useState(initialData?.horarioCierre ?? '')
  const [esCasaMatriz, setEsCasaMatriz] = useState(initialData?.esCasaMatriz ?? false)

  const [calle, setCalle] = useState(initialData?.domicilio.calle ?? '')
  const [numero, setNumero] = useState<number | ''>(initialData?.domicilio.numero ?? '')
  const [cp, setCp] = useState<number | ''>(initialData?.domicilio.cp ?? '')

  // País > Provincia > Localidad (cascading)
  const [allLocalidades, setAllLocalidades] = useState<
    import('@/services/types/localidad').Localidad[]
  >([])
  const [pais, setPais] = useState<DDOpt | null>(null)
  const [provincia, setProvincia] = useState<DDOpt | null>(null)
  const [localidad, setLocalidad] = useState<DDOpt | null>(null)

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const [imagen, setImagen] = useState<File | null>(null)

  // Load localidades and (re)derive cascades (also when switching record)
  // TODO: Fix poblar provincia y localidad cuando la API lo guarde en la base de datos
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const data = await fetchAllLocalidades()
        if (!active) return
        const clean = dedupeLocalidades(data)
        setAllLocalidades(clean)
        // Derive selection from current record if EDIT, otherwise set sensible defaults
        const existingIdLoc =
          // prefer nested object from GET /sucursales/:id
          (initialData?.domicilio as any)?.localidad?.id ??
          // fallback in case some callers still provide the id flat
          (initialData?.domicilio as any)?.idLocalidad ??
          null
        if (existingIdLoc) {
          const {paisId, provinciaId} = resolveHierarchyByLocalidadId(clean, existingIdLoc)
          if (paisId) {
            const pMatch = clean.find(l => l.provincia.pais.id === paisId)!.provincia.pais
            setPais({value: String(pMatch.id), label: pMatch.nombre})
          }
          if (provinciaId) {
            const prMatch = clean.find(l => l.provincia.id === provinciaId)!.provincia
            setProvincia({value: String(prMatch.id), label: prMatch.nombre})
          }
          const loc = clean.find(l => l.id === existingIdLoc)
          if (loc) setLocalidad({value: String(loc.id), label: loc.nombre})
        } else {
          // CREATE default: if only one country (Argentina), preselect it
          const paises = distinctPaises(clean)
          if (paises.length === 1) {
            const p = paises[0]
            setPais({value: String(p.id), label: p.nombre})
          }
        }
      } catch {
        // fail-open with empty lists
      }
    })()
    return () => {
      active = false
    }
  }, [initialData?.domicilio.idLocalidad])

  // ── reset on edit change ────────────────────────────────────────────────
  useEffect(() => {
    setNombre(initialData?.nombre ?? '')
    setHorarioApertura(initialData?.horarioApertura ?? '')
    setHorarioCierre(initialData?.horarioCierre ?? '')
    setEsCasaMatriz(initialData?.esCasaMatriz ?? false)
    setCalle(initialData?.domicilio.calle ?? '')
    setNumero(initialData?.domicilio.numero ?? '')
    setCp(initialData?.domicilio.cp ?? '')

    setFormErrors({})
    setImagen(null)
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors({})
    setLoading(true)

    const domicilioBase = {
      calle: calle.trim(),
      numero: Number(numero),
      cp: Number(cp),
    }
    const domicilio = isEdit
      ? domicilioBase // omit idLocalidad on EDIT
      : {...domicilioBase, idLocalidad: localidad ? Number(localidad.value) : (null as any)}

    const raw = {
      nombre: nombre.trim(),
      horarioApertura,
      horarioCierre,
      esCasaMatriz,
      domicilio,
      idEmpresa: empresaId,
    }

    // Parse per-branch so TS narrows payload correctly
    if (isEdit) {
      const result = sucursalUpdateSchema.safeParse(raw as SucursalUpdatePayload)
      if (!result.success) {
        const errs: Record<string, string> = {}
        result.error.errors.forEach(e => {
          errs[e.path.join('.')] = e.message
        })
        setFormErrors(errs)
        setLoading(false)
        return
      }
      try {
        if (initialData) {
          if (imagen) {
            await updateSucursalWithImage(initialData.id, result.data, imagen)
          } else {
            await updateSucursal(initialData.id, result.data)
          }
        }
        onSuccess?.()
        if (dialogName) closeDialog(dialogName)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error al guardar la sucursal'
        setFormErrors({general: message})
      } finally {
        setLoading(false)
      }
      return
    }

    const result = sucursalSchema.safeParse(raw as SucursalCreatePayload)
    if (!result.success) {
      const errs: Record<string, string> = {}
      result.error.errors.forEach(e => {
        errs[e.path.join('.')] = e.message
      })
      setFormErrors(errs)
      setLoading(false)
      return
    }

    try {
      // CREATE branch
      const created = imagen
        ? await createSucursalWithImage(result.data, imagen)
        : await createSucursal(result.data)
      // reset all fields
      setNombre('')
      setHorarioApertura('')
      setHorarioCierre('')
      setEsCasaMatriz(false)
      setCalle('')
      setNumero('')
      setCp('')
      setPais(null)
      setProvincia(null)
      setLocalidad(null)
      setImagen(null)

      onSuccess?.()
      if (dialogName) closeDialog(dialogName)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar la sucursal'
      setFormErrors({general: message})
    } finally {
      setLoading(false)
    }
  }

  // ---------- Derived dropdown options/state ----------
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

  const provinciaDisabled = isEdit || !pais
  const localidadDisabled = isEdit || !provincia

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      {/* Imagen (compacta) */}
      <div>
        <label className="mb-1 block text-sm font-medium text-text">Imagen (opcional)</label>
        <ImageDropzone
          previewUrl={initialData?.imagenUrl ?? null}
          onFileAccepted={file => setImagen(file)}
          className="max-w-xs aspect-[4/3] max-h-56 md:max-h-60"
        />
        <p className="mt-1 text-xs text-muted">Recomendado JPG/PNG/WebP.</p>
      </div>

      {/* Detalles: Nombre + horarios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Nombre"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          error={formErrors.nombre}
        />
        <TimePicker
          label="Apertura"
          value={horarioApertura}
          onChange={setHorarioApertura}
          error={formErrors.horarioApertura}
        />
        <TimePicker
          label="Cierre"
          value={horarioCierre}
          onChange={setHorarioCierre}
          error={formErrors.horarioCierre}
        />
      </div>

      {/* Domicilio section header */}
      <h2 className="text-lg font-semibold">Domicilio</h2>

      {/* Calle / Número / CP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Calle"
          value={calle}
          onChange={e => setCalle(e.target.value)}
          error={formErrors['domicilio.calle']}
        />
        <Input
          label="Número"
          type="number"
          value={numero?.toString()}
          onChange={e => setNumero(e.target.valueAsNumber)}
          error={formErrors['domicilio.numero']}
        />
        <Input
          label="Código postal"
          type="number"
          value={cp?.toString()}
          onChange={e => setCp(e.target.valueAsNumber)}
          error={formErrors['domicilio.cp']}
        />
      </div>

      {/* País > Provincia > Localidad */}
      {!isEdit && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Dropdown
            label="País"
            options={paisOptions}
            value={pais}
            onChange={v => {
              const next = v as DDOpt | null
              setPais(next)
              setProvincia(null)
              setLocalidad(null)
            }}
            placeholder="Selecciona un país"
          />
          <Dropdown
            label="Provincia"
            options={provinciaOptions}
            value={provincia}
            onChange={v => {
              const next = v as DDOpt | null
              setProvincia(next)
              setLocalidad(null)
            }}
            placeholder="Selecciona una provincia"
            disabled={!pais}
          />
          <Dropdown
            label="Localidad"
            options={localidadOptions}
            value={localidad}
            onChange={v => setLocalidad(v as DDOpt | null)}
            placeholder="Selecciona una localidad"
            disabled={!provincia}
            error={formErrors['domicilio.idLocalidad']}
          />
        </div>
      )}

      {/* Casa matriz toggle*/}
      <div className="flex">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Toggle checked={esCasaMatriz} onChange={setEsCasaMatriz} />
          Casa matriz
        </label>
      </div>

      {formErrors.general && <p className="text-sm text-danger">{formErrors.general}</p>}

      <div className="flex justify-end gap-2 mt-2">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" variant="primary" loading={loading}>
          {isEdit ? 'Guardar cambios' : 'Crear sucursal'}
        </Button>
      </div>
    </form>
  )
}
