// src/app/(pre-dashboard)/empresa/[empresaId]/sucursal/page.tsx
'use client'

import {useEffect, useState, useCallback} from 'react'
import {useParams, useRouter} from 'next/navigation'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import StatusMessage from '@/components/ui/StatusMessage'
import Dialog from '@/components/ui/Dialog'
import useDialog from '@/hooks/useDialog'
import {fetchAllSucursales} from '@/services/sucursal'
import {Sucursal} from '@/services/types'
import SucursalForm from '@/components/domain/sucursal/SucursalForm'
import {useRoles} from '@/hooks/useRoles'

export default function SucursalPage() {
  const router = useRouter()
  const {openDialog} = useDialog()
  const {empresaId} = useParams<{empresaId: string}>()

  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [sucursalAEditar, setSucursalAEditar] = useState<Sucursal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Roles (public users will have [])
  const {roles, loading: rolesLoading} = useRoles()
  const isSuper = roles?.includes('superadmin')
  const isAdmin = roles?.includes('admin')
  const isGerente = roles?.includes('gerente')

  // Gerente claim for filtering
  const [sucursalIdClaim, setSucursalIdClaim] = useState<number | null | undefined>(undefined)
  const [claimsLoading, setClaimsLoading] = useState(true)

  // Load sucursales (public: all for the empresa; gerente: only their own)
  const loadSucursales = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await fetchAllSucursales()
      const empresaIdNum = Number(empresaId)
      let result = data.filter(s => s.empresa.id === empresaIdNum)

      if (isGerente && sucursalIdClaim != null) {
        result = result.filter(s => s.id === Number(sucursalIdClaim))
      }
      if (isGerente && sucursalIdClaim == null) {
        result = []
      }

      setSucursales(result)
    } catch (err) {
      console.error('Error al cargar sucursales', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [empresaId, isGerente, sucursalIdClaim])

  // Fetch claims only if potentially needed (staff path)
  useEffect(() => {
    if (!isGerente) {
      setSucursalIdClaim(undefined)
      setClaimsLoading(false)
      return
    }
    fetch('/api/me/claims', {cache: 'no-store'})
      .then(r => (r.ok ? r.json() : null))
      .then(d => setSucursalIdClaim(d?.sucursalId != null ? Number(d.sucursalId) : null))
      .catch(() => setSucursalIdClaim(null))
      .finally(() => setClaimsLoading(false))
  }, [isGerente])

  useEffect(() => {
    if (!rolesLoading && !claimsLoading && (isGerente ? sucursalIdClaim !== undefined : true)) {
      loadSucursales()
    }
  }, [loadSucursales, rolesLoading, claimsLoading, isGerente, sucursalIdClaim])

  const handleSelectSucursal = (sucursalId: number) => {
    const isStaff = roles?.some(r => ['superadmin', 'admin', 'gerente', 'cocinero'].includes(r))
    const base = `/empresa/${empresaId}/sucursal/${sucursalId}`
    router.push(isStaff ? base : `${base}/shop`)
  }

  const handleCreateSucursal = () => {
    setSucursales(prev => prev) // no-op; keep
    setSucursalAEditar(null)
    openDialog('nueva-sucursal')
  }

  const handleEditSucursal = (s: Sucursal) => {
    setSucursalAEditar(s)
    openDialog('editar-sucursal')
  }

  if (loading || rolesLoading || claimsLoading)
    return <StatusMessage type="loading" message="Cargando sucursales..." />

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

        {/* Solo super/admin crean/editar → público y gerente son sólo lectura */}
        {(isSuper || isAdmin) && (
          <Button onClick={handleCreateSucursal} variant="primary">
            + Nueva sucursal
          </Button>
        )}
      </div>

      {/* Aviso para gerente sin sucursal asignada */}
      {isGerente && sucursalIdClaim === null && (
        <div className="mb-4">
          <StatusMessage
            type="empty"
            title="Sin sucursal asignada"
            message="No tienes una sucursal asignada. Consulta con un administrador."
          />
        </div>
      )}

      {/* Dialogs staff-only */}
      <Dialog name="nueva-sucursal" title="Crear nueva sucursal">
        <SucursalForm
          empresaId={Number(empresaId)}
          dialogName="nueva-sucursal"
          onSuccess={loadSucursales}
        />
      </Dialog>

      <Dialog
        name="editar-sucursal"
        title="Editar sucursal"
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
              imageSrc={sucursal.imagenUrl}
              imageAlt={sucursal.nombre}
              line1={`Dirección: ${sucursal.domicilio.calle} ${sucursal.domicilio.numero}`}
              line2={`Horario: ${sucursal.horarioApertura} - ${sucursal.horarioCierre}`}
              badge={sucursal.esCasaMatriz ? 'Casa matriz' : undefined}
              onPrimaryClick={() => handleSelectSucursal(sucursal.id)}
              onSecondaryClick={isSuper || isAdmin ? () => handleEditSucursal(sucursal) : undefined}
            />
          ))}
        </div>
      )}
    </main>
  )
}
