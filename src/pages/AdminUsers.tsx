
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
import { Search, RotateCcw, Trash2, Shield, User } from 'lucide-react';

interface Usuario {
  id: string;
  email: string;
  nome: string;
  tipo_usuario: 'admin' | 'usuario';
  peticoes_usadas: number;
  created_at: string;
  updated_at: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion para garantir que os dados sejam do tipo correto
      const usersData: Usuario[] = (data || []).map(user => ({
        id: user.id,
        email: user.email,
        nome: user.nome,
        tipo_usuario: user.tipo_usuario as 'admin' | 'usuario',
        peticoes_usadas: user.peticoes_usadas || 0,
        created_at: user.created_at,
        updated_at: user.updated_at
      }));
      
      setUsers(usersData);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetUserPetitions = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ peticoes_usadas: 0 })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Contador resetado",
        description: "O contador de petições foi resetado com sucesso",
      });

      await fetchUsers();
    } catch (error) {
      console.error('Erro ao resetar petições:', error);
      toast({
        title: "Erro",
        description: "Não foi possível resetar o contador",
        variant: "destructive",
      });
    }
  };

  const toggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'usuario' : 'admin';
    
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ tipo_usuario: newRole })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Tipo de usuário alterado",
        description: `Usuário agora é ${newRole}`,
      });

      await fetchUsers();
    } catch (error) {
      console.error('Erro ao alterar tipo de usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o tipo de usuário",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // Deletar casos do usuário primeiro (cascade)
      await supabase
        .from('casos')
        .delete()
        .eq('usuario_id', userId);

      // Deletar usuário
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Usuário deletado",
        description: "Usuário e todos os dados relacionados foram removidos",
      });

      await fetchUsers();
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar o usuário",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || user.tipo_usuario === filterType;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <AdminLayout title="Usuários">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando usuários...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Gestão de Usuários">
      <div className="space-y-6">
        {/* Filtros */}
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
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os usuários</SelectItem>
                  <SelectItem value="admin">Administradores</SelectItem>
                  <SelectItem value="usuario">Usuários</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Usuários */}
        <Card className="card-legal">
          <CardHeader>
            <CardTitle>
              Usuários ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Petições Usadas</TableHead>
                    <TableHead>Data Cadastro</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.nome}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.tipo_usuario === 'admin' ? 'default' : 'secondary'}>
                          {user.tipo_usuario === 'admin' ? (
                            <><Shield className="h-3 w-3 mr-1" />Admin</>
                          ) : (
                            <><User className="h-3 w-3 mr-1" />Usuário</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.peticoes_usadas}/5</TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resetUserPetitions(user.id)}
                            title="Resetar contador de petições"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleUserRole(user.id, user.tipo_usuario)}
                            title={user.tipo_usuario === 'admin' ? 'Rebaixar para usuário' : 'Promover para admin'}
                          >
                            {user.tipo_usuario === 'admin' ? (
                              <User className="h-4 w-4" />
                            ) : (
                              <Shield className="h-4 w-4" />
                            )}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                title="Deletar usuário"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Deletar usuário</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja deletar o usuário "{user.nome}"? 
                                  Esta ação irá remover todos os casos relacionados e não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteUser(user.id)}
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
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum usuário encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
