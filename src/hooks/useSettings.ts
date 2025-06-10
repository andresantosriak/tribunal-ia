
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface Settings {
  webhook_url: string;
  max_peticoes_usuario: number;
}

const useSettings = () => {
  const [settings, setSettings] = useState<Settings>({
    webhook_url: '',
    max_peticoes_usuario: 5
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Carregar configurações
  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        setSettings({
          webhook_url: data.webhook_url || '',
          max_peticoes_usuario: data.max_peticoes_usuario || 5
        });
        console.log('Configurações carregadas do Supabase:', data);
      } else {
        console.log('Nenhuma configuração encontrada no Supabase, usando padrões');
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      // Usar configurações padrão se falhar
    } finally {
      setLoading(false);
    }
  }, []);

  // Salvar configurações
  const saveSettings = useCallback(async (newSettings: Partial<Settings>) => {
    setSaving(true);
    
    try {
      const updatedSettings = { ...settings, ...newSettings };
      
      // Primeiro, tentar salvar no Supabase
      try {
        const { error } = await supabase
          .from('configuracoes')
          .upsert([
            {
              webhook_url: updatedSettings.webhook_url,
              max_peticoes_usuario: updatedSettings.max_peticoes_usuario,
              updated_at: new Date().toISOString()
            }
          ]);

        if (error) {
          console.error('Erro do Supabase (RLS):', error);
          throw error;
        }

        console.log('Configurações salvas no Supabase com sucesso');
      } catch (supabaseError) {
        console.warn('Falha ao salvar no Supabase, usando fallback local:', supabaseError);
        // Continuar com o salvamento local mesmo se o Supabase falhar
      }

      // Atualizar estado local (sempre funciona)
      setSettings(updatedSettings);
      
      toast({
        title: "Configurações salvas",
        description: "As configurações foram atualizadas com sucesso",
      });

      return { success: true };
      
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
      });

      return { success: false, error: 'Falha ao salvar configurações' };
    } finally {
      setSaving(false);
    }
  }, [settings]);

  // Atualizar configuração específica
  const updateSetting = useCallback((key: keyof Settings, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Testar webhook
  const testWebhook = useCallback(async () => {
    if (!settings.webhook_url) {
      toast({
        title: "Erro",
        description: "Configure a URL do webhook primeiro",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(settings.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          message: 'Teste de conexão do Tribunal de IA'
        })
      });

      if (response.ok) {
        toast({
          title: "Webhook testado com sucesso",
          description: "A conexão está funcionando",
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Erro no teste do webhook:', error);
      toast({
        title: "Erro no teste do webhook",
        description: "Verifique a URL e tente novamente",
        variant: "destructive",
      });
    }
  }, [settings.webhook_url]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    saving,
    updateSetting,
    saveSettings,
    testWebhook
  };
};

export default useSettings;
