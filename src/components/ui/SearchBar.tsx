'use client'

import Input from '@/components/ui/Input'
import SearchIcon from '@/assets/icons/search.svg'

export interface SearchBarProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
}

export default function SearchBar({value, onChange, placeholder = 'Search...'}: SearchBarProps) {
  return (
    <Input
      className="flex-1"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      iconRight={<SearchIcon size={20} />}
    />
  )
}
