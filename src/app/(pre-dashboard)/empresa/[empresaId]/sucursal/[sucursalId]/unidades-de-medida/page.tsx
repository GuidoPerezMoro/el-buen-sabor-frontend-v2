'use client'

import {useState, useEffect} from 'react'
import SearchAddBar from '@/components/ui/SearchAddBar'
import Table, {Column} from '@/components/ui/Table'
import {Pencil, Trash} from 'lucide-react'
import IconButton from '@/components/ui/IconButton'

interface Unidad {
  id: number
  nombre: string
}

export default function UnidadDeMedidaPage() {
  const [filter, setFilter] = useState('')
  const [data, setData] = useState<Unidad[]>([])

  // fake data setup
  useEffect(() => {
    setData([
      {id: 1, nombre: 'Kilogramo'},
      {id: 2, nombre: 'Litro'},
      {id: 3, nombre: 'Unidad'},
    ])
  }, [])

  const filtered = data.filter(u => u.nombre.toLowerCase().includes(filter.toLowerCase()))

  const columns: Column<Unidad>[] = [
    {
      header: 'Nombre',
      accessor: u => u.nombre,
      sortable: true,
      sortKey: 'nombre',
    },
    {
      header: 'Acciones',
      accessor: u => (
        <div className="flex justify-end gap-2">
          <IconButton
            icon={<Pencil size={16} />}
            aria-label="Editar"
            onClick={() => console.log('edit clicked')}
          />
          <IconButton
            icon={<Trash size={16} />}
            aria-label="Eliminar"
            onClick={() => console.log('delete clicked')}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Unidades de medida</h1>
      <SearchAddBar
        value={filter}
        onChange={setFilter}
        onAdd={() => console.log('Open create unidad dialog')}
        addLabel="Nueva unidad"
        placeholder="Buscar unidad"
      />
      <Table columns={columns} data={filtered} alignLastColumnEnd={true} />
    </div>
  )
}
