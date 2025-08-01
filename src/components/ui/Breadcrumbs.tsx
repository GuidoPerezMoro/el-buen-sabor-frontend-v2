'use client'

import Link from 'next/link'

interface Crumb {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: Crumb[]
  separator?: string
}

export default function Breadcrumbs({items, separator = '>'}: BreadcrumbsProps) {
  return (
    <nav
      aria-label="breadcrumb"
      className="flex flex-wrap items-center text-xs sm:text-sm font-medium gap-x-1 gap-y-1 overflow-hidden"
    >
      {items.map((crumb, i) => (
        <span key={i} className="flex items-center space-x-1 max-w-[200px] truncate">
          {crumb.href ? (
            <Link href={crumb.href} className="hover:underline">
              {crumb.label}
            </Link>
          ) : (
            <span>{crumb.label}</span>
          )}
          {i < items.length - 1 && <span className="select-none">{separator}</span>}
        </span>
      ))}
    </nav>
  )
}
