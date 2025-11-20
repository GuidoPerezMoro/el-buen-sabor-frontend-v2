'use client'

import {useState, KeyboardEvent} from 'react'
import Image from 'next/image'
import {Percent, Utensils} from 'lucide-react'
import {cn} from '@/lib/utils'
import {formatARS} from '@/lib/format'

export type ShopItemType = 'promo' | 'manufacturado' | 'insumo'

export interface ShopCardProps {
  type: ShopItemType
  title: string
  price?: number | null
  categoryLabel?: string | null
  imageUrl?: string | null
  promoBadge?: string | null
  description?: string | null
  validityLabel?: string | null
  inactive?: boolean
  onClick?: () => void
}

export default function ShopCard({
  type,
  title,
  price,
  categoryLabel,
  imageUrl,
  promoBadge,
  description,
  validityLabel,
  inactive = false,
  onClick,
}: ShopCardProps) {
  const showPrice = typeof price === 'number'
  const [imgError, setImgError] = useState(false)
  const showImage = Boolean(imageUrl) && !imgError

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (!onClick) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <article
      className={cn(
        'flex h-full cursor-pointer flex-col rounded-md border bg-white p-3 text-sm transition-shadow',
        'shadow-sm hover:shadow-md',
        inactive && 'border-dashed border-muted bg-background text-muted'
      )}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <div className="flex h-full gap-3">
        <div className="flex min-w-0 flex-1 flex-col justify-between space-y-1">
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-medium line-clamp-1">{title}</h3>
              {showPrice && (
                <span className="text-sm font-semibold whitespace-nowrap">{formatARS(price!)}</span>
              )}
            </div>

            {description && <p className="text-[11px] text-text/80 line-clamp-2">{description}</p>}
          </div>

          <div className="flex items-center justify-between pt-1">
            {type === 'promo' && (
              <span className="inline-flex items-center gap-1 rounded-full border border-primary px-2 py-0.5 text-[10px] font-medium text-primary">
                <Percent className="h-3 w-3" />
                {promoBadge ?? 'Promoción'}
              </span>
            )}

            {validityLabel && (
              <p className="ml-auto text-right text-[10px] text-muted line-clamp-2">
                {validityLabel}
              </p>
            )}
          </div>
        </div>

        <div className="relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted/30">
          {showImage ? (
            <Image
              src={imageUrl as string}
              alt={title}
              fill
              className="object-cover"
              sizes="96px"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Utensils className="h-5 w-5 text-muted" aria-hidden="true" />
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
