'use client'
import {ReactNode} from 'react'
import {useRoles} from '@/hooks/useRoles'

export default function RoleGate({allow, children}: {allow: string[]; children: ReactNode}) {
  const {roles, loading} = useRoles()
  if (loading) return null
  const ok = roles?.some(r => allow.includes(r))
  return ok ? <>{children}</> : null
}
