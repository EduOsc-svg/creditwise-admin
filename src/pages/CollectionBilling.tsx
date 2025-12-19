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
import { Printer, Filter, CheckCircle, AlertCircle, Clock, User, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useInvoiceDetails, useUpdateCouponPayment, InvoiceDetail } from "@/hooks/useInvoiceDetails";
import { useSalesAgents } from "@/hooks/useSalesAgents";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function CollectionBilling() {
  const { data: invoices = [], isLoading } = useInvoiceDetails();
  const { data: salesAgents = [] } = useSalesAgents();
  const updatePayment = useUpdateCouponPayment();

  const [selectedSales, setSelectedSales] = useState("all");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [paymentInputs, setPaymentInputs] = useState<Record<string, number>>({});

  const filteredInvoices = invoices.filter((invoice) => {
    if (selectedSales !== "all" && invoice.sales_id !== selectedSales) return false;
    return true;
  });

  const selectedSalesName = selectedSales === "all" 
    ? "Semua Sales" 
    : salesAgents.find(s => s.id === selectedSales)?.name || "Sales";

  const handlePrintManifest = () => {
    toast.success(`Mencetak manifest untuk ${selectedSalesName}...`);
  };

  const handlePaymentInput = (couponId: string, value: number) => {
    setPaymentInputs(prev => ({ ...prev, [couponId]: value }));
  };

  const handleSavePayment = async (invoice: InvoiceDetail) => {
    const paidAmount = paymentInputs[invoice.coupon_id] || 0;
    let status = invoice.status;
    
    if (paidAmount >= invoice.amount) {
      status = "paid";
    } else if (paidAmount > 0) {
      status = "partial";
    }

    await updatePayment.mutateAsync({
      coupon_id: invoice.coupon_id,
      paid_amount: paidAmount,
      paid_date: paidAmount > 0 ? format(new Date(), "yyyy-MM-dd") : null,
      status,
    });
  };

  const totalBills = filteredInvoices.reduce((sum, b) => sum + Number(b.amount), 0);
  const totalCollected = filteredInvoices.reduce((sum, b) => sum + Number(b.paid_amount || 0), 0);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "paid": return "success";
      case "partial": return "warning";
      case "overdue": return "danger";
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
                <label className="text-xs text-muted-foreground">Sales</label>
                <Select value={selectedSales} onValueChange={setSelectedSales}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
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
              <div className="flex items-end">
                <Button onClick={handlePrintManifest} className="gap-2">
                  <Printer className="h-4 w-4" />
                  Print Manifest untuk {selectedSalesName}
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
              <p className="text-sm text-muted-foreground">Jumlah Kupon</p>
              <p className="text-xl font-semibold">{filteredInvoices.length}</p>
            </div>
            <div className="bg-card rounded-xl border p-4">
              <p className="text-sm text-muted-foreground">Menunggak</p>
              <p className="text-xl font-semibold text-danger">
                {filteredInvoices.filter((b) => b.status === "overdue" || b.status === "unpaid").length}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">No</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">No Faktur</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pelanggan</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sales</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Jatuh Tempo</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tagihan</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredInvoices.map((invoice, index) => (
                  <tr key={invoice.coupon_id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs">{invoice.no_faktur}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{invoice.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{invoice.customer_address}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{invoice.sales_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {format(new Date(invoice.due_date), "dd MMM yyyy")}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold">
                      {formatCurrency(Number(invoice.amount))}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge variant={getStatusVariant(invoice.status)}>
                        {getStatusLabel(invoice.status)}
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
              Masukkan hasil penagihan dari sales. Isi jumlah yang dibayar untuk setiap kupon.
            </p>
          </div>

          <div className="flex gap-4 mb-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Filter Sales</label>
              <Select value={selectedSales} onValueChange={setSelectedSales}>
                <SelectTrigger className="w-48">
                  <SelectValue />
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
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">No Faktur</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pelanggan</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sales</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tagihan</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Jumlah Bayar</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.coupon_id} className="hover:bg-muted/30">
                    <td className="px-3 py-2 font-mono text-xs">{invoice.no_faktur}</td>
                    <td className="px-3 py-2">
                      <p className="font-medium">{invoice.customer_name}</p>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        <span>{invoice.sales_name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {formatCurrency(Number(invoice.amount))}
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        placeholder="0"
                        value={paymentInputs[invoice.coupon_id] || invoice.paid_amount || ""}
                        onChange={(e) => handlePaymentInput(invoice.coupon_id, Number(e.target.value))}
                        className="h-8 w-32 font-mono"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <StatusBadge variant={getStatusVariant(invoice.status)}>
                        {getStatusLabel(invoice.status)}
                      </StatusBadge>
                    </td>
                    <td className="px-3 py-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSavePayment(invoice)}
                        disabled={updatePayment.isPending}
                      >
                        {updatePayment.isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <CheckCircle className="h-3 w-3" />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
