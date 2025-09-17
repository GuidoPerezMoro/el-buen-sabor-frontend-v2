'use client'

import {useCallback, useEffect, useMemo, useState} from 'react'
import {useParams} from 'next/navigation'
import useDialog from '@/hooks/useDialog'
import {TriangleAlert} from 'lucide-react'
import SearchAddBar from '@/components/ui/SearchAddBar'
import StatusMessage from '@/components/ui/StatusMessage'
import Dialog from '@/components/ui/Dialog'
import PromocionForm from '@/components/domain/promocion/PromocionForm'
import PromocionesTable from '@/components/domain/promocion/PromocionesTable'
import PromocionDetails from '@/components/domain/promocion/PromocionDetails'
import {Promocion} from '@/services/types/promocion'
import {fetchAllPromociones, deletePromocion} from '@/services/promocion'
import {filterPromocionesBySucursalId, filterPromocionesByText} from '@/services/promocion.utils'

export default function PromocionesPage() {
  const {empresaId: eid, sucursalId: sid} = useParams<{empresaId: string; sucursalId: string}>()
  const empresaId = Number(eid)
  const sucursalId = Number(sid)
  const {openDialog, closeDialog} = useDialog()

  const [items, setItems] = useState<Promocion[]>([])
  const [filter, setFilter] = useState('')
  const filtered = useMemo(() => filterPromocionesByText(items, filter), [items, filter])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const all = await fetchAllPromociones()
      setItems(filterPromocionesBySucursalId(all, sucursalId))
    } catch (e: any) {
      setError(e?.message ?? 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [sucursalId])

  useEffect(() => {
    load()
  }, [load])

  // row actions
  const [editing, setEditing] = useState<Promocion | null>(null)
  const [showing, setShowing] = useState<Promocion | null>(null)
  const [deleting, setDeleting] = useState<Promocion | null>(null)
  const [deletingLoading, setDeletingLoading] = useState(false)

  const handleEdit = (p: Promocion) => {
    setEditing(p)
    openDialog('editar-promocion')
  }
  const handleDetails = (p: Promocion) => {
    setShowing(p)
    openDialog('ver-promocion')
  }
  const handleDelete = (p: Promocion) => {
    setDeleting(p)
    openDialog('confirm-delete-promocion')
  }
  const confirmDelete = async () => {
    if (!deleting) return
    try {
      setDeletingLoading(true)
      await deletePromocion(deleting.id)
      await load()
    } finally {
      setDeletingLoading(false)
      setDeleting(null)
      closeDialog('confirm-delete-promocion')
    }
  }

  if (loading) return <StatusMessage type="loading" title="Cargando promociones..." />
  if (error) return <StatusMessage type="error" message="Error al cargar promociones." />

  return (
    <main>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Promociones</h1>
      </div>

      <SearchAddBar
        value={filter}
        onChange={setFilter}
        placeholder="Buscar por nombre o descripción"
        onAdd={() => openDialog('nueva-promocion')}
        addLabel="Nueva promoción"
      />

      {loading ? (
        <StatusMessage type="loading" title="Cargando promociones..." />
      ) : error ? (
        <StatusMessage type="error" message="Error al cargar promociones." />
      ) : filtered.length === 0 ? (
        <StatusMessage
          type="empty"
          message={
            filter.trim()
              ? 'No se encontraron promociones con el texto ingresado.'
              : 'Aún no hay promociones en esta sucursal.'
          }
        />
      ) : (
        <div className="bg-white rounded-md border">
          <PromocionesTable
            items={filtered}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDetails={handleDetails}
          />
        </div>
      )}

      {/* Crear */}
      <Dialog name="nueva-promocion" title="Nueva promoción">
        <PromocionForm
          empresaId={empresaId}
          sucursalId={sucursalId}
          dialogName="nueva-promocion"
          onSuccess={load}
        />
      </Dialog>

      {/* Editar */}
      <Dialog
        name="editar-promocion"
        title={editing ? `Editar “${editing.denominacion}”` : undefined}
        onClose={() => setEditing(null)}
      >
        {editing && (
          <PromocionForm
            empresaId={empresaId}
            sucursalId={sucursalId}
            initialData={editing}
            dialogName="editar-promocion"
            onSuccess={() => {
              setEditing(null)
              load()
            }}
          />
        )}
      </Dialog>

      {/* Detalles (solo lectura) */}
      <Dialog
        name="ver-promocion"
        title={showing ? showing.denominacion : undefined}
        onClose={() => setShowing(null)}
      >
        {showing && <PromocionDetails promocion={showing} />}
      </Dialog>

      {/* Eliminar */}
      <Dialog
        name="confirm-delete-promocion"
        title={deleting ? `¿Eliminar “${deleting.denominacion}”?` : undefined}
        message="Esta acción no se puede deshacer."
        icon={TriangleAlert}
        iconColor="text-danger"
        onSecondary={() => {
          setDeleting(null)
          closeDialog('confirm-delete-promocion')
        }}
        secondaryLabel="Cancelar"
        onPrimary={confirmDelete}
        primaryLabel="Eliminar"
        isLoading={deletingLoading}
      />
    </main>
  )
}
