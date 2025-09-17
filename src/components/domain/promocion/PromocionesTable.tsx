'use client'

import {useMemo} from 'react'
import Table, {Column} from '@/components/ui/Table'
import IconButton from '@/components/ui/IconButton'
import {Info, Pencil, Trash} from 'lucide-react'
import {formatARS} from '@/lib/format'
import {Promocion} from '@/services/types/promocion'

type Props = {
  items: Promocion[]
  onDetails: (p: Promocion) => void
  onEdit: (p: Promocion) => void
  onDelete: (p: Promocion) => void
}

export default function PromocionesTable({items, onDetails, onEdit, onDelete}: Props) {
  const rangoHoras = (p: Promocion) => `${p.horaDesde.slice(0, 5)}–${p.horaHasta.slice(0, 5)}`
  const columns = useMemo<Column<Promocion>[]>(
    () => [
      {
        header: 'Promoción',
        accessor: p => (
          <div className="flex flex-col">
            <span className="font-medium">{p.denominacion}</span>
            {p.descripcionDescuento && (
              <span className="text-xs text-muted">{p.descripcionDescuento}</span>
            )}
          </div>
        ),
        sortable: true,
        sortKey: 'denominacion',
      },
      {header: 'Vigencia', accessor: p => `${p.fechaDesde} → ${p.fechaHasta}`},
      {header: 'Horario', accessor: p => rangoHoras(p)},
      {header: 'Tipo', accessor: p => p.tipoPromocion},
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
      getRowKey={r => r.id}
    />
  )
}
