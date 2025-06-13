
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import UserHeader from '@/components/UserHeader';
import ConversationHistory from '@/components/dashboard/ConversationHistory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { FileText, Calendar, Send, Eye } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

interface Caso {
  id: string;
  caso_id: string;
  texto_original: string;
  status: string;
  created_at: string;
  completed_at: string | null;
}

const Dashboard = () => {
  const { userProfile, loading, refreshProfile } = useAuth();
  const [petitionText, setPetitionText] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [casos, setCasos] = useState<Caso[]>([]);
  const [loadingCases, setLoadingCases] = useState(true);

  const maxPeticoes = 5; // This should come from system settings
  const peticionesRestantes = maxPeticoes - (userProfile?.peticoes_usadas || 0);

  // Debug auth state
  useEffect(() => {
    console.log('=== DASHBOARD DEBUG ===');
    console.log('userProfile:', userProfile);
    console.log('isLoading auth:', loading);
    
    // Verificar autenticação atual
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current auth user:', user);
    };
    
    checkAuth();
  }, [userProfile, loading]);

  // Debug function
  const debugUserData = async () => {
    console.log('=== DEBUG MANUAL ===');
    
    // Verificar sessão atual
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Sessão atual:', session);
    
    // Verificar usuário atual
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Usuário atual:', user);
    
    // Verificar se existe na tabela usuarios
    if (user) {
      const { data: profileById } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id);
      console.log('Perfil por ID:', profileById);
      
      const { data: profileByEmail } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', user.email);
      console.log('Perfil por email:', profileByEmail);
    }
    
    console.log('UserProfile do contexto:', userProfile);
  };

  const fetchCases = async () => {
    if (!userProfile?.id) {
      console.log('userProfile não disponível, não buscando casos');
      return;
    }

    try {
      setLoadingCases(true);
      console.log('Buscando casos para usuário:', userProfile.id);
      
      const { data, error } = await supabase
        .from('casos')
        .select('*')
        .eq('usuario_id', userProfile.id)  // CORRIGIDO: filtrar por usuário
        .order('created_at', { ascending: false });

      console.log('Casos encontrados:', data);

      if (error) {
        console.error('Erro ao buscar casos:', error);
        throw error;
      }
      
      const casesData: Caso[] = (data || []).map(caso => ({
        id: caso.id.toString(),
        caso_id: caso.caso_id,
        texto_original: caso.texto_original,
        status: caso.status || 'processando',
        created_at: caso.created_at,
        completed_at: caso.completed_at
      }));
      
      setCasos(casesData);
      console.log(`${casesData.length} casos carregados para o usuário`);
    } catch (error) {
      console.error('Error fetching cases:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os casos",
        variant: "destructive",
      });
    } finally {
      setLoadingCases(false);
    }
  };

  useEffect(() => {
    if (userProfile?.id) {
      fetchCases();
    }
  }, [userProfile]);

  // Real-time subscription for user cases
  useEffect(() => {
    if (!userProfile?.id) return;

    const casosSubscription = supabase
      .channel('user_cases_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'casos',
        filter: `usuario_id=eq.${userProfile.id}`
      }, () => {
        fetchCases();
      })
      .subscribe();

    return () => {
      casosSubscription.unsubscribe();
    };
  }, [userProfile?.id]);

  const handleSubmitPetition = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== ENVIANDO PETIÇÃO ===');
    console.log('userProfile atual:', userProfile);
    
    if (!petitionText.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, descreva o caso",
        variant: "destructive",
      });
      return;
    }

    if (peticionesRestantes <= 0) {
      toast({
        title: "Limite atingido",
        description: "Você atingiu o limite de petições",
        variant: "destructive",
      });
      return;
    }

    if (!userProfile?.id) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não identificado. Faça login novamente.",
        variant: "destructive",
      });
      return;
    }

    setSubmitLoading(true);

    try {
      // 1. Gerar ID único do caso
      const casoId = `CASO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('ID do caso gerado:', casoId);

      // 2. Inserir caso na tabela casos
      const { data: insertData, error: caseError } = await supabase
        .from('casos')
        .insert([
          {
            caso_id: casoId,
            texto_original: petitionText,
            status: 'processando',
            usuario_id: userProfile.id  // CORRIGIDO: usar userProfile.id
          }
        ])
        .select()
        .single();

      console.log('Caso inserido no banco:', insertData);

      if (caseError) {
        console.error('Erro ao inserir caso:', caseError);
        throw new Error(`Erro ao salvar caso: ${caseError.message}`);
      }

      // 3. Atualizar contador de petições do usuário
      const { error: userError } = await supabase
        .from('usuarios')
        .update({ 
          peticoes_usadas: (userProfile.peticoes_usadas || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile.id);

      if (userError) {
        console.error('Erro ao atualizar usuário:', userError);
        throw new Error(`Erro ao atualizar contador: ${userError.message}`);
      }

      // 4. Buscar configuração do webhook
      const { data: config, error: configError } = await supabase
        .from('configuracoes')
        .select('webhook_url')
        .single();

      console.log('Configuração do webhook:', { config, configError });

      // 5. Enviar webhook se configurado
      if (config?.webhook_url && config.webhook_url.trim()) {
        try {
          console.log('Enviando webhook para:', config.webhook_url);
          
          const webhookPayload = {
            texto: petitionText  // FORMATO CORRETO SOLICITADO
          };
          
          console.log('Payload do webhook:', webhookPayload);
          
          const response = await fetch(config.webhook_url, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(webhookPayload)
          });
          
          console.log('Resposta do webhook:', response.status, response.statusText);
          
          if (!response.ok) {
            throw new Error(`Webhook retornou status ${response.status}`);
          }
          
          console.log('Webhook enviado com sucesso');
          
        } catch (webhookError) {
          console.error('Erro no webhook:', webhookError);
          toast({
            title: "Aviso",
            description: "Petição salva, mas houve problema no envio para processamento",
            variant: "default",
          });
        }
      } else {
        console.warn('Webhook URL não configurada');
        toast({
          title: "Aviso",
          description: "Petição salva. Configure o webhook nas configurações administrativas.",
          variant: "default",
        });
      }

      // 6. Sucesso
      toast({
        title: "Petição enviada com sucesso!",
        description: `Caso ${casoId} será processado em breve`,
      });

      setPetitionText('');
      await refreshProfile();
      await fetchCases();
      
    } catch (error) {
      console.error('Erro geral ao enviar petição:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível enviar a petição",
        variant: "destructive",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processando':
        return <Badge className="status-processing">Processando</Badge>;
      case 'concluido':
        return <Badge className="status-completed">Concluído</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show loading while auth is checking
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Usuário não autenticado</p>
          <Link to="/login">
            <Button>Fazer Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Debug Buttons */}
        <div className="mb-4 space-x-2">
          <Button onClick={debugUserData} variant="outline">
            DEBUG DADOS USUÁRIO
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* New Petition Form */}
          <div className="lg:col-span-2">
            <Card className="card-legal">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Send className="h-5 w-5" />
                  <span>Nova Petição</span>
                </CardTitle>
                <CardDescription>
                  Descreva o caso que deseja submeter ao Tribunal de IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitPetition} className="space-y-4">
                  <Textarea
                    placeholder="Descreva o caso jurídico que deseja analisar. Inclua fatos relevantes, evidências e questões legais envolvidas..."
                    value={petitionText}
                    onChange={(e) => setPetitionText(e.target.value)}
                    rows={8}
                    className="resize-none"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {petitionText.length} caracteres
                    </span>
                    <Button 
                      type="submit" 
                      className="btn-legal"
                      disabled={submitLoading || peticionesRestantes <= 0}
                    >
                      {submitLoading ? 'Enviando...' : 'Enviar para Análise'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Petition Counter Card */}
          <div>
            <Card className="card-legal">
              <CardHeader>
                <CardTitle className="text-lg">Suas Petições</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {peticionesRestantes}
                  </div>
                  <div className="text-sm text-gray-600">
                    restantes de {maxPeticoes}
                  </div>
                  {peticionesRestantes === 0 && (
                    <p className="text-sm text-red-600 mt-2">
                      Limite atingido. Entre em contato com o suporte.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Case History */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Histórico de Casos</h2>
          
          {loadingCases ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando casos...</p>
            </div>
          ) : casos.length === 0 ? (
            <Card className="card-legal">
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum caso encontrado</p>
                <p className="text-sm text-gray-500">Envie sua primeira petição para começar</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {casos.map((caso) => (
                <Card key={caso.id} className="card-legal hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">
                          {caso.caso_id}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {caso.texto_original}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(caso.created_at)}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(caso.status)}
                        <Link to={`/case/${caso.caso_id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Conversation History */}
        <div className="mt-8">
          <ConversationHistory />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
