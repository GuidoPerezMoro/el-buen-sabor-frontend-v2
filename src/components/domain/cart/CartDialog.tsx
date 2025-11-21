'use client'

import {Trash} from 'lucide-react'
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
                    className="flex items-center justify-between gap-3 border-b border-muted/40 pb-2 last:border-0 last:pb-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted">
                        {item.type === 'promo' ? 'Promoción' : 'Producto'} ·{' '}
                        {formatARS(item.unitPrice)} c/u
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <QuantityControl
                        value={item.quantity}
                        min={1}
                        onChange={val => setItemQuantity(item.type, item.id, val)}
                      />
                      <span className="text-xs font-medium whitespace-nowrap">
                        {formatARS(lineTotal)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.type, item.id)}
                        className="inline-flex h-6 w-6 items-center justify-center rounded border border-transparent text-muted hover:text-danger hover:border-danger/40"
                        aria-label="Eliminar artículo"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
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
