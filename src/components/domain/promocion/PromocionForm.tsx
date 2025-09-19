'use client'

import {ChangeEvent, useEffect, useState} from 'react'
import Input from '@/components/ui/Input'
import Dropdown from '@/components/ui/Dropdown'
import Button from '@/components/ui/Button'
import MultiSelectCheckbox from '@/components/ui/MultiSelectCheckbox'
import DatePicker from '@/components/ui/DatePicker'
import TimePicker from '@/components/ui/TimePicker'
import ImageDropzone from '@/components/ui/ImageDropzone'
import useDialog from '@/hooks/useDialog'
import {
  Promocion,
  PromocionCreatePayload,
  PromocionUpdatePayload,
  TipoPromocion,
} from '@/services/types/promocion'
import {promocionCreateSchema, promocionUpdateSchema} from '@/schemas/promocionSchema'
import {
  createPromocion,
  updatePromocion,
  createPromocionWithImage,
  updatePromocionWithImage,
} from '@/services/promocion'

import {fetchAllArticuloInsumos} from '@/services/articuloInsumo'
import {fetchAllArticuloManufacturados} from '@/services/articuloManufacturado'
import {fetchAllSucursales} from '@/services/sucursal'
import {Sucursal} from '@/services/types'
import PromocionDetailsEditor from './PromocionDetailsEditor'
import {buildArticuloOptionsForSucursal, TIPO_PROMOCION_OPTIONS} from '@/services/promocion.utils'
import {filterSucursalesByEmpresaId} from '@/services/sucursal.utils'

type DD = {value: string; label: string}

function toApiTime(t: string) {
  return t.length === 5 ? `${t}:00` : t
}
function fromApiTime(t: string) {
  return t?.slice(0, 5) ?? ''
}

type Props = {
  empresaId: number
  sucursalId: number
  initialData?: Promocion
  onSuccess?: () => void
  dialogName?: string
}

export default function PromocionForm({
  empresaId,
  sucursalId,
  initialData,
  onSuccess,
  dialogName,
}: Props) {
  const isEdit = !!initialData
  const {closeDialog} = useDialog()

  // fields
  const [denominacion, setDenominacion] = useState(initialData?.denominacion ?? '')
  const [imagen, setImagen] = useState<File | null>(null)
  const [fechaDesde, setFechaDesde] = useState(initialData?.fechaDesde ?? '')
  const [fechaHasta, setFechaHasta] = useState(initialData?.fechaHasta ?? '')
  const [horaDesde, setHoraDesde] = useState(initialData ? fromApiTime(initialData.horaDesde) : '')
  const [horaHasta, setHoraHasta] = useState(initialData ? fromApiTime(initialData.horaHasta) : '')
  const [descripcion, setDescripcion] = useState(initialData?.descripcionDescuento ?? '')
  const [precioPromo, setPrecioPromo] = useState<string>(
    initialData?.precioPromocional != null ? String(initialData.precioPromocional) : ''
  )
  const [tipo, setTipo] = useState<DD | null>(() => {
    if (!initialData) return null
    const opt = TIPO_PROMOCION_OPTIONS.find(o => o.value === initialData.tipoPromocion)
    return opt
      ? {value: opt.value, label: opt.label}
      : {value: initialData.tipoPromocion as any, label: String(initialData.tipoPromocion)}
  })

  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [idSucursales, setIdSucursales] = useState<number[]>(() => {
    if (initialData) {
      // backend may return either embedded sucursales or only ids
      if (Array.isArray(initialData.sucursales) && initialData.sucursales.length) {
        return initialData.sucursales.map(s => s.id)
      }
      if (
        Array.isArray((initialData as any).idSucursales) &&
        (initialData as any).idSucursales.length
      ) {
        return (initialData as any).idSucursales as number[]
      }
    }
    return [sucursalId]
  })

  // detalles (line items)
  type Row = {idArticulo: number; cantidad: number}
  const [detalles, setDetalles] = useState<Row[]>(
    initialData?.detalles?.map(d => ({idArticulo: d.articulo.id, cantidad: d.cantidad})) ?? []
  )

  // options
  const [tipoOptions] = useState<DD[]>(
    TIPO_PROMOCION_OPTIONS.map(o => ({value: o.value, label: o.label}))
  )
  const [articuloOptions, setArticuloOptions] = useState<DD[]>([])
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // load data
  useEffect(() => {
    ;(async () => {
      const [allSucursales, insumos, prods] = await Promise.all([
        fetchAllSucursales(),
        fetchAllArticuloInsumos(),
        fetchAllArticuloManufacturados(),
      ])

      // limit sucursales to current empresa
      const sucs = filterSucursalesByEmpresaId(allSucursales, empresaId)
      setSucursales(sucs)
      // build options with INSUMOS filtered to this sucursal
      setArticuloOptions(
        buildArticuloOptionsForSucursal({insumos, manufacturados: prods, sucursalId})
      )
    })()
  }, [empresaId, sucursalId])

  // reset on edit switch
  useEffect(() => {
    if (!isEdit) return
    setDenominacion(initialData?.denominacion ?? '')
    setFechaDesde(initialData?.fechaDesde ?? '')
    setFechaHasta(initialData?.fechaHasta ?? '')
    setHoraDesde(initialData ? fromApiTime(initialData.horaDesde) : '')
    setHoraHasta(initialData ? fromApiTime(initialData.horaHasta) : '')
    setDescripcion(initialData?.descripcionDescuento ?? '')
    setPrecioPromo(
      initialData?.precioPromocional != null ? String(initialData.precioPromocional) : ''
    )
    if (initialData) {
      const opt = TIPO_PROMOCION_OPTIONS.find(o => o.value === initialData.tipoPromocion)
      setTipo(
        opt
          ? ({value: opt.value, label: opt.label} as DD)
          : ({
              value: initialData.tipoPromocion as any,
              label: String(initialData.tipoPromocion),
            } as DD)
      )
    } else {
      setTipo(null)
    }
    setIdSucursales(
      initialData?.sucursales?.map(s => s.id) ??
        ((initialData as any)?.idSucursales as number[] | undefined) ??
        []
    )
    setDetalles(
      initialData?.detalles?.map(d => ({idArticulo: d.articulo.id, cantidad: d.cantidad})) ?? []
    )
    setFormErrors({})
  }, [isEdit, initialData])

  const updateCantidad = (id: number, qty: number | '') =>
    setDetalles(prev => prev.map(d => (d.idArticulo === id ? {...d, cantidad: qty as number} : d)))
  const removeDetalle = (id: number) => setDetalles(prev => prev.filter(d => d.idArticulo !== id))

  // submit
  // TODO: Fix create with image
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setFormErrors({})
    setLoading(true)
    try {
      if (isEdit && initialData) {
        const raw: PromocionUpdatePayload = {
          denominacion: denominacion.trim(),
          fechaDesde,
          fechaHasta,
          horaDesde: horaDesde ? toApiTime(horaDesde) : undefined,
          horaHasta: horaHasta ? toApiTime(horaHasta) : undefined,
          descripcionDescuento: descripcion,
          precioPromocional: precioPromo === '' ? undefined : Number(precioPromo),
          tipoPromocion: (tipo?.value as TipoPromocion) ?? undefined,
          idSucursales: idSucursales.length ? idSucursales : undefined,
          detalles: detalles.length ? detalles : undefined,
        }
        const parsed = promocionUpdateSchema.safeParse(raw)
        if (!parsed.success) {
          const errs: Record<string, string> = {}
          parsed.error.errors.forEach(e => (errs[e.path.join('.')] = e.message))
          setFormErrors(errs)
          setLoading(false)
          return
        }
        if (imagen) {
          await updatePromocionWithImage(initialData.id, parsed.data, imagen)
        } else {
          await updatePromocion(initialData.id, parsed.data)
        }
      } else {
        const raw: PromocionCreatePayload = {
          denominacion: denominacion.trim(),
          fechaDesde,
          fechaHasta,
          horaDesde: toApiTime(horaDesde),
          horaHasta: toApiTime(horaHasta),
          descripcionDescuento: descripcion || undefined,
          precioPromocional: Number(precioPromo || 0),
          tipoPromocion: (tipo?.value as TipoPromocion) ?? TipoPromocion.HAPPY_HOUR,
          idSucursales,
          detalles,
        }
        const parsed = promocionCreateSchema.safeParse(raw)
        if (!parsed.success) {
          const errs: Record<string, string> = {}
          parsed.error.errors.forEach(e => (errs[e.path.join('.')] = e.message))
          setFormErrors(errs)
          setLoading(false)
          return
        }
        if (imagen) {
          await createPromocionWithImage(parsed.data, imagen)
        } else {
          await createPromocion(parsed.data)
        }

        // reset
        setDenominacion('')
        setFechaDesde('')
        setFechaHasta('')
        setHoraDesde('')
        setHoraHasta('')
        setDescripcion('')
        setPrecioPromo('')
        setTipo(null)
        setIdSucursales([sucursalId])
        setDetalles([])
        setImagen(null)
      }
      onSuccess?.()
      if (dialogName) closeDialog(dialogName)
    } catch (err: any) {
      setFormErrors({general: err?.message ?? 'Error al guardar la promoción'})
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      {/* Encabezado: Imagen + campos principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Col 1: Imagen compacta */}
        <div className="order-first">
          <label className="mb-1 block text-sm font-medium text-text">Imagen (opcional)</label>
          <ImageDropzone
            previewUrl={initialData?.imagenUrl ?? null}
            onFileAccepted={file => setImagen(file)}
            className="max-w-full md:max-w-xs aspect-[4/3] max-h-56 md:max-h-60"
          />
          <p className="mt-1 text-xs text-muted">
            Recomendado 4:3. Puedes arrastrar y soltar un archivo.
          </p>
        </div>

        {/* Col 2–3: Denominación, Tipo, Precio, Descripción */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Nombre de la promo"
              value={denominacion}
              onChange={e => setDenominacion(e.target.value)}
              error={formErrors.denominacion}
            />
          </div>
          <Dropdown
            label="Tipo"
            options={tipoOptions}
            value={tipo}
            onChange={v => setTipo(v as DD)}
            placeholder="Selecciona"
            error={formErrors.tipoPromocion}
          />
          <Input
            label="Precio promocional"
            type="number"
            inputMode="decimal"
            value={precioPromo}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPrecioPromo(e.target.value)}
            error={formErrors.precioPromocional}
            prefix="$"
          />
          <div className="md:col-span-2">
            <Input
              label="Descripción (opcional)"
              multiline
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              error={formErrors.descripcionDescuento}
            />
          </div>
        </div>
      </div>

      {/* Vigencia */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DatePicker
          label="Fecha desde"
          value={fechaDesde}
          onChange={setFechaDesde}
          error={formErrors.fechaDesde}
        />
        <DatePicker
          label="Fecha hasta"
          value={fechaHasta}
          onChange={setFechaHasta}
          error={formErrors.fechaHasta}
        />
        <TimePicker
          label="Hora desde"
          value={horaDesde}
          onChange={setHoraDesde}
          error={formErrors.horaDesde}
        />
        <TimePicker
          label="Hora hasta"
          value={horaHasta}
          onChange={setHoraHasta}
          error={formErrors.horaHasta}
        />
      </div>

      {/* Detalles */}
      <PromocionDetailsEditor
        articuloOptions={articuloOptions}
        detalles={detalles}
        onAdd={(id, qty) => setDetalles(prev => [...prev, {idArticulo: id, cantidad: qty}])}
        onChangeCantidad={(id, qty) => updateCantidad(id, qty)}
        onRemove={removeDetalle}
        error={formErrors.detalles}
      />

      {/* Sucursales */}
      <MultiSelectCheckbox
        label="Sucursales"
        options={sucursales
          .map(s => ({label: s.nombre, value: s.id}))
          .sort((a, b) => a.label.localeCompare(b.label))}
        value={idSucursales}
        onChange={setIdSucursales}
        error={formErrors.idSucursales}
        disabled={isEdit}
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
          {isEdit ? 'Guardar cambios' : 'Crear promoción'}
        </Button>
      </div>
    </form>
  )
}
