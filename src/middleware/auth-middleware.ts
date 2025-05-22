import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { jsonError } from "@/utils/api"  // Usa la ruta existente

export async function requireAuth(requiredRole?: string) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw jsonError("Unauthorized", 401)
  }
  if (requiredRole && !session.user.role.includes(requiredRole)) {
    throw jsonError("Insufficient permissions", 403)
  }
  return session
}
