'use client'

import React, {useState, useEffect, forwardRef} from 'react'
import {cn} from '@/lib/utils'

type OptionType = string | {value: string; label: string}

interface DropdownProps {
  /** list of options (string or { value,label }) */
  options: OptionType[]
  /** current selection (string or object) */
  value: OptionType | null
  /** callback with the same type you passed in */
  onChange: (val: OptionType) => void
  /** placeholder when nothing’s selected */
  placeholder?: string
  /** disable all interaction */
  disabled?: boolean
  /** extra wrapper classes */
  className?: string
}

const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  ({options, value, onChange, placeholder = '', disabled = false, className}, ref) => {
    // normalize all options to have { value, label, original }
    const normalized = options.map(opt =>
      typeof opt === 'string'
        ? {value: opt, label: opt, original: opt}
        : {value: opt.value, label: opt.label, original: opt}
    )

    // figure out the currently selected label
    const selectedValue = value == null ? '' : typeof value === 'string' ? value : value.value
    const selectedOption = normalized.find(o => o.value === selectedValue)
    const selectedLabel = selectedOption?.label ?? ''

    const [isOpen, setIsOpen] = useState(false)
    const [filter, setFilter] = useState(selectedLabel)

    // whenever we close or the selection changes, reset input to show selectedLabel
    useEffect(() => {
      if (!isOpen) setFilter(selectedLabel)
    }, [selectedLabel, isOpen])

    const filtered = normalized.filter(o => o.label.toLowerCase().includes(filter.toLowerCase()))

    return (
      <div
        ref={ref}
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
                  // use onMouseDown so blur doesn’t fire first
                  e.preventDefault()
                  onChange(o.original)
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

Dropdown.displayName = 'Dropdown'
export default Dropdown

/* 
  // Future expansions:
  // - make it generic so `OptionType` can carry extra data
  // - add custom renderProp for options
  // - size/variant props
*/
