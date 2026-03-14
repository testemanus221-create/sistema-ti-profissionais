import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Users, Briefcase, MapPin, MessageCircle, Shield } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="text-blue-600" size={32} />
            <h1 className="text-2xl font-bold text-slate-900">TechConnect</h1>
          </div>
          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' ? (
                  <Button onClick={() => navigate("/admin")}>Painel Admin</Button>
                ) : (
                  <Button onClick={() => navigate("/dashboard")}>Meu Dashboard</Button>
                )}
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate("/login")}>
                  Login
                </Button>
                <Button onClick={() => navigate("/register")}>
                  Cadastrar
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl font-bold text-slate-900 mb-6">
              Conecte-se com os Melhores Profissionais de TI
            </h2>
            <p className="text-xl text-slate-600 mb-8">
              Encontre especialistas qualificados em redes, suporte, desenvolvimento, infraestrutura e segurança. Gerenciamento simples e eficiente para suas necessidades tecnológicas.
            </p>
            <div className="flex gap-4">
              {isAuthenticated && user?.role === 'admin' ? (
                <Button size="lg" onClick={() => navigate("/admin")}>
                  Ir para Painel Admin
                </Button>
              ) : (
                <Button size="lg" onClick={() => navigate("/register")}>
                  Cadastre-se como Técnico
                </Button>
              )}
              {!isAuthenticated && (
                <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
                  Fazer Login
                </Button>
              )}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg blur-3xl opacity-20"></div>
            <div className="relative bg-white rounded-lg p-8 shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-green-500" />
                  <span className="text-slate-700">Profissionais Verificados</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="text-blue-500" />
                  <span className="text-slate-700">Rede Crescente</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="text-red-500" />
                  <span className="text-slate-700">Cobertura Nacional</span>
                </div>
                <div className="flex items-center gap-3">
                  <MessageCircle className="text-orange-500" />
                  <span className="text-slate-700">Contato Direto</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Por que usar TechConnect?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Shield className="text-blue-600 mb-4" size={32} />
                <CardTitle>Segurança</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Todos os profissionais são verificados e cadastrados com informações completas para sua segurança.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Briefcase className="text-purple-600 mb-4" size={32} />
                <CardTitle>Especialização</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Encontre profissionais especializados em diferentes áreas de TI conforme sua necessidade.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <MessageCircle className="text-green-600 mb-4" size={32} />
                <CardTitle>Contato Direto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Conecte-se diretamente via WhatsApp com os profissionais de forma rápida e simples.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Pronto para começar?</h3>
          <p className="text-lg mb-8 opacity-90">
            Junte-se à nossa comunidade de profissionais de TI qualificados
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate("/register")}>
            Cadastre-se Agora
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-400">
            © 2026 TechConnect. Conectando profissionais de TI com oportunidades.
          </p>
        </div>
      </footer>
    </div>
  );
}
