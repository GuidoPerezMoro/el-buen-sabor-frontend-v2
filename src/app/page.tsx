'use client'

import Button from '@/components/ui/Button'
import {useRouter} from 'next/navigation'
import {useUser} from '@auth0/nextjs-auth0/client'

export default function HomePage() {
  const router = useRouter()
  const {user, isLoading} = useUser()

  // TODO: Improve logic based on roles
  const handleStart = () => {
    router.push('/post-login')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold text-text">Bienvenido a El Buen Sabor</h1>
      <p className="text-lg text-muted">Empecemos tu experiencia gastronómica digital.</p>

      {isLoading ? null : user ? (
        <>
          <p className="text-sm text-muted">
            Sesión como <span className="font-semibold">{user.name || user.email}</span>
          </p>
          <div className="flex gap-3">
            <a href="/auth/logout">
              <Button variant="secondary">Cerrar sesión</Button>
            </a>
            <Button onClick={handleStart} variant="primary">
              Continuar
            </Button>
          </div>
        </>
      ) : (
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => router.push('/empresa')}>
            Explorar como invitado
          </Button>
          <a href="/auth/login?returnTo=/post-login">
            <Button variant="primary">Iniciar sesión</Button>
          </a>
        </div>
      )}
    </main>
  )
}
