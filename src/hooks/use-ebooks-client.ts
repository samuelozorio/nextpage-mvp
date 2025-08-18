import { useState, useEffect } from "react";

export interface Ebook {
  id: string;
  title: string;
  author: string;
  category: string;
  coverImageUrl: string;
  description: string;
  pointsCost: number;
  isActive: boolean;
  createdAt: string;
  ebookFileUrl?: string;
  organizationId: string;
}

export interface EbooksResponse {
  ebooks: Ebook[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export function useEbooksClient(organizationId?: string) {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchEbooks = async (
    page: number = 1,
    limit: number = 12,
    search: string = ""
  ) => {
    if (!organizationId) {
      console.log("OrganizationId não fornecido");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        organizationId,
      });

      const url = `/api/admin/ebooks?${params}`;
      console.log("Buscando ebooks em:", url);

      const response = await fetch(url);
      
      console.log("Status da resposta:", response.status);
      
      if (!response.ok) {
        throw new Error("Erro ao buscar ebooks");
      }

      const data: EbooksResponse = await response.json();
      console.log("Ebooks recebidos:", data);
      
      setEbooks(data.ebooks);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      console.error("Erro ao buscar ebooks:", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    ebooks,
    loading,
    error,
    total,
    totalPages,
    fetchEbooks,
  };
}
