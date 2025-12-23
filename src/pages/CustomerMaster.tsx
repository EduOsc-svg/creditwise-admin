import { useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { Plus, Search, Phone, MapPin, Edit, Trash2, Loader2, User } from "lucide-react";
import { useCustomers, useCreateCustomer, useDeleteCustomer, Customer } from "@/hooks/useCustomers";
import { useForm } from "react-hook-form";
import { useSalesAgents } from "@/hooks/useSalesAgents";
import { useCreateCreditContract } from "@/hooks/useCreditContracts";

export default function CustomerMaster() {
  const { data: customers = [], isLoading } = useCustomers();
  const { data: salesAgents = [] } = useSalesAgents();
  const createCustomer = useCreateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { register, handleSubmit, reset, setValue, formState } = useForm<{
    name: string;
    phone?: string;
    address?: string;
    assigned_sales_id?: string;
    product_type?: string;
    total_loan_amount?: string;
    tenor_days?: string;
    daily_installment_amount?: string;
  }>({ defaultValues: { name: "", phone: "", address: "", assigned_sales_id: "", product_type: "", total_loan_amount: "", tenor_days: "", daily_installment_amount: "" } });
  const createCreditContract = useCreateCreditContract();

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      (c.address?.toLowerCase() || "").includes(q)
    );
  }, [customers, searchQuery]);

  const getSalesName = (salesId: string | null) => {
    if (!salesId) return "-";
    const agent = salesAgents.find((a) => a.id === salesId);
    return agent?.name || "-";
  };

  // form submission handled by react-hook-form onSubmit

  const onSubmit = handleSubmit(async (values) => {
    if (!values.name) return;
    try {
      const customer = await createCustomer.mutateAsync({
        name: values.name,
        phone: values.phone || null,
        address: values.address || null,
        assigned_sales_id: values.assigned_sales_id || null,
      });
      // create credit contract if product and total provided
      const totalLoan = values.total_loan_amount ? parseFloat(values.total_loan_amount) : 0;
      const tenorDays = values.tenor_days ? parseInt(values.tenor_days, 10) : 100; // default tenor
      let dailyInstallment = 0;
      if (values.daily_installment_amount) {
        dailyInstallment = parseFloat(values.daily_installment_amount);
      } else if (totalLoan > 0 && tenorDays > 0) {
        dailyInstallment = Math.round(totalLoan / tenorDays);
      }
      if (values.product_type || totalLoan > 0) {
        await createCreditContract.mutateAsync({
          contract_ref: `A${Date.now().toString().slice(-6)}`,
          customer_id: customer.id,
          sales_id: values.assigned_sales_id || customer.assigned_sales_id,
          tenor_days: tenorDays,
          start_date: new Date().toISOString().slice(0,10),
          total_loan_amount: totalLoan,
          product_type: values.product_type || 'Unknown',
          daily_installment_amount: dailyInstallment,
        });
      }
      reset();
      setIsDialogOpen(false);
    } catch (err) {
      // error toast handled in hook
    }
  });

  const handleDelete = async (customer: Customer) => {
    const ok = window.confirm(`Hapus pelanggan ${customer.name}? Tindakan ini tidak dapat dibatalkan.`);
    if (!ok) return;
    try {
      await deleteCustomer.mutateAsync(customer.id);
    } catch (err) {
      // error toast handled in hook
    }
  };

  const columns = [
    {
      key: "id",
      header: "ID",
      className: "w-24",
      render: (item: Customer) => (
        <span className="font-mono text-xs">{item.id.slice(0, 8)}</span>
      ),
    },
    {
      key: "name",
      header: "Nama Pelanggan",
      render: (item: Customer) => (
        <div>
          <p className="font-medium">{item.name}</p>
          {item.phone && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <Phone className="h-3 w-3" />
              {item.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "address",
      header: "Alamat",
      render: (item: Customer) => (
        <div className="flex items-center gap-1 text-sm">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="truncate max-w-[200px]">{item.address || "-"}</span>
        </div>
      ),
    },
    {
      key: "assigned_sales",
      header: "Sales",
      className: "w-36",
      render: (item: Customer) => (
        <div className="flex items-center gap-1.5 text-sm">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{getSalesName(item.assigned_sales_id)}</span>
        </div>
      ),
    },
    {
      key: "total_due",
      header: "Total Due",
      className: "w-32 text-right",
      render: (item: Customer) => (
        <div className="text-sm">
          {typeof (item as any).total_due === 'number' ? (
            <span className="font-medium">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format((item as any).total_due)}</span>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-20",
      render: (item: Customer) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-danger hover:text-danger"
            onClick={() => handleDelete(item)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
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
      <PageHeader title="Data Pelanggan" description="Kelola data pelanggan kredit">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Pelanggan
            </Button>
          </DialogTrigger>
          <DialogContent className="lg:max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Pelanggan Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Nama Lengkap *</Label>
                <Input
                  placeholder="Masukkan nama pelanggan"
                  {...register("name", { required: true })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nomor Telepon</Label>
                <Input
                  placeholder="08xxxxxxxxxx"
                  {...register("phone")}
                />
              </div>
              <div className="space-y-2">
                <Label>Alamat</Label>
                <Input
                  placeholder="Alamat lengkap"
                  {...register("address")}
                />
              </div>
              <div className="space-y-2">
                <Label>Sales</Label>
                <Select
                  value={formState.dirtyFields.assigned_sales_id ? undefined : undefined}
                  onValueChange={(value) => setValue("assigned_sales_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih sales" />
                  </SelectTrigger>
                  <SelectContent>
                    {salesAgents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name} ({agent.agent_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nama Product</Label>
                <Input
                  placeholder="Contoh: Elektronik / KPR"
                  {...register("product_type")}
                />
              </div>
              <div className="space-y-2">
                <Label>Jumlah Kredit (Total Loan)</Label>
                <Input
                  placeholder="Jumlah total yang harus dibayar"
                  type="number"
                  {...register("total_loan_amount")}
                />
              </div>
              <div className="space-y-2">
                <Label>Tenor (hari)</Label>
                <Input
                  placeholder="Contoh: 100"
                  type="number"
                  {...register("tenor_days")}
                />
              </div>
              <div className="space-y-2">
                <Label>Nominal Cicilan Harian (opsional)</Label>
                <Input
                  placeholder="Isi jika ingin override nominal harian"
                  type="number"
                  {...register("daily_installment_amount")}
                />
              </div>
              <Button type="submit" className="w-full" disabled={createCustomer.isLoading}>
                {createCustomer.isLoading && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Simpan Pelanggan
              </Button>
              </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, ID, atau alamat..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <DataTable columns={columns} data={filteredCustomers} />

      <div className="mt-4 text-sm text-muted-foreground">
        Menampilkan {filteredCustomers.length} dari {customers.length} pelanggan
      </div>
    </MainLayout>
  );
}
