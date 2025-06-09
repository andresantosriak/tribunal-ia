
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Save, TestTube2 } from 'lucide-react';

interface Configuracoes {
  webhook_url: string;
  max_peticoes_usuario: number;
}

const AdminSettings = () => {
  const [settings, setSettings] = useState<Configuracoes>({
    webhook_url: '',
    max_peticoes_usuario: 5
  });
  const [loading, setLoading] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setSettings({
          webhook_url: data.webhook_url || '',
          max_peticoes_usuario: data.max_peticoes_usuario || 5
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('configuracoes')
        .upsert([
          {
            webhook_url: settings.webhook_url,
            max_peticoes_usuario: settings.max_peticoes_usuario,
            updated_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: "As configurações foram atualizadas com sucesso",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testWebhook = async () => {
    if (!settings.webhook_url) {
      toast({
        title: "Erro",
        description: "Configure a URL do webhook primeiro",
        variant: "destructive",
      });
      return;
    }

    setTestingWebhook(true);

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
          description: "A conexão com o n8n está funcionando",
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Webhook test error:', error);
      toast({
        title: "Erro no teste do webhook",
        description: "Verifique a URL e tente novamente",
        variant: "destructive",
      });
    } finally {
      setTestingWebhook(false);
    }
  };

  return (
    <AdminLayout title="Configurações">
      <div className="max-w-2xl">
        <Card className="card-legal">
          <CardHeader>
            <CardTitle>Configurações do Sistema</CardTitle>
            <CardDescription>
              Configure as definições globais do Tribunal de IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Webhook URL */}
              <div className="space-y-2">
                <Label htmlFor="webhook_url">URL do Webhook (n8n)</Label>
                <div className="flex space-x-2">
                  <Input
                    id="webhook_url"
                    type="url"
                    placeholder="https://your-n8n-instance.com/webhook/..."
                    value={settings.webhook_url}
                    onChange={(e) => setSettings({
                      ...settings,
                      webhook_url: e.target.value
                    })}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={testWebhook}
                    disabled={testingWebhook || !settings.webhook_url}
                  >
                    <TestTube2 className="h-4 w-4 mr-2" />
                    {testingWebhook ? 'Testando...' : 'Testar'}
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  URL do webhook n8n que processará as petições
                </p>
              </div>

              {/* Max Petitions */}
              <div className="space-y-2">
                <Label htmlFor="max_peticoes">Limite de Petições por Usuário</Label>
                <Input
                  id="max_peticoes"
                  type="number"
                  min="1"
                  max="100"
                  value={settings.max_peticoes_usuario}
                  onChange={(e) => setSettings({
                    ...settings,
                    max_peticoes_usuario: parseInt(e.target.value) || 5
                  })}
                />
                <p className="text-sm text-gray-600">
                  Número máximo de petições que cada usuário pode enviar
                </p>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  className="btn-legal"
                  disabled={loading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card className="card-legal mt-6">
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Versão:</span>
                <span className="ml-2">1.0.0</span>
              </div>
              <div>
                <span className="font-medium">Ambiente:</span>
                <span className="ml-2">Produção</span>
              </div>
              <div>
                <span className="font-medium">Banco de Dados:</span>
                <span className="ml-2">Supabase</span>
              </div>
              <div>
                <span className="font-medium">Última Atualização:</span>
                <span className="ml-2">{new Date().toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
