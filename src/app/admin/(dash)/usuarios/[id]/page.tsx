"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  ArrowLeft,
  Edit,
  User,
  Mail,
  Calendar,
  Building,
  Award,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useUsers } from "@/hooks/use-users";

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

export default function VisualizarUsuarioPage() {
  const params = useParams();
  const router = useRouter();
  const { getUser, loading, error } = useUsers();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchUser();
    }
  }, [params.id]);

  const fetchUser = async () => {
    try {
      const userData = await getUser(params.id as string);
      setUser(userData);
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <span className="ml-2 text-white">Carregando usuário...</span>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="text-center py-8">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {error || "Usuário não encontrado"}
          </p>
          <Link href="/admin/usuarios">
            <Button className="mt-4">Voltar para Usuários</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-4">
          <Link href="/admin/usuarios">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Visualizar Usuário
            </h2>
            <p className="text-muted-foreground">
              Detalhes do usuário {user.fullName}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link href={`/admin/usuarios/${user.id}/editar`}>
            <Button className="bg-white text-black hover:bg-gray-100">
              <Edit className="h-4 w-4 mr-2" />
              Editar Usuário
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informações Básicas */}
        <Card className="bg-[#1a1a1a] border-[#283031]">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <User className="h-5 w-5 mr-2" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
                         <div className="flex items-center justify-between">
               <span className="text-muted-foreground">Nome:</span>
               <span className="text-white font-medium">{user.fullName}</span>
             </div>
             <div className="flex items-center justify-between">
               <span className="text-muted-foreground">Email:</span>
               <span className="text-white font-medium">{user.email}</span>
             </div>
             <div className="flex items-center justify-between">
               <span className="text-muted-foreground">CPF:</span>
               <span className="text-white font-medium">{user.cpf}</span>
             </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge
                variant={user.isActive ? "default" : "secondary"}
                className="text-xs"
              >
                {user.isActive ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pontos:</span>
              <span className="text-white font-medium flex items-center">
                <Award className="h-4 w-4 mr-1" />
                {user.points} pts
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Organização e Resgates */}
        <Card className="bg-[#1a1a1a] border-[#283031]">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Organização e Atividade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Organização:</span>
              <span className="text-white font-medium">
                {user.organization?.name || "Nenhuma"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total de Resgates:</span>
              <span className="text-white font-medium">
                {user._count?.redemptions || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Criado em:</span>
              <span className="text-white font-medium">
                {formatDate(user.createdAt)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Última atualização:</span>
              <span className="text-white font-medium">
                {formatDate(user.updatedAt)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações Adicionais */}
      <Card className="bg-[#1a1a1a] border-[#283031]">
        <CardHeader>
          <CardTitle className="text-white">Informações Adicionais</CardTitle>
          <CardDescription className="text-muted-foreground">
            Detalhes técnicos do usuário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="h-4 w-4 mr-2" />
                ID do Usuário
              </div>
              <p className="text-white font-mono text-sm">{user.id}</p>
            </div>
            {user.organizationId && (
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Building className="h-4 w-4 mr-2" />
                  ID da Organização
                </div>
                <p className="text-white font-mono text-sm">
                  {user.organizationId}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                Data de Criação
              </div>
              <p className="text-white text-sm">
                {new Date(user.createdAt).toLocaleString("pt-BR")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex justify-end space-x-4">
        <Link href="/admin/usuarios">
          <Button variant="outline">Voltar para Lista</Button>
        </Link>
        <Link href={`/admin/usuarios/${user.id}/editar`}>
          <Button className="bg-white text-black hover:bg-gray-100">
            <Edit className="h-4 w-4 mr-2" />
            Editar Usuário
          </Button>
        </Link>
      </div>
    </div>
  );
}
