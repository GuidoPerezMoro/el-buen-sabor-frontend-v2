'use client'

import {useEffect, useMemo, useState} from 'react'
import {useRouter} from 'next/navigation'
import {useUser} from '@auth0/nextjs-auth0/client'
import Button from '@/components/ui/Button'
import StatusMessage from '@/components/ui/StatusMessage'
import type {Cliente} from '@/services/types/cliente'
import {fetchClienteByEmail} from '@/services/cliente'
import ClientePerfilForm from './ClientePerfilForm'

type LoadState = 'idle' | 'loading' | 'ready' | 'not-found' | 'error'

export default function ClientePerfilPage() {
  const router = useRouter()
  const {user, isLoading} = useUser()
  const [state, setState] = useState<LoadState>('idle')
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar cliente por email cuando tengamos user
  useEffect(() => {
    if (isLoading) return
    if (!user?.email) {
      setState('error')
      setError('No se encontró un email asociado al usuario autenticado.')
      return
    }

    let active = true
    setState('loading')
    setError(null)
    ;(async () => {
      try {
        const found = await fetchClienteByEmail(user.email!)
        if (!active) return
        if (found) {
          setCliente(found)
          setState('ready')
        } else {
          setCliente(null)
          setState('not-found')
        }
      } catch (err) {
        if (!active) return
        const message = err instanceof Error ? err.message : 'Error al cargar el perfil de cliente.'
        setError(message)
        setState('error')
      }
    })()

    return () => {
      active = false
    }
  }, [isLoading, user])

  const handleCreated = (nuevo: Cliente) => {
    setCliente(nuevo)
    setState('ready')
    setEditing(false)
  }

  const handleUpdated = (next: Cliente) => {
    setCliente(next)
    setEditing(false)
  }

  const avatarInitials = useMemo(() => {
    if (!cliente) return 'C'
    const first = (cliente.nombre || '').trim().charAt(0)
    const last = (cliente.apellido || '').trim().charAt(0)
    const base = `${first}${last}`.toUpperCase().replace(/[^A-Z]/g, '')
    if (base.length === 0 && cliente.email) return cliente.email.charAt(0).toUpperCase()
    return base || 'C'
  }, [cliente])

  return (
    <main className="min-h-screen bg-gradient-to-b from-muted/60 to-background flex justify-center p-4 sm:p-6">
      <section className="w-full max-w-3xl rounded-2xl border border-border/60 bg-background/80 shadow-lg backdrop-blur-md p-4 sm:p-6 md:p-8 space-y-4">
        <header className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text">
                Mi perfil
              </h1>
              <p className="text-sm text-muted">
                Gestiona tus datos de contacto y domicilios para tus pedidos.
              </p>
            </div>

            {/* CTA principal cuando ya hay perfil */}
            {!isLoading && user && state === 'ready' && cliente && !editing && (
              <div className="flex flex-wrap gap-2 justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditing(true)}
                  className="text-sm"
                >
                  Editar datos
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => router.push('/post-login')}
                  className="text-sm"
                >
                  Comenzar a comprar
                </Button>
              </div>
            )}
          </div>
        </header>

        {/* Estado: usuario no disponible */}
        {isLoading && (
          <StatusMessage type="loading" message="Cargando usuario..." className="mt-4" />
        )}
        {!isLoading && !user && (
          <div className="space-y-3 mt-4">
            <StatusMessage
              type="error"
              message="Necesitas iniciar sesión para ver tu perfil de cliente."
            />
            <a href="/auth/login?returnTo=/perfil">
              <Button variant="primary" className="w-full sm:w-auto">
                Iniciar sesión
              </Button>
            </a>
          </div>
        )}

        {/* Estado: error al cargar cliente */}
        {!isLoading && user && state === 'error' && (
          <StatusMessage type="error" message={error ?? 'No se pudo cargar tu perfil.'} />
        )}

        {/* Crear perfil si no existe */}
        {!isLoading && user && state === 'not-found' && (
          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted">
              Aún no tenemos tus datos como cliente. Completa tu perfil para continuar.
            </p>
            <ClientePerfilForm mode="create" authUserEmail={user.email} onCreated={handleCreated} />
          </div>
        )}

        {/* Perfil existente */}
        {!isLoading && user && state === 'ready' && cliente && !editing && (
          <div className="mt-4 space-y-6">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Datos personales</h2>

              <div className="flex items-center gap-4 mb-2">
                <div className="h-14 w-14 rounded-full overflow-hidden bg-muted flex items-center justify-center text-base font-semibold text-text">
                  {cliente.imagenUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cliente.imagenUrl}
                      alt="Foto de perfil"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{avatarInitials}</span>
                  )}
                </div>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-muted">Nombre</dt>
                  <dd className="font-medium">{cliente.nombre}</dd>
                </div>
                <div>
                  <dt className="text-muted">Apellido</dt>
                  <dd className="font-medium">{cliente.apellido}</dd>
                </div>
                <div>
                  <dt className="text-muted">Teléfono</dt>
                  <dd className="font-medium">{cliente.telefono || '-'}</dd>
                </div>
                <div>
                  <dt className="text-muted">Email</dt>
                  <dd className="font-medium">{cliente.email}</dd>
                </div>
                <div>
                  <dt className="text-muted">Fecha de nacimiento</dt>
                  <dd className="font-medium">
                    {cliente.fechaNacimiento ? cliente.fechaNacimiento : '-'}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Domicilios</h2>
              {cliente.domicilios.length === 0 && (
                <p className="text-sm text-muted">Todavía no hay domicilios registrados.</p>
              )}
              <ul className="space-y-3">
                {cliente.domicilios.map(dom => (
                  <li
                    key={dom.id}
                    className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm"
                  >
                    <p className="font-medium">
                      {dom.calle} {dom.numero} ({dom.cp})
                    </p>
                    {dom.localidad && (
                      <p className="text-muted mt-1">
                        {dom.localidad.nombre}, {dom.localidad.provincia.nombre},{' '}
                        {dom.localidad.provincia.pais.nombre}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Modo edición inline */}
        {!isLoading && user && state === 'ready' && cliente && editing && (
          <div className="mt-4 space-y-4">
            <ClientePerfilForm
              mode="edit"
              authUserEmail={user.email}
              initialCliente={cliente}
              onUpdated={handleUpdated}
            />
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                className="text-sm"
                onClick={() => setEditing(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
