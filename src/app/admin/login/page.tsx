"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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

      console.log("🚀 Iniciando login...");
      const result = await signIn("credentials", {
        cpf: cleanCpf,
        password: formData.password,
        // Admin não precisa de organizationSlug
        redirect: false,
      });

      console.log("📊 Resultado do login:", result);

      if (result?.error) {
        console.log("❌ Erro no login:", result.error);
        setError(
          "CPF ou senha incorretos. Verifique seus dados e tente novamente."
        );
        return;
      }

      if (result?.ok) {
        console.log("✅ Login bem-sucedido, redirecionando...");
        // Redirecionar para o dashboard do admin
        try {
          await router.push("/admin/dashboard");
          console.log("🔄 Redirecionamento iniciado");
        } catch (redirectError) {
          console.log("❌ Erro no redirecionamento:", redirectError);
          // Fallback: redirecionamento manual
          window.location.href = "/admin/dashboard";
        }
      } else {
        console.log("⚠️ Login não retornou ok nem error");
      }
    } catch (error) {
      setError("Erro interno do servidor. Tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-400">
            Acesse o painel administrativo
          </p>
        </div>

        <div className="bg-[#1a1a1a] shadow-lg rounded-lg p-6 border border-gray-800">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-white">
              Login Administrativo
            </h2>
            <p className="text-gray-400">
              Entre com suas credenciais de administrador
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                CPF
              </label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={handleCpfChange}
                maxLength={14}
                required
                className="w-full px-3 py-2 border border-gray-700 bg-[#2a2a2a] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#1a1a1a]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Senha
              </label>
              <input
                type="password"
                placeholder="Digite sua senha"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                required
                className="w-full px-3 py-2 border border-gray-700 bg-[#2a2a2a] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#1a1a1a]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Entrando..." : "Entrar como Administrador"}
            </button>
          </form>

          <div className="text-center mt-6">
            <a href="/" className="text-sm text-blue-400 hover:text-blue-300">
              ← Voltar para página inicial
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
