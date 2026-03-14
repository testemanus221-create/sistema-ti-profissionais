import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";

export default function EstadosManagement() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nome, setNome] = useState("");
  const [uf, setUf] = useState("");

  const { data: estados = [], refetch } = trpc.estados.list.useQuery();
  const createMutation = trpc.estados.create.useMutation();
  const updateMutation = trpc.estados.update.useMutation();
  const deleteMutation = trpc.estados.delete.useMutation();

  const handleSubmit = async () => {
    if (!nome.trim() || !uf.trim()) {
      toast.error("Nome e UF são obrigatórios");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, nome_estado: nome, uf: uf.toUpperCase() });
        toast.success("Estado atualizado com sucesso");
      } else {
        await createMutation.mutateAsync({ nome_estado: nome, uf: uf.toUpperCase() });
        toast.success("Estado criado com sucesso");
      }
      setNome("");
      setUf("");
      setEditingId(null);
      setIsOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar estado");
    }
  };

  const handleEdit = (estado: any) => {
    setEditingId(estado.id);
    setNome(estado.nome_estado);
    setUf(estado.uf);
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este estado?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Estado deletado com sucesso");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar estado");
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setNome("");
      setUf("");
      setEditingId(null);
    }
    setIsOpen(open);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900">Estados</h2>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              Novo Estado
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Estado" : "Novo Estado"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Estado</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: São Paulo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uf">UF (2 caracteres)</Label>
                <Input
                  id="uf"
                  value={uf}
                  onChange={(e) => setUf(e.target.value.toUpperCase().slice(0, 2))}
                  placeholder="Ex: SP"
                  maxLength={2}
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
        {estados.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-slate-600">
              Nenhum estado cadastrado. Clique em "Novo Estado" para começar.
            </CardContent>
          </Card>
        ) : (
          estados.map((estado: any) => (
            <Card key={estado.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{estado.nome_estado}</h3>
                  <p className="text-sm text-slate-600">UF: {estado.uf}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(estado)}
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(estado.id)}
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
