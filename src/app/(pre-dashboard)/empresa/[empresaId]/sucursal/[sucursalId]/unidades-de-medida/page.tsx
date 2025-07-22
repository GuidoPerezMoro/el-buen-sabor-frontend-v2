// File: src/app/(pre-dashboard)/empresa/[empresaId]/sucursal/[sucursalId]/unidad-de-medida/page.tsx
'use client'

import {useState, useEffect} from 'react'
import useDialog from '@/hooks/useDialog'
import Dialog from '@/components/ui/Dialog'
import StatusMessage from '@/components/ui/StatusMessage'
import SearchAddBar from '@/components/ui/SearchAddBar'
import Table, {Column} from '@/components/ui/Table'
import IconButton from '@/components/ui/IconButton'
import {Pencil, Trash} from 'lucide-react'

import {fetchAllUnidades, deleteUnidad} from '@/services/unidadDeMedida'
import {UnidadDeMedida} from '@/services/types/unidadDeMedida'
import UnidadDeMedidaForm from '@/components/domain/unidad-de-medida/UnidadDeMedidaForm'

export default function UnidadDeMedidaPage() {
  const {openDialog, closeDialog} = useDialog()

  const [filter, setFilter] = useState('')
  const [data, setData] = useState<UnidadDeMedida[]>([])
  const [unidadAEditar, setUnidadAEditar] = useState<UnidadDeMedida | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const loadUnidades = async () => {
    setLoading(true)
    try {
      const all = await fetchAllUnidades()
      setData(all)
    } catch (err) {
      console.error('Error al cargar unidades', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUnidades()
  }, [])

  const handleCreate = () => {
    setUnidadAEditar(null)
    openDialog('nueva-unidad')
  }

  const handleEdit = (u: UnidadDeMedida) => {
    setUnidadAEditar(u)
    openDialog('editar-unidad')
  }

  const handleDelete = async (u: UnidadDeMedida) => {
    if (!confirm(`¿Eliminar “${u.denominacion}”?`)) return
    try {
      await deleteUnidad(u.id)
      loadUnidades()
    } catch (err) {
      console.error('Error al eliminar unidad', err)
    }
  }

  const filtered = data.filter(u => u.denominacion?.toLowerCase().includes(filter.toLowerCase()))

  const columns: Column<UnidadDeMedida>[] = [
    {
      header: 'Nombre',
      accessor: u => u.denominacion,
      sortable: true,
      sortKey: 'denominacion',
    },
    {
      header: 'Acciones',
      accessor: u => (
        <div className="flex justify-end gap-2">
          <IconButton
            icon={<Pencil size={16} />}
            aria-label="Editar"
            onClick={() => handleEdit(u)}
          />
          <IconButton
            icon={<Trash size={16} />}
            aria-label="Eliminar"
            onClick={() => handleDelete(u)}
          />
        </div>
      ),
    },
  ]

  if (loading) return <StatusMessage type="loading" message="Cargando unidades..." />
  if (error) return <StatusMessage type="error" message="Error al cargar unidades" />

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Unidades de medida</h1>

      <SearchAddBar
        value={filter}
        onChange={setFilter}
        onAdd={handleCreate}
        addLabel="Nueva unidad"
        placeholder="Buscar unidad de medida"
      />

      <Dialog
        name="nueva-unidad"
        title="Crear unidad de medida"
        onClose={() => closeDialog('nueva-unidad')}
      >
        <UnidadDeMedidaForm
          dialogName="nueva-unidad"
          onSuccess={() => {
            loadUnidades()
            closeDialog('nueva-unidad')
          }}
        />
      </Dialog>

      <Dialog
        name="editar-unidad"
        title="Editar unidad de medida"
        onClose={() => setUnidadAEditar(null)}
      >
        {unidadAEditar && (
          <UnidadDeMedidaForm
            initialData={unidadAEditar}
            dialogName="editar-unidad"
            onSuccess={() => {
              loadUnidades()
              setUnidadAEditar(null)
            }}
          />
        )}
      </Dialog>

      <Table columns={columns} data={filtered} alignLastColumnEnd />
    </div>
  )
}
