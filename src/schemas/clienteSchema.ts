import {z} from 'zod'
import {domicilioSchema} from './domicilioSchema'

/**
 * Base fields for Cliente (shared between create/update in the future).
 */
export const clienteBaseSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  apellido: z.string().min(1, 'El apellido es obligatorio'),
  telefono: z.string().min(1, 'El teléfono es obligatorio').optional(),
  email: z.string().email('El email es inválido').optional(),
  fechaNacimiento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida')
    .optional(),
  /**
   * NOTA sobre `rol`:
   * - El backend solo setea `rol = "CLIENTE"` si lo mandamos explícitamente en el POST.
   * - Si omitimos el campo, persiste `null`.
   * - Para mitigar este bug de la API, forzamos siempre `rol: "CLIENTE"` desde el FE.
   */
  rol: z.literal('CLIENTE').default('CLIENTE'),
})

// - Requires at least one domicilio
export const clienteCreateSchema = clienteBaseSchema.extend({
  domicilios: z.array(domicilioSchema).min(1, 'Debe registrar al menos un domicilio'),
})

export type ClienteCreatePayload = z.infer<typeof clienteCreateSchema>
