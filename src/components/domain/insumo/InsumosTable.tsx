'use client'

import {useMemo} from 'react'
import {cn} from '@/lib/utils'
import {formatARS} from '@/lib/format'
import Table, {Column} from '@/components/ui/Table'
import IconButton from '@/components/ui/IconButton'
import {Pencil, Trash} from 'lucide-react'
import {ArticuloInsumo} from '@/services/types/articulo'

type Props = {
  items: ArticuloInsumo[]
  onEdit: (item: ArticuloInsumo) => void
  onDelete: (item: ArticuloInsumo) => void
}

export default function InsumosTable({items, onEdit, onDelete}: Props) {
  const columns = useMemo<Column<ArticuloInsumo>[]>(
    () => [
      {
        header: 'Artículo',
        accessor: a => (
          <div className="flex flex-col">
            <span className="font-medium">{a.denominacion}</span>
            <span className="text-xs text-muted">{a.categoria?.denominacion ?? '—'}</span>
          </div>
        ),
        sortable: true,
        sortKey: 'denominacion',
      },
      {
        header: 'Compra',
        accessor: a => {
          const v = a.precioCompra ?? 0
          return v === 0 ? '-' : formatARS(v)
        },
        sortable: true,
        sortKey: 'precioCompra',
      },
      {
        header: 'Venta',
        accessor: a => {
          const v = a.precioVenta ?? 0
          return v === 0 ? '-' : formatARS(v)
        },
        sortable: true,
        sortKey: 'precioVenta',
      },
      {
        header: 'Stock',
        accessor: a => (
          <div>
            <span className={cn('font-mono', a.stockActual < a.stockMinimo && 'text-danger')}>
              {a.stockActual}
            </span>
            <span className="text-xs text-muted"> / {a.stockMaximo}</span>
          </div>
        ),
        sortable: true,
        sortKey: 'stockActual',
      },
      {
        header: 'U. Medida',
        accessor: a => a.unidadDeMedida?.denominacion ?? '—',
      },
      {
        header: 'P/ elaborar',
        accessor: a => (a.esParaElaborar ? 'Sí' : 'No'),
      },
      {
        header: '',
        accessor: a => (
          <div className="flex justify-end gap-1.5">
            <IconButton
              icon={<Pencil size={16} />}
              aria-label={`Editar ${a.denominacion}`}
              title="Editar"
              size="sm"
              onClick={() => onEdit(a)}
            />
            <IconButton
              icon={<Trash size={16} />}
              aria-label={`Eliminar ${a.denominacion}`}
              title="Eliminar"
              size="sm"
              onClick={() => onDelete(a)}
              className="text-danger"
            />
          </div>
        ),
      },
    ],
    [onEdit, onDelete]
  )

  return (
    <Table
      columns={columns}
      data={items}
      alignLastColumnEnd
      className="text-sm"
      getRowKey={row => row.id}
    />
  )
}
