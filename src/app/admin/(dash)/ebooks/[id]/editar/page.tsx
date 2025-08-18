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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, X } from "lucide-react";
import { uploadImage } from "@/lib/supabase";
import { useEbooks } from "@/hooks/use-ebooks";
import Link from "next/link";

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

export default function EditarEbookPage() {
  const router = useRouter();
  const params = useParams();
  const { getEbook, updateEbook } = useEbooks();

  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    category: "",
    pointsCost: 1,
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
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
      setFormData({
        title: ebookData.title || "",
        author: ebookData.author || "",
        description: ebookData.description || "",
        category: ebookData.category || "",
        pointsCost: ebookData.pointsCost || 1,
      });
      setCoverPreview(ebookData.coverImageUrl || "");
    } catch (error) {
      console.error("Erro ao buscar ebook:", error);
      alert("Erro ao carregar dados do ebook");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCoverImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!ebook) return;

    setSaving(true);
    try {
      let coverImageUrl = ebook.coverImageUrl;

      // Upload da nova imagem se foi selecionada
      if (coverImage) {
        setUploading(true);
        const result = await uploadImage(coverImage, "ebook-covers");
        if (result.error) {
          throw new Error(result.error);
        }
        coverImageUrl = result.url;
        setUploading(false);
      }

      await updateEbook(ebook.id, {
        ...formData,
        coverImageUrl,
      });

      router.push("/admin/ebooks");
    } catch (error) {
      console.error("Erro ao salvar ebook:", error);
      alert("Erro ao salvar ebook");
    } finally {
      setSaving(false);
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
            Editar Ebook
          </h2>
          <p className="text-muted-foreground">
            Atualize as informações do ebook
          </p>
        </div>
      </div>

      {/* Formulário */}
      <Card className="bg-[#1a1a1a] border-[#283031]">
        <CardHeader>
          <CardTitle className="text-white">Informações do Ebook</CardTitle>
          <CardDescription className="text-muted-foreground">
            Atualize os dados do ebook
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title" className="text-white">
                Título *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="bg-[#0f0f0f] border-[#283031] text-white"
                placeholder="Digite o título do ebook"
              />
            </div>
            <div>
              <Label htmlFor="author" className="text-white">
                Autor *
              </Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => handleInputChange("author", e.target.value)}
                className="bg-[#0f0f0f] border-[#283031] text-white"
                placeholder="Digite o nome do autor"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category" className="text-white">
              Categoria
            </Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              className="bg-[#0f0f0f] border-[#283031] text-white"
              placeholder="Ex: Tecnologia, Negócios, Ficção"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-white">
              Descrição
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="bg-[#0f0f0f] border-[#283031] text-white min-h-[100px]"
              placeholder="Descreva o conteúdo do ebook"
            />
          </div>

          <div>
            <Label htmlFor="pointsCost" className="text-white">
              Pontos Necessários
            </Label>
            <Input
              id="pointsCost"
              type="number"
              min="1"
              value={formData.pointsCost}
              onChange={(e) =>
                handleInputChange("pointsCost", parseInt(e.target.value) || 1)
              }
              className="bg-[#0f0f0f] border-[#283031] text-white"
            />
          </div>

          {/* Upload de Capa */}
          <div>
            <Label className="text-white">Capa do Ebook</Label>
            <div className="mt-2 space-y-4">
              {coverPreview && (
                <div className="relative inline-block">
                  <img
                    src={coverPreview}
                    alt="Capa do ebook"
                    className="w-32 h-40 object-cover rounded border border-[#283031]"
                  />
                  <button
                    onClick={() => {
                      setCoverImage(null);
                      setCoverPreview("");
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center space-x-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="bg-[#0f0f0f] border-[#283031] text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#283031] file:text-white hover:file:bg-[#3a4147]"
                />
                {uploading && (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                )}
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-6">
            <Link href="/admin/ebooks">
              <Button
                variant="outline"
                className="border-[#283031] text-white hover:bg-[#0f0f0f]"
              >
                Cancelar
              </Button>
            </Link>
            <Button
              onClick={handleSave}
              disabled={
                saving || uploading || !formData.title || !formData.author
              }
              className="bg-white text-black hover:bg-gray-100"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
