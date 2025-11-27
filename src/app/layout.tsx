'use client'

import {Inter} from 'next/font/google'
import '@/app/globals.css'
import {Provider} from 'react-redux'
import {store} from '@/store/store'
import {DialogProvider} from '@/contexts/dialog'
import {CartProvider} from '@/contexts/cart'

const inter = Inter({subsets: ['latin']})

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider store={store}>
          <CartProvider>
            <DialogProvider>{children}</DialogProvider>
          </CartProvider>
        </Provider>
      </body>
    </html>
  )
}
