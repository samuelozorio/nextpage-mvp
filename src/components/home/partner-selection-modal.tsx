"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Building2, ArrowRight, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOrganizations, OrganizationData } from "@/hooks/use-organizations";
import Image from "next/image";

interface PartnerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PartnerSelectionModal({
  isOpen,
  onClose,
}: PartnerSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOrganizations, setFilteredOrganizations] = useState<
    OrganizationData[]
  >([]);
  const { organizations, isLoading, error } = useOrganizations();
  const router = useRouter();

  // Filtrar organizações baseado no termo de busca
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredOrganizations(organizations);
    } else {
      const filtered = organizations.filter(
        (org) =>
          org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          org.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOrganizations(filtered);
    }
  }, [searchTerm, organizations]);

  const handlePartnerSelect = (organization: OrganizationData) => {
    router.push(`/${organization.slug}/login`);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay de fundo */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal customizado */}
          <div className="relative max-w-6xl h-[680px] overflow-hidden bg-black border-0 rounded-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
              {/* Lado esquerdo - Imagem (apenas desktop) */}
              <div className="hidden lg:block relative modal-image-container">
                <Image
                  src="/images/pesquisa.jpg"
                  alt="Pesquisa de parceiros"
                  fill
                  className="object-cover rounded-l-2xl"
                />
                {/* Overlay escuro para melhorar legibilidade do texto */}
                <div className="absolute inset-0 bg-black/30 rounded-l-2xl" />
              </div>

              {/* Lado direito - Conteúdo principal */}
              <div className="p-8 lg:p-12 bg-black text-white flex flex-col rounded-r-2xl">
                {/* Header do modal */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      Escolha seu parceiro
                    </h2>
                    <p className="text-gray-300 text-lg">
                      Selecione onde você possui uma conta para fazer login
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-10 w-10 p-0 text-white hover:bg-white/10"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Barra de busca */}
                <div className="relative mb-8">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
                  <Input
                    type="text"
                    placeholder="Buscar por nome do parceiro..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 text-lg border-2 border-gray-700 bg-gray-900 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl"
                  />
                </div>

                {/* Lista de parceiros com scrollbar estilizada */}
                <div className="flex-1 overflow-y-auto max-h-[280px] pr-2 custom-scrollbar">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                    </div>
                  ) : error ? (
                    <div className="text-center py-12">
                      <div className="mx-auto h-16 w-16 text-red-500 mb-4">
                        <X className="h-16 w-16" />
                      </div>
                      <p className="text-red-400 text-xl mb-2">
                        Erro ao carregar parceiros
                      </p>
                      <p className="text-gray-400 text-sm">{error}</p>
                    </div>
                  ) : filteredOrganizations.length === 0 ? (
                    <div className="text-center py-12">
                      <Building2 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                      <p className="text-gray-500 text-xl">
                        {searchTerm
                          ? "Nenhum parceiro encontrado"
                          : "Nenhum parceiro disponível"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredOrganizations.map((org) => (
                        <div
                          key={org.id}
                          onClick={() => handlePartnerSelect(org)}
                          className="group cursor-pointer p-6 rounded-xl border-2 border-gray-800 hover:border-blue-500 hover:bg-gray-900/50 transition-all duration-300 backdrop-blur-sm"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                                {org.logoUrl ? (
                                  <Image
                                    src={org.logoUrl}
                                    alt={org.name}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-contain p-2"
                                  />
                                ) : (
                                  <Building2 className="h-10 w-10 text-white" />
                                )}
                              </div>
                              <div>
                                <h3 className="font-semibold text-white text-xl group-hover:text-blue-400 transition-colors">
                                  {org.name}
                                </h3>
                                {org.description && (
                                  <p className="text-gray-300 text-base">
                                    {org.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <ArrowRight className="h-6 w-6 text-gray-500 group-hover:text-blue-400 group-hover:translate-x-2 transition-all duration-300" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Botão de fechar */}
                <div className="pt-6 border-t border-gray-800 mt-6">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="w-full h-14 text-lg border-gray-700 text-white hover:bg-gray-800 hover:border-gray-600 rounded-xl"
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </div>

            {/* Estilos CSS para a scrollbar personalizada */}
            <style
              dangerouslySetInnerHTML={{
                __html: `
                  .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                  }
                  
                  .custom-scrollbar::-webkit-scrollbar-track {
                    background: #1f1f1f;
                    border-radius: 4px;
                  }
                  
                  .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    border-radius: 4px;
                    border: 1px solid #374151;
                  }
                  
                  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(135deg, #2563eb, #7c3aed);
                  }
                  
                  .custom-scrollbar::-webkit-scrollbar-corner {
                    background: #1f1f1f;
                  }
                  
                  /* Para Firefox */
                  .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: #3b82f6 #1f1f1f;
                  }

                  /* Garantir que a imagem ocupe completamente as extremidades */
                  .modal-image-container {
                    margin: 0 !important;
                    padding: 0 !important;
                    border: none !important;
                  }
                `,
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
