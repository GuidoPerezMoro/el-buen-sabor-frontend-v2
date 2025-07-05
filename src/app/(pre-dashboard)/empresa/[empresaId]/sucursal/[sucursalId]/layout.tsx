// app/empresa/[empresaId]/sucursal/[sucursalId]/layout.tsx
'use client'

export default function SucursalLayout({children}: {children: React.ReactNode}) {
  return (
    <div className="min-h-screen flex">
      {/* SideNav placeholder */}
      <aside className="w-64 bg-surface p-4 border-r border-muted">
        <p className="text-sm text-muted">[SideNav placeholder]</p>
      </aside>

      {/* Main content area */}
      <main className="flex-1 p-6 bg-background text-text">{children}</main>
    </div>
  )
}
