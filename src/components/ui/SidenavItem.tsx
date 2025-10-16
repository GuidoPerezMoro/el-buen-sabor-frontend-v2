'use client'

import Link from 'next/link'
import {cn} from '@/lib/utils'
import type {LucideIcon} from 'lucide-react'
import {Box} from 'lucide-react'

interface SidenavItemProps {
  href: string
  label: string
  icon?: LucideIcon
  selected?: boolean
}

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
        'flex items-center gap-3 px-4 py-2 rounded transition-colors mx-2',
        selected
          ? 'bg-primary text-background rounded-md px-3 py-2'
          : 'hover:bg-primary/30 text-text rounded-md px-3 py-2'
      )}
    >
      <Icon size={20} className={cn(selected ? 'text-background' : 'text-text')} />
      <span className="flex-1 text-sm">{label}</span>
    </Link>
  )
}
