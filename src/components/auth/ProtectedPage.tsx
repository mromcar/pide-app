'use client'
import { useSession, signIn } from 'next-auth/react'
import { useEffect } from 'react'

export function ProtectedPage({
  allowedRoles,
  children,
}: {
  allowedRoles: string[]
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'unauthenticated') signIn()
  }, [status])

  if (status === 'loading') return <div>Cargando...</div>
  if (!session || !allowedRoles.includes(session.user.role)) return <div>No autorizado</div>

  return <>{children}</>
}

// Mantener también la exportación por defecto para compatibilidad
export default ProtectedPage
