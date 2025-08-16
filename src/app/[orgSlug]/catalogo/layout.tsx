import { ClienteHeader } from "@/components/cliente/layout/cliente-header";
import { ClienteFooter } from "@/components/cliente/layout/cliente-footer";

interface CatalogoLayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}

export default async function CatalogoLayout({
  children,
  params,
}: CatalogoLayoutProps) {
  const resolvedParams = await params;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ClienteHeader orgSlug={resolvedParams.orgSlug} />
      <main className="bg-white flex-1">{children}</main>
      <ClienteFooter orgSlug={resolvedParams.orgSlug} />
    </div>
  );
}
