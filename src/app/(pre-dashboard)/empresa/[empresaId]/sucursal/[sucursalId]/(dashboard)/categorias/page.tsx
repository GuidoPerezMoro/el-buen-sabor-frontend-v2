'use client'

import {useState, useEffect, useMemo} from 'react'
import {useParams} from 'next/navigation'
import SearchAddBar from '@/components/ui/SearchAddBar'
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
} from '@/services/categoria.utils'
import useDialog from '@/hooks/useDialog'
import Dialog from '@/components/ui/Dialog'
import CategoriaForm from '@/components/domain/categoria/CategoriaForm'

// TODO: Use StatusMessage component
export default function CategoriasPage() {
  const [filter, setFilter] = useState('')
  const [nodes, setNodes] = useState<CategoriaNode[]>([])
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
  const typeOptions = [
    {value: 'all', label: 'Todo'},
    {value: 'insumo', label: 'Insumo'},
    {value: 'noinsumo', label: 'No insumo'},
  ] as const

  const currentTypeOption = useMemo(
    () => typeOptions.find(o => o.value === typeFilter) ?? typeOptions[0],
    [typeFilter]
  )

  const findNodeById = (roots: CategoriaNode[], id: number): CategoriaNode | null => {
    const stack = [...roots]
    while (stack.length) {
      const n = stack.pop()!
      if (n.id === id) return n
      n.children && stack.push(...n.children)
    }
    return null
  }

  const loadCategorias = async () => {
    const raw = await fetchAllCategorias()
    const scoped = filterCategoriasBySucursalId(raw, sucursalId)
    const roots = buildCategoriaTree(scoped)
    setNodes(roots)
  }

  useEffect(() => {
    loadCategorias()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sucursalId])

  const filteredRoots = useMemo(() => {
    const byType = filterCategoriaTreeByEsInsumo(nodes, typeFilter)
    return filterCategoriaTreeByText(byType, filter)
  }, [nodes, typeFilter, filter])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Categorías</h1>

      {/* TODO: Fix filter for children */}
      <SearchAddBar
        value={filter}
        onChange={setFilter}
        onAdd={() => {
          setNewParent({id: null})
          openDialog('nueva-categoria')
        }}
        addLabel="Nueva categoría"
        placeholder="Buscar categoría"
        showFilter
        filterOptions={typeOptions as any}
        filterValue={currentTypeOption as any}
        onFilterChange={opt =>
          setTypeFilter((typeof opt === 'string' ? opt : opt.value) as EsInsumoFilter)
        }
        filterPlaceholder="Tipo"
        filterSearchable={false}
        filterLabel="Tipo"
      />
      {/* Mobile */}
      <div className="md:hidden space-y-2">
        {filteredRoots.map(cat => (
          <CategoriaCardMobile
            key={cat.id}
            categoria={cat}
            onAddChild={(id, label, esInsumo, parentSucursalIds) => {
              setNewParent({id, label, esInsumo, sucursalIds: parentSucursalIds})
              openDialog('nueva-categoria')
            }}
            onEdit={id => {
              setEditingNode(findNodeById(nodes /* or tree, if you switched */, id))
              openDialog('editar-categoria')
            }}
            onDelete={id => console.log('Delete', id)}
          />
        ))}
      </div>

      {/* Desktop */}
      <div className="hidden md:flex md:flex-col gap-6">
        {filteredRoots.map(cat => (
          <CategoriaCardDesktop
            key={cat.id}
            categoria={cat}
            onAddChild={(id, label, esInsumo, parentSucursalIds) => {
              setNewParent({id, label, esInsumo, sucursalIds: parentSucursalIds})
              openDialog('nueva-categoria')
            }}
            onEdit={id => {
              setEditingNode(findNodeById(nodes /* or tree */, id))
              openDialog('editar-categoria')
            }}
            onDelete={id => console.log('Delete', id)}
          />
        ))}
      </div>

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
