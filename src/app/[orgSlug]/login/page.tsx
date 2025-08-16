import { notFound } from "next/navigation";
import Image from "next/image";
import { OrganizationLoginForm } from "@/components/organization/login-form";
import { OrganizationService } from "@/lib/services/organization.service";

interface OrganizationLoginPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function OrganizationLoginPage({
  params,
}: OrganizationLoginPageProps) {
  const resolvedParams = await params;
  const organizationService = new OrganizationService();

  // Buscar organização real do banco de dados
  const organization = await organizationService.findBySlug(
    resolvedParams.orgSlug
  );

  if (!organization || !organization.isActive) {
    notFound();
  }

  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo - Imagem */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image
          src={organization.loginImageUrl || "/images/login-paisagem.jpg"}
          alt={`Imagem de login ${organization.name}`}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* Overlay com texto sempre presente */}
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">NextPage</h1>
            <p className="text-xl">Sua biblioteca digital</p>
          </div>
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
              <Image
                src="/images/nextpage-logo.svg"
                alt="NextPage Logo"
                width={220}
                height={120}
                className="h-20 mx-auto object-contain mb-4"
              />
            )}
            <h2 className="text-xl text-gray-600">Acesse sua conta</h2>
            <p className="text-sm text-gray-500 mt-2">
              Entre com seu CPF e senha para resgatar seus ebooks
            </p>
          </div>

          {/* Formulário de login */}
          <OrganizationLoginForm organization={organization} />

          {/* Primeiro acesso */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Primeiro acesso?{" "}
              <a
                href={`/${organization.slug}/primeiro-acesso`}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Clique aqui para criar sua senha
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
