'use client'

import {useMemo, useState} from 'react'
import Dropdown from '@/components/ui/Dropdown'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

type DD = {value: string; label: string}
type Row = {idArticulo: number; cantidad: number}

type Props = {
  articuloOptions: DD[]
  detalles: Row[]
  onAdd: (idArticulo: number, cantidad: number) => void
  onChangeCantidad: (idArticulo: number, cantidad: number | '') => void
  onRemove: (idArticulo: number) => void
  error?: string
}

export default function PromoDetallesEditor({
  articuloOptions,
  detalles,
  onAdd,
  onChangeCantidad,
  onRemove,
  error,
}: Props) {
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
    const qty = Number(addProdQty)
    if (!id || !qty || qty <= 0) return
    onAdd(id, qty)
    setAddProd(null)
    setAddProdQty('')
  }

  const handleAddInsumo = () => {
    const id = Number(addInsumo?.value)
    const qty = Number(addInsumoQty)
    if (!id || !qty || qty <= 0) return
    onAdd(id, qty)
    setAddInsumo(null)
    setAddInsumoQty('')
  }

  return (
    <div className="space-y-2">
      <h3 className="text-base md:text-lg font-semibold text-text tracking-tight">
        Artículos en la promo
      </h3>

      {detalles.length === 0 && <p className="text-sm text-muted">Aún no agregaste artículos.</p>}

      {detalles.map(d => {
        const label =
          articuloOptions.find(o => Number(o.value) === d.idArticulo)?.label ?? `#${d.idArticulo}`
        return (
          <div key={d.idArticulo} className="grid grid-cols-[1fr_auto_auto] items-center gap-3">
            <div className="text-sm">{label}</div>
            <div className="w-24">
              <Input
                type="number"
                inputMode="decimal"
                value={String(d.cantidad)}
                onChange={e => onChangeCantidad(d.idArticulo, e.currentTarget.valueAsNumber || 0)}
                placeholder="Cant."
              />
            </div>
            <Button type="button" variant="secondary" onClick={() => onRemove(d.idArticulo)}>
              Quitar
            </Button>
          </div>
        )
      })}

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
            <Input
              type="number"
              inputMode="decimal"
              value={addProdQty === '' ? '' : String(addProdQty)}
              onChange={e =>
                setAddProdQty(e.currentTarget.value === '' ? '' : e.currentTarget.valueAsNumber)
              }
              placeholder="Cant."
            />
          </div>
          <Button
            type="button"
            variant="primary"
            onClick={handleAddProd}
            disabled={!addProd || !addProdQty}
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
            <Input
              type="number"
              inputMode="decimal"
              value={addInsumoQty === '' ? '' : String(addInsumoQty)}
              onChange={e =>
                setAddInsumoQty(e.currentTarget.value === '' ? '' : e.currentTarget.valueAsNumber)
              }
              placeholder="Cant."
            />
          </div>
          <Button
            type="button"
            variant="primary"
            onClick={handleAddInsumo}
            disabled={!addInsumo || !addInsumoQty}
          >
            Agregar
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  )
}
