'use client'

import {useMemo, useState} from 'react'
import Image from 'next/image'
import {ImageOff, Tag, CalendarDays, Clock} from 'lucide-react'
import {Promocion} from '@/services/types/promocion'
import {formatARS} from '@/lib/format'
import {TIPO_PROMOCION_OPTIONS} from '@/services/promocion.utils'

export default function PromocionDetails({promocion}: {promocion: Promocion}) {
  const [imgError, setImgError] = useState(false)
  const tipoLabel =
    useMemo(
      () => TIPO_PROMOCION_OPTIONS.find(o => o.value === promocion.tipoPromocion)?.label,
      [promocion.tipoPromocion]
    ) ?? String(promocion.tipoPromocion)

  const hasImage = !!promocion.imagenUrl && !imgError
  const sucursales = promocion.sucursales?.map(s => s.nombre).join(', ')

  return (
    <div className="space-y-4 text-sm">
      {/* Header: image + main info */}
      <div className="grid grid-cols-1 md:grid-cols-[180px,1fr] gap-4">
        <div className="relative rounded-md border bg-muted/20 overflow-hidden aspect-[4/3]">
          {hasImage ? (
            <Image
              src={promocion.imagenUrl as string}
              alt={promocion.denominacion}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 180px"
              onError={() => setImgError(true)}
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageOff className="h-10 w-10 text-muted" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              <span className="text-text text-xl font-medium">
                {formatARS(promocion.precioPromocional)}
              </span>
            </div>
            <div className="shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium">
              {tipoLabel}
            </div>
          </div>

          {promocion.descripcionDescuento && (
            <p className="text-text">{promocion.descripcionDescuento}</p>
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
            <div className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>
                {promocion.fechaDesde} → {promocion.fechaHasta}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {promocion.horaDesde.slice(0, 5)}–{promocion.horaHasta.slice(0, 5)}
              </span>
            </div>
          </div>

          {!!sucursales && (
            <div className="text-xs text-muted">
              <span className="font-medium text-text">Sucursales:</span> {sucursales}
            </div>
          )}
        </div>
      </div>

      {/* Line items */}
      <div className="pt-1">
        <div className="font-medium text-text mb-1.5">Artículos</div>
        {promocion.detalles.length === 0 ? (
          <p className="text-xs text-muted">Sin artículos en esta promoción.</p>
        ) : (
          <ul className="divide-y rounded-md border">
            {promocion.detalles.map(d => (
              <li
                key={d.id ?? `${promocion.id}-${d.articulo.id}`}
                className="flex items-center justify-between px-3 py-2"
              >
                <span className="truncate">{d.articulo.denominacion}</span>
                <span className="ml-3 inline-flex items-center gap-1 text-xs">
                  <span className="font-mono">{d.cantidad}</span>
                  <span className="text-muted">×</span>
                  <span className="text-muted">unidad</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
