
import React, { createContext, useContext } from 'react';
import { useAuth as useAuthHook } from '@/hooks/useAuth';

interface AuthContextType {
  user: any;
  userProfile: any;
  session: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nome: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuthHook();

  // Adaptar interface para compatibilidade com código existente
  const adaptedAuth: AuthContextType = {
    user: auth.user ? {
      id: auth.user.id,
      email: auth.user.email,
      user_metadata: { nome: auth.user.name }
    } : null,
    userProfile: auth.user ? {
      id: auth.user.id,
      email: auth.user.email,
      nome: auth.user.name,
      tipo_usuario: auth.user.role,
      peticoes_usadas: 0
    } : null,
    session: auth.user ? { user: auth.user } : null,
    loading: auth.loading,
    signIn: async (email: string, password: string) => {
      const result = await auth.login(email, password);
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    signUp: async (email: string, password: string, nome: string) => {
      // Para compatibilidade - não implementado no hook atual
      throw new Error('Cadastro não implementado');
    },
    signOut: auth.logout,
    refreshProfile: async () => {
      // Para compatibilidade - não necessário no hook atual
    }
  };

  return <AuthContext.Provider value={adaptedAuth}>{children}</AuthContext.Provider>;
};
