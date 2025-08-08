'use client'

import React, {useState} from 'react'
import {CategoriaNode} from '@/services/types/categoria'
import {ChevronDown, Tag, Plus, Pencil, Trash} from 'lucide-react'
import IconButton from '@/components/ui/IconButton'
import {cn} from '@/lib/utils'

interface CategoriaCardMobileProps {
  categoria: CategoriaNode
  onAddChild?: (id: number, label: string, esInsumo: boolean, parentSucursalIds: number[]) => void
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
}

export default function CategoriaCardMobile({
  categoria,
  onAddChild,
  onEdit,
  onDelete,
}: CategoriaCardMobileProps) {
  const {denominacion, esInsumo, children} = categoria
  const [collapsed, setCollapsed] = useState(false)
  const hasChildren = children.length > 0

  const handleToggle = () => hasChildren && setCollapsed(p => !p)
  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation()
    onAddChild?.(
      categoria.id,
      denominacion,
      esInsumo,
      categoria.sucursales.map(s => s.id)
    )
  }
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit?.(categoria.id)
  }
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(categoria.id)
  }

  return (
    <div className={cn('bg-white rounded-lg shadow-sm', 'p-2 mb-1')}>
      <div className="flex items-center justify-between cursor-pointer" onClick={handleToggle}>
        <div className="flex items-center gap-1">
          {hasChildren ? (
            <ChevronDown
              className={cn(
                'w-4 h-4 text-muted transition-transform',
                collapsed ? '' : 'rotate-180'
              )}
            />
          ) : (
            <div className="w-4 h-4" />
          )}

          <Tag className="w-4 h-4 text-primary flex-shrink-0" />

          <span className="flex-1 font-medium">{denominacion}</span>

          {categoria.esInsumo && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded whitespace-nowrap">
              Ins.
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {onAddChild && (
            <IconButton
              icon={<Plus size={14} />}
              aria-label="Agregar subcategoría"
              onClick={handleAddChild}
            />
          )}
          {onEdit && (
            <IconButton icon={<Pencil size={14} />} aria-label="Editar" onClick={handleEdit} />
          )}
          {onDelete && (
            <IconButton
              icon={<Trash size={14} />}
              size="sm"
              aria-label="Eliminar"
              onClick={handleDelete}
            />
          )}
        </div>
      </div>

      {!collapsed && hasChildren && (
        <div className="mt-2 flex flex-col">
          {categoria.children.map(child => (
            <CategoriaCardMobile
              key={child.id}
              categoria={child}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
