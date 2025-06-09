
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Scale, LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const UserHeader = () => {
  const { userProfile, signOut } = useAuth();

  const maxPeticoes = 5; // This should come from system settings
  const peticionesRestantes = maxPeticoes - (userProfile?.peticoes_usadas || 0);

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Scale className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-primary">Tribunal de IA</h1>
        </div>
        
        <div className="flex items-center space-x-6">
          {/* Petition counter */}
          <div className="bg-gray-100 px-4 py-2 rounded-lg">
            <span className="text-sm font-medium text-gray-700">
              Petições: {peticionesRestantes}/{maxPeticoes} restantes
            </span>
          </div>
          
          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>{userProfile?.nome}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {userProfile?.tipo_usuario === 'admin' && (
                <DropdownMenuItem onClick={() => window.location.href = '/admin'}>
                  Painel Admin
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default UserHeader;
