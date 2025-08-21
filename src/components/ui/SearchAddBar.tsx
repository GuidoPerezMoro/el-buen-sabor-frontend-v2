'use client'

import SearchBar, {SearchBarProps} from '@/components/ui/SearchBar'
import Filter from '@/components/ui/Filter'
import Button from '@/components/ui/Button'
import {Plus} from 'lucide-react'
import useIsMdUp from '@/hooks/useIsMdUp'

export interface SearchAddBarProps
  extends Pick<SearchBarProps, 'value' | 'onChange' | 'placeholder'> {
  onAdd: () => void
  addLabel?: string
  showFilter?: boolean
  filterOptions?: ReadonlyArray<string | {value: string; label: string}>
  filterValue?: string | {value: string; label: string} | null
  onFilterChange?: (val: string | {value: string; label: string}) => void
  filterPlaceholder?: string
  filterSearchable?: boolean
  filterLabel?: string // e.g. "Tipo"
}

export default function SearchAddBar({
  value,
  onChange,
  placeholder,
  onAdd,
  addLabel = 'Nuevo',
  showFilter = false,
  filterOptions,
  filterValue = null,
  onFilterChange,
  filterPlaceholder = 'Filtro',
  filterSearchable,
}: SearchAddBarProps) {
  const isMdUp = useIsMdUp()

  return (
    <div className="flex items-stretch gap-2 h-9 mb-4 md:h-auto">
      <SearchBar value={value} onChange={onChange} placeholder={placeholder} />
      {showFilter && filterOptions && onFilterChange && (
        <Filter
          options={filterOptions}
          value={filterValue}
          onChange={onFilterChange}
          placeholder={filterPlaceholder}
          searchable={filterSearchable}
        />
      )}
      <Button
        variant="primary"
        icon={<Plus size={16} />}
        onClick={onAdd}
        className="flex items-center gap-1 px-4 whitespace-nowrap h-full"
      >
        {isMdUp && addLabel}
      </Button>
    </div>
  )
}
