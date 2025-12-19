import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, User, Phone, MapPin, CreditCard, ArrowUpRight, ArrowDownLeft, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useCustomers, Customer } from "@/hooks/useCustomers";
import { useInvoiceDetails } from "@/hooks/useInvoiceDetails";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function CustomerHistory() {
  const { data: customers = [], isLoading: customersLoading } = useCustomers();
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoiceDetails();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const isLoading = customersLoading || invoicesLoading;

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get customer statistics
  const getCustomerStats = (customerId: string) => {
    const customerInvoices = invoices.filter(inv => inv.customer_id === customerId);
    const totalCredit = customerInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
    const totalPaid = customerInvoices.reduce((sum, inv) => sum + Number(inv.paid_amount || 0), 0);
    const remaining = totalCredit - totalPaid;
    const hasOverdue = customerInvoices.some(inv => inv.status === "overdue" || inv.status === "unpaid");
    return { totalCredit, totalPaid, remaining, hasOverdue };
  };

  // Get transactions for selected customer
  const customerTransactions = selectedCustomer
    ? invoices
        .filter(inv => inv.customer_id === selectedCustomer.id)
        .map(inv => ({
          id: inv.coupon_id,
          no_faktur: inv.no_faktur,
          type: "credit" as const,
          description: `Kupon ${inv.no_faktur} - Angsuran ${inv.installment_index}`,
          amount: Number(inv.amount),
          paidAmount: Number(inv.paid_amount || 0),
          date: new Date(inv.due_date),
          status: inv.status,
        }))
        .sort((a, b) => b.date.getTime() - a.date.getTime())
    : [];

  const selectedCustomerStats = selectedCustomer ? getCustomerStats(selectedCustomer.id) : null;

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

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredCustomers.map((customer) => {
              const stats = getCustomerStats(customer.id);
              return (
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
                      <p className="text-xs text-muted-foreground">{customer.id.slice(0, 8)}</p>
                    </div>
                    <StatusBadge
                      variant={stats.hasOverdue ? "danger" : "success"}
                    >
                      {stats.hasOverdue ? "Menunggak" : "Baik"}
                    </StatusBadge>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Sisa: {formatCurrency(stats.remaining)}
                  </div>
                </Card>
              );
            })}
            {filteredCustomers.length === 0 && (
              <p className="text-center text-muted-foreground py-4">Tidak ada pelanggan ditemukan</p>
            )}
          </div>
        </div>

        {/* Customer Profile & History */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCustomer && selectedCustomerStats ? (
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
                      <p className="text-sm text-muted-foreground">{selectedCustomer.id.slice(0, 8)}</p>
                    </div>
                  </div>
                  <StatusBadge
                    variant={selectedCustomerStats.hasOverdue ? "danger" : "success"}
                    className="text-sm px-4 py-1"
                  >
                    Status: {selectedCustomerStats.hasOverdue ? "Menunggak" : "Baik"}
                  </StatusBadge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {selectedCustomer.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedCustomer.phone}</span>
                    </div>
                  )}
                  {selectedCustomer.address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{selectedCustomer.address}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">Total Kredit</p>
                    <p className="text-lg font-semibold font-mono">
                      {formatCurrency(selectedCustomerStats.totalCredit)}
                    </p>
                  </div>
                  <div className="bg-success-muted rounded-lg p-4">
                    <p className="text-xs text-success mb-1">Total Dibayar</p>
                    <p className="text-lg font-semibold font-mono text-success">
                      {formatCurrency(selectedCustomerStats.totalPaid)}
                    </p>
                  </div>
                  <div className="bg-danger-muted rounded-lg p-4">
                    <p className="text-xs text-danger mb-1">Sisa Piutang</p>
                    <p className="text-lg font-semibold font-mono text-danger">
                      {formatCurrency(selectedCustomerStats.remaining)}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Transaction Timeline */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Riwayat Kupon
                </h3>

                <div className="space-y-1">
                  {customerTransactions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">Belum ada transaksi</p>
                  ) : (
                    customerTransactions.map((trx, index) => (
                      <div
                        key={trx.id}
                        className={cn(
                          "flex items-center gap-4 py-3 px-3 rounded-lg transition-colors hover:bg-muted/50",
                          index !== customerTransactions.length - 1 && "border-b"
                        )}
                      >
                        <div
                          className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                            trx.paidAmount >= trx.amount ? "bg-success-muted" : "bg-warning-muted"
                          )}
                        >
                          {trx.paidAmount >= trx.amount ? (
                            <ArrowDownLeft className="h-5 w-5 text-success" />
                          ) : (
                            <ArrowUpRight className="h-5 w-5 text-warning" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{trx.description}</p>
                          <p className="text-xs text-muted-foreground">
                            Jatuh tempo: {format(trx.date, "dd MMM yyyy")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-semibold text-info">
                            {formatCurrency(trx.amount)}
                          </p>
                          <p className="text-xs text-success">
                            Bayar: {formatCurrency(trx.paidAmount)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
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
