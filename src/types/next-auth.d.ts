import 'next-auth'
import { UserRole } from './index'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    role: UserRole
    establishment_id?: number
  }

  interface Session {
    user: User & {
      id: string
      role: UserRole
      establishment_id?: number
    }
  }
}
