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

export default function CidadesManagement() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nome, setNome] = useState("");
  const [estadoId, setEstadoId] = useState("");

  const { data: estados = [] } = trpc.estados.list.useQuery();
  const { data: cidades = [], refetch } = trpc.cidades.list.useQuery();
  const createMutation = trpc.cidades.create.useMutation();
  const updateMutation = trpc.cidades.update.useMutation();
  const deleteMutation = trpc.cidades.delete.useMutation();

  const handleSubmit = async () => {
    if (!nome.trim() || !estadoId) {
      toast.error("Nome e Estado são obrigatórios");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ 
          id: editingId, 
          nome_cidade: nome, 
          estado_id: parseInt(estadoId) 
        });
        toast.success("Cidade atualizada com sucesso");
      } else {
        await createMutation.mutateAsync({ 
          nome_cidade: nome, 
          estado_id: parseInt(estadoId) 
        });
        toast.success("Cidade criada com sucesso");
      }
      setNome("");
      setEstadoId("");
      setEditingId(null);
      setIsOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar cidade");
    }
  };

  const handleEdit = (cidade: any) => {
    setEditingId(cidade.id);
    setNome(cidade.nome_cidade);
    setEstadoId(cidade.estado_id.toString());
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar esta cidade?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Cidade deletada com sucesso");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar cidade");
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setNome("");
      setEstadoId("");
      setEditingId(null);
    }
    setIsOpen(open);
  };

  const getEstadoNome = (id: number) => {
    return estados.find(e => e.id === id)?.nome_estado || "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900">Cidades</h2>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              Nova Cidade
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Cidade" : "Nova Cidade"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select value={estadoId} onValueChange={setEstadoId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map(estado => (
                      <SelectItem key={estado.id} value={estado.id.toString()}>
                        {estado.nome_estado} ({estado.uf})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Cidade</Label>
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
        {cidades.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-slate-600">
              Nenhuma cidade cadastrada. Clique em "Nova Cidade" para começar.
            </CardContent>
          </Card>
        ) : (
          cidades.map((cidade: any) => (
            <Card key={cidade.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{cidade.nome_cidade}</h3>
                  <p className="text-sm text-slate-600">Estado: {getEstadoNome(cidade.estado_id)}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(cidade)}
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(cidade.id)}
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
