'use client'

import {useEffect, useMemo, useState} from 'react'
import Input from '@/components/ui/Input'
import Dropdown from '@/components/ui/Dropdown'
import Toggle from '@/components/ui/Toggle'
import Button from '@/components/ui/Button'
import ImageDropzone from '@/components/ui/ImageDropzone'
import useDialog from '@/hooks/useDialog'
import {ArticuloManufacturado} from '@/services/types/articuloManufacturado'
import {ArticuloInsumo} from '@/services/types/articuloInsumo'
import {fetchAllUnidades} from '@/services/unidadDeMedida'
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

  const [unidadOpt, setUnidadOpt] = useState<DDOpt | null>(
    initialData
      ? {
          value: String(initialData.unidadDeMedida.id),
          label: initialData.unidadDeMedida.denominacion ?? '—',
        }
      : null
  )
  const [categoriaOpt, setCategoriaOpt] = useState<DDOpt | null>(
    initialData
      ? {value: String(initialData.categoria.id), label: initialData.categoria.denominacion}
      : null
  )

  // detalles editor state
  const [detalles, setDetalles] = useState<DetalleRow[]>(
    initialData?.detalles?.map(d => ({
      cantidad: d.cantidad,
      idArticuloInsumo: d.articuloInsumo?.id ?? 0,
    })) ?? []
  )
  const [newInsumoOpt, setNewInsumoOpt] = useState<DDOpt | null>(null)
  const [newCantidad, setNewCantidad] = useState<number | ''>('')

  // ── options data ─────────────────────────────────────────────────────────
  const [unidadOptions, setUnidadOptions] = useState<DDOpt[]>([])
  const [categoriaOptions, setCategoriaOptions] = useState<DDOpt[]>([])
  const [insumoOptions, setInsumoOptions] = useState<DDOpt[]>([])

  useEffect(() => {
    ;(async () => {
      const [unidades, categorias, insumos] = await Promise.all([
        fetchAllUnidades(),
        fetchAllCategorias(),
        fetchAllArticuloInsumos(),
      ])

      setUnidadOptions(
        unidades.map(u => ({value: String(u.id), label: u.denominacion ?? `Unidad ${u.id}`}))
      )

      // Only non-insumo categories present in this sucursal
      const scoped = filterCategoriasBySucursalId(categorias, sucursalId).filter(c => !c.esInsumo)
      const tree = buildCategoriaTree(scoped)
      const flat = flattenCategoriaTree(tree)
      setCategoriaOptions(flat.map(f => ({value: String(f.id), label: f.label})))

      const insumosSucursal = filterArticuloInsumosBySucursalId(insumos, sucursalId)
      setInsumoOptions(
        insumosSucursal.map(i => ({
          value: String(i.id),
          label: `${i.denominacion} — ${i.unidadDeMedida?.denominacion ?? '—'}`,
        }))
      )
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
    setUnidadOpt(
      initialData
        ? {
            value: String(initialData.unidadDeMedida.id),
            label: initialData.unidadDeMedida.denominacion ?? '—',
          }
        : null
    )
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
  const alreadyChosen = useMemo(() => new Set(detalles.map(d => d.idArticuloInsumo)), [detalles])
  const addableOptions = useMemo(
    () => insumoOptions.filter(o => !alreadyChosen.has(Number(o.value))),
    [insumoOptions, alreadyChosen]
  )

  const addDetalle = () => {
    const id = Number(newInsumoOpt?.value)
    const qty = Number(newCantidad)
    if (!id || !qty || qty <= 0) return
    setDetalles(prev => [...prev, {idArticuloInsumo: id, cantidad: qty}])
    setNewInsumoOpt(null)
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
          idUnidadDeMedida: unidadOpt ? Number(unidadOpt.value) : undefined,
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
          idUnidadDeMedida: Number(unidadOpt?.value),
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
        setUnidadOpt(null)
        setCategoriaOpt(null)
        setDetalles([])
      }

      onSuccess?.()
      if (dialogName) closeDialog(dialogName)
    } catch (err: any) {
      setFormErrors({general: err?.message ?? 'Error al guardar el producto'})
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-6">
        {/* Imagen */}
        <div className="w-40 mx-auto md:w-25 md:mx-0">
          <label className="block text-sm font-medium mb-2">Imagen del producto</label>
          <ImageDropzone onFileAccepted={setImagen} previewUrl={initialData?.imagenUrl ?? null} />
          <p className="text-xs text-muted mt-2">Formatos comunes soportados (SVG, JPG, PNG...).</p>
        </div>

        {/* Campos */}
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
            <Input
              label="Denominación"
              value={denominacion}
              onChange={e => setDenominacion(e.target.value)}
              error={formErrors.denominacion}
            />
            {/* quick publish/flag placeholder if you ever need */}
            <div className="flex items-center md:self-start md:mt-7">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Toggle checked={true} onChange={() => {}} disabled />
                <span>Habilitado</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Precio venta"
              type="number"
              inputMode="decimal"
              value={precioVenta}
              onChange={e => setPrecioVenta(e.target.value)}
              error={formErrors.precioVenta}
            />
            <Input
              label="Tiempo estimado (min)"
              type="number"
              inputMode="numeric"
              value={tiempoMin === '' ? '' : String(tiempoMin)}
              onChange={e =>
                setTiempoMin(e.target.value === '' ? '' : e.currentTarget.valueAsNumber)
              }
              error={formErrors.tiempoEstimadoMinutos}
            />
            <Dropdown
              label="Unidad de medida"
              options={unidadOptions}
              value={unidadOpt}
              onChange={val => setUnidadOpt(val as DDOpt)}
              placeholder="Selecciona"
              error={formErrors.idUnidadDeMedida}
              searchable={true}
            />
          </div>

          <Dropdown
            label="Categoría"
            options={categoriaOptions}
            value={categoriaOpt}
            onChange={val => setCategoriaOpt(val as DDOpt)}
            placeholder="Selecciona"
            error={formErrors.idCategoria}
            searchable={true}
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

          {/* Ingredientes editor */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text">Ingredientes</label>

            {detalles.length === 0 && (
              <p className="text-sm text-muted">Aún no agregaste ingredientes.</p>
            )}

            {detalles.map(d => {
              const opt = insumoOptions.find(o => Number(o.value) === d.idArticuloInsumo)
              return (
                <div key={d.idArticuloInsumo} className="flex items-center gap-2">
                  <div className="flex-1 text-sm">
                    {opt?.label ?? `Insumo #${d.idArticuloInsumo}`}
                  </div>
                  <Input
                    label="Cantidad"
                    className="w-32"
                    type="number"
                    inputMode="decimal"
                    value={String(d.cantidad)}
                    onChange={e =>
                      updateDetalle(d.idArticuloInsumo, e.currentTarget.valueAsNumber || 0)
                    }
                  />
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

            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1">
                <Dropdown
                  placeholder="Selecciona insumo…"
                  options={addableOptions}
                  value={newInsumoOpt}
                  onChange={v => setNewInsumoOpt(v as DDOpt)}
                  searchable
                />
              </div>
              <Input
                placeholder="Cant."
                className="w-28"
                type="number"
                inputMode="decimal"
                value={newCantidad === '' ? '' : String(newCantidad)}
                onChange={e =>
                  setNewCantidad(e.currentTarget.value === '' ? '' : e.currentTarget.valueAsNumber)
                }
              />
              <Button type="button" variant="primary" onClick={addDetalle}>
                Agregar
              </Button>
            </div>

            {formErrors.detalles && <p className="text-sm text-danger">{formErrors.detalles}</p>}
          </div>
        </div>
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
