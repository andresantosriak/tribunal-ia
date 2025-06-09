
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import UserHeader from '@/components/UserHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Download, 
  ChevronDown, 
  FileText, 
  Scale, 
  Users, 
  Gavel,
  Calendar 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CaseData {
  caso: any;
  analise_inicial: any;
  interacoes: any[];
  sentenca: any;
  relatorio: any;
}

const CaseDetail = () => {
  const { caseId } = useParams();
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState<string[]>(['analise_inicial']);

  useEffect(() => {
    if (caseId) {
      fetchCaseData(caseId);
    }
  }, [caseId]);

  const fetchCaseData = async (casoId: string) => {
    try {
      // Fetch case basic info
      const { data: caso, error: casoError } = await supabase
        .from('casos')
        .select('*')
        .eq('caso_id', casoId)
        .single();

      if (casoError) throw casoError;

      // Fetch initial analysis
      const { data: analise, error: analiseError } = await supabase
        .from('analises_iniciais')
        .select('*')
        .eq('caso_id', casoId)
        .single();

      // Fetch interactions
      const { data: interacoes, error: interacoesError } = await supabase
        .from('historico_interacoes')
        .select('*')
        .eq('caso_id', casoId)
        .order('rodada', { ascending: true })
        .order('timestamp_interacao', { ascending: true });

      // Fetch sentence
      const { data: sentenca, error: sentencaError } = await supabase
        .from('sentencas')
        .select('*')
        .eq('caso_id', casoId)
        .single();

      // Fetch improvement report
      const { data: relatorio, error: relatorioError } = await supabase
        .from('relatorios_melhorias')
        .select('*')
        .eq('caso_id', casoId)
        .single();

      setCaseData({
        caso,
        analise_inicial: analise,
        interacoes: interacoes || [],
        sentenca,
        relatorio
      });
    } catch (error) {
      console.error('Error fetching case data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do caso",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const generatePDF = (type: string) => {
    // This would integrate with a PDF generation library
    toast({
      title: "PDF em preparação",
      description: `Gerando ${type}...`,
    });
    // Implementation would go here
  };

  const getAgentIcon = (agente: string) => {
    switch (agente) {
      case 'promotor':
        return <Users className="h-4 w-4" />;
      case 'advogado':
        return <FileText className="h-4 w-4" />;
      case 'juiz':
        return <Gavel className="h-4 w-4" />;
      default:
        return <Scale className="h-4 w-4" />;
    }
  };

  const getAgentColor = (agente: string) => {
    switch (agente) {
      case 'promotor':
        return 'text-red-600';
      case 'advogado':
        return 'text-blue-600';
      case 'juiz':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserHeader />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados do caso...</p>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserHeader />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">Caso não encontrado</p>
          <Link to="/dashboard">
            <Button className="mt-4">Voltar ao Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{caseData.caso.caso_id}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <span className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(caseData.caso.created_at)}</span>
                </span>
                <Badge className={
                  caseData.caso.status === 'concluido' ? 'status-completed' : 'status-processing'
                }>
                  {caseData.caso.status === 'concluido' ? 'Concluído' : 'Processando'}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Download Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Downloads
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Baixar Documentos</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => generatePDF('todas-conversas')}>
                Baixar Todas as Conversas (PDF)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => generatePDF('analise-inicial')}>
                Baixar Análise Inicial (PDF)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => generatePDF('promotor')}>
                Baixar Argumentos do Promotor (PDF)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => generatePDF('defesa')}>
                Baixar Argumentos da Defesa (PDF)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => generatePDF('decisao')}>
                Baixar Decisão do Juiz (PDF)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => generatePDF('melhorias')}>
                Baixar Relatório de Melhorias (PDF)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Case Text */}
        <Card className="card-legal mb-6">
          <CardHeader>
            <CardTitle>Texto Original da Petição</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="legal-document whitespace-pre-wrap">
              {caseData.caso.texto_original}
            </p>
          </CardContent>
        </Card>

        {/* Process Timeline */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Timeline do Processo</h2>
          
          {/* Initial Analysis */}
          {caseData.analise_inicial && (
            <Collapsible 
              open={openSections.includes('analise_inicial')}
              onOpenChange={() => toggleSection('analise_inicial')}
            >
              <Card className="card-legal">
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="hover:bg-gray-50 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center space-x-2">
                        <Scale className="h-5 w-5 text-primary" />
                        <span>Análise Inicial</span>
                      </CardTitle>
                      <ChevronDown className={`h-4 w-4 transition-transform ${
                        openSections.includes('analise_inicial') ? 'rotate-180' : ''
                      }`} />
                    </div>
                    <CardDescription className="text-left">
                      {formatDate(caseData.analise_inicial.created_at)}
                    </CardDescription>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Tipo de Processo:</h4>
                        <p>{caseData.analise_inicial.tipo_processo}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Pontos Principais:</h4>
                        <p className="whitespace-pre-wrap">{caseData.analise_inicial.pontos_principais}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Evidências:</h4>
                        <p className="whitespace-pre-wrap">{caseData.analise_inicial.evidencias}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Complexidade:</h4>
                        <Badge variant="outline">{caseData.analise_inicial.complexidade}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}

          {/* Interactions */}
          {caseData.interacoes.map((interacao, index) => (
            <Collapsible key={interacao.id}>
              <Card className="card-legal">
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="hover:bg-gray-50 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <CardTitle className={`flex items-center space-x-2 ${getAgentColor(interacao.agente)}`}>
                        {getAgentIcon(interacao.agente)}
                        <span className="capitalize">
                          {interacao.agente} - {interacao.tipo_interacao}
                        </span>
                        <Badge variant="outline" className="ml-2">
                          Rodada {interacao.rodada}
                        </Badge>
                      </CardTitle>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                    <CardDescription className="text-left">
                      {formatDate(interacao.timestamp_interacao)}
                    </CardDescription>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <p className="legal-document whitespace-pre-wrap">
                      {interacao.conteudo}
                    </p>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}

          {/* Sentence */}
          {caseData.sentenca && (
            <Collapsible>
              <Card className="card-legal border-purple-200">
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="hover:bg-purple-50 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center space-x-2 text-purple-600">
                        <Gavel className="h-5 w-5" />
                        <span>Sentença Final</span>
                      </CardTitle>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                    <CardDescription className="text-left">
                      {formatDate(caseData.sentenca.timestamp_sentenca)}
                    </CardDescription>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Análise Judicial:</h4>
                        <p className="legal-document whitespace-pre-wrap">
                          {caseData.sentenca.analise_judicial}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Sentença:</h4>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <p className="legal-document whitespace-pre-wrap font-medium">
                            {caseData.sentenca.sentenca_final}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}

          {/* Improvement Report */}
          {caseData.relatorio && (
            <Collapsible>
              <Card className="card-legal border-green-200">
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="hover:bg-green-50 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center space-x-2 text-green-600">
                        <FileText className="h-5 w-5" />
                        <span>Relatório de Melhorias</span>
                      </CardTitle>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                    <CardDescription className="text-left">
                      {formatDate(caseData.relatorio.timestamp_relatorio)}
                    </CardDescription>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="legal-document whitespace-pre-wrap">
                        {caseData.relatorio.relatorio_completo}
                      </p>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseDetail;
