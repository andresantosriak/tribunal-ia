
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

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
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    console.log('=== INICIANDO FETCH USER PROFILE ===');
    
    try {
      setLoading(true);
      
      // Primeiro verificar se há uma sessão válida
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Sessão encontrada:', session);
      console.log('Erro da sessão:', sessionError);
      
      if (sessionError) {
        console.error('Erro ao obter sessão:', sessionError);
        setUserProfile(null);
        setLoading(false);
        return;
      }
      
      if (!session?.user) {
        console.log('Nenhuma sessão ativa encontrada');
        setUserProfile(null);
        setLoading(false);
        return;
      }
      
      const user = session.user;
      console.log('Usuário da sessão:', user.email, user.id);

      // Buscar perfil na tabela usuarios usando o ID do usuário autenticado
      const { data: profile, error: profileError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log('Resultado da busca do perfil:', { profile, profileError });

      if (profileError && profileError.code === 'PGRST116') {
        // Usuário não existe na tabela usuarios, criar automaticamente
        console.log('Usuário não encontrado na tabela usuarios, criando...');
        
        const nome = user.user_metadata?.name || 
                    user.user_metadata?.full_name || 
                    user.email?.split('@')[0] || 
                    'Usuário';

        const { data: newProfile, error: createError } = await supabase
          .from('usuarios')
          .insert([
            {
              id: user.id,
              email: user.email!,
              nome: nome,
              tipo_usuario: 'usuario',
              peticoes_usadas: 0
            }
          ])
          .select()
          .single();

        console.log('Novo perfil criado:', newProfile);
        console.log('Erro ao criar:', createError);

        if (createError) {
          console.error('Falha ao criar perfil:', createError);
          setUserProfile(null);
        } else {
          console.log('Perfil criado com sucesso, definindo no contexto');
          setUserProfile(newProfile);
        }
      } else if (profileError) {
        console.error('Erro inesperado ao buscar perfil:', profileError);
        setUserProfile(null);
      } else {
        console.log('Perfil encontrado, definindo no contexto:', profile);
        setUserProfile(profile);
      }

      // Set user and session
      setUser(user);
      setSession(session);
    } catch (error) {
      console.error('Erro geral no fetchUserProfile:', error);
      setUser(null);
      setUserProfile(null);
      setSession(null);
    } finally {
      setLoading(false);
      console.log('=== FETCH USER PROFILE FINALIZADO ===');
    }
  };

  useEffect(() => {
    // Initial auth check
    fetchUserProfile();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (session?.user) {
          setUser(session.user);
          setSession(session);
          // Fetch profile when user logs in
          setTimeout(() => {
            fetchUserProfile();
          }, 100);
        } else {
          setUser(null);
          setUserProfile(null);
          setSession(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, nome: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome }
      }
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    setUser(null);
    setUserProfile(null);
    setSession(null);
  };

  const refreshProfile = async () => {
    await fetchUserProfile();
  };

  // Adaptar interface para compatibilidade com código existente
  const adaptedAuth: AuthContextType = {
    user: user ? {
      id: user.id,
      email: user.email,
      user_metadata: { nome: userProfile?.nome || user.email?.split('@')[0] }
    } : null,
    userProfile: userProfile,
    session: session,
    loading: loading,
    signIn,
    signUp,
    signOut,
    refreshProfile
  };

  return <AuthContext.Provider value={adaptedAuth}>{children}</AuthContext.Provider>;
};
