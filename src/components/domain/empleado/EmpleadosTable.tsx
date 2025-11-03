'use client'

import {useMemo} from 'react'
import {UserRound, Pencil, Trash} from 'lucide-react'
import Image from 'next/image'
import Table, {Column} from '@/components/ui/Table'
import IconButton from '@/components/ui/IconButton'
import type {Empleado} from '@/services/types/empleado'

type Props = {
  items: Empleado[]
  onEdit: (item: Empleado) => void
  onDelete: (item: Empleado) => void
  canDelete?: boolean
}

function Avatar({src, alt}: {src: string | null; alt: string}) {
  return (
    <div className="w-14 h-14 overflow-hidden rounded-full border border-muted flex items-center justify-center bg-white">
      {src ? (
        <Image src={src} alt="" width={56} height={56} className="h-14 w-14 object-cover" />
      ) : (
        <>
          <UserRound className="h-6 w-6 text-muted" aria-hidden="true" />
          <span className="sr-only">{alt}</span>
        </>
      )}
    </div>
  )
}

export default function EmpleadosTable({items, onEdit, onDelete, canDelete = true}: Props) {
  const columns = useMemo<Column<Empleado>[]>(
    () => [
      {header: '', accessor: e => <Avatar src={e.imagenUrl} alt={`${e.nombre} ${e.apellido}`} />},
      {
        header: 'Empleado',
        accessor: e => (
          <div className="flex flex-col">
            <span className="font-medium">{`${e.nombre} ${e.apellido}`}</span>
            <span className="text-xs text-muted">{e.email}</span>
          </div>
        ),
        sortable: true,
        sortKey: 'nombre',
      },
      {
        header: 'Teléfono',
        accessor: e => <span className="font-mono">{e.telefono || '—'}</span>,
        sortable: true,
        sortKey: 'telefono' as keyof Empleado,
      },
      {
        header: 'Fecha Nac.',
        accessor: e => <span className="font-mono">{e.fechaNacimiento || '—'}</span>,
        sortable: true,
        sortKey: 'fechaNacimiento' as keyof Empleado,
      },
      {
        header: 'Rol',
        accessor: e => <span className="uppercase">{e.rol}</span>,
        sortable: true,
        sortKey: 'rol' as keyof Empleado,
      },
      {
        header: '',
        accessor: e => (
          <div className="flex justify-end gap-1.5">
            <IconButton
              icon={<Pencil size={16} />}
              aria-label={`Editar ${e.nombre} ${e.apellido}`}
              title="Editar"
              onClick={() => onEdit(e)}
            />
            {canDelete ? (
              <IconButton
                icon={<Trash size={16} />}
                aria-label={`Eliminar ${e.nombre} ${e.apellido}`}
                title="Eliminar"
                onClick={() => onDelete(e)}
                className="text-danger"
              />
            ) : (
              <IconButton
                icon={<Trash size={16} />}
                aria-label={`Eliminar ${e.nombre} ${e.apellido}`}
                title="Sin permisos para eliminar"
                disabled
                className="text-muted opacity-50 cursor-not-allowed pointer-events-none"
              />
            )}
          </div>
        ),
      },
    ],
    [onEdit, onDelete, canDelete]
  )

  return (
    <Table
      columns={columns}
      data={items}
      alignLastColumnEnd
      className="text-sm"
      getRowKey={e => e.id}
      size="xl"
    />
  )
}
