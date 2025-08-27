import {z} from 'zod'

// detail row
const detalleSchema = z.object({
  cantidad: z.number().positive('La cantidad debe ser > 0'),
  idArticuloInsumo: z.number().int().positive('Selecciona un insumo'),
})

// base (create)
export const articuloManufacturadoCreateSchema = z.object({
  denominacion: z.string().min(1, 'La denominación es obligatoria'),
  precioVenta: z.number().nonnegative('Debe ser ≥ 0'),

  descripcion: z.string().max(2000).nullish(),
  tiempoEstimadoMinutos: z.number().int().nonnegative('Debe ser ≥ 0'),
  preparacion: z.string().max(10000).nullish(),

  idSucursal: z.number().int().positive('Sucursal requerida'),
  idUnidadDeMedida: z.number().int().positive('Unidad requerida'),
  idCategoria: z.number().int().positive('Categoría requerida'),

  detalles: z
    .array(detalleSchema)
    .min(1, 'Agrega al menos un insumo')
    .refine(
      rows => {
        const ids = rows.map(r => r.idArticuloInsumo)
        return new Set(ids).size === ids.length
      },
      {message: 'No repitas el mismo insumo', path: ['detalles']}
    ),
})

// update = partial(base), but detalles (if present) must still be valid
export const articuloManufacturadoUpdateSchema = articuloManufacturadoCreateSchema
  .omit({idSucursal: true, detalles: true})
  .partial()
  .extend({
    detalles: z.array(detalleSchema).min(1, 'Agrega al menos un insumo').optional(),
  })

export type ArticuloManufacturadoCreatePayload = z.infer<typeof articuloManufacturadoCreateSchema>
export type ArticuloManufacturadoUpdatePayload = z.infer<typeof articuloManufacturadoUpdateSchema>
