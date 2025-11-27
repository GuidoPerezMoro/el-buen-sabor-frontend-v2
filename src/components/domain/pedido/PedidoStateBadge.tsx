'use client'

import {cn} from '@/lib/utils'
import {EstadoPedido} from '@/services/types/pedido'
import {getEstadoPedidoLabel} from '@/services/pedido.utils'

const estadoClasses: Record<EstadoPedido, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-900 border-amber-300',
  PREPARACION: 'bg-blue-100 text-blue-900 border-blue-300',
  TERMINADO: 'bg-slate-100 text-slate-900 border-slate-300',
  FACTURADO: 'bg-indigo-100 text-indigo-900 border-indigo-300',
  CANCELADO: 'bg-red-100 text-red-900 border-red-300',
  RECHAZADO: 'bg-red-100 text-red-900 border-red-300',
  ENTREGADO: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  DELIVERY: 'bg-teal-100 text-teal-900 border-teal-300',
}

interface Props {
  estado: EstadoPedido
  className?: string
}

export default function PedidoStateBadge({estado, className}: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        estadoClasses[estado],
        className
      )}
    >
      {getEstadoPedidoLabel(estado)}
    </span>
  )
}
