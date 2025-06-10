
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, isAuthenticated, loading } = useAuth();

  console.log('ProtectedRoute - Estado atual:', {
    user: user?.email,
    role: user?.role,
    requiredRole,
    isAuthenticated,
    loading,
    currentPath: window.location.pathname
  });

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    console.log('ProtectedRoute - Ainda carregando...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Verificar se está autenticado
  if (!isAuthenticated || !user) {
    console.log('ProtectedRoute - Usuário não autenticado, redirecionando para login');
    return <Navigate to="/login" replace />;
  }

  // Verificar role se necessário
  if (requiredRole && user.role !== requiredRole) {
    console.log('ProtectedRoute - Usuário sem permissão:', {
      userRole: user.role,
      requiredRole,
      redirectingTo: user.role === 'admin' ? '/admin' : '/dashboard'
    });
    
    // Redirecionar para a página apropriada baseada no role
    const redirectPath = user.role === 'admin' ? '/admin' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  console.log('ProtectedRoute - Acesso autorizado');
  return <>{children}</>;
};

export default ProtectedRoute;
