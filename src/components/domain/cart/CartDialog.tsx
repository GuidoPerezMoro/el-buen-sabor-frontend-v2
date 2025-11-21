'use client'

import Image from 'next/image'
import {Trash, Utensils} from 'lucide-react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import {useCart} from '@/contexts/cart'
import {formatARS} from '@/lib/format'
import QuantityControl from '@/components/domain/cart/QuantityControl'

interface CartDialogProps {
  name: string
}

export default function CartDialog({name}: CartDialogProps) {
  const {items, totalAmount, totalQuantity, clear, removeItem, setItemQuantity} = useCart()

  const hasItems = items.length > 0

  return (
    <Dialog name={name} title="Carrito">
      <div className="space-y-4 text-sm">
        {!hasItems && <p className="text-muted text-xs">Aún no hay artículos en el carrito.</p>}

        {hasItems && (
          <div className="space-y-3">
            <ul className="space-y-2">
              {items.map(item => {
                const lineTotal = item.unitPrice * item.quantity
                return (
                  <li
                    key={`${item.type}-${item.id}`}
                    className="grid grid-cols-[3rem_1fr_auto_5.5rem_auto] items-center gap-3 border-b border-muted/40 pb-2 last:border-0 last:pb-0"
                  >
                    {/* thumbnail */}
                    <div className="relative h-10 w-12 overflow-hidden rounded-md bg-muted/30">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Utensils className="h-4 w-4 text-muted" aria-hidden="true" />
                        </div>
                      )}
                    </div>

                    {/* title + subtitle */}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted">
                        {item.type === 'promo' ? 'Promoción' : 'Producto'} ·{' '}
                        {formatARS(item.unitPrice)} c/u
                      </p>
                    </div>

                    {/* qty */}
                    <QuantityControl
                      className="h-8"
                      value={item.quantity}
                      min={1}
                      onChange={val => setItemQuantity(item.type, item.id, val)}
                    />
                    {/* line total: fixed width, right-aligned, tabular digits */}
                    <span className="text-xs font-medium tabular-nums text-right w-[5.5rem]">
                      {formatARS(lineTotal)}
                    </span>
                    {/* delete */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.type, item.id)}
                      className="inline-flex h-6 w-6 items-center justify-center rounded border border-transparent text-muted hover:text-danger hover:border-danger/40"
                      aria-label="Eliminar artículo"
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </button>
                  </li>
                )
              })}
            </ul>

            <div className="flex items-center justify-between pt-2 border-t border-muted">
              <div className="text-xs text-muted">
                <p>Total de artículos: {totalQuantity}</p>
              </div>
              <p className="text-base font-semibold text-right">{formatARS(totalAmount)}</p>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!hasItems}
                onClick={() => clear()}
              >
                Vaciar carrito
              </Button>

              {/* Checkout vendrá después; por ahora solo placeholder deshabilitado */}
              <Button type="button" disabled>
                Continuar con la compra
              </Button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  )
}
