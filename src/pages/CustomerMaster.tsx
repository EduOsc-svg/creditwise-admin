import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
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
import { Plus, Search, Phone, MapPin, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  area: string;
  creditLimit: number;
  outstandingDebt: number;
  status: string;
  creditScore: string;
}

const initialCustomers: Customer[] = [
  {
    id: "CST-001",
    name: "Budi Santoso",
    phone: "081234567890",
    address: "Jl. Merdeka No. 123, Jakarta Selatan",
    area: "Jakarta Selatan",
    creditLimit: 10000000,
    outstandingDebt: 2500000,
    status: "active",
    creditScore: "good",
  },
  {
    id: "CST-002",
    name: "Siti Rahayu",
    phone: "082345678901",
    address: "Jl. Sudirman No. 45, Jakarta Pusat",
    area: "Jakarta Pusat",
    creditLimit: 15000000,
    outstandingDebt: 8500000,
    status: "active",
    creditScore: "good",
  },
  {
    id: "CST-003",
    name: "Ahmad Yani",
    phone: "083456789012",
    address: "Jl. Gatot Subroto No. 67, Jakarta Timur",
    area: "Jakarta Timur",
    creditLimit: 5000000,
    outstandingDebt: 4800000,
    status: "warning",
    creditScore: "bad",
  },
  {
    id: "CST-004",
    name: "Dewi Lestari",
    phone: "084567890123",
    address: "Jl. Kemang Raya No. 89, Jakarta Selatan",
    area: "Jakarta Selatan",
    creditLimit: 20000000,
    outstandingDebt: 0,
    status: "active",
    creditScore: "good",
  },
  {
    id: "CST-005",
    name: "Joko Widodo",
    phone: "085678901234",
    address: "Jl. Thamrin No. 12, Jakarta Pusat",
    area: "Jakarta Pusat",
    creditLimit: 8000000,
    outstandingDebt: 8000000,
    status: "blocked",
    creditScore: "bad",
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function CustomerMaster() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    area: "",
    creditLimit: "",
  });

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCustomer = () => {
    if (!newCustomer.name || !newCustomer.phone) {
      toast.error("Nama dan nomor telepon wajib diisi");
      return;
    }

    const customer: Customer = {
      id: `CST-${String(customers.length + 1).padStart(3, "0")}`,
      name: newCustomer.name,
      phone: newCustomer.phone,
      address: newCustomer.address,
      area: newCustomer.area,
      creditLimit: parseInt(newCustomer.creditLimit) || 0,
      outstandingDebt: 0,
      status: "active",
      creditScore: "good",
    };

    setCustomers([...customers, customer]);
    setNewCustomer({ name: "", phone: "", address: "", area: "", creditLimit: "" });
    setIsDialogOpen(false);
    toast.success("Pelanggan berhasil ditambahkan");
  };

  const columns = [
    {
      key: "id",
      header: "ID",
      className: "w-24",
      render: (item: Customer) => (
        <span className="font-mono text-xs">{item.id}</span>
      ),
    },
    {
      key: "name",
      header: "Nama Pelanggan",
      render: (item: Customer) => (
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
      key: "address",
      header: "Alamat",
      render: (item: Customer) => (
        <div className="flex items-start gap-1 text-sm">
          <MapPin className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
          <span className="line-clamp-2">{item.address}</span>
        </div>
      ),
    },
    {
      key: "area",
      header: "Area",
      className: "w-32",
    },
    {
      key: "creditLimit",
      header: "Limit Kredit",
      className: "text-right",
      render: (item: Customer) => (
        <span className="font-mono">{formatCurrency(item.creditLimit)}</span>
      ),
    },
    {
      key: "outstandingDebt",
      header: "Piutang",
      className: "text-right",
      render: (item: Customer) => (
        <span className={`font-mono ${item.outstandingDebt > 0 ? "text-danger" : "text-success"}`}>
          {formatCurrency(item.outstandingDebt)}
        </span>
      ),
    },
    {
      key: "creditScore",
      header: "Skor",
      className: "w-20",
      render: (item: Customer) => (
        <StatusBadge variant={item.creditScore === "good" ? "success" : "danger"}>
          {item.creditScore === "good" ? "Baik" : "Buruk"}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-20",
      render: () => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-danger hover:text-danger">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

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
                <Label>Nomor Telepon *</Label>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Area</Label>
                  <Input
                    placeholder="Wilayah"
                    value={newCustomer.area}
                    onChange={(e) => setNewCustomer({ ...newCustomer, area: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Limit Kredit</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newCustomer.creditLimit}
                    onChange={(e) => setNewCustomer({ ...newCustomer, creditLimit: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleAddCustomer} className="w-full">
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
            placeholder="Cari nama, ID, atau area..."
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
