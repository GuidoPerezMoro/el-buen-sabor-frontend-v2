'use client'

import {useEffect, useMemo, useState} from 'react'
import {useParams} from 'next/navigation'

import StatusMessage from '@/components/ui/StatusMessage'
import PedidoStateBadge from '@/components/domain/pedido/PedidoStateBadge'
import {formatARS, formatDateDMY, formatTimeHM} from '@/lib/format'
import {Pedido} from '@/services/types/pedido'
import {
  getEstadoPedidoLabel,
  getTipoEnvioLabel,
  getFormaPagoLabel,
  startPedidoPollingById,
} from '@/services/pedido.utils'
import {fetchPedidoById} from '@/services/pedido'

type Params = {
  empresaId: string
  sucursalId: string
  pedidoId: string
}

export default function PedidoSeguimientoPage() {
  const {pedidoId: pid} = useParams<Params>()
  const pedidoId = Number(pid)

  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!pedidoId || Number.isNaN(pedidoId)) {
      setError('Pedido inválido.')
      setLoading(false)
      return
    }

    let stopPolling: (() => void) | undefined
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const p = await fetchPedidoById(pedidoId)
        setPedido(p)
      } catch (e: any) {
        setError(e?.message ?? 'No se pudo cargar el pedido.')
      } finally {
        setLoading(false)
      }

      // Polling ligero para actualizar el estado en tiempo (casi) real.
      stopPolling = startPedidoPollingById(
        pedidoId,
        updated => {
          setPedido(updated)
        },
        {
          intervalMs: 5000,
          immediate: false,
        }
      )
    })()

    return () => {
      if (stopPolling) stopPolling()
    }
  }, [pedidoId])

  if (loading) {
    return <StatusMessage type="loading" title="Confirmando tu pedido..." />
  }

  if (error) {
    return <StatusMessage type="error" message={error} />
  }

  if (!pedido) {
    return (
      <StatusMessage
        type="empty"
        message="No encontramos información para este pedido. Si el problema persiste, vuelve al inicio."
      />
    )
  }

  const fecha = formatDateDMY(pedido.fechaDePedido)
  const hora = formatTimeHM(pedido.horarioEstimada)
  const tipoEnvio = getTipoEnvioLabel(pedido.tipoDeEnvio)
  const formaPago = getFormaPagoLabel(pedido.formaDePago)

  const clienteNombre = `${pedido.cliente?.nombre ?? ''} ${pedido.cliente?.apellido ?? ''}`.trim()

  return (
    <main className="max-w-xl mx-auto py-10 px-4 space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Gracias por tu compra</h1>
        <p className="text-sm text-muted">
          Estamos preparando tu pedido. Puedes seguir el estado en tiempo real desde esta página.
        </p>
      </header>

      <section className="rounded-lg border bg-white p-4 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Pedido</p>
            <p className="text-lg font-semibold">#{pedido.id}</p>
            {clienteNombre && <p className="text-xs text-muted mt-1">Para: {clienteNombre}</p>}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs text-muted">Estado actual</span>
            <PedidoStateBadge estado={pedido.estado} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs md:text-sm">
          <div>
            <p className="text-muted">Fecha</p>
            <p>{fecha}</p>
          </div>
          <div>
            <p className="text-muted">Hora estimada</p>
            <p>{hora}</p>
          </div>
          <div>
            <p className="text-muted">Tipo de envío</p>
            <p>{tipoEnvio}</p>
          </div>
          <div>
            <p className="text-muted">Forma de pago</p>
            <p>{formaPago}</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border bg-white p-4">
        <h2 className="text-sm font-semibold mb-2">Resumen de tu pedido</h2>
        {pedido.detalles?.length ? (
          <ul className="space-y-1.5 text-sm">
            {pedido.detalles.map(d => {
              const label = d.articulo?.denominacion ?? d.promocion?.denominacion ?? `Ítem #${d.id}`
              return (
                <li key={d.id} className="flex items-baseline justify-between gap-2">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono w-6 text-right">{d.cantidad}</span>
                    <span>× {label}</span>
                  </div>
                  <span className="font-mono">{formatARS(d.subTotal)}</span>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted">Tu pedido no tiene ítems para mostrar.</p>
        )}
        <div className="flex justify-end mt-2 text-xs md:text-sm">
          <div className="text-right">
            <p>
              Total: <span className="font-semibold">{formatARS(pedido.total)}</span>
            </p>
          </div>
        </div>
      </section>

      <p className="text-[11px] text-center text-muted">
        Esta página se actualiza automáticamente cada pocos segundos. Puedes cerrarla cuando lo
        desees; tu pedido seguirá en proceso.
      </p>
    </main>
  )
}
