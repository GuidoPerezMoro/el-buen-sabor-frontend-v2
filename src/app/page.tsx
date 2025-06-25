'use client'

import Button from '@/components/ui/Button'
import DangerIcon from '@/components/icons/exclamation-triangle.svg'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold text-text">Bienvenido a El Buen Sabor</h1>
      <p className="text-lg text-muted">Empecemos tu experiencia gastronómica digital.</p>
      <Button onClick={() => alert('¡Bienvenido!')} variant="primary">
        Empezar
      </Button>
      <Button onClick={() => console.log('Clicked!')}>Primary (default)</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger" icon={<DangerIcon className="w-4 h-4" />}>
        Danger
      </Button>
      <Button variant="danger" size="sm" loading>
        Delete
      </Button>
    </main>
  )
}
