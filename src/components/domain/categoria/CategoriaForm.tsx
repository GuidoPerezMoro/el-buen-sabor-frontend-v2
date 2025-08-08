'use client'

import {useEffect, useMemo, useState} from 'react'
import Input from '@/components/ui/Input'
import Toggle from '@/components/ui/Toggle'
import Dropdown from '@/components/ui/Dropdown'
import Button from '@/components/ui/Button'
import MultiSelectCheckbox from '@/components/ui/MultiSelectCheckbox'
import useDialog from '@/hooks/useDialog'
import {createCategoria} from '@/services/categoria'
import {fetchAllSucursales} from '@/services/sucursal'
import {Sucursal} from '@/services/types'
import {categoriaCreateSchema, CategoriaCreateInput} from '@/schemas/categoriaSchema'

type DDOption = {value: string; label: string}

interface CategoriaFormProps {
  empresaId: number
  sucursalId: number
  parentId?: number | null
  parentEsInsumo?: boolean
  onSuccess?: () => void
  dialogName?: string
}

export default function CategoriaForm({
  empresaId,
  sucursalId,
  parentId,
  parentEsInsumo,
  onSuccess,
  dialogName,
}: CategoriaFormProps) {
  const {closeDialog} = useDialog()

  // ── form state ───────────────────────────────────────────────────────────
  const [denominacion, setDenominacion] = useState('')
  const [esInsumo, setEsInsumo] = useState(parentId != null ? !!parentEsInsumo : false)
  const [idSucursales, setIdSucursales] = useState<number[]>([sucursalId]) // preselect current
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // react to parent changes
  useEffect(() => {
    if (parentId != null) setEsInsumo(!!parentEsInsumo)
    else setEsInsumo(false) // default for root
  }, [parentId, parentEsInsumo])

  // Load empresa's sucursales
  useEffect(() => {
    ;(async () => {
      const all = await fetchAllSucursales()
      setSucursales(all.filter(s => s.empresa.id === empresaId))
    })()
  }, [empresaId])

  const sucursalOptions = useMemo(
    () => sucursales.map(s => ({label: s.nombre, value: s.id})),
    [sucursales]
  )

  // ── submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setFormErrors({})
    setLoading(true)

    // submit payload: enforce parent’s esInsumo if creating a child
    const resolvedEsInsumo = parentId != null ? !!parentEsInsumo : esInsumo
    const raw: CategoriaCreateInput = {
      denominacion: denominacion.trim(),
      esInsumo: resolvedEsInsumo,
      idCategoriaPadre: parentId ?? undefined,
      idSucursales,
    }

    const parsed = categoriaCreateSchema.safeParse(raw)
    if (!parsed.success) {
      const errs: Record<string, string> = {}
      parsed.error.errors.forEach(e => (errs[e.path.join('.')] = e.message))
      setFormErrors(errs)
      setLoading(false)
      return
    }

    try {
      await createCategoria(parsed.data)
      // reset
      setDenominacion('')
      setEsInsumo(false)
      setIdSucursales([sucursalId])
      onSuccess?.()
      if (dialogName) closeDialog(dialogName)
    } catch (err: any) {
      setFormErrors({general: err?.message ?? 'Error al crear la categoría'})
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Denominación"
          value={denominacion}
          onChange={e => setDenominacion(e.target.value)}
          error={formErrors.denominacion}
        />
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Toggle checked={esInsumo} onChange={setEsInsumo} disabled={!!parentId} />
            Es insumo
          </label>
        </div>
      </div>

      <MultiSelectCheckbox
        label="Sucursales"
        options={sucursalOptions}
        value={idSucursales}
        onChange={setIdSucursales}
        error={formErrors.idSucursales}
      />

      {formErrors.general && <p className="text-sm text-danger">{formErrors.general}</p>}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => dialogName && closeDialog(dialogName)}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          Crear categoría
        </Button>
      </div>
    </form>
  )
}
