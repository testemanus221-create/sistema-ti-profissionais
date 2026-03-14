import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";

export default function MunicipiosManagement() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nome, setNome] = useState("");
  const [cidadeId, setCidadeId] = useState("");

  const utils = trpc.useUtils();
  const { data: cidades = [] } = trpc.cidades.list.useQuery();
  const { data: municipios = [] } = trpc.municipios.list.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
  const createMutation = trpc.municipios.create.useMutation({
    onSuccess: () => utils.municipios.list.invalidate(),
  });
  const updateMutation = trpc.municipios.update.useMutation({
    onSuccess: () => utils.municipios.list.invalidate(),
  });
  const deleteMutation = trpc.municipios.delete.useMutation({
    onSuccess: () => utils.municipios.list.invalidate(),
  });

  const handleSubmit = async () => {
    if (!nome.trim() || !cidadeId) {
      toast.error("Nome e Cidade são obrigatórios");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ 
          id: editingId, 
          nome_municipio: nome, 
          cidade_id: parseInt(cidadeId) 
        });
        toast.success("Município atualizado com sucesso");
      } else {
        await createMutation.mutateAsync({ 
          nome_municipio: nome, 
          cidade_id: parseInt(cidadeId) 
        });
        toast.success("Município criado com sucesso");
      }
      setNome("");
      setCidadeId("");
      setEditingId(null);
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar município");
    }
  };

  const handleEdit = (municipio: any) => {
    setEditingId(municipio.id);
    setNome(municipio.nome_municipio);
    setCidadeId(municipio.cidade_id.toString());
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este município?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Município deletado com sucesso");
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar município");
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setNome("");
      setCidadeId("");
      setEditingId(null);
    }
    setIsOpen(open);
  };

  const getCidadeNome = (id: number) => {
    return cidades.find(c => c.id === id)?.nome_cidade || "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900">Municípios</h2>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              Novo Município
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Município" : "Novo Município"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Select value={cidadeId} onValueChange={setCidadeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {cidades.map(cidade => (
                      <SelectItem key={cidade.id} value={cidade.id.toString()}>
                        {cidade.nome_cidade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Município</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: São Paulo"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => handleOpenChange(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={16} />
                      Salvando...
                    </>
                  ) : (
                    "Salvar"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {municipios.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-slate-600">
              Nenhum município cadastrado. Clique em "Novo Município" para começar.
            </CardContent>
          </Card>
        ) : (
          municipios.map((municipio: any) => (
            <Card key={municipio.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{municipio.nome_municipio}</h3>
                  <p className="text-sm text-slate-600">Cidade: {getCidadeNome(municipio.cidade_id)}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(municipio)}
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(municipio.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
