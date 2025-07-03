'use client'

import Button from '@/components/ui/Button'
import DangerIcon from '@/assets/icons/exclamation-triangle.svg'

export default function ButtonsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold text-text">Test Buttons</h1>
      <Button onClick={() => alert('¡Bienvenido!')} variant="primary">
        Primary (Alerta)
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
