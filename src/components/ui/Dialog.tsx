'use client'

import {PropsWithChildren, SyntheticEvent, useCallback, useEffect} from 'react'
import {cn} from '@/lib/utils'
import useDialog from '@/hooks/useDialog'
import XIcon from '@/assets/icons/x.svg'
import Button from './Button'

interface DialogProps extends PropsWithChildren {
  name: string
  onClose?: () => void
  fullscreen?: boolean
  icon?: React.ComponentType<{className?: string}>
  iconColor?: string
  title?: string
  message?: string
  onSecondary?: () => void
  onPrimary?: () => void
  secondaryLabel?: string
  primaryLabel?: string
  isLoading?: boolean
}

const Dialog = ({
  name,
  children,
  onClose = () => {},
  fullscreen = false,
  icon: Icon,
  iconColor = 'text-text',
  title,
  message,
  onSecondary,
  onPrimary,
  secondaryLabel,
  primaryLabel,
  isLoading = false,
}: DialogProps) => {
  const {isDialogOpened, closeDialog} = useDialog()

  const handleTrapClick = useCallback(
    (e: SyntheticEvent<HTMLDivElement>) => {
      e.stopPropagation()
      closeDialog(name)
      onClose()
    },
    [closeDialog, name, onClose]
  )

  const handleClose = () => {
    closeDialog(name)
    onClose()
  }
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isOpen = isDialogOpened(name)

      if (!isOpen || !onPrimary) return

      const tag = (e.target as HTMLElement).tagName
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA'

      if (isTyping) return

      if (e.key === 'Enter') {
        e.preventDefault()
        onPrimary()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isDialogOpened, name, onPrimary])

  return (
    <div className="fixed z-50 top-0 left-0 h-screen w-screen pointer-events-none overflow-hidden">
      <div
        className={cn(
          'h-screen w-screen bg-black/10 backdrop-blur-sm transition duration-400 pointer-events-auto',
          {'opacity-0 !pointer-events-none': !isDialogOpened(name)}
        )}
        onClick={handleTrapClick}
      />
      <div
        className={cn(
          'absolute mx-auto my-auto bg-background drop-shadow-lg rounded-md border border-muted top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto scale-100 transition duration-200 overflow-hidden',
          {
            'opacity-0 !pointer-events-none !scale-50': !isDialogOpened(name),
            'h-screen w-screen': fullscreen,
          },
          fullscreen ? 'w-screen h-screen p-4' : 'w-screen md:w-auto md:max-w-[80vw] md:h-auto'
        )}
      >
        <div
          onClick={handleClose}
          className="absolute top-3 right-2 text-2xl text-text cursor-pointer z-40"
        >
          <XIcon className="w-8 h-8 text-muted hover:text-text" />
        </div>

        {(Icon || title || message) && (
          <div className="p-4 pb-0">
            {title && (
              <h2 className="text-lg font-semibold flex items-center gap-2 text-text">
                {Icon && <Icon className={`w-6 h-6 ${iconColor}`} />}
                {title}
              </h2>
            )}
            {message && <p className="text-sm text-muted mt-2">{message}</p>}
          </div>
        )}

        {/* Main content */}
        <div className="p-4">{children}</div>

        {(onPrimary || onSecondary) && (
          <div className="flex justify-end gap-2 px-4 pb-4">
            {onSecondary && (
              <Button variant="secondary" onClick={onSecondary}>
                {secondaryLabel || 'Cancelar'}
              </Button>
            )}
            {onPrimary && (
              <Button variant="primary" onClick={onPrimary} loading={isLoading}>
                {primaryLabel || 'Aceptar'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dialog
