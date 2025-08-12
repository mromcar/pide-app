'use client'
import { useSession, signIn } from 'next-auth/react'
import { useEffect } from 'react'
import { UserRole } from '@/types/enums'

export function ProtectedPage({
  allowedRoles,
  children,
}: {
  allowedRoles: UserRole[]
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'unauthenticated') signIn()
  }, [status])

  if (status === 'loading') return <div>Cargando...</div>

  const userRole = session?.user?.role as UserRole
  if (!session || !allowedRoles.includes(userRole)) {
    return <div>No autorizado</div>
  }

  return <>{children}</>
}

// Mantener también la exportación por defecto para compatibilidad
export default ProtectedPage
