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
  // local add state
  const [addProd, setAddProd] = useState<DD | null>(null)
  const [addProdQty, setAddProdQty] = useState<number | ''>('')
  const [addInsumo, setAddInsumo] = useState<DD | null>(null)
  const [addInsumoQty, setAddInsumoQty] = useState<number | ''>('')

  // prevent duplicates
  const taken = useMemo(() => new Set(detalles.map(d => d.idArticulo)), [detalles])
  const addable = useMemo(
    () => articuloOptions.filter(o => !taken.has(Number(o.value))),
    [articuloOptions, taken]
  )

  // split options by type (based on label suffix added upstream: [Prod] / [Insumo])
  const prodOptions = useMemo(() => addable.filter(o => /\[Prod\]\s*$/.test(o.label)), [addable])
  const insumoOptions = useMemo(
    () => addable.filter(o => /\[Insumo\]\s*$/.test(o.label)),
    [addable]
  )
  const showDivider = prodOptions.length > 0 && insumoOptions.length > 0

  const handleAddProd = () => {
    const id = Number(addProd?.value)
    const qty = isTwoForOne ? 2 : Number(addProdQty)
    if (!id || !qty || qty <= 0) return
    onAdd(id, qty)
    setAddProd(null)
    setAddProdQty('')
  }

  const handleAddInsumo = () => {
    const id = Number(addInsumo?.value)
    const qty = isTwoForOne ? 2 : Number(addInsumoQty)
    if (!id || !qty || qty <= 0) return
    onAdd(id, qty)
    setAddInsumo(null)
    setAddInsumoQty('')
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

      {/* --- Add controls: Productos --- */}
      {prodOptions.length > 0 && (
        <div className="flex flex-wrap items-end gap-2 mt-3">
          <div className="min-w-[280px] flex-1">
            <Dropdown
              label="Producto"
              placeholder="Selecciona un producto"
              options={prodOptions}
              value={addProd}
              onChange={v => setAddProd(v as DD)}
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
                value={addProdQty === '' ? '' : String(addProdQty)}
                onChange={e =>
                  setAddProdQty(e.currentTarget.value === '' ? '' : e.currentTarget.valueAsNumber)
                }
                placeholder="Cant."
              />
            )}
          </div>
          <Button
            type="button"
            variant="primary"
            onClick={handleAddProd}
            disabled={!addProd || (!isTwoForOne && !addProdQty)}
          >
            Agregar
          </Button>
        </div>
      )}
      {/* Divider shown only when both groups exist */}
      {showDivider && (
        <div className="my-2 h-px w-full bg-border" role="separator" aria-hidden="true" />
      )}
      {/* --- Add controls: Insumos --- */}
      {insumoOptions.length > 0 && (
        <div className="flex flex-wrap items-end gap-2 mt-1">
          <div className="min-w-[280px] flex-1">
            <Dropdown
              label="Insumo"
              placeholder="Selecciona un insumo"
              options={insumoOptions}
              value={addInsumo}
              onChange={v => setAddInsumo(v as DD)}
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
                value={addInsumoQty === '' ? '' : String(addInsumoQty)}
                onChange={e =>
                  setAddInsumoQty(e.currentTarget.value === '' ? '' : e.currentTarget.valueAsNumber)
                }
                placeholder="Cant."
              />
            )}
          </div>
          <Button
            type="button"
            variant="primary"
            onClick={handleAddInsumo}
            disabled={!addInsumo || (!isTwoForOne && !addInsumoQty)}
          >
            Agregar
          </Button>
        </div>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  )
}
