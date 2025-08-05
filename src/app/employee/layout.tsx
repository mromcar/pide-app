import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import '../../styles/globals.css'
import SessionWrapper from '@/components/auth/SessionWrapper'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Employee - Pide App',
  description: 'Panel de empleados',
}

export default function EmployeeRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900`}
      >
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  )
}
