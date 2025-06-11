
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Users, FileText, CheckCircle, Clock, TrendingUp, Calendar } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalCases: number;
  completedCases: number;
  processingCases: number;
  casesToday: number;
  casesThisWeek: number;
  casesThisMonth: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalCases: 0,
    completedCases: 0,
    processingCases: 0,
    casesToday: 0,
    casesThisWeek: 0,
    casesThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Total de usuários
      const { count: totalUsers } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true });

      // Total de casos
      const { count: totalCases } = await supabase
        .from('casos')
        .select('*', { count: 'exact', head: true });

      // Casos concluídos
      const { count: completedCases } = await supabase
        .from('casos')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'concluido');

      // Casos processando
      const { count: processingCases } = await supabase
        .from('casos')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'processando');

      // Casos hoje
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: casesToday } = await supabase
        .from('casos')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Casos esta semana
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: casesThisWeek } = await supabase
        .from('casos')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      // Casos este mês
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const { count: casesThisMonth } = await supabase
        .from('casos')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthAgo.toISOString());

      setStats({
        totalUsers: totalUsers || 0,
        totalCases: totalCases || 0,
        completedCases: completedCases || 0,
        processingCases: processingCases || 0,
        casesToday: casesToday || 0,
        casesThisWeek: casesThisWeek || 0,
        casesThisMonth: casesThisMonth || 0,
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color = "text-primary" 
  }: { 
    title: string; 
    value: number; 
    icon: any; 
    color?: string; 
  }) => (
    <Card className="card-legal">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando estatísticas...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total de Usuários"
            value={stats.totalUsers}
            icon={Users}
            color="text-blue-600"
          />
          <StatCard
            title="Total de Casos"
            value={stats.totalCases}
            icon={FileText}
            color="text-green-600"
          />
          <StatCard
            title="Casos Concluídos"
            value={stats.completedCases}
            icon={CheckCircle}
            color="text-green-600"
          />
          <StatCard
            title="Casos Processando"
            value={stats.processingCases}
            icon={Clock}
            color="text-yellow-600"
          />
        </div>

        {/* Estatísticas por Tempo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Casos Hoje"
            value={stats.casesToday}
            icon={Calendar}
            color="text-primary"
          />
          <StatCard
            title="Casos Esta Semana"
            value={stats.casesThisWeek}
            icon={TrendingUp}
            color="text-primary"
          />
          <StatCard
            title="Casos Este Mês"
            value={stats.casesThisMonth}
            icon={TrendingUp}
            color="text-primary"
          />
        </div>

        {/* Atividade Recente */}
        <Card className="card-legal">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">Sistema funcionando normalmente</p>
                  <p className="text-sm text-gray-600">
                    {stats.totalCases} casos processados até agora
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium">{stats.totalUsers} usuários registrados</p>
                  <p className="text-sm text-gray-600">
                    Sistema de autenticação ativo
                  </p>
                </div>
              </div>

              {stats.processingCases > 0 && (
                <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div className="flex-1">
                    <p className="font-medium">{stats.processingCases} casos em processamento</p>
                    <p className="text-sm text-gray-600">
                      Aguardando conclusão do webhook
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
