'use client'

import React, {useState, useEffect, forwardRef, Ref, useRef, useImperativeHandle} from 'react'
import {cn} from '@/lib/utils'

type BaseOption = string | {value: string; label: string}

interface DropdownProps<T extends BaseOption> {
  options: T[]
  value: T | null
  onChange: (val: T) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

type DropdownComponent = <T extends BaseOption>(
  props: DropdownProps<T> & {ref?: Ref<HTMLDivElement>}
) => React.ReactElement | null

const _Dropdown = forwardRef<HTMLDivElement, DropdownProps<BaseOption>>(
  ({options, value, onChange, placeholder = '', disabled = false, className}, ref) => {
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
    const [filter, setFilter] = useState(selectedLabel)

    // Reset filter when selection or open state changes
    useEffect(() => {
      if (!isOpen) setFilter(selectedLabel)
    }, [selectedLabel, isOpen])

    const filtered = normalized.filter(o => o.label.toLowerCase().includes(filter.toLowerCase()))

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
            'w-full px-3 py-2 border rounded-md text-sm transition focus:outline-none focus:ring-2',
            disabled
              ? 'border-muted focus:ring-muted cursor-not-allowed'
              : 'border-muted focus:ring-primary'
          )}
          placeholder={placeholder}
          value={filter}
          disabled={disabled}
          onFocus={() => !disabled && setIsOpen(true)}
          onChange={e => {
            setFilter(e.target.value)
            setIsOpen(true)
          }}
        />

        {isOpen && !disabled && (
          <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-background border border-muted shadow-lg">
            {filtered.map(o => (
              <li
                key={o.value}
                className="px-3 py-2 text-sm text-text hover:bg-surfaceHover cursor-pointer"
                onMouseDown={e => {
                  e.preventDefault()
                  onChange(o.original as any)
                  setIsOpen(false)
                }}
              >
                {o.label}
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted cursor-default">No options</li>
            )}
          </ul>
        )}
      </div>
    )
  }
)

const Dropdown = _Dropdown as DropdownComponent
export default Dropdown

/* 
  // Future expansions:
  // - Make it fully generic so extra data flows through `T`
  // - Add render props for custom option layouts
  // - Size / color variants via extra props
*/
