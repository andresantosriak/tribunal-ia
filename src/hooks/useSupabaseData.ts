
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface UseSupabaseDataOptions {
  table: string;
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  autoLoad?: boolean;
}

export const useSupabaseData = <T = any>(options: UseSupabaseDataOptions) => {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    table,
    select = '*',
    filters = {},
    orderBy,
    limit,
    autoLoad = true
  } = options;

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log(`🔍 Carregando dados da tabela: ${table}`);

      let query = supabase.from(table as any).select(select);

      // Aplicar filtros
      Object.entries(filters).forEach(([column, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(column, value);
        }
      });

      // Aplicar ordenação
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }

      // Aplicar limit
      if (limit) {
        query = query.limit(limit);
      }

      const { data: result, error } = await query;

      if (error) {
        console.error(`❌ Erro ao carregar ${table}:`, error);
        throw error;
      }

      console.log(`✅ Dados carregados de ${table}:`, result);
      setData((result as T[]) || []);

    } catch (err: any) {
      console.error(`❌ Erro no carregamento de ${table}:`, err);
      setError(err.message || 'Erro ao carregar dados');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    loadData();
  };

  const insertItem = async (item: Partial<T>) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log(`💾 Inserindo item na tabela ${table}:`, item);

      const { data: result, error } = await supabase
        .from(table as any)
        .insert(item)
        .select()
        .single();

      if (error) {
        console.error(`❌ Erro ao inserir em ${table}:`, error);
        throw error;
      }

      console.log(`✅ Item inserido em ${table}:`, result);
      
      // Atualizar lista local
      setData(prev => [result as T, ...prev]);
      
      return { success: true, data: result };
    } catch (err: any) {
      console.error(`❌ Erro na inserção em ${table}:`, err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateItem = async (id: string, updates: Partial<T>) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log(`🔄 Atualizando item em ${table}:`, { id, updates });

      const { data: result, error } = await supabase
        .from(table as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`❌ Erro ao atualizar ${table}:`, error);
        throw error;
      }

      console.log(`✅ Item atualizado em ${table}:`, result);
      
      // Atualizar lista local
      setData(prev => prev.map(item => 
        (item as any).id === id ? result as T : item
      ));
      
      return { success: true, data: result };
    } catch (err: any) {
      console.error(`❌ Erro na atualização em ${table}:`, err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log(`🗑️ Removendo item da tabela ${table}:`, id);

      const { error } = await supabase
        .from(table as any)
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`❌ Erro ao remover de ${table}:`, error);
        throw error;
      }

      console.log(`✅ Item removido de ${table}`);
      
      // Atualizar lista local
      setData(prev => prev.filter(item => (item as any).id !== id));
      
      return { success: true };
    } catch (err: any) {
      console.error(`❌ Erro na remoção em ${table}:`, err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad) {
      loadData();
    }
  }, [table, JSON.stringify(filters), JSON.stringify(orderBy), limit]);

  return {
    data,
    isLoading,
    error,
    loadData,
    refreshData,
    insertItem,
    updateItem,
    deleteItem
  };
};
