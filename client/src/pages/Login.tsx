import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { Briefcase } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Login() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Briefcase className="text-blue-600" size={32} />
          <h1 className="text-2xl font-bold text-slate-900">TechConnect</h1>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Bem-vindo de volta</CardTitle>
            <CardDescription>
              Faça login para acessar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  disabled
                  className="bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  disabled
                  className="bg-slate-50"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 mb-4">
                O login é realizado através do Manus OAuth. Clique no botão abaixo para fazer login com segurança.
              </p>
              <Button 
                className="w-full" 
                onClick={() => window.location.href = getLoginUrl()}
              >
                Fazer Login com Manus
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Novo por aqui?</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/register")}
            >
              Criar uma conta
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-600 mt-6">
          Ao fazer login, você concorda com nossos Termos de Serviço
        </p>
      </div>
    </div>
  );
}
