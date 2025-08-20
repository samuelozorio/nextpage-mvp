import { useState, useEffect } from "react";

export interface OrganizationData {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  cnpj: string;
  description: string;
  isActive?: boolean;
  createdAt: string;
  _count?: {
    users: number;
    ebooks: number;
  };
}

export interface OrganizationFormData {
  name: string;
  cnpj: string;
  slug: string;
  logoUrl?: string;
  loginImageUrl?: string;
  coverHeroUrl?: string;
  isActive?: boolean;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface OrganizationsResponse {
  organizations: OrganizationData[];
  pagination: PaginationInfo;
}

export function useOrganizations(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.search) searchParams.append('search', params.search);
      if (params?.status) searchParams.append('status', params.status);

      const url = `/api/admin/organizations${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Erro ao buscar organizações");
      }

      const data: OrganizationsResponse = await response.json();
      setOrganizations(data.organizations);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      console.error("Erro ao buscar organizações:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [params?.page, params?.limit, params?.search, params?.status]);

  return {
    organizations,
    pagination,
    isLoading,
    error,
    refetch: fetchOrganizations,
  };
}

export function useOrganization() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getOrganization = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/organizations/${id}`);

      if (!response.ok) {
        throw new Error("Erro ao buscar organização");
      }

      return await response.json();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      console.error("Erro ao buscar organização:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateOrganization = async (id: string, data: OrganizationFormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/organizations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar organização");
      }

      return await response.json();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      console.error("Erro ao atualizar organização:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async (data: OrganizationFormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar organização");
      }

      return await response.json();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      console.error("Erro ao criar organização:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteOrganization = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/organizations/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar organização");
      }

      return await response.json();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      console.error("Erro ao deletar organização:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    getOrganization,
    updateOrganization,
    createOrganization,
    deleteOrganization,
    loading,
    error,
  };
}
