
import { useAuth } from '@/contexts/AuthContext';
import AdminSidebar from './AdminSidebar';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { userProfile, signOut } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 ml-64 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4" />
                <span>{userProfile?.nome}</span>
                <span className="text-gray-500">({userProfile?.tipo_usuario})</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
