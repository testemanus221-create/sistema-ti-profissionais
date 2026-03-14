import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { MessageCircle, Trash2, Loader2, Eye } from "lucide-react";

export default function ProfissionaisManagement() {
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

  const { data: tecnicos = [], isLoading, refetch } = trpc.tecnicos.listDisponibles.useQuery({
    area_id: filters.area_id && filters.area_id !== "0" ? parseInt(filters.area_id) : undefined,
    estado_id: filters.estado_id && filters.estado_id !== "0" ? parseInt(filters.estado_id) : undefined,
    cidade_id: filters.cidade_id && filters.cidade_id !== "0" ? parseInt(filters.cidade_id) : undefined,
    municipio_id: filters.municipio_id && filters.municipio_id !== "0" ? parseInt(filters.municipio_id) : undefined,
  });

  const deleteMutation = trpc.tecnicos.delete.useMutation();

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este profissional?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Profissional deletado com sucesso");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar profissional");
    }
  };

  const handleWhatsApp = (whatsapp: string) => {
    const cleaned = whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/${cleaned}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-slate-900">Gerenciar Profissionais</h2>

      {/* Filtros */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Área</Label>
              <Select 
                value={filters.area_id} 
                onValueChange={(value) => setFilters({ ...filters, area_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Todas</SelectItem>
                  {areas?.map(area => (
                    <SelectItem key={area.id} value={area.id.toString()}>
                      {area.nome_area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Select 
                value={filters.estado_id} 
                onValueChange={(value) => setFilters({ ...filters, estado_id: value, cidade_id: "0", municipio_id: "0" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Todos</SelectItem>
                  {estados?.map(estado => (
                    <SelectItem key={estado.id} value={estado.id.toString()}>
                      {estado.uf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cidade</Label>
              <Select 
                value={filters.cidade_id} 
                onValueChange={(value) => setFilters({ ...filters, cidade_id: value, municipio_id: "0" })}
                disabled={!filters.estado_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Todas</SelectItem>
                  {cidades?.map(cidade => (
                    <SelectItem key={cidade.id} value={cidade.id.toString()}>
                      {cidade.nome_cidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Município</Label>
              <Select 
                value={filters.municipio_id} 
                onValueChange={(value) => setFilters({ ...filters, municipio_id: value })}
                disabled={!filters.cidade_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Todos</SelectItem>
                  {municipios?.map(municipio => (
                    <SelectItem key={municipio.id} value={municipio.id.toString()}>
                      {municipio.nome_municipio}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setFilters({ area_id: "", estado_id: "", cidade_id: "", municipio_id: "" })}
              >
                Limpar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Profissionais */}
      <div>
        <p className="text-lg font-semibold text-slate-900 mb-4">
          {isLoading ? "Carregando..." : `${tecnicos.length} profissional${tecnicos.length !== 1 ? 'is' : ''}`}
        </p>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : tecnicos.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-slate-600">
              Nenhum profissional encontrado.
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Nome</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Área</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Localização</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">WhatsApp</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Ações</th>
                </tr>
              </thead>
              <tbody>
                {tecnicos.map((tecnico: any) => (
                  <tr key={tecnico.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-900">Técnico #{tecnico.usuario_id}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{tecnico.area}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {tecnico.cidade}, {tecnico.estado}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{tecnico.email}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{tecnico.whatsapp}</td>
                    <td className="px-4 py-3 text-sm space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleWhatsApp(tecnico.whatsapp)}
                      >
                        <MessageCircle size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(tecnico.id)}
                        className="text-red-600 hover:text-red-700"
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
