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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, Upload, X, FileText } from "lucide-react";
import { uploadImage } from "@/lib/supabase";
import { useEbooks } from "@/hooks/use-ebooks";
import Link from "next/link";

export default function NovoEbookPage() {
  const router = useRouter();
  const { createEbook } = useEbooks();

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    category: "",
    pointsCost: 1,
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);

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

  const handlePdfFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    } else if (file) {
      alert("Por favor, selecione um arquivo PDF válido.");
    }
  };

  const handleCreate = async () => {
    if (!pdfFile) {
      alert("Por favor, selecione um arquivo PDF.");
      return;
    }

    setCreating(true);
    try {
      let coverImageUrl = "";

      // Upload da capa se foi selecionada
      if (coverImage) {
        setUploading(true);
        const result = await uploadImage(coverImage, "ebook-covers");
        if (result.error) {
          throw new Error(result.error);
        }
        coverImageUrl = result.url;
        setUploading(false);
      }

      // Upload do PDF
      setUploading(true);
      const formDataPdf = new FormData();
      formDataPdf.append("file", pdfFile);
      formDataPdf.append("bucket", "ebooks");

      const response = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formDataPdf,
      });

      if (!response.ok) {
        throw new Error("Erro no upload do PDF");
      }

      const pdfResult = await response.json();
      setUploading(false);

      await createEbook({
        ...formData,
        coverImageUrl,
        ebookFileUrl: pdfResult.url,
      });

      router.push("/admin/ebooks");
    } catch (error) {
      console.error("Erro ao criar ebook:", error);
      alert("Erro ao criar ebook");
    } finally {
      setCreating(false);
    }
  };

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
            Criar Novo Ebook
          </h2>
          <p className="text-muted-foreground">
            Adicione um novo ebook à biblioteca
          </p>
        </div>
      </div>

      {/* Formulário */}
      <Card className="bg-[#1a1a1a] border-[#283031]">
        <CardHeader>
          <CardTitle className="text-white">Informações do Ebook</CardTitle>
          <CardDescription className="text-muted-foreground">
            Preencha os dados do novo ebook
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

          {/* Upload de Arquivo PDF */}
          <div>
            <Label className="text-white">Arquivo PDF *</Label>
            <div className="mt-2 space-y-4">
              {pdfFile && (
                <div className="flex items-center space-x-2 p-3 bg-[#0f0f0f] border border-[#283031] rounded">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span className="text-white">{pdfFile.name}</span>
                  <button
                    onClick={() => setPdfFile(null)}
                    className="ml-auto bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <Input
                type="file"
                accept=".pdf"
                onChange={handlePdfFileChange}
                className="bg-[#0f0f0f] border-[#283031] text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#283031] file:text-white hover:file:bg-[#3a4147]"
              />
            </div>
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
              onClick={handleCreate}
              disabled={
                creating ||
                uploading ||
                !formData.title ||
                !formData.author ||
                !pdfFile
              }
              className="bg-white text-black hover:bg-gray-100"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Ebook"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
