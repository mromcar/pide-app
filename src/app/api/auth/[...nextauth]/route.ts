//src/app/api/auth/[...nextauth]/route.ts


/*
import NextAuth from 'next-auth';
import authOptions from '@/lib/authOptions';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
*/


import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import { compare } from "bcryptjs"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials!.email }
        })
        if (user && user.password_hash && await compare(credentials!.password, user.password_hash)) {
          return {
            id: user.user_id,
            email: user.email,
            role: user.role,
            establishment_id: user.establishment_id
          }
        }
        return null
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id || token.sub
        session.user.role = token.role
        session.user.establishment_id = token.establishment_id
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
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

