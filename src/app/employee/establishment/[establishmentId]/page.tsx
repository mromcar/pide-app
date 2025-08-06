import { requireEstablishmentAccess } from '@/middleware/auth-middleware'
import { UserRole } from '@/types/enums'
import EmployeeDashboard from '@/components/employee/EmployeeDashboard'

interface EmployeePageProps {
  params: { establishmentId: string }
}

export default async function EmployeePage({ params }: EmployeePageProps) {
  const establishmentId = parseInt(params.establishmentId)

  try {
    const session = await requireEstablishmentAccess(establishmentId)

    if (
      !session.user.role ||
      ![UserRole.WAITER, UserRole.COOK].includes(session.user.role as UserRole)
    ) {
      return <div>Access denied. Only waiters and cooks can access this page.</div>
    }

    return (
      <EmployeeDashboard
        establishmentId={establishmentId}
        userRole={session.user.role as UserRole}
        userId={parseInt(session.user.id)}
      />
    )
  } catch (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2 text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }
}
