'use client'

import Button from '@/components/ui/Button'
import {useRouter} from 'next/navigation'
import {useUser} from '@auth0/nextjs-auth0/client'

export default function HomePage() {
  const router = useRouter()
  const {user, isLoading} = useUser()

  const handleStart = () => {
    router.push('/post-login')
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-muted/60 to-background flex items-center justify-center p-6">
      <section className="w-full max-w-xl rounded-2xl border border-border/60 bg-background/80 shadow-lg backdrop-blur-md p-6 sm:p-8 text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text">
          Bienvenido a El Buen Sabor
        </h1>
        <p className="text-sm sm:text-base text-muted">
          Empecemos tu experiencia gastronómica digital.
        </p>

        {isLoading ? null : user ? (
          <>
            <p className="text-sm text-muted">
              Sesión como <span className="font-semibold">{user.name || user.email}</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <a href="/auth/logout" className="contents">
                <Button variant="ghost" className="w-full">
                  Cerrar sesión
                </Button>
              </a>
              <Button onClick={handleStart} variant="primary" className="w-full">
                Continuar
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-3 pt-2">
            {/* Primary action: Iniciar sesión */}
            <a href="/auth/login?returnTo=/post-login" className="block">
              <Button variant="primary" className="w-full">
                Iniciar sesión
              </Button>
            </a>
            {/* Secondary: Crear cuenta */}
            <a href="/signup" className="block">
              <Button variant="secondary" className="w-full">
                Crear cuenta
              </Button>
            </a>
            {/* Tertiary: Explorar como invitado */}
            <Button variant="ghost" className="w-full" onClick={() => router.push('/empresa')}>
              Explorar como invitado
            </Button>
            <p className="text-[11px] text-muted">
              Al continuar, aceptas nuestros términos y políticas de uso.
            </p>
          </div>
        )}
      </section>
    </main>
  )
}
