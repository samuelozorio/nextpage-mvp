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
import { Label } from "@/components/ui/label";
import { User, Mail, Calendar, Coins, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

interface PerfilPageProps {
  params: Promise<{
    orgSlug: string;
  }>;
}

export default function PerfilPage({ params }: PerfilPageProps) {
  const { data: session } = useSession();
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
          <p className="text-gray-600">Gerencie suas informações pessoais</p>
        </div>

        <div className="flex flex-col gap-8">
          {/* Informações Pessoais */}
          <Card className="bg-white border border-gray-200 w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>
                Suas informações básicas de cadastro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={session?.user?.name || "Usuário"}
                  disabled
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  value={session?.user?.email || "usuario@exemplo.com"}
                  disabled
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={session?.user?.cpf || "000.000.000-00"}
                  disabled
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações */}
        <div className="mt-8">
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle>Ações</CardTitle>
              <CardDescription>
                Opções disponíveis para sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button variant="outline" disabled>
                  Alterar Senha
                </Button>
                <Button variant="outline" disabled>
                  Editar Perfil
                </Button>
                <Button variant="outline" asChild>
                  <a href={`/${orgSlug}/catalogo`}>Voltar ao Catálogo</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
