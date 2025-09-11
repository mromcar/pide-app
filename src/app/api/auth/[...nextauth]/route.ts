import NextAuth, { AuthOptions, Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getLoginUrl } from "@/utils/auth";
import { UserRole } from '@/constants/enums'

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { establishment: true }
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.userId.toString(),
          email: user.email,
          role: user.role,
          establishmentId: user.establishmentId,
          name: user.name,
          image: null
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // ✅ 8 horas (turno de trabajo)
    updateAge: 1 * 60 * 60, // ✅ Renovar cada hora si activo
  },
  jwt: {
    maxAge: 8 * 60 * 60, // ✅ 8 horas (turno de trabajo)
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          });

          if (!existingUser) {
            // Crear nuevo usuario OAuth
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                googleId: account.providerAccountId,
                role: UserRole.client
              }
            });
          } else {
            // Actualizar usuario existente con Google ID si no lo tiene
            if (!existingUser.googleId) {
              await prisma.user.update({
                where: { userId: existingUser.userId },
                data: { googleId: account.providerAccountId }
              });
            }
          }
          return true;
        } catch (error) {
          console.error("Error during Google sign in:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }: { token: JWT; user?: User }) {
      // Solo buscar usuario en BD si es la primera vez (cuando user existe)
      if (user) {
        console.log('🔐 JWT Callback - First time, fetching user data')
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { establishment: true }
        });

        if (dbUser) {
          token.id = dbUser.userId.toString();
          token.role = dbUser.role;
          token.establishmentId = dbUser.establishmentId;
          token.name = dbUser.name;
          token.image = null;
          token.lastActivity = Date.now(); // ✅ Tracking de actividad

          console.log('✅ JWT Token created:', {
            id: token.id,
            role: token.role,
            establishmentId: token.establishmentId
          })
        }
      }
      // ✅ Actualizar última actividad en cada request
      token.lastActivity = Date.now();
      // En requests posteriores, el token ya tiene toda la info
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.establishmentId = token.establishmentId as number;
        session.user.name = token.name as string;
        session.user.image = token.image as string;

        console.log('✅ Session created:', {
          id: session.user.id,
          role: session.user.role,
          establishmentId: session.user.establishmentId
        })
      }
      return session;
    }
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 8 * 60 * 60, // ✅ 8 horas, consistente con session
      }
    }
  },
  pages: {
    signIn: getLoginUrl()
  },
  debug: process.env.NODE_ENV === 'development'
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

