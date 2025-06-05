//src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { Session, User, AuthOptions } from "next-auth" // Import AuthOptions
import { JWT } from "next-auth/jwt"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"
import { UserRole } from "@prisma/client"

// Explicitly type authOptions
export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        if (user && user.password_hash && await compare(credentials.password, user.password_hash)) {
          return {
            id: user.user_id.toString(), // Convert number to string here
            email: user.email,
            role: user.role,
            establishment_id: user.establishment_id
          } // No 'as User' needed if next-auth.d.ts User expects string id
        }
        return null
      }
    })
  ],
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string // Explicitly cast to string
        session.user.role = token.role as UserRole
        session.user.establishment_id = token.establishment_id as number | null
      }
      return session
    },
    async jwt({ token, user }) { // Let TypeScript infer types here based on AuthOptions
      if (user) {
        token.id = user.id // user.id from authorize is now string
        token.role = user.role
        token.establishment_id = user.establishment_id
      }
      return token
    }
  },
  pages: {
    signIn: '/login'
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

