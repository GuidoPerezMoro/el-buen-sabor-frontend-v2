'use client'

import React, {useState} from 'react'
import {CategoriaNode} from '@/services/types/categoria'
import {ChevronDown, Tag} from 'lucide-react'
import {cn} from '@/lib/utils'

export interface CategoriaAccordionProps {
  categoria: CategoriaNode
  level?: number
  onSelect?: (id: number) => void
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
}

export default function CategoriaAccordion({
  categoria,
  level = 0,
  onSelect,
  onEdit,
  onDelete,
}: CategoriaAccordionProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className={cn(`pl-${level * 4} py-2 flex flex-col`)}>
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2">
          <ChevronDown
            className={cn('w-4 h-4 text-muted transition-transform', open ? 'rotate-180' : '')}
          />
          <Tag className="w-4 h-4 text-primary" />
          <span
            className="flex-1 font-medium"
            onClick={e => {
              e.stopPropagation()
              onSelect?.(categoria.id)
            }}
          >
            {categoria.denominacion}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={e => {
              e.stopPropagation()
              onEdit?.(categoria.id)
            }}
            aria-label="Editar"
          >
            ✎
          </button>
          <button
            onClick={e => {
              e.stopPropagation()
              onDelete?.(categoria.id)
            }}
            aria-label="Eliminar"
          >
            🗑
          </button>
        </div>
      </div>

      {open &&
        categoria.children.map(child => (
          <CategoriaAccordion
            key={child.id}
            categoria={child}
            level={level + 1}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
    </div>
  )
}
