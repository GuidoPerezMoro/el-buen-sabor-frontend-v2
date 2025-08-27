'use client'

import {useEffect, useMemo, useState, useCallback} from 'react'
import {useParams} from 'next/navigation'
import useDialog from '@/hooks/useDialog'
import SearchAddBar from '@/components/ui/SearchAddBar'
import StatusMessage from '@/components/ui/StatusMessage'
import Dialog from '@/components/ui/Dialog'
import {TriangleAlert} from 'lucide-react'
import {ArticuloInsumo} from '@/services/types/articuloInsumo'
import {fetchAllArticuloInsumos, deleteArticuloInsumo} from '@/services/articuloInsumo'
import {
  filterArticuloInsumosBySucursalId,
  filterArticuloInsumosByText,
} from '@/services/articuloInsumo.utils'
import ArticuloInsumoForm from '@/components/domain/insumo/ArticuloInsumoForm'
import InsumosTable from '@/components/domain/insumo/InsumosTable'

export default function ArticulosInsumoPage() {
  const {sucursalId: sid} = useParams<{empresaId: string; sucursalId: string}>()
  const sucursalId = Number(sid)

  const {openDialog, closeDialog} = useDialog()

  const [items, setItems] = useState<ArticuloInsumo[]>([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const all = await fetchAllArticuloInsumos()
      setItems(filterArticuloInsumosBySucursalId(all, sucursalId))
    } catch (e: any) {
      setError(e?.message ?? 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [sucursalId])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => filterArticuloInsumosByText(items, filter), [items, filter])

  // Edit
  const [editing, setEditing] = useState<ArticuloInsumo | null>(null)

  const handleEdit = useCallback(
    (item: ArticuloInsumo) => {
      setEditing(item)
      openDialog('editar-insumo')
    },
    [openDialog]
  )

  // Delete
  const [deleting, setDeleting] = useState<ArticuloInsumo | null>(null)
  const [deletingLoading, setDeletingLoading] = useState(false)

  const handleDelete = (item: ArticuloInsumo) => {
    setDeleting(item)
    openDialog('confirm-delete-insumo')
  }

  // TODO: When manufacturados are implemented, block deletion if this insumo.
  // If referenced by any manufacturado detalle. Show a helpful message in that case.
  const confirmDelete = async () => {
    if (!deleting) return
    try {
      setDeletingLoading(true)
      await deleteArticuloInsumo(deleting.id)
      await load()
    } finally {
      setDeletingLoading(false)
      setDeleting(null)
      closeDialog('confirm-delete-insumo')
    }
  }

  if (loading) return <StatusMessage type="loading" title="Cargando insumos..." />
  if (error) return <StatusMessage type="error" message="Error al cargar insumos." />

  return (
    <main>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Insumos</h1>
      </div>

      <SearchAddBar
        value={filter}
        onChange={setFilter}
        placeholder="Buscar por artículo o categoría"
        onAdd={() => openDialog('nuevo-insumo')}
        addLabel="Nuevo artículo"
      />

      {filtered.length === 0 ? (
        <StatusMessage
          type="empty"
          message={
            filter.trim()
              ? 'No se encontraron artículos con el texto ingresado.'
              : 'Aún no hay artículos en esta sucursal.'
          }
        />
      ) : (
        <div className="bg-white rounded-md border">
          <InsumosTable items={filtered} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
      )}

      <Dialog name="nuevo-insumo" title="Nuevo insumo">
        <ArticuloInsumoForm sucursalId={sucursalId} dialogName="nuevo-insumo" onSuccess={load} />
      </Dialog>

      <Dialog
        name="editar-insumo"
        title={editing ? `Editar “${editing.denominacion}”` : undefined}
        onClose={() => setEditing(null)}
      >
        {editing && (
          <ArticuloInsumoForm
            sucursalId={sucursalId}
            initialData={editing}
            dialogName="editar-insumo"
            onSuccess={() => {
              setEditing(null)
              load()
            }}
          />
        )}
      </Dialog>

      <Dialog
        name="confirm-delete-insumo"
        title={deleting ? `¿Eliminar “${deleting.denominacion}”?` : undefined}
        message={
          deleting
            ? `Esto eliminará permanentemente el insumo “${deleting.denominacion}”.`
            : undefined
        }
        icon={TriangleAlert}
        iconColor="text-danger"
        onSecondary={() => {
          setDeleting(null)
          closeDialog('confirm-delete-insumo')
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
