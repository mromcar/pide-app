import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import '../../styles/globals.css' // Cambiar esta línea
import SessionWrapper from '@/components/auth/SessionWrapper'
import AdminLayout from '@/components/admin/AdminLayout'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Admin - Pide App',
  description: 'Panel de administración',
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900`}
      >
        <SessionWrapper>
          <AdminLayout>{children}</AdminLayout>
        </SessionWrapper>
      </body>
    </html>
  )
}
