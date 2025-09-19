'use client'

import {useEffect, useMemo, useState} from 'react'
import Input from '@/components/ui/Input'
import Dropdown from '@/components/ui/Dropdown'
import Button from '@/components/ui/Button'
import ImageDropzone from '@/components/ui/ImageDropzone'
import useDialog from '@/hooks/useDialog'
import {ArticuloManufacturado} from '@/services/types/articuloManufacturado'
import {ArticuloInsumo} from '@/services/types/articuloInsumo'
import {fetchAllCategorias} from '@/services/categoria'
import {fetchAllArticuloInsumos} from '@/services/articuloInsumo'
import {
  buildCategoriaTree,
  filterCategoriasBySucursalId,
  flattenCategoriaTree,
} from '@/services/categoria.utils'
import {
  articuloManufacturadoCreateSchema,
  articuloManufacturadoUpdateSchema,
} from '@/schemas/articuloManufacturadoSchema'
import {
  createArticuloManufacturado,
  createArticuloManufacturadoWithImage,
  updateArticuloManufacturado,
  updateArticuloManufacturadoWithImage,
} from '@/services/articuloManufacturado'
import {filterArticuloInsumosBySucursalId} from '@/services/articuloInsumo.utils'

type DDOpt = {value: string; label: string}

interface Props {
  sucursalId: number
  initialData?: ArticuloManufacturado
  onSuccess?: () => void
  dialogName?: string
}

type DetalleRow = {idArticuloInsumo: number; cantidad: number}

export default function ArticuloManufacturadoForm({
  sucursalId,
  initialData,
  onSuccess,
  dialogName,
}: Props) {
  const isEdit = !!initialData
  const {closeDialog} = useDialog()

  // ── fields ───────────────────────────────────────────────────────────────
  const [denominacion, setDenominacion] = useState(initialData?.denominacion ?? '')
  const [precioVenta, setPrecioVenta] = useState<string>(
    initialData?.precioVenta != null ? String(initialData.precioVenta) : ''
  )
  const [descripcion, setDescripcion] = useState<string>(initialData?.descripcion ?? '')
  const [tiempoMin, setTiempoMin] = useState<number | ''>(initialData?.tiempoEstimadoMinutos ?? '')
  const [preparacion, setPreparacion] = useState<string>(initialData?.preparacion ?? '')
  const [imagen, setImagen] = useState<File | null>(null)

  const [categoriaOpt, setCategoriaOpt] = useState<DDOpt | null>(
    initialData
      ? {value: String(initialData.categoria.id), label: initialData.categoria.denominacion}
      : null
  )

  // For the add row
  const [addCatOpt, setAddCatOpt] = useState<DDOpt | null>(null)
  const [addInsumoOpt, setAddInsumoOpt] = useState<DDOpt | null>(null)

  // Build a little index from your existing list of insumos for this sucursal,
  // so we can know unidad and categoría of each insumo.
  const [insumos, setInsumos] = useState<ArticuloInsumo[]>([])

  useEffect(() => {
    ;(async () => {
      const all = await fetchAllArticuloInsumos()
      setInsumos(filterArticuloInsumosBySucursalId(all, sucursalId))
    })()
  }, [sucursalId])

  const insumoMetaById = useMemo(() => {
    const m: Record<number, {categoriaId: number; categoriaLabel: string; unidadLabel: string}> = {}
    for (const it of insumos) {
      m[it.id] = {
        categoriaId: it.categoria.id,
        categoriaLabel: it.categoria.denominacion,
        unidadLabel: it.unidadDeMedida?.denominacion ?? '—',
      }
    }
    return m
  }, [insumos])

  // Options for insumo selector (full list)
  const allInsumoOptions: DDOpt[] = useMemo(
    () => insumos.map(i => ({value: String(i.id), label: i.denominacion})),
    [insumos]
  )

  // When category is chosen, filter insumos by that category.
  // If user picks the insumo first, auto‐select its category.
  const addInsumoOptions = useMemo(() => {
    if (!addCatOpt) return allInsumoOptions
    const catId = Number(addCatOpt.value)
    return allInsumoOptions.filter(o => insumoMetaById[Number(o.value)]?.categoriaId === catId)
  }, [addCatOpt, allInsumoOptions, insumoMetaById])

  useEffect(() => {
    if (!addInsumoOpt) return
    const meta = insumoMetaById[Number(addInsumoOpt.value)]
    if (meta && (!addCatOpt || Number(addCatOpt.value) !== meta.categoriaId)) {
      setAddCatOpt({value: String(meta.categoriaId), label: meta.categoriaLabel})
    }
  }, [addInsumoOpt, addCatOpt, insumoMetaById])

  // detalles editor state
  const [detalles, setDetalles] = useState<DetalleRow[]>(
    initialData?.detalles?.map(d => ({
      cantidad: d.cantidad,
      idArticuloInsumo: d.articuloInsumo?.id ?? 0,
    })) ?? []
  )
  const [newCantidad, setNewCantidad] = useState<number | ''>('')

  // ── options data ─────────────────────────────────────────────────────────
  const [categoriaOptions, setCategoriaOptions] = useState<DDOpt[]>([]) // para el producto (NO insumo)
  const [insumoCategoriaOptions, setInsumoCategoriaOptions] = useState<DDOpt[]>([]) // para ingredientes (SÍ insumo)

  useEffect(() => {
    ;(async () => {
      const categorias = await fetchAllCategorias()

      // Producto: solo categorías NO insumo
      const scopedProd = filterCategoriasBySucursalId(categorias, sucursalId).filter(
        c => !c.esInsumo
      )
      const treeProd = buildCategoriaTree(scopedProd)
      const flatProd = flattenCategoriaTree(treeProd)
      setCategoriaOptions(flatProd.map(f => ({value: String(f.id), label: f.label})))

      // Ingredientes: solo categorías SÍ insumo
      const scopedInsumo = filterCategoriasBySucursalId(categorias, sucursalId).filter(
        c => c.esInsumo
      )
      const treeInsumo = buildCategoriaTree(scopedInsumo)
      const flatInsumo = flattenCategoriaTree(treeInsumo)
      setInsumoCategoriaOptions(flatInsumo.map(f => ({value: String(f.id), label: f.label})))
    })()
  }, [sucursalId])

  // reset on edit change
  useEffect(() => {
    if (!isEdit) return
    setDenominacion(initialData?.denominacion ?? '')
    setPrecioVenta(initialData?.precioVenta != null ? String(initialData.precioVenta) : '')
    setDescripcion(initialData?.descripcion ?? '')
    setTiempoMin(initialData?.tiempoEstimadoMinutos ?? '')
    setPreparacion(initialData?.preparacion ?? '')
    setCategoriaOpt(
      initialData
        ? {value: String(initialData.categoria.id), label: initialData.categoria.denominacion}
        : null
    )
    setDetalles(
      initialData?.detalles?.map(d => ({
        cantidad: d.cantidad,
        idArticuloInsumo: d.articuloInsumo?.id ?? 0,
      })) ?? []
    )
  }, [isEdit, initialData])

  // ── detalles editor helpers ──────────────────────────────────────────────
  // TODO: Limpiar categoria when adding a new insumo
  const addDetalle = () => {
    const id = Number(addInsumoOpt?.value)
    const qty = Number(newCantidad)
    if (!id || !qty || qty <= 0) return
    setDetalles(prev => [...prev, {idArticuloInsumo: id, cantidad: qty}])
    setAddInsumoOpt(null)
    setNewCantidad('')
  }

  const updateDetalle = (id: number, qty: number | '') => {
    setDetalles(prev =>
      prev.map(d => (d.idArticuloInsumo === id ? {...d, cantidad: qty as number} : d))
    )
  }
  const removeDetalle = (id: number) => {
    setDetalles(prev => prev.filter(d => d.idArticuloInsumo !== id))
  }

  // ── validation/ui state ──────────────────────────────────────────────────
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // ── submit ───────────────────────────────────────────────────────────────
  // WARN: el producto no usa unidad. La API la exige.
  // Se fija temporalmente a "Unidades" (id 1) hasta definir un modelo mejor.
  // TODO: Fix create with image. Insumo broken (API?)
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setFormErrors({})
    setLoading(true)

    try {
      if (isEdit && initialData) {
        const raw = {
          denominacion: denominacion.trim(),
          precioVenta: precioVenta === '' ? undefined : Number(precioVenta),
          descripcion,
          tiempoEstimadoMinutos: tiempoMin === '' ? undefined : Number(tiempoMin),
          preparacion,
          idUnidadDeMedida: 1, // Ver nota arriba
          // idUnidadDeMedida: unidadOpt ? Number(unidadOpt.value) : undefined,
          idCategoria: categoriaOpt ? Number(categoriaOpt.value) : undefined,
          detalles: detalles.length
            ? detalles.map(d => ({
                cantidad: Number(d.cantidad),
                idArticuloInsumo: d.idArticuloInsumo,
              }))
            : undefined,
        }
        const parsed = articuloManufacturadoUpdateSchema.safeParse(raw)
        if (!parsed.success) {
          const errs: Record<string, string> = {}
          parsed.error.errors.forEach(e => (errs[e.path.join('.')] = e.message))
          setFormErrors(errs)
          setLoading(false)
          return
        }
        if (imagen) {
          await updateArticuloManufacturadoWithImage(initialData.id, parsed.data, imagen)
        } else {
          await updateArticuloManufacturado(initialData.id, parsed.data)
        }
      } else {
        const raw = {
          denominacion: denominacion.trim(),
          precioVenta: Number(precioVenta || 0),
          descripcion,
          tiempoEstimadoMinutos: Number(tiempoMin || 0),
          preparacion,
          idSucursal: sucursalId,
          idUnidadDeMedida: 1, // Ver nota arriba
          // idUnidadDeMedida: Number(unidadOpt?.value),
          idCategoria: Number(categoriaOpt?.value),
          detalles: detalles.map(d => ({
            cantidad: Number(d.cantidad),
            idArticuloInsumo: d.idArticuloInsumo,
          })),
        }
        const parsed = articuloManufacturadoCreateSchema.safeParse(raw)
        if (!parsed.success) {
          const errs: Record<string, string> = {}
          parsed.error.errors.forEach(e => (errs[e.path.join('.')] = e.message))
          setFormErrors(errs)
          setLoading(false)
          return
        }

        if (imagen) {
          await createArticuloManufacturadoWithImage(parsed.data, imagen)
        } else {
          await createArticuloManufacturado(parsed.data)
        }

        // reset (optional)
        setDenominacion('')
        setPrecioVenta('')
        setDescripcion('')
        setTiempoMin('')
        setPreparacion('')
        setCategoriaOpt(null)
        setDetalles([])
      }

      onSuccess?.()
      if (dialogName) closeDialog(dialogName)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar el producto'
      setFormErrors({general: message})
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      {/* Header: image + key fields */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Imagen (compact) */}
        <div className="md:w-50 space-y-4">
          <label className="block text-sm font-medium mb-2">Imagen</label>
          <ImageDropzone onFileAccepted={setImagen} previewUrl={initialData?.imagenUrl ?? null} />
          <p className="text-xs text-muted mt-2">Formatos comunes soportados (SVG, JPG, PNG...).</p>

          <Input
            label="Tiempo de preparación estimado"
            type="number"
            inputMode="numeric"
            value={tiempoMin === '' ? '' : String(tiempoMin)}
            onChange={e =>
              setTiempoMin(e.currentTarget.value === '' ? '' : e.currentTarget.valueAsNumber)
            }
            error={formErrors.tiempoEstimadoMinutos}
            suffix="min"
          />
        </div>

        {/* Campos principales */}
        <div className="flex-1 flex flex-col gap-6">
          <Input
            label="Nombre"
            value={denominacion}
            onChange={e => setDenominacion(e.target.value)}
            error={formErrors.denominacion}
          />
          <Input
            label="Precio venta"
            type="number"
            inputMode="decimal"
            value={precioVenta}
            onChange={e => setPrecioVenta(e.target.value)}
            error={formErrors.precioVenta}
            prefix="$"
          />
          <Dropdown
            label="Categoría"
            options={categoriaOptions}
            value={categoriaOpt}
            onChange={val => setCategoriaOpt(val as DDOpt | null)}
            placeholder="Selecciona"
            error={formErrors.idCategoria}
            searchable
          />
          <Input
            label="Descripción"
            multiline
            value={descripcion ?? ''}
            onChange={e => setDescripcion(e.target.value)}
            error={formErrors.descripcion}
          />
          <Input
            label="Preparación"
            multiline
            value={preparacion ?? ''}
            onChange={e => setPreparacion(e.target.value)}
            error={formErrors.preparacion}
          />
        </div>
      </div>

      {/* Ingredientes */}
      <div className="space-y-2">
        <label className="block font-medium text-text">
          <span>Ingredientes</span>
        </label>

        {detalles.length === 0 && (
          <p className="text-sm text-muted">Aún no agregaste ingredientes.</p>
        )}

        {detalles.map(d => {
          const meta = insumoMetaById[d.idArticuloInsumo]
          const catLabel = meta?.categoriaLabel ?? '—'
          const unidadLabel = meta?.unidadLabel ?? '—'
          const insumoLabel =
            allInsumoOptions.find(o => Number(o.value) === d.idArticuloInsumo)?.label ??
            `Insumo #${d.idArticuloInsumo}`

          return (
            <div
              key={d.idArticuloInsumo}
              className="grid grid-cols-[1fr_6rem_8rem_auto] items-center gap-3"
            >
              {/* "Categoría > Insumo" */}
              <div className="flex-1 text-sm">
                <span className="text-muted">{catLabel}</span>
                <span className="text-muted"> &gt; </span>
                <span>{insumoLabel}</span>
              </div>

              {/* cantidad × unidad */}
              <div className="w-24">
                <Input
                  type="number"
                  inputMode="decimal"
                  value={String(d.cantidad)}
                  onChange={e =>
                    updateDetalle(d.idArticuloInsumo, e.currentTarget.valueAsNumber || 0)
                  }
                  placeholder="Cant."
                />
              </div>
              <div className="w-28">
                <span className="text-sm text-muted">× {unidadLabel}</span>
              </div>

              <Button
                type="button"
                variant="secondary"
                onClick={() => removeDetalle(d.idArticuloInsumo)}
              >
                Quitar
              </Button>
            </div>
          )
        })}

        {/* Add row: [Categoría] > [Insumo] — [Cantidad] × unidad  [Agregar] */}
        <div className="grid grid-cols-[minmax(220px,1fr)_minmax(240px,1fr)_6rem_8rem_auto] items-end gap-2 mt-2">
          <div className="min-w-[220px] flex-1">
            <Dropdown
              label="Categoría"
              placeholder="Selecciona"
              options={insumoCategoriaOptions}
              value={addCatOpt}
              onChange={v => {
                const next = v as DDOpt | null
                setAddCatOpt(next)
                // 1) Clearing either clears both
                if (next == null) {
                  setAddInsumoOpt(null)
                }
              }}
              searchable
            />
          </div>

          <div className="min-w-[240px] flex-1">
            <Dropdown
              label="Insumo"
              placeholder="Selecciona"
              options={addInsumoOptions}
              value={addInsumoOpt}
              onChange={v => {
                const next = v as DDOpt | null
                setAddInsumoOpt(next)
                // 1) Clearing either clears both
                if (next == null) {
                  setAddCatOpt(null)
                }
              }}
              searchable
            />
          </div>

          <div>
            <Input
              type="number"
              label="Cantidad"
              inputMode="decimal"
              value={newCantidad === '' ? '' : String(newCantidad)}
              onChange={e =>
                setNewCantidad(e.currentTarget.value === '' ? '' : e.currentTarget.valueAsNumber)
              }
              placeholder="Cant."
            />
          </div>

          <div className="self-end pb-2 w-28">
            <span className="text-sm text-muted">
              ×{' '}
              {addInsumoOpt
                ? (insumoMetaById[Number(addInsumoOpt.value)]?.unidadLabel ?? '—')
                : '—'}
            </span>
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={() => addDetalle()}
            disabled={!addInsumoOpt || !(typeof newCantidad === 'number' && newCantidad > 0)}
          >
            Agregar
          </Button>
        </div>

        {formErrors.detalles && <p className="text-sm text-danger">{formErrors.detalles}</p>}
      </div>

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
          {isEdit ? 'Guardar cambios' : 'Crear producto'}
        </Button>
      </div>
    </form>
  )
}
