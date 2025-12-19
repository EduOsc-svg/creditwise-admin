import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Printer, Ticket, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useInvoiceDetails, InvoiceDetail } from "@/hooks/useInvoiceDetails";

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
    case "paid":
      return "success";
    case "partial":
      return "warning";
    case "overdue":
    case "unpaid":
      return "danger";
    default:
      return "default";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "paid":
      return "Lunas";
    case "partial":
      return "Sebagian";
    case "overdue":
      return "Menunggak";
    case "unpaid":
      return "Belum Bayar";
    default:
      return status;
  }
};

export default function CouponIssuance() {
  const { data: invoices = [], isLoading } = useInvoiceDetails();

  // Calculate monthly issued amount (based on contracts starting this month)
  const monthlyIssuedAmount = invoices.reduce((sum, inv) => {
    const startDate = new Date(inv.start_date);
    const now = new Date();
    if (startDate.getMonth() === now.getMonth() && startDate.getFullYear() === now.getFullYear()) {
      return sum + Number(inv.amount);
    }
    return sum;
  }, 0);

  const remainingLimit = MONTHLY_LENDING_LIMIT - monthlyIssuedAmount;
  const usagePercentage = (monthlyIssuedAmount / MONTHLY_LENDING_LIMIT) * 100;
  const isNearLimit = usagePercentage >= 80;

  const handlePrint = (invoice: InvoiceDetail) => {
    toast.success(`Mencetak kupon ${invoice.no_faktur}...`);
  };

  const columns = [
    {
      key: "no_faktur",
      header: "No Faktur",
      className: "w-40",
      render: (item: InvoiceDetail) => (
        <div className="flex items-center gap-2">
          <Ticket className="h-4 w-4 text-primary" />
          <span className="font-mono font-medium text-xs">{item.no_faktur}</span>
        </div>
      ),
    },
    {
      key: "customerName",
      header: "Pelanggan",
      render: (item: InvoiceDetail) => (
        <div>
          <p className="font-medium">{item.customer_name}</p>
          <p className="text-xs text-muted-foreground">{item.customer_address}</p>
        </div>
      ),
    },
    {
      key: "installment",
      header: "Angsuran",
      className: "text-center w-24",
      render: (item: InvoiceDetail) => (
        <span className="font-mono">{item.installment_index}/{item.tenor_days}</span>
      ),
    },
    {
      key: "amount",
      header: "Nilai",
      className: "text-right",
      render: (item: InvoiceDetail) => (
        <span className="font-mono font-semibold text-info">{formatCurrency(Number(item.amount))}</span>
      ),
    },
    {
      key: "sales",
      header: "Sales",
      className: "w-28",
      render: (item: InvoiceDetail) => (
        <span className="text-sm">{item.sales_name}</span>
      ),
    },
    {
      key: "dueDate",
      header: "Jatuh Tempo",
      className: "w-32",
      render: (item: InvoiceDetail) => format(new Date(item.due_date), "dd MMM yyyy"),
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
    {
      key: "actions",
      header: "",
      className: "w-24",
      render: (item: InvoiceDetail) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePrint(item)}
          disabled={item.status === "paid"}
        >
          <Printer className="h-4 w-4 mr-1" />
          Print
        </Button>
      ),
    },
  ];

  const activeCoupons = invoices.filter((c) => c.status === "unpaid" || c.status === "partial");
  const totalActiveValue = activeCoupons.reduce((sum, c) => sum + Number(c.amount), 0);

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
      <PageHeader title="Kupon Angsuran" description="Daftar kupon angsuran pelanggan" />

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
          <p className="text-sm text-muted-foreground">Kupon Belum Lunas</p>
          <p className="text-2xl font-semibold">{activeCoupons.length}</p>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Total Nilai Belum Lunas</p>
          <p className="text-2xl font-semibold font-mono text-info">{formatCurrency(totalActiveValue)}</p>
        </div>
      </div>

      <DataTable columns={columns} data={invoices} />
    </MainLayout>
  );
}
