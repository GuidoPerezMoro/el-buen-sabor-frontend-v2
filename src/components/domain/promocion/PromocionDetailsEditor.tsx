'use client'

import {useMemo, useState} from 'react'
import {formatARS} from '@/lib/format'
import Dropdown from '@/components/ui/Dropdown'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import {TipoPromocion} from '@/services/types/promocion'

type DD = {value: string; label: string}
type Row = {idArticulo: number; cantidad: number}

type Props = {
  articuloOptions: DD[]
  detalles: Row[]
  labelById?: Record<number, string>
  precioById?: Record<number, number>
  tipoPromocion?: TipoPromocion
  onAdd: (idArticulo: number, cantidad: number) => void
  onChangeCantidad: (idArticulo: number, cantidad: number | '') => void
  onRemove: (idArticulo: number) => void
  error?: string
}

export default function PromoDetallesEditor({
  articuloOptions,
  detalles,
  labelById,
  precioById,
  tipoPromocion,
  onAdd,
  onChangeCantidad,
  onRemove,
  error,
}: Props) {
  const isTwoForOne = tipoPromocion === TipoPromocion.DOSXUNO

  // Estado local para agregar un único artículo (producto o insumo)
  const [addArticulo, setAddArticulo] = useState<DD | null>(null)
  const [addQty, setAddQty] = useState<number | ''>('')

  // prevent duplicates
  const taken = useMemo(() => new Set(detalles.map(d => d.idArticulo)), [detalles])

  const addable = useMemo(
    () => articuloOptions.filter(o => !taken.has(Number(o.value))),
    [articuloOptions, taken]
  )

  const handleAddArticulo = () => {
    const id = Number(addArticulo?.value)
    const qty = isTwoForOne ? 2 : Number(addQty)
    if (!id || !qty || qty <= 0) return
    onAdd(id, qty)
    setAddArticulo(null)
    setAddQty('')
  }

  const totalSinDesc = detalles.reduce((acc, d) => {
    const unit = precioById?.[d.idArticulo] ?? 0
    return acc + unit * d.cantidad
  }, 0)

  return (
    <div className="space-y-2">
      <h3 className="text-base md:text-lg font-semibold text-text tracking-tight">
        Artículos en la promo
      </h3>
      {detalles.length === 0 && <p className="text-sm text-muted">Aún no agregaste artículos.</p>}
      {detalles.map(d => {
        const label =
          labelById?.[d.idArticulo] ??
          articuloOptions.find(o => Number(o.value) === d.idArticulo)?.label ??
          `#${d.idArticulo}`
        const unitPrice = precioById?.[d.idArticulo]
        const subtotal = (unitPrice ?? 0) * d.cantidad
        return (
          <div
            key={d.idArticulo}
            className="grid grid-cols-[1.4fr_auto_auto_auto] items-center gap-3"
          >
            <div className="text-sm">
              <div>{label}</div>
              <div className="text-xs text-muted">
                {unitPrice != null ? `Precio: ${formatARS(unitPrice)}` : 'Sin precio definido'}
              </div>
            </div>
            <div className="w-24">
              <Input
                type="number"
                inputMode="decimal"
                value={String(d.cantidad)}
                onChange={e =>
                  onChangeCantidad(
                    d.idArticulo,
                    e.currentTarget.value === '' ? '' : e.currentTarget.valueAsNumber
                  )
                }
                placeholder="Cant."
                disabled={isTwoForOne}
              />
            </div>
            <div className="w-28 text-sm text-muted">
              {subtotal > 0 ? formatARS(subtotal) : '—'}
            </div>
            <Button type="button" variant="secondary" onClick={() => onRemove(d.idArticulo)}>
              Quitar
            </Button>
          </div>
        )
      })}

      {/* Subtotal sin descuento */}
      {detalles.length > 0 && (
        <div className="pt-2 text-sm font-medium flex justify-end">
          <span className="text-muted mr-2">Total sin descuento:</span>
          <span>{formatARS(totalSinDesc)}</span>
        </div>
      )}

      {/* --- Add controls: único selector (producto o insumo) --- */}
      {addable.length > 0 && (
        <div className="flex flex-wrap items-end gap-2 mt-3">
          <div className="min-w-[280px] flex-1">
            <Dropdown
              label="Artículo"
              placeholder="Selecciona un producto o insumo"
              options={addable}
              value={addArticulo}
              onChange={v => setAddArticulo(v as DD)}
              searchable
            />
          </div>
          <div className="w-28">
            {isTwoForOne ? (
              <Input label="Cantidad" value="2" disabled />
            ) : (
              <Input
                type="number"
                label="Cantidad"
                inputMode="decimal"
                value={addQty === '' ? '' : String(addQty)}
                onChange={e =>
                  setAddQty(e.currentTarget.value === '' ? '' : e.currentTarget.valueAsNumber)
                }
                placeholder="Cant."
              />
            )}
          </div>
          <Button
            type="button"
            variant="primary"
            onClick={handleAddArticulo}
            disabled={!addArticulo || (!isTwoForOne && !addQty)}
          >
            Agregar
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  )
}
