
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  refresh-ccw, 
  message-square, 
  scale, 
  briefcase, 
  gavel, 
  file-text,
  calendar,
  loader-2,
  alert-circle
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
        return 'scale';
      case 'advogado':
        return 'briefcase';
      case 'juiz':
        return 'gavel';
      case 'relatorio':
        return 'file-text';
      default:
        return 'message-square';
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
            <div className="h-12 w-12 mx-auto mb-4 opacity-50 flex items-center justify-center">
              <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-lg font-medium">Nenhuma conversa encontrada</p>
            <p className="text-sm">Conversas com {personaType} aparecerão aqui</p>
          </div>
        ) : (
          conversations.map((conversation, index) => (
            <Card key={`${conversation.caso_id}-${conversation.rodada}-${index}`} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {getPersonaIcon(conversation.agente) === 'scale' && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        )}
                        {getPersonaIcon(conversation.agente) === 'briefcase' && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0v6a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0V4a2 2 0 00-2-2H10a2 2 0 00-2 2v2" />
                        )}
                        {getPersonaIcon(conversation.agente) === 'gavel' && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        )}
                        {getPersonaIcon(conversation.agente) === 'file-text' && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        )}
                      </svg>
                    </div>
                    <Badge className={getPersonaColor(conversation.agente)}>
                      {conversation.agente}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Rodada {conversation.rodada}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
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
              <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Estado de loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-muted-foreground">
              <svg className="h-5 w-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Carregando histórico de conversas...</span>
            </div>
          </div>
        )}

        {/* Tratamento de erro */}
        {error && !isLoading && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
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
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Promotor
                <Badge variant="secondary" className="ml-1">
                  {groupedConversations.promotor.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="advogado" className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0v6a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0V4a2 2 0 00-2-2H10a2 2 0 00-2 2v2" />
                </svg>
                Advogado
                <Badge variant="secondary" className="ml-1">
                  {groupedConversations.advogado.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="juiz" className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Juiz
                <Badge variant="secondary" className="ml-1">
                  {groupedConversations.juiz.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="relatorio" className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
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
