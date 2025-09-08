'use client'

import {Promocion} from '@/services/types/promocion'
import {formatARS} from '@/lib/format'

export default function PromocionDetails({promocion}: {promocion: Promocion}) {
  return (
    <div className="space-y-3 text-sm">
      <div className="text-base font-semibold">{promocion.denominacion}</div>
      {promocion.descripcionDescuento && (
        <p className="text-text">{promocion.descripcionDescuento}</p>
      )}
      <div>
        <span className="font-medium">Vigencia:</span> {promocion.fechaDesde} →{' '}
        {promocion.fechaHasta}
      </div>
      <div>
        <span className="font-medium">Horario:</span> {promocion.horaDesde.slice(0, 5)}–
        {promocion.horaHasta.slice(0, 5)}
      </div>
      <div>
        <span className="font-medium">Tipo:</span> {promocion.tipoPromocion}
      </div>
      <div>
        <span className="font-medium">Precio promocional:</span>{' '}
        {formatARS(promocion.precioPromocional)}
      </div>

      <div className="pt-2">
        <span className="font-medium">Artículos:</span>
        <ul className="mt-1 list-disc ml-5">
          {promocion.detalles.map(d => (
            <li key={d.id ?? `${promocion.id}-${d.articulo.id}`}>
              <span className="font-mono">{d.cantidad}</span> × {d.articulo.denominacion}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
