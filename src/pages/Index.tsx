
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
            <Link to="/login">
              <Button size="lg" className="btn-legal">
                Fazer Login
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline">
                Cadastrar
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Credenciais Demo */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-blue-800">🔑 Sistema de Teste Disponível</CardTitle>
              <CardDescription className="text-blue-600">
                Use as credenciais abaixo para testar o sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-700">👨‍💼 Administrador</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p><strong>Email:</strong> admin@tribunal.com</p>
                      <p><strong>Senha:</strong> admin123</p>
                      <p className="text-blue-600">• Acesso completo ao sistema</p>
                      <p className="text-blue-600">• Gestão de usuários</p>
                      <p className="text-blue-600">• Configurações avançadas</p>
                    </div>
                    <Link to="/login" className="mt-4 block">
                      <Button className="w-full" size="sm">Fazer Login Admin</Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="bg-white border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-700">👤 Usuário</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p><strong>Email:</strong> usuario@tribunal.com</p>
                      <p><strong>Senha:</strong> user123</p>
                      <p className="text-blue-600">• Envio de petições</p>
                      <p className="text-blue-600">• Histórico de casos</p>
                      <p className="text-blue-600">• Dashboard pessoal</p>
                    </div>
                    <Link to="/login" className="mt-4 block">
                      <Button className="w-full" variant="outline" size="sm">Fazer Login Usuário</Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="bg-white border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-700">🔐 Santos (Admin)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p><strong>Email:</strong> santoscydnei@gmail.com</p>
                      <p><strong>Senha:</strong> senha123</p>
                      <p className="text-blue-600">• Administrador principal</p>
                      <p className="text-blue-600">• Acesso completo</p>
                      <p className="text-blue-600">• Configurações do sistema</p>
                    </div>
                    <Link to="/login" className="mt-4 block">
                      <Button className="w-full" size="sm">Fazer Login Santos</Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
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
          <div className="mt-4 text-sm text-gray-500">
            Sistema de teste - Use as credenciais fornecidas para acessar
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
