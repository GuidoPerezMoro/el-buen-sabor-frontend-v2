'use client'

import {useState, useEffect, useMemo, useCallback} from 'react'
import {useParams} from 'next/navigation'
import SearchAddBar from '@/components/ui/SearchAddBar'
import StatusMessage from '@/components/ui/StatusMessage'
import CategoriaCardDesktop from '@/components/domain/categoria/CategoriaCardDesktop'
import {CategoriaNode} from '@/services/types/categoria'
import CategoriaCardMobile from '@/components/domain/categoria/CategoriaCardMobile'
import {fetchAllCategorias} from '@/services/categoria'
import {
  buildCategoriaTree,
  filterCategoriasBySucursalId,
  filterCategoriaTreeByText,
  filterCategoriaTreeByEsInsumo,
  EsInsumoFilter,
  findCategoriaNodeById,
} from '@/services/categoria.utils'
import useDialog from '@/hooks/useDialog'
import Dialog from '@/components/ui/Dialog'
import CategoriaForm from '@/components/domain/categoria/CategoriaForm'
import useIsMdUp from '@/hooks/useIsMdUp'

export default function CategoriasPage() {
  const isMdUp = useIsMdUp()
  const [filter, setFilter] = useState('')
  const [nodes, setNodes] = useState<CategoriaNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const {empresaId: eid, sucursalId: sid} = useParams<{empresaId: string; sucursalId: string}>()
  const empresaId = Number(eid)
  const sucursalId = Number(sid)
  const {openDialog} = useDialog()
  const [editingNode, setEditingNode] = useState<CategoriaNode | null>(null)
  const [newParent, setNewParent] = useState<{
    id: number | null
    label?: string
    esInsumo?: boolean
    sucursalIds?: number[]
  }>({id: null})

  const [typeFilter, setTypeFilter] = useState<EsInsumoFilter>('all')
  const typeOptions: ReadonlyArray<{value: EsInsumoFilter; label: string}> = [
    {value: 'all', label: 'Todo'},
    {value: 'insumo', label: 'Insumo'},
    {value: 'noinsumo', label: 'No insumo'},
  ]

  const currentTypeOption = useMemo(
    () => typeOptions.find(o => o.value === typeFilter) ?? typeOptions[0],
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
    } catch (e: any) {
      setError(e?.message ?? 'Error desconocido')
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
        filterOptions={typeOptions}
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
              onDelete={id => console.log('Delete', id)}
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
              onDelete={id => console.log('Delete', id)}
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
    </div>
  )
}
