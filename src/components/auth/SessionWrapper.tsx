'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface SessionWrapperProps {
  children: ReactNode
}

export default function SessionWrapper({ children }: SessionWrapperProps) {
  return (
    <SessionProvider
      // ✅ Configuraciones optimizadas para tu caso de uso
      refetchInterval={5 * 60} // Refrescar cada 5 minutos
      refetchOnWindowFocus={true} // Refrescar al enfocar ventana
      refetchWhenOffline={false} // No refrescar cuando esté offline
      // ✅ Configurar base path si usas subdirectorios
      basePath="/api/auth"
    >
      {children}
    </SessionProvider>
  )
}
