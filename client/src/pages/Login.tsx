import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Briefcase, Loader2 } from "lucide-react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [, navigate] = useLocation();
  const [loginMethod, setLoginMethod] = useState<'oauth' | 'email'>('oauth');
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      senha: '',
    },
  });

  const loginMutation = trpc.auth.loginEmail.useMutation();

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync({
        email: data.email,
        senha: data.senha,
      });
      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    }
  };

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
            {loginMethod === 'oauth' ? (
              <>
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
                    <span className="px-2 bg-white text-slate-500">ou</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setLoginMethod('email')}
                >
                  Login com Email/Senha
                </Button>
              </>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        className={errors.email ? "border-red-500" : ""}
                      />
                    )}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senha">Senha</Label>
                  <Controller
                    name="senha"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="senha"
                        type="password"
                        placeholder="••••••••"
                        className={errors.senha ? "border-red-500" : ""}
                      />
                    )}
                  />
                  {errors.senha && <p className="text-sm text-red-500">{errors.senha.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Fazer Login"}
                </Button>
                <Button 
                  type="button"
                  variant="link" 
                  className="w-full text-sm"
                  onClick={() => navigate('/forgot-password')}
                >
                  Esqueci minha senha
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full"
                  onClick={() => setLoginMethod('oauth')}
                >
                  Voltar
                </Button>
              </form>
            )}

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
