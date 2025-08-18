import { useState } from "react";

interface Ebook {
  id: string;
  title: string;
  author: string;
  description?: string;
  category?: string;
  coverImageUrl?: string;
  ebookFileUrl?: string;
  pointsCost: number;
  isActive: boolean;
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
  _count?: {
    redemptions: number;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface EbooksResponse {
  ebooks: Ebook[];
  pagination: PaginationInfo;
}

interface CreateEbookData {
  title: string;
  author: string;
  description?: string;
  category?: string;
  coverImageUrl?: string;
  ebookFileUrl?: string;
  pointsCost?: number;
  organizationId?: string;
}

interface UpdateEbookData extends Partial<CreateEbookData> {}

export function useEbooks() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar todos os ebooks
  const getEbooks = async (
    organizationId?: string,
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<EbooksResponse> => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (organizationId) {
        params.append("organizationId", organizationId);
      }
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search) {
        params.append("search", search);
      }

      const url = `/api/admin/ebooks?${params}`;
      console.log("Fazendo requisição para:", url);

      const response = await fetch(url);

      console.log("Status da resposta:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        throw new Error("Erro ao buscar ebooks");
      }

      const data = await response.json();
      console.log("Dados recebidos no hook:", data);
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      console.error("Erro no hook getEbooks:", errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Buscar ebook por ID
  const getEbook = async (id: string): Promise<Ebook> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/ebooks/${id}`);

      if (!response.ok) {
        throw new Error("Erro ao buscar ebook");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Criar ebook
  const createEbook = async (ebookData: CreateEbookData): Promise<Ebook> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/ebooks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ebookData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar ebook");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar ebook
  const updateEbook = async (
    id: string,
    ebookData: UpdateEbookData
  ): Promise<Ebook> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/ebooks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ebookData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao atualizar ebook");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Deletar ebook
  const deleteEbook = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/ebooks/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao deletar ebook");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Upload em lote
  const uploadBatch = async (
    file: File,
    organizationId?: string
  ): Promise<{ success: number; errors: string[] }> => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (organizationId) {
        formData.append("organizationId", organizationId);
      }

      const response = await fetch("/api/admin/ebooks/upload-batch", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro no upload em lote");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getEbooks,
    getEbook,
    createEbook,
    updateEbook,
    deleteEbook,
    uploadBatch,
  };
}
