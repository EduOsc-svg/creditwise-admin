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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Search, Phone, MapPin, Edit, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { collectors as initialCollectors, areas, Collector } from "@/data/collectors";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function CollectorManagement() {
  const [collectors, setCollectors] = useState<Collector[]>(initialCollectors);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCollector, setEditingCollector] = useState<Collector | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    assignedArea: "",
  });

  const filteredCollectors = collectors.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.assignedArea.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (collector?: Collector) => {
    if (collector) {
      setEditingCollector(collector);
      setFormData({
        name: collector.name,
        phone: collector.phone,
        assignedArea: collector.assignedArea,
      });
    } else {
      setEditingCollector(null);
      setFormData({ name: "", phone: "", assignedArea: "" });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.phone || !formData.assignedArea) {
      toast.error("Semua field wajib diisi");
      return;
    }

    if (editingCollector) {
      setCollectors((prev) =>
        prev.map((c) =>
          c.id === editingCollector.id
            ? { ...c, name: formData.name, phone: formData.phone, assignedArea: formData.assignedArea }
            : c
        )
      );
      toast.success("Data kolektor berhasil diperbarui");
    } else {
      const newCollector: Collector = {
        id: `COL-${String(collectors.length + 1).padStart(3, "0")}`,
        name: formData.name,
        phone: formData.phone,
        assignedArea: formData.assignedArea,
        totalCollected: 0,
        activeCustomers: 0,
      };
      setCollectors([...collectors, newCollector]);
      toast.success("Kolektor berhasil ditambahkan");
    }

    setIsDialogOpen(false);
    setFormData({ name: "", phone: "", assignedArea: "" });
    setEditingCollector(null);
  };

  const handleDelete = (collector: Collector) => {
    setCollectors((prev) => prev.filter((c) => c.id !== collector.id));
    toast.success("Kolektor berhasil dihapus");
  };

  const columns = [
    {
      key: "id",
      header: "ID",
      className: "w-24",
      render: (item: Collector) => (
        <span className="font-mono text-xs">{item.id}</span>
      ),
    },
    {
      key: "name",
      header: "Nama Kolektor",
      render: (item: Collector) => (
        <div>
          <p className="font-medium">{item.name}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <Phone className="h-3 w-3" />
            {item.phone}
          </div>
        </div>
      ),
    },
    {
      key: "assignedArea",
      header: "Area Tugas",
      render: (item: Collector) => (
        <div className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{item.assignedArea}</span>
        </div>
      ),
    },
    {
      key: "activeCustomers",
      header: "Pelanggan",
      className: "text-center w-28",
      render: (item: Collector) => (
        <div className="flex items-center justify-center gap-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{item.activeCustomers}</span>
        </div>
      ),
    },
    {
      key: "totalCollected",
      header: "Total Tagihan",
      className: "text-right",
      render: (item: Collector) => (
        <span className="font-mono text-success font-medium">
          {formatCurrency(item.totalCollected)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-24",
      render: (item: Collector) => (
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

  return (
    <MainLayout>
      <PageHeader title="Manajemen Kolektor" description="Kelola data kolektor lapangan">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Kolektor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCollector ? "Edit Kolektor" : "Tambah Kolektor Baru"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Nama Lengkap *</Label>
                <Input
                  placeholder="Masukkan nama kolektor"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nomor Telepon *</Label>
                <Input
                  placeholder="08xxxxxxxxxx"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Area Tugas *</Label>
                <Select
                  value={formData.assignedArea}
                  onValueChange={(value) => setFormData({ ...formData, assignedArea: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih area" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} className="w-full">
                {editingCollector ? "Simpan Perubahan" : "Tambah Kolektor"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, ID, atau area..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <DataTable columns={columns} data={filteredCollectors} />

      <div className="mt-4 text-sm text-muted-foreground">
        Menampilkan {filteredCollectors.length} dari {collectors.length} kolektor
      </div>
    </MainLayout>
  );
}
