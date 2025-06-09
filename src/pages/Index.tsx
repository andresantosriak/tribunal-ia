
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, Users, Shield, FileText, Gavel, Clock } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Scale className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Tribunal de IA</h1>
          </div>
          <div className="space-x-4">
            <Link to="/login">
              <Button variant="outline">Entrar</Button>
            </Link>
            <Link to="/register">
              <Button>Cadastrar</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Análise Jurídica com
            <span className="text-primary"> Inteligência Artificial</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Submeta seus casos para análise automatizada por um tribunal de IA especializado. 
            Obtenha sentenças fundamentadas e análises jurídicas detalhadas.
          </p>
          <div className="space-x-4">
            <Link to="/register">
              <Button size="lg" className="btn-legal">
                Começar Agora
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">
                Fazer Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Como Funciona</h3>
          <p className="text-lg text-gray-600">Processo automatizado de análise jurídica</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="card-legal text-center">
            <CardHeader>
              <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>1. Submeta o Caso</CardTitle>
              <CardDescription>
                Descreva os fatos, evidências e questões legais do seu caso
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="card-legal text-center">
            <CardHeader>
              <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>2. Análise Automática</CardTitle>
              <CardDescription>
                Nossa IA analisa o caso e gera relatórios especializados
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="card-legal text-center">
            <CardHeader>
              <Gavel className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>3. Receba a Sentença</CardTitle>
              <CardDescription>
                Obtenha uma análise judicial completa e fundamentada
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Pricing/Access */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Tipos de Conta</h3>
          <p className="text-lg text-gray-600">Escolha o nível de acesso ideal para você</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="card-legal">
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Usuário</CardTitle>
              <CardDescription>Para advogados e profissionais do direito</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ 5 petições por mês</li>
                <li>✓ Análise automática de casos</li>
                <li>✓ Histórico de casos</li>
                <li>✓ Suporte básico</li>
              </ul>
              <div className="mt-6">
                <Link to="/register">
                  <Button className="w-full btn-legal">Cadastrar como Usuário</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-legal border-primary">
            <CardHeader>
              <Shield className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Administrador</CardTitle>
              <CardDescription>Para gestão do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ Acesso administrativo completo</li>
                <li>✓ Gestão de usuários</li>
                <li>✓ Relatórios e estatísticas</li>
                <li>✓ Configurações do sistema</li>
                <li>✓ Logs de atividade</li>
              </ul>
              <div className="mt-6">
                <Link to="/login">
                  <Button className="w-full" variant="outline">
                    Acesso Admin
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Demo Accounts */}
      <section className="container mx-auto px-4 py-16 bg-gray-50 rounded-lg mb-16">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Contas Demo Disponíveis</h3>
          <p className="text-gray-600">Teste o sistema com essas credenciais</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">👤 Usuário Demo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm"><strong>Email:</strong> santoscydnei@gmail.com</p>
              <p className="text-sm"><strong>Senha:</strong> senha123</p>
              <p className="text-xs text-gray-600 mt-2">Acesso completo de usuário</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">🔐 Admin Demo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm"><strong>Email:</strong> admin@demo.com</p>
              <p className="text-sm"><strong>Senha:</strong> admin123demo</p>
              <p className="text-xs text-gray-600 mt-2">Acesso administrativo completo</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Scale className="h-6 w-6" />
            <span className="text-xl font-bold">Tribunal de IA</span>
          </div>
          <p className="text-gray-400">
            Análise jurídica automatizada com inteligência artificial
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
