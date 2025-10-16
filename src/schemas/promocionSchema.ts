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
  precioPromocional: z.number().nonnegative('Debe ser ≥ 0'),
  tipoPromocion: z.nativeEnum(TipoPromocion, {errorMap: () => ({message: 'Tipo requerido'})}),
  idSucursales: z.array(z.number().int().positive()).min(1, 'Selecciona al menos una sucursal'),
  detalles: z.array(detalleSchema).min(1, 'Agrega al menos 1 artículo'),
})

const toMinutes = (t: string) => {
  const [H, M] = t.split(':').map(n => parseInt(n, 10))
  return H * 60 + M
}

export const promocionCreateSchema = basePromocionSchema.refine(
  d => {
    const fd = new Date(d.fechaDesde)
    const fh = new Date(d.fechaHasta)
    if (fd > fh) return false
    if (fd.toISOString().slice(0, 10) === fh.toISOString().slice(0, 10)) {
      return toMinutes(d.horaDesde) <= toMinutes(d.horaHasta)
    }
    return true
  },
  {message: 'La fecha “hasta” no puede ser menor a “desde”', path: ['fechaHasta']}
)

const partialBase = basePromocionSchema.partial()

export const promocionUpdateSchema = partialBase.refine(
  d => {
    if (!d.fechaDesde || !d.fechaHasta || !d.horaDesde || !d.horaHasta) return true
    const fd = new Date(d.fechaDesde)
    const fh = new Date(d.fechaHasta)
    if (fd > fh) return false
    if (fd.toISOString().slice(0, 10) === fh.toISOString().slice(0, 10)) {
      return toMinutes(d.horaDesde) <= toMinutes(d.horaHasta)
    }
    return true
  },
  {message: 'Rango de fecha/hora inválido', path: ['horaHasta']}
)

export type PromocionCreateInput = z.infer<typeof promocionCreateSchema>
export type PromocionUpdateInput = z.infer<typeof promocionUpdateSchema>
