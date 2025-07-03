'use client'

import Button from '@/components/ui/Button'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold text-text">Bienvenido a El Buen Sabor</h1>
      <p className="text-lg text-muted">Empecemos tu experiencia gastronómica digital.</p>
      <Button onClick={() => alert('¡Bienvenido!')} variant="primary">
        Empezar
      </Button>
    </main>
  )
}
