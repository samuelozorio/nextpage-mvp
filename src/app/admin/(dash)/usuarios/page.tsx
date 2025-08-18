"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Users,
  UserCheck,
  UserX,
  Loader2,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useUsers } from "@/hooks/use-users";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface User {
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

export default function UsuariosPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const { getUsers, deleteUser, loading, error } = useUsers();

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, searchTerm]);

  useEffect(() => {
    fetchAllUsers();
  }, []);

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== "") {
        setPagination((prev) => ({ ...prev, page: 1 }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchUsers = async () => {
    try {
      console.log("Iniciando busca de usuários...");
      const data = await getUsers(
        undefined,
        pagination.page,
        pagination.limit,
        searchTerm
      );
      console.log("Usuários recebidos:", data);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const data = await getUsers(undefined, 1, 1000, ""); // Buscar todos para estatísticas
      setAllUsers(data.users);
    } catch (error) {
      console.error("Erro ao buscar todos os usuários:", error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("Tem certeza que deseja deletar este usuário?")) {
      try {
        await deleteUser(id);
        fetchUsers(); // Recarregar lista
        fetchAllUsers(); // Recarregar estatísticas
      } catch (error) {
        console.error("Erro ao deletar usuário:", error);
      }
    }
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Usuários
          </h2>
          <p className="text-muted-foreground">
            Gerencie os usuários do sistema
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/admin/usuarios/novo">
            <Button className="bg-white text-black hover:bg-gray-100">
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-[#1a1a1a] border-[#283031]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Total de Usuários
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {pagination.total}
            </div>
            <p className="text-xs text-muted-foreground">
              Usuários cadastrados
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-[#283031]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Usuários Ativos
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {allUsers.filter((user) => user.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">Ativos no sistema</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-[#283031]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Usuários Inativos
            </CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {allUsers.filter((user) => !user.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">Desativados</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-[#283031]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Total de Resgates
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {allUsers.reduce(
                (total, user) => total + (user._count?.redemptions || 0),
                0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Resgates realizados</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="bg-[#1a1a1a] border-[#283031]">
        <CardHeader>
          <CardTitle className="text-white">Lista de Usuários</CardTitle>
          <CardDescription className="text-muted-foreground">
            Gerencie todos os usuários cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 bg-[#0f0f0f] border-[#283031] text-white"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {pagination.total > 0 && (
                <>
                  Mostrando {(pagination.page - 1) * pagination.limit + 1} a{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  de {pagination.total} usuários
                </>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
              <span className="ml-2 text-white">Carregando usuários...</span>
            </div>
          ) : (
            <div className="rounded-md border border-[#283031]">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#283031]">
                                         <TableHead className="text-white">Nome</TableHead>
                     <TableHead className="text-white">Email</TableHead>
                     <TableHead className="text-white">CPF</TableHead>
                     <TableHead className="text-white">Pontos</TableHead>
                     <TableHead className="text-white">Status</TableHead>
                     <TableHead className="text-white">Resgates</TableHead>
                     <TableHead className="text-white">Organização</TableHead>
                     <TableHead className="text-white">Criado em</TableHead>
                     <TableHead className="text-white">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="border-[#283031]">
                                             <TableCell className="text-white font-medium">
                         {user.fullName}
                       </TableCell>
                       <TableCell className="text-white">{user.email}</TableCell>
                       <TableCell className="text-white">{user.cpf}</TableCell>
                       <TableCell className="text-white">
                         {user.points} pts
                       </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {user.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">
                        {user._count?.redemptions || 0}
                      </TableCell>
                      <TableCell className="text-white">
                        {user.organization?.name || "-"}
                      </TableCell>
                      <TableCell className="text-white">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-[#1a1a1a] border-[#283031]"
                          >
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/admin/usuarios/${user.id}`)
                              }
                              className="text-white hover:bg-[#0f0f0f]"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/admin/usuarios/${user.id}/editar`)
                              }
                              className="text-white hover:bg-[#0f0f0f]"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-400 hover:bg-[#0f0f0f]"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Deletar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {users.length === 0 && !loading && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Nenhum usuário encontrado para sua busca."
                  : "Nenhum usuário cadastrado ainda."}
              </p>
            </div>
          )}

          {/* Paginação */}
          {pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      size="default"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      className={
                        !pagination.hasPrevPage
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {/* Páginas */}
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  ).map((page) => {
                    // Mostrar apenas algumas páginas para não sobrecarregar
                    if (
                      page === 1 ||
                      page === pagination.totalPages ||
                      (page >= pagination.page - 1 &&
                        page <= pagination.page + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            size="icon"
                            onClick={() => handlePageChange(page)}
                            isActive={page === pagination.page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    } else if (
                      page === pagination.page - 2 ||
                      page === pagination.page + 2
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext
                      size="default"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      className={
                        !pagination.hasNextPage
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
