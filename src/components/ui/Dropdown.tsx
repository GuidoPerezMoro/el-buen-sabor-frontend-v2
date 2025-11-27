'use client'

import React, {
  useState,
  useEffect,
  useLayoutEffect,
  forwardRef,
  Ref,
  useRef,
  useImperativeHandle,
  useCallback,
  useId,
} from 'react'
import {createPortal} from 'react-dom'
import {cn} from '@/lib/utils'
import ChevronDownIcon from '@/assets/icons/chevron-down.svg'
import {XIcon} from 'lucide-react'

type BaseOption = string | {value: string; label: string}

interface DropdownProps<T extends BaseOption> {
  options: T[]
  value: T | null
  onChange: (val: T | null) => void
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  searchable?: boolean
  clearable?: boolean
  emptyLabel?: string
  className?: string
}

type DropdownComponent = <T extends BaseOption>(
  props: DropdownProps<T> & {ref?: Ref<HTMLDivElement>}
) => React.ReactElement | null

const _Dropdown = forwardRef<HTMLDivElement, DropdownProps<BaseOption>>(
  (
    {
      options,
      value,
      onChange,
      placeholder = '',
      label,
      error,
      disabled = false,
      searchable = true,
      clearable = true,
      emptyLabel = 'Sin selección',
      className,
    },
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
    const selectedLabel =
      selectedOption?.label ??
      (value == null ? '' : typeof value === 'string' ? value : value.label)

    const [isOpen, setIsOpen] = useState(false)
    const [filter, setFilter] = useState(searchable ? selectedLabel : '')

    // Wrapper/input ref
    const wrapperRef = useRef<HTMLDivElement>(null)
    useImperativeHandle(ref, () => wrapperRef.current!)
    const inputRef = useRef<HTMLInputElement>(null)

    // DOM ref for menu (in portal)
    const menuRef = useRef<HTMLUListElement>(null)
    const inputId = useId()
    const listboxId = useId()

    // Reset filter when closing / when selection changes
    useEffect(() => {
      if (!isOpen) setFilter(searchable ? selectedLabel : '')
    }, [selectedLabel, isOpen, searchable])

    const filtered = searchable
      ? normalized.filter(o => o.label.toLowerCase().includes(filter.toLowerCase()))
      : normalized

    // ---------- Portal menu positioning ----------
    const [menuStyle, setMenuStyle] = useState<{
      top: number
      left: number
      width: number
      maxHeight: number
    } | null>(null)

    const computeMenuPos = useCallback(() => {
      if (!wrapperRef.current) return
      const rect = wrapperRef.current.getBoundingClientRect()
      const vwHeight = window.innerHeight

      const margin = 6
      const maxMenu = 320 // px
      const minMenu = 160 // px

      const spaceBelow = vwHeight - rect.bottom - margin
      const spaceAbove = rect.top - margin
      const useBelow = spaceBelow >= Math.min(maxMenu, Math.max(spaceAbove, minMenu))
      const maxHeight = Math.min(maxMenu, useBelow ? spaceBelow : spaceAbove)

      const top = useBelow ? rect.bottom + margin : rect.top - margin - maxHeight
      const left = rect.left
      const width = rect.width

      setMenuStyle({top, left, width, maxHeight})
    }, [])

    useLayoutEffect(() => {
      if (!isOpen) return
      computeMenuPos()
      const handler = () => computeMenuPos()
      window.addEventListener('resize', handler)
      window.addEventListener('scroll', handler, true) // true = capture across scrollable ancestors
      return () => {
        window.removeEventListener('resize', handler)
        window.removeEventListener('scroll', handler, true)
      }
    }, [isOpen, computeMenuPos])

    // Close on outside click (works with portal)
    useEffect(() => {
      if (!isOpen) return
      const onDown = (e: MouseEvent) => {
        const t = e.target as Node
        if (wrapperRef.current?.contains(t)) return
        if (menuRef.current?.contains(t)) return
        setIsOpen(false)
      }
      document.addEventListener('mousedown', onDown)
      return () => document.removeEventListener('mousedown', onDown)
    }, [isOpen])

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <label htmlFor={inputId} className="block mb-1 text-sm font-medium text-text">
            {label}
          </label>
        )}
        <div ref={wrapperRef} className="relative inline-block w-full" tabIndex={-1}>
          <input
            id={inputId}
            ref={inputRef}
            type="text"
            className={cn(
              'w-full px-3 py-2 border rounded-md text-sm transition focus:outline-none focus:ring-2 disabled:opacity-50',
              error ? 'border-danger focus:ring-danger' : 'border-muted focus:ring-primary',
              disabled && 'cursor-not-allowed',
              clearable && (value !== null || (searchable && filter)) ? 'pr-16' : 'pr-8'
            )}
            placeholder={placeholder}
            value={searchable ? filter : selectedLabel}
            disabled={disabled}
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-controls={isOpen ? listboxId : undefined}
            aria-autocomplete={searchable ? 'list' : 'none'}
            onFocus={() => !disabled && setIsOpen(true)}
            onClick={() => !disabled && setIsOpen(true)}
            onChange={e => {
              if (!searchable) return
              setFilter(e.target.value)
              setIsOpen(true)
            }}
            onBlur={() => {
              // if user cleared the text, propagate empty selection
              if (searchable && filter.trim() === '') {
                onChange(null)
              }
            }}
            readOnly={!searchable}
          />

          {/* Clear button (opt-in) */}
          {clearable && !disabled && (value !== null || (searchable && filter)) && (
            <button
              type="button"
              aria-label="Limpiar selección"
              className="absolute right-8 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-surfaceHover focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()
                setFilter('')
                onChange(null)
                setIsOpen(false)
                inputRef.current?.focus()
              }}
            >
              <XIcon className="w-4 h-4 text-muted" />
            </button>
          )}

          {/* Arrow icon */}
          <span
            className={cn(
              'absolute top-1/2 -translate-y-1/2 pointer-events-none',
              clearable ? 'right-2' : 'right-2'
            )}
          >
            <ChevronDownIcon
              className={cn('w-4 h-4 transition-transform duration-200', {'rotate-180': isOpen})}
            />
          </span>

          {/* Portal menu */}
          {isOpen &&
            !disabled &&
            menuStyle &&
            createPortal(
              <ul
                ref={menuRef}
                id={listboxId}
                role="listbox"
                style={{
                  position: 'fixed',
                  top: menuStyle.top,
                  left: menuStyle.left,
                  width: menuStyle.width,
                  maxHeight: menuStyle.maxHeight,
                }}
                className={cn(
                  'z-[60] overflow-auto rounded-md bg-background border border-muted shadow-lg',
                  'overscroll-contain'
                )}
                // keep focus on input so onBlur doesn’t instantly close
                onMouseDown={e => e.preventDefault()}
                onWheel={e => e.stopPropagation()}
                onTouchMove={e => e.stopPropagation()}
              >
                {/* Non-searchable can expose an explicit empty option when clearable */}
                {!searchable && clearable && (
                  <li
                    key="__empty__"
                    className="px-3 py-2 text-sm text-muted hover:bg-surfaceHover cursor-pointer italic"
                    onMouseDown={e => {
                      e.preventDefault()
                      onChange(null)
                      setIsOpen(false)
                      setFilter('') // keep input visually empty
                    }}
                  >
                    {emptyLabel}
                  </li>
                )}
                {filtered.length === 0 && (
                  <li className="px-3 py-2 text-sm text-muted cursor-default">No disponible</li>
                )}
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
              </ul>,
              document.body
            )}
        </div>
        {error && <p className="mt-1 text-sm text-danger">{error}</p>}
      </div>
    )
  }
)
_Dropdown.displayName = 'Dropdown'
const Dropdown = _Dropdown as DropdownComponent
export default Dropdown
