// src/app/403/page.tsx  (SERVER)
import Link from 'next/link'
import ForbiddenActions from './ForbiddenActions'
import Button from '@/components/ui/Button'

export const metadata = {title: '403 – Acceso denegado'}

export default function ForbiddenPage() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold mb-2">Acceso denegado</h1>
        <p className="text-muted mb-6">
          No tenés permisos para ver esta sección. Si creés que es un error, contactá a un
          administrador.
        </p>

        <div className="flex items-center justify-center gap-2">
          <Link href="/">
            <Button variant="secondary">Ir al inicio</Button>
          </Link>
          <ForbiddenActions /> {/* primary: volver (router.back) */}
        </div>
      </div>
    </main>
  )
}
