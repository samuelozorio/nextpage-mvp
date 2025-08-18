"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Loader2,
  Save,
  User,
  Mail,
  Award,
  Building,
} from "lucide-react";
import Link from "next/link";
import { useUsers } from "@/hooks/use-users";
import { useOrganizations } from "@/hooks/use-organizations";

interface User {
  id: string;
  email: string;
  fullName: string;
  cpf: string;
  points: number;
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

export default function EditarUsuarioPage() {
  const params = useParams();
  const router = useRouter();
  const { getUser, updateUser, loading, error } = useUsers();
  const { getOrganizations } = useOrganizations();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    cpf: "",
    password: "",
    confirmPassword: "",
    points: 0,
    isActive: true,
    organizationId: "",
  });

  useEffect(() => {
    if (params.id) {
      fetchUser();
      fetchOrganizations();
    }
  }, [params.id]);

  const fetchUser = async () => {
    try {
      const userData = await getUser(params.id as string);
      setUser(userData);
      setFormData({
        fullName: userData.fullName,
        email: userData.email,
        cpf: userData.cpf,
        password: "",
        confirmPassword: "",
        points: userData.points,
        isActive: userData.isActive,
        organizationId: userData.organizationId || "",
      });
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
    }
  };

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

    // Senha é opcional na edição, mas se fornecida deve ser válida
    if (formData.password && formData.password.length < 6) {
      errors.password = "Senha deve ter pelo menos 6 caracteres";
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
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
      const updateData: any = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        cpf: formData.cpf.trim(),
        points: formData.points,
        isActive: formData.isActive,
        organizationId: formData.organizationId || undefined,
      };

      // Incluir senha apenas se fornecida
      if (formData.password) {
        updateData.password = formData.password;
      }

      await updateUser(params.id as string, updateData);
      router.push(`/admin/usuarios/${params.id}`);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
    }
  };

  const handleInputChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpar erro do campo quando o usuário começar a digitar
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (loading && !user) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <span className="ml-2 text-white">Carregando usuário...</span>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="text-center py-8">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {error || "Usuário não encontrado"}
          </p>
          <Link href="/admin/usuarios">
            <Button className="mt-4">Voltar para Usuários</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-4">
          <Link href={`/admin/usuarios/${user.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Editar Usuário
            </h2>
            <p className="text-muted-foreground">
              Edite as informações do usuário {user.fullName}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card className="bg-[#1a1a1a] border-[#283031] max-w-2xl">
        <CardHeader>
          <CardTitle className="text-white">Informações do Usuário</CardTitle>
          <CardDescription className="text-muted-foreground">
            Atualize os dados do usuário
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

            {/* Senha (Opcional) */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Nova Senha (Opcional)
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="bg-[#0f0f0f] border-[#283031] text-white"
                placeholder="Deixe em branco para manter a senha atual"
              />
              {validationErrors.password && (
                <p className="text-sm text-red-400">
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Confirmar Senha (Opcional) */}
            {formData.password && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">
                  Confirmar Nova Senha
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  className="bg-[#0f0f0f] border-[#283031] text-white"
                  placeholder="Confirme a nova senha"
                />
                {validationErrors.confirmPassword && (
                  <p className="text-sm text-red-400">
                    {validationErrors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Pontos */}
            <div className="space-y-2">
              <Label htmlFor="points" className="text-white">
                Pontos
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

            {/* Status */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Status do Usuário</Label>
                <p className="text-sm text-muted-foreground">
                  {formData.isActive ? "Usuário ativo" : "Usuário inativo"}
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  handleInputChange("isActive", checked)
                }
              />
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
              <Link href={`/admin/usuarios/${user.id}`}>
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
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
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
