import {Loader2, AlertTriangle, FolderMinus} from 'lucide-react'
import {cn} from '@/lib/utils'

interface StatusMessageProps {
  type: 'loading' | 'empty' | 'error'
  title?: string
  message?: string
  className?: string
}

export default function StatusMessage({type, title, message, className}: StatusMessageProps) {
  const iconMap = {
    loading: <Loader2 className="w-10 h-10 text-primary animate-spin" />,
    error: <AlertTriangle className="w-10 h-10 text-danger" />,
    empty: <FolderMinus className="w-10 h-10 text-text" />,
  }

  const defaultTitles = {
    loading: 'Cargando...',
    error: 'Ocurrió un error. Intente nuevamente más tarde.',
    empty: 'No hay datos disponibles',
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-4 rounded-md border border-dashed border-border bg-muted',
        className
      )}
    >
      <div className="mb-4">{iconMap[type]}</div>
      <h3 className="text-lg font-semibold">{title ?? defaultTitles[type]}</h3>
      {message && <p className="text-sm text-text mt-1">{message}</p>}
    </div>
  )
}
