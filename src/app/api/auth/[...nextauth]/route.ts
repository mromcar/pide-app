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
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
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
      if (user) {
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
        }
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.establishmentId = token.establishmentId as number;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
      }
      return session;
    }
  },
  pages: {
    signIn: getLoginUrl()
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

