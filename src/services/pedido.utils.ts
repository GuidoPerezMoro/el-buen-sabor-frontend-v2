import {EstadoPedido, Pedido} from './types/pedido'

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

/** Devuelve "HH:MM" a partir de un string horario tipo "21:42:42.12". */
export function formatHorarioEstimadaToHM(horario: string): string {
  if (!horario) return '--:--'
  const [timePart] = horario.split('.') // descartar fracción de segundo
  const [hh, mm] = timePart.split(':')
  if (!hh || !mm) return timePart ?? '--:--'
  return `${hh}:${mm}`
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
  const est = buildEstimatedDate(pedido)
  if (!est) return false
  const now = new Date()
  return now.getTime() > est.getTime()
}
