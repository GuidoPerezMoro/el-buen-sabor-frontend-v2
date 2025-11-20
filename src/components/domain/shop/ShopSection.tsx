'use client'

import {ReactNode, useState} from 'react'
import {ChevronDown} from 'lucide-react'
import {cn} from '@/lib/utils'

interface ShopSectionProps {
  title: string

  count?: number
  collapsible?: boolean
  defaultOpen?: boolean
  children: ReactNode
}

export default function ShopSection({
  title,

  count,
  collapsible = true,
  defaultOpen = true,
  children,
}: ShopSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  const handleToggle = () => {
    if (!collapsible) return
    setOpen(prev => !prev)
  }

  return (
    <section className="space-y-2">
      <button
        type="button"
        className={cn(
          'flex w-full items-center justify-between gap-2 text-left',
          collapsible && 'cursor-pointer'
        )}
        onClick={handleToggle}
        aria-expanded={open}
      >
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <div className="flex items-center gap-3">
          {typeof count === 'number' && (
            <span className="text-xs text-muted whitespace-nowrap">{count} items</span>
          )}
          {collapsible && (
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted transition-transform',
                open ? 'rotate-0' : '-rotate-90'
              )}
            />
          )}
        </div>
      </button>

      {open && <div>{children}</div>}
    </section>
  )
}
