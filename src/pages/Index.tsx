
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, Users, FileText, Gavel } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Scale className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Tribunal de IA</h1>
          </div>
          <div className="space-x-4">
            <Link to="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link to="/register">
              <Button>Cadastrar</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Tribunal de IA
            <span className="block text-primary">Simulação Jurídica Inteligente</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Sistema avançado que simula processos judiciais completos com inteligência artificial,
            oferecendo debates realistas entre promotor, advogado de defesa e juiz.
          </p>
          <Link to="/register">
            <Button size="lg" className="btn-legal px-8 py-4 text-lg">
              Começar Agora
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Como Funciona</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="card-legal hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Promotor IA</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Inteligência artificial especializada em acusação, que analisa evidências 
                e constrói argumentos sólidos baseados na legislação vigente.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="card-legal hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Advogado IA</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Sistema de defesa inteligente que desenvolve estratégias defensivas,
                identifica precedentes e apresenta contraprovas fundamentadas.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="card-legal hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Gavel className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Juiz IA</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Magistrado virtual imparcial que avalia argumentos, pondera evidências
                e emite sentenças fundamentadas seguindo princípios jurídicos.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Process Flow */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Processo Judicial Simulado</h3>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">1</div>
                <div>
                  <h4 className="font-semibold text-lg">Análise Inicial</h4>
                  <p className="text-gray-600">O sistema analisa sua petição e identifica os pontos principais do caso.</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">2</div>
                <div>
                  <h4 className="font-semibold text-lg">Debate Judicial</h4>
                  <p className="text-gray-600">Promotor e advogado debatem o caso através de alegações, defesas e tréplicas.</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">3</div>
                <div>
                  <h4 className="font-semibold text-lg">Sentença Final</h4>
                  <p className="text-gray-600">O juiz analisa todos os argumentos e emite uma decisão fundamentada.</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">4</div>
                <div>
                  <h4 className="font-semibold text-lg">Relatório de Melhorias</h4>
                  <p className="text-gray-600">Receba sugestões para fortalecer sua argumentação jurídica.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Scale className="h-6 w-6" />
            <span className="text-xl font-semibold">Tribunal de IA</span>
          </div>
          <p className="text-blue-100">
            Sistema de simulação jurídica com inteligência artificial
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
