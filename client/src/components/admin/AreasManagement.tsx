import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";

export default function AreasManagement() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nome, setNome] = useState("");

  const { data: areas = [], refetch } = trpc.areas.list.useQuery();
  const createMutation = trpc.areas.create.useMutation();
  const updateMutation = trpc.areas.update.useMutation();
  const deleteMutation = trpc.areas.delete.useMutation();

  const handleSubmit = async () => {
    if (!nome.trim()) {
      toast.error("Nome da área é obrigatório");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, nome_area: nome });
        toast.success("Área atualizada com sucesso");
      } else {
        await createMutation.mutateAsync({ nome_area: nome });
        toast.success("Área criada com sucesso");
      }
      setNome("");
      setEditingId(null);
      setIsOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar área");
    }
  };

  const handleEdit = (area: any) => {
    setEditingId(area.id);
    setNome(area.nome_area);
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar esta área?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Área deletada com sucesso");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar área");
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setNome("");
      setEditingId(null);
    }
    setIsOpen(open);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900">Áreas de Atuação</h2>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              Nova Área
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Área" : "Nova Área de Atuação"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Área</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Redes, Suporte, Desenvolvimento..."
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
        {areas.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-slate-600">
              Nenhuma área cadastrada. Clique em "Nova Área" para começar.
            </CardContent>
          </Card>
        ) : (
          areas.map((area: any) => (
            <Card key={area.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{area.nome_area}</h3>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(area)}
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(area.id)}
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
