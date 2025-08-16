interface ClienteLayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}

export default async function ClienteLayout({
  children,
  params,
}: ClienteLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <main className="bg-white">{children}</main>
    </div>
  );
}
