'use client'

import {cn} from '@/lib/utils'

type Option = {label: string; value: number}

interface MultiSelectCheckboxProps {
  label?: string
  options: Option[]
  value: number[]
  onChange: (next: number[]) => void
  disabled?: boolean
  error?: string
}

export default function MultiSelectCheckbox({
  label,
  options,
  value,
  onChange,
  disabled = false,
  error,
}: MultiSelectCheckboxProps) {
  const toggle = (id: number) => {
    if (disabled) return
    onChange(value.includes(id) ? value.filter(v => v !== id) : [...value, id])
  }

  return (
    <div className={cn('flex flex-col gap-2', disabled && 'opacity-60')}>
      {label && <label className="text-sm font-medium">{label}</label>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map(opt => (
          <label key={opt.value} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="accent-primary"
              checked={value.includes(opt.value)}
              onChange={() => toggle(opt.value)}
              disabled={disabled}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
