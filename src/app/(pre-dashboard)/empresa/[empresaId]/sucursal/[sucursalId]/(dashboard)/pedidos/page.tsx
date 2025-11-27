'use client'

import {useCallback, useEffect, useMemo, useState} from 'react'
import {useParams} from 'next/navigation'
import useDialog from '@/hooks/useDialog'
import {useRoles} from '@/hooks/useRoles'
import StatusMessage from '@/components/ui/StatusMessage'
import SearchAddBar from '@/components/ui/SearchAddBar'
import Dialog from '@/components/ui/Dialog'
import {TriangleAlert} from 'lucide-react'
import {ESTADO_PEDIDO_VALUES, type Pedido} from '@/services/types'
import {fetchAllPedidos, deletePedido} from '@/services/pedido'
import {
  filterPedidosBySucursalId,
  filterPedidosByText,
  startPedidosPolling,
} from '@/services/pedido.utils'
import PedidosTable from '@/components/domain/pedido/PedidosTable'
import PedidoDetails from '@/components/domain/pedido/PedidoDetails'
import UpdateEstadoDialog from '@/components/domain/pedido/UpdateEstadoDialog'

type Params = {
  empresaId: string
  sucursalId: string
}

type EstadoFilter = 'ALL' | string

export default function PedidosPage() {
  const {sucursalId: sid} = useParams<Params>()
  const sucursalId = Number(sid)
  const {openDialog, closeDialog} = useDialog()
  const {roles} = useRoles()

  const [items, setItems] = useState<Pedido[]>([])
  const [filterText, setFilterText] = useState('')
  const [estadoFilter, setEstadoFilter] = useState<EstadoFilter>('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isSuperadmin = roles?.includes('superadmin')
  const isAdmin = roles?.includes('admin')
  const isGerente = roles?.includes('gerente')
  const isCocinero = roles?.includes('cocinero')
  const canUpdateEstado = true // todos los staff pueden cambiar estado por ahora
  const canDelete = !isCocinero
  const showCosto = isSuperadmin || isAdmin

  const load = useCallback(
    async (withLoading = true) => {
      try {
        if (withLoading) setLoading(true)
        setError(null)
        const all = await fetchAllPedidos()
        const own = filterPedidosBySucursalId(all, sucursalId)
        setItems(own)
      } catch (e: any) {
        setError(e?.message ?? 'Error desconocido')
      } finally {
        if (withLoading) setLoading(false)
      }
    },
    [sucursalId]
  )

  // Initial load + polling
  useEffect(() => {
    let stop: (() => void) | undefined
    ;(async () => {
      await load(true)
      stop = startPedidosPolling(() => load(false), {immediate: false})
    })()

    return () => {
      if (stop) stop()
    }
  }, [load])

  const filtered = useMemo(() => {
    const byText = filterPedidosByText(items, filterText)
    if (estadoFilter === 'ALL') return byText
    return byText.filter(p => p.estado === estadoFilter)
  }, [items, filterText, estadoFilter])

  const estadoFilterOptions = useMemo(
    () => [
      {value: 'ALL', label: 'Todos'},
      ...ESTADO_PEDIDO_VALUES.map(e => ({
        value: e,
        // reutilizamos label de utils para el dropdown en la página
        label: e, // label "bonita" la resolveremos con CSS/Badge, aquí basta valor crudo
      })),
    ],
    []
  )

  // View details
  const [viewing, setViewing] = useState<Pedido | null>(null)
  const handleView = (pedido: Pedido) => {
    setViewing(pedido)
    openDialog('ver-pedido')
  }

  // Update estado
  const [updating, setUpdating] = useState<Pedido | null>(null)
  const handleChangeEstado = (pedido: Pedido) => {
    if (!canUpdateEstado) return
    setUpdating(pedido)
    openDialog('update-estado-pedido')
  }

  // Delete
  const [deleting, setDeleting] = useState<Pedido | null>(null)
  const [deletingLoading, setDeletingLoading] = useState(false)

  const handleDelete = (pedido: Pedido) => {
    if (!canDelete) return
    setDeleting(pedido)
    openDialog('confirm-delete-pedido')
  }

  const confirmDelete = async () => {
    if (!deleting) return
    try {
      setDeletingLoading(true)
      await deletePedido(deleting.id)
      await load(false)
    } finally {
      setDeletingLoading(false)
      setDeleting(null)
      closeDialog('confirm-delete-pedido')
    }
  }

  const handleEstadoFilterChange = (val: string | {value: string; label: string} | null) => {
    if (!val) {
      setEstadoFilter('ALL')
      return
    }
    const raw = typeof val === 'string' ? val : val.value
    setEstadoFilter(raw as EstadoFilter)
  }

  if (loading) return <StatusMessage type="loading" title="Cargando pedidos..." />
  if (error) return <StatusMessage type="error" message="Error al cargar pedidos." />

  return (
    <main>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Pedidos</h1>
      </div>

      <SearchAddBar
        value={filterText}
        onChange={setFilterText}
        placeholder="Buscar por cliente"
        showFilter
        filterOptions={estadoFilterOptions}
        filterValue={
          estadoFilterOptions.find(o => o.value === estadoFilter) ?? estadoFilterOptions[0]
        }
        onFilterChange={handleEstadoFilterChange}
        filterClearable
      />

      {filtered.length === 0 ? (
        <StatusMessage
          type="empty"
          message={
            filterText.trim()
              ? 'No se encontraron pedidos con el texto ingresado.'
              : 'Aún no hay pedidos en esta sucursal.'
          }
        />
      ) : (
        <div className="bg-white rounded-md border">
          <PedidosTable
            items={filtered}
            onView={handleView}
            onChangeEstado={handleChangeEstado}
            onDelete={handleDelete}
            canDelete={canDelete}
            canUpdateEstado={canUpdateEstado}
            showCosto={showCosto}
          />
        </div>
      )}

      {/* Ver detalles */}
      <Dialog
        name="ver-pedido"
        title={viewing ? `Pedido #${viewing.id}` : undefined}
        onClose={() => setViewing(null)}
      >
        {viewing && <PedidoDetails pedido={viewing} />}
      </Dialog>

      {/* Cambiar estado */}
      <Dialog
        name="update-estado-pedido"
        title={updating ? `Cambiar estado · Pedido #${updating.id}` : undefined}
        onClose={() => setUpdating(null)}
      >
        {updating && (
          <UpdateEstadoDialog
            pedido={updating}
            onUpdated={() => load(false)}
            onClose={() => {
              setUpdating(null)
              closeDialog('update-estado-pedido')
            }}
          />
        )}
      </Dialog>

      {/* Confirmar eliminación */}
      <Dialog
        name="confirm-delete-pedido"
        title={deleting ? `¿Eliminar pedido #${deleting.id}?` : undefined}
        message={
          deleting
            ? `Esto eliminará permanentemente el pedido #${deleting.id}.`
            : 'Esto eliminará permanentemente el pedido.'
        }
        icon={TriangleAlert}
        iconColor="text-danger"
        onSecondary={() => {
          setDeleting(null)
          closeDialog('confirm-delete-pedido')
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
