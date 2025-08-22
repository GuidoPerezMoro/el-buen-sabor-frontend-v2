'use client'

import {useEffect, useState} from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import ImageDropzone from '@/components/ui/ImageDropzone'
import {Empresa} from '@/services/types'
import {
  createEmpresa,
  createEmpresaWithImage,
  updateEmpresa,
  updateEmpresaWithImage,
} from '@/services/empresa'
import useDialog from '@/hooks/useDialog'
import {empresaSchema, type EmpresaInput} from '@/schemas/empresaSchema'

interface EmpresaFormProps {
  initialData?: Empresa
  onSuccess?: () => void
  onCancel?: () => void
  dialogName?: string
}

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
      const payload: EmpresaInput = {
        nombre: result.data.nombre.trim(),
        razonSocial: result.data.razonSocial.trim(),
        cuil: result.data.cuil,
      }

      if (isEdit && initialData) {
        if (imagen) {
          console.log('[EmpresaForm] Updating empresa WITH new image:', initialData.id)
          await updateEmpresaWithImage(initialData.id, payload, imagen)
        } else {
          console.log('[EmpresaForm] Updating empresa WITHOUT image:', initialData.id)
          await updateEmpresa(initialData.id, payload)
        }
      } else {
        if (imagen) {
          console.log('[EmpresaForm] Creating empresa WITH image:', imagen)
          await createEmpresaWithImage(payload, imagen)
        } else {
          console.log('[EmpresaForm] Creating empresa WITHOUT image, payload:', payload)
          await createEmpresa(payload)
        }
        // reset fields
        setNombre('')
        setRazonSocial('')
        setCuil('')
        setImagen(null)
      }

      onSuccess?.()
      if (dialogName) closeDialog(dialogName)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar la empresa'
      setFormErrors({general: message})
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
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      {/* Sección principal con imagen + inputs */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Imagen */}
        <div className="w-full md:w-1/2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Logo de la empresa</label>
          <ImageDropzone onFileAccepted={setImagen} previewUrl={initialData?.imagenUrl ?? null} />
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
        <Button type="submit" variant="primary" loading={loading}>
          {isEdit ? 'Guardar cambios' : 'Crear empresa'}
        </Button>
      </div>
    </form>
  )
}
