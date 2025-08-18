"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Upload,
  BookOpen,
  Users,
  Calendar,
  Loader2,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useEbooks } from "@/hooks/use-ebooks";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Ebook {
  id: string;
  title: string;
  author: string;
  description?: string;
  category?: string;
  coverImageUrl?: string;
  ebookFileUrl?: string;
  pointsCost: number;
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

export default function EbooksPage() {
  const router = useRouter();
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [allEbooks, setAllEbooks] = useState<Ebook[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { getEbooks, deleteEbook, uploadBatch, loading, error } = useEbooks();

  useEffect(() => {
    fetchEbooks();
  }, [pagination.page, searchTerm]);

  useEffect(() => {
    fetchAllEbooks();
  }, []);

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== "") {
        setPagination((prev) => ({ ...prev, page: 1 }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchEbooks = async () => {
    try {
      console.log("Iniciando busca de ebooks...");
      const data = await getEbooks(
        undefined,
        pagination.page,
        pagination.limit,
        searchTerm
      );
      console.log("Ebooks recebidos:", data);
      setEbooks(data.ebooks);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Erro ao buscar ebooks:", error);
    }
  };

  const fetchAllEbooks = async () => {
    try {
      const data = await getEbooks(undefined, 1, 1000, ""); // Buscar todos para estatísticas
      setAllEbooks(data.ebooks);
    } catch (error) {
      console.error("Erro ao buscar todos os ebooks:", error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.toLowerCase().endsWith(".zip")) {
      setSelectedFile(file);
    } else {
      alert("Por favor, selecione um arquivo ZIP");
    }
  };

  const handleUploadBatch = async () => {
    if (!selectedFile) {
      alert("Por favor, selecione um arquivo ZIP");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadBatch(selectedFile);
      alert(
        `Upload concluído! ${result.success} ebooks processados com sucesso.`
      );
      setSelectedFile(null);
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchEbooks(); // Recarregar lista
      fetchAllEbooks(); // Recarregar estatísticas
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro no upload em lote");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteEbook = async (id: string) => {
    if (confirm("Tem certeza que deseja deletar este ebook?")) {
      try {
        await deleteEbook(id);
        fetchEbooks(); // Recarregar lista
        fetchAllEbooks(); // Recarregar estatísticas
      } catch (error) {
        console.error("Erro ao deletar ebook:", error);
      }
    }
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Ebooks
          </h2>
          <p className="text-muted-foreground">
            Gerencie a biblioteca de ebooks do sistema
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/admin/ebooks/novo">
            <Button className="bg-white text-black hover:bg-gray-100">
              <Plus className="h-4 w-4 mr-2" />
              Novo Ebook
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-[#1a1a1a] border-[#283031]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Total de Ebooks
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {pagination.total}
            </div>
            <p className="text-xs text-muted-foreground">Ebooks cadastrados</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-[#283031]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Ebooks Ativos
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {allEbooks.filter((ebook) => ebook.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Disponível para resgate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-[#283031]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Total de Resgates
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {allEbooks.reduce(
                (total, ebook) => total + (ebook._count?.redemptions || 0),
                0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Resgates realizados</p>
          </CardContent>
        </Card>
      </div>

      {/* Upload em Lote */}
      <Card className="bg-[#1a1a1a] border-[#283031]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload em Lote
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Faça upload de múltiplos ebooks através de um arquivo ZIP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4 text-white">
            <Input
              type="file"
              accept=".zip"
              onChange={handleFileSelect}
              className="bg-[#0f0f0f] border-[#283031] text-white"
            />
            <Button
              onClick={handleUploadBatch}
              disabled={!selectedFile || uploading}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2 bg-primary border-white hover:bg-primary/90 text-white" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card className="bg-[#1a1a1a] border-[#283031]">
        <CardHeader>
          <CardTitle className="text-white">Lista de Ebooks</CardTitle>
          <CardDescription className="text-muted-foreground">
            Gerencie todos os ebooks cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, autor ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 bg-[#0f0f0f] border-[#283031] text-white"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {pagination.total > 0 && (
                <>
                  Mostrando {(pagination.page - 1) * pagination.limit + 1} a{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  de {pagination.total} ebooks
                </>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
              <span className="ml-2 text-white">Carregando ebooks...</span>
            </div>
          ) : (
            <div className="rounded-md border border-[#283031]">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#283031]">
                    <TableHead className="text-white">Capa</TableHead>
                    <TableHead className="text-white">Título</TableHead>
                    <TableHead className="text-white">Autor</TableHead>
                    <TableHead className="text-white">Categoria</TableHead>
                    <TableHead className="text-white">Pontos</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    <TableHead className="text-white">Resgates</TableHead>
                    <TableHead className="text-white">Criado em</TableHead>
                    <TableHead className="text-white">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ebooks.map((ebook) => (
                    <TableRow key={ebook.id} className="border-[#283031]">
                      <TableCell>
                        {ebook.coverImageUrl ? (
                          <img
                            src={ebook.coverImageUrl}
                            alt={ebook.title}
                            className="w-12 h-16 object-cover rounded border border-[#283031]"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-12 h-16 bg-[#0f0f0f] border border-[#283031] rounded flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-white font-medium">
                        {ebook.title}
                      </TableCell>
                      <TableCell className="text-white">
                        {ebook.author}
                      </TableCell>
                      <TableCell className="text-white">
                        {ebook.category || "-"}
                      </TableCell>
                      <TableCell className="text-white">
                        {ebook.pointsCost} pts
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={ebook.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {ebook.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">
                        {ebook._count?.redemptions || 0}
                      </TableCell>
                      <TableCell className="text-white">
                        {formatDate(ebook.createdAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-[#1a1a1a] border-[#283031]"
                          >
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/admin/ebooks/${ebook.id}`)
                              }
                              className="text-white hover:bg-[#0f0f0f]"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/admin/ebooks/${ebook.id}/editar`)
                              }
                              className="text-white hover:bg-[#0f0f0f]"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteEbook(ebook.id)}
                              className="text-red-400 hover:bg-[#0f0f0f]"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Deletar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {ebooks.length === 0 && !loading && (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Nenhum ebook encontrado para sua busca."
                  : "Nenhum ebook cadastrado ainda."}
              </p>
            </div>
          )}

          {/* Paginação */}
          {pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      size="default"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      className={
                        !pagination.hasPrevPage
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {/* Páginas */}
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  ).map((page) => {
                    // Mostrar apenas algumas páginas para não sobrecarregar
                    if (
                      page === 1 ||
                      page === pagination.totalPages ||
                      (page >= pagination.page - 1 &&
                        page <= pagination.page + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            size="icon"
                            onClick={() => handlePageChange(page)}
                            isActive={page === pagination.page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    } else if (
                      page === pagination.page - 2 ||
                      page === pagination.page + 2
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext
                      size="default"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      className={
                        !pagination.hasNextPage
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
