'use client'

import {useMemo} from 'react'
import {Info, RefreshCcw, Trash} from 'lucide-react'
import Table, {Column} from '@/components/ui/Table'
import IconButton from '@/components/ui/IconButton'
import {formatARS} from '@/lib/format'
import {Pedido} from '@/services/types/pedido'
import PedidoStateBadge from './PedidoStateBadge'
import {formatHorarioEstimadaToHM, isPedidoDelayed} from '@/services/pedido.utils'

type Props = {
  items: Pedido[]
  onView?: (pedido: Pedido) => void
  onChangeEstado?: (pedido: Pedido) => void
  onDelete?: (pedido: Pedido) => void
  canUpdateEstado?: boolean
  canDelete?: boolean
  showCosto?: boolean
}

function mapFormaPagoLabel(valor: string): string {
  switch (valor) {
    case 'EFECTIVO':
      return 'Efectivo'
    case 'MERCADO_PAGO':
      return 'Mercado Pago'
    case 'TARJETA':
      return 'Tarjeta'
    default:
      return valor
  }
}

function mapTipoEnvioLabel(valor: string): string {
  switch (valor) {
    case 'DELIVERY':
      return 'Delivery'
    case 'TAKE_AWAY':
      return 'Retiro en local'
    default:
      return valor
  }
}

export default function PedidosTable({
  items,
  onView,
  onChangeEstado,
  onDelete,
  canUpdateEstado = true,
  canDelete = true,
  showCosto = false,
}: Props) {
  const columns = useMemo<Column<Pedido>[]>(
    () => [
      {
        header: '#',
        accessor: p => <span className="font-mono text-xs text-muted">#{p.id}</span>,
        sortable: true,
        sortKey: 'id',
      },
      {
        header: 'Hora / Fecha',
        accessor: p => (
          <div className="flex flex-col text-xs">
            <span className={isPedidoDelayed(p) ? 'font-semibold text-danger' : 'font-semibold'}>
              {formatHorarioEstimadaToHM(p.horarioEstimada)}
            </span>
            <span className="text-muted">{p.fechaDePedido}</span>
          </div>
        ),
        sortable: true,
        sortKey: 'fechaDePedido',
      },
      {
        header: 'Cliente',
        accessor: p => (
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {p.cliente?.nombre} {p.cliente?.apellido}
            </span>
            <span className="text-xs text-muted">{p.cliente?.telefono}</span>
          </div>
        ),
      },
      {
        header: 'Envío / Pago',
        accessor: p => (
          <div className="flex flex-col text-xs">
            <span>{mapTipoEnvioLabel(p.tipoDeEnvio)}</span>
            <span className="text-muted">{mapFormaPagoLabel(p.formaDePago)}</span>
          </div>
        ),
      },
      {
        header: 'Total',
        accessor: p => <span className="font-medium">{formatARS(p.total)}</span>,
        sortable: true,
        sortKey: 'total',
      },
      ...(showCosto
        ? [
            {
              header: 'Costo',
              accessor: (p: Pedido) => (
                <span className="text-sm text-muted">{formatARS(p.costoTotal ?? 0)}</span>
              ),
              sortable: true,
              sortKey: 'costoTotal' as keyof Pedido,
            },
          ]
        : []),
      {
        header: 'Estado',
        accessor: p => <PedidoStateBadge estado={p.estado} />,
      },
      {
        header: '',
        accessor: p => (
          <div className="flex justify-end gap-1.5">
            <IconButton
              icon={<Info size={16} />}
              aria-label={`Ver detalles del pedido #${p.id}`}
              title="Ver detalles"
              onClick={() => onView?.(p)}
            />
            {canUpdateEstado && (
              <IconButton
                icon={<RefreshCcw size={16} />}
                aria-label={`Actualizar estado del pedido #${p.id}`}
                title="Cambiar estado"
                onClick={() => onChangeEstado?.(p)}
              />
            )}
            {onDelete ? (
              canDelete ? (
                <IconButton
                  icon={<Trash size={16} />}
                  aria-label={`Eliminar pedido #${p.id}`}
                  title="Eliminar"
                  onClick={() => onDelete(p)}
                  className="text-danger"
                />
              ) : (
                <IconButton
                  icon={<Trash size={16} />}
                  aria-label={`Eliminar pedido #${p.id}`}
                  title="Sin permisos para eliminar"
                  disabled
                  className="text-muted opacity-50 cursor-not-allowed pointer-events-none"
                />
              )
            ) : null}
          </div>
        ),
      },
    ],
    [onView, onChangeEstado, onDelete, canDelete, canUpdateEstado, showCosto]
  )

  return (
    <Table
      columns={columns}
      data={items}
      alignLastColumnEnd
      className="text-sm"
      getRowKey={p => p.id}
      size="xl"
    />
  )
}
