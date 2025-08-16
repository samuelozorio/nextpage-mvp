import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-foreground">
            NextPage MVP v14
          </h1>
          <p className="text-lg text-muted-foreground">
            Sistema de ebooks com white label - Rotas separadas funcionando!
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/admin/login">
              <Button variant="default">Login Admin</Button>
            </Link>
            <Link href="/livraria-exemplo/login">
              <Button variant="outline">Login Cliente</Button>
            </Link>
          </div>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">
              Status da Migração:
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✅ Next.js 14 configurado</li>
              <li>✅ Tailwind CSS funcionando</li>
              <li>✅ Componentes UI base</li>
              <li>✅ NextAuth configurado</li>
              <li>✅ Rotas separadas (Admin/Cliente)</li>
              <li>✅ Páginas de login criadas</li>
              <li>🔄 Banco de dados (próximo passo)</li>
              <li>⏳ Sistema de organizações</li>
            </ul>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">URLs de Teste:</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>
                <strong>Admin:</strong> /admin/login
              </p>
              <p>
                <strong>Cliente:</strong> /livraria-exemplo/login
              </p>
              <p>
                <strong>Credenciais Admin:</strong> 000.000.000-00 / admin123
              </p>
              <p>
                <strong>Credenciais Cliente:</strong> 123.456.789-01 / senha123
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
