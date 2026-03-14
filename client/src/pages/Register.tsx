import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocation } from "wouter";
import { Briefcase, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const whatsappRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;

const registerSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  area_id: z.string().min(1, "Selecione uma área de atuação"),
  estado_id: z.string().min(1, "Selecione um estado"),
  cidade_id: z.string().min(1, "Selecione uma cidade"),
  whatsapp: z.string().regex(whatsappRegex, "WhatsApp deve estar no formato (XX) XXXXX-XXXX"),
  municipios_ids: z.array(z.number()).optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

function formatWhatsApp(value: string) {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 6) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
}

export default function Register() {
  const [, navigate] = useLocation();
  const { control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const estadoId = watch("estado_id");
  const cidadeId = watch("cidade_id");

  const { data: areas } = trpc.areas.list.useQuery();
  const { data: estados } = trpc.estados.list.useQuery();
  const { data: cidades } = trpc.cidades.list.useQuery(
    estadoId ? { estado_id: parseInt(estadoId) } : undefined,
    { enabled: !!estadoId }
  );
  const { data: municipios } = trpc.municipios.list.useQuery(
    cidadeId ? { cidade_id: parseInt(cidadeId) } : undefined,
    { enabled: !!cidadeId }
  );

  const createTecnico = trpc.tecnicos.create.useMutation();

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await createTecnico.mutateAsync({
        nome: data.nome,
        email: data.email,
        area_id: parseInt(data.area_id),
        estado_id: parseInt(data.estado_id),
        cidade_id: parseInt(data.cidade_id),
        whatsapp: data.whatsapp.replace(/\D/g, ''),
        municipios_ids: data.municipios_ids,
      });
      toast.success("Cadastro realizado com sucesso!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Erro ao cadastrar");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Briefcase className="text-blue-600" size={32} />
          <h1 className="text-2xl font-bold text-slate-900">TechConnect</h1>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Cadastre-se como Técnico</CardTitle>
            <CardDescription>
              Preencha seus dados para se juntar à nossa rede de profissionais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Controller
                  name="nome"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Seu nome completo"
                      className={errors.nome ? "border-red-500" : ""}
                    />
                  )}
                />
                {errors.nome && <p className="text-sm text-red-500">{errors.nome.message}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="email"
                      placeholder="seu@email.com"
                      className={errors.email ? "border-red-500" : ""}
                    />
                  )}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>

              {/* Área de Atuação */}
              <div className="space-y-2">
                <Label htmlFor="area">Área de Atuação</Label>
                <Controller
                  name="area_id"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={errors.area_id ? "border-red-500" : ""}>
                        <SelectValue placeholder="Selecione uma área" />
                      </SelectTrigger>
                      <SelectContent>
                        {areas?.map(area => (
                          <SelectItem key={area.id} value={area.id.toString()}>
                            {area.nome_area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.area_id && <p className="text-sm text-red-500">{errors.area_id.message}</p>}
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Controller
                  name="estado_id"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={errors.estado_id ? "border-red-500" : ""}>
                        <SelectValue placeholder="Selecione um estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {estados?.map(estado => (
                          <SelectItem key={estado.id} value={estado.id.toString()}>
                            {estado.nome_estado} ({estado.uf})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.estado_id && <p className="text-sm text-red-500">{errors.estado_id.message}</p>}
              </div>

              {/* Cidade */}
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Controller
                  name="cidade_id"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} disabled={!estadoId}>
                      <SelectTrigger className={errors.cidade_id ? "border-red-500" : ""}>
                        <SelectValue placeholder="Selecione uma cidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {cidades?.map(cidade => (
                          <SelectItem key={cidade.id} value={cidade.id.toString()}>
                            {cidade.nome_cidade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.cidade_id && <p className="text-sm text-red-500">{errors.cidade_id.message}</p>}
              </div>

              {/* Municípios (Múltiplos) */}
              {municipios && municipios.length > 0 && (
                <div className="space-y-2">
                  <Label>Municípios de Atendimento (opcional)</Label>
                  <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-lg max-h-48 overflow-y-auto">
                    {municipios.map(municipio => (
                      <div key={municipio.id} className="flex items-center space-x-2">
                        <Controller
                          name="municipios_ids"
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              checked={field.value?.includes(municipio.id) || false}
                              onCheckedChange={(checked) => {
                                const current = field.value || [];
                                if (checked) {
                                  field.onChange([...current, municipio.id]);
                                } else {
                                  field.onChange(current.filter(id => id !== municipio.id));
                                }
                              }}
                            />
                          )}
                        />
                        <label className="text-sm text-slate-700 cursor-pointer">
                          {municipio.nome_municipio}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* WhatsApp */}
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Controller
                  name="whatsapp"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="(11) 99999-9999"
                      onChange={(e) => {
                        const formatted = formatWhatsApp(e.target.value);
                        field.onChange(formatted);
                      }}
                      className={errors.whatsapp ? "border-red-500" : ""}
                    />
                  )}
                />
                {errors.whatsapp && <p className="text-sm text-red-500">{errors.whatsapp.message}</p>}
              </div>

              {/* Submit */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || createTecnico.isPending}
              >
                {isSubmitting || createTecnico.isPending ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={16} />
                    Cadastrando...
                  </>
                ) : (
                  "Cadastrar"
                )}
              </Button>

              {/* Login Link */}
              <p className="text-center text-sm text-slate-600">
                Já tem uma conta?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Faça login
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
