import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Phone, MapPin, Edit, Trash2, Loader2 } from "lucide-react";
import { useSalesAgents, useCreateSalesAgent, useUpdateSalesAgent, useDeleteSalesAgent, SalesAgent } from "@/hooks/useSalesAgents";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function CollectorManagement() {
  const { data: salesAgents = [], isLoading } = useSalesAgents();
  const createAgent = useCreateSalesAgent();
  const updateAgent = useUpdateSalesAgent();
  const deleteAgent = useDeleteSalesAgent();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<SalesAgent | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    area: "",
    agent_code: "",
  });

  const filteredAgents = salesAgents.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.agent_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.area?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (agent?: SalesAgent) => {
    if (agent) {
      setEditingAgent(agent);
      setFormData({
        name: agent.name,
        phone: agent.phone || "",
        area: agent.area || "",
        agent_code: agent.agent_code,
      });
    } else {
      setEditingAgent(null);
      setFormData({ name: "", phone: "", area: "", agent_code: "" });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.agent_code) {
      return;
    }

    if (editingAgent) {
      await updateAgent.mutateAsync({
        id: editingAgent.id,
        name: formData.name,
        phone: formData.phone || null,
        area: formData.area || null,
        agent_code: formData.agent_code,
      });
    } else {
      await createAgent.mutateAsync({
        name: formData.name,
        phone: formData.phone || null,
        area: formData.area || null,
        agent_code: formData.agent_code,
      });
    }

    setIsDialogOpen(false);
    setFormData({ name: "", phone: "", area: "", agent_code: "" });
    setEditingAgent(null);
  };

  const handleDelete = async (agent: SalesAgent) => {
    await deleteAgent.mutateAsync(agent.id);
  };

  const columns = [
    {
      key: "agent_code",
      header: "Kode",
      className: "w-24",
      render: (item: SalesAgent) => (
        <span className="font-mono text-xs">{item.agent_code}</span>
      ),
    },
    {
      key: "name",
      header: "Nama Sales",
      render: (item: SalesAgent) => (
        <div>
          <p className="font-medium">{item.name}</p>
          {item.phone && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <Phone className="h-3 w-3" />
              {item.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "area",
      header: "Area",
      render: (item: SalesAgent) => (
        <div className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{item.area || "-"}</span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-24",
      render: (item: SalesAgent) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleOpenDialog(item)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-danger hover:text-danger"
            onClick={() => handleDelete(item)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader title="Manajemen Sales" description="Kelola data sales agent">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Sales
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAgent ? "Edit Sales" : "Tambah Sales Baru"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Kode Sales *</Label>
                <Input
                  placeholder="Contoh: S/DANIEL"
                  value={formData.agent_code}
                  onChange={(e) => setFormData({ ...formData, agent_code: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nama Lengkap *</Label>
                <Input
                  placeholder="Masukkan nama sales"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nomor Telepon</Label>
                <Input
                  placeholder="08xxxxxxxxxx"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Area</Label>
                <Input
                  placeholder="Contoh: Jakarta Selatan"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                />
              </div>
              <Button 
                onClick={handleSave} 
                className="w-full"
                disabled={createAgent.isPending || updateAgent.isPending}
              >
                {(createAgent.isPending || updateAgent.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingAgent ? "Simpan Perubahan" : "Tambah Sales"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, kode, atau area..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <DataTable columns={columns} data={filteredAgents} />

      <div className="mt-4 text-sm text-muted-foreground">
        Menampilkan {filteredAgents.length} dari {salesAgents.length} sales
      </div>
    </MainLayout>
  );
}
