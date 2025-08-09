import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { jsonError } from "@/utils/api"
import { UserRole } from "@prisma/client"
import { NextRequest } from "next/server"

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string
    email: string
    role: UserRole
    establishment_id?: number | null
  }
}

export async function requireAuth(requiredRoles?: UserRole | UserRole[]) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw jsonError("Unauthorized", 401)
  }

  if (requiredRoles) {
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
    if (!roles.includes(session.user.role)) {
      throw jsonError("Insufficient permissions", 403)
    }
  }

  return session
}

export async function requireEstablishmentAccess(establishmentId: number) {
  const session = await requireAuth([
    UserRole.establishment_admin,
    UserRole.general_admin,
    UserRole.waiter,
    UserRole.cook
  ])

  // General admin can access any establishment
  if (session.user.role === UserRole.general_admin) {
    return session
  }

  // Other roles must belong to the establishment
  if (session.user.establishmentId !== establishmentId) {
    throw jsonError("Access denied to this establishment", 403)
  }

  return session
}

export function isAdmin(role: UserRole): boolean {
  return role === UserRole.establishment_admin || role === UserRole.general_admin
}

export function isEmployee(role: UserRole): boolean {
  return role === UserRole.waiter || role === UserRole.cook
}
