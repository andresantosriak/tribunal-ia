
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  RefreshCw, 
  MessageSquare, 
  Scale, 
  Briefcase, 
  Gavel, 
  FileText,
  Calendar,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useConversationHistory } from '@/hooks/useConversationHistory';

const ConversationHistory = () => {
  const { 
    groupedConversations, 
    isLoading, 
    error, 
    refreshHistory
  } = useConversationHistory();

  const [selectedTab, setSelectedTab] = useState('promotor');

  // Função para formatar data
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data inválida';
    }
  };

  // Função para obter ícone da persona
  const getPersonaIcon = (agente: string) => {
    switch (agente.toLowerCase()) {
      case 'promotor':
        return <Scale className="h-4 w-4" />;
      case 'advogado':
        return <Briefcase className="h-4 w-4" />;
      case 'juiz':
        return <Gavel className="h-4 w-4" />;
      case 'relatorio':
        return <FileText className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  // Função para obter cor da persona
  const getPersonaColor = (agente: string) => {
    switch (agente.toLowerCase()) {
      case 'promotor':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'advogado':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'juiz':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'relatorio':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Função para renderizar lista de conversas
  const renderConversationList = (conversations: any[], personaType: string) => (
    <ScrollArea className="h-[400px] w-full">
      <div className="space-y-3 p-1">
        {conversations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Nenhuma conversa encontrada</p>
            <p className="text-sm">Conversas com {personaType} aparecerão aqui</p>
          </div>
        ) : (
          conversations.map((conversation, index) => (
            <Card key={`${conversation.caso_id}-${conversation.rodada}-${index}`} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getPersonaIcon(conversation.agente)}
                    <Badge className={getPersonaColor(conversation.agente)}>
                      {conversation.agente}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Rodada {conversation.rodada}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(conversation.timestamp_interacao)}
                  </div>
                </div>
                
                <div className="text-sm mb-2">
                  <span className="font-medium text-muted-foreground">Caso: </span>
                  <span className="font-mono text-xs">{conversation.caso_id}</span>
                </div>
                
                <div className="text-sm leading-relaxed">
                  <p className="line-clamp-3">{conversation.conteudo}</p>
                </div>
                
                {conversation.conteudo?.length > 150 && (
                  <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto text-blue-600">
                    Ver conversa completa
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </ScrollArea>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Histórico de Conversas</CardTitle>
            <CardDescription>
              Acompanhe suas interações com as diferentes personas do sistema
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshHistory}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Estado de loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Carregando histórico de conversas...</span>
            </div>
          </div>
        )}

        {/* Tratamento de erro */}
        {error && !isLoading && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            <AlertCircle className="h-4 w-4" />
            <div>
              <p className="font-medium">Erro ao carregar histórico</p>
              <p className="text-sm">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshHistory}
                className="mt-2"
              >
                Tentar novamente
              </Button>
            </div>
          </div>
        )}

        {/* Tabs com conversas por persona */}
        {!isLoading && !error && (
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="promotor" className="flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Promotor
                <Badge variant="secondary" className="ml-1">
                  {groupedConversations.promotor.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="advogado" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Advogado
                <Badge variant="secondary" className="ml-1">
                  {groupedConversations.advogado.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="juiz" className="flex items-center gap-2">
                <Gavel className="h-4 w-4" />
                Juiz
                <Badge variant="secondary" className="ml-1">
                  {groupedConversations.juiz.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="relatorio" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Relatório
                <Badge variant="secondary" className="ml-1">
                  {groupedConversations.relatorio.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="promotor" className="mt-4">
              {renderConversationList(groupedConversations.promotor, 'Promotor')}
            </TabsContent>

            <TabsContent value="advogado" className="mt-4">
              {renderConversationList(groupedConversations.advogado, 'Advogado')}
            </TabsContent>

            <TabsContent value="juiz" className="mt-4">
              {renderConversationList(groupedConversations.juiz, 'Juiz')}
            </TabsContent>

            <TabsContent value="relatorio" className="mt-4">
              {renderConversationList(groupedConversations.relatorio, 'Relatório')}
            </TabsContent>
          </Tabs>
        )}

        {/* Debug info */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
          <p><strong>Debug Histórico:</strong></p>
          <p>Loading: {isLoading ? 'Sim' : 'Não'}</p>
          <p>Erro: {error || 'Nenhum'}</p>
          <p>Total conversas: {
            groupedConversations.promotor.length + 
            groupedConversations.advogado.length + 
            groupedConversations.juiz.length + 
            groupedConversations.relatorio.length
          }</p>
          <p>Por persona: P:{groupedConversations.promotor.length} | A:{groupedConversations.advogado.length} | J:{groupedConversations.juiz.length} | R:{groupedConversations.relatorio.length}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationHistory;
