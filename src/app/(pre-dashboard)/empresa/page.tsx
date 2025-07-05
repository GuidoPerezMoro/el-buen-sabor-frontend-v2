'use client'

import {useEffect, useState} from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Dialog from '@/components/ui/Dialog'
import useDialog from '@/hooks/useDialog'
import {fetchAllEmpresas} from '@/services/empresa'
import {Empresa} from '@/services/types'
import EmpresaForm from '@/components/domain/empresa/EmpresaForm'

export default function EmpresaPage() {
  const {openDialog} = useDialog()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<Empresa | null>(null)

  const loadEmpresas = async () => {
    try {
      const data = await fetchAllEmpresas()
      setEmpresas(data)
    } catch (err) {
      console.error('Error al cargar empresas', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEmpresa = () => {
    openDialog('nueva-empresa')
  }

  const handleEditEmpresa = (empresa: Empresa) => {
    setEmpresaSeleccionada(empresa)
    openDialog('editar-empresa')
  }

  useEffect(() => {
    loadEmpresas()
  }, [])

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Empresas</h1>
        <Button onClick={handleCreateEmpresa} variant="primary">
          + Nueva empresa
        </Button>
      </div>

      {/* Form para nueva empresa */}
      <Dialog name="nueva-empresa" title="Crear nueva empresa">
        <EmpresaForm dialogName="nueva-empresa" onSuccess={loadEmpresas} />
      </Dialog>

      {/* Form para editar empresa */}
      <Dialog
        name="editar-empresa"
        title="Editar empresa"
        onClose={() => setEmpresaSeleccionada(null)}
      >
        {empresaSeleccionada && (
          <EmpresaForm
            initialData={empresaSeleccionada}
            dialogName="editar-empresa"
            onSuccess={() => {
              loadEmpresas()
              setEmpresaSeleccionada(null)
            }}
            onCancel={() => setEmpresaSeleccionada(null)}
          />
        )}
      </Dialog>

      {/* Empresas */}
      {loading ? (
        <p className="text-sm text-muted">Cargando empresas...</p>
      ) : error ? (
        <p className="text-sm text-danger">Error al cargar empresas.</p>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {empresas.map(empresa => (
            <Card
              key={empresa.id}
              title={empresa.nombre}
              line1={`CUIT: ${empresa.cuil}`}
              line2={empresa.razonSocial}
              onPrimaryClick={() => console.log('Seleccionar', empresa.id)}
              onSecondaryClick={() => handleEditEmpresa(empresa)}
            />
          ))}
        </div>
      )}
    </main>
  )
}
