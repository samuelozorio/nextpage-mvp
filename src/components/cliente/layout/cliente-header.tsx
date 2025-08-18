"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, User, Coins, Loader2 } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { usePoints } from "@/contexts/points-context";


interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  coverHeroUrl?: string | null;
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
  points: number;
  organization?: Organization;
}

interface ClienteHeaderProps {
  orgSlug?: string;
}

export function ClienteHeader({ orgSlug }: ClienteHeaderProps) {
  const { data: session } = useSession();
  const { points, isLoading: pointsLoading } = usePoints();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [organizationLoading, setOrganizationLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Buscar informações da organização
  useEffect(() => {
    const fetchOrganization = async () => {
      if (!orgSlug && !userInfo?.organization) return;

      try {
        setOrganizationLoading(true);
        const orgSlugToUse = orgSlug || userInfo?.organization?.slug;
        if (!orgSlugToUse) return;

        console.log("Header - Buscando organização com slug:", orgSlugToUse);
        const response = await fetch(`/api/organizations/${orgSlugToUse}`);
        
        console.log("Header - Status da resposta:", response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log("Header - Organização recebida:", data);
          setOrganization(data);
        } else {
          console.error("Erro ao buscar organização:", response.statusText);
        }
      } catch (error) {
        console.error("Erro ao buscar organização:", error);
      } finally {
        setOrganizationLoading(false);
      }
    };

    fetchOrganization();
  }, [orgSlug, userInfo?.organization]);

  // Buscar informações do usuário
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!session?.user?.id) return;

      try {
        // Usar dados da sessão do NextAuth
        setUserInfo({
          id: session.user.id,
          name: session.user.name || "Usuário",
          email: session.user.email || "",
          points: points, // Usar pontos do contexto
          organization: session.user.organization
            ? {
                id: session.user.organization.id,
                name: session.user.organization.name,
                slug: session.user.organization.slug,
                logoUrl: session.user.organization.logoUrl,
              }
            : undefined,
        });
      } catch (error) {
        console.error("Erro ao buscar informações do usuário:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [session, points]); // Adicionar points como dependência

  const handleLogout = () => {
    const orgSlugToUse = orgSlug || userInfo?.organization?.slug || "";
    signOut({
      callbackUrl: orgSlugToUse ? `/${orgSlugToUse}/login` : "/login",
    });
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo da Organização */}
        <Link
          href={`/${orgSlug || userInfo?.organization?.slug || ""}/catalogo`}
          className="flex items-center"
        >
          {organizationLoading ? (
            // Loading state para a logo
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse mr-3"></div>
              <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ) : organization?.logoUrl ? (
            <>
              {console.log("Header - Exibindo logo:", organization.logoUrl)}
              <Image
                src={organization.logoUrl}
                alt={`Logo ${organization.name}`}
                width={120}
                height={40}
                className="h-10 w-auto object-contain"
                priority
              />
            </>
          ) : (
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">
                  {organization?.name?.charAt(0) || "O"}
                </span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                {organization?.name || "Organização"}
              </span>
            </div>
          )}
        </Link>

        {/* Menu de Navegação */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href={`/${orgSlug || userInfo?.organization?.slug || ""}/catalogo`}
            className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            Catálogo
          </Link>
          <Link
            href={`/${
              orgSlug || userInfo?.organization?.slug || ""
            }/biblioteca`}
            className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            Minha Biblioteca
          </Link>
        </nav>

        {/* Saldo e Avatar */}
        <div className="flex items-center space-x-4">
          {/* Saldo */}
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
            <Coins className="h-4 w-4 text-blue-600" />
            {pointsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            ) : (
              <span className="text-blue-800 font-medium text-sm">
                Saldo: {points} ebooks
              </span>
            )}
          </div>

          {/* Avatar com primeira letra do nome - Clicável */}
          <Link
            href={`/${orgSlug || userInfo?.organization?.slug || ""}/perfil`}
            className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {(userInfo?.name || session?.user?.name || "U")
                  .charAt(0)
                  .toUpperCase()}
              </span>
            </div>

            {/* Nome do usuário */}
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {userInfo?.name || session?.user?.name || "Usuário"}
              </p>
              <p className="text-xs text-gray-500">
                {userInfo?.email || session?.user?.email}
              </p>
            </div>
          </Link>

          {/* Botão Logout */}
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-700 hover:text-gray-900"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
