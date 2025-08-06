import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import '../../styles/globals.css'
import SessionWrapper from '@/components/auth/SessionWrapper'
import { CartProvider } from '@/lib/cart-context'
import { LanguageCode } from '@/constants/languages'
import ConditionalNavbar from '@/components/common/ConditionalNavbar'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Pide App',
  description: 'Created by MM',
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { lang: LanguageCode }
}) {
  const { lang } = await params
  return (
    <html lang={lang}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900`}
      >
        <SessionWrapper>
          <CartProvider>
            <ConditionalNavbar lang={lang} />
            {children}
          </CartProvider>
        </SessionWrapper>
      </body>
    </html>
  )
}
