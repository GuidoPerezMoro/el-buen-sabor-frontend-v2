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
} from 'react'
import {createPortal} from 'react-dom'
import {cn} from '@/lib/utils'
import ChevronDownIcon from '@/assets/icons/chevron-down.svg'

type BaseOption = string | {value: string; label: string}

interface DropdownProps<T extends BaseOption> {
  options: T[]
  value: T | null
  onChange: (val: T) => void
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  searchable?: boolean
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
    const selectedLabel = selectedOption?.label ?? ''

    const [isOpen, setIsOpen] = useState(false)
    const [filter, setFilter] = useState(searchable ? selectedLabel : '')

    // Wrapper/input ref
    const wrapperRef = useRef<HTMLDivElement>(null)
    useImperativeHandle(ref, () => wrapperRef.current!)

    // DOM ref for menu (in portal)
    const menuRef = useRef<HTMLUListElement>(null)

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
        {label && <label className="block mb-1 text-sm font-medium text-text">{label}</label>}
        <div ref={wrapperRef} className="relative inline-block w-full" tabIndex={-1}>
          <input
            type="text"
            className={cn(
              'w-full px-3 pr-8 py-2 border rounded-md text-sm transition focus:outline-none focus:ring-2 disabled:opacity-50',
              error ? 'border-danger focus:ring-danger' : 'border-muted focus:ring-primary',
              disabled && 'cursor-not-allowed'
            )}
            placeholder={placeholder}
            value={searchable ? filter : selectedLabel}
            disabled={disabled}
            onFocus={() => !disabled && setIsOpen(true)}
            onClick={() => !disabled && setIsOpen(true)}
            onChange={e => {
              if (!searchable) return
              setFilter(e.target.value)
              setIsOpen(true)
            }}
            readOnly={!searchable}
          />

          {/* Arrow icon */}
          <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
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
