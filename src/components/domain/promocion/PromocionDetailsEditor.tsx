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
  const [addArticulo, setAddArticulo] = useState<DD | null>(null)
  const [addCantidad, setAddCantidad] = useState<number | ''>('')

  // prevent duplicates
  const taken = useMemo(() => new Set(detalles.map(d => d.idArticulo)), [detalles])
  const addable = useMemo(
    () => articuloOptions.filter(o => !taken.has(Number(o.value))),
    [articuloOptions, taken]
  )

  const handleAdd = () => {
    const id = Number(addArticulo?.value)
    const qty = Number(addCantidad)
    if (!id || !qty || qty <= 0) return
    onAdd(id, qty)
    setAddArticulo(null)
    setAddCantidad('')
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-text">Artículos en la promo</label>

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

      <div className="flex flex-wrap items-end gap-2 mt-2">
        <div className="min-w-[280px] flex-1">
          <Dropdown
            label="Artículo"
            placeholder="Selecciona"
            options={addable}
            value={addArticulo}
            onChange={v => setAddArticulo(v as DD)}
            searchable
          />
        </div>
        <div className="w-28">
          <Input
            type="number"
            inputMode="decimal"
            value={addCantidad === '' ? '' : String(addCantidad)}
            onChange={e =>
              setAddCantidad(e.currentTarget.value === '' ? '' : e.currentTarget.valueAsNumber)
            }
            placeholder="Cant."
          />
        </div>
        <Button
          type="button"
          variant="primary"
          onClick={handleAdd}
          disabled={!addArticulo || !addCantidad}
        >
          Agregar
        </Button>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  )
}
