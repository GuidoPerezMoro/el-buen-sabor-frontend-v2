'use client'

import {ReactNode, useEffect} from 'react'
import {X} from 'lucide-react'
import {cn} from '@/lib/utils'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

export default function Drawer({isOpen, onClose, children}: DrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])
  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/30 z-40 transition-opacity',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 z-50 transform transition-transform',
          'bg-background/90 backdrop-blur-sm',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex justify-end p-4">
          <button onClick={onClose} aria-label="Cerrar menú">
            <X className="w-6 h-6 text-text" />
          </button>
        </div>
        {children}
      </aside>
    </>
  )
}
