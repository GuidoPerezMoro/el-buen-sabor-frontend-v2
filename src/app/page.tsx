'use client'

import Button from '@/components/ui/Button'
import {useRouter} from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  const handleStart = () => {
    router.push('/empresa')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold text-text">Bienvenido a El Buen Sabor</h1>
      <p className="text-lg text-muted">Empecemos tu experiencia gastronómica digital.</p>
      <Button onClick={handleStart} variant="primary">
        Empezar
      </Button>
    </main>
  )
}
