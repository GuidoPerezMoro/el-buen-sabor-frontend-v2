'use client'

import {useState, useEffect} from 'react'
import SearchAddBar from '@/components/ui/SearchAddBar'
import CategoriaCard from '@/components/domain/categoria/CategoriaCard'
import {Categoria, CategoriaNode} from '@/services/types/categoria'
import CategoriaAccordion from '@/components/domain/categoria/CategoriaAccordion'

export default function CategoriasPage() {
  const [filter, setFilter] = useState('')
  const [nodes, setNodes] = useState<CategoriaNode[]>([])

  useEffect(() => {
    // dummy data
    const raw: Categoria[] = [
      // ── ROOTS ────────────────────────────────────────────────────────────
      {
        id: 1,
        habilitado: false,
        denominacion: 'Bebidas',
        esInsumo: true,
        categoriaPadre: null,
        sucursales: [],
      },
      {
        id: 2,
        habilitado: false,
        denominacion: 'Alimentos',
        esInsumo: false,
        categoriaPadre: null,
        sucursales: [],
      },
      {
        id: 3,
        habilitado: false,
        denominacion: 'Varios',
        esInsumo: false,
        categoriaPadre: null,
        sucursales: [],
      },

      // ── CHILDREN OF BEBIDAS (id 1) ────────────────────────────────────────
      {
        id: 4,
        habilitado: false,
        denominacion: 'Bebidas frías',
        esInsumo: true,
        categoriaPadre: {id: 1} as any,
        sucursales: [],
      },
      {
        id: 5,
        habilitado: false,
        denominacion: 'Bebidas calientes',
        esInsumo: true,
        categoriaPadre: {id: 1} as any,
        sucursales: [],
      },
      {
        id: 6,
        habilitado: false,
        denominacion: 'Jugos',
        esInsumo: true,
        categoriaPadre: {id: 1} as any,
        sucursales: [],
      },

      // ── CHILDREN OF “Jugos” (id 6) ───────────────────────────────────────
      {
        id: 14,
        habilitado: false,
        denominacion: 'Jugos naturales',
        esInsumo: true,
        categoriaPadre: {id: 6} as any,
        sucursales: [],
      },
      {
        id: 15,
        habilitado: false,
        denominacion: 'Jugos dietéticos',
        esInsumo: true,
        categoriaPadre: {id: 6} as any,
        sucursales: [],
      },

      // ── GRANDCHILDREN OF “Bebidas frías” (id 4) ──────────────────────────
      {
        id: 7,
        habilitado: false,
        denominacion: 'Refrescos',
        esInsumo: true,
        categoriaPadre: {id: 4} as any,
        sucursales: [],
      },
      {
        id: 8,
        habilitado: false,
        denominacion: 'Limonadas',
        esInsumo: true,
        categoriaPadre: {id: 4} as any,
        sucursales: [],
      },
      {
        id: 9,
        habilitado: false,
        denominacion: 'Aguas',
        esInsumo: true,
        categoriaPadre: {id: 4} as any,
        sucursales: [],
      },

      // ── CHILDREN OF ALIMENTOS (id 2) ────────────────────────────────────
      {
        id: 10,
        habilitado: false,
        denominacion: 'Panadería',
        esInsumo: false,
        categoriaPadre: {id: 2} as any,
        sucursales: [],
      },
      {
        id: 11,
        habilitado: false,
        denominacion: 'Repostería',
        esInsumo: false,
        categoriaPadre: {id: 2} as any,
        sucursales: [],
      },

      // ── GRANDCHILDREN OF “Panadería” (id 10) ─────────────────────────────
      {
        id: 12,
        habilitado: false,
        denominacion: 'Croissants',
        esInsumo: false,
        categoriaPadre: {id: 10} as any,
        sucursales: [],
      },
      {
        id: 13,
        habilitado: false,
        denominacion: 'Bagels',
        esInsumo: false,
        categoriaPadre: {id: 10} as any,
        sucursales: [],
      },
    ]

    // build a simple tree
    const map = new Map<number, CategoriaNode>()
    raw.forEach(c => map.set(c.id, {...c, children: []}))
    map.forEach(node => {
      if (node.categoriaPadre) {
        const parent = map.get(node.categoriaPadre.id)
        parent?.children.push(node)
      }
    })
    setNodes(Array.from(map.values()).filter((n): n is CategoriaNode => n.categoriaPadre === null))
  }, [])

  const filteredRoots = nodes.filter(n =>
    n.denominacion.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Categorías</h1>

      <SearchAddBar
        value={filter}
        onChange={setFilter}
        onAdd={() => console.log('Open create categoria dialog')}
        addLabel="Nueva categoría"
        placeholder="Buscar categoría"
      />
      {/* mobile accordion */}
      <div className="md:hidden space-y-2">
        {filteredRoots.map(cat => (
          <CategoriaAccordion
            key={cat.id}
            categoria={cat}
            onSelect={id => console.log('Select', id)}
            onEdit={id => console.log('Edit', id)}
            onDelete={id => console.log('Delete', id)}
          />
        ))}
      </div>

      {/* desktop grid */}
      <div className="hidden md:flex md:flex-col gap-6">
        {filteredRoots.map(cat => (
          <CategoriaCard
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
