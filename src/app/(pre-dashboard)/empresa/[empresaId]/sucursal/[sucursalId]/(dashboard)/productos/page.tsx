'use client'

import {useCallback, useEffect, useMemo, useState} from 'react'
import {useParams} from 'next/navigation'
import useDialog from '@/hooks/useDialog'
import SearchAddBar from '@/components/ui/SearchAddBar'
import StatusMessage from '@/components/ui/StatusMessage'
import Dialog from '@/components/ui/Dialog'
import {TriangleAlert} from 'lucide-react'
import {ArticuloManufacturado} from '@/services/types/articuloManufacturado'
import {
  fetchAllArticuloManufacturados,
  deleteArticuloManufacturado,
} from '@/services/articuloManufacturado'
import {
  filterManufacturadosBySucursalId,
  filterManufacturadosByText,
} from '@/services/articuloManufacturado.utils'
import ManufacturadosTable from '@/components/domain/producto/ManufacturadosTable'
import ManufacturadoDetails from '@/components/domain/producto/ManufacturadoDetails'
import ArticuloManufacturadoForm from '@/components/domain/producto/ArticuloManufacturadoForm'

export default function ProductosPage() {
  const {sucursalId: sid} = useParams<{empresaId: string; sucursalId: string}>()
  const sucursalId = Number(sid)
  const {openDialog, closeDialog} = useDialog()

  const [items, setItems] = useState<ArticuloManufacturado[]>([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const all = await fetchAllArticuloManufacturados()
      setItems(filterManufacturadosBySucursalId(all, sucursalId))
    } catch (e: any) {
      setError(e?.message ?? 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [sucursalId])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => filterManufacturadosByText(items, filter), [items, filter])

  // View Details
  const [viewing, setViewing] = useState<ArticuloManufacturado | null>(null)
  const handleView = (item: ArticuloManufacturado) => {
    setViewing(item)
    openDialog('ver-producto')
  }

  // Edit
  const [editing, setEditing] = useState<ArticuloManufacturado | null>(null)
  const handleEdit = (item: ArticuloManufacturado) => {
    setEditing(item)
    openDialog('editar-producto')
  }

  // Delete
  const [deleting, setDeleting] = useState<ArticuloManufacturado | null>(null)
  const [deletingLoading, setDeletingLoading] = useState(false)

  const handleDelete = (item: ArticuloManufacturado) => {
    setDeleting(item)
    openDialog('confirm-delete-producto')
  }

  // TODO: When pedidos/comandas exist, block deletion if referenced.
  const confirmDelete = async () => {
    if (!deleting) return
    try {
      setDeletingLoading(true)
      await deleteArticuloManufacturado(deleting.id)
      await load()
    } finally {
      setDeletingLoading(false)
      setDeleting(null)
      closeDialog('confirm-delete-producto')
    }
  }

  if (loading) return <StatusMessage type="loading" title="Cargando productos..." />
  if (error) return <StatusMessage type="error" message="Error al cargar productos." />

  return (
    <main>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Productos</h1>
      </div>

      <SearchAddBar
        value={filter}
        onChange={setFilter}
        placeholder="Buscar por producto o categoría"
        onAdd={() => openDialog('nuevo-producto')}
        addLabel="Nuevo producto"
      />

      {filtered.length === 0 ? (
        <StatusMessage
          type="empty"
          message={
            filter.trim()
              ? 'No se encontraron productos con el texto ingresado.'
              : 'Aún no hay productos en esta sucursal.'
          }
        />
      ) : (
        <div className="bg-white rounded-md border">
          <ManufacturadosTable
            items={filtered}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      )}

      <Dialog name="nuevo-producto" title="Nuevo producto">
        <ArticuloManufacturadoForm
          sucursalId={sucursalId}
          dialogName="nuevo-producto"
          onSuccess={load}
        />
      </Dialog>

      <Dialog
        name="ver-producto"
        title={viewing ? viewing.denominacion : undefined}
        onClose={() => setViewing(null)}
      >
        {viewing && <ManufacturadoDetails item={viewing} />}
      </Dialog>

      <Dialog
        name="editar-producto"
        title={editing ? `Editar “${editing.denominacion}”` : undefined}
        onClose={() => setEditing(null)}
      >
        {editing && (
          <ArticuloManufacturadoForm
            sucursalId={sucursalId}
            initialData={editing}
            dialogName="editar-producto"
            onSuccess={() => {
              setEditing(null)
              load()
            }}
          />
        )}
      </Dialog>

      <Dialog
        name="confirm-delete-producto"
        title={deleting ? `¿Eliminar “${deleting.denominacion}”?` : undefined}
        message={
          deleting
            ? `Esto eliminará permanentemente el producto “${deleting.denominacion}”.`
            : undefined
        }
        icon={TriangleAlert}
        iconColor="text-danger"
        onSecondary={() => {
          setDeleting(null)
          closeDialog('confirm-delete-producto')
        }}
        secondaryLabel="Cancelar"
        onPrimary={confirmDelete}
        primaryLabel="Eliminar"
        isLoading={deletingLoading}
      >
        <p className="text-sm text-text">Esta acción no se puede deshacer.</p>
      </Dialog>
    </main>
  )
}
