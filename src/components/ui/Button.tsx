'use client'

import {cn} from '@/lib/utils'
import {ButtonHTMLAttributes, ReactNode} from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'base' | 'sm'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  loading?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'base',
  icon,
  loading = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-primary text-white hover:bg-primaryHover focus:ring-primary',
    secondary: 'bg-surface text-text hover:bg-surfaceHover focus:ring-surfaceHover',
    ghost: 'bg-transparent text-text hover:bg-muted focus:ring-muted',
    danger: 'bg-danger text-white hover:bg-dangerHover focus:ring-dangerHover',
  }

  const sizes: Record<ButtonSize, string> = {
    base: 'px-4 py-2 text-sm',
    sm: 'px-3 py-1 text-xs',
  }

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
      ) : (
        icon && <span className={children ? 'mr-2' : ''}>{icon}</span>
      )}
      {loading ? 'Cargando...' : children}
    </button>
  )
}
