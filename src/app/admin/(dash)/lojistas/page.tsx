"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Building,
  Plus,
  Search,
  Edit,
  Eye,
  ToggleLeft,
  ToggleRight,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useOrganizations } from "@/hooks/use-organizations";

export default function LojistasPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const { organizations, pagination, loading, error } = useOrganizations({
    page: currentPage,
    limit: 10,
    search,
    status,
  });



  const totalOrganizations = pagination?.total || 0;
  const activeOrganizations = organizations.filter(
    (org) => org.isActive
  ).length;
  const totalUsers = organizations.reduce(
    (sum, org) => sum + org._count.users,
    0
  );
  const avgUsersPerOrg =
    organizations.length > 0
      ? Math.round(totalUsers / organizations.length)
      : 0;

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1); // Reset para primeira página ao buscar
  };

  const handleStatusFilter = (value: string) => {
    setStatus(value);
    setCurrentPage(1); // Reset para primeira página ao filtrar
  };

  const handleViewOrganization = (org: any) => {
    router.push(`/admin/lojistas/${org.id}`);
  };

  const handleEditClick = (org: any) => {
    router.push(`/admin/lojistas/${org.id}/editar`);
  };

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-md">
          Erro ao carregar organizações: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Lojistas
        </h2>
                 <div className="flex items-center space-x-2">
           <Link href="/admin/lojistas/novo">
             <Button className="border border-white text-white hover:bg-white hover:text-black transition-colors">
               <Plus className="mr-2 h-4 w-4" />
               Adicionar Lojista
             </Button>
           </Link>
         </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#1a1a1a] border-[#283031]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Total de Organizações
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                totalOrganizations
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {pagination?.total
                ? `${pagination.total} total`
                : "Carregando..."}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a1a] border-[#283031]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Organizações Ativas
            </CardTitle>
            <ToggleRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                activeOrganizations
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalOrganizations > 0
                ? `${Math.round(
                    (activeOrganizations / totalOrganizations) * 100
                  )}% do total`
                : "0% do total"}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a1a] border-[#283031]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Total de Usuários
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                totalUsers
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {organizations.length > 0
                ? `${totalUsers} usuários`
                : "0 usuários"}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a1a] border-[#283031]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Média por Organização
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                avgUsersPerOrg
              )}
            </div>
            <p className="text-xs text-muted-foreground">usuários por org</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#1a1a1a] border-[#283031]">
        <CardHeader>
          <CardTitle className="text-white">Organizações</CardTitle>
          <CardDescription className="text-muted-foreground">
            Gerencie todas as organizações cadastradas no sistema
          </CardDescription>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar organizações..."
                className="pl-8 bg-[#0f0f0f] border-[#283031] text-white"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={status === "active" ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  handleStatusFilter(status === "active" ? "" : "active")
                }
                className="border-[#283031] text-white hover:bg-[#161d1d]"
              >
                <ToggleRight className="mr-1 h-3 w-3" />
                Ativas
              </Button>
              <Button
                variant={status === "inactive" ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  handleStatusFilter(status === "inactive" ? "" : "inactive")
                }
                className="border-[#283031] text-white hover:bg-[#161d1d]"
              >
                <ToggleLeft className="mr-1 h-3 w-3" />
                Inativas
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
              <span className="ml-2 text-white">
                Carregando organizações...
              </span>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-[#283031] hover:bg-[#161d1d]">
                    <TableHead className="text-white">Nome</TableHead>
                    <TableHead className="text-white">CNPJ</TableHead>
                    <TableHead className="text-white">Slug</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    <TableHead className="text-white">Usuários</TableHead>
                    <TableHead className="text-white">Ebooks</TableHead>
                    <TableHead className="text-white">Criado em</TableHead>
                    <TableHead className="text-right text-white">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizations.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {search || status
                          ? "Nenhuma organização encontrada com os filtros aplicados"
                          : "Nenhuma organização cadastrada"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    organizations.map((organization) => (
                      <TableRow
                        key={organization.id}
                        className="border-[#283031] hover:bg-[#161d1d]"
                      >
                        <TableCell className="font-medium text-white">
                          {organization.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {organization.cnpj}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {organization.slug}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              organization.isActive ? "default" : "secondary"
                            }
                          >
                            {organization.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white">
                          {organization._count.users}
                        </TableCell>
                        <TableCell className="text-white">
                          {organization._count.ebooks}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(organization.createdAt).toLocaleDateString(
                            "pt-BR"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() =>
                                handleViewOrganization(organization)
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditClick(organization)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Paginação */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between space-x-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {(pagination.page - 1) * pagination.limit + 1} a{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{" "}
                    de {pagination.total} organizações
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                      className="border-[#283031] text-white hover:bg-[#161d1d]"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      Página {pagination.page} de {pagination.totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(pagination.page + 1)}
                      disabled={!pagination.hasNext}
                      className="border-[#283031] text-white hover:bg-[#161d1d]"
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
                 </CardContent>
       </Card>
     </div>
   );
 }
