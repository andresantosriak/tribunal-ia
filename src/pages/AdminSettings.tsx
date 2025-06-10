
import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, TestTube2, CheckCircle, AlertCircle } from 'lucide-react';
import useSettings from '@/hooks/useSettings';

const AdminSettings = () => {
  const { 
    settings, 
    loading, 
    saving, 
    updateSetting, 
    saveSettings, 
    testWebhook 
  } = useSettings();
  
  const [testingWebhook, setTestingWebhook] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Salvando configurações:', settings);
    await saveSettings(settings);
  };

  const handleTestWebhook = async () => {
    setTestingWebhook(true);
    await testWebhook();
    setTestingWebhook(false);
  };

  // Validação de URL
  const isValidUrl = (url: string) => {
    if (!url) return true; // URL vazia é válida
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isWebhookUrlValid = isValidUrl(settings.webhook_url);

  if (loading) {
    return (
      <AdminLayout title="Configurações">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3">Carregando configurações...</span>
        </div>
      </AdminLayout>
    );
  }

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
                    value={settings.webhook_url}
                    onChange={(e) => updateSetting('webhook_url', e.target.value)}
                    className={`flex-1 ${!isWebhookUrlValid ? 'border-red-500' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestWebhook}
                    disabled={testingWebhook || !settings.webhook_url || !isWebhookUrlValid}
                  >
                    <TestTube2 className="h-4 w-4 mr-2" />
                    {testingWebhook ? 'Testando...' : 'Testar'}
                  </Button>
                </div>
                
                {/* Feedback visual para URL */}
                {settings.webhook_url && !isWebhookUrlValid && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Por favor, insira uma URL válida
                  </p>
                )}
                
                {settings.webhook_url && isWebhookUrlValid && (
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
                  value={settings.max_peticoes_usuario}
                  onChange={(e) => updateSetting('max_peticoes_usuario', parseInt(e.target.value) || 5)}
                />
                <p className="text-sm text-gray-600">
                  Número máximo de petições que cada usuário pode enviar
                </p>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  className="btn-legal min-w-[180px]"
                  disabled={saving || !isWebhookUrlValid}
                >
                  {saving ? (
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
            
            {/* Status das configurações */}
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Status das Configurações:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  {settings.webhook_url ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )}
                  <span>Webhook URL: {settings.webhook_url ? 'Configurado' : 'Não configurado'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Limite de petições: {settings.max_peticoes_usuario}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
