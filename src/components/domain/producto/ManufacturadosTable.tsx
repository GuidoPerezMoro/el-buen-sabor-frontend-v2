'use client'

import {useMemo} from 'react'
import {Pencil, Trash, Sandwich} from 'lucide-react'
import Image from 'next/image'
import {cn} from '@/lib/utils'
import {formatARS} from '@/lib/format'
import Table, {Column} from '@/components/ui/Table'
import IconButton from '@/components/ui/IconButton'
import {ArticuloManufacturado} from '@/services/types/articuloManufacturado'

type Props = {
  items: ArticuloManufacturado[]
  onEdit: (item: ArticuloManufacturado) => void
  onDelete: (item: ArticuloManufacturado) => void
}

function ProdImage({src, alt}: {src: string | null; alt: string}) {
  return (
    <div className="w-10 h-10 overflow-hidden rounded-md border flex items-center justify-center">
      {src ? (
        <Image src={src} alt="" width={40} height={40} className="h-10 w-10 object-cover" />
      ) : (
        <>
          <Sandwich className="h-5 w-5 text-muted" aria-hidden="true" />
          <span className="sr-only">{alt}</span>
        </>
      )}
    </div>
  )
}

export default function ManufacturadosTable({items, onEdit, onDelete}: Props) {
  const columns = useMemo<Column<ArticuloManufacturado>[]>(
    () => [
      {header: '', accessor: p => <ProdImage src={p.imagenUrl} alt={p.denominacion} />},
      {
        header: 'Producto',
        accessor: p => (
          <div className="flex flex-col">
            <span className="font-medium">{p.denominacion}</span>
            <span className="text-xs text-muted">{p.categoria?.denominacion ?? '—'}</span>
          </div>
        ),
        sortable: true,
        sortKey: 'denominacion',
      },
      {
        header: 'Precio',
        accessor: p => ((p.precioVenta ?? 0) === 0 ? '-' : formatARS(p.precioVenta ?? 0)),
        sortable: true,
        sortKey: 'precioVenta',
      },
      {
        header: 'Tiempo (min)',
        accessor: p => <span className="font-mono">{p.tiempoEstimadoMinutos ?? 0}</span>,
        sortable: true,
        sortKey: 'tiempoEstimadoMinutos' as any,
      },
      {
        header: 'Ingredientes',
        accessor: p => p.detalles?.length ?? 0,
        sortable: true,
        sortKey: 'detalles' as any, // no-op; UI sort will treat undefined as 0
      },
      {
        header: '',
        accessor: p => (
          <div className="flex justify-end gap-1.5">
            <IconButton
              icon={<Pencil size={16} />}
              aria-label={`Editar ${p.denominacion}`}
              title="Editar"
              size="sm"
              onClick={() => onEdit(p)}
            />
            <IconButton
              icon={<Trash size={16} />}
              aria-label={`Eliminar ${p.denominacion}`}
              title="Eliminar"
              size="sm"
              onClick={() => onDelete(p)}
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
      getRowKey={p => p.id}
    />
  )
}
