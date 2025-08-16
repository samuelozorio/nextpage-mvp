import { ClienteHeader } from "@/components/cliente/layout/cliente-header";
import { ClienteFooter } from "@/components/cliente/layout/cliente-footer";

interface BibliotecaLayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}

export default async function BibliotecaLayout({
  children,
  params,
}: BibliotecaLayoutProps) {
  const resolvedParams = await params;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ClienteHeader orgSlug={resolvedParams.orgSlug} />
      <main className="bg-white flex-1">{children}</main>
      <ClienteFooter orgSlug={resolvedParams.orgSlug} />
    </div>
  );
}
