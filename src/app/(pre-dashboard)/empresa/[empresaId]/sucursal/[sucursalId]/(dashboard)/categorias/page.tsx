'use client'

import {useState, useEffect, useMemo, useCallback} from 'react'
import {useParams} from 'next/navigation'
import SearchAddBar from '@/components/ui/SearchAddBar'
import StatusMessage from '@/components/ui/StatusMessage'
import CategoriaCardDesktop from '@/components/domain/categoria/CategoriaCardDesktop'
import {CategoriaNode} from '@/services/types/categoria'
import CategoriaCardMobile from '@/components/domain/categoria/CategoriaCardMobile'
import {fetchAllCategorias, deleteCategoria} from '@/services/categoria'
import {
  buildCategoriaTree,
  filterCategoriasBySucursalId,
  filterCategoriaTreeByText,
  filterCategoriaTreeByEsInsumo,
  EsInsumoFilter,
  findCategoriaNodeById,
  hasChildrenInList,
  flattenCategoriaTree,
} from '@/services/categoria.utils'
import useDialog from '@/hooks/useDialog'
import Dialog from '@/components/ui/Dialog'
import CategoriaForm from '@/components/domain/categoria/CategoriaForm'
import useIsMdUp from '@/hooks/useIsMdUp'

const TYPE_OPTIONS: ReadonlyArray<{value: EsInsumoFilter; label: string}> = [
  {value: 'all', label: 'Todo'},
  {value: 'insumo', label: 'Insumo'},
  {value: 'noinsumo', label: 'No insumo'},
]

export default function CategoriasPage() {
  const isMdUp = useIsMdUp()
  const [filter, setFilter] = useState('')
  const [nodes, setNodes] = useState<CategoriaNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const {empresaId: eid, sucursalId: sid} = useParams<{empresaId: string; sucursalId: string}>()
  const empresaId = Number(eid)
  const sucursalId = Number(sid)
  const {openDialog, closeDialog} = useDialog()
  const [editingNode, setEditingNode] = useState<CategoriaNode | null>(null)
  const [newParent, setNewParent] = useState<{
    id: number | null
    label?: string
    esInsumo?: boolean
    sucursalIds?: number[]
  }>({id: null})

  const [typeFilter, setTypeFilter] = useState<EsInsumoFilter>('all')
  const currentTypeOption = useMemo(
    () => TYPE_OPTIONS.find(o => o.value === typeFilter) ?? TYPE_OPTIONS[0],
    [typeFilter]
  )

  const handleOpenCreateRoot = useCallback(() => {
    setNewParent({id: null})
    openDialog('nueva-categoria')
  }, [openDialog])

  const handleOpenCreateChild = useCallback(
    (id: number, label: string, esInsumo?: boolean, sucursalIds?: number[]) => {
      setNewParent({id, label, esInsumo, sucursalIds})
      openDialog('nueva-categoria')
    },
    [openDialog]
  )

  const handleOpenEdit = useCallback(
    (id: number) => {
      setEditingNode(findCategoriaNodeById(nodes, id))
      openDialog('editar-categoria')
    },
    [nodes, openDialog]
  )

  const loadCategorias = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const raw = await fetchAllCategorias()
      const scoped = filterCategoriasBySucursalId(raw, sucursalId)
      const roots = buildCategoriaTree(scoped)
      setNodes(roots)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error desconocido'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [sucursalId])

  useEffect(() => {
    loadCategorias()
  }, [loadCategorias])

  const filteredRoots = useMemo(() => {
    const byType = filterCategoriaTreeByEsInsumo(nodes, typeFilter)
    return filterCategoriaTreeByText(byType, filter)
  }, [nodes, typeFilter, filter])
  const hasActiveFilters = filter.trim() !== '' || typeFilter !== 'all'

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<{id: number; label: string} | null>(null)
  const [deleteBlockedReason, setDeleteBlockedReason] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const flatIndex = useMemo(() => {
    const flat = flattenCategoriaTree(nodes)
    return new Map(flat.map(f => [f.id, f.label]))
  }, [nodes])

  const handleRequestDelete = useCallback(
    async (id: number) => {
      const label = flatIndex.get(id) ?? 'Categoría'
      setDeleteTarget({id, label})
      setDeleteError(null)
      setDeleteBlockedReason(null)
      try {
        const all = await fetchAllCategorias()
        if (hasChildrenInList(all, id)) {
          setDeleteBlockedReason('No se puede eliminar porque la categoría tiene subcategorías.')
        }

        // TODO: también bloquear si la categoría tiene artículos (aunque sea hoja).
        // Cuando exista el servicio de artículos, consultar algo como:
        //   const hasArticulos = await hasArticulosForCategoria(id)
        //   if (hasArticulos) setDeleteBlockedReason('No se puede eliminar porque tiene artículos asociados.')
      } catch (e: any) {
        setDeleteError(e?.message ?? 'No se pudo verificar dependencias.')
      } finally {
        openDialog('eliminar-categoria')
      }
    },
    [flatIndex, openDialog]
  )

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    setDeleteError(null)
    try {
      await deleteCategoria(deleteTarget.id)
      setDeleteTarget(null)
      closeDialog('eliminar-categoria')
      await loadCategorias()
    } catch (e: any) {
      setDeleteError(e?.message ?? 'Error al eliminar la categoría.')
    } finally {
      setDeleteLoading(false)
    }
  }, [deleteTarget, closeDialog, loadCategorias])

  // Loading | Error state
  if (loading) return <StatusMessage type="loading" title="Cargando categorías..." />
  if (error) return <StatusMessage type="error" message="Error al cargar las categorías." />

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Categorías</h1>

      <SearchAddBar
        value={filter}
        onChange={setFilter}
        onAdd={handleOpenCreateRoot}
        addLabel="Nueva categoría"
        placeholder="Buscar categoría"
        showFilter
        filterOptions={TYPE_OPTIONS}
        filterValue={currentTypeOption}
        onFilterChange={opt =>
          setTypeFilter((typeof opt === 'string' ? opt : opt.value) as EsInsumoFilter)
        }
        filterPlaceholder="Tipo"
        filterSearchable={false}
        filterLabel="Tipo"
      />

      {filteredRoots.length === 0 ? (
        <StatusMessage
          type="empty"
          message={
            hasActiveFilters
              ? 'No se encontraron categorías con los filtros aplicados.'
              : 'Aún no hay categorías en esta sucursal.'
          }
        />
      ) : isMdUp ? (
        // Desktop
        <div className="flex flex-col gap-6">
          {filteredRoots.map(cat => (
            <CategoriaCardDesktop
              key={cat.id}
              categoria={cat}
              onAddChild={(id, label, esInsumo, parentSucursalIds) =>
                handleOpenCreateChild(id, label, esInsumo, parentSucursalIds)
              }
              onEdit={handleOpenEdit}
              onDelete={handleRequestDelete}
            />
          ))}
        </div>
      ) : (
        // Mobile
        <div className="space-y-2">
          {filteredRoots.map(cat => (
            <CategoriaCardMobile
              key={cat.id}
              categoria={cat}
              onAddChild={(id, label, esInsumo, parentSucursalIds) =>
                handleOpenCreateChild(id, label, esInsumo, parentSucursalIds)
              }
              onEdit={handleOpenEdit}
              onDelete={handleRequestDelete}
            />
          ))}
        </div>
      )}

      <Dialog
        name="nueva-categoria"
        title={newParent.id ? `Nueva subcategoría de "${newParent.label}"` : 'Nueva categoría'}
      >
        <CategoriaForm
          empresaId={empresaId}
          sucursalId={sucursalId}
          parentId={newParent.id ?? null}
          parentEsInsumo={newParent.esInsumo}
          parentSucursalIds={newParent.sucursalIds}
          dialogName="nueva-categoria"
          onSuccess={loadCategorias}
        />
      </Dialog>

      <Dialog name="editar-categoria" title="Editar categoría" onClose={() => setEditingNode(null)}>
        {editingNode && (
          <CategoriaForm
            empresaId={empresaId}
            sucursalId={sucursalId}
            initialData={editingNode}
            dialogName="editar-categoria"
            onSuccess={() => {
              setEditingNode(null)
              loadCategorias()
            }}
          />
        )}
      </Dialog>

      <Dialog
        name="eliminar-categoria"
        title="Eliminar categoría"
        onClose={() => {
          setDeleteTarget(null)
          setDeleteBlockedReason(null)
          setDeleteError(null)
        }}
        message={
          deleteTarget
            ? deleteBlockedReason
              ? `No puedes eliminar "${deleteTarget.label}" porque tiene subcategorías.`
              : `¿Confirmas eliminar "${deleteTarget.label}"? Esta acción no se puede deshacer.`
            : undefined
        }
        onSecondary={deleteBlockedReason ? undefined : () => closeDialog('eliminar-categoria')}
        secondaryLabel={deleteBlockedReason ? undefined : 'Cancelar'}
        onPrimary={
          deleteBlockedReason ? () => closeDialog('eliminar-categoria') : handleConfirmDelete
        }
        primaryLabel={deleteBlockedReason ? 'Entendido' : 'Eliminar'}
        isLoading={!deleteBlockedReason && deleteLoading}
      >
        {/* TODO: Permitir eliminar solo la sucursal actual (Update, si se arregla la API). O todas (Delete). */}
        {!deleteBlockedReason && deleteError && (
          <p className="text-sm text-danger">{deleteError}</p>
        )}
      </Dialog>
    </div>
  )
}
