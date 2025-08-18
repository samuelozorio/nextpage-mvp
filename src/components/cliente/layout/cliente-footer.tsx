"use client";

import { useState, useEffect } from "react";
import Image from "next/image";


interface ClienteFooterProps {
  orgSlug: string;
}

interface Organization {
  id: string;
  name: string;
  cnpj: string;
  logoUrl?: string | null;
}

export function ClienteFooter({ orgSlug }: ClienteFooterProps) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        setLoading(true);
        console.log("Footer - Buscando organização com slug:", orgSlug);
        const response = await fetch(`/api/organizations/${orgSlug}`);
        
        console.log("Footer - Status da resposta:", response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log("Footer - Organização recebida:", data);
          setOrganization(data);
        } else {
          console.error("Erro ao buscar organização:", response.statusText);
        }
      } catch (error) {
        console.error("Erro ao buscar organização:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [orgSlug]);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-36">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col items-center gap-6">
          {/* Logo da organização centralizada */}
          <div className="flex justify-center">
            {loading ? (
              <div className="w-72 h-16 bg-gray-200 rounded animate-pulse"></div>
            ) : organization?.logoUrl ? (
              <>
                {console.log("Footer - Exibindo logo:", organization.logoUrl)}
                <Image
                  src={organization.logoUrl}
                  alt={`Logo ${organization.name}`}
                  width={280}
                  height={80}
                  className="h-20 w-auto object-contain"
                  priority
                />
              </>
            ) : (
              <div className="flex items-center justify-center w-72 h-16 bg-gray-100 rounded">
                <span className="text-xl font-bold text-gray-600">
                  {organization?.name || "Organização"}
                </span>
              </div>
            )}
          </div>

          {/* Informações da organização em uma linha */}
          <div className="text-center">
            {loading ? (
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <p className="text-sm text-gray-600">
                © {currentYear} {organization?.name || "Organização"}
                {organization?.cnpj && ` • CNPJ: ${organization.cnpj}`}
                {" • Todos os direitos reservados"}
              </p>
            )}
          </div>

          {/* Powered by NextPage alinhado à direita */}
          <div className="flex items-center gap-2 text-xs text-gray-500 self-end">
            <span>Powered by</span>
            <Image
              src="/images/nextpage-logo.svg"
              alt="NextPage"
              width={80}
              height={20}
              className="h-5 w-auto"
              priority
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
