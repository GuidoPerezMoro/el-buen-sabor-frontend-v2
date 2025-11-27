'use client'
import {useEffect, useState} from 'react'
import {Role, STAFF_ROLES, StaffRole} from '@/services/types/role'

export function getPrimaryStaffRole(roles: string[] | null | undefined): StaffRole {
  if (!roles || roles.length === 0) return 'other'

  // Asumes que los valores de roles coinciden con Role, y normalmente hay solo uno.
  const set = new Set(roles as Role[])
  for (const r of STAFF_ROLES) {
    if (set.has(r)) return r
  }

  // Si solo tiene "cliente" u otro rol no esperado, no lo tratamos como staff
  return 'other'
}

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

  const primaryRole: StaffRole = getPrimaryStaffRole(roles)
  const isStaff = primaryRole !== 'other'

  return {
    roles,
    loading,
    has: (r: string | string[]) => {
      if (!roles) return false
      const set = new Set(roles)
      return Array.isArray(r) ? r.some(x => set.has(x)) : set.has(r)
    },
    primaryRole,
    isStaff,
  }
}
