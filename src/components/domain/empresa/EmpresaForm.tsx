'use client'

import {useEffect, useState} from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import ImageDropzone from '@/components/ui/ImageDropzone'
import {Empresa} from '@/services/types'
import {createEmpresa, updateEmpresa} from '@/services/empresa'
import useDialog from '@/hooks/useDialog'
import {z} from 'zod'

interface EmpresaFormProps {
  initialData?: Empresa
  onSuccess?: () => void
  onCancel?: () => void
  dialogName?: string
}

const empresaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  razonSocial: z.string().min(1, 'La razón social es obligatoria'),
  cuil: z
    .string()
    .min(1, 'El CUIL es obligatorio')
    .regex(/^\d+$/, 'El CUIL debe contener solo números'),
})

export default function EmpresaForm({
  initialData,
  onSuccess,
  onCancel,
  dialogName,
}: EmpresaFormProps) {
  const {closeDialog} = useDialog()

  const [nombre, setNombre] = useState(initialData?.nombre || '')
  const [razonSocial, setRazonSocial] = useState(initialData?.razonSocial || '')
  const [cuil, setCuil] = useState(initialData?.cuil?.toString() || '')
  const [loading, setLoading] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const [imagen, setImagen] = useState<File | null>(null)

  const isEdit = !!initialData

  const handleSubmit = async () => {
    setFormErrors({})
    setLoading(true)

    const result = empresaSchema.safeParse({nombre, razonSocial, cuil})

    if (!result.success) {
      const errors: Record<string, string> = {}
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          errors[err.path[0]] = err.message
        }
      })
      setFormErrors(errors)
      setLoading(false)
      return
    }

    try {
      const payload = {
        nombre: result.data.nombre.trim(),
        razonSocial: result.data.razonSocial.trim(),
        cuil: parseInt(result.data.cuil),
      }

      if (isEdit) {
        await updateEmpresa(initialData.id, payload)
      } else {
        await createEmpresa(payload)
        setNombre('')
        setRazonSocial('')
        setCuil('')
      }

      onSuccess?.()
      if (dialogName) closeDialog(dialogName)
    } catch (err: any) {
      setFormErrors({general: err.message || 'Error al guardar la empresa'})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setNombre(initialData?.nombre || '')
    setRazonSocial(initialData?.razonSocial || '')
    setCuil(initialData?.cuil?.toString() || '')
    setFormErrors({})
  }, [initialData])

  return (
    <div className="flex flex-col gap-6">
      {/* Sección principal con imagen + inputs */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Imagen */}
        <div className="w-full md:w-1/2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Logo de la empresa</label>
          <ImageDropzone onFileAccepted={setImagen} />
        </div>

        {/* Campos del formulario */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <Input
            label="Nombre"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            error={formErrors.nombre}
          />
          <Input
            label="Razón social"
            value={razonSocial}
            onChange={e => setRazonSocial(e.target.value)}
            error={formErrors.razonSocial}
          />
          <Input
            label="CUIL"
            type="number"
            inputMode="numeric"
            value={cuil}
            onChange={e => setCuil(e.target.value)}
            error={formErrors.cuil}
          />
        </div>
      </div>

      {/* Errores generales */}
      {formErrors.general && <p className="text-sm text-danger">{formErrors.general}</p>}

      {/* Acciones */}
      <div className="flex justify-end gap-2 mt-2">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button variant="primary" onClick={handleSubmit} loading={loading}>
          {isEdit ? 'Guardar cambios' : 'Crear empresa'}
        </Button>
      </div>
    </div>
  )
}
