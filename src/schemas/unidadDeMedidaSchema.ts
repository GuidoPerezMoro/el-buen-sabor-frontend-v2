import {z} from 'zod'

export const unidadDeMedidaSchema = z.object({
  denominacion: z.string().min(1, 'La denominación es obligatoria'),
})

export type UnidadDeMedidaInput = z.infer<typeof unidadDeMedidaSchema>
