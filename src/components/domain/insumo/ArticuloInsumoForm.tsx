'use client'

import {useEffect, useMemo, useState} from 'react'
import Input from '@/components/ui/Input'
import Toggle from '@/components/ui/Toggle'
import Dropdown from '@/components/ui/Dropdown'
import Button from '@/components/ui/Button'
import useDialog from '@/hooks/useDialog'
import {ArticuloInsumo} from '@/services/types/articulo'
import {createArticuloInsumo, updateArticuloInsumo} from '@/services/articuloInsumo'
import {fetchAllUnidades} from '@/services/unidadDeMedida'
import {fetchAllCategorias} from '@/services/categoria'
import {
  buildCategoriaTree,
  filterCategoriasBySucursalId,
  flattenCategoriaTree,
} from '@/services/categoria.utils'
import {
  articuloInsumoCreateSchema,
  articuloInsumoUpdateSchema,
} from '@/schemas/articuloInsumoSchema'

type DDOpt = {value: string; label: string}

interface Props {
  sucursalId: number
  initialData?: ArticuloInsumo
  onSuccess?: () => void
  dialogName?: string
}

export default function ArticuloInsumoForm({
  sucursalId,
  initialData,
  onSuccess,
  dialogName,
}: Props) {
  const isEdit = !!initialData
  const {closeDialog} = useDialog()

  // ── form fields ──────────────────────────────────────────────────────────
  const [denominacion, setDenominacion] = useState(initialData?.denominacion ?? '')
  const [precioVenta, setPrecioVenta] = useState<string>(
    initialData?.precioVenta != null ? String(initialData.precioVenta) : ''
  )
  const [precioCompra, setPrecioCompra] = useState<string>(
    initialData?.precioCompra != null ? String(initialData.precioCompra) : ''
  )
  const [stockActual, setStockActual] = useState<number | ''>(initialData?.stockActual ?? '')
  const [stockMaximo, setStockMaximo] = useState<number | ''>(initialData?.stockMaximo ?? '')
  const [stockMinimo, setStockMinimo] = useState<number | ''>(initialData?.stockMinimo ?? '')
  const [esParaElaborar, setEsParaElaborar] = useState<boolean>(
    initialData?.esParaElaborar ?? false
  )

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

  // ── data sources ─────────────────────────────────────────────────────────
  const [unidadOptions, setUnidadOptions] = useState<DDOpt[]>([])
  const [categoriaOptions, setCategoriaOptions] = useState<DDOpt[]>([])
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // Load unidades & categorias (only insumo categories present in this sucursal)
  useEffect(() => {
    ;(async () => {
      const [unidades, categorias] = await Promise.all([fetchAllUnidades(), fetchAllCategorias()])
      setUnidadOptions(
        unidades.map(u => ({value: String(u.id), label: u.denominacion ?? `Unidad ${u.id}`}))
      )

      const scoped = filterCategoriasBySucursalId(categorias, sucursalId).filter(c => c.esInsumo)
      const tree = buildCategoriaTree(scoped)
      const flat = flattenCategoriaTree(tree)
      setCategoriaOptions(flat.map(f => ({value: String(f.id), label: f.label})))
    })()
  }, [sucursalId])

  // Reset when switching record
  useEffect(() => {
    if (!isEdit) return
    setDenominacion(initialData?.denominacion ?? '')
    setPrecioVenta(initialData?.precioVenta != null ? String(initialData.precioVenta) : '')
    setPrecioCompra(initialData?.precioCompra != null ? String(initialData.precioCompra) : '')
    setStockActual(initialData?.stockActual ?? '')
    setStockMaximo(initialData?.stockMaximo ?? '')
    setStockMinimo(initialData?.stockMinimo ?? '')
    setEsParaElaborar(initialData?.esParaElaborar ?? false)
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
    setFormErrors({})
  }, [isEdit, initialData])

  // ── submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault()
    setFormErrors({})
    setLoading(true)
    try {
      if (isEdit && initialData) {
        const raw = {
          denominacion: denominacion.trim(),
          precioVenta: precioVenta === '' ? undefined : Number(precioVenta),
          precioCompra: precioCompra === '' ? undefined : Number(precioCompra),
          stockActual: stockActual === '' ? undefined : Number(stockActual),
          stockMaximo: stockMaximo === '' ? undefined : Number(stockMaximo),
          stockMinimo: stockMinimo === '' ? undefined : Number(stockMinimo),
          esParaElaborar,
          idUnidadDeMedida: unidadOpt ? Number(unidadOpt.value) : undefined,
          idCategoria: categoriaOpt ? Number(categoriaOpt.value) : undefined,
        }
        const parsed = articuloInsumoUpdateSchema.safeParse(raw)
        if (!parsed.success) {
          const errs: Record<string, string> = {}
          parsed.error.errors.forEach(e => (errs[e.path.join('.')] = e.message))
          setFormErrors(errs)
          setLoading(false)
          return
        }
        await updateArticuloInsumo(initialData.id, parsed.data)
      } else {
        const raw = {
          denominacion: denominacion.trim(),
          precioVenta: Number(precioVenta || 0),
          precioCompra: Number(precioCompra || 0),
          stockActual: Number(stockActual || 0),
          stockMaximo: Number(stockMaximo || 0),
          stockMinimo: Number(stockMinimo || 0),
          esParaElaborar,
          idSucursal: sucursalId, // inmutable en create
          idUnidadDeMedida: Number(unidadOpt?.value),
          idCategoria: Number(categoriaOpt?.value),
        }
        const parsed = articuloInsumoCreateSchema.safeParse(raw)
        if (!parsed.success) {
          const errs: Record<string, string> = {}
          parsed.error.errors.forEach(e => (errs[e.path.join('.')] = e.message))
          setFormErrors(errs)
          setLoading(false)
          return
        }
        await createArticuloInsumo(parsed.data)
        // Reset (optional)
        setDenominacion('')
        setPrecioVenta('')
        setPrecioCompra('')
        setStockActual('')
        setStockMaximo('')
        setStockMinimo('')
        setEsParaElaborar(false)
        setUnidadOpt(null)
        setCategoriaOpt(null)
      }

      onSuccess?.()
      if (dialogName) closeDialog(dialogName)
    } catch (err: any) {
      setFormErrors({general: err?.message ?? 'Error al guardar el artículo'})
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
        <Input
          label="Denominación"
          value={denominacion}
          onChange={e => setDenominacion(e.target.value)}
          error={formErrors.denominacion}
        />
        <div className="flex items-center md:self-start md:mt-7">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Toggle checked={esParaElaborar} onChange={setEsParaElaborar} />
            <span>Para elaborar</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Precio venta"
          type="number"
          inputMode="decimal"
          value={precioVenta}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrecioVenta(e.target.value)}
          error={formErrors.precioVenta}
        />
        <Input
          label="Precio compra"
          type="number"
          inputMode="decimal"
          value={precioCompra}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrecioCompra(e.target.value)}
          error={formErrors.precioCompra}
        />
        <Dropdown
          label="Unidad de medida"
          options={unidadOptions}
          value={unidadOpt}
          onChange={val => setUnidadOpt(val as DDOpt)}
          placeholder="Selecciona"
          error={formErrors.idUnidadDeMedida}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Stock actual"
          type="number"
          inputMode="numeric"
          value={stockActual === '' ? '' : String(stockActual)}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setStockActual(e.target.value === '' ? '' : e.target.valueAsNumber)
          }
          error={formErrors.stockActual}
        />
        <Input
          label="Stock máximo"
          type="number"
          inputMode="numeric"
          value={stockMaximo === '' ? '' : String(stockMaximo)}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setStockMaximo(e.target.value === '' ? '' : e.target.valueAsNumber)
          }
          error={formErrors.stockMaximo}
        />
        <Input
          label="Stock mínimo"
          type="number"
          inputMode="numeric"
          value={stockMinimo === '' ? '' : String(stockMinimo)}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setStockMinimo(e.target.value === '' ? '' : e.target.valueAsNumber)
          }
          error={formErrors.stockMinimo}
        />
      </div>

      <Dropdown
        label="Categoría"
        options={categoriaOptions}
        value={categoriaOpt}
        onChange={val => setCategoriaOpt(val as DDOpt)}
        placeholder="Selecciona"
        error={formErrors.idCategoria}
      />
      <p className="text-xs text-muted -mt-2">
        Solo se muestran categorías de tipo <strong>insumo</strong> disponibles en esta sucursal.
      </p>

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
          {isEdit ? 'Guardar cambios' : 'Crear artículo'}
        </Button>
      </div>
    </form>
  )
}
