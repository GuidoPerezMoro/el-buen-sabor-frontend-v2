import React from 'react'
import Header from '@/components/layouts/Header'

export default function PreDashboardLayout({children}: {children: React.ReactNode}) {
  return (
    <div className="bg-background text-text">
      <Header />
      <main>{children}</main>
    </div>
  )
}
