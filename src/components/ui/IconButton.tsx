'use client'

import {cn} from '@/lib/utils'
import React from 'react'

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  variant?: 'ghost' | 'surface'
}

export default function IconButton({icon, variant = 'ghost', className, ...rest}: IconButtonProps) {
  return (
    <button
      {...rest}
      className={cn(
        'p-2 rounded-full transition-colors',
        variant === 'ghost' ? 'hover:bg-surfaceHover' : 'bg-surface',
        className
      )}
    >
      {icon}
    </button>
  )
}
