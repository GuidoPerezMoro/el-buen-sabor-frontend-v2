'use client'

import SearchBar from '@/components/ui/SearchBar'
import Filter from '@/components/ui/Filter'
import Toggle from '@/components/ui/Toggle'

type Opt = string | {value: string; label: string}

export interface ShopToolbarProps {
  search: string
  onSearchChange: (val: string) => void
  categoryOptions: ReadonlyArray<Opt>
  categoryValue: Opt | null
  onCategoryChange: (val: Opt | null) => void
  sortByPrice: boolean
  onSortToggle: (checked: boolean) => void
}

export default function ShopToolbar({
  search,
  onSearchChange,
  categoryOptions,
  categoryValue,
  onCategoryChange,
  sortByPrice,
  onSortToggle,
}: ShopToolbarProps) {
  return (
    <section className="mb-4 space-y-3 md:space-y-0 md:flex md:items-center md:justify-between">
      {/* Search takes full width on mobile */}
      <div className="flex-1">
        <SearchBar
          value={search}
          onChange={onSearchChange}
          placeholder="Buscar por nombre, categoría o promoción"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 md:ml-4">
        {/* Category filter */}
        <Filter
          options={categoryOptions}
          value={categoryValue}
          onChange={onCategoryChange}
          placeholder="Todas las categorías"
          label="Categoría"
          clearable
          showLabelOnMobile
        />

        {/* Sort toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted whitespace-nowrap">Ordenar por precio</span>
          <Toggle checked={sortByPrice} onChange={onSortToggle} />
        </div>
      </div>
    </section>
  )
}
