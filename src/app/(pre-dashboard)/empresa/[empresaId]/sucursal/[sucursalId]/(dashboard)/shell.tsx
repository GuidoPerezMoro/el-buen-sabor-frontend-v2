'use client'

import {useState} from 'react'
import Sidenav from '@/components/layouts/Sidenav'
import Drawer from '@/components/layouts/Drawer'
import {Menu} from 'lucide-react'
import Button from '@/components/ui/Button'

export default function DashboardShell({children}: {children: React.ReactNode}) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen flex">
      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Sidenav />
      </Drawer>

      <aside className="hidden md:block w-64 bg-primary/10 p-4 border-r border-surface">
        <Sidenav />
      </aside>

      <main className="flex-1 p-4 md:p-6 bg-background text-text w-full">
        <div className="md:hidden mb-1">
          <Button
            variant="secondary"
            size="sm"
            icon={<Menu />}
            onClick={() => setDrawerOpen(true)}
          />
        </div>
        {children}
      </main>
    </div>
  )
}
