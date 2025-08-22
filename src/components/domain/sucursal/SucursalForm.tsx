'use client'

import {useState, useEffect} from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import TimePicker from '@/components/ui/TimePicker'
import Dropdown from '@/components/ui/Dropdown'
import Toggle from '@/components/ui/Toggle'
import useDialog from '@/hooks/useDialog'
import {createSucursal, updateSucursal} from '@/services/sucursal'
import {Sucursal} from '@/services/types'
import {sucursalSchema, SucursalInput} from '@/schemas/sucursalSchema'

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

  // TODO: Implement País > Provincia > Localidad logic and uncomment.
  //   const [idLocalidad, setIdLocalidad] = useState<number | null>(
  //     initialData?.domicilio.idLocalidad ?? null
  //   )

  // TEMP. TODO: Delete
  const [idLocalidad, setIdLocalidad] = useState<number>(initialData?.domicilio.idLocalidad ?? 158)

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

    // TODO: Implement País > Provincia > Localidad logic and uncomment.
    // setIdLocalidad(initialData?.domicilio.idLocalidad ?? null)

    // TEMP. TODO: Delete
    setIdLocalidad(initialData?.domicilio.idLocalidad ?? 158)

    setFormErrors({})
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors({})
    setLoading(true)

    const raw = {
      nombre: nombre.trim(),
      horarioApertura,
      horarioCierre,
      esCasaMatriz,
      domicilio: {
        calle: calle.trim(),
        numero: Number(numero),
        cp: Number(cp),
        // idLocalidad: idLocalidad!,
        idLocalidad, // always 158 for now
      },
      idEmpresa: empresaId,
    }

    // TEMP. TODO: Delete
    console.log('[SucursalForm] Submitting payload →', raw)

    const result = sucursalSchema.safeParse(raw as SucursalInput)
    if (!result.success) {
      const errs: Record<string, string> = {}
      result.error.errors.forEach(e => {
        errs[e.path.join('.')] = e.message
      })
      setFormErrors(errs)
      setLoading(false)
      return
    }

    // TODO: Implement País > Provincia > Localidad logic and uncomment.
    // try {
    //   if (isEdit && initialData) {
    //     await updateSucursal(initialData.id, result.data)
    //   } else {
    //     await createSucursal(result.data)
    //     // reset all fields
    //     setNombre('')
    //     setHorarioApertura('')
    //     setHorarioCierre('')
    //     setEsCasaMatriz(false)
    //     setCalle('')
    //     setNumero('')
    //     setCp('')
    //     setIdLocalidad(null)
    //   }
    //   onSuccess?.()
    //   dialogName && closeDialog(dialogName)
    // } catch (err: any) {
    //   setFormErrors({general: err.message})
    // } finally {
    //   setLoading(false)
    // }

    // TEMP. TODO: Delete
    try {
      if (isEdit && initialData) {
        console.log('[SucursalForm] Updating sucursal id:', initialData.id, 'payload:', result.data)
        const updated = await updateSucursal(initialData.id, result.data)
        console.log('[SucursalForm] updateSucursal response →', updated)
      } else {
        console.log(
          '[SucursalForm] Creating sucursal for empresa:',
          empresaId,
          'payload:',
          result.data
        )
        const created = await createSucursal(result.data)
        console.log('[SucursalForm] createSucursal response →', created)
        // reset all fields
        setNombre('')
        setHorarioApertura('')
        setHorarioCierre('')
        setEsCasaMatriz(false)
        setCalle('')
        setNumero('')
        setCp('')
        setIdLocalidad(158)
      }

      onSuccess?.()
      if (dialogName) closeDialog(dialogName)
    } catch (err: unknown) {
      console.log('[SucursalForm] Error →', err)
      const message = err instanceof Error ? err.message : 'Error al guardar la sucursal'
      setFormErrors({general: message})
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
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

      {/* País / Provincia / Localidad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Dropdown options={[]} value={null} onChange={() => {}} placeholder="País" disabled />
        <Dropdown options={[]} value={null} onChange={() => {}} placeholder="Provincia" disabled />
        <Dropdown options={[]} value={null} onChange={() => {}} placeholder="Localidad" disabled />
      </div>

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
