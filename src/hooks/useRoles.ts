'use client'
import {useEffect, useState} from 'react'

export function useRoles() {
  const [roles, setRoles] = useState<string[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    fetch('/api/me/claims', {cache: 'no-store'})
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (mounted) setRoles(data?.roles ?? [])
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  return {
    roles,
    loading,
    has: (r: string | string[]) => {
      if (!roles) return false
      const set = new Set(roles)
      return Array.isArray(r) ? r.some(x => set.has(x)) : set.has(r)
    },
  }
}
