
import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, TestTube2, CheckCircle, AlertCircle } from 'lucide-react';
import { useGlobalSettings } from '@/contexts/SettingsContext';

const AdminSettings = () => {
  const { settings, updateSettings, saveSettings, isLoading, lastSaved } = useGlobalSettings();
  const [localWebhookUrl, setLocalWebhookUrl] = useState(settings.webhookUrl);
  const [localMaxPeticoes, setLocalMaxPeticoes] = useState(settings.maxPeticoesUsuario);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);

  const handleWebhookUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setLocalWebhookUrl(newUrl);
    updateSettings({ webhookUrl: newUrl });
  };

  const handleMaxPeticoesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 5;
    setLocalMaxPeticoes(newValue);
    updateSettings({ maxPeticoesUsuario: newValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Salvando configurações:', settings);
    
    const success = await saveSettings();
    
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      console.log('Configurações salvas com sucesso:', settings);
    }
  };

  const handleTestWebhook = async () => {
    if (!settings.webhookUrl) {
      return;
    }

    setTestingWebhook(true);
    try {
      const response = await fetch(settings.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          message: 'Teste de conexão do Tribunal de IA'
        })
      });

      if (response.ok) {
        console.log('Webhook testado com sucesso');
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Erro no teste do webhook:', error);
    } finally {
      setTestingWebhook(false);
    }
  };

  const isValidUrl = (url: string) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isWebhookUrlValid = isValidUrl(localWebhookUrl);
  const hasChanges = localWebhookUrl !== settings.webhookUrl || localMaxPeticoes !== settings.maxPeticoesUsuario;

  return (
    <AdminLayout title="Configurações">
      <div className="max-w-2xl space-y-6">
        <Card className="card-legal">
          <CardHeader>
            <CardTitle>Configurações do Sistema</CardTitle>
            <CardDescription>
              Configure as definições globais do Tribunal de IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Webhook URL */}
              <div className="space-y-2">
                <Label htmlFor="webhook_url">URL do Webhook (n8n)</Label>
                <div className="flex space-x-2">
                  <Input
                    id="webhook_url"
                    type="url"
                    placeholder="https://your-n8n-instance.com/webhook/..."
                    value={localWebhookUrl}
                    onChange={handleWebhookUrlChange}
                    className={`flex-1 ${!isWebhookUrlValid ? 'border-red-500' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestWebhook}
                    disabled={testingWebhook || !settings.webhookUrl || !isWebhookUrlValid}
                  >
                    <TestTube2 className="h-4 w-4 mr-2" />
                    {testingWebhook ? 'Testando...' : 'Testar'}
                  </Button>
                </div>
                
                {localWebhookUrl && !isWebhookUrlValid && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Por favor, insira uma URL válida
                  </p>
                )}
                
                {localWebhookUrl && isWebhookUrlValid && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    URL válida configurada
                  </p>
                )}
                
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
                  value={localMaxPeticoes}
                  onChange={handleMaxPeticoesChange}
                />
                <p className="text-sm text-gray-600">
                  Número máximo de petições que cada usuário pode enviar
                </p>
              </div>

              {/* Save Button */}
              <div className="flex justify-between items-center">
                <Button 
                  type="submit" 
                  className="btn-legal min-w-[180px]"
                  disabled={isLoading || !isWebhookUrlValid}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Salvando...
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Configurações
                    </>
                  )}
                </Button>

                {saveSuccess && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Salvo com sucesso!</span>
                  </div>
                )}
              </div>

              {/* Debug Information */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm space-y-1">
                <p><strong>URL atual salva:</strong> {settings.webhookUrl || 'Nenhuma'}</p>
                <p><strong>Última modificação:</strong> {lastSaved ? lastSaved.toLocaleString() : 'Nunca'}</p>
                <p><strong>Status:</strong> {hasChanges ? 'Há alterações não salvas' : 'Tudo salvo'}</p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card className="card-legal">
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
            
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Status das Configurações:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  {settings.webhookUrl ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )}
                  <span>Webhook URL: {settings.webhookUrl ? 'Configurado' : 'Não configurado'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Limite de petições: {settings.maxPeticoesUsuario}</span>
                </div>
              </div>
            </div>

            {/* Test Section */}
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Teste de Webhook:</h4>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm"><strong>URL configurada:</strong></p>
                <p className="text-sm font-mono break-all">
                  {settings.webhookUrl || 'Nenhuma URL configurada'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
