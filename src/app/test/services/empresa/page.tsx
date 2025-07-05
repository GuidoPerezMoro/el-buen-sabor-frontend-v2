'use client'

import {useEffect, useState} from 'react'
import {fetchAllEmpresas} from '@/services/empresa'
import {Empresa} from '@/services/types'

export default function TestEmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadEmpresas = async () => {
      try {
        const data = await fetchAllEmpresas()
        setEmpresas(data)
      } catch (err) {
        setError('Error al cargar empresas')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadEmpresas()
  }, [])

  if (loading) return <p>Cargando empresas...</p>
  if (error) return <p className="text-danger">{error}</p>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Empresas cargadas</h1>
      <ul className="space-y-4">
        {empresas.map(empresa => (
          <li key={empresa.id} className="border p-4 rounded shadow-sm bg-white">
            <p className="font-semibold">{empresa.nombre}</p>
            <p>Razón Social: {empresa.razonSocial}</p>
            <p>CUIL: {empresa.cuil}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
