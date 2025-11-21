'use client'

import {useState, type FormEvent} from 'react'
import Image from 'next/image'
import {useParams} from 'next/navigation'

import {Utensils} from 'lucide-react'

import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

import {useRoles} from '@/hooks/useRoles'
import {useCart} from '@/contexts/cart'

import QuantityControl from '@/components/domain/cart/QuantityControl'

export interface ShopItemDialogData {
  type: 'promo' | 'manufacturado' | 'insumo'
  id: number
  title: string
  unitPrice: number
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

const STAFF_ROLES = ['superadmin', 'admin', 'gerente', 'cocinero'] as const

export default function ShopItemDialog({name, item, onClose}: ShopItemDialogProps) {
  const [quantity, setQuantity] = useState(1)
  const {sucursalId} = useParams<{empresaId: string; sucursalId: string}>()
  const {roles, loading, has} = useRoles()
  const {addItem} = useCart()

  if (!item) return null

  const isStaff = roles ? has([...STAFF_ROLES]) : false
  const canUseCart = !isStaff

  const numericSucursalId = sucursalId ? Number(sucursalId) : null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!canUseCart || !numericSucursalId) return
    const safeQty = Number.isNaN(quantity) || quantity <= 0 ? 1 : quantity

    addItem({
      sucursalId: numericSucursalId,
      item: {
        type: item.type,
        id: item.id,
        title: item.title,
        unitPrice: item.unitPrice,
        imageUrl: item.imageUrl ?? null,
      },
      quantity: safeQty,
    })

    setQuantity(1)
    onClose?.()
  }

  return (
    <Dialog name={name} title={item.title} onClose={onClose}>
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-md bg-muted/30">
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

        <div className="space-y-3 text-sm flex-1">
          {item.description && <p className="text-text whitespace-pre-line">{item.description}</p>}
          {item.validityLabel && <p className="text-xs text-muted">{item.validityLabel}</p>}
          {item.price && <p className="text-base font-semibold mt-1">{item.price}</p>}

          {canUseCart && numericSucursalId && (
            <form onSubmit={handleSubmit} className="mt-2 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">Cantidad</span>
                <QuantityControl value={quantity} min={1} onChange={setQuantity} />
              </div>
              <Button type="submit" disabled={loading}>
                Agregar al carrito
              </Button>
            </form>
          )}

          {!canUseCart && (
            <p className="mt-2 text-[11px] text-muted">
              El carrito está disponible solo para clientes e invitados.
            </p>
          )}
        </div>
      </div>
    </Dialog>
  )
}
