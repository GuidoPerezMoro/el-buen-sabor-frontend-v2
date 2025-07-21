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
}

export default function Table<T>({columns, data, alignLastColumnEnd = false}: TableProps<T>) {
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
    <table className="w-full border-collapse">
      <thead>
        <tr>
          {columns.map((col, idx) => {
            const isLast = idx === columns.length - 1
            return (
              <th
                key={idx}
                onClick={() => handleSort(col)}
                className={cn(
                  'px-4 py-2 font-medium',
                  col.sortable && 'cursor-pointer',
                  // right‐align header if last column and prop is true
                  alignLastColumnEnd ? (isLast ? 'text-right' : 'text-left') : 'text-left'
                )}
              >
                <div className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable &&
                    sortConfig &&
                    sortConfig.key === col.sortKey &&
                    (sortConfig.direction === 'asc' ? (
                      <ArrowUp size={14} />
                    ) : (
                      <ArrowDown size={14} />
                    ))}
                </div>
              </th>
            )
          })}
        </tr>
      </thead>
      <tbody>
        {sortedData.map((row, ri) => (
          <tr key={ri} className="border-t">
            {columns.map((col, ci) => (
              <td
                key={ci}
                className={cn(
                  'px-4 py-2',
                  alignLastColumnEnd && ci === columns.length - 1 && 'text-right'
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
