'use client'

import React, {useState} from 'react'
import {CategoriaNode} from '@/services/types/categoria'
import {ChevronDown, Tag} from 'lucide-react'
import IconButton from '@/components/ui/IconButton'
import {Pencil, Trash} from 'lucide-react'
import {cn} from '@/lib/utils'

interface CategoriaCardDesktopProps {
  categoria: CategoriaNode
  onSelect?: (id: number) => void
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
}

export default function CategoriaCardDesktop({
  categoria,
  onSelect,
  onEdit,
  onDelete,
}: CategoriaCardDesktopProps) {
  const {denominacion, esInsumo, children} = categoria
  const [collapsed, setCollapsed] = useState(false)
  const hasChildren = children.length > 0

  // Use the real ID here:
  const handleToggle = () => setCollapsed(prev => !prev)
  const handleSelect = () => onSelect?.(categoria.id)
  const handleEdit = () => onEdit?.(categoria.id)
  const handleDelete = () => onDelete?.(categoria.id)

  return (
    <div className="bg-white border rounded-lg shadow-sm p-4 flex flex-col gap-2">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleToggle}>
          {hasChildren ? (
            <ChevronDown
              className={cn(
                'w-5 h-5 text-muted transition-transform',
                collapsed ? '' : 'rotate-180'
              )}
            />
          ) : (
            <div className="w-5 h-5" />
          )}
          <Tag className="w-6 h-6 text-primary flex-shrink-0" />
          <h3
            className="text-lg font-semibold text-text cursor-pointer"
            onClick={() => handleSelect()}
          >
            {denominacion}
          </h3>
          {esInsumo && (
            <span className="text-sm bg-primary/10 text-primary px-2 py-0.5 rounded">Insumo</span>
          )}
        </div>

        <div className="flex gap-2">
          {onEdit && (
            <IconButton
              icon={<Pencil size={16} />}
              aria-label="Editar"
              onClick={() => handleEdit()}
            />
          )}
          {onDelete && (
            <IconButton
              icon={<Trash size={16} />}
              aria-label="Eliminar"
              onClick={() => handleDelete()}
            />
          )}
        </div>
      </div>

      {/* Nested children */}
      {!collapsed && hasChildren && (
        <div className="mt-3 ml-6 flex flex-col gap-4">
          {children.map(child => (
            <CategoriaCardDesktop
              key={child.id}
              categoria={child}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
