"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface PointsContextType {
  points: number;
  updatePoints: () => Promise<void>;
  isLoading: boolean;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

export function PointsProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [points, setPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const updatePoints = async () => {
    if (!session?.user?.id) {
      return;
    }

    try {
      const response = await fetch('/api/user/points');
      
      if (response.ok) {
        const data = await response.json();
        const newPoints = data.user?.points || 0;
        setPoints(newPoints);
      } else {
        console.error('Erro na API de pontos:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Erro ao atualizar pontos:', error);
    }
  };

  // Carregar pontos iniciais
  useEffect(() => {
    console.log('🔄 useEffect - Sessão mudou:', session?.user?.id ? 'SIM' : 'NÃO');
    if (session?.user?.id) {
      console.log('👤 Usuário da sessão:', session.user);
      updatePoints().finally(() => setIsLoading(false));
    } else {
      console.log('❌ Nenhum usuário na sessão');
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  // Atualizar pontos periodicamente
  useEffect(() => {
    if (!session?.user?.id) return;

    const interval = setInterval(updatePoints, 30000); // 30 segundos
    return () => clearInterval(interval);
  }, [session?.user?.id]);

  return (
    <PointsContext.Provider value={{ points, updatePoints, isLoading }}>
      {children}
    </PointsContext.Provider>
  );
}

export function usePoints() {
  const context = useContext(PointsContext);
  if (context === undefined) {
    throw new Error('usePoints deve ser usado dentro de um PointsProvider');
  }
  return context;
}
