import {ReactNode} from 'react'

interface ShopGridProps {
  children: ReactNode
}

export default function ShopGrid({children}: ShopGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch">
      {children}
    </div>
  )
}
