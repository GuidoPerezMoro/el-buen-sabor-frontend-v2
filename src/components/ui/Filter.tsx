'use client'

import Dropdown from '@/components/ui/Dropdown'
import {cn} from '@/lib/utils'

type Opt = string | {value: string; label: string}

interface FilterProps {
  options: ReadonlyArray<Opt>
  value: Opt | null
  onChange: (val: Opt | null) => void
  placeholder?: string
  searchable?: boolean
  clearable?: boolean
  label?: string // e.g., "Tipo"
  className?: string
  showLabelOnMobile?: boolean
}

export default function Filter({
  options,
  value,
  onChange,
  placeholder = 'Filtro',
  searchable = false,
  clearable = false,
  label,
  className,
  showLabelOnMobile = false,
}: FilterProps) {
  return (
    <div className="flex items-center gap-2">
      {label && (
        <span
          className={cn(
            'text-xs text-muted whitespace-nowrap',
            showLabelOnMobile ? '' : 'hidden md:inline'
          )}
        >
          {label}
        </span>
      )}

      <Dropdown
        options={[...options]}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        searchable={searchable}
        clearable={clearable}
        className={cn('w-[118px] sm:w-[150px]', className)}
      />
    </div>
  )
}
