import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { UserService } from "@/lib/services/user.service";

const userService = new UserService();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        cpf: { label: "CPF", type: "text" },
        password: { label: "Senha", type: "password" },
        organizationSlug: { label: "Organização", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.cpf || !credentials?.password) {
          return null;
        }

        try {
          let user;

          // Se tem organizationSlug, autenticar por organização
          if (credentials.organizationSlug) {
            user = await userService.authenticateByOrganization(
              credentials.cpf,
              credentials.password,
              credentials.organizationSlug
            );
          } else {
            // Autenticação admin (sem organização)
            user = await userService.authenticate(
              credentials.cpf,
              credentials.password
            );
          }

          if (!user) {
            return null;
          }

          return {
            id: user.id,
            cpf: user.cpf,
            email: user.email || undefined,
            name: user.fullName || undefined,
            role: user.role,
            organizationId: user.organizationId || undefined,
            organization: user.organization
              ? {
                  id: user.organization.id,
                  name: user.organization.name,
                  slug: user.organization.slug,
                  logoUrl: user.organization.logoUrl || undefined,
                }
              : undefined,
            firstAccess: user.firstAccess,
            points: user.points,
          };
        } catch (error) {
          console.error("Erro na autenticação:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.cpf = user.cpf;
        token.role = user.role;
        token.organizationId = user.organizationId;
        token.organization = user.organization;
        token.firstAccess = user.firstAccess;
        token.points = user.points;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.cpf = token.cpf as string;
        session.user.role = token.role as string;
        session.user.organizationId = token.organizationId as string;
        session.user.organization = token.organization as any;
        session.user.firstAccess = token.firstAccess as boolean;
        session.user.points = token.points as number;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      cpf: string;
      email?: string;
      name?: string;
      role: string;
      organizationId?: string;
      organization?: {
        id: string;
        name: string;
        slug: string;
        logoUrl?: string;
      };
      firstAccess: boolean;
      points: number;
    };
  }

  interface User {
    id: string;
    cpf: string;
    email?: string;
    name?: string;
    role: string;
    organizationId?: string;
    organization?: {
      id: string;
      name: string;
      slug: string;
      logoUrl?: string;
    };
    firstAccess: boolean;
    points: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    cpf: string;
    role: string;
    organizationId?: string;
    organization?: {
      id: string;
      name: string;
      slug: string;
      logoUrl?: string;
    };
    firstAccess: boolean;
    points: number;
  }
}
