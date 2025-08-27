import {z} from 'zod'

export const domicilioSchema = z.object({
  calle: z.string().min(1, 'La calle es obligatoria'),
  numero: z.number({invalid_type_error: 'El número debe ser un valor numérico'}),
  cp: z
    .number({invalid_type_error: 'El código postal debe ser un valor numérico'})
    .min(1, 'El código postal debe ser positivo'),
  idLocalidad: z.number({invalid_type_error: 'Debe seleccionar una localidad válida'}),
})

export type DomicilioPayload = z.infer<typeof domicilioSchema>
