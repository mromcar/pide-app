import type { Metadata } from 'next'
import SessionWrapper from '@/components/auth/SessionWrapper'
import { CartProvider } from '@/lib/cart-context'
import { LanguageCode } from '@/constants/languages'
import ConditionalNavbar from '@/components/common/ConditionalNavbar'
import QueryProvider from '@/components/providers/QueryProvider'

export const metadata: Metadata = {
  title: 'Pide App',
  description: 'Created by MM',
}

export default function LanguageLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { lang: LanguageCode }
}) {
  const { lang } = params
  return (
    <SessionWrapper>
      <QueryProvider>
        <CartProvider>
          <ConditionalNavbar lang={lang} />
          {children}
        </CartProvider>
      </QueryProvider>
    </SessionWrapper>
  )
}
