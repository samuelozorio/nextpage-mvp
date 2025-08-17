"use client";

import { useEffect, useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Edit,
  Building,
  Users,
  BookOpen,
  Calendar,
  Loader2,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useOrganization } from "@/hooks/use-organizations";
import { uploadImage } from "@/lib/supabase";

export default function DetalhesLojistaPage() {
  const params = useParams();
  const router = useRouter();
  const [organization, setOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  const {
    getOrganization,
    updateOrganization,
    loading: crudLoading,
    error: crudError,
  } = useOrganization();

  useEffect(() => {
    const fetchOrganization = async () => {
      if (params.id) {
        try {
          const data = await getOrganization(params.id as string);
          setOrganization(data);
        } catch (error) {
          console.error("Erro ao buscar organização:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrganization();
  }, [params.id]);

  // Função para upload de imagem
  const handleImageUpload = async (field: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setUploadingImage(field);

        // Determinar o bucket baseado no campo
        let bucket: "logos" | "login-images" | "cover-hero";
        switch (field) {
          case "logoUrl":
            bucket = "logos";
            break;
          case "loginImageUrl":
            bucket = "login-images";
            break;
          case "coverHeroUrl":
            bucket = "cover-hero";
            break;
          default:
            bucket = "logos";
        }

        try {
          // Fazer upload real para o Supabase
          const { url, error } = await uploadImage(file, bucket);

          if (error) {
            console.error("Erro no upload:", error);
            alert(`Erro ao fazer upload: ${error}`);
            return;
          }

          // Atualizar a organização com a nova imagem
          await updateOrganization(organization.id, {
            ...organization,
            [field]: url,
          });

          // Atualizar o estado local
          setOrganization((prev: any) => ({
            ...prev,
            [field]: url,
          }));
        } catch (error) {
          console.error("Erro ao atualizar organização:", error);
          alert("Erro ao atualizar organização");
        } finally {
          setUploadingImage(null);
        }
      }
    };
    input.click();
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <span className="ml-2 text-white">Carregando organização...</span>
        </div>
      </div>
    );
  }

  if (crudError || !organization) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-md">
          Erro ao carregar organização:{" "}
          {crudError || "Organização não encontrada"}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-4">
          <Link href="/admin/lojistas">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              {organization.name}
            </h2>
            <p className="text-muted-foreground">Detalhes da organização</p>
          </div>
        </div>
        <Link href={`/admin/lojistas/${organization.id}/editar`}>
          <Button className="bg-primary hover:bg-primary/90 text-white">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </Link>
      </div>

      {/* Content */}
      <div className="grid gap-6 w-full">
        {/* Informações Básicas */}
        <Card className="bg-[#1a1a1a] border-[#283031]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Building className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Nome da Organização
                </Label>
                <p className="text-white text-lg">{organization.name}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  CNPJ
                </Label>
                <p className="text-white text-lg">{organization.cnpj}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Slug (URL)
              </Label>
              <p className="text-white text-lg">{organization.slug}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Status
              </Label>
              <Badge
                variant={organization.isActive ? "default" : "secondary"}
                className="text-sm"
              >
                {organization.isActive ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <Card className="bg-[#1a1a1a] border-[#283031]">
          <CardHeader>
            <CardTitle className="text-white">Estatísticas</CardTitle>
            <CardDescription className="text-muted-foreground">
              Dados sobre usuários e ebooks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-[#0f0f0f] rounded-lg">
                <Users className="h-8 w-8 text-blue-400" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total de Usuários
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {organization._count?.users || 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-[#0f0f0f] rounded-lg">
                <BookOpen className="h-8 w-8 text-green-400" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total de Ebooks
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {organization._count?.ebooks || 0}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Datas */}
        <Card className="bg-[#1a1a1a] border-[#283031]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Informações de Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Criado em
                </Label>
                <p className="text-white">
                  {new Date(organization.createdAt).toLocaleDateString(
                    "pt-BR",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Última atualização
                </Label>
                <p className="text-white">
                  {new Date(organization.updatedAt).toLocaleDateString(
                    "pt-BR",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Imagens */}
        <Card className="bg-[#1a1a1a] border-[#283031]">
          <CardHeader>
            <CardTitle className="text-white">Imagens da Organização</CardTitle>
            <CardDescription className="text-muted-foreground">
              Logos e imagens personalizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Logo */}
              <div className="space-y-3 text-center">
                <Label className="text-sm font-medium text-muted-foreground">
                  Logo
                </Label>
                {organization.logoUrl ? (
                  <div className="space-y-3">
                    <img
                      src={organization.logoUrl}
                      alt="Logo da organização"
                      className="w-24 h-24 object-contain border border-[#283031] rounded mx-auto"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-24 h-24 border-2 border-dashed border-[#283031] rounded mx-auto flex items-center justify-center">
                      <span className="text-muted-foreground text-xs">
                        Sem logo
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Imagem de Login */}
              <div className="space-y-3 text-center">
                <Label className="text-sm font-medium text-muted-foreground">
                  Imagem de Login
                </Label>
                {organization.loginImageUrl ? (
                  <div className="space-y-3">
                    <img
                      src={organization.loginImageUrl}
                      alt="Imagem de login"
                      className="w-32 h-20 object-cover border border-[#283031] rounded mx-auto"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-32 h-20 border-2 border-dashed border-[#283031] rounded mx-auto flex items-center justify-center">
                      <span className="text-muted-foreground text-xs">
                        Sem imagem
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Imagem de Capa */}
              <div className="space-y-3 text-center">
                <Label className="text-sm font-medium text-muted-foreground">
                  Imagem de Capa
                </Label>
                {organization.coverHeroUrl ? (
                  <div className="space-y-3">
                    <img
                      src={organization.coverHeroUrl}
                      alt="Imagem de capa"
                      className="w-32 h-20 object-cover border border-[#283031] rounded mx-auto"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-32 h-20 border-2 border-dashed border-[#283031] rounded mx-auto flex items-center justify-center">
                      <span className="text-muted-foreground text-xs">
                        Sem imagem
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleImageUpload("coverHeroUrl")}
                      disabled={uploadingImage === "coverHeroUrl"}
                      className="w-full border-[#283031] text-white hover:bg-[#161d1d]"
                    >
                      {uploadingImage === "coverHeroUrl" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Adicionar Imagem
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3">
          <Link href="/admin/lojistas">
            <Button
              variant="outline"
              className="border-[#283031] text-white hover:bg-[#161d1d]"
            >
              Voltar
            </Button>
          </Link>
          <Link href={`/admin/lojistas/${organization.id}/editar`}>
            <Button
              variant="outline"
              className="border-[#283031] text-white hover:bg-[#161d1d]"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar Lojista
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
