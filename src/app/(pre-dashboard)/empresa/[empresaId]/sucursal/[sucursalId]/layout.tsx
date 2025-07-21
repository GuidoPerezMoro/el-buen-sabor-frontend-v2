import Sidenav from '@/components/layouts/Sidenav'

export default function SucursalLayout({children}: {children: React.ReactNode}) {
  return (
    <div className="min-h-screen flex">
      {/* SideNav */}
      <aside className="w-64 bg-primary/10 p-4 border-r border-surface">
        <Sidenav />
      </aside>

      {/* Main content area */}
      <main className="flex-1 p-6 bg-background text-text">{children}</main>
    </div>
  )
}
