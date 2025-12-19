import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface InvoiceDetail {
  coupon_id: string;
  contract_id: string;
  installment_index: number;
  due_date: string;
  amount: number;
  status: string;
  paid_date: string | null;
  paid_amount: number | null;
  contract_ref: string;
  tenor_days: number;
  total_loan_amount: number;
  start_date: string;
  customer_id: string;
  customer_name: string;
  customer_address: string | null;
  customer_phone: string | null;
  sales_id: string;
  sales_name: string;
  agent_code: string;
  no_faktur: string;
}

export function useInvoiceDetails() {
  return useQuery({
    queryKey: ["invoice_details"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoice_details")
        .select("*")
        .order("due_date", { ascending: true });
      
      if (error) throw error;
      return data as InvoiceDetail[];
    },
  });
}

export function useUpdateCouponPayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      coupon_id, 
      paid_amount, 
      paid_date, 
      status 
    }: { 
      coupon_id: string; 
      paid_amount: number; 
      paid_date: string | null; 
      status: string;
    }) => {
      const { data, error } = await supabase
        .from("installment_coupons")
        .update({ paid_amount, paid_date, status })
        .eq("id", coupon_id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice_details"] });
      queryClient.invalidateQueries({ queryKey: ["installment_coupons"] });
      toast.success("Pembayaran berhasil disimpan");
    },
    onError: (error) => {
      toast.error("Gagal menyimpan pembayaran: " + error.message);
    },
  });
}
