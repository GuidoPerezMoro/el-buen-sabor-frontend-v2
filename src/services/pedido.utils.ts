import {getPrimaryStaffRole} from '@/hooks/useRoles'
import {EstadoPedido, FormaPago, Pedido, TipoEnvio} from '@/services/types/pedido'
import {hasAnyRole} from '@/services/types'

export function filterPedidosBySucursalId(list: Pedido[], sucursalId: number): Pedido[] {
  return list.filter(p => p.sucursal?.id === sucursalId)
}

/** Etiquetas legibles para cada estado de pedido. */
export function getEstadoPedidoLabel(estado: EstadoPedido): string {
  switch (estado) {
    case 'PENDIENTE':
      return 'Pendiente'
    case 'PREPARACION':
      return 'En preparación'
    case 'TERMINADO':
      return 'Terminado'
    case 'FACTURADO':
      return 'Facturado'
    case 'CANCELADO':
      return 'Cancelado'
    case 'RECHAZADO':
      return 'Rechazado'
    case 'ENTREGADO':
      return 'Entregado'
    case 'DELIVERY':
      return 'En reparto'
    default:
      return estado
  }
}

export function getFormaPagoLabel(value: FormaPago | string): string {
  switch (value) {
    case 'EFECTIVO':
      return 'Efectivo'
    case 'MERCADO_PAGO':
      return 'Mercadopago'
    case 'TARJETA':
      return 'Tarjeta'
    default:
      return String(value)
  }
}

export function getTipoEnvioLabel(value: TipoEnvio | string): string {
  switch (value) {
    case 'DELIVERY':
      return 'Delivery'
    case 'TAKE_AWAY':
      return 'Retiro en local'
    default:
      return String(value)
  }
}

/**
 * Allowed next estados for each estado.
 * NOTE: This is a frontend convention; backend still has final word and may reject invalid transitions.
 * Adjust as needed to match real business rules.
 */
const PEDIDO_ALLOWED_NEXT_ESTADOS: Record<EstadoPedido, EstadoPedido[]> = {
  PENDIENTE: ['PREPARACION', 'CANCELADO', 'RECHAZADO'],
  PREPARACION: ['TERMINADO', 'CANCELADO'],
  TERMINADO: ['ENTREGADO', 'FACTURADO'],
  ENTREGADO: ['FACTURADO'],
  FACTURADO: [],
  CANCELADO: [],
  RECHAZADO: [],
  DELIVERY: ['ENTREGADO', 'FACTURADO'],
}

export function getAllowedNextEstados(current: EstadoPedido): EstadoPedido[] {
  return PEDIDO_ALLOWED_NEXT_ESTADOS[current] ?? []
}

/** Aplica restricciones de negocio según el rol. */
export function getAllowedNextEstadosForRole(
  current: EstadoPedido,
  roles?: string[] | null
): EstadoPedido[] {
  const base = getAllowedNextEstados(current)
  const role = getPrimaryStaffRole(roles)

  if (role === 'cocinero') {
    // Cocinero: solo puede marcar preparación como terminado.
    if (current === 'PREPARACION') return ['TERMINADO']
    return []
  }

  // Gerente / admin / superadmin: por ahora tienen el mapa completo.
  return base
}

// Polling
export const PEDIDOS_DEFAULT_POLL_INTERVAL_MS = 5000

type PedidosPollOptions = {
  /** Interval in ms between polls (default: 5000ms) */
  intervalMs?: number
  /** If true, runs once immediately before starting the interval (default: true) */
  immediate?: boolean
}

/**
 * Simple polling helper.
 *
 * Usage (in a React component):
 *   useEffect(() => {
 *     return startPedidosPolling(() => refetchPedidos(), {
 *       intervalMs: PEDIDOS_DEFAULT_POLL_INTERVAL_MS,
 *       immediate: true,
 *     })
   }, [refetchPedidos])
 */
export function startPedidosPolling(
  fetchFn: () => Promise<void>,
  options: PedidosPollOptions = {}
): () => void {
  const {intervalMs = PEDIDOS_DEFAULT_POLL_INTERVAL_MS, immediate = true} = options

  let cancelled = false
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const tick = async () => {
    if (cancelled) return
    try {
      await fetchFn()
    } finally {
      if (cancelled) return
      timeoutId = setTimeout(tick, intervalMs)
    }
  }

  if (immediate) {
    void tick()
  } else {
    timeoutId = setTimeout(tick, intervalMs)
  }

  return () => {
    cancelled = true
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
  }
}

/** Búsqueda solo por cliente (nombre + apellido). */
export function filterPedidosByText(list: Pedido[], query: string): Pedido[] {
  const q = query.trim()
  if (!q) return list

  const fold = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()

  const term = fold(q)

  return list.filter(p => {
    const nombre = `${p.cliente?.nombre ?? ''} ${p.cliente?.apellido ?? ''}`.trim()
    return fold(nombre).includes(term)
  })
}

/** Filtra pedidos visibles según rol (además del filtro por sucursal). */
export function filterPedidosByRole(list: Pedido[], roles?: string[] | null): Pedido[] {
  if (hasAnyRole(roles ?? undefined, ['cocinero'])) {
    // Cocina: solo pedidos relevantes al flujo de preparación.
    return list.filter(p => p.estado === 'PREPARACION' || p.estado === 'TERMINADO')
  }
  // Otros staff ven todos los estados disponibles por ahora.
  return list
}

/** Intenta construir un Date local usando fechaDePedido + horarioEstimada. */
function buildEstimatedDate(pedido: Pedido): Date | null {
  if (!pedido.fechaDePedido || !pedido.horarioEstimada) return null
  const timePart = pedido.horarioEstimada.split('.')[0] // "HH:MM:SS"
  const isoCandidate = `${pedido.fechaDePedido}T${timePart}`
  const d = new Date(isoCandidate)
  return Number.isNaN(d.getTime()) ? null : d
}

/** True si la hora estimada ya quedó en el pasado respecto al reloj local. */
export function isPedidoDelayed(pedido: Pedido): boolean {
  // Una vez entregado o facturado, ya no se considera "atrasado"
  if (pedido.estado === 'ENTREGADO' || pedido.estado === 'FACTURADO') {
    return false
  }

  const est = buildEstimatedDate(pedido)
  if (!est) return false
  const now = new Date()
  return now.getTime() > est.getTime()
}
