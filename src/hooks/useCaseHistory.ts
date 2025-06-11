
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Case {
  id: number;
  caso_id: string;
  texto_original: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  usuario_id: string;
}

export const useCaseHistory = (userId?: string) => {
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userProfile } = useAuth();

  const loadCases = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const targetUserId = userId || userProfile?.id;
      
      if (!targetUserId) {
        throw new Error('Usuário não identificado');
      }

      console.log('Carregando casos para usuário:', targetUserId);

      const { data: casesData, error: casesError } = await supabase
        .from('casos')
        .select('*')
        .eq('usuario_id', targetUserId)
        .order('created_at', { ascending: false });

      if (casesError) {
        console.error('Erro ao buscar casos:', casesError);
        throw new Error('Erro ao carregar histórico de casos');
      }

      console.log('Casos carregados:', casesData);
      setCases(casesData || []);

    } catch (err: any) {
      console.error('Erro ao carregar casos:', err);
      setError(err.message || 'Erro inesperado ao carregar casos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile || userId) {
      loadCases();
    }
  }, [userProfile, userId]);

  const refreshCases = () => {
    loadCases();
  };

  const getCaseById = (caseId: string) => {
    return cases.find(c => c.caso_id === caseId);
  };

  const getCasesByStatus = (status: string) => {
    return cases.filter(c => c.status === status);
  };

  return {
    cases,
    isLoading,
    error,
    refreshCases,
    getCaseById,
    getCasesByStatus
  };
};
