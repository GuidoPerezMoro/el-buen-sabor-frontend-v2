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
  className?: string
}

export default function Card({
  imageSrc,
  imageAlt = 'Card image',
  title,
  line1,
  line2,
  onPrimaryClick,
  onSecondaryClick,
  primaryLabel = 'Seleccionar',
  secondaryLabel = 'Editar',
  className,
}: CardProps) {
  return (
    <div className={cn('bg-white border rounded-lg shadow-sm p-4 flex flex-col gap-4', className)}>
      <div className="relative w-full h-52">
        <Image
          src={imageSrc || defaultImage}
          alt={title}
          fill
          className="object-cover"
          sizes="100%"
        />
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-text">{title}</h3>
        {line1 && <p className="text-sm text-muted">{line1}</p>}
        {line2 && <p className="text-sm text-muted">{line2}</p>}
      </div>

      <div className="mt-auto flex justify-end gap-2">
        <Button variant="secondary" onClick={onSecondaryClick}>
          {secondaryLabel}
        </Button>
        <Button variant="primary" onClick={onPrimaryClick}>
          {primaryLabel}
        </Button>
      </div>
    </div>
  )
}
