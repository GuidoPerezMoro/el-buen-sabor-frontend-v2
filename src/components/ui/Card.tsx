'use client'

import Image from 'next/image'
import defaultImage from '@/assets/images/company.png'
import {cn} from '@/lib/utils'
import Button from './Button'

interface CardProps {
  imageSrc?: string
  imageAlt?: string
  title: string
  line1?: string
  line2?: string
  onPrimaryClick?: () => void
  onSecondaryClick?: () => void
  primaryLabel?: string
  secondaryLabel?: string
  badge?: string | React.ReactNode
  className?: string
}

export default function Card({
  imageSrc,
  imageAlt,
  title,
  line1,
  line2,
  onPrimaryClick,
  onSecondaryClick,
  primaryLabel = 'Seleccionar',
  secondaryLabel = 'Editar',
  badge,
  className,
}: CardProps) {
  const hasBadge = Boolean(badge)

  return (
    <div
      className={cn(
        'bg-white border rounded-lg shadow-sm p-4 flex flex-col gap-4 transition-all',
        hasBadge ? 'border-2 border-primary' : 'border',
        className
      )}
    >
      {/* TODO: Fix image square */}
      <div className="relative w-full h-52">
        <Image
          src={imageSrc || defaultImage}
          alt={imageAlt || title}
          fill
          className="object-cover"
          sizes="100%"
        />
        {badge && (
          <span className="absolute top-2 left-2 bg-surface text-text text-[11px] font-medium px-2 py-0.5 rounded border border-muted">
            {badge}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1 overflow-hidden">
        <h3 className="text-lg font-semibold text-text break-words line-clamp-2">{title}</h3>
        {line1 && <p className="text-sm text-muted break-words line-clamp-3">{line1}</p>}
        {line2 && <p className="text-sm text-muted break-words line-clamp-1">{line2}</p>}
      </div>

      <div className="mt-auto flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onSecondaryClick}>
          {secondaryLabel}
        </Button>
        <Button variant="primary" size="sm" onClick={onPrimaryClick}>
          {primaryLabel}
        </Button>
      </div>
    </div>
  )
}
