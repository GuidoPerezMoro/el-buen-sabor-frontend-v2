'use client'

import {useMemo, useState} from 'react'
import Image from 'next/image'
import Table, {Column} from '@/components/ui/Table'
import IconButton from '@/components/ui/IconButton'
import {ImageOff, Info, Pencil, Trash} from 'lucide-react'
import {formatARS} from '@/lib/format'
import {Promocion} from '@/services/types/promocion'
import {TIPO_PROMOCION_OPTIONS} from '@/services/promocion.utils'

type Props = {
  items: Promocion[]
  onDetails: (p: Promocion) => void
  onEdit: (p: Promocion) => void
  onDelete: (p: Promocion) => void
}

export default function PromocionesTable({items, onDetails, onEdit, onDelete}: Props) {
  const rangoHoras = (p: Promocion) => `${p.horaDesde.slice(0, 5)}–${p.horaHasta.slice(0, 5)}`

  const tipoLabel = (p: Promocion) =>
    TIPO_PROMOCION_OPTIONS.find(o => o.value === p.tipoPromocion)?.label ?? p.tipoPromocion

  const Thumb = ({src, alt}: {src?: string | null; alt: string}) => {
    const [err, setErr] = useState(false)
    const has = !!src && !err
    return (
      <div className="relative w-14 h-14 rounded-md overflow-hidden border bg-muted/20">
        {has ? (
          <Image
            src={src as string}
            alt={alt}
            fill
            className="object-cover"
            sizes="56px"
            onError={() => setErr(true)}
            priority={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageOff className="h-6 w-6 text-muted" aria-hidden="true" />
          </div>
        )}
      </div>
    )
  }

  const columns = useMemo<Column<Promocion>[]>(
    () => [
      {
        header: '',
        accessor: p => <Thumb src={p.imagenUrl} alt={p.denominacion} />,
      },
      {
        header: 'Promoción',
        accessor: p => (
          <div className="flex flex-col min-w-0 max-w-[clamp(12rem,25vw,34rem)]">
            <span className="font-medium truncate" title={p.denominacion}>
              {p.denominacion}
            </span>
            {p.descripcionDescuento && (
              <span
                className="text-xs text-muted overflow-hidden text-ellipsis"
                title={p.descripcionDescuento}
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {p.descripcionDescuento}
              </span>
            )}
          </div>
        ),
        sortable: true,
        sortKey: 'denominacion',
      },
      {
        header: 'Vigencia',
        accessor: p => <span className="text-muted">{`${p.fechaDesde} → ${p.fechaHasta}`}</span>,
      },
      {header: 'Horario', accessor: p => <span className="text-muted">{rangoHoras(p)}</span>},
      // {header: 'Tipo', accessor: p => tipoLabel(p)},
      {
        header: 'Precio',
        accessor: p => formatARS(p.precioPromocional),
        sortable: true,
        sortKey: 'precioPromocional',
      },
      {
        header: '',
        accessor: p => (
          <div className="flex justify-end gap-1.5">
            <IconButton icon={<Info size={16} />} title="Ver" onClick={() => onDetails(p)} />
            <IconButton icon={<Pencil size={16} />} title="Editar" onClick={() => onEdit(p)} />
            <IconButton
              icon={<Trash size={16} />}
              title="Eliminar"
              className="text-danger"
              onClick={() => onDelete(p)}
            />
          </div>
        ),
      },
    ],
    [onDetails, onEdit, onDelete]
  )

  return (
    <Table
      columns={columns}
      data={items}
      alignLastColumnEnd
      className="text-sm"
      headerClassName="text-xs uppercase tracking-wide"
      size="xl"
      getRowKey={r => r.id}
    />
  )
}
