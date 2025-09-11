import type { Metadata } from 'next'
import React from 'react'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'

// Resto de estilos globales
import '@/styles/base.css'
import '@/styles/components/buttons.css'
import '@/styles/components/forms.css'
import '@/styles/components/cards.css'
import '@/styles/components/navigation.css'
import '@/styles/components/cart.css'
import '@/styles/components/allergens.css'
import '@/styles/components/admin-menu.css'
import '@/styles/components/admin-forms.css'
import '@/styles/components/session-indicator.css'
import '@/styles/utilities.css'
import '@/styles/pages/checkout.css'
import '@/styles/pages/menu.css'
import '@/styles/pages/login.css'
import '@/styles/pages/admin.css'
import { ToastProvider } from '@/components/providers/ToastProvider'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Pide App',
  description: 'Restaurant QR Menu Management System',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
