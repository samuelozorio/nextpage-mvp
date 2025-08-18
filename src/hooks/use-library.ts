import { useState, useEffect } from "react";

interface LibraryEbook {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  coverImageUrl: string;
  ebookFileUrl: string;
  pointsCost: number;
  createdAt: string;
  downloadedAt: string;
  pointsUsed: number;
}

interface LibraryResponse {
  success: boolean;
  library: LibraryEbook[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useLibrary() {
  const [library, setLibrary] = useState<LibraryEbook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const fetchLibrary = async (
    page: number = 1,
    limit: number = 12,
    search: string = ""
  ) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: search,
      });

      const response = await fetch(`/api/user/library?${params}`);

      if (!response.ok) {
        throw new Error("Erro ao carregar biblioteca");
      }

      const data: LibraryResponse = await response.json();

      setLibrary(data.library);
      setPagination(data.pagination);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      console.error("Erro ao buscar biblioteca:", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const downloadEbook = async (ebookId: string, organizationId: string) => {
    try {
      const response = await fetch(`/api/ebooks/${ebookId}/download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizationId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao processar download");
      }

      // Iniciar download do arquivo
      if (data.downloadUrl) {
        const link = document.createElement("a");
        link.href = data.downloadUrl;
        link.download = `ebook-${ebookId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      return data;
    } catch (error) {
      console.error("Erro no download:", error);
      throw error;
    }
  };

  return {
    library,
    loading,
    error,
    pagination,
    fetchLibrary,
    downloadEbook,
  };
}
