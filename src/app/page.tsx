import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-foreground">
            NextPage MVP v14
          </h1>
          <p className="text-lg text-muted-foreground">
            Sistema de ebooks com white label - Migração em andamento
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="default">Login Admin</Button>
            <Button variant="outline">Login Cliente</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
