'use client'

import {formatARS} from '@/lib/format'
import {Pedido} from '@/services/types/pedido'
import PedidoStateBadge from './PedidoStateBadge'

interface Props {
  pedido: Pedido
}

export default function PedidoDetails({pedido}: Props) {
  const clienteNombre = `${pedido.cliente?.nombre ?? ''} ${pedido.cliente?.apellido ?? ''}`.trim()
  const domicilio = pedido.domicilio
  const loc = domicilio?.localidad
  const prov = loc?.provincia
  const pais = prov?.pais

  return (
    <div className="space-y-4 text-sm">
      {/* Estado + totales */}
      <section className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">Estado</span>
          <PedidoStateBadge estado={pedido.estado} />
        </div>
        <div className="space-y-0.5 text-right">
          <p>
            <span className="text-xs text-muted mr-1">Total:</span>
            <span className="font-semibold">{formatARS(pedido.total)}</span>
          </p>
          <p className="text-xs text-muted">
            Costo: <span className="font-mono">{formatARS(pedido.costoTotal ?? 0)}</span>
          </p>
        </div>
      </section>

      {/* Cliente */}
      <section>
        <h4 className="text-sm font-semibold mb-1">Cliente</h4>
        <div className="space-y-0.5">
          <p>{clienteNombre || 'Sin nombre'}</p>
          {pedido.cliente?.telefono && (
            <p className="text-xs text-muted">Teléfono: {pedido.cliente.telefono}</p>
          )}
        </div>
      </section>

      {/* Domicilio */}
      <section>
        <h4 className="text-sm font-semibold mb-1">Domicilio</h4>
        {domicilio ? (
          <p className="text-sm text-text">
            {domicilio.calle} {domicilio.numero}, CP {domicilio.cp}
            {loc?.nombre && ` – ${loc.nombre}`}
            {prov?.nombre && `, ${prov.nombre}`}
            {pais?.nombre && `, ${pais.nombre}`}
          </p>
        ) : (
          <p className="text-sm text-muted">Sin domicilio asociado.</p>
        )}
      </section>

      {/* Info de pedido */}
      <section className="grid grid-cols-2 gap-3 text-xs md:text-sm">
        <div>
          <p className="text-muted">Sucursal</p>
          <p>{pedido.sucursal?.nombre ?? '—'}</p>
        </div>
        <div>
          <p className="text-muted">Fecha</p>
          <p>
            {pedido.fechaDePedido} · {pedido.horarioEstimada}
          </p>
        </div>
        <div>
          <p className="text-muted">Tipo de envío</p>
          <p>{pedido.tipoDeEnvio}</p>
        </div>
        <div>
          <p className="text-muted">Forma de pago</p>
          <p>{pedido.formaDePago}</p>
        </div>
      </section>

      {/* Detalles */}
      <section>
        <h4 className="text-sm font-semibold mb-1">Artículos</h4>
        {pedido.detalles?.length ? (
          <ul className="space-y-1.5">
            {pedido.detalles.map(d => {
              const articulo = d.articulo
              const promo = (d as any).promocion
              const label =
                promo?.denominacion ??
                articulo?.denominacion ??
                (promo ? `Promoción #${promo.id}` : `Artículo #${articulo?.id ?? d.id}`)

              return (
                <li
                  key={d.id}
                  className="flex items-baseline justify-between gap-2 text-xs md:text-sm"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono w-6 text-right">{d.cantidad}</span>
                    <span>× {label}</span>
                  </div>
                  <span className="font-mono">{formatARS(d.subTotal)}</span>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted">Sin detalles.</p>
        )}
      </section>
    </div>
  )
}
