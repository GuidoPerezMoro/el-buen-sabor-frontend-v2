import {z} from 'zod'

const detalleSchema = z.object({
  cantidad: z.number().positive('Cantidad > 0'),
  idArticuloInsumo: z.number().int().positive('Insumo requerido'),
})

const base = z.object({
  denominacion: z.string().min(1, 'La denominación es obligatoria'),
  precioVenta: z.number().nonnegative('Debe ser ≥ 0'),
  descripcion: z.string().max(2000).nullable().optional(),
  tiempoEstimadoMinutos: z.number().int().nonnegative('Debe ser ≥ 0'),
  preparacion: z.string().max(4000).nullable().optional(),
  idUnidadDeMedida: z.number().int().positive('Unidad requerida').optional(), // edit may omit
  idCategoria: z.number().int().positive('Categoría requerida').optional(), // edit may omit
  // idSucursal: only on create
})

export const articuloManufacturadoCreateSchema = base
  .extend({
    idSucursal: z.number().int().positive('Sucursal requerida'),
    idUnidadDeMedida: z.number().int().positive('Unidad requerida'),
    idCategoria: z.number().int().positive('Categoría requerida'),
    detalles: z.array(detalleSchema).min(1, 'Agrega al menos un insumo'),
  })
  .refine(d => d.detalles.length > 0, {
    message: 'Agrega al menos un insumo',
    path: ['detalles'],
  })

export const articuloManufacturadoUpdateSchema = base.partial().extend({
  detalles: z.array(detalleSchema).optional(),
})

export type ArticuloManufacturadoCreatePayload = z.infer<typeof articuloManufacturadoCreateSchema>
export type ArticuloManufacturadoUpdatePayload = z.infer<typeof articuloManufacturadoUpdateSchema>
