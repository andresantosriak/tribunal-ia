
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import UserHeader from '@/components/UserHeader';
import NewPetition from '@/components/dashboard/NewPetition';
import CaseHistory from '@/components/dashboard/CaseHistory';
import ConversationHistory from '@/components/dashboard/ConversationHistory';
import SupabaseDebugPanel from '@/components/debug/SupabaseDebugPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { FileText, Calendar, Send, Eye, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Caso {
  id: string;
  caso_id: string;
  texto_original: string;
  status: string;
  created_at: string;
  completed_at: string | null;
}

const Dashboard = () => {
  const { userProfile, refreshProfile } = useAuth();
  const [showDebug, setShowDebug] = useState(false);

  const maxPeticoes = 5; // This should come from system settings
  const peticionesRestantes = maxPeticoes - (userProfile?.peticoes_usadas || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao Tribunal de IA, {userProfile?.nome || 'Usuário'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Send className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Petições Restantes</p>
                  <p className="text-2xl font-bold">{peticionesRestantes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Petições Enviadas</p>
                  <p className="text-2xl font-bold">{userProfile?.peticoes_usadas || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Casos Ativos</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* New Petition Form */}
          <div className="lg:col-span-2 space-y-8">
            <NewPetition />
            <CaseHistory />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Ver Todos os Casos
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowDebug(!showDebug)}
                >
                  <Database className="h-4 w-4 mr-2" />
                  {showDebug ? 'Ocultar' : 'Mostrar'} Debug
                </Button>
              </CardContent>
            </Card>

            {/* Limits Card */}
            <Card>
              <CardHeader>
                <CardTitle>Seus Limites</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {peticionesRestantes}
                  </div>
                  <div className="text-sm text-gray-600">
                    restantes de {maxPeticoes}
                  </div>
                  {peticionesRestantes === 0 && (
                    <p className="text-sm text-red-600 mt-2">
                      Limite atingido. Entre em contato com o suporte.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Conversation History */}
        <div className="mt-8">
          <ConversationHistory />
        </div>

        {/* Debug Panel */}
        {showDebug && (
          <div className="mt-8">
            <SupabaseDebugPanel />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
