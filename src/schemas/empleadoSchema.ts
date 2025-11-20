import {z} from 'zod'

/**
 * Base schema for Empleado fields that appear in CREATE/UPDATE.
 * Note: We intentionally keep `rol` as string (not enum) to avoid brittle coupling
 * with backend role values (samples show "ADMIN", "COCINERO"). UI will restrict choices.
 */
export const empleadoBaseSchema = z.object({
  nombre: z.string().min(1, 'Ingrese el nombre'),
  apellido: z.string().min(1, 'Ingrese el apellido'),
  telefono: z.string().min(1, 'El teléfono es obligatorio').optional(),
  email: z.string().email('El email es inválido').optional(),
  // Accept "YYYY-MM-DD" as provided by BE; map to Date only at the edges if needed
  fechaNacimiento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida')
    .optional(),
  rol: z.string().min(1, 'Seleccione un rol'),
})

/**
 * CREATE payload: includes idSucursal (hidden in UI per requirements).
 */
export const empleadoCreateSchema = empleadoBaseSchema.extend({
  idSucursal: z.number({
    invalid_type_error: 'El ID de sucursal debe ser un número',
  }),
})
export type EmpleadoCreatePayload = z.infer<typeof empleadoCreateSchema>

/**
 * UPDATE payload: BE sample expects same shape (including rol and idSucursal).
 * Even though we won't allow changing `rol` in the UI (first milestone),
 * we will still send the current value back to satisfy the API contract.
 */
export const empleadoUpdateSchema = empleadoBaseSchema.extend({
  idSucursal: z.number({
    invalid_type_error: 'El ID de sucursal debe ser un número',
  }),
})
export type EmpleadoUpdatePayload = z.infer<typeof empleadoUpdateSchema>
