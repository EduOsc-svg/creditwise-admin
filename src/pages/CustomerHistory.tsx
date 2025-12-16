import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, User, Phone, MapPin, CreditCard, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  creditScore: "good" | "bad";
  totalCredit: number;
  totalPaid: number;
}

interface Transaction {
  id: string;
  type: "credit" | "payment";
  description: string;
  amount: number;
  date: Date;
  balance: number;
}

const customers: Customer[] = [
  {
    id: "CST-001",
    name: "Budi Santoso",
    phone: "081234567890",
    address: "Jl. Merdeka No. 123, Jakarta Selatan",
    creditScore: "good",
    totalCredit: 15000000,
    totalPaid: 12500000,
  },
  {
    id: "CST-002",
    name: "Siti Rahayu",
    phone: "082345678901",
    address: "Jl. Sudirman No. 45, Jakarta Pusat",
    creditScore: "good",
    totalCredit: 25000000,
    totalPaid: 16500000,
  },
  {
    id: "CST-003",
    name: "Ahmad Yani",
    phone: "083456789012",
    address: "Jl. Gatot Subroto No. 67, Jakarta Timur",
    creditScore: "bad",
    totalCredit: 8000000,
    totalPaid: 3200000,
  },
];

const transactionHistory: Record<string, Transaction[]> = {
  "CST-001": [
    {
      id: "TRX-001",
      type: "credit",
      description: "Kupon CPN-0089 - Elektronik",
      amount: 2500000,
      date: new Date(2024, 0, 15),
      balance: 2500000,
    },
    {
      id: "TRX-002",
      type: "payment",
      description: "Pembayaran tunai",
      amount: 1000000,
      date: new Date(2024, 0, 10),
      balance: 1500000,
    },
    {
      id: "TRX-003",
      type: "credit",
      description: "Kupon CPN-0085 - Furniture",
      amount: 5000000,
      date: new Date(2024, 0, 5),
      balance: 6500000,
    },
    {
      id: "TRX-004",
      type: "payment",
      description: "Pembayaran tunai",
      amount: 2000000,
      date: new Date(2024, 0, 1),
      balance: 4500000,
    },
    {
      id: "TRX-005",
      type: "payment",
      description: "Pembayaran tunai",
      amount: 2000000,
      date: new Date(2023, 11, 20),
      balance: 2500000,
    },
  ],
  "CST-002": [
    {
      id: "TRX-006",
      type: "credit",
      description: "Kupon CPN-0088 - Sembako",
      amount: 5000000,
      date: new Date(2024, 0, 10),
      balance: 8500000,
    },
    {
      id: "TRX-007",
      type: "payment",
      description: "Pembayaran transfer",
      amount: 3500000,
      date: new Date(2024, 0, 5),
      balance: 3500000,
    },
  ],
  "CST-003": [
    {
      id: "TRX-008",
      type: "credit",
      description: "Kupon CPN-0087 - Pakaian",
      amount: 1500000,
      date: new Date(2024, 0, 5),
      balance: 4800000,
    },
    {
      id: "TRX-009",
      type: "payment",
      description: "Pembayaran sebagian",
      amount: 500000,
      date: new Date(2023, 11, 28),
      balance: 3300000,
    },
  ],
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function CustomerHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const transactions = selectedCustomer
    ? transactionHistory[selectedCustomer.id] || []
    : [];

  return (
    <MainLayout>
      <PageHeader
        title="Riwayat Pelanggan"
        description="Lihat histori transaksi dan profil kredit pelanggan"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search & Customer List */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau ID pelanggan..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            {filteredCustomers.map((customer) => (
              <Card
                key={customer.id}
                className={cn(
                  "p-4 cursor-pointer transition-all hover:border-primary/50",
                  selectedCustomer?.id === customer.id && "border-primary bg-primary/5"
                )}
                onClick={() => setSelectedCustomer(customer)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">{customer.id}</p>
                  </div>
                  <StatusBadge
                    variant={customer.creditScore === "good" ? "success" : "danger"}
                  >
                    {customer.creditScore === "good" ? "Baik" : "Buruk"}
                  </StatusBadge>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Sisa: {formatCurrency(customer.totalCredit - customer.totalPaid)}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Customer Profile & History */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCustomer ? (
            <>
              {/* Profile Section */}
              <Card className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{selectedCustomer.name}</h2>
                      <p className="text-sm text-muted-foreground">{selectedCustomer.id}</p>
                    </div>
                  </div>
                  <StatusBadge
                    variant={selectedCustomer.creditScore === "good" ? "success" : "danger"}
                    className="text-sm px-4 py-1"
                  >
                    Skor Kredit: {selectedCustomer.creditScore === "good" ? "Baik" : "Buruk"}
                  </StatusBadge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedCustomer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{selectedCustomer.address}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">Total Kredit</p>
                    <p className="text-lg font-semibold font-mono">
                      {formatCurrency(selectedCustomer.totalCredit)}
                    </p>
                  </div>
                  <div className="bg-success-muted rounded-lg p-4">
                    <p className="text-xs text-success mb-1">Total Dibayar</p>
                    <p className="text-lg font-semibold font-mono text-success">
                      {formatCurrency(selectedCustomer.totalPaid)}
                    </p>
                  </div>
                  <div className="bg-danger-muted rounded-lg p-4">
                    <p className="text-xs text-danger mb-1">Sisa Piutang</p>
                    <p className="text-lg font-semibold font-mono text-danger">
                      {formatCurrency(selectedCustomer.totalCredit - selectedCustomer.totalPaid)}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Transaction Timeline */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Riwayat Transaksi
                </h3>

                <div className="space-y-1">
                  {transactions.map((trx, index) => (
                    <div
                      key={trx.id}
                      className={cn(
                        "flex items-center gap-4 py-3 px-3 rounded-lg transition-colors hover:bg-muted/50",
                        index !== transactions.length - 1 && "border-b"
                      )}
                    >
                      <div
                        className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                          trx.type === "credit" ? "bg-danger-muted" : "bg-success-muted"
                        )}
                      >
                        {trx.type === "credit" ? (
                          <ArrowUpRight className="h-5 w-5 text-danger" />
                        ) : (
                          <ArrowDownLeft className="h-5 w-5 text-success" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{trx.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(trx.date, "dd MMM yyyy")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={cn(
                            "font-mono font-semibold",
                            trx.type === "credit" ? "text-danger" : "text-success"
                          )}
                        >
                          {trx.type === "credit" ? "+" : "-"}
                          {formatCurrency(trx.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Saldo: {formatCurrency(trx.balance)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-12 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Pilih pelanggan dari daftar untuk melihat riwayat
              </p>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
