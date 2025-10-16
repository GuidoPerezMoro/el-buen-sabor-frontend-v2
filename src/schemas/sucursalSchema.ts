import {z} from 'zod'
import {domicilioSchema, domicilioUpdateSchema} from './domicilioSchema'

export const sucursalSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  horarioApertura: z.string().min(1, 'El horario de apertura es obligatorio'),
  horarioCierre: z.string().min(1, 'El horario de cierre es obligatorio'),
  esCasaMatriz: z.boolean(),
  domicilio: domicilioSchema,
  idEmpresa: z.number({invalid_type_error: 'El ID de empresa debe ser un número'}),
})

export type SucursalPayload = z.infer<typeof sucursalSchema>

// Create payload (idLocalidad requerido)
export type SucursalCreatePayload = z.infer<typeof sucursalSchema>

// EDIT schema: same as create but domicilio.idLocalidad is optional
export const sucursalUpdateSchema = sucursalSchema.extend({
  domicilio: domicilioUpdateSchema,
})

export type SucursalUpdatePayload = z.infer<typeof sucursalUpdateSchema>
