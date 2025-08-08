'use client'

import React, {useState} from 'react'
import {CategoriaNode} from '@/services/types/categoria'
import {ChevronDown, Tag, Plus, Pencil, Trash} from 'lucide-react'
import IconButton from '@/components/ui/IconButton'
import {cn} from '@/lib/utils'

interface CategoriaCardMobileProps {
  categoria: CategoriaNode
  onAddChild?: (id: number, label: string, esInsumo: boolean) => void
  onSelect?: (id: number) => void
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
}

export default function CategoriaCardMobile({
  categoria,
  onAddChild,
  onSelect,
  onEdit,
  onDelete,
}: CategoriaCardMobileProps) {
  const [open, setOpen] = useState(false)
  const hasChildren = categoria.children.length > 0

  return (
    <div className={cn('bg-white rounded-lg shadow-sm', 'p-2 mb-1')}>
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => hasChildren && setOpen(o => !o)}
      >
        <div className="flex items-center gap-1">
          {hasChildren ? (
            <ChevronDown
              className={cn('w-4 h-4 text-muted transition-transform', open ? 'rotate-180' : '')}
            />
          ) : (
            <div className="w-4 h-4" />
          )}

          <Tag className="w-4 h-4 text-primary flex-shrink-0" />

          <span
            className="flex-1 font-medium"
            onClick={e => {
              e.stopPropagation()
              onSelect?.(categoria.id)
              if (hasChildren) setOpen(o => !o)
            }}
          >
            {categoria.denominacion}
          </span>

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
              onClick={e => {
                e.stopPropagation()
                onAddChild(categoria.id, categoria.denominacion, categoria.esInsumo)
              }}
            />
          )}
          {onEdit && (
            <IconButton
              icon={<Pencil size={14} />}
              aria-label="Editar"
              onClick={e => {
                e.stopPropagation()
                onEdit(categoria.id)
              }}
            />
          )}
          {onDelete && (
            <IconButton
              icon={<Trash size={14} />}
              size="sm"
              aria-label="Eliminar"
              onClick={e => {
                e.stopPropagation()
                onDelete(categoria.id)
              }}
            />
          )}
        </div>
      </div>

      {hasChildren && open && (
        <div className="mt-2 flex flex-col">
          {categoria.children.map(child => (
            <CategoriaCardMobile
              key={child.id}
              categoria={child}
              onAddChild={onAddChild}
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
