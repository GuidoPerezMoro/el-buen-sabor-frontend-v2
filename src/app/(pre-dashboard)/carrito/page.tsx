'use client'

import {useEffect} from 'react'
import Image from 'next/image'
import {usePathname, useRouter} from 'next/navigation'
import {Trash, Utensils} from 'lucide-react'

import Button from '@/components/ui/Button'
import {useCart} from '@/contexts/cart'
import {useRoles} from '@/hooks/useRoles'
import QuantityControl from '@/components/domain/cart/QuantityControl'
import {formatARS} from '@/lib/format'

export default function CarritoPage() {
  const {items, totalAmount, totalQuantity, clear, removeItem, setItemQuantity} = useCart()
  const {roles, loading, has} = useRoles()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return
    const isCliente = roles ? has('cliente') : false
    if (!isCliente) {
      router.replace('/api/auth/login')
    }
  }, [loading, roles, has, router])

  if (loading) return <main className="p-4 text-sm text-muted">Cargando...</main>

  const isCliente = roles ? has('cliente') : false
  if (!isCliente) return null

  const hasItems = items.length > 0

  return (
    <main className="space-y-4 p-4 sm:p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Carrito</h1>

      {!hasItems && (
        <div className="space-y-3">
          <p className="text-muted text-xs">Aún no hay artículos en el carrito.</p>
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => {
                router.push('/empresa')
              }}
            >
              Ir a la tienda
            </Button>
          </div>
        </div>
      )}

      {hasItems && (
        <section className="space-y-4">
          <ul className="space-y-2">
            {items.map(item => {
              const lineTotal = item.unitPrice * item.quantity
              return (
                <li
                  key={`${item.type}-${item.id}`}
                  className="
                    grid items-center gap-3 border-b border-muted/40 pb-2 last:border-0 last:pb-0
                    grid-cols-[3rem_1fr_auto] md:grid-cols-[3rem_1fr_minmax(8rem,auto)_5.5rem_auto]
                  "
                >
                  <div className="relative h-10 w-12 overflow-hidden rounded-md bg-muted/30">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Utensils className="h-4 w-4 text-muted" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-xs text-muted hidden sm:block">
                      {item.type === 'promo' ? 'Promoción' : 'Producto'} ·{' '}
                      {formatARS(item.unitPrice)} c/u
                    </p>
                  </div>

                  <QuantityControl
                    className="h-8 justify-self-end"
                    value={item.quantity}
                    min={1}
                    onChange={v => setItemQuantity(item.type, item.id, v)}
                  />

                  <span className="hidden md:block text-xs font-medium tabular-nums text-right w-[5.5rem]">
                    {formatARS(lineTotal)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.type, item.id)}
                    className="justify-self-end inline-flex h-6 w-6 items-center justify-center rounded text-muted hover:text-danger"
                    aria-label="Eliminar"
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="flex items-center justify-between pt-2 border-t border-muted">
            <p className="text-xs text-muted">Total de artículos: {totalQuantity}</p>
            <p className="text-base font-semibold">{formatARS(totalAmount)}</p>
          </div>

          <div className="flex justify-between items-center pt-2">
            <Button variant="ghost" size="sm" disabled={!hasItems} onClick={clear}>
              Vaciar carrito
            </Button>

            <Button disabled>Continuar con la compra</Button>
          </div>
        </section>
      )}
    </main>
  )
}
