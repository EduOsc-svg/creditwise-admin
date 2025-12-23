-- Drop existing tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS public.installment_coupons CASCADE;
DROP TABLE IF EXISTS public.payment_logs CASCADE;
DROP TABLE IF EXISTS public.credit_contracts CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.routes CASCADE;
DROP TABLE IF EXISTS public.sales_agents CASCADE;

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

-- B. Routes (Areas)
CREATE TABLE public.routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  default_collector_id UUID REFERENCES public.sales_agents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- C. Customers Table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  assigned_sales_id UUID REFERENCES public.sales_agents(id) ON DELETE SET NULL,
  route_id UUID REFERENCES public.routes(id) ON DELETE SET NULL,
  total_due NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- D. Credit Contracts Table (The Parent Transaction / "A001")
CREATE TABLE public.credit_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_ref TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  sales_id UUID NOT NULL REFERENCES public.sales_agents(id) ON DELETE RESTRICT,
  tenor_days INTEGER NOT NULL,
  start_date DATE NOT NULL,
  total_loan_amount NUMERIC NOT NULL,
  product_type TEXT NOT NULL,
  daily_installment_amount NUMERIC NOT NULL,
  current_installment_index INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- E. Installment Coupons Table (Individual Vouchers)
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

-- F. Payment Logs Table
CREATE TABLE public.payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.credit_contracts(id) ON DELETE CASCADE,
  sales_id UUID NOT NULL REFERENCES public.sales_agents(id) ON DELETE SET NULL,
  payment_date DATE NOT NULL,
  installment_index INTEGER NOT NULL,
  amount_paid NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
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

-- Enable RLS on all tables (prototype: allow all)
ALTER TABLE public.sales_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installment_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all access for prototyping)
CREATE POLICY "Allow all access to sales_agents" ON public.sales_agents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to routes" ON public.routes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to credit_contracts" ON public.credit_contracts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to installment_coupons" ON public.installment_coupons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to payment_logs" ON public.payment_logs FOR ALL USING (true) WITH CHECK (true);

-- Triggers for updated_at (assumes public.update_updated_at_column() exists)
CREATE TRIGGER update_sales_agents_updated_at BEFORE UPDATE ON public.sales_agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON public.routes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_credit_contracts_updated_at BEFORE UPDATE ON public.credit_contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_installment_coupons_updated_at BEFORE UPDATE ON public.installment_coupons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payment_logs_updated_at BEFORE UPDATE ON public.payment_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get next coupon (returns current_installment_index + 1)
CREATE OR REPLACE FUNCTION public.get_next_coupon(contract_id UUID)
RETURNS INTEGER AS $$
DECLARE
  next_index INTEGER := 1;
BEGIN
  SELECT COALESCE(current_installment_index,0) + 1 INTO next_index
  FROM public.credit_contracts
  WHERE id = contract_id;

  RETURN next_index;
END;
$$ LANGUAGE plpgsql STABLE;

-- Trigger to increment current_installment_index on payment_logs insert
-- This enforces the "non-incrementing by date" rule: only successful payments increment the counter.
CREATE OR REPLACE FUNCTION public.increment_installment_index()
RETURNS TRIGGER AS $$
BEGIN
  -- Atomically increment current_installment_index by 1 (but never exceed tenor_days)
  UPDATE public.credit_contracts
  SET current_installment_index = LEAST(current_installment_index + 1, tenor_days)
  WHERE id = NEW.contract_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_installment_index_trigger
AFTER INSERT ON public.payment_logs
FOR EACH ROW EXECUTE FUNCTION public.increment_installment_index();

-- Sample Data: route, sales, customer, contract, coupons
INSERT INTO public.sales_agents (name, agent_code, phone, area) VALUES ('Daniel', 'S', '081234567890', 'Balikpapan');
INSERT INTO public.routes (code, name, default_collector_id) VALUES ('R001', 'Balikpapan Tengah', (SELECT id FROM public.sales_agents WHERE agent_code = 'S'));
INSERT INTO public.customers (name, address, phone, assigned_sales_id, route_id) VALUES ('M, ADI/TK, DEWI', 'JL. S. PARMAN', '081345678901', (SELECT id FROM public.sales_agents WHERE agent_code = 'S'), (SELECT id FROM public.routes WHERE code = 'R001'));
INSERT INTO public.credit_contracts (contract_ref, customer_id, sales_id, tenor_days, start_date, total_loan_amount, product_type, daily_installment_amount) VALUES ('A001', (SELECT id FROM public.customers WHERE name = 'M, ADI/TK, DEWI'), (SELECT id FROM public.sales_agents WHERE agent_code = 'S'), 100, '2025-12-01', 6000000, 'Electronics', 60000);
INSERT INTO public.installment_coupons (contract_id, installment_index, due_date, amount) VALUES 
  ((SELECT id FROM public.credit_contracts WHERE contract_ref = 'A001'), 28, '2025-12-13', 60000),
  ((SELECT id FROM public.credit_contracts WHERE contract_ref = 'A001'), 29, '2025-12-14', 60000),
  ((SELECT id FROM public.credit_contracts WHERE contract_ref = 'A001'), 30, '2025-12-15', 60000);

-- Example: record a payment (this will increment current_installment_index by 1)
-- INSERT INTO public.payment_logs (contract_id, sales_id, payment_date, installment_index, amount_paid) 
-- VALUES ((SELECT id FROM public.credit_contracts WHERE contract_ref = 'A001'), (SELECT id FROM public.sales_agents WHERE agent_code = 'S'), '2025-12-13', (SELECT public.get_next_coupon((SELECT id FROM public.credit_contracts WHERE contract_ref = 'A001'))), 60000);
