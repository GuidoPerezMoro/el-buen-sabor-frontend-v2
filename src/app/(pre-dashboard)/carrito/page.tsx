'use client'

import {useEffect, useMemo, useState} from 'react'
import Image from 'next/image'
import {useRouter} from 'next/navigation'
import {useUser} from '@auth0/nextjs-auth0/client'
import {useCart} from '@/contexts/cart'
import {useRoles} from '@/hooks/useRoles'

import {Trash, Utensils} from 'lucide-react'

import {formatARS} from '@/lib/format'
import Button from '@/components/ui/Button'
import StatusMessage from '@/components/ui/StatusMessage'
import QuantityControl from '@/components/domain/cart/QuantityControl'

import type {Cliente, TipoEnvio} from '@/services/types'
import {fetchClienteByEmail} from '@/services/cliente'
import {createPedido, createPedidoMercadoPago} from '@/services/pedido'

export default function CarritoPage() {
  const router = useRouter()

  const {roles, loading: rolesLoading, has} = useRoles()
  const {user, isLoading: userLoading} = useUser()

  const {items, totalAmount, totalQuantity, clear, removeItem, setItemQuantity, sucursalId} =
    useCart()

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [clienteLoading, setClienteLoading] = useState(true)
  const [clienteError, setClienteError] = useState<string | null>(null)

  const [tipoEnvio, setTipoEnvio] = useState<TipoEnvio>('DELIVERY')
  const [selectedDomicilioId, setSelectedDomicilioId] = useState<number | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Gate by role: solo "cliente" puede usar el carrito
  useEffect(() => {
    if (rolesLoading) return
    const isCliente = roles ? has('cliente') : false
    if (!isCliente) {
      router.replace('/api/auth/login')
    }
  }, [rolesLoading, roles, has, router])

  // Cargar cliente + domicilios usando el email Auth0
  useEffect(() => {
    if (userLoading) return

    if (!user?.email) {
      setCliente(null)
      setClienteError('No se encontró un email para el usuario autenticado.')
      setClienteLoading(false)
      return
    }

    let active = true
    setClienteLoading(true)
    setClienteError(null)
    ;(async () => {
      try {
        const found = await fetchClienteByEmail(user.email!)
        if (!active) return
        if (!found) {
          setCliente(null)
          setClienteError(
            'Aún no tienes un perfil de cliente. Completa tus datos para poder continuar con la compra.'
          )
        } else {
          setCliente(found)
          // seleccionar domicilio por defecto si existe alguno
          if (found.domicilios.length > 0) {
            setSelectedDomicilioId(found.domicilios[0].id)
          }
        }
      } catch (err) {
        if (!active) return
        const message = err instanceof Error ? err.message : 'Error al cargar los datos de cliente.'
        setClienteError(message)
      } finally {
        if (!active) return
        setClienteLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [userLoading, user])

  const rolesReady = !rolesLoading
  const isClienteRole = roles ? has('cliente') : false

  if (!rolesReady) {
    return <main className="p-4 text-sm text-muted">Cargando...</main>
  }

  if (!isClienteRole) {
    // ya disparamos redirect en el effect
    return null
  }

  const hasItems = items.length > 0
  const hasDomicilios = (cliente?.domicilios?.length ?? 0) > 0

  const selectedDomicilio = cliente?.domicilios.find(d => d.id === selectedDomicilioId) ?? null

  const canCheckout =
    hasItems && !!cliente && hasDomicilios && selectedDomicilioId != null && !!sucursalId

  const handleGoToPerfil = () => {
    router.push('/perfil')
  }

  const handleGoToEmpresa = () => {
    router.push('/empresa')
  }

  const handleCheckout = async () => {
    if (!canCheckout || !cliente || !selectedDomicilioId || !sucursalId) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      const detalles = items.map(item =>
        item.type === 'promo'
          ? {
              cantidad: item.quantity,
              idPromocion: item.id,
            }
          : {
              cantidad: item.quantity,
              idArticulo: item.id,
            }
      )

      const pedido = await createPedido({
        tipoDeEnvio: tipoEnvio,
        formaDePago: 'MERCADO_PAGO',
        idCliente: cliente.id,
        idDomicilio: selectedDomicilioId,
        idSucursal: sucursalId,
        detalles,
      })

      // ✅ Clear cart *before* redirect
      clear()

      const pref = await createPedidoMercadoPago(pedido.id)
      if (!pref.initPoint) {
        throw new Error('No se recibió la URL de pago de MercadoPago.')
      }

      // Redirigir al checkout de MercadoPago
      window.location.href = pref.initPoint
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ocurrió un error al iniciar el pago.'
      setSubmitError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="space-y-4 p-4 sm:p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Carrito</h1>

      {!hasItems && (
        <div className="space-y-3">
          <p className="text-muted text-xs">Aún no hay artículos en el carrito.</p>
          <Button type="button" variant="primary" onClick={handleGoToEmpresa}>
            Ir a la tienda
          </Button>
        </div>
      )}

      {hasItems && (
        <section className="space-y-6">
          {/* Lista de ítems */}
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

          {/* Resumen + datos de envío/pago */}
          <div className="space-y-4 border-t border-muted pt-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted">Total de artículos: {totalQuantity}</p>
              <p className="text-base font-semibold">{formatARS(totalAmount)}</p>
            </div>

            {/* Tipo de envío */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Tipo de envío</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  className={`rounded-full border px-3 py-1 ${
                    tipoEnvio === 'DELIVERY'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-muted text-text'
                  }`}
                  onClick={() => setTipoEnvio('DELIVERY')}
                >
                  Delivery
                </button>
                <button
                  type="button"
                  className={`rounded-full border px-3 py-1 ${
                    tipoEnvio === 'TAKE_AWAY'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-muted text-text'
                  }`}
                  onClick={() => setTipoEnvio('TAKE_AWAY')}
                >
                  Retiro en local
                </button>
              </div>
            </div>

            {/* Domicilio */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Domicilio de entrega</p>

              {clienteLoading && <StatusMessage type="loading" message="Cargando domicilios..." />}

              {!clienteLoading && clienteError && (
                <StatusMessage type="error" message={clienteError} />
              )}

              {!clienteLoading && cliente && !hasDomicilios && (
                <div className="space-y-2 text-xs">
                  <p className="text-muted">
                    Todavía no tienes domicilios cargados. Completa tu perfil para poder recibir tus
                    pedidos.
                  </p>
                  <Button type="button" size="sm" onClick={handleGoToPerfil}>
                    Completar mi perfil
                  </Button>
                </div>
              )}

              {!clienteLoading && cliente && hasDomicilios && (
                <div className="space-y-2">
                  <div className="space-y-1 text-xs">
                    {cliente.domicilios.map(dom => (
                      <label
                        key={dom.id}
                        className="flex cursor-pointer items-start gap-2 rounded-lg border border-border/70 bg-muted/20 px-3 py-2 hover:border-primary/70"
                      >
                        <input
                          type="radio"
                          name="domicilio"
                          className="mt-0.5"
                          checked={selectedDomicilioId === dom.id}
                          onChange={() => setSelectedDomicilioId(dom.id)}
                        />
                        <div className="space-y-0.5">
                          <p className="font-medium">
                            {dom.calle} {dom.numero} ({dom.cp})
                          </p>
                          {dom.localidad && (
                            <p className="text-muted">
                              {dom.localidad.nombre}, {dom.localidad.provincia.nombre},{' '}
                              {dom.localidad.provincia.pais.nombre}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>

                  {selectedDomicilio && (
                    <p className="text-[11px] text-muted">
                      Usaremos este domicilio para tu pedido.
                    </p>
                  )}
                </div>
              )}
            </div>

            {submitError && (
              <StatusMessage type="error" message={submitError} className="text-xs" />
            )}

            <div className="flex justify-between items-center pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!hasItems || submitting}
                onClick={clear}
              >
                Vaciar carrito
              </Button>

              <Button type="button" disabled={!canCheckout || submitting} onClick={handleCheckout}>
                {submitting ? 'Redirigiendo a pago…' : 'Continuar con la compra'}
              </Button>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
