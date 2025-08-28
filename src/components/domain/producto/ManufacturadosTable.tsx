'use client'

import {useMemo} from 'react'
import {Pencil, Trash, Sandwich, Eye} from 'lucide-react'
import Image from 'next/image'
import {formatARS} from '@/lib/format'
import Table, {Column} from '@/components/ui/Table'
import IconButton from '@/components/ui/IconButton'
import {ArticuloManufacturado} from '@/services/types/articuloManufacturado'

type Props = {
  items: ArticuloManufacturado[]
  onView?: (item: ArticuloManufacturado) => void
  onEdit: (item: ArticuloManufacturado) => void
  onDelete: (item: ArticuloManufacturado) => void
}

function ProdImage({src, alt}: {src: string | null; alt: string}) {
  return (
    <div className="w-20 h-20 overflow-hidden rounded-md border border-muted flex items-center justify-center">
      {src ? (
        <Image src={src} alt="" width={80} height={80} className="h-20 w-20 object-cover" />
      ) : (
        <>
          {/* fallback glyph stays centered */}
          <Sandwich className="h-8 w-8 text-muted" aria-hidden="true" />
          <span className="sr-only">{alt}</span>
        </>
      )}
    </div>
  )
}

export default function ManufacturadosTable({items, onView, onEdit, onDelete}: Props) {
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
        header: 'Detalles',
        accessor: p => (
          <div className="flex justify-center md:justify-start">
            <IconButton
              icon={<Eye size={16} />}
              aria-label={`Ver detalles de ${p.denominacion}`}
              title="Ver detalles"
              onClick={() => onView?.(p)}
            />
          </div>
        ),
      },
      {
        header: '',
        accessor: p => (
          <div className="flex justify-end gap-1.5">
            <IconButton
              icon={<Pencil size={16} />}
              aria-label={`Editar ${p.denominacion}`}
              title="Editar"
              onClick={() => onEdit(p)}
            />
            <IconButton
              icon={<Trash size={16} />}
              aria-label={`Eliminar ${p.denominacion}`}
              title="Eliminar"
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
      size="xl"
    />
  )
}
