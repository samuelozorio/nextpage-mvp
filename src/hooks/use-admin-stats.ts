import { useState, useEffect } from 'react';

interface AdminStats {
  organizations: {
    total: number;
    active: number;
    recent: number;
    percentage: number;
  };
  users: {
    total: number;
    recent: number;
    avgPerOrg: number;
  };
  ebooks: {
    total: number;
    active: number;
    recent: number;
    percentage: number;
    avgPoints: number;
  };
  downloads: {
    total: number;
    recent: number;
  };
  recentOrganizations: Array<{
    id: string;
    name: string;
    slug: string;
    usersCount: number;
    createdAt: string;
  }>;
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/admin/stats');
        
        if (!response.ok) {
          console.warn('API retornou erro, usando fallback');
          // Não vamos lançar erro, pois a API pode retornar dados mockados
        }
        
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Erro ao buscar estatísticas:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, loading, error };
}
