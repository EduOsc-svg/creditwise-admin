import { MainLayout } from "@/components/layout/MainLayout";
import { MetricCard } from "@/components/ui/metric-card";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { Ticket, Wallet, Target, Banknote, Clock, TrendingUp, User, BarChart3, MapPin, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useInvoiceDetails } from "@/hooks/useInvoiceDetails";
import { useSalesAgents } from "@/hooks/useSalesAgents";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { supabase } from '../integrations/supabase/client';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatCurrencyShort = (amount: number) => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  return formatCurrency(amount);
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

// Category data for Pie chart (static for now)
const categoryData = [
  { name: "Elektronik", value: 40, color: "hsl(var(--chart-1))" },
  { name: "Furniture", value: 30, color: "hsl(var(--chart-2))" },
  { name: "Sembako", value: 20, color: "hsl(var(--chart-3))" },
  { name: "Lainnya", value: 10, color: "hsl(var(--chart-4))" },
];

export default function Dashboard() {
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoiceDetails();
  const { data: salesAgents = [], isLoading: agentsLoading } = useSalesAgents();

  const isLoading = invoicesLoading || agentsLoading;

  // Calculate metrics from real data
  const activeCoupons = invoices.filter(i => i.status === "unpaid" || i.status === "partial");
  const totalActiveCouponValue = activeCoupons.reduce((sum, i) => sum + Number(i.amount), 0);
  
  const totalPiutang = invoices.reduce((sum, i) => {
    const remaining = Number(i.amount) - Number(i.paid_amount || 0);
    return sum + (remaining > 0 ? remaining : 0);
  }, 0);

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayInvoices = invoices.filter(i => i.due_date === todayStr);
  const todayTarget = todayInvoices.reduce((sum, i) => sum + Number(i.amount), 0);
  const todayCollected = todayInvoices.reduce((sum, i) => sum + Number(i.paid_amount || 0), 0);

  const metrics = [
    {
      title: "Total Kupon Aktif",
      value: formatCurrency(totalActiveCouponValue),
      subtitle: `${activeCoupons.length} kupon aktif`,
      icon: Ticket,
    },
    {
      title: "Total Piutang",
      value: formatCurrency(totalPiutang),
      subtitle: `${invoices.length} kupon`,
      icon: Wallet,
    },
    {
      title: "Target Hari Ini",
      value: formatCurrency(todayTarget),
      subtitle: `${todayInvoices.length} tagihan`,
      icon: Target,
    },
    {
      title: "Terkumpul Hari Ini",
      value: formatCurrency(todayCollected),
      subtitle: todayTarget > 0 ? `${((todayCollected / todayTarget) * 100).toFixed(1)}% dari target` : "Tidak ada target",
      icon: Banknote,
    },
  ];

  // Recent activities from invoices
  const recentActivities = invoices.slice(0, 5).map(inv => ({
    id: inv.coupon_id,
    description: `Kupon ${inv.no_faktur} - ${inv.customer_name}`,
    amount: formatCurrency(Number(inv.amount)),
    timestamp: new Date(inv.due_date),
    status: inv.status,
  }));

  // Sales performance
  const salesPerformance = salesAgents.map(agent => {
    const agentInvoices = invoices.filter(i => i.sales_id === agent.id);
    const totalCollected = agentInvoices.reduce((sum, i) => sum + Number(i.paid_amount || 0), 0);
    const customerCount = new Set(agentInvoices.map(i => i.customer_id)).size;
    return {
      ...agent,
      totalCollected,
      customerCount,
    };
  }).sort((a, b) => b.totalCollected - a.totalCollected);

  const maxCollected = Math.max(...salesPerformance.map(s => s.totalCollected), 1);

  // Area performance from invoices
  const areaPerformance = salesAgents
    .filter(a => a.area)
    .reduce((acc, agent) => {
      const area = agent.area!;
      const agentInvoices = invoices.filter(i => i.sales_id === agent.id);
      const total = agentInvoices.reduce((sum, i) => sum + Number(i.amount), 0);
      
      const existing = acc.find(a => a.area === area);
      if (existing) {
        existing.value += total;
      } else {
        acc.push({ area, value: total });
      }
      return acc;
    }, [] as { area: string; value: number }[])
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const activityColumns = [
    {
      key: "timestamp",
      header: "Jatuh Tempo",
      className: "w-28",
      render: (item: typeof recentActivities[0]) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{format(item.timestamp, "dd MMM")}</span>
        </div>
      ),
    },
    {
      key: "description",
      header: "Aktivitas",
      render: (item: typeof recentActivities[0]) => (
        <span className="font-medium text-sm">{item.description}</span>
      ),
    },
    {
      key: "amount",
      header: "Jumlah",
      className: "text-right",
      render: (item: typeof recentActivities[0]) => (
        <span className="font-mono">{item.amount}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      className: "w-28",
      render: (item: typeof recentActivities[0]) => (
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
      <PageHeader
        title="Dashboard"
        description={`Overview data per ${format(new Date(), "dd MMMM yyyy")}`}
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Area Performance */}
        {areaPerformance.length > 0 && (
          <div className="lg:col-span-2 bg-card rounded-xl border p-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Performa per Area</h2>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={areaPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => formatCurrencyShort(v)} />
                  <YAxis type="category" dataKey="area" stroke="hsl(var(--muted-foreground))" fontSize={12} width={120} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [formatCurrency(value), "Total Omset"]}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Pie Chart - Sales by Category */}
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-medium">Kategori Penjualan</h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  dataKey="value"
                  label={({ value }) => `${value}%`}
                  labelLine={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`${value}%`, ""]}
                />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Kupon Terbaru</h2>
            <span className="text-sm text-muted-foreground">{invoices.length} total</span>
          </div>
          <DataTable columns={activityColumns} data={recentActivities} />
        </div>

        {/* Sales Performance */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Performa Sales
            </h2>
          </div>
          <div className="bg-card rounded-xl border p-4 space-y-4">
            {salesPerformance.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Belum ada data sales</p>
            ) : (
              salesPerformance.map((agent, index) => {
                const percentage = (agent.totalCollected / maxCollected) * 100;
                return (
                  <div key={agent.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                          {index + 1}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{agent.name}</span>
                        </div>
                      </div>
                      <span className="font-mono text-sm font-semibold text-success">
                        {formatCurrency(agent.totalCollected)}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{agent.area || "-"}</span>
                      <span>{agent.customerCount} pelanggan</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// Tambahkan fungsi untuk menambahkan pelanggan, kontrak, dan kupon cicilan
async function addCustomer(customerData, contractData, couponsData) {
  try {
    // Tambahkan pelanggan
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert(customerData)
      .select();

    if (customerError) throw new Error(customerError.message);

    const customerId = customer[0].id;

    // Tambahkan kontrak kredit
    const { data: contract, error: contractError } = await supabase
      .from('credit_contracts')
      .insert({ ...contractData, customer_id: customerId })
      .select();

    if (contractError) throw new Error(contractError.message);

    const contractId = contract[0].id;

    // Tambahkan kupon cicilan
    const coupons = couponsData.map((coupon) => ({
      ...coupon,
      contract_id: contractId,
    }));

    const { error: couponsError } = await supabase.from('installment_coupons').insert(coupons);

    if (couponsError) throw new Error(couponsError.message);

    console.log('Customer, contract, and coupons added successfully:', {
      customer,
      contract,
      coupons,
    });

    return { customer, contract, coupons };
  } catch (error) {
    console.error('Error adding customer:', error);
    throw error;
  }
}

// Contoh data input
const customerData = {
  name: 'M, ADI/TK, DEWI',
  address: 'JL. S. PARMAN',
  phone: '081345678901',
  assigned_sales_id: 'SOME_SALES_AGENT_ID',
};

const contractData = {
  contract_ref: 'A001',
  sales_id: 'SOME_SALES_AGENT_ID',
  tenor_days: 100,
  start_date: '2025-12-01',
  total_loan_amount: 6000000,
};

const couponsData = [
  { installment_index: 28, due_date: '2025-12-13', amount: 60000 },
  { installment_index: 29, due_date: '2025-12-14', amount: 60000 },
  { installment_index: 30, due_date: '2025-12-15', amount: 60000 },
];

// Panggil fungsi untuk menambahkan data
addCustomer(customerData, contractData, couponsData).then((result) => {
  console.log('Result:', result);
}).catch((error) => {
  console.error('Error:', error);
});
