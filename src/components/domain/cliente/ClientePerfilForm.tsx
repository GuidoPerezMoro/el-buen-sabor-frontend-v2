'use client'

import {useEffect, useMemo, useState} from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import ImageDropzone from '@/components/ui/ImageDropzone'
import DomicilioFields from '@/components/domain/domicilio/DomicilioFields'
import {
  clienteCreateSchema,
  clienteUpdateSchema,
  type ClienteCreatePayload,
  type ClienteUpdatePayload,
} from '@/schemas/clienteSchema'
import {
  createCliente,
  createClienteWithImage,
  updateCliente,
  updateClienteWithImage,
} from '@/services/cliente'
import type {Cliente} from '@/services/types/cliente'

type Mode = 'create' | 'edit'

interface Props {
  mode: Mode
  authUserEmail: string | null | undefined
  initialCliente?: Cliente | null
  onCreated?: (cliente: Cliente) => void
  onUpdated?: (cliente: Cliente) => void
  onCancel?: () => void
}

interface DomicilioFormState {
  calle: string
  numero: number | ''
  cp: number | ''
  localidadId: number | null
}

interface DomicilioFormErrors {
  calle?: string
  numero?: string
  cp?: string
  idLocalidad?: string
}

function makeEmptyDomicilio(): DomicilioFormState {
  return {
    calle: '',
    numero: '',
    cp: '',
    localidadId: null,
  }
}

export default function ClientePerfilForm({
  mode,
  authUserEmail,
  initialCliente,
  onCreated,
  onUpdated,
  onCancel,
}: Props) {
  const isCreate = mode === 'create'

  const [nombre, setNombre] = useState(initialCliente?.nombre ?? '')
  const [apellido, setApellido] = useState(initialCliente?.apellido ?? '')
  const [telefono, setTelefono] = useState(initialCliente?.telefono ?? '')
  const [email, setEmail] = useState(() => initialCliente?.email ?? authUserEmail ?? '')
  const [fechaNacimiento, setFechaNacimiento] = useState(initialCliente?.fechaNacimiento ?? '')
  const [imagen, setImagen] = useState<File | null>(null)

  const [domicilios, setDomicilios] = useState<DomicilioFormState[]>(() => {
    if (initialCliente && !isCreate) {
      return initialCliente.domicilios.map(d => ({
        calle: d.calle,
        numero: d.numero,
        cp: d.cp,
        localidadId: d.localidad?.id ?? (d as any).idLocalidad ?? null,
      }))
    }
    return [makeEmptyDomicilio()]
  })
  const [domicilioErrors, setDomicilioErrors] = useState<DomicilioFormErrors[]>([])

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const canAddMoreDomicilios = useMemo(() => domicilios.length < 5, [domicilios.length])

  // Si cambian los datos iniciales (p.ej. después de refetch), sincronizar el form en modo edit.
  useEffect(() => {
    if (!initialCliente || isCreate) return
    setNombre(initialCliente.nombre ?? '')
    setApellido(initialCliente.apellido ?? '')
    setTelefono(initialCliente.telefono ?? '')
    setEmail(initialCliente.email ?? authUserEmail ?? '')
    setFechaNacimiento(initialCliente.fechaNacimiento ?? '')
  }, [initialCliente, authUserEmail, isCreate])

  const handleAddDomicilio = () => {
    setDomicilios(prev => [...prev, makeEmptyDomicilio()])
    setDomicilioErrors(prev => [...prev, {}])
  }

  const handleRemoveDomicilio = (index: number) => {
    if (domicilios.length <= 1) return // siempre al menos uno
    setDomicilios(prev => prev.filter((_, i) => i !== index))
    setDomicilioErrors(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors({})
    setDomicilioErrors([])
    setSubmitting(true)

    try {
      const trimmedEmail = email.trim()
      const trimmedTel = telefono.trim()
      const trimmedFnac = fechaNacimiento.trim()

      if (isCreate) {
        // ── CREATE ─────────────────────────────────────────────────────────────
        const domicilioPayloads = domicilios.map(d => ({
          calle: d.calle.trim(),
          numero: Number(d.numero),
          cp: Number(d.cp),
          idLocalidad: d.localidadId != null ? d.localidadId : (null as any),
        }))

        const raw: ClienteCreatePayload = {
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          ...(trimmedTel && {telefono: trimmedTel}),
          ...(trimmedEmail && {email: trimmedEmail}),
          ...(trimmedFnac && {fechaNacimiento: trimmedFnac}),
          // rol se fuerza a "CLIENTE" en el schema (sino el backend lo deja null)
          rol: 'CLIENTE',
          domicilios: domicilioPayloads as any,
        }

        const result = clienteCreateSchema.safeParse(raw)
        if (!result.success) {
          const errs: Record<string, string> = {}
          const domErrs: DomicilioFormErrors[] = Array(domicilios.length)
            .fill(0)
            .map(() => ({}))

          result.error.errors.forEach(e => {
            const path = e.path.join('.')
            if (path.startsWith('domicilios.')) {
              const parts = path.split('.')
              const index = Number(parts[1] ?? '-1')
              const field = parts[2] as keyof DomicilioFormErrors | undefined
              if (!Number.isNaN(index) && index >= 0 && index < domErrs.length && field) {
                domErrs[index][field] = e.message
              }
            } else {
              errs[path] = e.message
            }
          })

          setFormErrors(errs)
          setDomicilioErrors(domErrs)
          setSubmitting(false)
          return
        }

        const payload = result.data

        const created = await (imagen
          ? createClienteWithImage(payload, imagen)
          : createCliente(payload))

        onCreated?.(created)
        return
      }

      // ── EDIT ────────────────────────────────────────────────────────────────
      if (!initialCliente) {
        throw new Error('No se encontró el cliente a editar.')
      }

      const rawUpdate: ClienteUpdatePayload = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        // backend bug: reforzamos rol CLIENTE también en update por consistencia
        rol: 'CLIENTE',
        ...(trimmedTel && {telefono: trimmedTel}),
        ...(trimmedEmail && {email: trimmedEmail}),
        ...(trimmedFnac && {fechaNacimiento: trimmedFnac}),
      }

      const parsed = clienteUpdateSchema.safeParse(rawUpdate)
      if (!parsed.success) {
        const errs: Record<string, string> = {}
        parsed.error.errors.forEach(e => {
          const path = e.path.join('.')
          errs[path] = e.message
        })
        setFormErrors(errs)
        setSubmitting(false)
        return
      }

      const updated = await (imagen
        ? updateClienteWithImage(initialCliente.id, parsed.data, imagen)
        : updateCliente(initialCliente.id, parsed.data))

      onUpdated?.(updated)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar el perfil de cliente.'
      setFormErrors({general: message})
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="flex flex-col gap-6 mt-2" onSubmit={handleSubmit}>
      {/* Header: imagen + datos personales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <ImageDropzone
            label="Foto de perfil (opcional)"
            hint="Recomendado JPG/PNG/WebP."
            onFileAccepted={setImagen}
            previewUrl={initialCliente?.imagenUrl ?? null}
            className="max-w-xs md:max-w-none aspect-square max-h-60 mx-auto"
          />
        </div>

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
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            error={formErrors.email}
            disabled
          />
          <Input
            label="Fecha de nacimiento"
            type="date"
            value={fechaNacimiento}
            onChange={e => setFechaNacimiento(e.target.value)}
            error={formErrors.fechaNacimiento}
          />
        </div>
      </div>

      {/* Domicilios */}
      <div className="space-y-3 mt-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Domicilios</h2>
          {isCreate && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddDomicilio}
              disabled={!canAddMoreDomicilios}
            >
              Agregar domicilio
            </Button>
          )}
        </div>

        {isCreate && (
          <p className="text-xs text-muted">
            Puedes registrar uno o varios domicilios. Al menos uno es obligatorio para crear tu
            perfil.
          </p>
        )}

        <div className="space-y-6">
          {domicilios.map((dom, index) => (
            <div
              key={index}
              className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium">Domicilio {index + 1}</h3>
                {isCreate && domicilios.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-danger"
                    onClick={() => handleRemoveDomicilio(index)}
                  >
                    Quitar
                  </Button>
                )}
              </div>

              <DomicilioFields
                calle={dom.calle}
                numero={dom.numero}
                cp={dom.cp}
                localidadId={dom.localidadId}
                onChangeCalle={v =>
                  isCreate
                    ? setDomicilios(prev =>
                        prev.map((d, i) => (i === index ? {...d, calle: v} : d))
                      )
                    : prev => prev
                }
                onChangeNumero={v =>
                  isCreate
                    ? setDomicilios(prev =>
                        prev.map((d, i) => (i === index ? {...d, numero: v} : d))
                      )
                    : prev => prev
                }
                onChangeCp={v =>
                  isCreate
                    ? setDomicilios(prev => prev.map((d, i) => (i === index ? {...d, cp: v} : d)))
                    : prev => prev
                }
                onChangeLocalidadId={id =>
                  isCreate
                    ? setDomicilios(prev =>
                        prev.map((d, i) => (i === index ? {...d, localidadId: id} : d))
                      )
                    : prev => prev
                }
                disableLocalidad={!isCreate}
                errors={isCreate ? domicilioErrors[index] : undefined}
              />
            </div>
          ))}
        </div>
      </div>

      {formErrors.general && <p className="text-sm text-danger">{formErrors.general}</p>}

      <div className="flex justify-end gap-2 mt-2">
        {onCancel && (
          <Button type="button" variant="secondary" disabled={submitting} onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" variant="primary" loading={submitting}>
          {isCreate ? 'Guardar perfil' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  )
}
