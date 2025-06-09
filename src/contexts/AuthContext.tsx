
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  email: string;
  nome: string;
  tipo_usuario: 'admin' | 'usuario';
  peticoes_usadas: number;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string, userEmail: string) => {
    try {
      console.log('Buscando perfil do usuário:', { userId, userEmail });
      
      // Primeiro tenta buscar pelo auth.user id
      let { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single();

      // Se não encontrar pelo ID, busca pelo email
      if (error || !data) {
        console.log('Não encontrou por ID, tentando por email...');
        const emailResult = await supabase
          .from('usuarios')
          .select('*')
          .eq('email', userEmail)
          .single();
        
        data = emailResult.data;
        error = emailResult.error;
      }

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        throw error;
      }
      
      console.log('Perfil encontrado:', data);
      
      // Type assertion para garantir que tipo_usuario seja do tipo correto
      const profileData: UserProfile = {
        id: data.id,
        email: data.email,
        nome: data.nome,
        tipo_usuario: data.tipo_usuario as 'admin' | 'usuario',
        peticoes_usadas: data.peticoes_usadas || 0
      };
      
      console.log('Perfil processado:', profileData);
      setUserProfile(profileData);
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      
      // Se não encontrar na tabela usuarios, criar um perfil básico
      if (user) {
        try {
          const { error: insertError } = await supabase
            .from('usuarios')
            .insert({
              id: userId,
              email: userEmail,
              nome: user.user_metadata?.nome || user.email || 'Usuário',
              tipo_usuario: 'usuario',
              peticoes_usadas: 0
            });
          
          if (!insertError) {
            // Recursivamente buscar o perfil recém-criado
            await fetchUserProfile(userId, userEmail);
          }
        } catch (insertError) {
          console.error('Erro ao criar perfil:', insertError);
        }
      }
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id, user.email || '');
    }
  };

  useEffect(() => {
    console.log('Inicializando AuthProvider...');
    
    // Obter sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Sessão inicial:', session);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user.email || '');
      }
      setLoading(false);
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Mudança de auth:', { event, session });
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id, session.user.email || '');
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('Tentando fazer login:', email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
    
    console.log('Login realizado com sucesso');
  };

  const signUp = async (email: string, password: string, nome: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome: nome,
        },
      },
    });

    if (error) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    if (data.user && !data.session) {
      toast({
        title: "Verificação necessária",
        description: "Verifique seu email para ativar a conta",
      });
    }
  };

  const signOut = async () => {
    console.log('Fazendo logout...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    userProfile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
