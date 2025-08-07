'use client'

import {useState, useEffect} from 'react'
import {useParams} from 'next/navigation'
import SearchAddBar from '@/components/ui/SearchAddBar'
import CategoriaCardDesktop from '@/components/domain/categoria/CategoriaCardDesktop'
import {CategoriaNode} from '@/services/types/categoria'
import CategoriaCardMobile from '@/components/domain/categoria/CategoriaCardMobile'
import {fetchAllCategorias} from '@/services/categoria'
import {buildCategoriaTree, filterCategoriasBySucursalId} from '@/services/categoria.utils'

export default function CategoriasPage() {
  const [filter, setFilter] = useState('')
  const [nodes, setNodes] = useState<CategoriaNode[]>([])
  const {sucursalId: sid} = useParams<{empresaId: string; sucursalId: string}>()
  const sucursalId = Number(sid)

  // Real data
  useEffect(() => {
    let active = true
    ;(async () => {
      const raw = await fetchAllCategorias()
      const scoped = filterCategoriasBySucursalId(raw, sucursalId) // frontend filter
      const roots = buildCategoriaTree(scoped)
      if (active) setNodes(roots)
    })()
    return () => {
      active = false
    }
  }, [sucursalId])

  const filteredRoots = nodes.filter(n =>
    n.denominacion.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Categorías</h1>

      <SearchAddBar
        value={filter}
        onChange={setFilter}
        onAdd={() => console.log('Open create categoria dialog')}
        addLabel="Nueva categoría"
        placeholder="Buscar categoría"
      />
      {/* Mobile */}
      <div className="md:hidden space-y-2">
        {filteredRoots.map(cat => (
          <CategoriaCardMobile
            key={cat.id}
            categoria={cat}
            onSelect={id => console.log('Select', id)}
            onEdit={id => console.log('Edit', id)}
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
            onSelect={id => console.log('Select', id)}
            onEdit={id => console.log('Edit', id)}
            onDelete={id => console.log('Delete', id)}
          />
        ))}
      </div>
    </div>
  )
}
