"use client";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BookOpen,
  Plus,
  Search,
  Upload,
  Edit,
  Eye,
  Download,
  Trash2,
} from "lucide-react";
import Link from "next/link";

export default function EbooksPage() {
  // Dados mockados para demonstração
  const ebooks = [
    {
      id: "1",
      title: "O Senhor dos Anéis",
      author: "J.R.R. Tolkien",
      points: 100,
      downloads: 234,
      isActive: true,
      createdAt: "2024-01-15",
      organization: "Livraria Exemplo",
    },
    {
      id: "2",
      title: "Harry Potter e a Pedra Filosofal",
      author: "J.K. Rowling",
      points: 80,
      downloads: 189,
      isActive: true,
      createdAt: "2024-01-20",
      organization: "Stilo A",
    },
    {
      id: "3",
      title: "1984",
      author: "George Orwell",
      points: 120,
      downloads: 156,
      isActive: false,
      createdAt: "2024-02-01",
      organization: "BookStore",
    },
    {
      id: "4",
      title: "Dom Casmurro",
      author: "Machado de Assis",
      points: 60,
      downloads: 98,
      isActive: true,
      createdAt: "2024-02-05",
      organization: "Livraria Exemplo",
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Gerenciar E-books
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="border-[#283031] text-white hover:bg-[#161d1d]"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload em Lote
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Novo E-book
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#1a1a1a] border-[#283031]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Total de E-books
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{ebooks.length}</div>
            <p className="text-xs text-muted-foreground">+5 este mês</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a1a] border-[#283031]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              E-books Ativos
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {ebooks.filter((ebook) => ebook.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(
                (ebooks.filter((ebook) => ebook.isActive).length /
                  ebooks.length) *
                  100
              )}
              % do total
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a1a] border-[#283031]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Total de Downloads
            </CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {ebooks.reduce((sum, ebook) => sum + ebook.downloads, 0)}
            </div>
            <p className="text-xs text-muted-foreground">+156 este mês</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a1a] border-[#283031]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Média de Pontos
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {Math.round(
                ebooks.reduce((sum, ebook) => sum + ebook.points, 0) /
                  ebooks.length
              )}
            </div>
            <p className="text-xs text-muted-foreground">pontos por ebook</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#1a1a1a] border-[#283031]">
        <CardHeader>
          <CardTitle className="text-white">E-books</CardTitle>
          <CardDescription className="text-muted-foreground">
            Gerencie todos os ebooks cadastrados no sistema
          </CardDescription>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar ebooks..."
                className="pl-8 bg-[#0f0f0f] border-[#283031] text-white"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-[#283031] hover:bg-[#161d1d]">
                <TableHead className="text-white">Título</TableHead>
                <TableHead className="text-white">Autor</TableHead>
                <TableHead className="text-white">Organização</TableHead>
                <TableHead className="text-white">Pontos</TableHead>
                <TableHead className="text-white">Downloads</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Criado em</TableHead>
                <TableHead className="text-right text-white">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ebooks.map((ebook) => (
                <TableRow
                  key={ebook.id}
                  className="border-[#283031] hover:bg-[#161d1d]"
                >
                  <TableCell className="font-medium text-white">
                    {ebook.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {ebook.author}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {ebook.organization}
                  </TableCell>
                  <TableCell className="text-white">{ebook.points}</TableCell>
                  <TableCell className="text-white">
                    {ebook.downloads}
                  </TableCell>
                  <TableCell>
                    <Badge variant={ebook.isActive ? "default" : "secondary"}>
                      {ebook.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(ebook.createdAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
