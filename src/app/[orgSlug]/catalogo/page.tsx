"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  BookOpen,
  Star,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Download,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { OrganizationService } from "@/lib/services/organization.service";

interface Ebook {
  id: string;
  title: string;
  author: string;
  category: string;
  coverImageUrl: string;
  description: string;
  pointsRequired: number;
  isActive: boolean;
  createdAt: string;
  fileUrl?: string;
}

interface CatalogoPageProps {
  params: Promise<{
    orgSlug: string;
  }>;
}

export default function CatalogoPage({ params }: CatalogoPageProps) {
  const [orgSlug, setOrgSlug] = useState<string>("");
  const [isParamsLoaded, setIsParamsLoaded] = useState(false);
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recentes");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [organization, setOrganization] = useState<any>(null);
  const [organizationLoading, setOrganizationLoading] = useState(true);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [selectedEbook, setSelectedEbook] = useState<Ebook | null>(null);
  const [downloading, setDownloading] = useState(false);

  const itemsPerPage = 12;

  const { toast } = useToast();

  // Aguardar parâmetros dinâmicos
  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setOrgSlug(resolvedParams.orgSlug);
      setIsParamsLoaded(true);
    };
    loadParams();
  }, [params]);

  // Buscar informações da organização e pontos do usuário
  useEffect(() => {
    if (!isParamsLoaded || !orgSlug) return;

    const fetchOrganization = async () => {
      try {
        setOrganizationLoading(true);
        const organizationService = new OrganizationService();
        const data = await organizationService.findBySlug(orgSlug);
        if (data) {
          setOrganization(data);
        }
      } catch (error) {
        console.error("Erro ao buscar organização:", error);
      } finally {
        setOrganizationLoading(false);
      }
    };

    const fetchUserInfo = async () => {
      try {
        // Por enquanto, usar dados mockados
        setUserPoints(100); // Mock - depois será integrado com a sessão
      } catch (error) {
        console.error("Erro ao buscar informações do usuário:", error);
      }
    };

    fetchOrganization();
    fetchUserInfo();
  }, [orgSlug, isParamsLoaded]);

  // Buscar ebooks do banco de dados
  useEffect(() => {
    if (!isParamsLoaded || !orgSlug) return;

    const fetchEbooks = async () => {
      try {
        setLoading(true);
        // Por enquanto, usar dados mockados
        const mockEbooks: Ebook[] = [
          {
            id: "1",
            title: "O Guia Completo de Next.js",
            author: "João Silva",
            category: "Tecnologia",
            coverImageUrl: "/images/ebook-cover-1.jpg",
            description:
              "Um guia completo para aprender Next.js do zero ao avançado.",
            pointsRequired: 50,
            isActive: true,
            createdAt: new Date().toISOString(),
            fileUrl: "/ebooks/nextjs-guide.pdf",
          },
          {
            id: "2",
            title: "React para Iniciantes",
            author: "Maria Santos",
            category: "Programação",
            coverImageUrl: "/images/ebook-cover-2.jpg",
            description: "Aprenda React de forma simples e prática.",
            pointsRequired: 30,
            isActive: true,
            createdAt: new Date().toISOString(),
            fileUrl: "/ebooks/react-guide.pdf",
          },
        ];

        setEbooks(mockEbooks);
        setTotalPages(Math.ceil(mockEbooks.length / itemsPerPage));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    fetchEbooks();
  }, [orgSlug, isParamsLoaded, currentPage, searchTerm, sortBy]);

  // Função para abrir modal de download
  const handleDownloadClick = (ebook: Ebook) => {
    setSelectedEbook(ebook);
    setDownloadModalOpen(true);
  };

  // Função para confirmar download
  const handleDownloadConfirm = async () => {
    if (!selectedEbook || !organization?.id) return;

    setDownloading(true);
    try {
      // Mock do download
      toast({
        title: "Sucesso!",
        description: "Download iniciado com sucesso",
      });

      setDownloadModalOpen(false);
      setSelectedEbook(null);
    } catch (error) {
      console.error("Erro no download:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Erro ao baixar o arquivo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  // Função para mudar página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Filtrar ebooks baseado na busca
  const ebooksFiltrados = ebooks.filter((ebook) => {
    if (searchTerm) {
      return (
        ebook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ebook.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ebook.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true;
  });

  if (error) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Erro ao carregar catálogo
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen w-full">
      {/* Hero Section com imagem de capa */}
      <div className="relative w-full">
        <div className="relative h-96 md:h-[500px] lg:h-[600px] overflow-hidden w-full">
          {organizationLoading ? (
            // Loading state para a imagem de capa
            <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
              <Loader2 className="h-12 w-12 text-gray-400 animate-spin" />
            </div>
          ) : (
            <Image
              src={organization?.coverHeroUrl || "/images/login-paisagem.jpg"}
              alt={`Capa ${organization?.name || "Catálogo"}`}
              fill
              className="object-cover w-full h-full"
              priority
              sizes="100vw"
            />
          )}
          <div className="absolute inset-0 bg-opacity-40"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white"></div>
          </div>
        </div>
      </div>

      {/* Container que sobrepõe a imagem do hero */}
      <div className="relative -mt-24 max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-t-3xl shadow-lg min-h-screen">
          <div className="pt-4 pb-8 px-8">
            {/* Informações do usuário */}
            <div className="mb-6 flex items-center gap-4">
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Saldo: {userPoints}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                <BookOpen className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  Ebooks na biblioteca: 0
                </span>
              </div>
            </div>

            {/* Filtros */}
            <Card className="bg-white border border-gray-200 mb-8 shadow-sm">
              <CardContent className="pt-4 pb-4">
                <div className="flex gap-3">
                  <div className="relative flex-1 h-full">
                    <Input
                      placeholder="Buscar e-book..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <Button
                    type="button"
                    className="bg-black text-white hover:bg-gray-800 px-6"
                    onClick={() => {
                      // A busca já acontece automaticamente quando o usuário digita
                      // Este botão é apenas visual
                    }}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Pesquisar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Carregando ebooks...</span>
              </div>
            )}

            {/* Grid de e-books */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {ebooksFiltrados.map((ebook) => {
                  const hasEnoughPoints = userPoints >= ebook.pointsRequired;

                  return (
                    <Card
                      key={ebook.id}
                      className="bg-white border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-lg overflow-hidden group"
                    >
                      {/* Imagem do e-book */}
                      <div className="relative h-48 overflow-hidden">
                        {ebook.coverImageUrl ? (
                          <Image
                            src={ebook.coverImageUrl}
                            alt={ebook.title}
                            width={300}
                            height={200}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <BookOpen className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Conteúdo do card */}
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <CardTitle className="text-base font-semibold line-clamp-2 mb-1 text-gray-900">
                              {ebook.title}
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-600">
                              por {ebook.author}
                            </CardDescription>
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{ebook.category}</span>
                            <span>{ebook.pointsRequired} pontos</span>
                          </div>

                          <p className="text-sm text-gray-600 line-clamp-2">
                            {ebook.description}
                          </p>

                          {/* Botões em coluna - apenas 2 botões */}
                          <div className="flex flex-col gap-2">
                            {/* Botão Baixar */}
                            <Button
                              className="w-full"
                              size="sm"
                              disabled={!hasEnoughPoints || downloading}
                              onClick={() => handleDownloadClick(ebook)}
                            >
                              {downloading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4 mr-2" />
                              )}
                              {hasEnoughPoints
                                ? `Baixar`
                                : "Pontos insuficientes"}
                            </Button>

                            {/* Botão Visualizar */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full border-black text-black hover:bg-gray-100"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Visualizar
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl bg-white border border-black">
                                <DialogHeader className="border-b border-black pb-4">
                                  <DialogTitle className="text-xl text-black">
                                    {ebook.title}
                                  </DialogTitle>
                                  <DialogDescription className="text-black">
                                    por {ebook.author} • {ebook.category}
                                  </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-6 pt-4">
                                  {/* Imagem e informações principais */}
                                  <div className="flex gap-6">
                                    <div className="w-32 h-48 overflow-hidden rounded-lg flex-shrink-0 border border-black">
                                      {ebook.coverImageUrl ? (
                                        <Image
                                          src={ebook.coverImageUrl}
                                          alt={ebook.title}
                                          width={128}
                                          height={192}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                          <BookOpen className="h-8 w-8 text-gray-400" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 space-y-4">
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <span className="text-black/60">
                                            Categoria:
                                          </span>
                                          <p className="font-medium text-black">
                                            {ebook.category}
                                          </p>
                                        </div>
                                        <div>
                                          <span className="text-black/60">
                                            Data:
                                          </span>
                                          <p className="font-medium text-black">
                                            {new Date(
                                              ebook.createdAt
                                            ).toLocaleDateString("pt-BR")}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Descrição */}
                                  <div className="border-t border-black pt-4">
                                    <h4 className="font-semibold mb-2 text-black">
                                      Descrição
                                    </h4>
                                    <p className="text-sm text-black leading-relaxed">
                                      {ebook.description}
                                    </p>
                                  </div>

                                  {/* Botão de download no modal */}
                                  <div className="flex gap-2 border-t border-black pt-4">
                                    <Button
                                      className="flex-1 bg-black text-white hover:bg-gray-800"
                                      disabled={!hasEnoughPoints || downloading}
                                      onClick={() => {
                                        handleDownloadClick(ebook);
                                      }}
                                    >
                                      {downloading ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      ) : (
                                        <Download className="h-4 w-4 mr-2" />
                                      )}
                                      {hasEnoughPoints
                                        ? "Baixar"
                                        : "Pontos insuficientes"}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Paginação */}
            {!loading && totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center">
                <div className="flex items-center gap-2">
                  {/* Botão Anterior */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-black text-black hover:bg-gray-100 disabled:opacity-50"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>

                  {/* Números das páginas */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          size="sm"
                          className={`w-8 h-8 p-0 ${
                            page === currentPage
                              ? "bg-black text-white hover:bg-gray-800"
                              : "border-black bg-white text-black hover:bg-gray-100"
                          }`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    {totalPages > 5 && (
                      <>
                        <span className="text-black px-2">...</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-8 h-8 p-0 border-black text-black hover:bg-gray-100"
                          onClick={() => handlePageChange(totalPages)}
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Botão Próximo */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-black text-black hover:bg-gray-100"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Próximo
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* Estado vazio */}
            {!loading && ebooksFiltrados.length === 0 && (
              <Card className="bg-white border border-black">
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-black mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2 text-black">
                      Nenhum e-book encontrado
                    </h3>
                    <p className="text-black mb-4">
                      Tente ajustar os filtros ou buscar por outro termo
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmação de download */}
      {selectedEbook && (
        <Dialog open={downloadModalOpen} onOpenChange={setDownloadModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmar Download</DialogTitle>
              <DialogDescription>
                Você tem certeza que deseja baixar &quot;{selectedEbook.title}
                &quot;?
                <br />
                <strong>Custo: {selectedEbook.pointsRequired} pontos</strong>
                <br />
                <strong>Seu saldo: {userPoints} pontos</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setDownloadModalOpen(false)}
                disabled={downloading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDownloadConfirm}
                disabled={
                  downloading || userPoints < selectedEbook.pointsRequired
                }
              >
                {downloading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Baixando...
                  </>
                ) : (
                  "Confirmar Download"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
