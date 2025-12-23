# PROJECT CONTEXT: Back-Office Credit Management System (Admin-Only)

## 1. Project Overview
This is a single-sided Admin Dashboard for a manual credit/installment business.
- **Users:** Only the Admin logs in.
- **Customers & Collectors:** They operate manually offline; the Admin digitizes their activities here.
- **Core Value:** Tracking loan origination, generating physical coupon data, and recording daily payments.

## 2. Core Business Entities & Relationships

### A. Sales Agents (Collectors)
- Represents the field staff collecting money.
- **Fields:** `id`, `name`, `agent_code` (e.g., "S"), `area`.
- **Constraint:** `agent_code` must be unique.

### B. Routes (Jalur/Areas)
- Represents a geographic cluster of customers for efficient collection.
- **Fields:** `id`, `code` (e.g., "S03"), `name`, `default_collector_id`.
- **Relationship:** A Route has many Customers.

### C. Customers (Borrowers)
- **Fields:** `id`, `name`, `address`, `phone`.
- **Relationships:**
  - `assigned_sales_id` (FK): The Collector responsible for this person.
  - `route_id` (FK): The geographic area they live in.

### D. Credit Contracts (The Loan)
- Represents the master agreement for a specific item purchased on credit.
- **Fields:**
  - `contract_ref` (e.g., "A001").
  - `total_loan_amount` (Total debt to be paid).
  - `product_type` (e.g., "Electronics", "Cash").
  - `daily_installment_amount` (e.g., 5000).
  - `tenor_days` (Target days, e.g., 100).
  - `current_installment_index` (Integer, Default: 0): **CRITICAL**. Tracks how many coupons have been paid so far.

### E. Payment Logs (Transactions)
- Records the actual money coming in.
- **Fields:** `payment_date`, `amount_paid`, `installment_index_snapshot` (which coupon number was this?), `notes`.

---

## 3. KEY BUSINESS LOGIC (Strict Implementation Rules)

### Rule #1: The "Non-Incrementing" Coupon Logic
In this system, Coupon Numbers are **NOT** tied to calendar dates. They are tied to **Payment Success**.
- **Logic:** The "Next Coupon" is always (`current_installment_index` + 1).
- **Scenario:**
  - Day 1: Customer pays. System records **Coupon #1**. (Index becomes 1).
  - Day 2: Customer skips/unpaid. (Index stays 1).
  - Day 3: Customer skips/unpaid. (Index stays 1).
  - Day 4: Customer pays. System records **Coupon #2**. (Index becomes 2).
- **Visual:** The UI must display "Next Payment: Coupon #X" based on this counter, regardless of the current date.

### Rule #2: Loan Origination Data
When creating a new Customer/Loan, the Admin must input:
1.  **Customer Data:** Name, Address, Route (Dropdown), Collector (Dropdown).
2.  **Loan Data:** Product Type, Total Loan Amount, Daily Installment Nominal.
3.  **Output:** The system initializes the `current_installment_index` to 0.

### Rule #3: Payment Input (Reconciliation)
When the Admin inputs a payment from a Collector:
1.  **Select Customer/Contract.**
2.  **Date Picker:** Admin MUST select the actual date the money was collected (to track gaps/missed days).
3.  **Amount:** Input the money received.
4.  **System Action:**
    - Insert row into `payment_logs`.
    - Update `credit_contracts.current_installment_index` by +1.

### Rule #4: The "Faktur" String Format
For physical printing purposes, we use a specific string format: `TENOR/AGENT_CODE/AGENT_NAME`.
- Example: **"100/S/DANIEL"**
- Logic:
  - `100`: From `credit_contracts.tenor_days`.
  - `S`: From `sales_agents.agent_code`.
  - `DANIEL`: From `sales_agents.name`.

---

## 4. UI/UX Guidelines
- **Dashboard:** High-density data tables.
- **Input Forms:** Use "React Hook Form". Fields for Relational Data (Collector/Route) must be **Dropdowns** fetching from Supabase, not text inputs.
- **Manifest Generation:** Allow filtering by `Route` or `Collector` to print daily tasks.

## 5. Tech Stack Constraints
- **Frontend:** React, Tailwind CSS, Lucide Icons.
- **Backend:** Supabase (PostgreSQL).
- **Authentication:** None (Anonymous/Public access with RLS disabled for this Prototype phase).