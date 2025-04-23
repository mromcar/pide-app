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
        const user = await prisma.usuario.findUnique({
          where: { email: credentials!.email }
        })
        if (user && user.contrasena && await compare(credentials!.password, user.contrasena)) {
          return {
            id: user.id_usuario,
            email: user.email,
            rol: user.rol,
            id_establecimiento: user.id_establecimiento
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
        session.user.rol = token.rol
        session.user.id_establecimiento = token.id_establecimiento
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.rol = user.rol
        token.id_establecimiento = user.id_establecimiento
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

