'use client'

import {useState, useEffect} from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import useDialog from '@/hooks/useDialog'
import {createUnidad, updateUnidad} from '@/services/unidadDeMedida'
import {UnidadDeMedida} from '@/services/types/unidadDeMedida'
import {unidadDeMedidaSchema, UnidadDeMedidaInput} from '@/schemas/unidadDeMedidaSchema'

interface UnidadDeMedidaFormProps {
  initialData?: UnidadDeMedida
  onSuccess?: () => void
  onCancel?: () => void
  dialogName?: string
}

export default function UnidadDeMedidaForm({
  initialData,
  onSuccess,
  onCancel,
  dialogName,
}: UnidadDeMedidaFormProps) {
  const {closeDialog} = useDialog()
  const isEdit = Boolean(initialData)

  const [denominacion, setDenominacion] = useState(initialData?.denominacion ?? '')
  const [loading, setLoading] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setDenominacion(initialData?.denominacion ?? '')
    setFormErrors({})
  }, [initialData])

  const handleSubmit = async () => {
    setFormErrors({})
    setLoading(true)

    const result = unidadDeMedidaSchema.safeParse({denominacion})
    if (!result.success) {
      const errs: Record<string, string> = {}
      result.error.errors.forEach(e => {
        errs[e.path[0]] = e.message
      })
      setFormErrors(errs)
      setLoading(false)
      return
    }

    try {
      if (isEdit && initialData) {
        console.log('[Unidad] Updating id:', initialData.id, 'payload:', result.data)
        await updateUnidad(initialData.id, result.data as Partial<UnidadDeMedidaInput>)
      } else {
        console.log('[Unidad] Creating payload:', result.data)
        await createUnidad(result.data)
      }

      onSuccess?.()
      if (dialogName) closeDialog(dialogName)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar unidad'
      setFormErrors({general: message})
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="flex flex-col gap-4 p-4" onSubmit={handleSubmit}>
      <Input
        label="Denominación"
        value={denominacion}
        onChange={e => setDenominacion(e.target.value)}
        error={formErrors.denominacion}
      />

      {formErrors.general && <p className="text-sm text-danger">{formErrors.general}</p>}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" variant="primary" loading={loading}>
          {isEdit ? 'Guardar cambios' : 'Crear unidad'}
        </Button>
      </div>
    </form>
  )
}
