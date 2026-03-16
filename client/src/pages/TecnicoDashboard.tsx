import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Briefcase, LogOut, Menu, X, Save, Loader2, MapPin, Mail, Phone, CheckCircle2, Circle } from "lucide-react";
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

  // Se técnico não foi encontrado (null), redirecionar para completar cadastro
  useEffect(() => {
    if (tecnico === null) {
      navigate("/register");
    }
  }, [tecnico, navigate]);

  // Enquanto está carregando, mostrar spinner
  if (tecnico === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  // Se tecnico é null após o useEffect, não renderizar nada (redirecionamento em progresso)
  if (!tecnico) {
    return null;
  }

  const selectedArea = areas?.find(a => a.id === parseInt(formData.area_id));
  const selectedEstado = estados?.find(e => e.id === parseInt(formData.estado_id));
  const selectedCidade = cidades?.find(c => c.id === parseInt(formData.cidade_id));
  const selectedMunicipios = tecnico.municipios || [];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 flex flex-col shadow-lg`}>
        <div className="p-4 flex items-center justify-between border-b border-slate-700">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Briefcase size={24} />
              </div>
              <div>
                <span className="font-bold text-lg">TechConnect</span>
                <p className="text-xs text-slate-400">Técnico</p>
              </div>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <div
            className="w-full text-left px-4 py-3 rounded-lg bg-blue-600 transition-colors font-medium"
            title="Meus Dados"
          >
            {sidebarOpen ? "📋 Meus Dados" : "📋"}
          </div>
        </nav>

        <div className="p-4 border-t border-slate-700 space-y-3">
          {sidebarOpen && (
            <div className="text-xs text-slate-400 px-2">
              <p className="font-semibold mb-2">Status</p>
              <div className="flex items-center gap-2">
                {tecnico.disponivel ? (
                  <>
                    <CheckCircle2 size={16} className="text-green-500" />
                    <span className="text-green-400">Disponível</span>
                  </>
                ) : (
                  <>
                    <Circle size={16} className="text-slate-500" />
                    <span className="text-slate-400">Indisponível</span>
                  </>
                )}
              </div>
            </div>
          )}
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 text-slate-100 border-slate-600 hover:bg-slate-700"
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
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Bem-vindo, {(tecnico as any).nome || "Técnico"}</h1>
              <p className="text-slate-600">Gerencie suas informações e disponibilidade</p>
            </div>

            {/* Status de Disponibilidade - Card Destaque */}
            <Card className="mb-8 border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  {tecnico.disponivel ? (
                    <>
                      <CheckCircle2 className="text-green-500" size={24} />
                      <span>Você está Disponível</span>
                    </>
                  ) : (
                    <>
                      <Circle className="text-slate-400" size={24} />
                      <span>Você está Indisponível</span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-700 mb-2">
                      {tecnico.disponivel 
                        ? "✅ Você está visível para clientes e aparece na lista de profissionais" 
                        : "❌ Você não está visível para clientes e não aparece na lista de profissionais"}
                    </p>
                    <p className="text-sm text-slate-600">
                      Clique no botão abaixo para alternar sua disponibilidade
                    </p>
                  </div>
                  <Button
                    onClick={handleToggleDisponibilidade}
                    disabled={toggleMutation.isPending}
                    size="lg"
                    className={tecnico.disponivel ? "bg-green-600 hover:bg-green-700" : "bg-slate-400 hover:bg-slate-500"}
                  >
                    {toggleMutation.isPending ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      tecnico.disponivel ? "Ficar Indisponível" : "Ficar Disponível"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Área de Atuação */}
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Briefcase size={20} className="text-blue-600" />
                    Área de Atuação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-900 font-semibold text-lg">
                    {selectedArea?.nome_area || "Não definida"}
                  </p>
                </CardContent>
              </Card>

              {/* Localização */}
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin size={20} className="text-red-600" />
                    Localização
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-900 font-semibold">
                    {selectedCidade?.nome_cidade || "Não definida"}
                  </p>
                  <p className="text-sm text-slate-600">
                    {selectedEstado?.nome_estado || "Estado"}
                  </p>
                </CardContent>
              </Card>

              {/* Contato */}
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Phone size={20} className="text-green-600" />
                    WhatsApp
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-900 font-semibold">
                    {formData.whatsapp || "Não definido"}
                  </p>
                  {formData.whatsapp && (
                    <a 
                      href={`https://wa.me/${formData.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                    >
                      Abrir WhatsApp →
                    </a>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Dados Pessoais - Edição */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200">
                <CardTitle className="flex items-center gap-2">
                  <Mail size={20} className="text-blue-600" />
                  Meus Dados
                </CardTitle>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  disabled={updateMutation.isPending}
                  size="sm"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={16} />
                      Salvando...
                    </>
                  ) : isEditing ? (
                    <>
                      <Save className="mr-2" size={16} />
                      Salvar Alterações
                    </>
                  ) : (
                    "✏️ Editar"
                  )}
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Email (read-only) */}
                  <div className="space-y-2">
                    <Label className="font-semibold">Email</Label>
                    <Input
                      value={formData.email || ""}
                      disabled
                      className="bg-slate-100 text-slate-600 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500">O email não pode ser alterado</p>
                  </div>

                  {isEditing && (
                    <>
                      {/* Área */}
                      <div className="space-y-2">
                        <Label className="font-semibold">Área de Atuação</Label>
                        <Select 
                          value={formData.area_id || ""} 
                          onValueChange={(value) => setFormData({ ...formData, area_id: value })}
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
                        <Label className="font-semibold">Estado</Label>
                        <Select 
                          value={formData.estado_id || ""} 
                          onValueChange={(value) => setFormData({ ...formData, estado_id: value, cidade_id: "", municipios_ids: [] })}
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
                        <Label className="font-semibold">Cidade</Label>
                        <Select 
                          value={formData.cidade_id || ""} 
                          onValueChange={(value) => setFormData({ ...formData, cidade_id: value, municipios_ids: [] })}
                          disabled={!formData.estado_id}
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
                      {municipios && municipios.length > 0 && (
                        <div className="space-y-2">
                          <Label className="font-semibold">Municípios de Atendimento</Label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-lg max-h-48 overflow-y-auto border border-slate-200">
                            {municipios.map(municipio => (
                              <div key={municipio.id} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`municipio-${municipio.id}`}
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
                                  className="rounded cursor-pointer"
                                />
                                <label htmlFor={`municipio-${municipio.id}`} className="text-sm text-slate-700 cursor-pointer">
                                  {municipio.nome_municipio}
                                </label>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-slate-500">
                            Selecionados: {formData.municipios_ids.length} de {municipios.length}
                          </p>
                        </div>
                      )}

                      {/* WhatsApp */}
                      <div className="space-y-2">
                        <Label className="font-semibold">WhatsApp</Label>
                        <Input
                          value={formData.whatsapp || ""}
                          onChange={(e) => {
                            const formatted = formatWhatsApp(e.target.value);
                            setFormData({ ...formData, whatsapp: formatted });
                          }}
                          placeholder="(11) 99999-9999"
                        />
                        <p className="text-xs text-slate-500">Formato: (XX) XXXXX-XXXX</p>
                      </div>
                    </>
                  )}

                  {!isEditing && (
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-600 mb-1">Área de Atuação</p>
                          <p className="font-semibold text-slate-900">{selectedArea?.nome_area || "Não definida"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 mb-1">Estado</p>
                          <p className="font-semibold text-slate-900">{selectedEstado?.nome_estado || "Não definido"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 mb-1">Cidade</p>
                          <p className="font-semibold text-slate-900">{selectedCidade?.nome_cidade || "Não definida"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 mb-1">WhatsApp</p>
                          <p className="font-semibold text-slate-900">{formData.whatsapp || "Não definido"}</p>
                        </div>
                      </div>
                      {selectedMunicipios.length > 0 && (
                        <div>
                          <p className="text-sm text-slate-600 mb-2">Municípios de Atendimento</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedMunicipios.map((municipio: any) => (
                              <span key={municipio.id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                {municipio.nome || municipio.nome_municipio}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
