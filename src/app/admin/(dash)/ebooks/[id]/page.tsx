"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
  Loader2,
  ArrowLeft,
  Edit,
  Download,
  BookOpen,
  Users,
  Calendar,
} from "lucide-react";
import { useEbooks } from "@/hooks/use-ebooks";
import Link from "next/link";
import { Label } from "@/components/ui/label";

interface Ebook {
  id: string;
  title: string;
  author: string;
  description?: string;
  category?: string;
  pointsCost: number;
  coverImageUrl?: string;
  ebookFileUrl?: string;
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

export default function VisualizarEbookPage() {
  const router = useRouter();
  const params = useParams();
  const { getEbook } = useEbooks();

  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchEbook();
    }
  }, [params.id]);

  const fetchEbook = async () => {
    try {
      const ebookData = await getEbook(params.id as string);
      setEbook(ebookData);
    } catch (error) {
      console.error("Erro ao buscar ebook:", error);
      alert("Erro ao carregar dados do ebook");
    } finally {
      setLoading(false);
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

  const handleDownload = () => {
    if (ebook?.ebookFileUrl) {
      window.open(ebook.ebookFileUrl, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <span className="ml-2 text-white">Carregando ebook...</span>
        </div>
      </div>
    );
  }

  if (!ebook) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Ebook não encontrado</p>
          <Link href="/admin/ebooks">
            <Button className="mt-4">Voltar para Ebooks</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <div className="flex items-center space-x-2">
            <Link href="/admin/ebooks">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-[#0f0f0f]"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            {ebook.title}
          </h2>
          <p className="text-muted-foreground">Detalhes do ebook</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href={`/admin/ebooks/${ebook.id}/editar`}>
            <Button className="bg-white text-black hover:bg-gray-100">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Informações Principais */}
        <div className="md:col-span-2 space-y-6">
          {/* Capa e Informações Básicas */}
          <Card className="bg-[#1a1a1a] border-[#283031]">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Capa */}
                <div className="flex-shrink-0">
                  {ebook.coverImageUrl ? (
                    <img
                      src={ebook.coverImageUrl}
                      alt={ebook.title}
                      className="w-48 h-64 object-cover rounded border border-[#283031]"
                    />
                  ) : (
                    <div className="w-48 h-64 bg-[#0f0f0f] border border-[#283031] rounded flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Informações */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {ebook.title}
                    </h3>
                    <p className="text-muted-foreground">por {ebook.author}</p>
                  </div>

                  {ebook.category && (
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Categoria
                      </Label>
                      <p className="text-white">{ebook.category}</p>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Pontos Necessários
                    </Label>
                    <p className="text-white font-semibold">
                      {ebook.pointsCost} pontos
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Status
                    </Label>
                    <Badge
                      variant={ebook.isActive ? "default" : "secondary"}
                      className="mt-1"
                    >
                      {ebook.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>

                  {ebook.ebookFileUrl && (
                    <Button
                      onClick={handleDownload}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar PDF
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Descrição */}
          {ebook.description && (
            <Card className="bg-[#1a1a1a] border-[#283031]">
              <CardHeader>
                <CardTitle className="text-white">Descrição</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white whitespace-pre-wrap">
                  {ebook.description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar com Estatísticas */}
        <div className="space-y-6">
          {/* Estatísticas */}
          <Card className="bg-[#1a1a1a] border-[#283031]">
            <CardHeader>
              <CardTitle className="text-white">Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-white">Resgates</span>
                </div>
                <span className="text-white font-semibold">
                  {ebook._count?.redemptions || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Sistema */}
          <Card className="bg-[#1a1a1a] border-[#283031]">
            <CardHeader>
              <CardTitle className="text-white">
                Informações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">
                  ID do Ebook
                </Label>
                <p className="text-white text-sm font-mono">{ebook.id}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">
                  Criado em
                </Label>
                <p className="text-white text-sm">
                  {formatDate(ebook.createdAt)}
                </p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">
                  Última atualização
                </Label>
                <p className="text-white text-sm">
                  {formatDate(ebook.updatedAt)}
                </p>
              </div>

              {ebook.organization && (
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Organização
                  </Label>
                  <p className="text-white text-sm">
                    {ebook.organization.name}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
