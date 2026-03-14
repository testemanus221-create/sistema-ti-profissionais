import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Briefcase, LogOut, Menu, X, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

function formatWhatsApp(value: string) {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 6) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
}

export default function TecnicoDashboard() {
  const [, navigate] = useLocation();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    area_id: "",
    estado_id: "",
    cidade_id: "",
    whatsapp: "",
    email: "",
    municipios_ids: [] as number[],
  });
  const [isLoaded, setIsLoaded] = useState(false);

  const { data: tecnico, refetch } = trpc.tecnicos.me.useQuery();
  const { data: areas } = trpc.areas.list.useQuery();
  const { data: estados } = trpc.estados.list.useQuery();
  const { data: cidades } = trpc.cidades.list.useQuery(
    formData.estado_id ? { estado_id: parseInt(formData.estado_id) } : undefined,
    { enabled: !!formData.estado_id }
  );
  const { data: municipios } = trpc.municipios.list.useQuery(
    formData.cidade_id ? { cidade_id: parseInt(formData.cidade_id) } : undefined,
    { enabled: !!formData.cidade_id }
  );

  const updateMutation = trpc.tecnicos.update.useMutation();
  const toggleMutation = trpc.tecnicos.toggleDisponibilidade.useMutation();

  useEffect(() => {
    if (tecnico && !isLoaded) {
      setFormData({
        area_id: tecnico.area_id?.toString() || "",
        estado_id: tecnico.estado_id?.toString() || "",
        cidade_id: tecnico.cidade_id?.toString() || "",
        whatsapp: tecnico.whatsapp || "",
        email: tecnico.email || "",
        municipios_ids: tecnico.municipios?.map((m: any) => m.id) || [],
      });
      setIsLoaded(true);
    }
  }, [tecnico, isLoaded]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        area_id: parseInt(formData.area_id),
        estado_id: parseInt(formData.estado_id),
        cidade_id: parseInt(formData.cidade_id),
        whatsapp: formData.whatsapp.replace(/\D/g, ''),
        email: formData.email,
        municipios_ids: formData.municipios_ids,
      });
      toast.success("Dados atualizados com sucesso");
      setIsEditing(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar dados");
    }
  };

  const handleToggleDisponibilidade = async () => {
    try {
      await toggleMutation.mutateAsync();
      toast.success("Status atualizado com sucesso");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar status");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!tecnico) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <Briefcase size={24} />
              <span className="font-bold">TechConnect</span>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-slate-800 rounded"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            className="w-full text-left px-4 py-2 rounded bg-blue-600 transition-colors"
            title="Meus Dados"
          >
            {sidebarOpen ? "Meus Dados" : "📋"}
          </button>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            {sidebarOpen && "Sair"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Meu Dashboard</h2>

            {/* Status de Disponibilidade */}
            <Card className="mb-8 border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Status de Disponibilidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {tecnico.disponivel ? "✅ Disponível" : "❌ Indisponível"}
                    </p>
                    <p className="text-sm text-slate-600">
                      {tecnico.disponivel 
                        ? "Você está visível para clientes" 
                        : "Você não está visível para clientes"}
                    </p>
                  </div>
                  <Button
                    onClick={handleToggleDisponibilidade}
                    disabled={toggleMutation.isPending}
                    variant={tecnico.disponivel ? "default" : "outline"}
                  >
                    {toggleMutation.isPending ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      tecnico.disponivel ? "Ficar Indisponível" : "Ficar Disponível"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Dados Pessoais */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Meus Dados</CardTitle>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={16} />
                      Salvando...
                    </>
                  ) : isEditing ? (
                    <>
                      <Save className="mr-2" size={16} />
                      Salvar
                    </>
                  ) : (
                    "Editar"
                  )}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email (read-only) */}
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={formData.email || ""}
                    disabled
                    className="bg-slate-50"
                  />
                </div>

                {/* Área */}
                <div className="space-y-2">
                  <Label>Área de Atuação</Label>
                  <Select 
                    value={formData.area_id || ""} 
                    onValueChange={(value) => setFormData({ ...formData, area_id: value })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
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
                </div>

                {/* Estado */}
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select 
                    value={formData.estado_id || ""} 
                    onValueChange={(value) => setFormData({ ...formData, estado_id: value, cidade_id: "", municipios_ids: [] })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
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
                </div>

                {/* Cidade */}
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Select 
                    value={formData.cidade_id || ""} 
                    onValueChange={(value) => setFormData({ ...formData, cidade_id: value, municipios_ids: [] })}
                    disabled={!isEditing || !formData.estado_id}
                  >
                    <SelectTrigger>
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
                </div>

                {/* Municípios */}
                {municipios && municipios.length > 0 && isEditing && (
                  <div className="space-y-2">
                    <Label>Municípios de Atendimento</Label>
                    <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-lg max-h-48 overflow-y-auto">
                      {municipios.map(municipio => (
                        <div key={municipio.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.municipios_ids.includes(municipio.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  municipios_ids: [...formData.municipios_ids, municipio.id]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  municipios_ids: formData.municipios_ids.filter(id => id !== municipio.id)
                                });
                              }
                            }}
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
                  <Label>WhatsApp</Label>
                  <Input
                    value={formData.whatsapp || ""}
                    onChange={(e) => {
                      const formatted = formatWhatsApp(e.target.value);
                      setFormData({ ...formData, whatsapp: formatted });
                    }}
                    placeholder="(11) 99999-9999"
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
