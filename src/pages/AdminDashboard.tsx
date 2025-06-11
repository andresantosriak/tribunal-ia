
import React, { useState, useEffect } from 'react';
import { Shield, Settings, Users, BarChart, Database } from 'lucide-react';
import Header from '@/components/Header';
import CaseHistory from '@/components/dashboard/CaseHistory';
import SupabaseDebugPanel from '@/components/debug/SupabaseDebugPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseData } from '@/hooks/useSupabaseData';

interface Stats {
  totalUsers: number;
  totalCases: number;
  completedCases: number;
  processingCases: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalCases: 0,
    completedCases: 0,
    processingCases: 0,
  });

  // Carregar estatísticas
  const { data: users } = useSupabaseData({ table: 'usuarios' });
  const { data: cases } = useSupabaseData({ table: 'casos' });

  useEffect(() => {
    setStats({
      totalUsers: users.length,
      totalCases: cases.length,
      completedCases: cases.filter(c => c.status === 'concluido').length,
      processingCases: cases.filter(c => c.status === 'processando').length,
    });
  }, [users, cases]);

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
    <Card>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Painel Administrativo" 
        icon={<Shield className="h-8 w-8 text-red-600" />}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total de Usuários"
            value={stats.totalUsers}
            icon={Users}
            color="text-blue-600"
          />
          <StatCard
            title="Total de Casos"
            value={stats.totalCases}
            icon={BarChart}
            color="text-green-600"
          />
          <StatCard
            title="Casos Concluídos"
            value={stats.completedCases}
            icon={BarChart}
            color="text-green-600"
          />
          <StatCard
            title="Casos Processando"
            value={stats.processingCases}
            icon={BarChart}
            color="text-yellow-600"
          />
        </div>

        <Tabs defaultValue="cases" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 h-auto sm:h-10">
            <TabsTrigger value="cases" className="text-xs sm:text-sm py-2">
              <BarChart className="h-4 w-4 mr-1 sm:mr-2" />
              Casos
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm py-2">
              <Users className="h-4 w-4 mr-1 sm:mr-2" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="debug" className="text-xs sm:text-sm py-2">
              <Database className="h-4 w-4 mr-1 sm:mr-2" />
              Debug
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cases">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Casos</CardTitle>
                <CardDescription>
                  Visualize e gerencie todos os casos do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CaseHistory />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Usuários</CardTitle>
                <CardDescription>
                  Administre usuários e permissões do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Funcionalidade em desenvolvimento</p>
                  <p className="text-sm text-muted-foreground">
                    Total de usuários: {stats.totalUsers}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="debug">
            <SupabaseDebugPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
