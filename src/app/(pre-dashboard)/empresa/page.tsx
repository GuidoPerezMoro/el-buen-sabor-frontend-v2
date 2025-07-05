'use client'

import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Dialog from '@/components/ui/Dialog'
import useDialog from '@/hooks/useDialog'

export default function EmpresaPage() {
  const {openDialog} = useDialog()

  const handleCreateEmpresa = () => {
    openDialog('nueva-empresa')
  }

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Empresas</h1>
        <Button onClick={handleCreateEmpresa} variant="primary">
          + Nueva empresa
        </Button>
      </div>

      {/* Dialog para nueva empresa */}
      <Dialog name="nueva-empresa" title="Crear nueva empresa" message="Aquí irá el formulario">
        <div className="mt-2 text-sm text-gray-600">
          Este es un placeholder. Acá va el formulario para crear una nueva empresa.
        </div>
      </Dialog>

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
