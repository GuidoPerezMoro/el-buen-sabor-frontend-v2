'use client'

import React, {useState} from 'react'
import {Categoria, CategoriaNode} from '@/services/types/categoria'
import {Tag, ChevronDown} from 'lucide-react'
import IconButton from '@/components/ui/IconButton'
import {Pencil, Trash} from 'lucide-react'
import {cn} from '@/lib/utils'

export interface CategoriaCardProps {
  categoria: CategoriaNode
  childrenCategorias?: Categoria[]
  onSelect?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export default function CategoriaCard({categoria, onSelect, onEdit, onDelete}: CategoriaCardProps) {
  const {denominacion, esInsumo, children} = categoria
  const [collapsed, setCollapsed] = useState(false)
  const hasChildren = children.length > 0

  return (
    <div className="bg-white border rounded-lg shadow-sm p-4 flex flex-col justify-between h-full">
      {/* Header row: toggle - icon - title - badge - actions */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {hasChildren && (
            <button onClick={() => setCollapsed(!collapsed)} className="transition-transform">
              <ChevronDown className={cn('w-5 h-5 text-muted', collapsed ? '' : 'rotate-180')} />
            </button>
          )}
          <Tag className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-semibold text-text cursor-pointer" onClick={onSelect}>
            {denominacion}
          </h3>
          {esInsumo && (
            <span className="text-sm bg-primary/10 text-primary px-2 py-0.5 rounded">Insumo</span>
          )}
        </div>

        <div className="flex gap-2">
          {onEdit && (
            <IconButton icon={<Pencil size={16} />} aria-label="Editar" onClick={onEdit} />
          )}
          {onDelete && (
            <IconButton icon={<Trash size={16} />} aria-label="Eliminar" onClick={onDelete} />
          )}
        </div>
      </div>

      {/* Nested children */}
      {!collapsed && hasChildren && (
        <div className="mt-4 ml-6 flex flex-col gap-4">
          {children.map(child => (
            <CategoriaCard
              key={child.id}
              categoria={child}
              onSelect={() => onSelect?.()}
              onEdit={() => onEdit?.()}
              onDelete={() => onDelete?.()}
            />
          ))}
        </div>
      )}
    </div>
  )
}
