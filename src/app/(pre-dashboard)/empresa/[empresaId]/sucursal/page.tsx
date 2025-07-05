'use client'

import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Dialog from '@/components/ui/Dialog'
import useDialog from '@/hooks/useDialog'

export default function SucursalPage() {
  const {openDialog} = useDialog()

  const handleCreateSucursal = () => {
    openDialog('nueva-sucursal')
  }

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Sucursales</h1>
        <Button onClick={handleCreateSucursal} variant="primary">
          + Nueva sucursal
        </Button>
      </div>

      {/* Dialog para nueva sucursal */}
      <Dialog name="nueva-sucursal" title="Crear nueva sucursal" message="Aquí irá el formulario">
        <div className="mt-2 text-sm text-gray-600">
          Este es un placeholder. Acá va el formulario para crear una nueva sucursal.
        </div>
      </Dialog>

      {/* sucursales */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {/* Repetir Card para cada sucursal */}
        <Card
          title="Sucursal Central"
          line1="Dirección: San Martín 733, Mendoza, Argentina"
          line2="Horario: 08:00 - 23:59"
          badge="Casa matriz"
          onPrimaryClick={() => console.log('Seleccionar')}
          onSecondaryClick={() => console.log('Editar')}
        />
        {[...Array(5)].map((_, i) => (
          <Card
            key={i}
            title={`Sucursal ${i + 2}`}
            line1="Dirección: San Martín 733, Mendoza, Argentina"
            line2="Horario: 08:00 - 23:59"
            onPrimaryClick={() => console.log('Seleccionar')}
            onSecondaryClick={() => console.log('Editar')}
          />
        ))}
      </div>
    </main>
  )
}
