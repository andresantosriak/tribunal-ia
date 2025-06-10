
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

// Usuários padrão para fallback/teste
const DEFAULT_USERS = [
  {
    id: '1',
    email: 'admin@tribunal.com',
    password: 'admin123',
    role: 'admin' as const,
    name: 'Administrador'
  },
  {
    id: '2',
    email: 'usuario@tribunal.com',
    password: 'user123',
    role: 'user' as const,
    name: 'Usuário'
  },
  {
    id: '3',
    email: 'santoscydnei@gmail.com',
    password: 'senha123',
    role: 'admin' as const,
    name: 'Santos Cydnei'
  },
  {
    id: '4',
    email: 'admin@demo.com',
    password: 'admin123demo',
    role: 'admin' as const,
    name: 'Admin Demo'
  }
];

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => {
    // Tentar recuperar usuário da sessão
    try {
      const savedUser = sessionStorage.getItem('tribunal_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  
  const [loading, setLoading] = useState(false);

  // Salvar usuário na sessão
  const saveUserToSession = (user: User | null) => {
    if (user) {
      sessionStorage.setItem('tribunal_user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('tribunal_user');
    }
    setUser(user);
  };

  // Login com fallback
  const login = async (email: string, password: string): Promise<AuthResult> => {
    setLoading(true);
    
    try {
      // Primeiro, tentar login com usuários padrão
      const defaultUser = DEFAULT_USERS.find(
        u => u.email === email && u.password === password
      );

      if (defaultUser) {
        const { password: _, ...userWithoutPassword } = defaultUser;
        saveUserToSession(userWithoutPassword);
        
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${userWithoutPassword.name}`,
        });
        
        return { success: true, user: userWithoutPassword };
      }

      // Se não encontrar nos usuários padrão, tentar Supabase
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Buscar perfil do usuário no Supabase
          const { data: profile } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .single();

          const userProfile: User = {
            id: data.user.id,
            email: data.user.email || email,
            name: profile?.nome || data.user.email || 'Usuário',
            role: profile?.tipo_usuario === 'admin' ? 'admin' : 'user'
          };

          saveUserToSession(userProfile);
          
          toast({
            title: "Login realizado com sucesso!",
            description: `Bem-vindo, ${userProfile.name}`,
          });

          return { success: true, user: userProfile };
        }
      } catch (supabaseError) {
        console.log('Supabase login falhou, usando apenas usuários padrão');
      }

      // Se chegou aqui, credenciais inválidas
      return { success: false, error: 'Credenciais inválidas' };

    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: 'Erro inesperado no login' };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      // Tentar logout do Supabase se estiver conectado
      await supabase.auth.signOut();
    } catch (error) {
      console.log('Erro no logout do Supabase:', error);
    }
    
    saveUserToSession(null);
    
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
  };

  // Verificar se é admin
  const isAdmin = user?.role === 'admin';
  
  // Verificar se está autenticado
  const isAuthenticated = !!user;

  return {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    logout
  };
};
