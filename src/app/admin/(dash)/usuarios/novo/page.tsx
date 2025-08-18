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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useUsers } from "@/hooks/use-users";
import { useOrganizations } from "@/hooks/use-organizations";

export default function NovoUsuarioPage() {
  const router = useRouter();
  const { createUser, loading, error } = useUsers();
  const { getOrganizations } = useOrganizations();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    cpf: "",
    password: "",
    confirmPassword: "",
    points: 0,
    organizationId: "",
  });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const data = await getOrganizations();
      setOrganizations(data.organizations);
    } catch (error) {
      console.error("Erro ao buscar organizações:", error);
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      errors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email inválido";
    }

    if (!formData.cpf.trim()) {
      errors.cpf = "CPF é obrigatório";
    }

    if (!formData.password) {
      errors.password = "Senha é obrigatória";
    } else if (formData.password.length < 6) {
      errors.password = "Senha deve ter pelo menos 6 caracteres";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Senhas não coincidem";
    }

    if (formData.points < 0) {
      errors.points = "Pontos não podem ser negativos";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const userData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        cpf: formData.cpf.trim(),
        password: formData.password,
        points: formData.points,
        organizationId: formData.organizationId || undefined,
      };

      await createUser(userData);
      router.push("/admin/usuarios");
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpar erro do campo quando o usuário começar a digitar
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-4">
          <Link href="/admin/usuarios">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Novo Usuário
            </h2>
            <p className="text-muted-foreground">
              Cadastre um novo usuário no sistema
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card className="bg-[#1a1a1a] border-[#283031] max-w-2xl">
        <CardHeader>
          <CardTitle className="text-white">Informações do Usuário</CardTitle>
          <CardDescription className="text-muted-foreground">
            Preencha os dados do novo usuário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">
                Nome Completo *
              </Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                className="bg-[#0f0f0f] border-[#283031] text-white"
                placeholder="Digite o nome completo"
              />
              {validationErrors.fullName && (
                <p className="text-sm text-red-400">
                  {validationErrors.fullName}
                </p>
              )}
            </div>

                         {/* Email */}
             <div className="space-y-2">
               <Label htmlFor="email" className="text-white">
                 Email *
               </Label>
               <Input
                 id="email"
                 type="email"
                 value={formData.email}
                 onChange={(e) => handleInputChange("email", e.target.value)}
                 className="bg-[#0f0f0f] border-[#283031] text-white"
                 placeholder="Digite o email"
               />
               {validationErrors.email && (
                 <p className="text-sm text-red-400">{validationErrors.email}</p>
               )}
             </div>

             {/* CPF */}
             <div className="space-y-2">
               <Label htmlFor="cpf" className="text-white">
                 CPF *
               </Label>
               <Input
                 id="cpf"
                 type="text"
                 value={formData.cpf}
                 onChange={(e) => handleInputChange("cpf", e.target.value)}
                 className="bg-[#0f0f0f] border-[#283031] text-white"
                 placeholder="Digite o CPF"
               />
               {validationErrors.cpf && (
                 <p className="text-sm text-red-400">{validationErrors.cpf}</p>
               )}
             </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Senha *
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="bg-[#0f0f0f] border-[#283031] text-white"
                placeholder="Digite a senha"
              />
              {validationErrors.password && (
                <p className="text-sm text-red-400">
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">
                Confirmar Senha *
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                className="bg-[#0f0f0f] border-[#283031] text-white"
                placeholder="Confirme a senha"
              />
              {validationErrors.confirmPassword && (
                <p className="text-sm text-red-400">
                  {validationErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Pontos */}
            <div className="space-y-2">
              <Label htmlFor="points" className="text-white">
                Pontos Iniciais
              </Label>
              <Input
                id="points"
                type="number"
                min="0"
                value={formData.points}
                onChange={(e) =>
                  handleInputChange("points", parseInt(e.target.value) || 0)
                }
                className="bg-[#0f0f0f] border-[#283031] text-white"
                placeholder="0"
              />
              {validationErrors.points && (
                <p className="text-sm text-red-400">
                  {validationErrors.points}
                </p>
              )}
            </div>

            {/* Organização */}
            <div className="space-y-2">
              <Label htmlFor="organization" className="text-white">
                Organização (Opcional)
              </Label>
              <Select
                value={formData.organizationId}
                onValueChange={(value) =>
                  handleInputChange("organizationId", value)
                }
              >
                <SelectTrigger className="bg-[#0f0f0f] border-[#283031] text-white">
                  <SelectValue placeholder="Selecione uma organização" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#283031]">
                  <SelectItem value="">Nenhuma organização</SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Link href="/admin/usuarios">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                className="bg-white text-black hover:bg-gray-100"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Criar Usuário
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
