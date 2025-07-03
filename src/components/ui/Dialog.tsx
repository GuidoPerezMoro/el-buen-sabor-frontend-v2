'use client'

import {PropsWithChildren, SyntheticEvent, useCallback} from 'react'
import {cn} from '@/lib/utils'
import useDialog from '@/hooks/useDialog'
import XIcon from '@/assets/icons/x.svg'
import Button from './Button'

interface DialogProps extends PropsWithChildren {
  name: string
  onClose?: () => void
  fullscreen?: boolean
  // Optional content
  icon?: React.ComponentType<{className?: string}>
  iconColor?: string
  title?: string
  message?: string
  // Optional actions
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
  iconColor = 'text-black',
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

  return (
    <div className="fixed z-50 top-0 left-0 h-screen w-screen pointer-events-none overflow-hidden">
      <div
        className={cn(
          'h-screen w-screen bg-black/10 dark:bg-black/30 backdrop-blur-sm transition duration-400 pointer-events-auto',
          {'opacity-0 !pointer-events-none': !isDialogOpened(name)}
        )}
        onClick={handleTrapClick}
      ></div>
      <div
        className={cn(
          'absolute mx-auto my-auto bg-white dark:bg-gray-900 drop-shadow-lg rounded-md border border-gray-200 dark:border-gray-700 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto scale-100 transition duration-200 overflow-hidden',
          {
            'opacity-0 !pointer-events-none !scale-50': !isDialogOpened(name),
            'h-screen w-screen': fullscreen,
          },
          'max-w-[100vw] w-screen md:w-auto md:max-w-[80vw] md:h-auto'
        )}
      >
        <div
          onClick={handleClose}
          className="absolute top-3 right-2 text-2xl text-zinc-600 dark:text-gray-400 cursor-pointer z-40"
        >
          <XIcon className="w-8 h-8 text-zinc-400 dark:text-gray-500 hover:text-zinc-600 dark:hover:text-gray-300" />
        </div>

        {(Icon || title || message) && (
          <div className="p-4 pb-0">
            {title && (
              <h2 className="text-lg font-semibold flex items-center gap-2">
                {Icon && <Icon className={`w-6 h-6 ${iconColor}`} />}
                {title}
              </h2>
            )}
            {message && <p className="text-sm text-gray-600 mt-2">{message}</p>}
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
