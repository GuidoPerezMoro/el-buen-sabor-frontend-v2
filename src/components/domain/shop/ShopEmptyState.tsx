import StatusMessage from '@/components/ui/StatusMessage'

interface ShopEmptyStateProps {
  scope: 'promos' | 'items'
  filtered: boolean
}

export default function ShopEmptyState({scope, filtered}: ShopEmptyStateProps) {
  const base = scope === 'promos' ? 'promociones' : 'artículos'

  return (
    <StatusMessage
      type="empty"
      message={
        filtered
          ? `No se encontraron ${base} con los filtros actuales.`
          : `Aún no hay ${base} disponibles para esta sucursal.`
      }
    />
  )
}
