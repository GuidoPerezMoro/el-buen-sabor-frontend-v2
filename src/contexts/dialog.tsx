import {createContext, ReactNode, useState} from 'react'

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

  return (
    <DialogContext.Provider value={{isDialogOpened, openDialog, closeDialog}}>
      {children}
    </DialogContext.Provider>
  )
}
