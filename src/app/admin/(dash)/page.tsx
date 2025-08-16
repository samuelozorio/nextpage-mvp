"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart3,
  Building,
  BookOpen,
  Users,
  TrendingUp,
  Download,
  Loader2,
} from "lucide-react";
import { useAdminStats } from "@/hooks/use-admin-stats";

export default function AdminDashboardPage() {
  const { stats, loading, error } = useAdminStats();

  // Dados mockados como fallback
  const fallbackStats = [
    {
      title: "Total de Organizações",
      value: "0",
      description: "+0 este mês",
      icon: <Building className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Total de Ebooks",
      value: "0",
      description: "+0 este mês",
      icon: <BookOpen className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Usuários Ativos",
      value: "0",
      description: "+0 este mês",
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Downloads",
      value: "0",
      description: "+0 este mês",
      icon: <Download className="h-4 w-4 text-muted-foreground" />,
    },
  ];

  // Usar dados reais se disponíveis, senão usar fallback
  const displayStats = stats ? [
    {
      title: "Total de Organizações",
      value: stats.organizations.total.toString(),
      description: `+${stats.organizations.recent} este mês`,
      icon: <Building className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Total de Ebooks",
      value: stats.ebooks.total.toString(),
      description: `+${stats.ebooks.recent} este mês`,
      icon: <BookOpen className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Usuários Ativos",
      value: stats.users.total.toLocaleString(),
      description: `+${stats.users.recent} este mês`,
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Downloads",
      value: stats.downloads.total.toLocaleString(),
      description: `+${stats.downloads.recent} este mês`,
      icon: <Download className="h-4 w-4 text-muted-foreground" />,
    },
  ] : fallbackStats;

  // Função para formatar data relativa
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Hoje';
    if (diffInDays === 1) return 'Há 1 dia';
    if (diffInDays < 7) return `Há ${diffInDays} dias`;
    if (diffInDays < 30) return `Há ${Math.floor(diffInDays / 7)} semana${Math.floor(diffInDays / 7) > 1 ? 's' : ''}`;
    return `Há ${Math.floor(diffInDays / 30)} mês${Math.floor(diffInDays / 30) > 1 ? 'es' : ''}`;
  };

  // Função para gerar cor baseada no nome da organização
  const getOrganizationColor = (name: string) => {
    const colors = [
      'bg-blue-600',
      'bg-green-600',
      'bg-purple-600',
      'bg-red-600',
      'bg-yellow-600',
      'bg-pink-600',
      'bg-indigo-600',
      'bg-teal-600',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Dashboard
        </h2>
        <div className="flex items-center space-x-2">
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 text-white">
            <Download className="mr-2 h-4 w-4" />
            Exportar Relatório
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <span className="ml-2 text-white">Carregando estatísticas...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-md">
          Erro ao carregar estatísticas: {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {displayStats.map((stat) => (
          <Card key={stat.title} className="bg-[#1a1a1a] border-[#283031]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                {stat.title}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-[#1a1a1a] border-[#283031]">
          <CardHeader>
            <CardTitle className="text-white">Visão Geral</CardTitle>
            <CardDescription className="text-muted-foreground">
              Atividade dos últimos 30 dias
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              <BarChart3 className="h-12 w-12" />
              <span className="ml-2">Gráfico de atividades</span>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 bg-[#1a1a1a] border-[#283031]">
          <CardHeader>
            <CardTitle className="text-white">Organizações Recentes</CardTitle>
            <CardDescription className="text-muted-foreground">
              Últimas organizações cadastradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : stats?.recentOrganizations && stats.recentOrganizations.length > 0 ? (
              <div className="space-y-4">
                {stats.recentOrganizations.map((org) => (
                  <div key={org.id} className="flex items-center space-x-4">
                    <div className={`w-8 h-8 ${getOrganizationColor(org.name)} rounded-full flex items-center justify-center`}>
                      <span className="text-white text-sm font-bold">
                        {org.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-white">
                        {org.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(org.createdAt)} • {org.usersCount} usuários
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">Nenhuma organização encontrada</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
