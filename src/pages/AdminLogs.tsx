
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Search, Activity, FileText, User, Settings } from 'lucide-react';

interface LogEntry {
  id: number;
  usuario_id: string;
  caso_id: string | null;
  acao: string;
  timestamp_acao: string;
  usuario?: {
    nome: string;
    email: string;
  };
}

const AdminLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('logs_uso')
        .select(`
          *,
          usuario:usuarios(nome, email)
        `)
        .order('timestamp_acao', { ascending: false })
        .limit(500); // Limit to last 500 logs

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
      case 'logout':
        return <User className="h-4 w-4" />;
      case 'nova_peticao':
      case 'visualizar_caso':
        return <FileText className="h-4 w-4" />;
      case 'configuracao':
        return <Settings className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
        return 'text-green-600';
      case 'logout':
        return 'text-red-600';
      case 'nova_peticao':
        return 'text-blue-600';
      case 'configuracao':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.acao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.caso_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.usuario?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.usuario?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterAction === 'all' || log.acao.toLowerCase().includes(filterAction.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionBadge = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
        return <Badge className="bg-green-100 text-green-800">Login</Badge>;
      case 'logout':
        return <Badge className="bg-red-100 text-red-800">Logout</Badge>;
      case 'nova_peticao':
        return <Badge className="bg-blue-100 text-blue-800">Nova Petição</Badge>;
      case 'visualizar_caso':
        return <Badge className="bg-gray-100 text-gray-800">Visualizar Caso</Badge>;
      case 'configuracao':
        return <Badge className="bg-purple-100 text-purple-800">Configuração</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Logs">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando logs...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Logs do Sistema">
      <div className="space-y-6">
        {/* Filters */}
        <Card className="card-legal">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por ação, caso, usuário ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por ação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as ações</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="nova_peticao">Nova Petição</SelectItem>
                  <SelectItem value="visualizar_caso">Visualizar Caso</SelectItem>
                  <SelectItem value="configuracao">Configuração</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="card-legal">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-gray-600">Total de Logs</p>
                  <p className="text-2xl font-bold">{logs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-legal">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Logins</p>
                  <p className="text-2xl font-bold">
                    {logs.filter(log => log.acao.toLowerCase() === 'login').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-legal">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Petições</p>
                  <p className="text-2xl font-bold">
                    {logs.filter(log => log.acao.toLowerCase() === 'nova_peticao').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-legal">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Configurações</p>
                  <p className="text-2xl font-bold">
                    {logs.filter(log => log.acao.toLowerCase() === 'configuracao').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logs Table */}
        <Card className="card-legal">
          <CardHeader>
            <CardTitle>
              Logs de Atividade ({filteredLogs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Caso ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {formatDateTime(log.timestamp_acao)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.usuario?.nome || 'N/A'}</div>
                          <div className="text-sm text-gray-600">{log.usuario?.email || 'N/A'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className={getActionColor(log.acao)}>
                            {getActionIcon(log.acao)}
                          </span>
                          {getActionBadge(log.acao)}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">
                        {log.caso_id || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredLogs.length === 0 && (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum log encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminLogs;
