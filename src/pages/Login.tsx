
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, userProfile } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao Tribunal de IA",
      });
      
      // Redirecionar baseado no tipo de usuário
      setTimeout(() => {
        if (userProfile?.tipo_usuario === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loginDemo = async (demoEmail: string, demoPassword: string) => {
    setLoading(true);
    setEmail(demoEmail);
    setPassword(demoPassword);
    
    try {
      await signIn(demoEmail, demoPassword);
      toast({
        title: "Login demo realizado!",
        description: "Bem-vindo ao sistema",
      });
      
      // Pequeno delay para permitir que o contexto seja atualizado
      setTimeout(() => {
        if (demoEmail === 'admin@demo.com') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }, 1000);
    } catch (error) {
      console.error('Demo login error:', error);
      toast({
        title: "Erro no login demo",
        description: "Tente novamente ou use as credenciais manualmente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full btn-legal" 
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
            
            {/* Contas Demo */}
            <div className="mt-6 space-y-3">
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-3 text-center">Ou teste com contas demo:</p>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full text-sm"
                    onClick={() => loginDemo('admin@demo.com', 'admin123demo')}
                    disabled={loading}
                  >
                    🔐 Login como Admin (admin@demo.com)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full text-sm"
                    onClick={() => loginDemo('santoscydnei@gmail.com', 'senha123')}
                    disabled={loading}
                  >
                    👤 Login como Santos (santoscydnei@gmail.com)
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{' '}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Cadastre-se aqui
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
