
-- Fix: Change view to use SECURITY INVOKER (default, but explicit)
DROP VIEW IF EXISTS public.invoice_details;

CREATE VIEW public.invoice_details 
WITH (security_invoker = true) AS
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
  cc.tenor_days || '/' || sa.agent_code || '/' || UPPER(sa.name) AS no_faktur
FROM public.installment_coupons ic
JOIN public.credit_contracts cc ON ic.contract_id = cc.id
JOIN public.customers c ON cc.customer_id = c.id
JOIN public.sales_agents sa ON cc.sales_id = sa.id;
