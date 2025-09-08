'use client'

import {ChangeEvent, useEffect, useState} from 'react'
import Input from '@/components/ui/Input'
import Dropdown from '@/components/ui/Dropdown'
import Button from '@/components/ui/Button'
import MultiSelectCheckbox from '@/components/ui/MultiSelectCheckbox'
import DatePicker from '@/components/ui/DatePicker'
import TimePicker from '@/components/ui/TimePicker'
import useDialog from '@/hooks/useDialog'

import {
  Promocion,
  PromocionCreatePayload,
  PromocionUpdatePayload,
  TipoPromocion,
} from '@/services/types/promocion'
import {promocionCreateSchema, promocionUpdateSchema} from '@/schemas/promocionSchema'
import {createPromocion, updatePromocion} from '@/services/promocion'

import {ArticuloInsumo} from '@/services/types/articuloInsumo'
import {ArticuloManufacturado} from '@/services/types/articuloManufacturado'
import {fetchAllArticuloInsumos} from '@/services/articuloInsumo'
import {fetchAllArticuloManufacturados} from '@/services/articuloManufacturado'
import {fetchAllSucursales} from '@/services/sucursal'
import {Sucursal} from '@/services/types'
import {filterArticuloInsumosBySucursalId} from '@/services/articuloInsumo.utils'
import PromocionDetailsEditor from './PromocionDetailsEditor'

type DD = {value: string; label: string}

function toApiTime(t: string) {
  return t.length === 5 ? `${t}:00` : t
}
function fromApiTime(t: string) {
  return t?.slice(0, 5) ?? ''
}

type Props = {
  sucursalId: number
  initialData?: Promocion
  onSuccess?: () => void
  dialogName?: string
}

export default function PromocionForm({sucursalId, initialData, onSuccess, dialogName}: Props) {
  const isEdit = !!initialData
  const {closeDialog} = useDialog()

  // fields
  const [denominacion, setDenominacion] = useState(initialData?.denominacion ?? '')
  const [fechaDesde, setFechaDesde] = useState(initialData?.fechaDesde ?? '')
  const [fechaHasta, setFechaHasta] = useState(initialData?.fechaHasta ?? '')
  const [horaDesde, setHoraDesde] = useState(initialData ? fromApiTime(initialData.horaDesde) : '')
  const [horaHasta, setHoraHasta] = useState(initialData ? fromApiTime(initialData.horaHasta) : '')
  const [descripcion, setDescripcion] = useState(initialData?.descripcionDescuento ?? '')
  const [precioPromo, setPrecioPromo] = useState<string>(
    initialData?.precioPromocional != null ? String(initialData.precioPromocional) : ''
  )
  const [tipo, setTipo] = useState<DD | null>(
    initialData ? {value: initialData.tipoPromocion, label: initialData.tipoPromocion} : null
  )

  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [idSucursales, setIdSucursales] = useState<number[]>(
    initialData ? initialData.sucursales.map(s => s.id) : [sucursalId]
  )

  // detalles (line items)
  type Row = {idArticulo: number; cantidad: number}
  const [detalles, setDetalles] = useState<Row[]>(
    initialData?.detalles?.map(d => ({idArticulo: d.articulo.id, cantidad: d.cantidad})) ?? []
  )

  // options
  // TODO: Update based on enum from type
  const [tipoOptions] = useState<DD[]>([{value: TipoPromocion.HAPPY_HOUR, label: 'Happy Hour'}])
  const [articuloOptions, setArticuloOptions] = useState<DD[]>([])
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // load data
  useEffect(() => {
    ;(async () => {
      const [sucs, insumos, prods] = await Promise.all([
        fetchAllSucursales(),
        fetchAllArticuloInsumos(),
        fetchAllArticuloManufacturados(),
      ])

      setSucursales(sucs)
      // restrict insumos to current sucursal; manufacturados already tied to sucursal
      const insumosHere = filterArticuloInsumosBySucursalId(insumos, sucursalId)

      const opts: DD[] = [
        ...prods.map((p: ArticuloManufacturado) => ({
          value: String(p.id),
          label: `${p.denominacion} [Prod]`,
        })),
        ...insumosHere.map((i: ArticuloInsumo) => ({
          value: String(i.id),
          label: `${i.denominacion} [Insumo]`,
        })),
      ]
      setArticuloOptions(opts)
    })()
  }, [sucursalId])

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
    setTipo(
      initialData ? {value: initialData.tipoPromocion, label: initialData.tipoPromocion} : null
    )
    setIdSucursales(initialData?.sucursales.map(s => s.id) ?? [])
    setDetalles(
      initialData?.detalles?.map(d => ({idArticulo: d.articulo.id, cantidad: d.cantidad})) ?? []
    )
    setFormErrors({})
  }, [isEdit, initialData])

  const updateCantidad = (id: number, qty: number | '') =>
    setDetalles(prev => prev.map(d => (d.idArticulo === id ? {...d, cantidad: qty as number} : d)))
  const removeDetalle = (id: number) => setDetalles(prev => prev.filter(d => d.idArticulo !== id))

  // submit
  // TODO: Fix create
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
        await updatePromocion(initialData.id, parsed.data)
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
        await createPromocion(parsed.data)

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
      {/* Básicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Denominación"
          value={denominacion}
          onChange={e => setDenominacion(e.target.value)}
          error={formErrors.denominacion}
        />
        <Dropdown
          label="Tipo"
          options={tipoOptions}
          value={tipo}
          onChange={v => setTipo(v as DD)}
          placeholder="Selecciona"
          error={formErrors.tipoPromocion}
        />
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
        <Input
          label="Precio promocional"
          type="number"
          inputMode="decimal"
          value={precioPromo}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPrecioPromo(e.target.value)}
          error={formErrors.precioPromocional}
          prefix="$"
        />
        <Input
          label="Descripción (opcional)"
          multiline
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          error={formErrors.descripcionDescuento}
        />
      </div>

      {/* Sucursales */}
      <MultiSelectCheckbox
        label="Sucursales"
        options={sucursales.map(s => ({label: s.nombre, value: s.id}))}
        value={idSucursales}
        onChange={setIdSucursales}
        error={formErrors.idSucursales}
      />

      {/* Detalles */}
      <PromocionDetailsEditor
        articuloOptions={articuloOptions}
        detalles={detalles}
        onAdd={(id, qty) => setDetalles(prev => [...prev, {idArticulo: id, cantidad: qty}])}
        onChangeCantidad={(id, qty) => updateCantidad(id, qty)}
        onRemove={removeDetalle}
        error={formErrors.detalles}
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
