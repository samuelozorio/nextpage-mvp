"use client";

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
  MoreHorizontal,
  Edit,
  Eye,
  Upload,
  Image,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import Link from "next/link";

export default function LojistasPage() {
  // Dados mockados para demonstração
  const organizations = [
    {
      id: "1",
      name: "Livraria Exemplo",
      cnpj: "12.345.678/0001-90",
      slug: "livraria-exemplo",
      isActive: true,
      usersCount: 45,
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      name: "Stilo A",
      cnpj: "98.765.432/0001-10",
      slug: "stilo-a",
      isActive: true,
      usersCount: 23,
      createdAt: "2024-01-20",
    },
    {
      id: "3",
      name: "BookStore",
      cnpj: "11.222.333/0001-44",
      slug: "bookstore",
      isActive: false,
      usersCount: 12,
      createdAt: "2024-02-01",
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Lojistas
        </h2>
        <div className="flex items-center space-x-2">
          <Button className="bg-primary hover:bg-primary/90 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Nova Organização
          </Button>
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
              {organizations.length}
            </div>
            <p className="text-xs text-muted-foreground">+2 este mês</p>
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
              {organizations.filter((org) => org.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(
                (organizations.filter((org) => org.isActive).length /
                  organizations.length) *
                  100
              )}
              % do total
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
              {organizations.reduce((sum, org) => sum + org.usersCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">+15 este mês</p>
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
              {Math.round(
                organizations.reduce((sum, org) => sum + org.usersCount, 0) /
                  organizations.length
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
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar organizações..."
                className="pl-8 bg-[#0f0f0f] border-[#283031] text-white"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-[#283031] hover:bg-[#161d1d]">
                <TableHead className="text-white">Nome</TableHead>
                <TableHead className="text-white">CNPJ</TableHead>
                <TableHead className="text-white">Slug</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Usuários</TableHead>
                <TableHead className="text-white">Criado em</TableHead>
                <TableHead className="text-right text-white">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.map((organization) => (
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
                      variant={organization.isActive ? "default" : "secondary"}
                    >
                      {organization.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white">
                    {organization.usersCount}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(organization.createdAt).toLocaleDateString(
                      "pt-BR"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Upload className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Image className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
