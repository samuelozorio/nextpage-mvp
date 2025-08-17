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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Building, Save } from "lucide-react";
import Link from "next/link";
import { useOrganization } from "@/hooks/use-organizations";
import { ImageManager } from "@/components/admin/lojistas/image-manager";

export default function EditarLojistaPage() {
  const params = useParams();
  const router = useRouter();
  const [organization, setOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    cnpj: "",
    slug: "",
    logoUrl: "",
    loginImageUrl: "",
    coverHeroUrl: "",
  });

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
          setFormData({
            name: data.name,
            cnpj: data.cnpj,
            slug: data.slug,
            logoUrl: data.logoUrl || "",
            loginImageUrl: data.loginImageUrl || "",
            coverHeroUrl: data.coverHeroUrl || "",
          });
        } catch (error) {
          console.error("Erro ao buscar organização:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrganization();
  }, [params.id]);

  // Função para atualizar imagem após upload
  const handleImageUpdate = (field: string, imageUrl: string) => {
    setFormData((prev) => ({ ...prev, [field]: imageUrl }));
    // Atualizar também o estado da organização para refletir imediatamente
    setOrganization((prev: any) =>
      prev ? { ...prev, [field]: imageUrl } : null
    );
  };

  const handleUpdateOrganization = async () => {
    try {
      await updateOrganization(params.id as string, formData);
      router.push(`/admin/lojistas/${params.id}`);
    } catch (error) {
      console.error("Erro ao atualizar organização:", error);
    }
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
          <Link href={`/admin/lojistas/${organization.id}`}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Editar {organization.name}
            </h2>
            <p className="text-muted-foreground">
              Modifique os dados da organização
            </p>
          </div>
        </div>
        <Badge
          variant={organization.isActive ? "default" : "secondary"}
          className="text-sm"
        >
          {organization.isActive ? "Ativo" : "Inativo"}
        </Badge>
      </div>

      {/* Form */}
      <div className="grid gap-6 w-full">
        <Card className="bg-[#1a1a1a] border-[#283031]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Building className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Dados principais da organização
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Organização *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="bg-[#0f0f0f] border-[#283031] text-white"
                  placeholder="Digite o nome da organização"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) =>
                    setFormData({ ...formData, cnpj: e.target.value })
                  }
                  className="bg-[#0f0f0f] border-[#283031] text-white"
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL) *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                className="bg-[#0f0f0f] border-[#283031] text-white"
                placeholder="nome-da-organizacao"
              />
              <p className="text-xs text-muted-foreground">
                URL única para acessar a plataforma da organização
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-[#283031]">
          <CardHeader>
            <CardTitle className="text-white">Imagens da Organização</CardTitle>
            <CardDescription className="text-muted-foreground">
              Gerencie as imagens da organização
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Logo */}
            <ImageManager
              organizationId={organization.id}
              imageType="logo"
              currentImageUrl={formData.logoUrl}
              organizationName={organization.name}
              onImageUpdate={(imageUrl) =>
                handleImageUpdate("logoUrl", imageUrl)
              }
            />

            <div className="border-t border-[#283031]"></div>

            {/* Imagem de Login */}
            <ImageManager
              organizationId={organization.id}
              imageType="loginImage"
              currentImageUrl={formData.loginImageUrl}
              organizationName={organization.name}
              onImageUpdate={(imageUrl) =>
                handleImageUpdate("loginImageUrl", imageUrl)
              }
            />

            <div className="border-t border-[#283031]"></div>

            {/* Imagem de Capa */}
            <ImageManager
              organizationId={organization.id}
              imageType="coverHero"
              currentImageUrl={formData.coverHeroUrl}
              organizationName={organization.name}
              onImageUpdate={(imageUrl) =>
                handleImageUpdate("coverHeroUrl", imageUrl)
              }
            />
          </CardContent>
        </Card>

        {/* Error Display */}
        {crudError && (
          <Card className="bg-red-900/20 border-red-800">
            <CardContent className="pt-6">
              <p className="text-red-400 text-sm">
                Erro ao atualizar organização: {crudError}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3">
          <Link href={`/admin/lojistas/${organization.id}`}>
            <Button
              variant="outline"
              className="border-[#283031] text-white hover:bg-[#161d1d]"
            >
              Cancelar
            </Button>
          </Link>
          <Button
            onClick={handleUpdateOrganization}
            disabled={
              crudLoading || !formData.name || !formData.cnpj || !formData.slug
            }
            className="bg-black hover:bg-gray-800 text-white"
          >
            {crudLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
