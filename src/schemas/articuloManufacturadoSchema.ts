import {z} from 'zod'

// Normalize missing/NaN numbers to undefined so we can show nice "requerida" messages
const requiredId = (label: string) =>
  z.preprocess(
    v => (v == null || (typeof v === 'number' && !Number.isFinite(v)) ? undefined : v),
    z
      .number({required_error: `${label} requerida`, invalid_type_error: `${label} requerida`})
      .int({message: `${label} inválida`})
      .positive({message: `${label} requerida`})
  )

const detalleSchema = z.object({
  cantidad: z.number().positive('Cantidad > 0'),
  idArticuloInsumo: z.number().int().positive('Insumo requerido'),
})

const base = z.object({
  denominacion: z.string().min(1, 'Ingrese el nombre del producto'),
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
    idUnidadDeMedida: requiredId('Unidad'),
    idCategoria: requiredId('Categoría'),
    detalles: z.array(detalleSchema).min(1, 'Agrega al menos un insumo'),
  })
  .refine(d => d.detalles.length > 0, {
    message: 'Agrega al menos un insumo',
    path: ['detalles'],
  })

export const articuloManufacturadoUpdateSchema = base.partial().extend({
  // En UPDATE permitimos omitir categoría; el backend conserva la existente.
  idCategoria: z.number().int().positive('Categoría requerida').optional(),
  detalles: z.array(detalleSchema).optional(),
})

export type ArticuloManufacturadoCreatePayload = z.infer<typeof articuloManufacturadoCreateSchema>
export type ArticuloManufacturadoUpdatePayload = z.infer<typeof articuloManufacturadoUpdateSchema>
