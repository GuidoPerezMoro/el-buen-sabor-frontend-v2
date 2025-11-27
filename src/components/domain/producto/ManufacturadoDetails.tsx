'use client'

import Image from 'next/image'
import {Sandwich} from 'lucide-react' // if your icon set lacks Sandwich, use UtensilsCrossed
import {useRoles} from '@/hooks/useRoles'
import {formatARS} from '@/lib/format'
import {ArticuloManufacturado} from '@/services/types/articuloManufacturado'

export default function ManufacturadoDetails({item}: {item: ArticuloManufacturado}) {
  const {roles} = useRoles()
  const isCocinero = roles?.includes('cocinero')

  const price = item.precioVenta ? formatARS(item.precioVenta) : '—'
  const cost =
    (item.costoTotal ?? 0) === 0 || item.costoTotal == null ? '—' : formatARS(item.costoTotal)
  const time = item.tiempoEstimadoMinutos ?? 0

  return (
    <div className="flex flex-col gap-5">
      {/* Header: image + meta (title is in the Dialog header already) */}
      <div className="flex gap-4">
        <div className="w-28 h-28 rounded-md overflow-hidden border border-muted flex items-center justify-center">
          {item.imagenUrl ? (
            <Image
              src={item.imagenUrl}
              alt=""
              width={112}
              height={112}
              className="w-28 h-28 object-cover"
            />
          ) : (
            <>
              <Sandwich className="h-8 w-8 text-muted" aria-hidden="true" />
              <span className="sr-only">Sin imagen</span>
            </>
          )}
        </div>

        <div className="flex-1">
          {/* Categoria */}
          <p className="text-sm text-muted">{item.categoria?.denominacion ?? '—'}</p>
          {/* Tiempo en su propia línea */}
          <p className="text-sm text-muted mt-0.5">{time} min de preparación</p>
          {/* Precio + costo (ocultos para cocinero) */}
          {!isCocinero && (
            <div className="text-sm mt-2 space-y-0.5">
              <p>
                <strong>Precio:</strong> {price}
              </p>
              <p>
                <strong>Costo:</strong> {cost}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Descripción */}
      {item.descripcion && (
        <section>
          <h4 className="text-sm font-semibold mb-1">Descripción</h4>
          <p className="text-sm text-text">{item.descripcion}</p>
        </section>
      )}

      {/* Preparación */}
      {item.preparacion && (
        <section>
          <h4 className="text-sm font-semibold mb-1">Preparación</h4>
          <p className="text-sm whitespace-pre-wrap">{item.preparacion}</p>
        </section>
      )}

      {/* Ingredientes */}
      <section>
        <h4 className="text-sm font-semibold mb-1">Ingredientes</h4>
        {item.detalles?.length ? (
          <ul className="text-sm space-y-1.5">
            {item.detalles.map((d, idx) => {
              const ins = d.articuloInsumo
              const unit = ins?.unidadDeMedida?.denominacion ?? ''
              const name = ins?.denominacion ?? `Insumo #${ins?.id ?? ''}`
              return (
                <li key={idx} className="flex items-baseline gap-2">
                  {/* fixed width for qty keeps alignment; × improves readability */}
                  <span className="font-mono w-6 text-right">{d.cantidad}</span>
                  <span>× {unit}</span>
                  <span>— {name}</span>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted">Sin ingredientes.</p>
        )}
      </section>
    </div>
  )
}
