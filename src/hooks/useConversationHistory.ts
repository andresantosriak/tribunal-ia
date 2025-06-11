
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface ConversationMessage {
  id: number;
  caso_id: string;
  rodada: number;
  agente: string; // promotor, advogado, juiz, relatorio
  conteudo: string;
  timestamp_interacao: string;
  tipo_interacao: string;
}

interface GroupedConversations {
  promotor: ConversationMessage[];
  advogado: ConversationMessage[];
  juiz: ConversationMessage[];
  relatorio: ConversationMessage[];
}

export const useConversationHistory = (userId?: string) => {
  const { userProfile } = useAuth();
  const [conversations, setConversations] = useState<ConversationMessage[]>([]);
  const [groupedConversations, setGroupedConversations] = useState<GroupedConversations>({
    promotor: [],
    advogado: [],
    juiz: [],
    relatorio: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConversationHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!userProfile && !userId) {
        throw new Error('Usuário não identificado');
      }

      const targetUserId = userId || userProfile?.id;
      console.log('Carregando histórico de conversas para usuário:', targetUserId);

      // Buscar apenas casos do usuário logado
      const { data: userCases, error: casesError } = await supabase
        .from('casos')
        .select('caso_id')
        .eq('usuario_id', targetUserId);

      if (casesError) {
        console.error('Erro ao buscar casos:', casesError);
        throw new Error('Erro ao carregar casos do usuário');
      }

      console.log('Casos encontrados:', userCases);

      if (!userCases || userCases.length === 0) {
        console.log('Nenhum caso encontrado para o usuário');
        setConversations([]);
        setGroupedConversations({
          promotor: [],
          advogado: [],
          juiz: [],
          relatorio: []
        });
        return;
      }

      const caseIds = userCases.map(c => c.caso_id);
      console.log('IDs dos casos para buscar interações:', caseIds);

      // Buscar histórico de interações dos casos do usuário
      const { data: interactions, error: interactionsError } = await supabase
        .from('historico_interacoes')
        .select('*')
        .in('caso_id', caseIds)
        .order('timestamp_interacao', { ascending: false });

      if (interactionsError) {
        console.error('Erro ao buscar interações:', interactionsError);
        throw new Error('Erro ao carregar histórico de conversas');
      }

      console.log('Interações carregadas:', interactions);

      const conversationData = interactions || [];
      setConversations(conversationData);

      // Agrupar conversas por tipo de persona
      const grouped: GroupedConversations = {
        promotor: [],
        advogado: [],
        juiz: [],
        relatorio: []
      };

      conversationData.forEach(conversation => {
        const agente = conversation.agente?.toLowerCase();
        
        if (agente === 'promotor' || agente === 'prosecutor') {
          grouped.promotor.push(conversation);
        } else if (agente === 'advogado' || agente === 'lawyer' || agente === 'defensor') {
          grouped.advogado.push(conversation);
        } else if (agente === 'juiz' || agente === 'judge') {
          grouped.juiz.push(conversation);
        } else if (agente === 'relatorio' || agente === 'report' || agente === 'relatorio_final') {
          grouped.relatorio.push(conversation);
        }
      });

      console.log('Conversas agrupadas:', grouped);
      setGroupedConversations(grouped);

    } catch (err: any) {
      console.error('Erro ao carregar histórico:', err);
      setError(err.message || 'Erro inesperado ao carregar conversas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile || userId) {
      loadConversationHistory();
    }
  }, [userProfile, userId]);

  // Real-time subscriptions for conversations
  useEffect(() => {
    if (!userProfile?.id && !userId) return;

    const targetUserId = userId || userProfile?.id;

    // Subscription for historico_interacoes
    const interacoesSubscription = supabase
      .channel('conversation_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'historico_interacoes'
      }, () => {
        loadConversationHistory();
      })
      .subscribe();

    // Subscription for sentencas
    const sentencasSubscription = supabase
      .channel('sentencas_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sentencas'
      }, () => {
        loadConversationHistory();
      })
      .subscribe();

    // Subscription for relatorios_melhorias
    const relatoriosSubscription = supabase
      .channel('relatorios_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'relatorios_melhorias'
      }, () => {
        loadConversationHistory();
      })
      .subscribe();

    return () => {
      interacoesSubscription.unsubscribe();
      sentencasSubscription.unsubscribe();
      relatoriosSubscription.unsubscribe();
    };
  }, [userProfile?.id, userId]);

  const refreshHistory = () => {
    loadConversationHistory();
  };

  const getConversationsByCase = (caseId: string) => {
    return conversations.filter(conv => conv.caso_id === caseId);
  };

  const getLatestConversations = (limit: number = 10) => {
    return conversations.slice(0, limit);
  };

  return {
    conversations,
    groupedConversations,
    isLoading,
    error,
    refreshHistory,
    getConversationsByCase,
    getLatestConversations
  };
};
