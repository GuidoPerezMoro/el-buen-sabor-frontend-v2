'use client'

import Input from '@/components/ui/Input'
import SearchIcon from '@/assets/icons/search.svg'
import {XIcon} from 'lucide-react'

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
      onKeyDown={e => {
        if (e.key === 'Escape' && value) {
          e.preventDefault()
          onChange('')
        }
      }}
      iconRight={
        <div className="flex items-center gap-1">
          {value && (
            <button
              type="button"
              aria-label="Limpiar búsqueda"
              className="p-1 rounded hover:bg-surfaceHover focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={e => {
                e.preventDefault()
                onChange('')
              }}
            >
              <XIcon className="w-4 h-4 text-muted" />
            </button>
          )}
          <SearchIcon size={20} />
        </div>
      }
    />
  )
}
