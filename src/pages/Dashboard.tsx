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
import { Link } from 'react-router-dom';

interface Caso {
  id: string;
  caso_id: string;
  texto_original: string;
  status: string;
  created_at: string;
  completed_at: string | null;
}

const Dashboard = () => {
  const { userProfile, refreshProfile } = useAuth();
  const [petitionText, setPetitionText] = useState('');
  const [loading, setLoading] = useState(false);
  const [casos, setCasos] = useState<Caso[]>([]);
  const [loadingCases, setLoadingCases] = useState(true);

  const maxPeticoes = 5; // This should come from system settings
  const peticionesRestantes = maxPeticoes - (userProfile?.peticoes_usadas || 0);

  useEffect(() => {
    fetchCases();
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

  const fetchCases = async () => {
    if (!userProfile) return;

    try {
      const { data, error } = await supabase
        .from('casos')
        .select('*')
        .eq('usuario_id', userProfile.id)  // Filter by current user
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion para garantir que o id seja string
      const casesData: Caso[] = (data || []).map(caso => ({
        id: caso.id.toString(),
        caso_id: caso.caso_id,
        texto_original: caso.texto_original,
        status: caso.status || 'processando',
        created_at: caso.created_at,
        completed_at: caso.completed_at
      }));
      
      setCasos(casesData);
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

  const handleSubmitPetition = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== DEBUG INÍCIO ===');
    console.log('userProfile:', userProfile);
    console.log('petitionText:', petitionText);
    console.log('peticionesRestantes:', peticionesRestantes);
    
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
      console.error('User profile ID missing');
      toast({
        title: "Erro de autenticação",
        description: "Usuário não identificado. Faça login novamente.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('=== STEP 0: Verify user exists ===');
      // Verificar se usuário existe na tabela usuarios
      const { data: userExists, error: userCheckError } = await supabase
        .from('usuarios')
        .select('id, peticoes_usadas')
        .eq('id', userProfile.id)
        .single();

      console.log('User check result:', { userExists, userCheckError });

      if (userCheckError || !userExists) {
        throw new Error('Usuário não encontrado na base de dados');
      }

      console.log('=== STEP 1: Generate casoId ===');
      const casoId = `CASO_${Date.now()}`;
      console.log('Generated casoId:', casoId);

      console.log('=== STEP 2: Insert case ===');
      const { data: insertData, error: caseError } = await supabase
        .from('casos')
        .insert([
          {
            caso_id: casoId,
            texto_original: petitionText,
            status: 'processando',
            usuario_id: userProfile.id
          }
        ])
        .select();

      console.log('Insert result:', { insertData, caseError });

      if (caseError) {
        console.error('Case insert error:', caseError);
        throw new Error(`Erro ao inserir caso: ${caseError.message}`);
      }

      console.log('=== STEP 3: Update user petition count ===');
      const { data: updateData, error: userError } = await supabase
        .from('usuarios')
        .update({ peticoes_usadas: (userProfile?.peticoes_usadas || 0) + 1 })
        .eq('id', userProfile.id)
        .select();

      console.log('Update result:', { updateData, userError });

      if (userError) {
        console.error('User update error:', userError);
        throw new Error(`Erro ao atualizar usuário: ${userError.message}`);
      }

      console.log('=== STEP 4: Fetch webhook config ===');
      const { data: config, error: configError } = await supabase
        .from('configuracoes')
        .select('webhook_url')
        .single();

      console.log('Config result:', { config, configError });

      if (configError && configError.code !== 'PGRST116') {
        console.error('Config fetch error:', configError);
        // Não falhar por causa de config, apenas avisar
      }

      console.log('=== STEP 5: Send webhook ===');
      if (config?.webhook_url) {
        try {
          console.log('Sending webhook to:', config.webhook_url);
          console.log('Webhook payload:', { texto: petitionText });
          
          const response = await fetch(config.webhook_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              texto: petitionText
            })
          });
          
          console.log('Webhook response status:', response.status);
          console.log('Webhook response ok:', response.ok);
          
          if (!response.ok) {
            throw new Error(`Webhook failed: ${response.status}`);
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
          description: "Petição salva, mas webhook não está configurado",
          variant: "default",
        });
      }

      console.log('=== SUCCESS ===');
      toast({
        title: "Petição enviada!",
        description: "Seu caso será processado em breve",
      });

      setPetitionText('');
      await refreshProfile();
      await fetchCases();
      
    } catch (error) {
      console.error('=== ERRO GERAL ===');
      console.error('Error details:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível enviar a petição",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      console.log('=== DEBUG FIM ===');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />
      
      <div className="container mx-auto px-4 py-8">
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
                      disabled={loading || peticionesRestantes <= 0}
                    >
                      {loading ? 'Enviando...' : 'Enviar para Análise'}
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
