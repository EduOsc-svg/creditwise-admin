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
import { Plus, Search, Phone, MapPin, Edit, Trash2, Loader2, User } from "lucide-react";
import { useCustomers, useCreateCustomer, useDeleteCustomer, Customer } from "@/hooks/useCustomers";
import { useSalesAgents } from "@/hooks/useSalesAgents";

export default function CustomerMaster() {
  const { data: customers = [], isLoading } = useCustomers();
  const { data: salesAgents = [] } = useSalesAgents();
  const createCustomer = useCreateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    assigned_sales_id: "",
  });

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.address?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const getSalesName = (salesId: string | null) => {
    if (!salesId) return "-";
    const agent = salesAgents.find((a) => a.id === salesId);
    return agent?.name || "-";
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.name) {
      return;
    }

    await createCustomer.mutateAsync({
      name: newCustomer.name,
      phone: newCustomer.phone || null,
      address: newCustomer.address || null,
      assigned_sales_id: newCustomer.assigned_sales_id || null,
    });

    setNewCustomer({ name: "", phone: "", address: "", assigned_sales_id: "" });
    setIsDialogOpen(false);
  };

  const handleDelete = async (customer: Customer) => {
    await deleteCustomer.mutateAsync(customer.id);
  };

  const columns = [
    {
      key: "id",
      header: "ID",
      className: "w-24",
      render: (item: Customer) => (
        <span className="font-mono text-xs">{item.id.slice(0, 8)}</span>
      ),
    },
    {
      key: "name",
      header: "Nama Pelanggan",
      render: (item: Customer) => (
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
      key: "address",
      header: "Alamat",
      render: (item: Customer) => (
        <div className="flex items-center gap-1 text-sm">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="truncate max-w-[200px]">{item.address || "-"}</span>
        </div>
      ),
    },
    {
      key: "assigned_sales",
      header: "Sales",
      className: "w-36",
      render: (item: Customer) => (
        <div className="flex items-center gap-1.5 text-sm">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{getSalesName(item.assigned_sales_id)}</span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-20",
      render: (item: Customer) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
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
      <PageHeader title="Data Pelanggan" description="Kelola data pelanggan kredit">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Pelanggan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Pelanggan Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Nama Lengkap *</Label>
                <Input
                  placeholder="Masukkan nama pelanggan"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nomor Telepon</Label>
                <Input
                  placeholder="08xxxxxxxxxx"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Alamat</Label>
                <Input
                  placeholder="Alamat lengkap"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Sales</Label>
                <Select
                  value={newCustomer.assigned_sales_id}
                  onValueChange={(value) => setNewCustomer({ ...newCustomer, assigned_sales_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih sales" />
                  </SelectTrigger>
                  <SelectContent>
                    {salesAgents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name} ({agent.agent_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleAddCustomer} 
                className="w-full"
                disabled={createCustomer.isPending}
              >
                {createCustomer.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Simpan Pelanggan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, ID, atau alamat..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <DataTable columns={columns} data={filteredCustomers} />

      <div className="mt-4 text-sm text-muted-foreground">
        Menampilkan {filteredCustomers.length} dari {customers.length} pelanggan
      </div>
    </MainLayout>
  );
}
