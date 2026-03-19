import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Mail, Loader2, Check, AlertCircle } from "lucide-react";

export default function SystemConfig() {
  const [emailSender, setEmailSender] = useState("");
  const [isSaving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const getEmailQuery = trpc.config.getEmailSender.useQuery();
  const setEmailMutation = trpc.config.setEmailSender.useMutation();

  // Carregar email atual
  useEffect(() => {
    if (getEmailQuery.data?.email) {
      setEmailSender(getEmailQuery.data.email);
    }
  }, [getEmailQuery.data]);

  const handleSave = async () => {
    if (!emailSender.trim()) {
      setSaveStatus("error");
      return;
    }

    setSaving(true);
    setSaveStatus("idle");

    try {
      await setEmailMutation.mutateAsync({ email: emailSender });
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      setSaveStatus("error");
      console.error("Erro ao salvar configuração:", error);
    } finally {
      setSaving(false);
    }
  };

  if (getEmailQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <Mail size={24} />
            <div>
              <CardTitle>Configurações do Sistema</CardTitle>
              <CardDescription className="text-blue-100">
                Configure os parâmetros globais da aplicação
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Email de Origem */}
          <div className="space-y-2">
            <Label htmlFor="email-sender" className="text-base font-semibold">
              Email de Origem para Recuperação de Senha
            </Label>
            <p className="text-sm text-slate-600 mb-3">
              Este email será usado como remetente ao enviar códigos de recuperação de senha para os técnicos.
            </p>
            <Input
              id="email-sender"
              type="email"
              placeholder="noreply@techconnect.com"
              value={emailSender}
              onChange={(e) => setEmailSender(e.target.value)}
              className="text-base"
            />
            {emailSender && (
              <p className="text-xs text-slate-500 mt-2">
                Emails de recuperação serão enviados de: <strong>{emailSender}</strong>
              </p>
            )}
          </div>

          {/* Status Messages */}
          {saveStatus === "success" && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <Check size={20} />
              <span>Configuração salva com sucesso!</span>
            </div>
          )}

          {saveStatus === "error" && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle size={20} />
              <span>Erro ao salvar configuração. Verifique o email e tente novamente.</span>
            </div>
          )}

          {/* Save Button */}
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isSaving || !emailSender.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Salvando...
                </>
              ) : (
                "Salvar Configuração"
              )}
            </Button>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Informações Importantes</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use um email válido que será exibido como remetente</li>
              <li>• Este email será usado em todos os emails de recuperação de senha</li>
              <li>• Recomenda-se usar um email genérico como noreply@seudominio.com</li>
              <li>• Alterações entram em vigor imediatamente</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
