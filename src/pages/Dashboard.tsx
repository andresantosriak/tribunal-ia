
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import UserHeader from '@/components/UserHeader';
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

  const fetchCases = async () => {
    if (!userProfile) return;

    try {
      const { data, error } = await supabase
        .from('casos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCasos(data || []);
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

    setLoading(true);

    try {
      // Generate unique case ID
      const casoId = `CASO_${Date.now()}`;
      
      // Insert new case
      const { error: caseError } = await supabase
        .from('casos')
        .insert([
          {
            caso_id: casoId,
            texto_original: petitionText,
            status: 'processando',
          }
        ]);

      if (caseError) throw caseError;

      // Update user's petition count
      const { error: userError } = await supabase
        .from('usuarios')
        .update({ peticoes_usadas: (userProfile?.peticoes_usadas || 0) + 1 })
        .eq('id', userProfile?.id);

      if (userError) throw userError;

      // Here you would call the webhook to n8n
      // For now, we'll just simulate the webhook call
      try {
        // const webhookUrl = 'YOUR_N8N_WEBHOOK_URL';
        // await fetch(webhookUrl, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ 
        //     caso_id: casoId,
        //     texto: petitionText 
        //   })
        // });
        console.log('Webhook would be called here with case:', casoId);
      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
      }

      toast({
        title: "Petição enviada!",
        description: "Seu caso será processado em breve",
      });

      setPetitionText('');
      await refreshProfile();
      await fetchCases();
    } catch (error) {
      console.error('Error submitting petition:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a petição",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
      </div>
    </div>
  );
};

export default Dashboard;
