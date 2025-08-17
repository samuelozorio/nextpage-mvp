import { useState, useEffect } from 'react';

interface Organization {
  id: string;
  name: string;
  cnpj: string;
  slug: string;
  logoUrl: string | null;
  loginImageUrl: string | null;
  coverHeroUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    users: number;
    ebooks: number;
  };
}

interface OrganizationsResponse {
  organizations: Organization[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface UseOrganizationsOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export function useOrganizations(options: UseOrganizationsOptions = {}) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [pagination, setPagination] = useState<OrganizationsResponse['pagination'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { page = 1, limit = 10, search = '', status = '' } = options;

  useEffect(() => {
    async function fetchOrganizations() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(search && { search }),
          ...(status && { status })
        });

        const response = await fetch(`/api/admin/organizations?${params}`);

        if (!response.ok) {
          throw new Error('Erro ao buscar organizações');
        }

        const data: OrganizationsResponse = await response.json();
        setOrganizations(data.organizations);
        setPagination(data.pagination);
      } catch (err) {
        console.error('Erro ao buscar organizações:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }

    fetchOrganizations();
  }, [page, limit, search, status]);

  return { organizations, pagination, loading, error };
}

// Hook para operações CRUD individuais
export function useOrganization() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrganization = async (data: {
    name: string;
    cnpj: string;
    slug: string;
    logoUrl?: string;
    loginImageUrl?: string;
    coverHeroUrl?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar organização');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateOrganization = async (id: string, data: Partial<{
    name: string;
    cnpj: string;
    slug: string;
    logoUrl: string;
    loginImageUrl: string;
    coverHeroUrl: string;
    isActive: boolean;
  }>) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/organizations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar organização');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteOrganization = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/organizations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao deletar organização');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getOrganization = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/organizations/${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar organização');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    getOrganization,
  };
}
