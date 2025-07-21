'use client'

import {useEffect, useState} from 'react'
import {useParams} from 'next/navigation'
import PersonIcon from '@/assets/icons/person.svg'
import {fetchEmpresaById} from '@/services/empresa'
import {fetchSucursalById} from '@/services/sucursal'
import Breadcrumbs from '@/components/ui/Breadcrumbs'

export default function Header() {
  const {empresaId, sucursalId} = useParams()
  const [empresaName, setEmpresaName] = useState<string>('Empresa')
  const [sucursalName, setSucursalName] = useState<string>('Sucursal')

  // fetch empresa name when ruta includes empresaId
  useEffect(() => {
    if (empresaId) {
      fetchEmpresaById(+empresaId)
        .then(e => setEmpresaName(e.nombre))
        .catch(() => setEmpresaName('Empresa'))
    }
  }, [empresaId])

  // fetch sucursal name when ruta includes sucursalId
  useEffect(() => {
    if (sucursalId) {
      fetchSucursalById(+sucursalId)
        .then(s => setSucursalName(s.nombre))
        .catch(() => setSucursalName('Sucursal'))
    }
  }, [sucursalId])

  return (
    <header className="w-full bg-primary/10 border-surface px-4 py-3 flex items-center justify-between">
      {/* Left section: user + breadcrumbs */}
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-text">White Dragon</span>

        {empresaId && (
          <Breadcrumbs
            items={[
              {label: 'Empresas', href: '/empresa'},
              {
                label: empresaName,
                href: `/empresa/${empresaId}/sucursal`,
              },
              ...(sucursalId
                ? [
                    {
                      label: sucursalName,
                    },
                  ]
                : []),
            ]}
          />
        )}
      </div>
      {/* Right section: user icon */}
      <button
        type="button"
        className="w-10 h-10 flex items-center justify-center rounded-full bg-surface hover:bg-surfaceHover transition-colors"
        title="Perfil de usuario"
      >
        <PersonIcon className="w-5 h-5 text-black" />
      </button>
    </header>
  )
}
