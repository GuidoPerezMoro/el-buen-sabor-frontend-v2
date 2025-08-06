'use client'

import {cn} from '@/lib/utils'
import React from 'react'

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  variant?: 'ghost' | 'surface'
  size?: 'sm' | 'md'
}

export default function IconButton({
  icon,
  variant = 'ghost',
  size = 'md',
  className,
  ...rest
}: IconButtonProps) {
  const padding = size === 'sm' ? 'p-1' : 'p-2'
  return (
    <button
      {...rest}
      className={cn(
        padding,
        'rounded-full transition-colors',
        variant === 'ghost' ? 'hover:bg-muted' : 'bg-surface',
        className
      )}
    >
      {icon}
    </button>
  )
}
