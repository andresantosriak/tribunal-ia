
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Search, Eye, Trash2, Download, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CasoWithUser {
  id: number;
  caso_id: string;
  texto_original: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  usuario: {
    nome: string;
    email: string;
  } | null;
}

const AdminCases = () => {
  const [cases, setCases] = useState<CasoWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const { data, error } = await supabase
        .from('casos')
        .select(`
          *,
          usuario:usuarios(nome, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCases(data || []);
    } catch (error) {
      console.error('Erro ao buscar casos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os casos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteCase = async (caseId: number, casoId: string) => {
    try {
      // Deletar dados relacionados primeiro
      await supabase.from('relatorios_melhorias').delete().eq('caso_id', casoId);
      await supabase.from('sentencas').delete().eq('caso_id', casoId);
      await supabase.from('historico_interacoes').delete().eq('caso_id', casoId);
      await supabase.from('analises_iniciais').delete().eq('caso_id', casoId);
      
      // Deletar caso principal
      const { error } = await supabase
        .from('casos')
        .delete()
        .eq('id', caseId);

      if (error) throw error;

      toast({
        title: "Caso deletado",
        description: "Caso e todos os dados relacionados foram removidos",
      });

      await fetchCases();
    } catch (error) {
      console.error('Erro ao deletar caso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar o caso",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Caso ID', 'Usuário', 'Email', 'Status', 'Data Criação', 'Data Conclusão'],
      ...filteredCases.map(caso => [
        caso.caso_id,
        caso.usuario?.nome || 'N/A',
        caso.usuario?.email || 'N/A',
        caso.status,
        formatDate(caso.created_at),
        caso.completed_at ? formatDate(caso.completed_at) : 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `casos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredCases = cases.filter(caso => {
    const matchesSearch = caso.caso_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caso.usuario?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caso.usuario?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || caso.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processando':
        return <Badge className="bg-yellow-100 text-yellow-800">Processando</Badge>;
      case 'concluido':
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Casos">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando casos...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Gestão de Casos">
      <div className="space-y-6">
        {/* Filtros e Ações */}
        <Card className="card-legal">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Filtros</span>
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por caso ID, usuário ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="processando">Processando</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Casos */}
        <Card className="card-legal">
          <CardHeader>
            <CardTitle>
              Casos ({filteredCases.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Caso ID</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Criação</TableHead>
                    <TableHead>Data Conclusão</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCases.map((caso) => (
                    <TableRow key={caso.id}>
                      <TableCell className="font-medium">{caso.caso_id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{caso.usuario?.nome || 'N/A'}</div>
                          <div className="text-sm text-gray-600">{caso.usuario?.email || 'N/A'}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(caso.status)}</TableCell>
                      <TableCell>{formatDate(caso.created_at)}</TableCell>
                      <TableCell>
                        {caso.completed_at ? formatDate(caso.completed_at) : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Link to={`/case/${caso.caso_id}`}>
                            <Button size="sm" variant="outline" title="Ver caso">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                title="Deletar caso"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Deletar caso</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja deletar o caso "{caso.caso_id}"? 
                                  Esta ação irá remover todos os dados relacionados (análises, 
                                  interações, sentença, relatórios) e não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteCase(caso.id, caso.caso_id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Deletar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredCases.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum caso encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminCases;
