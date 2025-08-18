"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Download,
  Calendar,
  Loader2,
  Search,
  Download as DownloadIcon,
} from "lucide-react";
import Image from "next/image";
import { useToast } from "@/components/ui/use-toast";
import { usePoints } from "@/contexts/points-context";

interface Ebook {
  id: string;
  title: string;
  author: string;
  description?: string;
  category?: string;
  coverImageUrl?: string;
  ebookFileUrl?: string;
  pointsCost: number;
  createdAt: string;
  downloadedAt: string;
  pointsUsed: number;
}

interface BibliotecaPageProps {
  params: Promise<{
    orgSlug: string;
  }>;
}

export default function BibliotecaPage({ params }: BibliotecaPageProps) {
  const [orgSlug, setOrgSlug] = useState<string>("");
  const [isParamsLoaded, setIsParamsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [library, setLibrary] = useState<Ebook[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);
  const { toast } = useToast();
  const { updatePoints } = usePoints();

  // Aguardar parâmetros dinâmicos
  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setOrgSlug(resolvedParams.orgSlug);
      setIsParamsLoaded(true);
    };
    loadParams();
  }, [params]);

  // Carregar biblioteca
  useEffect(() => {
    if (isParamsLoaded) {
      fetchLibrary();
    }
  }, [isParamsLoaded, searchTerm]);

  const fetchLibrary = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await fetch(`/api/user/library?${params}`);
      const data = await response.json();

      if (response.ok) {
        setLibrary(data.library || []);
      } else {
        console.error("Erro ao carregar biblioteca:", data.error);
        toast({
          title: "Erro",
          description: "Erro ao carregar biblioteca",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar biblioteca:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar biblioteca",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (ebook: Ebook) => {
    if (downloading) return;

    setDownloading(ebook.id);
    try {
      // Primeiro, processar o download (debitar pontos)
      const downloadResult = await fetch("/api/ebooks/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ebookId: ebook.id,
          organizationId: orgSlug, // Usar orgSlug como organizationId
          pointsCost: ebook.pointsCost,
        }),
      });

      if (!downloadResult.ok) {
        const errorData = await downloadResult.json();
        throw new Error(errorData.error || "Erro ao processar download");
      }

      // Atualizar pontos no header
      await updatePoints();

      // Depois, fazer o download do arquivo
      const fileResponse = await fetch("/api/download-ebook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: ebook.ebookFileUrl,
          title: ebook.title,
          ebookId: ebook.id,
        }),
      });

      if (!fileResponse.ok) {
        throw new Error("Erro ao baixar arquivo");
      }

      const blob = await fileResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${ebook.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Sucesso!",
        description: "Download realizado com sucesso!",
      });

      // Recarregar biblioteca para mostrar o novo download
      fetchLibrary();
    } catch (error) {
      console.error("Erro no download:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao baixar o arquivo",
        variant: "destructive",
      });
    } finally {
      setDownloading(null);
    }
  };

  if (loading && library.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando biblioteca...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Minha Biblioteca
          </h1>
          <p className="text-gray-600">
            Aqui estão todos os ebooks que você resgatou
          </p>
        </div>

        {/* Barra de busca */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar na biblioteca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-200"
            />
          </div>
        </div>

        {library.length === 0 ? (
          <Card className="bg-white border border-gray-200">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  Sua biblioteca está vazia
                </h3>
                <p className="text-gray-600 mb-4">
                  Você ainda não resgatou nenhum ebook. Visite o catálogo para
                  começar!
                </p>
                <Button asChild>
                  <a href={`/${orgSlug}/catalogo`}>Ir para o Catálogo</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {library.map((ebook) => (
              <Card
                key={ebook.id}
                className="bg-white border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="aspect-[3/4] relative mb-3 bg-gray-100 rounded-lg overflow-hidden">
                    {ebook.coverImageUrl ? (
                      <Image
                        src={ebook.coverImageUrl}
                        alt={ebook.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <BookOpen className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {ebook.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    por {ebook.author}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  {ebook.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                      {ebook.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>
                        Baixado em{" "}
                        {new Date(ebook.downloadedAt).toLocaleDateString(
                          "pt-BR"
                        )}
                      </span>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {ebook.pointsUsed} ponto{ebook.pointsUsed > 1 ? "s" : ""}
                    </span>
                  </div>

                  <Button
                    onClick={() => handleDownload(ebook)}
                    disabled={downloading === ebook.id}
                    className="w-full bg-black hover:bg-gray-800 text-white"
                  >
                    {downloading === ebook.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <DownloadIcon className="h-4 w-4 mr-2" />
                    )}
                    {downloading === ebook.id
                      ? "Baixando..."
                      : "Baixar Novamente"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
