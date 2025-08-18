import { ClienteHeader } from "@/components/cliente/layout/cliente-header";
import { ClienteFooter } from "@/components/cliente/layout/cliente-footer";

interface ClienteLayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}

export default async function ClienteLayout({
  children,
  params,
}: ClienteLayoutProps) {
  const resolvedParams = await params;
  const { orgSlug } = resolvedParams;

  return (
    <div className="min-h-screen bg-white">
      <ClienteHeader orgSlug={orgSlug} />
      <main className="bg-white">{children}</main>
      <ClienteFooter orgSlug={orgSlug} />
    </div>
  );
}
