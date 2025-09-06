// ✅ SIMPLIFICAR: src/components/auth/AuthGuard.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    console.log('🛡️ AuthGuard Status:', status)
    console.log('👤 AuthGuard Session:', session?.user)

    // ✅ Si el middleware funcionó, aquí ya deberíamos tener sesión válida
    if (status === 'unauthenticated') {
      console.log('❌ AuthGuard: No session detected - This indicates middleware failed')
      // ✅ El middleware debería haber redirigido, pero por si acaso
      const currentPath = window.location.pathname
      const lang = currentPath.split('/')[1] || 'es'
      router.replace(`/${lang}/login`)
    }
  }, [status, router])

  // ✅ Loading state
  if (status === 'loading') {
    return (
      fallback || (
        <div className="auth-loading">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <p>Verificando sesión...</p>
        </div>
      )
    )
  }

  // ✅ Unauthenticated state (no debería llegar aquí si middleware funciona)
  if (status === 'unauthenticated' || !session) {
    return (
      fallback || (
        <div className="auth-error">
          <p>Redirigiendo al login...</p>
        </div>
      )
    )
  }

  console.log('✅ AuthGuard: Access granted')
  return <>{children}</>
}
