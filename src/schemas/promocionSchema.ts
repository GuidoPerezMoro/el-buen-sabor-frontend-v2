import {z} from 'zod'
import {TipoPromocion} from '@/services/types/promocion'

// Accept HH:mm or HH:mm:ss; normalize to HH:mm:ss
const HHMM = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/
const timeField = z
  .string()
  .refine(v => HHMM.test(v.trim()), 'Hora inválida')
  .transform(v => {
    const s = v.trim()
    return s.length === 5 ? `${s}:00` : s // add seconds if missing
  })

const timeRe = /^\d{2}:\d{2}$/ // UI uses HH:mm
const dateRe = /^\d{4}-\d{2}-\d{2}$/ // YYYY-MM-DD

const detalleSchema = z.object({
  cantidad: z.number().int().positive('Cantidad requerida'),
  idArticulo: z.number().int().positive('Artículo requerido'),
})

const basePromocionSchema = z.object({
  denominacion: z.string().min(1, 'La denominación es obligatoria'),
  fechaDesde: z.string().regex(dateRe, 'Fecha inválida'),
  fechaHasta: z.string().regex(dateRe, 'Fecha inválida'),
  horaDesde: timeField,
  horaHasta: timeField,
  descripcionDescuento: z.string().optional().nullable(),
  precioPromocional: z.number().nonnegative('Debe ser ≥ 0').optional().nullable(),
  tipoPromocion: z.nativeEnum(TipoPromocion, {errorMap: () => ({message: 'Tipo requerido'})}),
  idSucursales: z.array(z.number().int().positive()).min(1, 'Selecciona al menos una sucursal'),
  detalles: z.array(detalleSchema).min(1, 'Agrega al menos 1 artículo'),
})

const toMinutes = (t: string) => {
  const [H, M] = t.split(':').map(n => parseInt(n, 10))
  return H * 60 + M
}

export const promocionCreateSchema = basePromocionSchema.superRefine((d, ctx) => {
  // 1) Precio requerido solo para tipo PROMOCION
  if (d.tipoPromocion === TipoPromocion.PROMOCION && typeof d.precioPromocional !== 'number') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['precioPromocional'],
      message: 'Precio promocional requerido para este tipo',
    })
  }

  // 2) Sin artículos duplicados (idArticulo repetido)
  if (Array.isArray(d.detalles)) {
    const seen = new Set<number>()
    for (const det of d.detalles) {
      if (seen.has(det.idArticulo)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['detalles'],
          message: 'Cada artículo solo puede aparecer una vez en la promoción',
        })
        break
      }
      seen.add(det.idArticulo)
    }
  }

  // 3) En 2×1 cada artículo debe tener cantidad = 2
  if (d.tipoPromocion === TipoPromocion.DOSXUNO && Array.isArray(d.detalles)) {
    if (d.detalles.some(det => det.cantidad !== 2)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['detalles'],
        message: 'En 2×1 cada artículo debe tener cantidad 2',
      })
    }
  }

  // 4) Rango fecha/hora válido
  const fd = new Date(d.fechaDesde)
  const fh = new Date(d.fechaHasta)
  if (fd > fh) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['fechaHasta'],
      message: 'La fecha “hasta” no puede ser menor a “desde”',
    })
  } else if (fd.toISOString().slice(0, 10) === fh.toISOString().slice(0, 10)) {
    if (toMinutes(d.horaDesde) > toMinutes(d.horaHasta)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['horaHasta'],
        message: 'La hora “hasta” no puede ser menor a “desde”',
      })
    }
  }
})

const partialBase = basePromocionSchema.partial()

export const promocionUpdateSchema = partialBase.superRefine((d, ctx) => {
  // 1) Precio requerido solo si el tipo enviado es PROMOCION
  if (d.tipoPromocion === TipoPromocion.PROMOCION && d.precioPromocional == null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['precioPromocional'],
      message: 'Precio promocional requerido para este tipo',
    })
  }

  // 2) Sin artículos duplicados cuando se envía `detalles`
  if (Array.isArray(d.detalles)) {
    const seen = new Set<number>()
    for (const det of d.detalles) {
      if (seen.has(det.idArticulo)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['detalles'],
          message: 'Cada artículo solo puede aparecer una vez en la promoción',
        })
        break
      }
      seen.add(det.idArticulo)
    }
  }

  // 3) En 2×1, si se envían detalles, cada artículo debe tener cantidad = 2
  if (d.tipoPromocion === TipoPromocion.DOSXUNO && Array.isArray(d.detalles)) {
    if (d.detalles.some(det => det.cantidad !== 2)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['detalles'],
        message: 'En 2×1 cada artículo debe tener cantidad 2',
      })
    }
  }

  // 4) Rango de fecha/hora solo si se envían ambos extremos
  if (!d.fechaDesde || !d.fechaHasta || !d.horaDesde || !d.horaHasta) return
  const fd = new Date(d.fechaDesde)
  const fh = new Date(d.fechaHasta)
  if (fd > fh) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['horaHasta'],
      message: 'Rango de fecha/hora inválido',
    })
  } else if (fd.toISOString().slice(0, 10) === fh.toISOString().slice(0, 10)) {
    if (toMinutes(d.horaDesde) > toMinutes(d.horaHasta)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['horaHasta'],
        message: 'Rango de fecha/hora inválido',
      })
    }
  }
})

export type PromocionCreateInput = z.infer<typeof promocionCreateSchema>
export type PromocionUpdateInput = z.infer<typeof promocionUpdateSchema>
