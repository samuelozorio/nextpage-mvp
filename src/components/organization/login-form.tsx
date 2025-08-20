"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Organization } from "@/types/organization";
import { useToast } from "@/components/ui/use-toast";

interface OrganizationLoginFormProps {
  organization: Organization;
}

export function OrganizationLoginForm({
  organization,
}: OrganizationLoginFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    cpf: "",
    password: "",
  });

  // Formatar CPF enquanto digita
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return value;
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setFormData((prev) => ({ ...prev, cpf: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Remover formatação do CPF
      const cleanCpf = formData.cpf.replace(/\D/g, "");

      const result = await signIn("credentials", {
        cpf: cleanCpf,
        password: formData.password,
        organizationSlug: organization.slug,
        redirect: false,
      });

      if (result?.error) {
        setError(
          "CPF ou senha incorretos. Verifique seus dados e tente novamente."
        );
        return;
      }

      if (result?.ok) {
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo de volta!`,
        });

        // Redirecionar para catálogo da organização
        router.push(`/${organization.slug}/catalogo`);
      }
    } catch (error) {
      setError("Erro interno do servidor. Tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-lg">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              type="text"
              placeholder="000.000.000-00"
              value={formData.cpf}
              onChange={handleCpfChange}
              maxLength={14}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Digite sua senha"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              required
            />
          </div>

          <Button
            type="submit"
            variant="outline"
            className="w-full text-white bg-black hover:bg-black/80 hover:text-white"
            disabled={isLoading}
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
