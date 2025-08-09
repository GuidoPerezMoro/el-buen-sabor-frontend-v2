import {Categoria, CategoriaNode} from './types/categoria'

export function filterCategoriasBySucursalId(categorias: Categoria[], sucursalId: number) {
  return categorias.filter(c => c.sucursales?.some(s => s.id === sucursalId))
}

export function buildCategoriaTree(flat: Categoria[]): CategoriaNode[] {
  const map = new Map<number, CategoriaNode>()
  flat.forEach(c => map.set(c.id, {...c, children: []}))

  map.forEach(node => {
    const parentId = node.categoriaPadre?.id
    if (parentId && map.has(parentId)) {
      map.get(parentId)!.children.push(node)
    }
  })

  return Array.from(map.values()).filter(n => n.categoriaPadre === null)
}

/**
 * Flattens a CategoriaNode tree to a picker-friendly list with breadcrumb labels.
 * NOTE: Artículos can belong to ANY node (not leaf-only) per current decision.
 */
export function flattenCategoriaTree(roots: CategoriaNode[]) {
  type Flat = {
    id: number
    label: string
    /** segment labels in order, e.g. ["Abuelo","Padre","Hijo"] */
    pathLabels: string[]
    /** ids in order, e.g. [6,7,8] */
    pathIds: number[]
    esInsumo: boolean
    habilitado: boolean
  }
  const out: Flat[] = []

  const walk = (node: CategoriaNode, pathNames: string[], pathIds: number[]) => {
    const nextNames = [...pathNames, node.denominacion]
    const nextIds = [...pathIds, node.id]

    out.push({
      id: node.id,
      label: nextNames.join(' > '),
      pathLabels: nextNames,
      pathIds: nextIds,
      esInsumo: node.esInsumo,
      habilitado: node.habilitado,
    })

    node.children.forEach(child => walk(child, nextNames, nextIds))
  }

  roots.forEach(root => walk(root, [], []))
  return out
}

/** Case/accents-insensitive tree filter by denominación.
 *  Keeps a node if it matches OR any descendant matches.
 *  Returns a pruned copy of the tree (original array untouched).
 */
export function filterCategoriaTreeByText(roots: CategoriaNode[], query: string): CategoriaNode[] {
  const q = query.trim()
  if (!q) return roots

  const fold = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
  const term = fold(q)

  const visit = (node: CategoriaNode): CategoriaNode | null => {
    const selfMatch = fold(node.denominacion).includes(term)
    const filteredChildren: CategoriaNode[] = []
    for (const child of node.children) {
      const next = visit(child)
      if (next) filteredChildren.push(next)
    }
    if (selfMatch || filteredChildren.length) {
      return {...node, children: filteredChildren}
    }
    return null
  }

  return roots.map(n => visit(n)).filter(Boolean) as CategoriaNode[]
}

export type EsInsumoFilter = 'all' | 'insumo' | 'noinsumo'

/** Prunes the tree by esInsumo. Keeps a node if it matches OR any descendant matches. */
export function filterCategoriaTreeByEsInsumo(
  roots: CategoriaNode[],
  mode: EsInsumoFilter
): CategoriaNode[] {
  if (mode === 'all') return roots
  const want = mode === 'insumo'
  const visit = (node: CategoriaNode): CategoriaNode | null => {
    const kids = node.children.map(visit).filter(Boolean) as CategoriaNode[]
    const selfOk = node.esInsumo === want
    if (selfOk || kids.length) return {...node, children: kids}
    return null
  }
  return roots.map(visit).filter(Boolean) as CategoriaNode[]
}
