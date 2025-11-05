'use client'

import {useEffect, useMemo, useState} from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import ImageDropzone from '@/components/ui/ImageDropzone'
import MultiSelectCheckbox from '@/components/ui/MultiSelectCheckbox'
import useDialog from '@/hooks/useDialog'
import type {Empleado} from '@/services/types/empleado'
import {
  empleadoCreateSchema,
  empleadoUpdateSchema,
  type EmpleadoCreatePayload,
  type EmpleadoUpdatePayload,
} from '@/schemas/empleadoSchema'
import {
  createEmpleado,
  createEmpleadoWithImage,
  updateEmpleado,
  updateEmpleadoWithImage,
} from '@/services/empleado'

interface Props {
  sucursalId: number
  initialData?: Empleado
  onSuccess?: () => void
  dialogName?: string
}

/** Roles disponibles para crear empleados (excluimos SUPERADMIN en UI). */
const UI_ROLES = ['ADMIN', 'GERENTE', 'COCINERO'] as const
const roleOptions = UI_ROLES.map((r, i) => ({label: r, value: i + 1}))
const valueToRole = (v: number | undefined): string | null => {
  if (!v || v < 1 || v > UI_ROLES.length) return null
  return UI_ROLES[v - 1]
}
const roleToValue = (r: string | null | undefined): number | null => {
  if (!r) return null
  const idx = UI_ROLES.indexOf(r as (typeof UI_ROLES)[number])
  return idx >= 0 ? idx + 1 : null
}

export default function EmpleadoForm({sucursalId, initialData, onSuccess, dialogName}: Props) {
  const isEdit = !!initialData
  const {closeDialog} = useDialog()

  const [nombre, setNombre] = useState(initialData?.nombre ?? '')
  const [apellido, setApellido] = useState(initialData?.apellido ?? '')
  const [telefono, setTelefono] = useState(initialData?.telefono ?? '')
  const [email, setEmail] = useState(initialData?.email ?? '')
  const [fechaNacimiento, setFechaNacimiento] = useState(initialData?.fechaNacimiento ?? '')
  const [roleVal, setRoleVal] = useState<number[]>(
    isEdit ? (roleToValue(initialData?.rol) ? [roleToValue(initialData?.rol)!] : []) : []
  )
  const [imagen, setImagen] = useState<File | null>(null)

  // reset when initialData changes
  useEffect(() => {
    if (!isEdit) return
    setNombre(initialData?.nombre ?? '')
    setApellido(initialData?.apellido ?? '')
    setTelefono(initialData?.telefono ?? '')
    setEmail(initialData?.email ?? '')
    setFechaNacimiento(initialData?.fechaNacimiento ?? '')
    setRoleVal(roleToValue(initialData?.rol) ? [roleToValue(initialData?.rol)!] : [])
    setImagen(null)
  }, [isEdit, initialData])

  const selectedRole = useMemo(() => (roleVal.length ? valueToRole(roleVal[0]) : null), [roleVal])

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setFormErrors({})
    setLoading(true)

    try {
      if (isEdit && initialData) {
        const _tel = telefono.trim()
        const _email = email.trim()
        const _fnac = fechaNacimiento.trim()
        const raw: EmpleadoUpdatePayload = {
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          ...(!!_tel && {telefono: _tel}),
          ...(!!_email && {email: _email}),
          ...(!!_fnac && {fechaNacimiento: _fnac}),
          // UI: rol no cambia, pero BE lo pide → reenviar el actual
          rol: initialData.rol,
          idSucursal: initialData.sucursal.id,
        }
        const parsed = empleadoUpdateSchema.safeParse(raw)
        if (!parsed.success) {
          const errs: Record<string, string> = {}
          parsed.error.errors.forEach(e => (errs[e.path.join('.')] = e.message))
          setFormErrors(errs)
          setLoading(false)
          return
        }
        if (imagen) {
          await updateEmpleadoWithImage(initialData.id, parsed.data, imagen)
        } else {
          await updateEmpleado(initialData.id, parsed.data)
        }
      } else {
        const rol = selectedRole
        const _tel = telefono.trim()
        const _email = email.trim()
        const _fnac = fechaNacimiento.trim()
        const raw: EmpleadoCreatePayload = {
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          ...(!!_tel && {telefono: _tel}),
          ...(!!_email && {email: _email}),
          ...(!!_fnac && {fechaNacimiento: _fnac}),
          rol: rol ?? '',
          idSucursal: sucursalId,
        }
        const parsed = empleadoCreateSchema.safeParse(raw)
        if (!parsed.success) {
          const errs: Record<string, string> = {}
          parsed.error.errors.forEach(e => (errs[e.path.join('.')] = e.message))
          setFormErrors(errs)
          setLoading(false)
          return
        }
        if (imagen) {
          await createEmpleadoWithImage(parsed.data, imagen)
        } else {
          await createEmpleado(parsed.data)
        }
        // reset for next create
        setNombre('')
        setApellido('')
        setTelefono('')
        setEmail('')
        setFechaNacimiento('')
        setRoleVal([])
        setImagen(null)
      }

      onSuccess?.()
      if (dialogName) closeDialog(dialogName)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar el empleado'
      setFormErrors({general: message})
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      {/* Header: photo (1/3) + fields (2/3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Col 1: compact photo area */}
        <div className="md:col-span-1">
          <ImageDropzone
            label="Foto de perfil"
            hint="Recomendado SVG/JPG/PNG/WebP."
            onFileAccepted={setImagen}
            previewUrl={initialData?.imagenUrl ?? null}
            // keep it visually contained
            className="max-w-xs md:max-w-none aspect-square max-h-60 mx-auto"
          />
        </div>

        {/* Col 2–3: employee fields */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            error={formErrors.nombre}
          />
          <Input
            label="Apellido"
            value={apellido}
            onChange={e => setApellido(e.target.value)}
            error={formErrors.apellido}
          />
          <Input
            label="Teléfono"
            value={telefono}
            onChange={e => setTelefono(e.target.value)}
            error={formErrors.telefono}
          />
          <Input
            label="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            error={formErrors.email}
          />
          <Input
            label="Fecha de nacimiento"
            type="date"
            value={fechaNacimiento}
            onChange={e => setFechaNacimiento(e.target.value)}
            error={formErrors.fechaNacimiento}
          />

          {/* Rol (full width) */}
          <div className="md:col-span-2">
            <MultiSelectCheckbox
              label="Rol"
              options={roleOptions}
              value={roleVal}
              onChange={next => setRoleVal(next.length > 1 ? [next[next.length - 1]] : next)}
              disabled={isEdit}
              error={formErrors.rol}
            />
          </div>
        </div>
      </div>

      {formErrors.general && <p className="text-sm text-danger">{formErrors.general}</p>}

      <div className="flex justify-end gap-2">
        <Button type="submit" variant="primary" loading={loading}>
          {isEdit ? 'Guardar cambios' : 'Crear empleado'}
        </Button>
      </div>
    </form>
  )
}
