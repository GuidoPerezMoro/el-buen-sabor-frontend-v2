'use client'

import {useState} from 'react'
import Image from 'next/image'
import {Percent, Utensils} from 'lucide-react'
import {cn} from '@/lib/utils'
import {formatARS} from '@/lib/format'
import AddToCartButton from './AddToCartButton'

export type ShopItemType = 'promo' | 'manufacturado' | 'insumo'

export interface ShopCardProps {
  type: ShopItemType
  title: string
  price?: number | null
  categoryLabel?: string | null
  imageUrl?: string | null
  promoBadge?: string | null
  inactive?: boolean
}

export default function ShopCard({
  type,
  title,
  price,
  categoryLabel,
  imageUrl,
  promoBadge,
  inactive = false,
}: ShopCardProps) {
  const showPrice = typeof price === 'number'
  const [imgError, setImgError] = useState(false)
  const showImage = Boolean(imageUrl) && !imgError

  return (
    <article
      className={cn(
        'flex flex-col rounded-md border bg-white p-3 text-sm transition-shadow',
        'shadow-sm hover:shadow-md',
        inactive && 'border-dashed border-muted bg-background text-muted'
      )}
    >
      <div className="flex gap-3">
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted/30">
          {showImage ? (
            <Image
              src={imageUrl as string}
              alt={title}
              fill
              className="object-cover"
              sizes="64px"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Utensils className="h-5 w-5 text-muted" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium truncate">{title}</h3>
            {showPrice && (
              <span className={cn('text-xs font-semibold whitespace-nowrap')}>
                {formatARS(price!)}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1 text-[11px]">
            {type === 'promo' && (
              <span className="inline-flex items-center gap-1 rounded-full border border-primary px-2 py-0.5 text-[10px] font-medium text-primary">
                <Percent className="h-3 w-3" />
                {promoBadge ?? 'Promoción'}
              </span>
            )}
            {categoryLabel && (
              <span className="inline-flex rounded-full bg-surface px-2 py-0.5 text-[10px] text-text">
                {categoryLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      <AddToCartButton disabled={inactive || !showPrice} />
    </article>
  )
}
