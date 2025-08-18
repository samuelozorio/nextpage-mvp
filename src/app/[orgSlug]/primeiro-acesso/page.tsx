import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { FirstAccessForm } from "@/components/organization/first-access-form";

interface FirstAccessPageProps {
  params: Promise<{ orgSlug: string }>;
  searchParams: { cpf?: string };
}

export default async function FirstAccessPage({ params, searchParams }: FirstAccessPageProps) {
  const resolvedParams = await params;
  
  // Buscar organização
  const organization = await prisma.organization.findUnique({
    where: { slug: resolvedParams.orgSlug, isActive: true },
  });

  if (!organization) {
    notFound();
  }

  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo - Imagem */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900">
        <Image
          src={organization.loginImageUrl || "/images/login-paisagem.jpg"}
          alt={`Imagem de login ${organization.name}`}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* Overlay com texto sempre presente */}
        <div className="absolute inset-0 bg-opacity-40"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white"></div>
        </div>
      </div>

      {/* Lado direito - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo no topo do formulário */}
          <div className="text-center mb-8">
            {organization.logoUrl ? (
              <Image
                src={organization.logoUrl}
                alt={`Logo ${organization.name}`}
                width={220}
                height={120}
                className="h-20 mx-auto object-contain mb-4"
              />
            ) : (
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{organization.name}</h1>
            )}
            <h2 className="text-xl text-gray-600">Primeiro Acesso</h2>
            <p className="text-sm text-gray-500 mt-2">
              Configure sua senha para acessar seus ebooks
            </p>
          </div>

          {/* Formulário de primeiro acesso */}
          <FirstAccessForm organization={organization} initialCpf={searchParams.cpf} />

          {/* Voltar ao login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{" "}
              <a
                href={`/${organization.slug}/login`}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Fazer login
              </a>
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-gray-500">
            <p>Powered by NextPage</p>
          </div>
        </div>
      </div>
    </div>
  );
}
