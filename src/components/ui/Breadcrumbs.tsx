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
    <nav aria-label="breadcrumb" className="flex items-center text-sm font-medium space-x-1">
      {items.map((crumb, i) => (
        <span key={i} className="flex items-center space-x-1">
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
