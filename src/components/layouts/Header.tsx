'use client'

import PersonIcon from '@/assets/icons/person.svg'

export default function Header() {
  return (
    <header className="w-full bg-surface border-b border-muted px-4 py-3 flex items-center justify-between">
      {/* Left section */}
      <div className="text-sm font-medium text-text">
        {/* Placeholder data */}
        Juan Pérez | Acme Corp &gt; Sucursal Centro
      </div>

      {/* Right section */}
      <button
        type="button"
        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-300 hover:bg-muted transition-colors"
        title="Perfil de usuario"
      >
        <PersonIcon className="w-5 h-5 text-black" />
      </button>
    </header>
  )
}
