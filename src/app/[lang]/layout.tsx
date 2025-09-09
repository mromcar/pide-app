import type { Metadata } from 'next'

import '../../styles/globals.css'
import SessionWrapper from '@/components/auth/SessionWrapper'
import { CartProvider } from '@/lib/cart-context'
import { LanguageCode } from '@/constants/languages'
import ConditionalNavbar from '@/components/common/ConditionalNavbar'
import QueryProvider from '@/components/providers/QueryProvider'

export const metadata: Metadata = {
  title: 'Pide App',
  description: 'Created by MM',
}

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { lang: LanguageCode }
}) {
  const { lang } = params
  return (
    <html lang={lang}>
      <body className="antialiased bg-white text-gray-900">
        <SessionWrapper>
          <QueryProvider>
            <CartProvider>
              <ConditionalNavbar lang={lang} />
              {children}
            </CartProvider>
          </QueryProvider>
        </SessionWrapper>
      </body>
    </html>
  )
}
