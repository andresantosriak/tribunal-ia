
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Calendar, 
  Eye, 
  RefreshCw, 
  Loader2, 
  AlertCircle,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useCaseHistory } from '@/hooks/useCaseHistory';
import { Link } from 'react-router-dom';

const CaseHistory = () => {
  const { cases, isLoading, error, refreshCases } = useCaseHistory();

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

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processando':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Processando
          </Badge>
        );
      case 'concluido':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Concluído
          </Badge>
        );
      case 'erro':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Erro
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Histórico de Casos</CardTitle>
            <CardDescription>
              Acompanhe o status dos seus casos submetidos
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshCases}
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
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Carregando histórico de casos...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            <AlertCircle className="h-4 w-4" />
            <div>
              <p className="font-medium">Erro ao carregar casos</p>
              <p className="text-sm">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshCases}
                className="mt-2"
              >
                Tentar novamente
              </Button>
            </div>
          </div>
        )}

        {/* Cases List */}
        {!isLoading && !error && (
          <ScrollArea className="h-[400px] w-full">
            <div className="space-y-3">
              {cases.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Nenhum caso encontrado</p>
                  <p className="text-sm">Envie sua primeira petição para começar</p>
                </div>
              ) : (
                cases.map((caso) => (
                  <Card key={caso.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
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
                ))
              )}
            </div>
          </ScrollArea>
        )}

        {/* Debug Info */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
          <p><strong>Debug Casos:</strong></p>
          <p>Loading: {isLoading ? 'Sim' : 'Não'}</p>
          <p>Erro: {error || 'Nenhum'}</p>
          <p>Total casos: {cases.length}</p>
          <p>Por status: {cases.reduce((acc, c) => {
            acc[c.status] = (acc[c.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CaseHistory;
