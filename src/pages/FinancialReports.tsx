import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/ui/page-header";
import { MetricCard } from "@/components/ui/metric-card";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Percent,
  Download,
  Calendar,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { collectors, areas } from "@/data/collectors";

interface Transaction {
  id: string;
  date: Date;
  type: "issuance" | "payment";
  referenceId: string;
  customerName: string;
  amount: number;
  collector?: string;
}

const transactions: Transaction[] = [
  { id: "1", date: new Date(2024, 0, 15), type: "issuance", referenceId: "CPN-0089", customerName: "Budi Santoso", amount: 2500000 },
  { id: "2", date: new Date(2024, 0, 15), type: "payment", referenceId: "PAY-0421", customerName: "Siti Rahayu", amount: 1200000, collector: "Agus Hermawan" },
  { id: "3", date: new Date(2024, 0, 14), type: "payment", referenceId: "PAY-0420", customerName: "Ahmad Yani", amount: 500000, collector: "Budi Pratama" },
  { id: "4", date: new Date(2024, 0, 14), type: "issuance", referenceId: "CPN-0088", customerName: "Siti Rahayu", amount: 5000000 },
  { id: "5", date: new Date(2024, 0, 13), type: "payment", referenceId: "PAY-0419", customerName: "Dewi Lestari", amount: 3000000, collector: "Agus Hermawan" },
  { id: "6", date: new Date(2024, 0, 13), type: "issuance", referenceId: "CPN-0087", customerName: "Ahmad Yani", amount: 1500000 },
  { id: "7", date: new Date(2024, 0, 12), type: "payment", referenceId: "PAY-0418", customerName: "Joko Widodo", amount: 2000000, collector: "Cahya Putra" },
  { id: "8", date: new Date(2024, 0, 12), type: "issuance", referenceId: "CPN-0086", customerName: "Dewi Lestari", amount: 3000000 },
  { id: "9", date: new Date(2024, 0, 11), type: "payment", referenceId: "PAY-0417", customerName: "Rina Susanti", amount: 1500000, collector: "Dedi Kurniawan" },
  { id: "10", date: new Date(2024, 0, 11), type: "issuance", referenceId: "CPN-0085", customerName: "Rina Susanti", amount: 4000000 },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function FinancialReports() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedArea, setSelectedArea] = useState("all");
  const [selectedCollector, setSelectedCollector] = useState("all");

  // Calculate summary metrics
  const totalOmset = transactions
    .filter((t) => t.type === "issuance")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCollected = transactions
    .filter((t) => t.type === "payment")
    .reduce((sum, t) => sum + t.amount, 0);

  const collectionRate = totalOmset > 0 ? (totalCollected / totalOmset) * 100 : 0;

  const handleExport = () => {
    // Simulate CSV export
    const headers = ["Tanggal", "Tipe", "Referensi", "Pelanggan", "Jumlah", "Kolektor"];
    const rows = transactions.map((t) => [
      format(t.date, "yyyy-MM-dd"),
      t.type === "issuance" ? "Penerbitan" : "Pembayaran",
      t.referenceId,
      t.customerName,
      t.amount.toString(),
      t.collector || "-",
    ]);
    
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `laporan-keuangan-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success("Laporan berhasil diekspor ke CSV");
  };

  const columns = [
    {
      key: "date",
      header: "Tanggal",
      className: "w-28",
      render: (item: Transaction) => (
        <span className="text-muted-foreground">{format(item.date, "dd MMM yyyy")}</span>
      ),
    },
    {
      key: "type",
      header: "Tipe",
      className: "w-28",
      render: (item: Transaction) => (
        <StatusBadge variant={item.type === "issuance" ? "info" : "success"}>
          {item.type === "issuance" ? "Penerbitan" : "Pembayaran"}
        </StatusBadge>
      ),
    },
    {
      key: "referenceId",
      header: "Referensi",
      className: "w-28",
      render: (item: Transaction) => (
        <span className="font-mono text-sm">{item.referenceId}</span>
      ),
    },
    {
      key: "customerName",
      header: "Pelanggan",
      render: (item: Transaction) => (
        <span className="font-medium">{item.customerName}</span>
      ),
    },
    {
      key: "amount",
      header: "Jumlah",
      className: "text-right w-36",
      render: (item: Transaction) => (
        <span className={`font-mono font-semibold ${item.type === "issuance" ? "text-info" : "text-success"}`}>
          {item.type === "issuance" ? "-" : "+"}{formatCurrency(item.amount)}
        </span>
      ),
    },
    {
      key: "collector",
      header: "Kolektor",
      className: "w-36",
      render: (item: Transaction) => (
        <span className="text-muted-foreground">{item.collector || "-"}</span>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader title="Laporan Keuangan" description="Analisis mendalam omset dan penagihan">
        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </PageHeader>

      {/* Filters Section */}
      <div className="bg-card rounded-xl border p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">Filter Laporan</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">Tanggal Mulai</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Tanggal Akhir</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Area</Label>
            <Select value={selectedArea} onValueChange={setSelectedArea}>
              <SelectTrigger>
                <SelectValue placeholder="Semua Area" />
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
          <div className="space-y-2">
            <Label className="text-xs">Kolektor</Label>
            <Select value={selectedCollector} onValueChange={setSelectedCollector}>
              <SelectTrigger>
                <SelectValue placeholder="Semua Kolektor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kolektor</SelectItem>
                {collectors.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="Total Omset (Sales)"
          value={formatCurrency(totalOmset)}
          subtitle="Nilai kupon diterbitkan"
          icon={TrendingUp}
          trend={{ value: "Credit disbursed", positive: false }}
          className="border-l-4 border-l-info"
        />
        <MetricCard
          title="Total Tertagih"
          value={formatCurrency(totalCollected)}
          subtitle="Uang masuk dari pelanggan"
          icon={TrendingDown}
          trend={{ value: "Cash collected", positive: true }}
          className="border-l-4 border-l-success"
        />
        <MetricCard
          title="Collection Rate"
          value={`${collectionRate.toFixed(1)}%`}
          subtitle="Rasio penagihan"
          icon={Percent}
          trend={{ value: collectionRate >= 80 ? "Baik" : "Perlu perhatian", positive: collectionRate >= 80 }}
          className="border-l-4 border-l-primary"
        />
      </div>

      {/* Detailed Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Detail Transaksi</h2>
          <span className="text-sm text-muted-foreground">{transactions.length} transaksi</span>
        </div>
        <DataTable columns={columns} data={transactions} />
      </div>
    </MainLayout>
  );
}
