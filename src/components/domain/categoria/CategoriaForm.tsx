'use client'

import {useEffect, useMemo, useState} from 'react'
import Input from '@/components/ui/Input'
import Toggle from '@/components/ui/Toggle'
import Button from '@/components/ui/Button'
import MultiSelectCheckbox from '@/components/ui/MultiSelectCheckbox'
import useDialog from '@/hooks/useDialog'
import {
  createCategoria,
  updateCategoria,
  UpdateCategoriaPayload,
  fetchAllCategorias,
} from '@/services/categoria'
import {CategoriaNode} from '@/services/types/categoria'
import {Sucursal} from '@/services/types'
import {fetchAllSucursales} from '@/services/sucursal'
import {categoriaCreateSchema, CategoriaCreatePayload} from '@/schemas/categoriaSchema'

interface CategoriaFormProps {
  empresaId: number
  sucursalId: number
  initialData?: CategoriaNode
  parentId?: number | null
  parentEsInsumo?: boolean
  parentSucursalIds?: ReadonlyArray<number>
  onSuccess?: () => void
  dialogName?: string
}

export default function CategoriaForm({
  empresaId,
  sucursalId,
  initialData,
  parentId,
  parentEsInsumo,
  parentSucursalIds,
  onSuccess,
  dialogName,
}: CategoriaFormProps) {
  const isEdit = !!initialData
  const {closeDialog} = useDialog()

  // ── form state ───────────────────────────────────────────────────────────
  const [denominacion, setDenominacion] = useState(initialData?.denominacion ?? '')
  const [esInsumo, setEsInsumo] = useState(
    isEdit ? !!initialData?.esInsumo : parentId != null ? !!parentEsInsumo : false
  )
  const [lockEsInsumo, setLockEsInsumo] = useState(false)
  const isCreateChild = !isEdit && parentId != null
  const lockByParent = isEdit && !!initialData?.categoriaPadre
  const disableInsumoToggle = lockByParent || lockEsInsumo || !!parentId
  const [idSucursales, setIdSucursales] = useState<number[]>(
    isEdit ? initialData!.sucursales.map(s => s.id) : [sucursalId]
  )
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // Reset when switching record
  useEffect(() => {
    if (!isEdit) return
    setDenominacion(initialData?.denominacion ?? '')
    setEsInsumo(!!initialData?.esInsumo)
    setIdSucursales(initialData?.sucursales.map(s => s.id) ?? [])
    setFormErrors({})
  }, [isEdit, initialData])

  // React to parent changes (CREATE only). Avoid clobbering value in EDIT mode.
  useEffect(() => {
    if (isEdit) return
    if (parentId != null) setEsInsumo(!!parentEsInsumo)
    else setEsInsumo(false) // default for root
  }, [isEdit, parentId, parentEsInsumo])

  // Load empresa's sucursales
  useEffect(() => {
    let active = true
    ;(async () => {
      const all = await fetchAllSucursales()
      if (!active) return
      setSucursales(all.filter(s => s.empresa.id === empresaId))
    })()
    return () => {
      active = false
    }
  }, [empresaId])

  // Lock "esInsumo" on EDIT iff this category has children anywhere
  useEffect(() => {
    if (!isEdit || !initialData?.id) return
    let active = true
    ;(async () => {
      try {
        const all = await fetchAllCategorias()
        if (!active) return
        const hasChildren = all.some(c => c.categoriaPadre?.id === initialData.id)
        setLockEsInsumo(hasChildren)
      } catch {
        if (active) setLockEsInsumo(false) // fail-open
      }
    })()
    return () => {
      active = false
    }
  }, [isEdit, initialData?.id])

  // Allowed sucursales: only constrain on CREATE with parent
  const allowedSucursalIds = useMemo(() => {
    if (isEdit) return null
    return parentId != null && Array.isArray(parentSucursalIds) ? new Set(parentSucursalIds) : null
  }, [isEdit, parentId, parentSucursalIds])

  const sucursalOptions = useMemo(() => {
    const base = sucursales
      .map(s => ({label: s.nombre, value: s.id}))
      .sort((a, b) => a.label.localeCompare(b.label))
    return allowedSucursalIds ? base.filter(opt => allowedSucursalIds.has(opt.value)) : base
  }, [sucursales, allowedSucursalIds])

  // Ensure selection is valid given parent's constraint and prefer current sucursal if allowed
  useEffect(() => {
    if (!sucursales.length) return
    if (!isEdit && allowedSucursalIds) {
      const filtered = idSucursales.filter(id => allowedSucursalIds.has(id))
      let next = filtered
      if (next.length === 0) {
        // Prefer current sucursal if parent has it; otherwise first allowed
        if (sucursalId && allowedSucursalIds.has(sucursalId)) next = [sucursalId]
        else next = sucursalOptions[0] ? [sucursalOptions[0].value] : []
      }
      setIdSucursales(next)
    } else {
      // Root creation → ensure at least current sucursal selected (CREATE only)
      if (!isEdit && !idSucursales.includes(sucursalId)) setIdSucursales([sucursalId])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, allowedSucursalIds, sucursales, sucursalId])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setFormErrors({})
    setLoading(true)

    try {
      if (isEdit && initialData) {
        const payload: UpdateCategoriaPayload = {
          denominacion: denominacion.trim(),
          ...(disableInsumoToggle ? {} : {esInsumo}),
        }
        await updateCategoria(initialData.id, payload)
      } else {
        const resolvedEsInsumo = parentId != null ? !!parentEsInsumo : esInsumo
        const raw: CategoriaCreatePayload = {
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
          return
        }
        await createCategoria(parsed.data)
        // reset fields after create
        setDenominacion('')
        setEsInsumo(parentId != null ? !!parentEsInsumo : false)
        setIdSucursales([sucursalId])
      }
      onSuccess?.()
      if (dialogName) closeDialog(dialogName)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar la categoría'
      setFormErrors({general: message})
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
        <div className="flex items-center md:pt-6">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Toggle checked={esInsumo} onChange={setEsInsumo} disabled={disableInsumoToggle} />
            <span>Es insumo</span>
            {(isCreateChild || lockByParent) && (
              <span className="text-xs text-muted ml-2 whitespace-nowrap">
                (hereda de la categoría padre)
              </span>
            )}
            {!lockByParent && lockEsInsumo && (
              <span className="text-xs text-muted ml-2 whitespace-nowrap">
                (no se puede cambiar: tiene subcategorías)
              </span>
            )}
          </label>
        </div>
      </div>

      <MultiSelectCheckbox
        label="Sucursales"
        options={sucursalOptions}
        value={idSucursales}
        onChange={setIdSucursales}
        error={formErrors.idSucursales}
        disabled={isEdit}
      />
      {parentId != null && (
        <p className="text-xs text-muted -mt-2">
          Solo puedes elegir sucursales donde la categoría padre ya existe.
        </p>
      )}

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
          {isEdit ? 'Guardar cambios' : 'Crear categoría'}
        </Button>
      </div>
    </form>
  )
}
