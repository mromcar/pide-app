import 'next-auth'
import { UserRole } from '@prisma/client'

declare module 'next-auth' {
  interface User {
    id: string // Changed from number to string
    email: string
    role: UserRole
    establishmentId?: number | null
  }

  interface Session {
    user: User & {
      id: string // Changed from number to string
      role: UserRole
      establishmentId?: number | null
    }
  }

  interface JWT {
    id: string // Changed from number to string
    role: UserRole
    establishmentId?: number | null
  }
}
