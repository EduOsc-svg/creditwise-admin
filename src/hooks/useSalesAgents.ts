import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SalesAgent {
  id: string;
  name: string;
  agent_code: string;
  phone: string | null;
  area: string | null;
  created_at: string;
  updated_at: string;
}

export function useSalesAgents() {
  return useQuery({
    queryKey: ["sales_agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_agents")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as SalesAgent[];
    },
  });
}

export function useCreateSalesAgent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (agent: Omit<SalesAgent, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("sales_agents")
        .insert(agent)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales_agents"] });
      toast.success("Sales agent berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error("Gagal menambahkan sales agent: " + error.message);
    },
  });
}

export function useUpdateSalesAgent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...agent }: Partial<SalesAgent> & { id: string }) => {
      const { data, error } = await supabase
        .from("sales_agents")
        .update(agent)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales_agents"] });
      toast.success("Sales agent berhasil diperbarui");
    },
    onError: (error) => {
      toast.error("Gagal memperbarui sales agent: " + error.message);
    },
  });
}

export function useDeleteSalesAgent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("sales_agents")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales_agents"] });
      toast.success("Sales agent berhasil dihapus");
    },
    onError: (error) => {
      toast.error("Gagal menghapus sales agent: " + error.message);
    },
  });
}
