'use client'

import {useEffect, useMemo, useState} from 'react'
import Input from '@/components/ui/Input'
import Toggle from '@/components/ui/Toggle'
import Dropdown from '@/components/ui/Dropdown'
import Button from '@/components/ui/Button'
import MultiSelectCheckbox from '@/components/ui/MultiSelectCheckbox'
import useDialog from '@/hooks/useDialog'
import {createCategoria, fetchAllCategorias} from '@/services/categoria'
import {buildCategoriaTree, flattenCategoriaTree} from '@/services/categoria.utils'
import {fetchAllSucursales} from '@/services/sucursal'
import {Sucursal} from '@/services/types'
import {categoriaCreateSchema, CategoriaCreateInput} from '@/schemas/categoriaSchema'

type DDOption = {value: string; label: string}

interface CategoriaFormProps {
  empresaId: number
  sucursalId: number
  onSuccess?: () => void
  dialogName?: string
}

export default function CategoriaForm({
  empresaId,
  sucursalId,
  onSuccess,
  dialogName,
}: CategoriaFormProps) {
  const {closeDialog} = useDialog()

  // ── form state ───────────────────────────────────────────────────────────
  const [denominacion, setDenominacion] = useState('')
  const [esInsumo, setEsInsumo] = useState(false)
  const [idCategoriaPadre, setIdCategoriaPadre] = useState<number | null>(null)
  const [idSucursales, setIdSucursales] = useState<number[]>([sucursalId]) // preselect current

  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [parentOptions, setParentOptions] = useState<DDOption[]>([])
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // Load empresa's sucursales
  useEffect(() => {
    ;(async () => {
      const all = await fetchAllSucursales()
      setSucursales(all.filter(s => s.empresa.id === empresaId))
    })()
  }, [empresaId])

  // Build parent options scoped to any chosen sucursal(s)
  useEffect(() => {
    ;(async () => {
      const cats = await fetchAllCategorias()
      const scoped = cats.filter(c => c.sucursales?.some(s => idSucursales.includes(s.id)))
      const tree = buildCategoriaTree(scoped)
      const flat = flattenCategoriaTree(tree)
      setParentOptions(flat.map(f => ({label: f.label, value: String(f.id)})))
      // If current parent is no longer valid, clear it
      if (idCategoriaPadre && !flat.some(f => f.id === idCategoriaPadre)) {
        setIdCategoriaPadre(null)
      }
    })()
  }, [idSucursales, idCategoriaPadre])

  const sucursalOptions = useMemo(
    () => sucursales.map(s => ({label: s.nombre, value: s.id})),
    [sucursales]
  )

  // Compute Dropdown controlled value (expects string-valued option or null)
  const parentValue: DDOption | null = useMemo(() => {
    if (idCategoriaPadre == null) return null
    const found = parentOptions.find(o => Number(o.value) === idCategoriaPadre)
    return found ? found : {value: String(idCategoriaPadre), label: String(idCategoriaPadre)}
  }, [idCategoriaPadre, parentOptions])

  // ── submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setFormErrors({})
    setLoading(true)

    const raw: CategoriaCreateInput = {
      denominacion: denominacion.trim(),
      esInsumo,
      idCategoriaPadre: idCategoriaPadre ?? undefined,
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
      setIdCategoriaPadre(null)
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
            <Toggle checked={esInsumo} onChange={setEsInsumo} />
            Es insumo
          </label>
        </div>
      </div>

      <Dropdown<DDOption>
        options={parentOptions}
        value={parentValue}
        onChange={(opt: DDOption) => setIdCategoriaPadre(Number(opt.value))}
        placeholder="Categoría padre (opcional)"
      />

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
