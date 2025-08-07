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
