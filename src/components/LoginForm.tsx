
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Scale, Eye, EyeOff } from 'lucide-react';

const TestCredentials = () => (
  <Card className="mt-4 bg-blue-50 border-blue-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-sm text-blue-800">🔑 Credenciais para Teste</CardTitle>
    </CardHeader>
    <CardContent className="text-sm space-y-2">
      <div className="grid grid-cols-1 gap-2">
        <div className="p-2 bg-white rounded border">
          <p className="font-semibold text-blue-700">👨‍💼 Admin:</p>
          <p className="text-blue-600">admin@tribunal.com / admin123</p>
        </div>
        <div className="p-2 bg-white rounded border">
          <p className="font-semibold text-blue-700">👤 Usuário:</p>
          <p className="text-blue-600">usuario@tribunal.com / user123</p>
        </div>
        <div className="p-2 bg-white rounded border">
          <p className="font-semibold text-blue-700">🔐 Santos (Admin):</p>
          <p className="text-blue-600">santoscydnei@gmail.com / senha123</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    try {
      const result = await login(email, password);
      
      if (result.success && result.user) {
        // Redirecionamento baseado no role
        if (result.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(result.error || 'Falha no login');
      }
    } catch (err) {
      setError('Erro inesperado no login');
    }
  };

  const quickLogin = async (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
    setError('');
    
    const result = await login(email, password);
    if (result.success && result.user) {
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error || 'Falha no login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Scale className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Tribunal de IA</h1>
          </div>
          <p className="text-gray-600">Acesse sua conta</p>
        </div>

        <Card className="card-legal">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full btn-legal" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Entrando...
                  </div>
                ) : 'Entrar'}
              </Button>
            </form>
            
            {/* Botões de Login Rápido */}
            <div className="mt-6 space-y-3">
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-3 text-center">Login rápido:</p>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full text-sm"
                    onClick={() => quickLogin('admin@tribunal.com', 'admin123')}
                    disabled={loading}
                  >
                    🔐 Login como Admin
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full text-sm"
                    onClick={() => quickLogin('usuario@tribunal.com', 'user123')}
                    disabled={loading}
                  >
                    👤 Login como Usuário
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full text-sm"
                    onClick={() => quickLogin('santoscydnei@gmail.com', 'senha123')}
                    disabled={loading}
                  >
                    👨‍💼 Login Santos (Admin)
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <TestCredentials />
      </div>
    </div>
  );
};

export default LoginForm;
