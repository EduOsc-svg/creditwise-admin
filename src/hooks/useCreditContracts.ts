import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CreditContract {
  id: string;
  contract_ref: string;
  customer_id: string;
  sales_id: string;
  start_date: string;
  tenor_days: number;
  total_loan_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useCreditContracts() {
  return useQuery({
    queryKey: ["credit_contracts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("credit_contracts")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as CreditContract[];
    },
  });
}

export function useCreateCreditContract() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (contract: Omit<CreditContract, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("credit_contracts")
        .insert(contract)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit_contracts"] });
      toast.success("Kontrak kredit berhasil dibuat");
    },
    onError: (error) => {
      toast.error("Gagal membuat kontrak kredit: " + error.message);
    },
  });
}
