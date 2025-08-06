'use client'

import SearchBar, {SearchBarProps} from '@/components/ui/SearchBar'
import Button from '@/components/ui/Button'
import {Plus} from 'lucide-react'
import useIsMdUp from '@/hooks/useIsMdUp'

export interface SearchAddBarProps
  extends Pick<SearchBarProps, 'value' | 'onChange' | 'placeholder'> {
  onAdd: () => void
  addLabel?: string
}

export default function SearchAddBar({
  value,
  onChange,
  placeholder,
  onAdd,
  addLabel = 'Nuevo',
}: SearchAddBarProps) {
  const isMdUp = useIsMdUp()

  return (
    <div className="flex items-stretch gap-2 h-9 mb-4 md:h-auto">
      <SearchBar value={value} onChange={onChange} placeholder={placeholder} />
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
