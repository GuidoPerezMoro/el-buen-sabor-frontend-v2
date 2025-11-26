'use client'

import {useMemo, useState} from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import ImageDropzone from '@/components/ui/ImageDropzone'
import DomicilioFields from '@/components/domain/domicilio/DomicilioFields'
import {clienteCreateSchema, type ClienteCreatePayload} from '@/schemas/clienteSchema'
import {createCliente, createClienteWithImage} from '@/services/cliente'
import type {Cliente} from '@/services/types/cliente'

type Mode = 'create'

interface Props {
  mode: Mode
  authUserEmail: string | null | undefined
  onCreated?: (cliente: Cliente) => void
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

export default function ClientePerfilForm({mode, authUserEmail, onCreated}: Props) {
  const isCreate = mode === 'create'

  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState(() => authUserEmail ?? '')
  const [fechaNacimiento, setFechaNacimiento] = useState('')

  const [domicilios, setDomicilios] = useState<DomicilioFormState[]>([makeEmptyDomicilio()])
  const [domicilioErrors, setDomicilioErrors] = useState<DomicilioFormErrors[]>([])

  const [imagen, setImagen] = useState<File | null>(null)

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const canAddMoreDomicilios = useMemo(() => domicilios.length < 5, [domicilios.length])

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
            // Ej: domicilios.0.calle
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
            previewUrl={null}
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
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAddDomicilio}
            disabled={!canAddMoreDomicilios}
          >
            Agregar domicilio
          </Button>
        </div>
        <p className="text-xs text-muted">
          Puedes registrar uno o varios domicilios. Al menos uno es obligatorio para crear tu
          perfil.
        </p>

        <div className="space-y-6">
          {domicilios.map((dom, index) => (
            <div
              key={index}
              className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium">Domicilio {index + 1}</h3>
                {domicilios.length > 1 && (
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
                  setDomicilios(prev => prev.map((d, i) => (i === index ? {...d, calle: v} : d)))
                }
                onChangeNumero={v =>
                  setDomicilios(prev => prev.map((d, i) => (i === index ? {...d, numero: v} : d)))
                }
                onChangeCp={v =>
                  setDomicilios(prev => prev.map((d, i) => (i === index ? {...d, cp: v} : d)))
                }
                onChangeLocalidadId={id =>
                  setDomicilios(prev =>
                    prev.map((d, i) => (i === index ? {...d, localidadId: id} : d))
                  )
                }
                errors={domicilioErrors[index]}
              />
            </div>
          ))}
        </div>
      </div>

      {formErrors.general && <p className="text-sm text-danger">{formErrors.general}</p>}

      <div className="flex justify-end gap-2 mt-2">
        <Button type="submit" variant="primary" loading={submitting}>
          {isCreate ? 'Guardar perfil' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  )
}
