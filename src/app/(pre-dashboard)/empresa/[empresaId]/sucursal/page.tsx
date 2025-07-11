'use client'

import {useEffect, useState} from 'react'
import {useParams, useRouter} from 'next/navigation'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import StatusMessage from '@/components/ui/StatusMessage'
import Dialog from '@/components/ui/Dialog'
import useDialog from '@/hooks/useDialog'
import {fetchAllSucursales} from '@/services/sucursal'
import {Sucursal} from '@/services/types'
import SucursalForm from '@/components/domain/sucursal/SucursalForm'

export default function SucursalPage() {
  const router = useRouter()
  const {openDialog} = useDialog()
  const {empresaId} = useParams()
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [sucursalAEditar, setSucursalAEditar] = useState<Sucursal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const loadSucursales = async () => {
    try {
      const data = await fetchAllSucursales()
      const empresaIdNum = Number(empresaId)
      setSucursales(data.filter(s => s.empresa.id === empresaIdNum))
    } catch (err) {
      console.error('Error al cargar sucursales', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectSucursal = (sucursalId: number) => {
    router.push(`/empresa/${empresaId}/sucursal/${sucursalId}`)
  }

  const handleCreateSucursal = () => {
    setSucursalAEditar(null)
    openDialog('nueva-sucursal')
  }

  const handleEditSucursal = (s: Sucursal) => {
    setSucursalAEditar(s)
    openDialog('editar-sucursal')
  }

  useEffect(() => {
    loadSucursales()
  }, [])

  if (loading) return <StatusMessage type="loading" message="Cargando sucursales..." />
  if (error)
    return (
      <StatusMessage
        type="error"
        message="Error al cargar las sucursales. Intente nuevamente más tarde."
      />
    )

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Sucursales</h1>
        <Button onClick={handleCreateSucursal} variant="primary">
          + Nueva sucursal
        </Button>
      </div>

      <Dialog name="nueva-sucursal" title="Crear nueva sucursal" fullscreen>
        <SucursalForm
          empresaId={Number(empresaId)}
          dialogName="nueva-sucursal"
          onSuccess={loadSucursales}
        />
      </Dialog>

      <Dialog
        name="editar-sucursal"
        title="Editar sucursal"
        fullscreen
        onClose={() => setSucursalAEditar(null)}
      >
        {sucursalAEditar && (
          <SucursalForm
            initialData={sucursalAEditar}
            empresaId={Number(empresaId)}
            dialogName="editar-sucursal"
            onSuccess={() => {
              loadSucursales()
              setSucursalAEditar(null)
            }}
          />
        )}
      </Dialog>

      {sucursales.length === 0 ? (
        <StatusMessage type="empty" message="Aún no se ha cargado ninguna sucursal." />
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {sucursales.map(sucursal => (
            <Card
              key={sucursal.id}
              title={sucursal.nombre}
              line1={`Dirección: ${sucursal.domicilio.calle} ${sucursal.domicilio.numero}`}
              line2={`Horario: ${sucursal.horarioApertura} - ${sucursal.horarioCierre}`}
              badge={sucursal.esCasaMatriz ? 'Casa matriz' : undefined}
              onPrimaryClick={() => handleSelectSucursal(sucursal.id)}
              onSecondaryClick={() => handleEditSucursal(sucursal)}
            />
          ))}
        </div>
      )}
    </main>
  )
}
