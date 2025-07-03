'use client'

import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function EmpresaPage() {
  const handleCreateEmpresa = () => {
    console.log('Crear nueva empresa')
    // Aquí podrías redirigir a un formulario: router.push('/empresa/nueva')
  }

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Empresas</h1>
        <Button onClick={handleCreateEmpresa} variant="primary">
          + Nueva empresa
        </Button>
      </div>

      {/* Empresas */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {/* Repetir Card para cada empresa */}
        {[...Array(6)].map((_, i) => (
          <Card
            key={i}
            title={`Empresa ${i + 1}`}
            line1="CUIT: 30-12345678-9"
            line2="Mendoza, Argentina"
            onPrimaryClick={() => console.log('Seleccionar')}
            onSecondaryClick={() => console.log('Editar')}
          />
        ))}
      </div>
    </main>
  )
}
