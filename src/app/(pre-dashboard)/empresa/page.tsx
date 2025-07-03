'use client'

import Card from '@/components/ui/Card'

export default function EmpresaPage() {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">Empresas</h1>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        <Card
          title="Empresa Ejemplo"
          line1="CUIT: 30-12345678-9"
          line2="Mendoza, Argentina"
          onPrimaryClick={() => console.log('Seleccionar')}
          onSecondaryClick={() => console.log('Editar')}
        />
        {/* Repetir Card para cada empresa */}
        <Card
          title="Empresa Ejemplo"
          line1="CUIT: 30-12345678-9"
          line2="Mendoza, Argentina"
          onPrimaryClick={() => console.log('Seleccionar')}
          onSecondaryClick={() => console.log('Editar')}
        />
        <Card
          title="Empresa Ejemplo"
          line1="CUIT: 30-12345678-9"
          line2="Mendoza, Argentina"
          onPrimaryClick={() => console.log('Seleccionar')}
          onSecondaryClick={() => console.log('Editar')}
        />
        <Card
          title="Empresa Ejemplo"
          line1="CUIT: 30-12345678-9"
          line2="Mendoza, Argentina"
          onPrimaryClick={() => console.log('Seleccionar')}
          onSecondaryClick={() => console.log('Editar')}
        />
        <Card
          title="Empresa Ejemplo"
          line1="CUIT: 30-12345678-9"
          line2="Mendoza, Argentina"
          onPrimaryClick={() => console.log('Seleccionar')}
          onSecondaryClick={() => console.log('Editar')}
        />
        <Card
          title="Empresa Ejemplo"
          line1="CUIT: 30-12345678-9"
          line2="Mendoza, Argentina"
          onPrimaryClick={() => console.log('Seleccionar')}
          onSecondaryClick={() => console.log('Editar')}
        />
      </div>
    </main>
  )
}
