'use client'
import {useUser} from '@auth0/nextjs-auth0/client'
import {cn} from '@/lib/utils'

export default function CurrentUserLabel({className}: {className?: string}) {
  const {user, isLoading} = useUser()

  const label = (user?.name && user.name.trim()) || (user?.email && user.email.trim()) || 'Invitado'

  return (
    <span className={cn('text-xs sm:text-sm font-medium text-text', className)}>
      {isLoading ? 'Cargando…' : label}
    </span>
  )
}
