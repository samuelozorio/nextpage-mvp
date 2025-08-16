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
import { BookOpen, Download, Calendar, Loader2 } from "lucide-react";

interface BibliotecaPageProps {
  params: Promise<{
    orgSlug: string;
  }>;
}

export default function BibliotecaPage({ params }: BibliotecaPageProps) {
  const [orgSlug, setOrgSlug] = useState<string>("");
  const [isParamsLoaded, setIsParamsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  // Aguardar parâmetros dinâmicos
  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setOrgSlug(resolvedParams.orgSlug);
      setIsParamsLoaded(true);
      setLoading(false);
    };
    loadParams();
  }, [params]);

  if (loading) {
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

        {/* Estado vazio - por enquanto */}
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
      </div>
    </div>
  );
}
