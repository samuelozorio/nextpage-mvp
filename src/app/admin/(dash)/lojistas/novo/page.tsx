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
import { Label } from "@/components/ui/label";

import { ArrowLeft, Loader2, Building } from "lucide-react";
import Link from "next/link";
import { useOrganization } from "@/hooks/use-organizations";
import { ImageUploadCreator } from "@/components/admin/lojistas/image-upload-creator";
import { uploadImage } from "@/lib/supabase";

export default function NovoLojistaPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    cnpj: "",
    slug: "",
    logoUrl: "",
    loginImageUrl: "",
    coverHeroUrl: "",
  });

  // Estados para arquivos selecionados
  const [selectedFiles, setSelectedFiles] = useState<{
    logo: File | null;
    loginImage: File | null;
    coverHero: File | null;
  }>({
    logo: null,
    loginImage: null,
    coverHero: null,
  });

  // Estados para previews
  const [previewUrls, setPreviewUrls] = useState<{
    logo: string | null;
    loginImage: string | null;
    coverHero: string | null;
  }>({
    logo: null,
    loginImage: null,
    coverHero: null,
  });

  const {
    createOrganization,
    loading: crudLoading,
    error: crudError,
  } = useOrganization();

  // Estado para mensagens de validação
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Função para selecionar arquivo
  const handleFileSelect = (
    field: "logo" | "loginImage" | "coverHero",
    file: File | null
  ) => {
    setSelectedFiles((prev) => ({ ...prev, [field]: file }));

    if (file) {
      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrls((prev) => ({
          ...prev,
          [field]: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      // Limpar preview
      setPreviewUrls((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleCreateOrganization = async () => {
    // Validar campos obrigatórios
    const errors: string[] = [];

    if (!formData.name.trim()) {
      errors.push("Nome da organização é obrigatório");
    }

    if (!formData.cnpj.trim()) {
      errors.push("CNPJ é obrigatório");
    }

    if (!formData.slug.trim()) {
      errors.push("Slug (URL) é obrigatório");
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);

    console.log("Iniciando criação da organização...");
    console.log("FormData:", formData);
    console.log("SelectedFiles:", selectedFiles);

    try {
      // Primeiro, fazer upload das imagens se houver arquivos selecionados
      const uploadPromises = [];
      const uploadResults: { [key: string]: string } = {};

      console.log("Verificando arquivos para upload...");

      // Upload do logo
      if (selectedFiles.logo) {
        console.log("Fazendo upload do logo...");
        uploadPromises.push(
          uploadImage(selectedFiles.logo, "logos").then((result) => {
            if (result.error)
              throw new Error(`Erro no upload do logo: ${result.error}`);
            uploadResults.logoUrl = result.url;
            console.log("Logo uploadado:", result.url);
          })
        );
      }

      // Upload da imagem de login
      if (selectedFiles.loginImage) {
        console.log("Fazendo upload da imagem de login...");
        uploadPromises.push(
          uploadImage(selectedFiles.loginImage, "login-images").then(
            (result) => {
              if (result.error)
                throw new Error(
                  `Erro no upload da imagem de login: ${result.error}`
                );
              uploadResults.loginImageUrl = result.url;
              console.log("Imagem de login uploadada:", result.url);
            }
          )
        );
      }

      // Upload da imagem de capa
      if (selectedFiles.coverHero) {
        console.log("Fazendo upload da imagem de capa...");
        uploadPromises.push(
          uploadImage(selectedFiles.coverHero, "cover-hero").then((result) => {
            if (result.error)
              throw new Error(
                `Erro no upload da imagem de capa: ${result.error}`
              );
            uploadResults.coverHeroUrl = result.url;
            console.log("Imagem de capa uploadada:", result.url);
          })
        );
      }

      // Aguardar todos os uploads
      if (uploadPromises.length > 0) {
        console.log("Aguardando uploads...");
        await Promise.all(uploadPromises);
      }

      // Criar organização com as URLs das imagens
      const organizationData = {
        ...formData,
        ...uploadResults,
      };

      console.log("Dados da organização para criar:", organizationData);
      console.log("Chamando createOrganization...");

      await createOrganization(organizationData);
      console.log("Organização criada com sucesso!");

      router.push("/admin/lojistas");
    } catch (error) {
      console.error("Erro ao criar organização:", error);
      alert(
        `Erro ao criar organização: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );
    }
  };

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
              Novo Lojista
            </h2>
            <p className="text-muted-foreground">
              Adicione uma nova organização ao sistema
            </p>
          </div>
        </div>
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
              Selecione as imagens da organização (upload será realizado ao
              salvar)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Logo */}
            <ImageUploadCreator
              imageType="logo"
              onFileSelect={(file) => handleFileSelect("logo", file)}
              selectedFile={selectedFiles.logo}
              previewUrl={previewUrls.logo}
            />

            <div className="border-t border-[#283031]"></div>

            {/* Imagem de Login */}
            <ImageUploadCreator
              imageType="loginImage"
              onFileSelect={(file) => handleFileSelect("loginImage", file)}
              selectedFile={selectedFiles.loginImage}
              previewUrl={previewUrls.loginImage}
            />

            <div className="border-t border-[#283031]"></div>

            {/* Imagem de Capa */}
            <ImageUploadCreator
              imageType="coverHero"
              onFileSelect={(file) => handleFileSelect("coverHero", file)}
              selectedFile={selectedFiles.coverHero}
              previewUrl={previewUrls.coverHero}
            />
          </CardContent>
        </Card>

        {/* Error Display */}
        {(crudError || validationErrors.length > 0) && (
          <Card className="bg-red-900/20 border-red-800">
            <CardContent className="pt-6">
              {crudError && (
                <p className="text-red-400 text-sm mb-2">
                  Erro ao criar organização: {crudError}
                </p>
              )}
              {validationErrors.length > 0 && (
                <div className="space-y-1">
                  <p className="text-red-400 text-sm font-medium">
                    Por favor, corrija os seguintes campos:
                  </p>
                  <ul className="text-red-400 text-sm list-disc list-inside">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3">
          <Link href="/admin/lojistas">
            <Button
              variant="outline"
              className="border-[#283031] text-white hover:bg-[#161d1d]"
            >
              Cancelar
            </Button>
          </Link>

          <Button
            onClick={handleCreateOrganization}
            disabled={crudLoading}
            className="bg-black hover:bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {crudLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Criando...
              </>
            ) : (
              "Criar Lojista"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
