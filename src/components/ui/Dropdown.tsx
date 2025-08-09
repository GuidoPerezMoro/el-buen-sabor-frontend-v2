'use client'

import React, {useState, useEffect, forwardRef, Ref, useRef, useImperativeHandle} from 'react'
import {cn} from '@/lib/utils'
import ChevronDownIcon from '@/assets/icons/chevron-down.svg'

type BaseOption = string | {value: string; label: string}

interface DropdownProps<T extends BaseOption> {
  options: T[]
  value: T | null
  onChange: (val: T) => void
  placeholder?: string
  disabled?: boolean
  searchable?: boolean
  className?: string
}

type DropdownComponent = <T extends BaseOption>(
  props: DropdownProps<T> & {ref?: Ref<HTMLDivElement>}
) => React.ReactElement | null

const _Dropdown = forwardRef<HTMLDivElement, DropdownProps<BaseOption>>(
  (
    {options, value, onChange, placeholder = '', disabled = false, searchable = true, className},
    ref
  ) => {
    // Normalize to {value, label, original}
    const normalized = options.map(opt =>
      typeof opt === 'string'
        ? {value: opt, label: opt, original: opt}
        : {value: opt.value, label: opt.label, original: opt}
    )

    const selectedValue = value == null ? '' : typeof value === 'string' ? value : value.value
    const selectedOption = normalized.find(o => o.value === selectedValue)
    const selectedLabel = selectedOption?.label ?? ''

    const [isOpen, setIsOpen] = useState(false)
    const [filter, setFilter] = useState(searchable ? selectedLabel : '')

    // Reset filter when selection or open state changes
    useEffect(() => {
      if (!isOpen) setFilter(searchable ? selectedLabel : '')
    }, [selectedLabel, isOpen, searchable])

    const filtered = searchable
      ? normalized.filter(o => o.label.toLowerCase().includes(filter.toLowerCase()))
      : normalized

    // Expose wrapper div for ref
    const wrapperRef = useRef<HTMLDivElement>(null)
    useImperativeHandle(ref, () => wrapperRef.current!)

    return (
      <div
        ref={wrapperRef}
        tabIndex={0}
        onBlur={() => setIsOpen(false)}
        className={cn('relative inline-block w-full', className)}
      >
        <input
          type="text"
          className={cn(
            'w-full px-3 pr-4 py-2 border rounded-md text-sm transition focus:outline-none focus:ring-2',
            disabled
              ? 'border-muted focus:ring-muted cursor-not-allowed'
              : 'border-muted focus:ring-primary'
          )}
          placeholder={placeholder}
          value={searchable ? filter : selectedLabel}
          disabled={disabled}
          // Always open on focus/click if not disabled
          onFocus={() => !disabled && setIsOpen(true)}
          onClick={() => !disabled && setIsOpen(true)}
          // Only allow typing if searchable
          onChange={e => {
            if (!searchable) return
            setFilter(e.target.value)
            setIsOpen(true)
          }}
          readOnly={!searchable}
        />

        {/* Arrow icon */}
        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <ChevronDownIcon
            className={cn('w-4 h-4 transition-transform duration-200', {'rotate-180': isOpen})}
          />
        </span>

        {isOpen && !disabled && (
          <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-background border border-muted shadow-lg">
            {filtered.map(o => (
              <li
                key={o.value}
                className="px-3 py-2 text-sm text-text hover:bg-surfaceHover cursor-pointer"
                onMouseDown={e => {
                  e.preventDefault()
                  onChange(o.original)
                  setIsOpen(false)
                }}
              >
                {o.label}
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted cursor-default">No disponible</li>
            )}
          </ul>
        )}
      </div>
    )
  }
)
_Dropdown.displayName = 'Dropdown'

const Dropdown = _Dropdown as DropdownComponent
export default Dropdown

/* 
  // Future posible expansions:
  // - Make it fully generic so extra data flows through `T`
  // - Add render props for custom option layouts
  // - Size / color variants via extra props
*/
