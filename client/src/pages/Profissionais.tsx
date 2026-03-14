import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { Briefcase, MessageCircle, MapPin, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Profissionais() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    area_id: "",
    estado_id: "",
    cidade_id: "",
    municipio_id: "",
  });

  const { data: areas } = trpc.areas.list.useQuery();
  const { data: estados } = trpc.estados.list.useQuery();
  const { data: cidades } = trpc.cidades.list.useQuery(
    filters.estado_id ? { estado_id: parseInt(filters.estado_id) } : undefined,
    { enabled: !!filters.estado_id }
  );
  const { data: municipios } = trpc.municipios.list.useQuery(
    filters.cidade_id ? { cidade_id: parseInt(filters.cidade_id) } : undefined,
    { enabled: !!filters.cidade_id }
  );

  const { data: tecnicos = [], isLoading } = trpc.tecnicos.listDisponibles.useQuery({
    area_id: filters.area_id ? parseInt(filters.area_id) : undefined,
    estado_id: filters.estado_id ? parseInt(filters.estado_id) : undefined,
    cidade_id: filters.cidade_id ? parseInt(filters.cidade_id) : undefined,
    municipio_id: filters.municipio_id ? parseInt(filters.municipio_id) : undefined,
  });

  const handleWhatsApp = (whatsapp: string) => {
    const cleaned = whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/${cleaned}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <Briefcase className="text-blue-600" size={32} />
            <h1 className="text-2xl font-bold text-slate-900">TechConnect</h1>
          </div>
          <nav className="flex items-center gap-4">
            {!user ? (
              <>
                <Button variant="ghost" onClick={() => navigate("/login")}>
                  Login
                </Button>
                <Button onClick={() => navigate("/register")}>
                  Cadastrar
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate(user.role === 'admin' ? "/admin" : "/dashboard")}>
                {user.role === 'admin' ? 'Painel Admin' : 'Meu Dashboard'}
              </Button>
            )}
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Filtrar Profissionais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-5 gap-4">
              {/* Área */}
              <div className="space-y-2">
                <Label htmlFor="area">Área de Atuação</Label>
                <Select 
                  value={filters.area_id} 
                  onValueChange={(value) => setFilters({ ...filters, area_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
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
                <Label htmlFor="estado">Estado</Label>
                <Select 
                  value={filters.estado_id} 
                  onValueChange={(value) => setFilters({ ...filters, estado_id: value, cidade_id: "", municipio_id: "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    {estados?.map(estado => (
                      <SelectItem key={estado.id} value={estado.id.toString()}>
                        {estado.uf} - {estado.nome_estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cidade */}
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Select 
                  value={filters.cidade_id} 
                  onValueChange={(value) => setFilters({ ...filters, cidade_id: value, municipio_id: "" })}
                  disabled={!filters.estado_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    {cidades?.map(cidade => (
                      <SelectItem key={cidade.id} value={cidade.id.toString()}>
                        {cidade.nome_cidade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Município */}
              <div className="space-y-2">
                <Label htmlFor="municipio">Município</Label>
                <Select 
                  value={filters.municipio_id} 
                  onValueChange={(value) => setFilters({ ...filters, municipio_id: value })}
                  disabled={!filters.cidade_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    {municipios?.map(municipio => (
                      <SelectItem key={municipio.id} value={municipio.id.toString()}>
                        {municipio.nome_municipio}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Limpar Filtros */}
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setFilters({ area_id: "", estado_id: "", cidade_id: "", municipio_id: "" })}
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            {isLoading ? "Carregando..." : `${tecnicos.length} profissional${tecnicos.length !== 1 ? 'is' : ''} encontrado${tecnicos.length !== 1 ? 's' : ''}`}
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
          ) : tecnicos.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="py-12 text-center">
                <p className="text-slate-600 text-lg">
                  Nenhum profissional encontrado com os filtros selecionados.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {tecnicos.map((tecnico: any) => (
                <Card key={tecnico.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-5 gap-6">
                      {/* Informações Básicas */}
                      <div className="md:col-span-2">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">
                          {tecnico.usuario_id}
                        </h3>
                        <div className="space-y-2 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Briefcase size={16} className="text-blue-600" />
                            <span>{tecnico.area}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-red-600" />
                            <span>{tecnico.cidade}, {tecnico.estado}</span>
                          </div>
                        </div>
                      </div>

                      {/* Contatos */}
                      <div className="md:col-span-2">
                        <p className="text-sm font-semibold text-slate-700 mb-3">Contato</p>
                        <div className="space-y-2">
                          <p className="text-sm text-slate-600">
                            <span className="font-medium">Email:</span> {tecnico.email}
                          </p>
                          <p className="text-sm text-slate-600">
                            <span className="font-medium">WhatsApp:</span> {tecnico.whatsapp}
                          </p>
                          {tecnico.municipios && tecnico.municipios.length > 0 && (
                            <p className="text-sm text-slate-600">
                              <span className="font-medium">Municípios:</span> {tecnico.municipios.join(", ")}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Ação */}
                      <div className="flex items-end">
                        <Button 
                          className="w-full gap-2"
                          onClick={() => handleWhatsApp(tecnico.whatsapp)}
                        >
                          <MessageCircle size={16} />
                          WhatsApp
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
