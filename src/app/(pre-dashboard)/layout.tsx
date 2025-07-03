import React from 'react'
import Header from '@/components/layouts/Header'

export default function PreDashboardLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="bg-background text-text">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  )
}
