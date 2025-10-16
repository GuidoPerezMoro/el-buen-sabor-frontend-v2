import {z} from 'zod'

export const categoriaCreateSchema = z.object({
  denominacion: z.string().min(1, 'La denominación es obligatoria'),
  esInsumo: z.boolean().default(false),
  idCategoriaPadre: z.number().int().positive().optional().nullable(),
  idSucursales: z.array(z.number().int().positive()).min(1, 'Selecciona al menos una sucursal'),
})

export type CategoriaCreatePayload = z.infer<typeof categoriaCreateSchema>
