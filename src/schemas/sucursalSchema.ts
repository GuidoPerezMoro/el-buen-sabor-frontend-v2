import {z} from 'zod'
import {domicilioSchema} from './domicilioSchema'

export const sucursalSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  horarioApertura: z.string().min(1, 'El horario de apertura es obligatorio'),
  horarioCierre: z.string().min(1, 'El horario de cierre es obligatorio'),
  esCasaMatriz: z.boolean(),
  domicilio: domicilioSchema,
  idEmpresa: z.number({invalid_type_error: 'El ID de empresa debe ser un número'}),
})

export type SucursalPayload = z.infer<typeof sucursalSchema>
