
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Database, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  Users,
  FileText,
  MessageSquare
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface DebugInfo {
  connection: 'connected' | 'disconnected' | 'unknown';
  tables: {
    usuarios: number;
    casos: number;
    historico_interacoes: number;
    configuracoes: number;
  };
  userInfo: any;
  lastUpdated: Date;
}

const SupabaseDebugPanel = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    connection: 'unknown',
    tables: { usuarios: 0, casos: 0, historico_interacoes: 0, configuracoes: 0 },
    userInfo: null,
    lastUpdated: new Date()
  });
  const [isLoading, setIsLoading] = useState(false);
  const { user, userProfile } = useAuth();

  const checkSupabaseConnection = async () => {
    setIsLoading(true);
    
    try {
      // Test connection
      const { data: connectionTest, error: connectionError } = await supabase
        .from('usuarios')
        .select('count')
        .limit(1);

      if (connectionError) {
        throw connectionError;
      }

      // Get table counts
      const tables = { usuarios: 0, casos: 0, historico_interacoes: 0, configuracoes: 0 };

      try {
        const { data: usuarios } = await supabase.from('usuarios').select('id');
        tables.usuarios = usuarios?.length || 0;
      } catch (e) {
        console.warn('Erro ao contar usuários:', e);
      }

      try {
        const { data: casos } = await supabase.from('casos').select('id');
        tables.casos = casos?.length || 0;
      } catch (e) {
        console.warn('Erro ao contar casos:', e);
      }

      try {
        const { data: interacoes } = await supabase.from('historico_interacoes').select('id');
        tables.historico_interacoes = interacoes?.length || 0;
      } catch (e) {
        console.warn('Erro ao contar interações:', e);
      }

      try {
        const { data: configs } = await supabase.from('configuracoes').select('id');
        tables.configuracoes = configs?.length || 0;
      } catch (e) {
        console.warn('Erro ao contar configurações:', e);
      }

      setDebugInfo({
        connection: 'connected',
        tables,
        userInfo: {
          authenticated: !!user,
          userId: user?.id,
          email: user?.email,
          role: user?.role,
          profileLoaded: !!userProfile
        },
        lastUpdated: new Date()
      });

    } catch (error) {
      console.error('Erro na conexão com Supabase:', error);
      setDebugInfo(prev => ({
        ...prev,
        connection: 'disconnected',
        lastUpdated: new Date()
      }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSupabaseConnection();
  }, [user]);

  const getConnectionIcon = () => {
    switch (debugInfo.connection) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-600" />;
      case 'disconnected':
        return <WifiOff className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getConnectionBadge = () => {
    switch (debugInfo.connection) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">Conectado</Badge>;
      case 'disconnected':
        return <Badge className="bg-red-100 text-red-800">Desconectado</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Verificando</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <div>
              <CardTitle>Debug Supabase</CardTitle>
              <CardDescription>
                Status da conexão e informações do banco de dados
              </CardDescription>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkSupabaseConnection}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {getConnectionIcon()}
            <span className="font-medium">Status da Conexão</span>
          </div>
          {getConnectionBadge()}
        </div>

        {/* Table Counts */}
        <div>
          <h4 className="font-medium mb-3">Contadores de Tabelas</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Usuários</p>
                <p className="text-lg font-bold text-blue-600">{debugInfo.tables.usuarios}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
              <FileText className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Casos</p>
                <p className="text-lg font-bold text-green-600">{debugInfo.tables.casos}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
              <MessageSquare className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Interações</p>
                <p className="text-lg font-bold text-purple-600">{debugInfo.tables.historico_interacoes}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
              <Database className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Configurações</p>
                <p className="text-lg font-bold text-orange-600">{debugInfo.tables.configuracoes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div>
          <h4 className="font-medium mb-3">Informações do Usuário</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              {debugInfo.userInfo?.authenticated ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span>Autenticado: {debugInfo.userInfo?.authenticated ? 'Sim' : 'Não'}</span>
            </div>
            
            {debugInfo.userInfo?.authenticated && (
              <>
                <p><strong>ID:</strong> {debugInfo.userInfo.userId}</p>
                <p><strong>Email:</strong> {debugInfo.userInfo.email}</p>
                <p><strong>Role:</strong> {debugInfo.userInfo.role}</p>
                <p><strong>Perfil carregado:</strong> {debugInfo.userInfo.profileLoaded ? 'Sim' : 'Não'}</p>
              </>
            )}
          </div>
        </div>

        {/* System Info */}
        <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
          <p><strong>Última atualização:</strong> {debugInfo.lastUpdated.toLocaleString()}</p>
          <p><strong>URL Supabase:</strong> https://qiixqgpxababepvpkqob.supabase.co</p>
          <p><strong>Status geral:</strong> {debugInfo.connection === 'connected' ? 'Sistema operacional' : 'Problemas detectados'}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupabaseDebugPanel;
