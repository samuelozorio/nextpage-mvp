"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Organization } from "@/types/organization";
import { useToast } from "@/components/ui/use-toast";

interface FirstAccessFormProps {
  organization: Organization;
  initialCpf?: string;
}

export function FirstAccessForm({
  organization,
  initialCpf,
}: FirstAccessFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    cpf: initialCpf || "",
    password: "",
    confirmPassword: "",
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

  const validateForm = () => {
    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Remover formatação do CPF
      const cleanCpf = formData.cpf.replace(/\D/g, "");

      const response = await fetch("/api/user/first-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cpf: cleanCpf,
          password: formData.password,
          organizationSlug: organization.slug,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Senha criada com sucesso!",
          description: "Agora você pode fazer login com suas credenciais.",
        });

        // Redirecionar para login
        router.push(`/${organization.slug}/login`);
      } else {
        setError(data.error || "Erro ao criar senha. Tente novamente.");
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
            <p className="text-xs text-gray-500">
              Digite o CPF que você recebeu pontos para resgatar
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Nova Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Digite sua nova senha"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              required
              minLength={6}
            />
            <p className="text-xs text-gray-500">Mínimo de 6 caracteres</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Digite novamente sua senha"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              required
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Criando conta..." : "Criar Senha"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
