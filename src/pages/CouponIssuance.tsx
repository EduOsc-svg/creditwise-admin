import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import { Plus, Printer, Ticket, TrendingUp, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Coupon {
  id: string;
  code: string;
  customerId: string;
  customerName: string;
  amount: number;
  category: string;
  issuedDate: Date;
  expiryDate: Date;
  status: string;
}

const customers = [
  { id: "CST-001", name: "Budi Santoso" },
  { id: "CST-002", name: "Siti Rahayu" },
  { id: "CST-003", name: "Ahmad Yani" },
  { id: "CST-004", name: "Dewi Lestari" },
  { id: "CST-005", name: "Joko Widodo" },
];

const categories = [
  "Elektronik",
  "Furniture",
  "Pakaian",
  "Sembako",
  "Lainnya",
];

const initialCoupons: Coupon[] = [
  {
    id: "1",
    code: "CPN-0089",
    customerId: "CST-001",
    customerName: "Budi Santoso",
    amount: 2500000,
    category: "Elektronik",
    issuedDate: new Date(2024, 0, 15),
    expiryDate: new Date(2024, 1, 15),
    status: "active",
  },
  {
    id: "2",
    code: "CPN-0088",
    customerId: "CST-002",
    customerName: "Siti Rahayu",
    amount: 5000000,
    category: "Furniture",
    issuedDate: new Date(2024, 0, 10),
    expiryDate: new Date(2024, 2, 10),
    status: "active",
  },
  {
    id: "3",
    code: "CPN-0087",
    customerId: "CST-003",
    customerName: "Ahmad Yani",
    amount: 1500000,
    category: "Pakaian",
    issuedDate: new Date(2024, 0, 5),
    expiryDate: new Date(2024, 1, 5),
    status: "redeemed",
  },
  {
    id: "4",
    code: "CPN-0086",
    customerId: "CST-004",
    customerName: "Dewi Lestari",
    amount: 3000000,
    category: "Sembako",
    issuedDate: new Date(2023, 11, 1),
    expiryDate: new Date(2024, 0, 1),
    status: "expired",
  },
];

// Lending limit configuration
const MONTHLY_LENDING_LIMIT = 1000000000; // 1 Billion

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case "active":
      return "success";
    case "redeemed":
      return "warning";
    case "expired":
      return "danger";
    default:
      return "default";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "active":
      return "Aktif";
    case "redeemed":
      return "Ditukar";
    case "expired":
      return "Kedaluwarsa";
    default:
      return status;
  }
};

export default function CouponIssuance() {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    customerId: "",
    amount: "",
    category: "",
    expiryDays: "30",
  });

  // Calculate monthly issued amount (simulation)
  const monthlyIssuedAmount = coupons
    .filter((c) => {
      const now = new Date();
      return (
        c.issuedDate.getMonth() === now.getMonth() &&
        c.issuedDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, c) => sum + c.amount, 0);

  const remainingLimit = MONTHLY_LENDING_LIMIT - monthlyIssuedAmount;
  const usagePercentage = (monthlyIssuedAmount / MONTHLY_LENDING_LIMIT) * 100;
  const isNearLimit = usagePercentage >= 80;

  const handleIssueCoupon = () => {
    if (!newCoupon.customerId || !newCoupon.amount || !newCoupon.category) {
      toast.error("Semua field wajib diisi");
      return;
    }

    const amount = parseInt(newCoupon.amount);
    if (amount > remainingLimit) {
      toast.error("Jumlah melebihi sisa limit bulanan");
      return;
    }

    const customer = customers.find((c) => c.id === newCoupon.customerId);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(newCoupon.expiryDays));

    const coupon: Coupon = {
      id: String(coupons.length + 1),
      code: `CPN-${String(90 + coupons.length).padStart(4, "0")}`,
      customerId: newCoupon.customerId,
      customerName: customer?.name || "",
      amount: amount,
      category: newCoupon.category,
      issuedDate: new Date(),
      expiryDate,
      status: "active",
    };

    setCoupons([coupon, ...coupons]);
    setNewCoupon({ customerId: "", amount: "", category: "", expiryDays: "30" });
    setIsDialogOpen(false);
    toast.success(`Kupon ${coupon.code} berhasil diterbitkan`);
  };

  const handlePrint = (coupon: Coupon) => {
    toast.success(`Mencetak kupon ${coupon.code}...`);
  };

  const columns = [
    {
      key: "code",
      header: "Kode Kupon",
      className: "w-28",
      render: (item: Coupon) => (
        <div className="flex items-center gap-2">
          <Ticket className="h-4 w-4 text-primary" />
          <span className="font-mono font-medium">{item.code}</span>
        </div>
      ),
    },
    {
      key: "customerName",
      header: "Pelanggan",
      render: (item: Coupon) => (
        <div>
          <p className="font-medium">{item.customerName}</p>
          <p className="text-xs text-muted-foreground">{item.customerId}</p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Nilai",
      className: "text-right",
      render: (item: Coupon) => (
        <span className="font-mono font-semibold text-info">{formatCurrency(item.amount)}</span>
      ),
    },
    {
      key: "category",
      header: "Kategori",
      className: "w-28",
    },
    {
      key: "issuedDate",
      header: "Tanggal Terbit",
      className: "w-32",
      render: (item: Coupon) => format(item.issuedDate, "dd MMM yyyy"),
    },
    {
      key: "expiryDate",
      header: "Kadaluwarsa",
      className: "w-32",
      render: (item: Coupon) => format(item.expiryDate, "dd MMM yyyy"),
    },
    {
      key: "status",
      header: "Status",
      className: "w-28",
      render: (item: Coupon) => (
        <StatusBadge variant={getStatusVariant(item.status)}>
          {getStatusLabel(item.status)}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-24",
      render: (item: Coupon) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePrint(item)}
          disabled={item.status !== "active"}
        >
          <Printer className="h-4 w-4 mr-1" />
          Print
        </Button>
      ),
    },
  ];

  const activeCoupons = coupons.filter((c) => c.status === "active");
  const totalActiveValue = activeCoupons.reduce((sum, c) => sum + c.amount, 0);

  return (
    <MainLayout>
      <PageHeader title="Penerbitan Kupon" description="Kelola kupon kredit pelanggan">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Terbitkan Kupon
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Terbitkan Kupon Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Pilih Pelanggan *</Label>
                <Select
                  value={newCoupon.customerId}
                  onValueChange={(value) => setNewCoupon({ ...newCoupon, customerId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih pelanggan" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nilai Kredit *</Label>
                <Input
                  type="number"
                  placeholder="Masukkan jumlah"
                  value={newCoupon.amount}
                  onChange={(e) => setNewCoupon({ ...newCoupon, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Kategori Produk *</Label>
                <Select
                  value={newCoupon.category}
                  onValueChange={(value) => setNewCoupon({ ...newCoupon, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Masa Berlaku</Label>
                <Select
                  value={newCoupon.expiryDays}
                  onValueChange={(value) => setNewCoupon({ ...newCoupon, expiryDays: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 Hari</SelectItem>
                    <SelectItem value="60">60 Hari</SelectItem>
                    <SelectItem value="90">90 Hari</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleIssueCoupon} className="w-full">
                Terbitkan Kupon
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Lending Limit Section */}
      <div className="bg-card rounded-xl border p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Limit Pinjaman Bulanan</h2>
          </div>
          {isNearLimit && (
            <div className="flex items-center gap-1.5 text-warning">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Mendekati limit</span>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Terpakai bulan ini</span>
            <span className="font-mono font-semibold text-info">{formatCurrency(monthlyIssuedAmount)}</span>
          </div>
          
          <Progress 
            value={usagePercentage} 
            className="h-3"
          />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Sisa Limit</p>
              <p className="text-lg font-semibold font-mono text-success">{formatCurrency(remainingLimit)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Limit Bulanan</p>
              <p className="text-lg font-semibold font-mono">{formatCurrency(MONTHLY_LENDING_LIMIT)}</p>
            </div>
          </div>
          
          <div className="text-center pt-2 border-t">
            <span className="text-sm text-muted-foreground">
              Penggunaan: <span className={`font-semibold ${isNearLimit ? 'text-warning' : 'text-foreground'}`}>{usagePercentage.toFixed(1)}%</span>
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-card rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Kupon Aktif</p>
          <p className="text-2xl font-semibold">{activeCoupons.length}</p>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Total Nilai Aktif</p>
          <p className="text-2xl font-semibold font-mono text-info">{formatCurrency(totalActiveValue)}</p>
        </div>
      </div>

      <DataTable columns={columns} data={coupons} />
    </MainLayout>
  );
}
