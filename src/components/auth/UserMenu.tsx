'use client'
import {useEffect, useRef, useState} from 'react'
import {useUser} from '@auth0/nextjs-auth0/client'
import {cn} from '@/lib/utils'
import {useRoles} from '@/hooks/useRoles'

function Avatar({name, picture}: {name?: string | null; picture?: string | null}) {
  if (picture) {
    return (
      <img src={picture} alt={name ?? 'Usuario'} className="h-8 w-8 rounded-full object-cover" />
    )
  }
  const initial = (name ?? 'U').charAt(0).toUpperCase()
  return (
    <div className="h-8 w-8 rounded-full bg-primary text-white grid place-items-center text-sm font-semibold">
      {initial}
    </div>
  )
}

export default function UserMenu() {
  const {user, isLoading} = useUser()
  const {has} = useRoles()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('click', onClick)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('click', onClick)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  if (isLoading) return null
  if (!user) {
    return (
      <a href="/auth/login?returnTo=/post-login" className="text-sm underline">
        Iniciar sesión
      </a>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'flex items-center gap-2 rounded-full px-1 py-1 hover:bg-muted transition-colors'
        )}
      >
        <Avatar name={user.name ?? user.email} picture={user.picture} />
        {/* <span className="hidden sm:inline text-sm">{user.name ?? user.email}</span> */}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 w-32 rounded-xl border border-border bg-background shadow z-50 p-1"
        >
          {/* Only for clientes */}
          {has('cliente') && (
            <a
              role="menuitem"
              href="/perfil"
              className="block px-3 py-2 text-sm rounded-md hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              Mi perfil
            </a>
          )}
          <a
            role="menuitem"
            href="/auth/logout"
            className="block px-3 py-2 text-sm rounded-md hover:bg-muted text-danger"
            onClick={() => setOpen(false)}
          >
            Cerrar sesión
          </a>
        </div>
      )}
    </div>
  )
}
