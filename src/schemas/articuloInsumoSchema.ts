import {z} from 'zod'

const requiredId = (label: string) =>
  z.preprocess(
    v =>
      v === null || v === undefined || (typeof v === 'number' && !Number.isFinite(v))
        ? undefined
        : v,
    z
      .number({required_error: `${label} requerida`, invalid_type_error: `${label} requerida`})
      .int({message: `${label} inválida`})
      .positive({message: `${label} requerida`})
  )

const baseArticuloInsumoSchema = z.object({
  denominacion: z.string().min(1, 'La denominación es obligatoria'),
  precioVenta: z.number().nonnegative('Debe ser ≥ 0'),
  precioCompra: z.number().nonnegative('Debe ser ≥ 0'),
  stockActual: z.number().int().nonnegative('Debe ser ≥ 0'),
  stockMaximo: z.number().int().nonnegative('Debe ser ≥ 0'),
  stockMinimo: z.number().int().nonnegative('Debe ser ≥ 0'),
  esParaElaborar: z.boolean(),
  idSucursal: requiredId('Sucursal'),
  idUnidadDeMedida: requiredId('Unidad'),
  idCategoria: requiredId('Categoría'),
})

// 2) Create = base + refine
export const articuloInsumoCreateSchema = baseArticuloInsumoSchema.refine(
  (d: z.infer<typeof baseArticuloInsumoSchema>) => d.stockMinimo <= d.stockMaximo,
  {message: 'El mínimo no puede superar el máximo', path: ['stockMinimo']}
)

// 3) Update = PARTIAL(base) + refine (only when both provided)
const partialBase = baseArticuloInsumoSchema.partial()
export const articuloInsumoUpdateSchema = partialBase
  .extend({
    idUnidadDeMedida: requiredId('Unidad'),
    idCategoria: requiredId('Categoría'),
  })
  .refine(
    (d: z.infer<typeof partialBase>) => {
      if (d.stockMinimo == null || d.stockMaximo == null) return true
      return d.stockMinimo <= d.stockMaximo
    },
    {message: 'El mínimo no puede superar el máximo', path: ['stockMinimo']}
  )

export type ArticuloInsumoCreatePayload = z.infer<typeof articuloInsumoCreateSchema>
export type ArticuloInsumoUpdatePayload = z.infer<typeof articuloInsumoUpdateSchema>
