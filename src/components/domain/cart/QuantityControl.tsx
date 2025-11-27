'use client'

import {Minus, Plus} from 'lucide-react'
import {cn} from '@/lib/utils'

interface QuantityControlProps {
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
  className?: string
}

export default function QuantityControl({
  value,
  min = 1,
  max,
  onChange,
  className,
}: QuantityControlProps) {
  const clamp = (val: number) => {
    let next = Number.isNaN(val) ? min : val
    if (next < min) next = min
    if (typeof max === 'number' && next > max) next = max
    return next
  }

  const handleInputChange = (raw: string) => {
    const parsed = Number(raw)
    onChange(clamp(parsed))
  }

  const handleStep = (delta: number) => {
    onChange(clamp(value + delta))
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded border border-muted bg-white text-xs',
        className
      )}
    >
      <button
        type="button"
        onClick={() => handleStep(-1)}
        className="inline-flex h-8 w-8 items-center justify-center border-r border-muted/60 text-muted hover:bg-muted/20"
        aria-label="Disminuir cantidad"
      >
        <Minus className="h-3 w-3" />
      </button>

      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={e => handleInputChange(e.target.value)}
        className="h-8 w-14 border-0 bg-transparent text-center text-xs outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />

      <button
        type="button"
        onClick={() => handleStep(1)}
        className="inline-flex h-8 w-8 items-center justify-center border-l border-muted/60 text-muted hover:bg-muted/20"
        aria-label="Aumentar cantidad"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  )
}
