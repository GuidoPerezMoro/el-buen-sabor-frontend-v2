'use client'

import {useEffect, useState} from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Dialog from '@/components/ui/Dialog'
import useDialog from '@/hooks/useDialog'
import {useRoles} from '@/hooks/useRoles'
import {fetchAllEmpresas} from '@/services/empresa'
import {Empresa} from '@/services/types'
import EmpresaForm from '@/components/domain/empresa/EmpresaForm'
import {useRouter} from 'next/navigation'
import StatusMessage from '@/components/ui/StatusMessage'

export default function EmpresaPage() {
  const router = useRouter()
  const {openDialog} = useDialog()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [empresaAEditar, setEmpresaAEditar] = useState<Empresa | null>(null)

  // Roles
  const {roles, loading: rolesLoading} = useRoles()
  const isAdmin = roles?.includes('admin')
  const isSuper = roles?.includes('superadmin')

  // undefined = aún no cargado; null = cargado pero sin valor
  const [empresaIdClaim, setEmpresaIdClaim] = useState<number | null | undefined>(undefined)
  const [claimsLoading, setClaimsLoading] = useState(true)

  const loadEmpresas = async () => {
    try {
      const data = await fetchAllEmpresas()
      // Admin: solo su empresa vía claim. Superadmin: todas. Público/otros: todas (solo lectura).
      if (isAdmin && empresaIdClaim != null) {
        setEmpresas(data.filter(e => e.id === Number(empresaIdClaim)))
      } else if (isAdmin && empresaIdClaim == null) {
        setEmpresas([]) // aún no asignado
      } else {
        setEmpresas(data)
      }
    } catch (err) {
      console.error('Error al cargar empresas', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  // claims (empresaId)
  useEffect(() => {
    fetch('/api/me/claims', {cache: 'no-store'})
      .then(r => (r.ok ? r.json() : null))
      .then(d => setEmpresaIdClaim(d?.empresaId ? Number(d.empresaId) : null))
      .catch(() => setEmpresaIdClaim(null))
      .finally(() => setClaimsLoading(false))
  }, [])

  useEffect(() => {
    if (!rolesLoading && !claimsLoading && empresaIdClaim !== undefined) {
      loadEmpresas()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolesLoading, claimsLoading, isAdmin, isSuper, empresaIdClaim])

  const handleCreateEmpresa = () => {
    // Admin: podrá crear su única empresa (el BE luego la vincula)
    openDialog('nueva-empresa')
  }

  const handleEditEmpresa = (empresa: Empresa) => {
    setEmpresaAEditar(empresa)
    openDialog('editar-empresa')
  }

  const handleSelectEmpresa = (empresaId: number) => {
    // Público/cliente/invitado: pasa a elegir sucursal
    // Staff: idem, y luego cada rol verá lo que corresponde
    router.push(`/empresa/${empresaId}/sucursal`)
  }

  if (loading || rolesLoading || claimsLoading)
    return <StatusMessage type="loading" message="Cargando empresas..." />

  if (error)
    return (
      <StatusMessage
        type="error"
        message="Error al cargar las empresas. Intente nuevamente más tarde."
      />
    )

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Empresas</h1>
        {/* superadmin siempre; admin solo si no tiene empresa; público (cliente/invitado) no ve el botón */}
        {(isSuper || (isAdmin && empresaIdClaim == null)) && (
          <Button onClick={handleCreateEmpresa} variant="primary">
            + Nueva empresa
          </Button>
        )}
      </div>

      {/* Aviso específico para admin sin empresa */}
      {isAdmin && empresaIdClaim === null && (
        <div className="mb-4">
          <StatusMessage
            type="empty"
            title="Sin empresa asignada"
            message="Crea tu empresa o pide a soporte que te asigne una."
          />
        </div>
      )}

      {/* Diálogos de crear/editar (solo útiles para staff; el UI ya controla visibilidad del botón) */}
      <Dialog name="nueva-empresa" title="Crear nueva empresa">
        <EmpresaForm dialogName="nueva-empresa" onSuccess={loadEmpresas} />
      </Dialog>

      <Dialog name="editar-empresa" title="Editar empresa" onClose={() => setEmpresaAEditar(null)}>
        {empresaAEditar && (
          <EmpresaForm
            initialData={empresaAEditar}
            dialogName="editar-empresa"
            onSuccess={() => {
              loadEmpresas()
              setEmpresaAEditar(null)
            }}
          />
        )}
      </Dialog>

      {/* Listado */}
      {empresas.length === 0 ? (
        // Si admin sin empresa → ya mostramos aviso arriba; superadmin sin empresas → genérico; público sin datos → genérico
        <StatusMessage type="empty" message="Aún no se ha cargado ninguna empresa." />
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {empresas.map(empresa => (
            <Card
              key={empresa.id}
              imageSrc={empresa.imagenUrl}
              imageAlt={`Logo de ${empresa.nombre}`}
              title={empresa.nombre}
              line1={`CUIT: ${empresa.cuil}`}
              line2={empresa.razonSocial}
              onPrimaryClick={() => handleSelectEmpresa(empresa.id)}
              // Editar visible solo si es admin/super
              onSecondaryClick={isSuper || isAdmin ? () => handleEditEmpresa(empresa) : undefined}
            />
          ))}
        </div>
      )}
    </main>
  )
}

// ERROR MENOR: Gerente/Cocinero ve otras empresas, aunque luego redirige a la suya
