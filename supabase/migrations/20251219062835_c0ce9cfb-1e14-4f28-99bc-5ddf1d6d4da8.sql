
-- Drop existing tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.coupons CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.collectors CASCADE;

-- A. Sales Agents Table
CREATE TABLE public.sales_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  agent_code TEXT NOT NULL UNIQUE,
  phone TEXT,
  area TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- B. Customers Table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  assigned_sales_id UUID REFERENCES public.sales_agents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- C. Credit Contracts Table (The Parent Transaction / "A001")
CREATE TABLE public.credit_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_ref TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  sales_id UUID NOT NULL REFERENCES public.sales_agents(id) ON DELETE RESTRICT,
  tenor_days INTEGER NOT NULL,
  start_date DATE NOT NULL,
  total_loan_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- D. Installment Coupons Table (Individual Vouchers)
CREATE TABLE public.installment_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.credit_contracts(id) ON DELETE CASCADE,
  installment_index INTEGER NOT NULL,
  due_date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid',
  paid_date DATE,
  paid_amount NUMERIC,
  collected_by UUID REFERENCES public.sales_agents(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(contract_id, installment_index)
);

-- Create View for "No. Faktur" format (100/S/DANIEL)
CREATE OR REPLACE VIEW public.invoice_details AS
SELECT 
  ic.id AS coupon_id,
  ic.contract_id,
  ic.installment_index,
  ic.due_date,
  ic.amount,
  ic.status,
  ic.paid_date,
  ic.paid_amount,
  cc.contract_ref,
  cc.tenor_days,
  cc.total_loan_amount,
  cc.start_date,
  c.id AS customer_id,
  c.name AS customer_name,
  c.address AS customer_address,
  c.phone AS customer_phone,
  sa.id AS sales_id,
  sa.name AS sales_name,
  sa.agent_code,
  -- Generated "No. Faktur" format: 100/S/DANIEL
  cc.tenor_days || '/' || sa.agent_code || '/' || UPPER(sa.name) AS no_faktur
FROM public.installment_coupons ic
JOIN public.credit_contracts cc ON ic.contract_id = cc.id
JOIN public.customers c ON cc.customer_id = c.id
JOIN public.sales_agents sa ON cc.sales_id = sa.id;

-- Enable RLS on all tables
ALTER TABLE public.sales_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installment_coupons ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all for prototyping)
CREATE POLICY "Allow all access to sales_agents" ON public.sales_agents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to credit_contracts" ON public.credit_contracts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to installment_coupons" ON public.installment_coupons FOR ALL USING (true) WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_sales_agents_updated_at BEFORE UPDATE ON public.sales_agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_credit_contracts_updated_at BEFORE UPDATE ON public.credit_contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_installment_coupons_updated_at BEFORE UPDATE ON public.installment_coupons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
