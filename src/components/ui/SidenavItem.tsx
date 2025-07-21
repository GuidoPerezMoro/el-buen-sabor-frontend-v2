'use client'

import Link from 'next/link'
import {cn} from '@/lib/utils'

interface SidenavItemProps {
  href: string
  label: string
  icon?: ComponentType<any>
  selected?: boolean
}

import {Box} from 'lucide-react' // fallback icon
import {ComponentType} from 'react'

export default function SidenavItem({
  href,
  label,
  icon: Icon = Box,
  selected = false,
}: SidenavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-4 py-2 rounded transition-colors',
        selected ? 'bg-primary text-background' : 'hover:bg-primary/30 text-text'
      )}
    >
      <Icon size={20} className={cn(selected ? 'text-background' : 'text-text')} />
      <span className="flex-1 text-sm">{label}</span>
    </Link>
  )
}
