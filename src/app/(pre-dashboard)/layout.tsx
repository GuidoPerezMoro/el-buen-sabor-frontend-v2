import React from 'react'
import Header from '@/components/layouts/Header'
import {CartProvider} from '@/contexts/cart'
import CartDialog from '@/components/domain/cart/CartDialog'

export default function PreDashboardLayout({children}: {children: React.ReactNode}) {
  return (
    <CartProvider>
      <div className="bg-background text-text">
        <Header />
        {/* Cart dialog lives at layout level so it is available from any page via useDialog('cart') */}
        <CartDialog name="cart" />
        <main>{children}</main>
      </div>
    </CartProvider>
  )
}
