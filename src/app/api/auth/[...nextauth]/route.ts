import NextAuth, { AuthOptions, Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getLoginUrl } from "@/utils/auth";
import { UserRole } from '@/types/enums'

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

        if (!user || !user.password_hash) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.user_id.toString(),
          email: user.email,
          role: user.role,
          establishment_id: user.establishment_id,
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
    async signIn({ user, account, profile }) {
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
                google_id: account.providerAccountId,
                role: UserRole.CLIENT
              }
            });
          } else {
            // Actualizar usuario existente con Google ID si no lo tiene
            if (!existingUser.google_id) {
              await prisma.user.update({
                where: { user_id: existingUser.user_id },
                data: { google_id: account.providerAccountId }
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
    async jwt({ token, user, account }: { token: JWT; user?: User; account?: any }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { establishment: true }
        });

        if (dbUser) {
          token.id = dbUser.user_id.toString();
          token.role = dbUser.role;
          token.establishment_id = dbUser.establishment_id;
          token.name = dbUser.name;
          token.image = null;
        }
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        session.user.id = token.id as string;
        // In the session callback around line 117:
        session.user.role = token.role as UserRole;
        session.user.establishment_id = token.establishment_id as number;
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

