import { MainLayout } from "@/components/layout/MainLayout";
import { MetricCard } from "@/components/ui/metric-card";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { Ticket, Wallet, Target, Banknote, Clock, TrendingUp, User } from "lucide-react";
import { format } from "date-fns";
import { collectors } from "@/data/collectors";

const metrics = [
  {
    title: "Total Kupon Aktif",
    value: "Rp 45,800,000",
    subtitle: "23 kupon aktif",
    icon: Ticket,
    trend: { value: "12%", positive: true },
  },
  {
    title: "Total Piutang",
    value: "Rp 128,500,000",
    subtitle: "156 pelanggan",
    icon: Wallet,
    trend: { value: "8%", positive: false },
  },
  {
    title: "Target Hari Ini",
    value: "Rp 15,200,000",
    subtitle: "42 tagihan",
    icon: Target,
  },
  {
    title: "Uang Masuk Hari Ini",
    value: "Rp 8,750,000",
    subtitle: "57.5% dari target",
    icon: Banknote,
    trend: { value: "23%", positive: true },
  },
];

const recentActivities = [
  {
    id: 1,
    type: "coupon",
    description: "Kupon CPN-0089 diterbitkan untuk Budi Santoso",
    amount: "Rp 2,500,000",
    timestamp: new Date(2024, 0, 15, 14, 30),
    status: "active",
  },
  {
    id: 2,
    type: "payment",
    description: "Pembayaran dari Siti Rahayu",
    amount: "Rp 1,200,000",
    timestamp: new Date(2024, 0, 15, 13, 15),
    status: "paid",
  },
  {
    id: 3,
    type: "payment",
    description: "Pembayaran sebagian dari Ahmad Yani",
    amount: "Rp 500,000",
    timestamp: new Date(2024, 0, 15, 11, 45),
    status: "partial",
  },
  {
    id: 4,
    type: "coupon",
    description: "Kupon CPN-0088 kedaluwarsa - Dewi Lestari",
    amount: "Rp 3,000,000",
    timestamp: new Date(2024, 0, 15, 10, 0),
    status: "expired",
  },
  {
    id: 5,
    type: "payment",
    description: "Gagal tagih - Joko Widodo",
    amount: "Rp 2,000,000",
    timestamp: new Date(2024, 0, 15, 9, 30),
    status: "overdue",
  },
];

const getStatusVariant = (status: string) => {
  switch (status) {
    case "active":
    case "paid":
      return "success";
    case "partial":
      return "warning";
    case "expired":
    case "overdue":
      return "danger";
    default:
      return "default";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "active":
      return "Aktif";
    case "paid":
      return "Lunas";
    case "partial":
      return "Sebagian";
    case "expired":
      return "Kedaluwarsa";
    case "overdue":
      return "Menunggak";
    default:
      return status;
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const activityColumns = [
  {
    key: "timestamp",
    header: "Waktu",
    className: "w-32",
    render: (item: (typeof recentActivities)[0]) => (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        <span>{format(item.timestamp, "HH:mm")}</span>
      </div>
    ),
  },
  {
    key: "description",
    header: "Aktivitas",
    render: (item: (typeof recentActivities)[0]) => (
      <span className="font-medium">{item.description}</span>
    ),
  },
  {
    key: "amount",
    header: "Jumlah",
    className: "text-right",
    render: (item: (typeof recentActivities)[0]) => (
      <span className="font-mono">{item.amount}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    className: "w-28",
    render: (item: (typeof recentActivities)[0]) => (
      <StatusBadge variant={getStatusVariant(item.status)}>
        {getStatusLabel(item.status)}
      </StatusBadge>
    ),
  },
];

// Sort collectors by total collected (descending)
const sortedCollectors = [...collectors].sort((a, b) => b.totalCollected - a.totalCollected);
const maxCollected = Math.max(...collectors.map((c) => c.totalCollected));

export default function Dashboard() {
  return (
    <MainLayout>
      <PageHeader
        title="Dashboard"
        description={`Overview data per ${format(new Date(), "dd MMMM yyyy")}`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Aktivitas Terbaru</h2>
            <span className="text-sm text-muted-foreground">Hari ini</span>
          </div>
          <DataTable columns={activityColumns} data={recentActivities} />
        </div>

        {/* Collector Performance */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Performa Kolektor
            </h2>
            <span className="text-sm text-muted-foreground">Hari ini</span>
          </div>
          <div className="bg-card rounded-xl border p-4 space-y-4">
            {sortedCollectors.map((collector, index) => {
              const percentage = (collector.totalCollected / maxCollected) * 100;
              return (
                <div key={collector.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{collector.name}</span>
                      </div>
                    </div>
                    <span className="font-mono text-sm font-semibold text-success">
                      {formatCurrency(collector.totalCollected)}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{collector.assignedArea}</span>
                    <span>{collector.activeCustomers} pelanggan</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
