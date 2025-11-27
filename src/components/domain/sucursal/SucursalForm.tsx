'use client'

import {useState, useEffect} from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import TimePicker from '@/components/ui/TimePicker'
import Toggle from '@/components/ui/Toggle'
import ImageDropzone from '@/components/ui/ImageDropzone'

import DomicilioFields from '@/components/domain/domicilio/DomicilioFields'

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
  sucursalUpdateSchema,
  SucursalUpdatePayload,
  SucursalCreatePayload,
} from '@/schemas/sucursalSchema'

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
  const [imagen, setImagen] = useState<File | null>(null)
  const [horarioApertura, setHorarioApertura] = useState(initialData?.horarioApertura ?? '')
  const [horarioCierre, setHorarioCierre] = useState(initialData?.horarioCierre ?? '')
  const [esCasaMatriz, setEsCasaMatriz] = useState(initialData?.esCasaMatriz ?? false)

  // Domicilio
  const [calle, setCalle] = useState(initialData?.domicilio.calle ?? '')
  const [numero, setNumero] = useState<number | ''>(initialData?.domicilio.numero ?? '')
  const [cp, setCp] = useState<number | ''>(initialData?.domicilio.cp ?? '')
  const [localidadId, setLocalidadId] = useState<number | null>(() => {
    const anyDom = initialData?.domicilio as any
    const fromNested = anyDom?.localidad?.id
    const fromFlat = anyDom?.idLocalidad
    return fromNested ?? fromFlat ?? null
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // ── reset on edit change ────────────────────────────────────────────────
  useEffect(() => {
    setNombre(initialData?.nombre ?? '')
    setHorarioApertura(initialData?.horarioApertura ?? '')
    setHorarioCierre(initialData?.horarioCierre ?? '')
    setEsCasaMatriz(initialData?.esCasaMatriz ?? false)
    setCalle(initialData?.domicilio.calle ?? '')
    setNumero(initialData?.domicilio.numero ?? '')
    setCp(initialData?.domicilio.cp ?? '')

    const anyDom = initialData?.domicilio as any
    const fromNested = anyDom?.localidad?.id
    const fromFlat = anyDom?.idLocalidad
    setLocalidadId(fromNested ?? fromFlat ?? null)

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
      : {...domicilioBase, idLocalidad: localidadId != null ? localidadId : (null as any)}

    const raw = {
      nombre: nombre.trim(),
      horarioApertura,
      horarioCierre,
      esCasaMatriz,
      domicilio,
      idEmpresa: empresaId,
    }

    // EDIT
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

    // CREATE
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
      await (imagen ? createSucursalWithImage(result.data, imagen) : createSucursal(result.data))

      // reset all fields
      setNombre('')
      setHorarioApertura('')
      setHorarioCierre('')
      setEsCasaMatriz(false)
      setCalle('')
      setNumero('')
      setCp('')
      setLocalidadId(null)
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

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      {/* Encabezado: Imagen + campos principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Col 1: Imagen compacta */}
        <ImageDropzone
          label="Imagen (opcional)"
          previewUrl={initialData?.imagenUrl ?? null}
          hint="Recomendado SVG/JPG/PNG/WebP..."
          onFileAccepted={file => setImagen(file)}
          className="max-w-xs aspect-[4/3] max-h-56 md:max-h-60"
        />

        {/* Col 2–3: Detalles: Nombre + horarios */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-1 gap-4">
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
      </div>

      {/* Domicilio section header */}
      <h2 className="text-lg font-semibold">Domicilio</h2>

      <DomicilioFields
        calle={calle}
        numero={numero}
        cp={cp}
        localidadId={localidadId}
        onChangeCalle={setCalle}
        onChangeNumero={setNumero}
        onChangeCp={setCp}
        onChangeLocalidadId={setLocalidadId}
        disableLocalidad={isEdit}
        errors={{
          calle: formErrors['domicilio.calle'],
          numero: formErrors['domicilio.numero'],
          cp: formErrors['domicilio.cp'],
          idLocalidad: formErrors['domicilio.idLocalidad'],
        }}
      />

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
