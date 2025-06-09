
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [] 
}) => {
  const { user, userProfile, loading } = useAuth();

  console.log('ProtectedRoute - Estado atual:', {
    user: user?.email,
    userProfile,
    allowedRoles,
    loading,
    currentPath: window.location.pathname
  });

  if (loading) {
    console.log('ProtectedRoute - Ainda carregando...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !userProfile) {
    console.log('ProtectedRoute - Usuário não autenticado, redirecionando para login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userProfile.tipo_usuario)) {
    console.log('ProtectedRoute - Usuário sem permissão:', {
      userType: userProfile.tipo_usuario,
      allowedRoles,
      redirectingTo: '/dashboard'
    });
    return <Navigate to="/dashboard" replace />;
  }

  console.log('ProtectedRoute - Acesso autorizado');
  return <>{children}</>;
};

export default ProtectedRoute;
