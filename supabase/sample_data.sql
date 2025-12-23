-- Drop tables if they exist
DROP TABLE IF EXISTS public.installment_coupons CASCADE;
DROP TABLE IF EXISTS public.credit_contracts CASCADE;
DROP TABLE IF EXISTS public.sales_agents CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.coupons CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.collectors CASCADE;
DROP TABLE IF EXISTS public.invoice_details CASCADE;

-- Create table collectors
CREATE TABLE public.collectors (
  id SERIAL PRIMARY KEY,
  collector_code VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  assigned_area VARCHAR(100) NOT NULL,
  total_collected NUMERIC NOT NULL,
  active_customers INT NOT NULL
);

-- Create table customers
CREATE TABLE public.customers (
  id SERIAL PRIMARY KEY,
  customer_code VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(200) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  collector_id INT REFERENCES public.collectors(id),
  area VARCHAR(100) NOT NULL,
  credit_score VARCHAR(50) NOT NULL
);

-- Create table coupons
CREATE TABLE public.coupons (
  id SERIAL PRIMARY KEY,
  coupon_code VARCHAR(50) NOT NULL,
  customer_id INT REFERENCES public.customers(id),
  amount NUMERIC NOT NULL,
  product_category VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  expiry_date DATE NOT NULL,
  is_paid BOOLEAN NOT NULL
);

-- Create table payments
CREATE TABLE public.payments (
  id SERIAL PRIMARY KEY,
  coupon_id INT REFERENCES public.coupons(id),
  customer_id INT REFERENCES public.customers(id),
  collector_id INT REFERENCES public.collectors(id),
  amount_due NUMERIC NOT NULL,
  amount_paid NUMERIC NOT NULL,
  status VARCHAR(50) NOT NULL
);

-- Create table sales_agents
CREATE TABLE public.sales_agents (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  agent_code VARCHAR(50) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  area VARCHAR(100) NOT NULL
);

-- Create table credit_contracts
CREATE TABLE public.credit_contracts (
  id SERIAL PRIMARY KEY,
  contract_ref VARCHAR(50) NOT NULL,
  customer_id INT REFERENCES public.customers(id),
  sales_id INT REFERENCES public.sales_agents(id),
  tenor_days INT NOT NULL,
  start_date DATE NOT NULL,
  total_loan_amount NUMERIC NOT NULL,
  status VARCHAR(50) NOT NULL,
  coupon_code VARCHAR(50) NOT NULL
);

-- Create table installment_coupons
CREATE TABLE public.installment_coupons (
  id SERIAL PRIMARY KEY,
  contract_id INT REFERENCES public.credit_contracts(id),
  installment_index INT NOT NULL,
  due_date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  coupon_code VARCHAR(50) NOT NULL
);

-- Create table invoice_details
CREATE TABLE public.invoice_details (
  id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(50) NOT NULL,
  customer_id INT REFERENCES public.customers(id),
  due_date DATE NOT NULL,
  amount_due NUMERIC NOT NULL,
  status VARCHAR(50) NOT NULL
);

-- Insert sample data into collectors table
INSERT INTO public.collectors (collector_code, name, phone, assigned_area, total_collected, active_customers)
VALUES
  ('COL001', 'John Doe', '1234567890', 'Area 1', 1000, 10),
  ('COL002', 'Jane Smith', '0987654321', 'Area 2', 2000, 20);

-- Insert sample data into customers table
INSERT INTO public.customers (customer_code, name, address, phone, collector_id, area, credit_score)
VALUES
  ('CUST001', 'Alice Brown', '123 Main St', '1112223333', (SELECT id FROM public.collectors WHERE collector_code = 'COL001'), 'Area 1', 'Good'),
  ('CUST002', 'Bob White', '456 Elm St', '4445556666', (SELECT id FROM public.collectors WHERE collector_code = 'COL002'), 'Area 2', 'Bad');

-- Insert sample data into coupons table
INSERT INTO public.coupons (coupon_code, customer_id, amount, product_category, status, expiry_date, is_paid)
VALUES
  ('COUP001', (SELECT id FROM public.customers WHERE customer_code = 'CUST001'), 50, 'Electronics', 'Active', '2025-12-31', false),
  ('COUP002', (SELECT id FROM public.customers WHERE customer_code = 'CUST002'), 100, 'Groceries', 'Redeemed', '2025-12-15', true);

-- Insert sample data into payments table
INSERT INTO public.payments (coupon_id, customer_id, collector_id, amount_due, amount_paid, status)
VALUES
  ((SELECT id FROM public.coupons WHERE coupon_code = 'COUP001'), (SELECT id FROM public.customers WHERE customer_code = 'CUST001'), (SELECT id FROM public.collectors WHERE collector_code = 'COL001'), 50, 0, 'Unpaid'),
  ((SELECT id FROM public.coupons WHERE coupon_code = 'COUP002'), (SELECT id FROM public.customers WHERE customer_code = 'CUST002'), (SELECT id FROM public.collectors WHERE collector_code = 'COL002'), 100, 100, 'Paid');

-- Insert sample data into sales_agents table
INSERT INTO public.sales_agents (name, agent_code, phone, area)
VALUES
  ('Agent A', 'AG001', '7778889999', 'Area 1'),
  ('Agent B', 'AG002', '6665554444', 'Area 2');

-- Insert sample data into credit_contracts table with coupon_code
INSERT INTO public.credit_contracts (contract_ref, customer_id, sales_id, tenor_days, start_date, total_loan_amount, status, coupon_code)
VALUES
  ('CON001', (SELECT id FROM public.customers WHERE customer_code = 'CUST001'), (SELECT id FROM public.sales_agents WHERE agent_code = 'AG001'), 30, '2025-12-01', 1000, 'active', '30/AG001/Agent A'),
  ('CON002', (SELECT id FROM public.customers WHERE customer_code = 'CUST002'), (SELECT id FROM public.sales_agents WHERE agent_code = 'AG002'), 60, '2025-12-10', 2000, 'active', '60/AG002/Agent B');

-- Insert sample data into installment_coupons table with coupon_code
INSERT INTO public.installment_coupons (contract_id, installment_index, due_date, amount, coupon_code)
VALUES
  ((SELECT id FROM public.credit_contracts WHERE contract_ref = 'CON001'), 1, '2025-12-15', 500, '30/AG001/Agent A'),
  ((SELECT id FROM public.credit_contracts WHERE contract_ref = 'CON002'), 1, '2025-12-20', 1000, '60/AG002/Agent B');

-- Insert sample data into invoice_details table
INSERT INTO public.invoice_details (invoice_number, customer_id, due_date, amount_due, status)
VALUES
  ('INV001', (SELECT id FROM public.customers WHERE customer_code = 'CUST001'), '2025-12-15', 500, 'Pending'),
  ('INV002', (SELECT id FROM public.customers WHERE customer_code = 'CUST002'), '2025-12-20', 1000, 'Paid');