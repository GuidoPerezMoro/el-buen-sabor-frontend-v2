'use client'

import {useEffect, useMemo, useState, useCallback} from 'react'
import {useParams} from 'next/navigation'
import SearchAddBar from '@/components/ui/SearchAddBar'
import StatusMessage from '@/components/ui/StatusMessage'
import Table, {Column} from '@/components/ui/Table'
import {ArticuloInsumo} from '@/services/types/articulo'
import {fetchAllArticuloInsumos} from '@/services/articuloInsumo'
import {
  filterArticuloInsumosBySucursalId,
  filterArticuloInsumosByText,
} from '@/services/articuloInsumo.utils'

export default function ArticulosInsumoPage() {
  const {sucursalId: sid} = useParams<{empresaId: string; sucursalId: string}>()
  const sucursalId = Number(sid)

  const [items, setItems] = useState<ArticuloInsumo[]>([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const all = await fetchAllArticuloInsumos()
      setItems(filterArticuloInsumosBySucursalId(all, sucursalId))
    } catch (e: any) {
      setError(e?.message ?? 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [sucursalId])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => filterArticuloInsumosByText(items, filter), [items, filter])

  const columns: Column<ArticuloInsumo>[] = [
    {
      header: 'Artículo',
      accessor: a => (
        <div className="flex flex-col">
          <span className="font-medium">{a.denominacion}</span>
          <span className="text-xs text-muted">{a.categoria?.denominacion ?? '—'}</span>
        </div>
      ),
      sortable: true,
      sortKey: 'denominacion',
    },
    {
      header: 'U. Medida',
      accessor: a => a.unidadDeMedida?.denominacion ?? '—',
    },
    {
      header: 'Stock',
      accessor: a => (
        <div>
          <span className="font-mono">{a.stockActual}</span>
          <span className="text-xs text-muted"> / {a.stockMaximo}</span>
        </div>
      ),
      sortable: true,
      sortKey: 'stockActual',
    },
    {
      header: 'Venta',
      accessor: a =>
        (a.precioVenta ?? 0).toLocaleString('es-AR', {style: 'currency', currency: 'ARS'}),
      sortable: true,
      sortKey: 'precioVenta',
    },
    {
      header: 'Para elaborar',
      accessor: a => (a.esParaElaborar ? 'Sí' : 'No'),
    },
    {
      header: '',
      accessor: a => (
        <div className="flex justify-end gap-2">
          <button
            className="text-primary hover:underline text-sm"
            onClick={() => console.log('Editar', a.id)}
            aria-label={`Editar ${a.denominacion}`}
          >
            Editar
          </button>
          <button
            className="text-danger hover:underline text-sm"
            onClick={() => console.log('Eliminar', a.id)}
            aria-label={`Eliminar ${a.denominacion}`}
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ]

  if (loading) return <StatusMessage type="loading" title="Cargando artículos..." />
  if (error) return <StatusMessage type="error" message="Error al cargar artículos." />

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Insumos</h1>
      </div>

      <SearchAddBar
        value={filter}
        onChange={setFilter}
        placeholder="Buscar por artículo o categoría"
        onAdd={() => console.log('Abrir diálogo: nuevo artículo (insumo)')}
        addLabel="Nuevo artículo"
      />

      {filtered.length === 0 ? (
        <StatusMessage
          type="empty"
          message={
            filter.trim()
              ? 'No se encontraron artículos con el texto ingresado.'
              : 'Aún no hay artículos en esta sucursal.'
          }
        />
      ) : (
        <div className="bg-white rounded-md border">
          <Table columns={columns} data={filtered} alignLastColumnEnd />
        </div>
      )}
    </main>
  )
}
