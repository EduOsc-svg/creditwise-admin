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
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useInvoiceDetails, InvoiceDetail } from "@/hooks/useInvoiceDetails";
import { useSalesAgents } from "@/hooks/useSalesAgents";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function FinancialReports() {
  const { data: invoices = [], isLoading } = useInvoiceDetails();
  const { data: salesAgents = [] } = useSalesAgents();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSales, setSelectedSales] = useState("all");

  // Filter invoices based on criteria
  const filteredInvoices = invoices.filter((inv) => {
    if (selectedSales !== "all" && inv.sales_id !== selectedSales) return false;
    if (startDate && inv.due_date < startDate) return false;
    if (endDate && inv.due_date > endDate) return false;
    return true;
  });

  // Calculate summary metrics
  const totalOmset = filteredInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const totalCollected = filteredInvoices.reduce((sum, inv) => sum + Number(inv.paid_amount || 0), 0);
  const collectionRate = totalOmset > 0 ? (totalCollected / totalOmset) * 100 : 0;

  const handleExport = () => {
    const headers = ["No Faktur", "Tanggal", "Pelanggan", "Sales", "Tagihan", "Terbayar", "Status"];
    const rows = filteredInvoices.map((inv) => [
      inv.no_faktur,
      inv.due_date,
      inv.customer_name,
      inv.sales_name,
      inv.amount.toString(),
      (inv.paid_amount || 0).toString(),
      inv.status,
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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "paid": return "success";
      case "partial": return "warning";
      case "overdue":
      case "unpaid": return "danger";
      default: return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid": return "Lunas";
      case "partial": return "Sebagian";
      case "overdue": return "Menunggak";
      case "unpaid": return "Belum Bayar";
      default: return status;
    }
  };

  const columns = [
    {
      key: "due_date",
      header: "Jatuh Tempo",
      className: "w-28",
      render: (item: InvoiceDetail) => (
        <span className="text-muted-foreground">{format(new Date(item.due_date), "dd MMM yyyy")}</span>
      ),
    },
    {
      key: "no_faktur",
      header: "No Faktur",
      className: "w-36",
      render: (item: InvoiceDetail) => (
        <span className="font-mono text-xs">{item.no_faktur}</span>
      ),
    },
    {
      key: "customer_name",
      header: "Pelanggan",
      render: (item: InvoiceDetail) => (
        <span className="font-medium">{item.customer_name}</span>
      ),
    },
    {
      key: "sales_name",
      header: "Sales",
      className: "w-32",
      render: (item: InvoiceDetail) => (
        <span className="text-muted-foreground">{item.sales_name}</span>
      ),
    },
    {
      key: "amount",
      header: "Tagihan",
      className: "text-right w-32",
      render: (item: InvoiceDetail) => (
        <span className="font-mono font-semibold text-info">
          {formatCurrency(Number(item.amount))}
        </span>
      ),
    },
    {
      key: "paid_amount",
      header: "Terbayar",
      className: "text-right w-32",
      render: (item: InvoiceDetail) => (
        <span className="font-mono font-semibold text-success">
          {formatCurrency(Number(item.paid_amount || 0))}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      className: "w-28",
      render: (item: InvoiceDetail) => (
        <StatusBadge variant={getStatusVariant(item.status)}>
          {getStatusLabel(item.status)}
        </StatusBadge>
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
            <Label className="text-xs">Sales</Label>
            <Select value={selectedSales} onValueChange={setSelectedSales}>
              <SelectTrigger>
                <SelectValue placeholder="Semua Sales" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Sales</SelectItem>
                {salesAgents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
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
          className="border-l-4 border-l-info"
        />
        <MetricCard
          title="Total Tertagih"
          value={formatCurrency(totalCollected)}
          subtitle="Uang masuk dari pelanggan"
          icon={TrendingDown}
          className="border-l-4 border-l-success"
        />
        <MetricCard
          title="Collection Rate"
          value={`${collectionRate.toFixed(1)}%`}
          subtitle="Rasio penagihan"
          icon={Percent}
          className="border-l-4 border-l-primary"
        />
      </div>

      {/* Detailed Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Detail Transaksi</h2>
          <span className="text-sm text-muted-foreground">{filteredInvoices.length} transaksi</span>
        </div>
        <DataTable columns={columns} data={filteredInvoices} />
      </div>
    </MainLayout>
  );
}
