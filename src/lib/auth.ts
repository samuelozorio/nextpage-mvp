import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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
        // Mock de autenticação para teste
        if (!credentials?.cpf || !credentials?.password) {
          return null;
        }

        // Admin master para teste
        if (
          credentials.cpf === "000.000.000-00" &&
          credentials.password === "admin123"
        ) {
          return {
            id: "1",
            cpf: "000.000.000-00",
            name: "Admin Master",
            role: "ADMIN_MASTER",
            firstAccess: false,
            points: 0,
          };
        }

        // Cliente de teste
        if (
          credentials.cpf === "123.456.789-01" &&
          credentials.password === "senha123"
        ) {
          return {
            id: "2",
            cpf: "123.456.789-01",
            name: "João Silva",
            role: "CLIENTE",
            organizationId: "1",
            organization: {
              id: "1",
              name: "Livraria Exemplo",
              slug: "livraria-exemplo",
              logoUrl: undefined,
            },
            firstAccess: false,
            points: 150,
          };
        }

        return null;
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
