import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Printer, Send, Filter, CheckCircle, AlertCircle, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { collectors, areas } from "@/data/collectors";

interface Bill {
  id: string;
  customerId: string;
  customerName: string;
  area: string;
  collectorId: string;
  billAmount: number;
  dueDate: Date;
  amountPaid: number;
  status: string;
  collectorNotes: string;
}

const initialBills: Bill[] = [
  {
    id: "BIL-001",
    customerId: "CST-001",
    customerName: "Budi Santoso",
    area: "Jakarta Selatan",
    collectorId: "COL-001",
    billAmount: 2500000,
    dueDate: new Date(2024, 0, 15),
    amountPaid: 0,
    status: "pending",
    collectorNotes: "",
  },
  {
    id: "BIL-002",
    customerId: "CST-002",
    customerName: "Siti Rahayu",
    area: "Jakarta Pusat",
    collectorId: "COL-002",
    billAmount: 1800000,
    dueDate: new Date(2024, 0, 15),
    amountPaid: 0,
    status: "pending",
    collectorNotes: "",
  },
  {
    id: "BIL-003",
    customerId: "CST-003",
    customerName: "Ahmad Yani",
    area: "Jakarta Timur",
    collectorId: "COL-003",
    billAmount: 3200000,
    dueDate: new Date(2024, 0, 15),
    amountPaid: 0,
    status: "pending",
    collectorNotes: "",
  },
  {
    id: "BIL-004",
    customerId: "CST-004",
    customerName: "Dewi Lestari",
    area: "Jakarta Selatan",
    collectorId: "COL-001",
    billAmount: 4500000,
    dueDate: new Date(2024, 0, 16),
    amountPaid: 0,
    status: "pending",
    collectorNotes: "",
  },
  {
    id: "BIL-005",
    customerId: "CST-005",
    customerName: "Joko Widodo",
    area: "Jakarta Pusat",
    collectorId: "COL-002",
    billAmount: 2000000,
    dueDate: new Date(2024, 0, 14),
    amountPaid: 0,
    status: "overdue",
    collectorNotes: "",
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const getCollectorName = (collectorId: string) => {
  const collector = collectors.find((c) => c.id === collectorId);
  return collector?.name || "-";
};

export default function CollectionBilling() {
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [selectedArea, setSelectedArea] = useState("all");
  const [selectedCollector, setSelectedCollector] = useState("all");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const filteredBills = bills.filter((bill) => {
    if (selectedArea !== "all" && bill.area !== selectedArea) return false;
    if (selectedCollector !== "all" && bill.collectorId !== selectedCollector) return false;
    return true;
  });

  const selectedCollectorName = selectedCollector === "all" 
    ? "Semua Kolektor" 
    : getCollectorName(selectedCollector);

  const handlePrintManifest = () => {
    toast.success(`Mencetak manifest untuk ${selectedCollectorName}...`);
  };

  const handlePaymentChange = (billId: string, field: string, value: string | number) => {
    setBills((prev) =>
      prev.map((bill) => {
        if (bill.id === billId) {
          const updated = { ...bill, [field]: value };
          if (field === "amountPaid") {
            const paid = Number(value);
            if (paid >= bill.billAmount) {
              updated.status = "paid";
            } else if (paid > 0) {
              updated.status = "partial";
            } else {
              updated.status = "pending";
            }
          }
          return updated;
        }
        return bill;
      })
    );
  };

  const handleSubmitCollection = () => {
    const updated = bills.filter(
      (b) => b.status === "paid" || b.status === "partial" || b.collectorNotes
    );
    toast.success(`${updated.length} data penagihan berhasil disimpan`);
  };

  const totalBills = filteredBills.reduce((sum, b) => sum + b.billAmount, 0);
  const totalCollected = filteredBills.reduce((sum, b) => sum + b.amountPaid, 0);

  return (
    <MainLayout>
      <PageHeader title="Penagihan" description="Kelola manifest dan rekonsiliasi pembayaran" />

      <Tabs defaultValue="manifest" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="manifest">Generate Manifest</TabsTrigger>
          <TabsTrigger value="reconcile">Input Pembayaran</TabsTrigger>
        </TabsList>

        <TabsContent value="manifest" className="space-y-4">
          <div className="bg-card rounded-xl border p-4">
            <div className="flex items-center gap-4 mb-4">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Filter</span>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Tanggal Jatuh Tempo</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-44"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Area</label>
                <Select value={selectedArea} onValueChange={setSelectedArea}>
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Area</SelectItem>
                    {areas.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Kolektor</label>
                <Select value={selectedCollector} onValueChange={setSelectedCollector}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kolektor</SelectItem>
                    {collectors.map((collector) => (
                      <SelectItem key={collector.id} value={collector.id}>
                        {collector.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={handlePrintManifest} className="gap-2">
                  <Printer className="h-4 w-4" />
                  Print Manifest untuk {selectedCollectorName}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card rounded-xl border p-4">
              <p className="text-sm text-muted-foreground">Total Tagihan</p>
              <p className="text-xl font-semibold font-mono">{formatCurrency(totalBills)}</p>
            </div>
            <div className="bg-card rounded-xl border p-4">
              <p className="text-sm text-muted-foreground">Jumlah Pelanggan</p>
              <p className="text-xl font-semibold">{filteredBills.length}</p>
            </div>
            <div className="bg-card rounded-xl border p-4">
              <p className="text-sm text-muted-foreground">Menunggak</p>
              <p className="text-xl font-semibold text-danger">
                {filteredBills.filter((b) => b.status === "overdue").length}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Pelanggan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Alamat/Area
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Kolektor
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tagihan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredBills.map((bill, index) => (
                  <tr key={bill.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{bill.customerName}</p>
                      <p className="text-xs text-muted-foreground">{bill.customerId}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{bill.area}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{getCollectorName(bill.collectorId)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold">
                      {formatCurrency(bill.billAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        variant={bill.status === "overdue" ? "danger" : "default"}
                      >
                        {bill.status === "overdue" ? "Menunggak" : "Jatuh Tempo"}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="reconcile" className="space-y-4">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-primary" />
            <p className="text-sm">
              Masukkan hasil penagihan dari kolektor. Isi jumlah yang dibayar dan status untuk setiap pelanggan.
            </p>
          </div>

          <div className="flex gap-4 mb-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Filter Kolektor</label>
              <Select value={selectedCollector} onValueChange={setSelectedCollector}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kolektor</SelectItem>
                  {collectors.map((collector) => (
                    <SelectItem key={collector.id} value={collector.id}>
                      {collector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-card rounded-xl border p-4">
              <p className="text-sm text-muted-foreground">Total Target</p>
              <p className="text-xl font-semibold font-mono">{formatCurrency(totalBills)}</p>
            </div>
            <div className="bg-success-muted rounded-xl border border-success/20 p-4">
              <p className="text-sm text-success">Total Terkumpul</p>
              <p className="text-xl font-semibold font-mono text-success">
                {formatCurrency(totalCollected)}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground w-44">
                    Pelanggan
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground w-36">
                    Kolektor
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground w-28">
                    Tagihan
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground w-36">
                    Jumlah Bayar
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground w-32">
                    Status
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Catatan Kolektor
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-muted/30">
                    <td className="px-3 py-2">
                      <p className="font-medium">{bill.customerName}</p>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        <span>{getCollectorName(bill.collectorId)}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {formatCurrency(bill.billAmount)}
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        placeholder="0"
                        value={bill.amountPaid || ""}
                        onChange={(e) =>
                          handlePaymentChange(bill.id, "amountPaid", Number(e.target.value))
                        }
                        className="h-8 font-mono"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Select
                        value={bill.status}
                        onValueChange={(value) => handlePaymentChange(bill.id, "status", value)}
                      >
                        <SelectTrigger className="h-8 w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Pending
                            </span>
                          </SelectItem>
                          <SelectItem value="paid">
                            <span className="flex items-center gap-1 text-success">
                              <CheckCircle className="h-3 w-3" /> Lunas
                            </span>
                          </SelectItem>
                          <SelectItem value="partial">
                            <span className="flex items-center gap-1 text-warning">
                              <AlertCircle className="h-3 w-3" /> Sebagian
                            </span>
                          </SelectItem>
                          <SelectItem value="unpaid">
                            <span className="flex items-center gap-1 text-danger">
                              <AlertCircle className="h-3 w-3" /> Tidak Bayar
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        placeholder="Catatan..."
                        value={bill.collectorNotes}
                        onChange={(e) =>
                          handlePaymentChange(bill.id, "collectorNotes", e.target.value)
                        }
                        className="h-8"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSubmitCollection} size="lg" className="gap-2">
              <Send className="h-4 w-4" />
              Submit Penagihan Harian
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
