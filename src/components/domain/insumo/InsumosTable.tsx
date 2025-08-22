'use client'

import {useMemo} from 'react'
import Image from 'next/image'
import {cn} from '@/lib/utils'
import {formatARS} from '@/lib/format'
import Table, {Column} from '@/components/ui/Table'
import IconButton from '@/components/ui/IconButton'
import {Wheat, Pencil, Trash} from 'lucide-react'
import {ArticuloInsumo} from '@/services/types/articulo'

type Props = {
  items: ArticuloInsumo[]
  onEdit: (item: ArticuloInsumo) => void
  onDelete: (item: ArticuloInsumo) => void
}

function InsumoImage({src, alt}: {src: string | null; alt: string}) {
  return (
    <div className="w-10 h-10 overflow-hidden rounded-md border flex items-center justify-center">
      {src ? (
        <Image src={src} alt="" width={40} height={40} className="h-10 w-10 object-cover" />
      ) : (
        <>
          <Wheat className="h-5 w-5 text-muted" aria-hidden="true" />
          <span className="sr-only">{alt}</span>
        </>
      )}
    </div>
  )
}

export default function InsumosTable({items, onEdit, onDelete}: Props) {
  const columns = useMemo<Column<ArticuloInsumo>[]>(
    () => [
      {
        header: '',
        accessor: a => <InsumoImage src={a.imagenUrl} alt={a.denominacion} />,
      },
      {
        header: 'Insumo',
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
        header: 'P/ elab.',
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
