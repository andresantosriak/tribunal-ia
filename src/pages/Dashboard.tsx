
import React from 'react';
import { User } from 'lucide-react';
import Header from '@/components/Header';
import NewPetition from '@/components/dashboard/NewPetition';
import CaseHistory from '@/components/dashboard/CaseHistory';
import ConversationHistory from '@/components/dashboard/ConversationHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Dashboard do Usuário" 
        icon={<User className="h-8 w-8 text-blue-600" />}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Tabs defaultValue="new-petition" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto sm:h-10">
            <TabsTrigger value="new-petition" className="text-xs sm:text-sm py-2">
              Nova Petição
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm py-2">
              Histórico de Casos
            </TabsTrigger>
            <TabsTrigger value="conversations" className="text-xs sm:text-sm py-2">
              Conversas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new-petition" className="space-y-6">
            <NewPetition />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <CaseHistory />
          </TabsContent>

          <TabsContent value="conversations" className="space-y-6">
            <ConversationHistory />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
