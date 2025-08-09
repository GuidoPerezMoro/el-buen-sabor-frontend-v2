'use client'

import Dropdown from '@/components/ui/Dropdown'
import {cn} from '@/lib/utils'

type Opt = string | {value: string; label: string}

interface FilterDropdownProps {
  options: ReadonlyArray<Opt>
  value: Opt | null
  onChange: (val: Opt) => void
  placeholder?: string
  searchable?: boolean
  label?: string // e.g., "Tipo"
  className?: string // extra width overrides if needed
  showLabelOnMobile?: boolean // default false (label hidden < md)
}

export default function FilterDropdown({
  options,
  value,
  onChange,
  placeholder = 'Filtro',
  searchable = true,
  label,
  className,
  showLabelOnMobile = false,
}: FilterDropdownProps) {
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
        className={cn('w-[118px] sm:w-[150px]', className)}
      />
    </div>
  )
}
