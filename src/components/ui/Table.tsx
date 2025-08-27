'use client'

import {useState, useMemo} from 'react'
import {ArrowUp, ArrowDown} from 'lucide-react'
import {cn} from '@/lib/utils'
import React from 'react'

export interface Column<T> {
  header: string
  accessor: (row: T) => React.ReactNode
  sortable?: boolean
  sortKey?: keyof T
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  alignLastColumnEnd?: boolean
  className?: string
  headerClassName?: string
  cellClassName?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  getRowKey?: (row: T, index: number) => React.Key
}

export default function Table<T>({
  columns,
  data,
  alignLastColumnEnd = false,
  className,
  headerClassName,
  cellClassName,
  size = 'md',
  getRowKey,
}: TableProps<T>) {
  // Size
  const sizeMap = {
    sm: {th: 'px-3 py-1', td: 'px-3 py-1', icon: 12},
    md: {th: 'px-4 py-2', td: 'px-4 py-2', icon: 14},
    lg: {th: 'px-5 py-3', td: 'px-5 py-3', icon: 16},
    xl: {th: 'px-6 py-3', td: 'px-6 py-6', icon: 18},
  } as const

  const sz = sizeMap[size ?? 'md']

  // Sort
  const [sortConfig, setSortConfig] = useState<{key: keyof T; direction: 'asc' | 'desc'} | null>(
    null
  )

  const sortedData = useMemo(() => {
    if (!sortConfig) return data
    const {key, direction} = sortConfig
    return [...data].sort((a, b) => {
      const aVal = a[key]
      const bVal = b[key]
      if (aVal == null || bVal == null) return 0
      if (aVal < bVal) return direction === 'asc' ? -1 : 1
      if (aVal > bVal) return direction === 'asc' ? 1 : -1
      return 0
    })
  }, [data, sortConfig])

  const handleSort = (col: Column<T>) => {
    if (!col.sortable || !col.sortKey) return
    const sortKey = col.sortKey
    setSortConfig(prev => {
      if (prev && prev.key === sortKey) {
        return {
          key: sortKey,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        }
      }
      return {key: sortKey, direction: 'asc'}
    })
  }

  return (
    <table className={cn('w-full border-collapse', className)}>
      <thead>
        <tr>
          {columns.map((col, idx) => {
            const isLast = idx === columns.length - 1
            return (
              <th
                key={idx}
                onClick={() => handleSort(col)}
                className={cn(
                  sz.th,
                  col.sortable && 'cursor-pointer',
                  // right‐align header if last column and prop is true
                  alignLastColumnEnd ? (isLast ? 'text-right' : 'text-left') : 'text-left',
                  headerClassName
                )}
                scope="col"
              >
                <div className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable &&
                    sortConfig &&
                    sortConfig.key === col.sortKey &&
                    (sortConfig.direction === 'asc' ? (
                      <ArrowUp size={sz.icon} />
                    ) : (
                      <ArrowDown size={sz.icon} />
                    ))}
                </div>
              </th>
            )
          })}
        </tr>
      </thead>
      <tbody>
        {sortedData.map((row, ri) => (
          <tr
            key={getRowKey ? getRowKey(row, ri) : ri}
            className="border-t hover:bg-primary/10 transition-colors"
          >
            {columns.map((col, ci) => (
              <td
                key={ci}
                className={cn(
                  sz.td,
                  alignLastColumnEnd && ci === columns.length - 1 && 'text-right',
                  cellClassName
                )}
              >
                {col.accessor(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
