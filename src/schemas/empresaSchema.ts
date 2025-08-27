import {z} from 'zod'

export const empresaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  razonSocial: z.string().min(1, 'La razón social es obligatoria'),
  cuil: z
    .string()
    .min(1, 'El CUIL es obligatorio')
    .regex(/^\d+$/, 'El CUIL debe contener solo números')
    .transform(val => parseInt(val)),
})

export type EmpresaPayload = z.infer<typeof empresaSchema>
