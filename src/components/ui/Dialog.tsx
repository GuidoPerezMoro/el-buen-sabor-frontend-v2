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

  const handleClose = useCallback(() => {
    closeDialog(name)
    onClose()
  }, [closeDialog, name, onClose])

  const handleTrapClick = useCallback(
    (e: SyntheticEvent<HTMLDivElement>) => {
      e.stopPropagation()
      handleClose()
    },
    [handleClose]
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isOpen = isDialogOpened(name)
      if (!isOpen) return

      // Close on ESC anywhere (even if typing)
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
        return
      }

      if (!onPrimary) return
      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable === true

      if (isTyping) return

      if (e.key === 'Enter') {
        e.preventDefault()
        onPrimary()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isDialogOpened, name, onPrimary, handleClose])

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      <div
        className={cn(
          'absolute inset-0 bg-black/10 backdrop-blur-sm transition pointer-events-auto',
          {'opacity-0 !pointer-events-none': !isDialogOpened(name)}
        )}
        onClick={handleTrapClick}
        onWheel={e => e.preventDefault()} // ⬅️ extra safety: don’t scroll the page through dimmer
        onTouchMove={e => e.preventDefault()} // ⬅️ mobile
      />

      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
          'bg-background drop-shadow-lg rounded-md border border-muted',
          'pointer-events-auto scale-100 transition duration-200 overflow-hidden',
          'flex flex-col', // ⬅️ make panel a flex column
          {
            'opacity-0 !pointer-events-none !scale-50': !isDialogOpened(name),
            'h-screen w-screen p-4': fullscreen,
          },
          fullscreen ? 'w-screen h-screen p-4' : 'w-[calc(100vw-2rem)] md:w-auto md:max-w-[80vw]'
        )}
      >
        <div
          onClick={handleClose}
          className="absolute top-3 right-2 text-2xl text-text cursor-pointer z-40"
        >
          <XIcon className="w-8 h-8 text-muted hover:text-text" />
        </div>

        {(Icon || title || message) && (
          <div className="p-4 pb-0 shrink-0">
            {' '}
            {/* ⬅️ header doesn’t scroll */}
            {title && (
              <h2 className="text-lg font-semibold flex items-center gap-2 text-text">
                {Icon && <Icon className={`w-6 h-6 ${iconColor}`} />}
                {title}
              </h2>
            )}
            {message && <p className="text-sm text-muted mt-2">{message}</p>}
          </div>
        )}

        {/* ⬇️ Scrollable content area */}
        <div
          className={cn(
            'p-4 overscroll-contain overflow-y-auto',
            fullscreen
              ? 'flex-1' // fill and scroll inside in fullscreen
              : 'max-h-[70vh]' // cap height in regular mode
          )}
        >
          {children}
        </div>

        {(onPrimary || onSecondary) && (
          <div className="flex justify-end gap-2 px-4 pb-4 pt-0 shrink-0">
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
