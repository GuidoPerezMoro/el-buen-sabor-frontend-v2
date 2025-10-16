'use client'

import {useCallback, useEffect, useMemo, useState} from 'react'
import {CategoriaNode} from '@/services/types/categoria'
import {fetchAllCategorias} from '@/services/categoria'
import {
  buildCategoriaTree,
  filterCategoriasBySucursalId,
  flattenCategoriaTree,
} from '@/services/categoria.utils'

export function useCategoriasTree(sucursalId: number) {
  const [tree, setTree] = useState<CategoriaNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const raw = await fetchAllCategorias()
      const scoped = filterCategoriasBySucursalId(raw, sucursalId)
      const roots = buildCategoriaTree(scoped)
      setTree(roots)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [sucursalId])

  useEffect(() => {
    load()
  }, [load])

  const flat = useMemo(() => flattenCategoriaTree(tree /* any node selectable */), [tree])

  return {
    tree,
    flat, // [{ id, label: "Abuelo > Padre > Hijo", pathIds, esInsumo }]
    loading,
    error,
    refetch: load,
  }
}
