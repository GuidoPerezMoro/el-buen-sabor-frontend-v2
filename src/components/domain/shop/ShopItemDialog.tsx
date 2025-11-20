'use client'

import Image from 'next/image'
import {Utensils} from 'lucide-react'
import Dialog from '@/components/ui/Dialog'

export interface ShopItemDialogData {
  type: 'promo' | 'manufacturado' | 'insumo'
  title: string
  description?: string | null
  price?: string | null
  validityLabel?: string | null
  imageUrl?: string | null
}

interface ShopItemDialogProps {
  name: string
  item: ShopItemDialogData | null
  onClose?: () => void
}

export default function ShopItemDialog({name, item, onClose}: ShopItemDialogProps) {
  if (!item) return null

  return (
    <Dialog name={name} title={item.title} onClose={onClose}>
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-md bg-muted">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover"
              sizes="128px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Utensils className="h-6 w-6 text-muted" />
            </div>
          )}
        </div>

        <div className="space-y-2 text-sm">
          {item.description && <p className="text-text whitespace-pre-line">{item.description}</p>}
          {item.validityLabel && <p className="text-xs text-muted">{item.validityLabel}</p>}
          {item.price && <p className="text-base font-semibold mt-1">{item.price}</p>}

          <p className="mt-2 text-xs text-muted">
            Esta es una vista previa. Aquí luego podremos configurar cantidades y agregar el
            artículo al carrito.
          </p>
        </div>
      </div>
    </Dialog>
  )
}
