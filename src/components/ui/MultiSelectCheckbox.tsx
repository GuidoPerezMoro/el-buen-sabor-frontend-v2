'use client'

type Option = {label: string; value: number}

interface MultiSelectCheckboxProps {
  label?: string
  options: Option[]
  value: number[]
  onChange: (next: number[]) => void
  error?: string
}

export default function MultiSelectCheckbox({
  label,
  options,
  value,
  onChange,
  error,
}: MultiSelectCheckboxProps) {
  const toggle = (id: number) => {
    onChange(value.includes(id) ? value.filter(v => v !== id) : [...value, id])
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map(opt => (
          <label key={opt.value} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="accent-primary"
              checked={value.includes(opt.value)}
              onChange={() => toggle(opt.value)}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
