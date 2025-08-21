import {createContext, ReactNode, useState, useEffect} from 'react'

interface IDialogContext {
  isDialogOpened: (name: string) => boolean
  openDialog: (name: string) => void
  closeDialog: (name: string) => void
}

type DialogProviderProps = {
  children: ReactNode
}

export const DialogContext = createContext({} as IDialogContext)

export function DialogProvider({children}: DialogProviderProps) {
  const [visibleDialogs, setVisibleDialogs] = useState<string[]>([])

  const openDialog = (name: string) => {
    if (visibleDialogs.includes(name)) return
    setVisibleDialogs([...visibleDialogs, name])
  }

  const closeDialog = (name: string) => {
    setVisibleDialogs(prev => prev.filter(dialog => dialog !== name))
  }

  const isDialogOpened = (name: string) => visibleDialogs.includes(name)

  // Lock body scroll while any dialog is open
  useEffect(() => {
    if (typeof window === 'undefined') return
    const body = document.body
    const prevOverflow = body.style.overflow
    const prevPaddingRight = body.style.paddingRight

    if (visibleDialogs.length > 0) {
      const scrollBarW = window.innerWidth - document.documentElement.clientWidth
      body.style.overflow = 'hidden'
      if (scrollBarW > 0) body.style.paddingRight = `${scrollBarW}px`
    } else {
      body.style.overflow = prevOverflow
      body.style.paddingRight = prevPaddingRight
    }

    // Cleanup on unmount
    return () => {
      body.style.overflow = prevOverflow
      body.style.paddingRight = prevPaddingRight
    }
  }, [visibleDialogs.length])

  return (
    <DialogContext.Provider value={{isDialogOpened, openDialog, closeDialog}}>
      {children}
    </DialogContext.Provider>
  )
}
