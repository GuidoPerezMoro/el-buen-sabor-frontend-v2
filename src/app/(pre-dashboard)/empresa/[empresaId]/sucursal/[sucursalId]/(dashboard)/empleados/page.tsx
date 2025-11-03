'use client'

import {useCallback, useEffect, useMemo, useState} from 'react'
import {useParams} from 'next/navigation'
import {TriangleAlert} from 'lucide-react'
import useDialog from '@/hooks/useDialog'
import {useRoles} from '@/hooks/useRoles'
import SearchAddBar from '@/components/ui/SearchAddBar'
import StatusMessage from '@/components/ui/StatusMessage'
import Dialog from '@/components/ui/Dialog'
import EmpleadosTable from '@/components/domain/empleado/EmpleadosTable'
import EmpleadoForm from '@/components/domain/empleado/EmpleadoForm'
import type {Empleado} from '@/services/types/empleado'
import {fetchAllEmpleados, deleteEmpleado} from '@/services/empleado'
import {filterEmpleadosBySucursalId, filterEmpleadosByText} from '@/services/empleado.utils'

export default function EmpleadosPage() {
  const {sucursalId: sid} = useParams<{empresaId: string; sucursalId: string}>()
  const sucursalId = Number(sid)
  const {openDialog, closeDialog} = useDialog()
  const {roles} = useRoles()

  const canCreate = (roles ?? []).some(r => r === 'superadmin' || r === 'admin' || r === 'gerente')
  const canDelete = (roles ?? []).some(r => r === 'superadmin' || r === 'admin')

  const [items, setItems] = useState<Empleado[]>([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const all = await fetchAllEmpleados()
      setItems(filterEmpleadosBySucursalId(all, sucursalId))
    } catch (e: any) {
      setError(e?.message ?? 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [sucursalId])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => filterEmpleadosByText(items, filter), [items, filter])

  // Edit
  const [editing, setEditing] = useState<Empleado | null>(null)
  const handleEdit = (item: Empleado) => {
    setEditing(item)
    openDialog('editar-empleado')
  }

  // Delete
  const [deleting, setDeleting] = useState<Empleado | null>(null)
  const [deletingLoading, setDeletingLoading] = useState(false)
  const handleDelete = (item: Empleado) => {
    setDeleting(item)
    openDialog('confirm-delete-empleado')
  }
  const confirmDelete = async () => {
    if (!deleting) return
    try {
      setDeletingLoading(true)
      await deleteEmpleado(deleting.id)
      await load()
    } finally {
      setDeletingLoading(false)
      setDeleting(null)
      closeDialog('confirm-delete-empleado')
    }
  }

  if (loading) return <StatusMessage type="loading" title="Cargando empleados..." />
  if (error) return <StatusMessage type="error" message="Error al cargar empleados." />

  return (
    <main>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Empleados</h1>
      </div>

      <SearchAddBar
        value={filter}
        onChange={setFilter}
        placeholder="Buscar por nombre, apellido, email o rol"
        {...(canCreate && {
          onAdd: () => openDialog('nuevo-empleado'),
          addLabel: 'Nuevo empleado',
        })}
      />

      {filtered.length === 0 ? (
        <StatusMessage
          type="empty"
          message={
            filter.trim()
              ? 'No se encontraron empleados con el texto ingresado.'
              : 'Aún no hay empleados en esta sucursal.'
          }
        />
      ) : (
        <div className="bg-white rounded-md border">
          <EmpleadosTable
            items={filtered}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canDelete={canDelete}
          />
        </div>
      )}

      <Dialog name="nuevo-empleado" title="Nuevo empleado">
        <EmpleadoForm sucursalId={sucursalId} dialogName="nuevo-empleado" onSuccess={load} />
      </Dialog>

      <Dialog
        name="editar-empleado"
        title={editing ? `Editar “${editing.nombre} ${editing.apellido}”` : undefined}
        onClose={() => setEditing(null)}
      >
        {editing && (
          <EmpleadoForm
            sucursalId={sucursalId}
            initialData={editing}
            dialogName="editar-empleado"
            onSuccess={() => {
              setEditing(null)
              load()
            }}
          />
        )}
      </Dialog>

      <Dialog
        name="confirm-delete-empleado"
        title={deleting ? `¿Eliminar “${deleting.nombre} ${deleting.apellido}”?` : undefined}
        message={deleting ? `Esto eliminará permanentemente al empleado seleccionado.` : undefined}
        icon={TriangleAlert}
        iconColor="text-danger"
        onSecondary={() => {
          setDeleting(null)
          closeDialog('confirm-delete-empleado')
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
