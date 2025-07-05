'use client'

import {useEffect, useState} from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import {Empresa} from '@/services/types'
import {createEmpresa, updateEmpresa} from '@/services/empresa'
import useDialog from '@/hooks/useDialog'

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
  const [error, setError] = useState<string | null>(null)

  const isEdit = !!initialData

  const handleSubmit = async () => {
    setError(null)
    setLoading(true)

    try {
      const payload = {
        nombre: nombre.trim(),
        razonSocial: razonSocial.trim(),
        cuil: parseInt(cuil),
      }

      if (isNaN(payload.cuil)) {
        throw new Error('CUIL inválido')
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
      setError(err.message || 'Error al guardar la empresa')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setNombre(initialData?.nombre || '')
    setRazonSocial(initialData?.razonSocial || '')
    setCuil(initialData?.cuil?.toString() || '')
    setError(null)
  }, [initialData])

  return (
    <div className="flex flex-col gap-4 py-2">
      <Input label="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
      <Input
        label="Razón social"
        value={razonSocial}
        onChange={e => setRazonSocial(e.target.value)}
      />
      <Input
        label="CUIL"
        type="number"
        value={cuil}
        onChange={e => setCuil(e.target.value)}
        inputMode="numeric"
      />

      {error && <p className="text-sm text-danger">{error}</p>}

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
