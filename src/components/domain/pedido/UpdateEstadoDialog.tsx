'use client'

import {useMemo, useState} from 'react'
import Button from '@/components/ui/Button'
import {Pedido, EstadoPedido} from '@/services/types/pedido'
import {getAllowedNextEstados, getEstadoPedidoLabel} from '@/services/pedido.utils'
import {updatePedidoEstado} from '@/services/pedido'
import PedidoStateBadge from './PedidoStateBadge'
import {ArrowRight} from 'lucide-react'
import Dropdown from '@/components/ui/Dropdown'

interface Props {
  pedido: Pedido
  onUpdated: () => void
  onClose: () => void
}

export default function UpdateEstadoDialog({pedido, onUpdated, onClose}: Props) {
  const allowed = getAllowedNextEstados(pedido.estado)
  const estadoOptions = useMemo(
    () => allowed.map(e => ({value: e, label: getEstadoPedidoLabel(e)})),
    [allowed]
  )
  const [selected, setSelected] = useState<{value: EstadoPedido; label: string} | null>(
    estadoOptions[0] ?? null
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    try {
      setError(null)
      setLoading(true)
      await updatePedidoEstado(pedido.id, {estado: selected.value})
      onUpdated()
      onClose()
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo actualizar el estado.')
    } finally {
      setLoading(false)
    }
  }

  const isReadOnly = allowed.length === 0

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs text-muted">Actualiza el estado de este pedido.</p>

        <div className="flex items-center gap-3">
          <PedidoStateBadge estado={pedido.estado} />
          <ArrowRight className="h-4 w-4 text-muted" />
          {isReadOnly ? (
            <span className="text-xs text-muted">Sin cambios disponibles</span>
          ) : (
            <div className="min-w-[160px]">
              <Dropdown
                options={estadoOptions}
                value={selected}
                onChange={val => setSelected(val as {value: EstadoPedido; label: string} | null)}
                placeholder="Nuevo estado"
                clearable={false}
              />
            </div>
          )}
        </div>

        {!isReadOnly && (
          <p className="text-xs text-muted">
            Solo se muestran los estados válidos según el flujo configurado en la app.
          </p>
        )}

        {isReadOnly && (
          <p className="text-xs text-muted mt-1">Este pedido ya no admite cambios de estado.</p>
        )}
      </div>

      {/* NOTE: "confirm note" fue parte del scope, pero el endpoint solo acepta `estado`.
          Para evitar datos fantasma que no se persisten, NO se incluye nota por ahora.
          Si el backend la soporta, la agregamos después. */}

      {error && <p className="text-xs text-danger">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={loading}
          className="text-sm"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={loading || isReadOnly}
          className="text-sm"
        >
          {loading ? 'Guardando...' : 'Actualizar estado'}
        </Button>
      </div>
    </form>
  )
}
