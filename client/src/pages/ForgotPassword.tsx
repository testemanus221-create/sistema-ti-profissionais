import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';

export function ForgotPassword() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [code, setCode] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [token, setToken] = useState('');

  const requestReset = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: () => {
      alert('Código enviado para seu email');
      setStep('code');
    },
    onError: (error) => {
      alert(`Erro: ${error.message}`);
    },
  });

  const validateCode = trpc.auth.validateResetCode.useMutation({
    onSuccess: (data) => {
      setToken(data.token);
      setStep('password');
      alert('Código validado');
    },
    onError: (error) => {
      alert(`Erro: ${error.message}`);
    },
  });

  const resetPassword = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      alert('Senha alterada com sucesso');
      navigate('/login');
    },
    onError: (error) => {
      alert(`Erro: ${error.message}`);
    },
  });

  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      alert('Por favor, insira seu email');
      return;
    }
    requestReset.mutate({ email });
  };

  const handleValidateCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      alert('Código deve ter 6 dígitos');
      return;
    }
    validateCode.mutate({ email, code });
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaSenha || novaSenha.length < 6) {
      alert('Senha deve ter no mínimo 6 caracteres');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      alert('As senhas não conferem');
      return;
    }
    resetPassword.mutate({ token, novaSenha });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Recuperar Senha</h1>
          <p className="text-slate-600">Redefina sua senha em 3 passos</p>
        </div>

        {step === 'email' && (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={requestReset.isPending}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={requestReset.isPending}
            >
              {requestReset.isPending ? 'Enviando...' : 'Enviar Código'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => navigate('/login')}
            >
              Voltar ao Login
            </Button>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={handleValidateCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Código de Confirmação
              </label>
              <p className="text-sm text-slate-600 mb-3">
                Verifique seu email e insira o código de 6 dígitos
              </p>
              <Input
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                disabled={validateCode.isPending}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={validateCode.isPending}
            >
              {validateCode.isPending ? 'Validando...' : 'Validar Código'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setStep('email')}
            >
              Voltar
            </Button>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nova Senha
              </label>
              <Input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                disabled={resetPassword.isPending}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirmar Senha
              </label>
              <Input
                type="password"
                placeholder="Confirme sua senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                disabled={resetPassword.isPending}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={resetPassword.isPending}
            >
              {resetPassword.isPending ? 'Alterando...' : 'Alterar Senha'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => navigate('/login')}
            >
              Cancelar
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
