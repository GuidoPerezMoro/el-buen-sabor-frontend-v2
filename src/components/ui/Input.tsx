// src/components/ui/Input.tsx
'use client'

import {forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, useState} from 'react'
import {cn} from '@/lib/utils'
import EyeIcon from '@/assets/icons/eye.svg'
import EyeSlashIcon from '@/assets/icons/eye-slash.svg'

type BaseProps = {
  label?: string
  error?: string
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
  prefix?: React.ReactNode // NEW
  suffix?: React.ReactNode // NEW
  multiline?: boolean
  showPasswordToggle?: boolean
}

type InputProps =
  | (BaseProps & {multiline?: false} & InputHTMLAttributes<HTMLInputElement>)
  | (BaseProps & {multiline: true} & TextareaHTMLAttributes<HTMLTextAreaElement>)

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  (
    {
      label,
      error,
      iconLeft,
      iconRight,
      prefix,
      suffix,
      showPasswordToggle = false,
      multiline = false,
      className,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false)

    const isPassword = !multiline && 'type' in props && props.type === 'password'

    const inputType =
      isPassword && showPasswordToggle
        ? showPassword
          ? 'text'
          : 'password'
        : !multiline && 'type' in props
          ? props.type
          : undefined

    const baseClasses =
      'w-full px-3 py-2 border rounded-md text-sm transition focus:outline-none focus:ring-2 disabled:opacity-50'

    const borderClasses = error
      ? 'border-danger focus:ring-danger'
      : 'border-muted focus:ring-primary'

    const inputClasses = cn(baseClasses, borderClasses, className)

    const hasLeftAffix = !!iconLeft || !!prefix
    const hasRightAffix = !!iconRight || !!suffix || (isPassword && showPasswordToggle)

    const inputProps = props as InputHTMLAttributes<HTMLInputElement>

    return (
      <div className="w-full">
        {label && <label className="block mb-1 text-sm font-medium text-text">{label}</label>}

        {multiline ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            className={inputClasses}
            {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <div className="relative w-full flex items-center">
            {(iconLeft || prefix) && (
              <span className="absolute left-2 flex items-center gap-2 text-sm text-muted-foreground">
                {iconLeft}
                {prefix}
              </span>
            )}

            <input
              ref={ref as React.Ref<HTMLInputElement>}
              {...inputProps}
              type={inputType}
              className={cn(
                inputClasses,
                hasLeftAffix ? 'pl-16' : undefined, // roomy enough for tokens/icons
                hasRightAffix ? 'pr-16' : undefined
              )}
            />

            {/* Right affix area (suffix + optional icon/password) */}
            <span className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
              {isPassword && showPasswordToggle ? (
                <button
                  type="button"
                  className="flex items-center justify-center w-8 h-8 bg-transparent hover:bg-gray-200 rounded-full"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-4 h-4 text-gray-700" />
                  ) : (
                    <EyeIcon className="w-4 h-4 text-gray-700" />
                  )}
                </button>
              ) : (
                iconRight
              )}
            </span>
          </div>
        )}

        {error && <p className="mt-1 text-sm text-danger">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
