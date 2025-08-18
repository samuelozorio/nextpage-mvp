import { useState } from "react";

export interface User {
  id: string;
  email: string;
  fullName: string;
  cpf: string;
  points: number;
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

export interface CreateUserData {
  email: string;
  fullName: string;
  cpf: string;
  password: string;
  points?: number;
  organizationId?: string;
}

export interface UpdateUserData {
  email?: string;
  fullName?: string;
  cpf?: string;
  points?: number;
  isActive?: boolean;
  organizationId?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface UsersResponse {
  users: User[];
  pagination: PaginationInfo;
}

export function useUsers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Listar usuários com paginação e busca
  const getUsers = async (
    organizationId?: string,
    page: number = 1,
    limit: number = 10,
    search: string = ""
  ): Promise<UsersResponse> => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(organizationId && { organizationId }),
      });

      const url = `/api/admin/users?${params}`;
      console.log("Buscando usuários em:", url);

      const response = await fetch(url);

      console.log("Status da resposta:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        throw new Error("Erro ao buscar usuários");
      }

      const data = await response.json();
      console.log("Usuários recebidos no hook:", data);
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      console.error("Erro no hook getUsers:", errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Buscar usuário por ID
  const getUser = async (id: string): Promise<User> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${id}`);

      if (!response.ok) {
        throw new Error("Erro ao buscar usuário");
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

  // Criar usuário
  const createUser = async (userData: CreateUserData): Promise<User> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar usuário");
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

  // Atualizar usuário
  const updateUser = async (
    id: string,
    userData: UpdateUserData
  ): Promise<User> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao atualizar usuário");
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

  // Deletar usuário (soft delete)
  const deleteUser = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao deletar usuário");
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

  return {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    loading,
    error,
  };
}
