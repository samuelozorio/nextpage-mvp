import { ClienteHeader } from "@/components/cliente/layout/cliente-header";
import { ClienteFooter } from "@/components/cliente/layout/cliente-footer";

interface PerfilLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    orgSlug: string;
  }>;
}

export default async function PerfilLayout({
  children,
  params,
}: PerfilLayoutProps) {
  const resolvedParams = await params;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ClienteHeader orgSlug={resolvedParams.orgSlug} />
      <main className="flex-1">{children}</main>
      <ClienteFooter orgSlug={resolvedParams.orgSlug} />
    </div>
  );
}
