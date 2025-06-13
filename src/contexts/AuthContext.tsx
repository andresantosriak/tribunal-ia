
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
    console.log('=== FETCH USER PROFILE ===');
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('Auth user:', user);
      console.log('Auth error:', userError);

      if (userError || !user) {
        console.log('No authenticated user found');
        setUser(null);
        setUserProfile(null);
        setSession(null);
        setLoading(false);
        return;
      }

      console.log('User email:', user.email);
      console.log('User ID:', user.id);

      // Buscar perfil na tabela usuarios
      const { data: profile, error: profileError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log('Profile from DB:', profile);
      console.log('Profile error:', profileError);

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching user profile:', profileError);
        setUserProfile(null);
      } else if (!profile) {
        console.log('Profile not found, creating...');
        // Criar perfil se não existir
        const { data: newProfile, error: createError } = await supabase
          .from('usuarios')
          .insert([
            {
              id: user.id,
              email: user.email,
              nome: user.email.split('@')[0], // Nome baseado no email
              tipo_usuario: 'usuario',
              peticoes_usadas: 0
            }
          ])
          .select()
          .single();

        console.log('New profile created:', newProfile);
        console.log('Create error:', createError);

        if (createError) {
          console.error('Error creating profile:', createError);
          setUserProfile(null);
        } else {
          setUserProfile(newProfile);
        }
      } else {
        console.log('Setting profile:', profile);
        setUserProfile(profile);
      }

      // Set user and session
      setUser(user);
      setSession({ user });
    } catch (error) {
      console.error('Auth context error:', error);
      setUser(null);
      setUserProfile(null);
      setSession(null);
    } finally {
      setLoading(false);
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
