export interface Collector {
  id: string;
  name: string;
  phone: string;
  assignedArea: string;
  totalCollected: number;
  activeCustomers: number;
}

export const collectors: Collector[] = [
  {
    id: "COL-001",
    name: "Budi Setiawan",
    phone: "081111222333",
    assignedArea: "Jakarta Selatan",
    totalCollected: 5500000,
    activeCustomers: 12,
  },
  {
    id: "COL-002",
    name: "Agus Prayitno",
    phone: "082222333444",
    assignedArea: "Jakarta Pusat",
    totalCollected: 3200000,
    activeCustomers: 8,
  },
  {
    id: "COL-003",
    name: "Dedi Kurniawan",
    phone: "083333444555",
    assignedArea: "Jakarta Timur",
    totalCollected: 4100000,
    activeCustomers: 10,
  },
  {
    id: "COL-004",
    name: "Eko Prasetyo",
    phone: "084444555666",
    assignedArea: "Jakarta Barat",
    totalCollected: 2800000,
    activeCustomers: 7,
  },
  {
    id: "COL-005",
    name: "Fajar Nugroho",
    phone: "085555666777",
    assignedArea: "Jakarta Utara",
    totalCollected: 3900000,
    activeCustomers: 9,
  },
];

export interface Customer {
  id: string;
  name: string;
  address: string;
  phone: string;
  collectorId: string;
  area: string;
  creditScore: string;
}

export const customers: Customer[] = [
  {
    id: "CUST-001",
    name: "Alice Brown",
    address: "123 Main St",
    phone: "081234567890",
    collectorId: "COL-001",
    area: "Jakarta Selatan",
    creditScore: "Good",
  },
  {
    id: "CUST-002",
    name: "Bob White",
    address: "456 Elm St",
    phone: "082345678901",
    collectorId: "COL-002",
    area: "Jakarta Pusat",
    creditScore: "Bad",
  },
];

export interface Coupon {
  id: string;
  couponCode: string;
  customerId: string;
  amount: number;
  productCategory: string;
  status: string;
  expiryDate: string;
  isPaid: boolean;
}

export const coupons: Coupon[] = [
  {
    id: "COUP-001",
    couponCode: "COUP001",
    customerId: "CUST-001",
    amount: 50000,
    productCategory: "Electronics",
    status: "Active",
    expiryDate: "2025-12-31",
    isPaid: false,
  },
  {
    id: "COUP-002",
    couponCode: "COUP002",
    customerId: "CUST-002",
    amount: 100000,
    productCategory: "Groceries",
    status: "Redeemed",
    expiryDate: "2025-12-15",
    isPaid: true,
  },
];

export interface Payment {
  id: string;
  couponId: string;
  customerId: string;
  collectorId: string;
  amountDue: number;
  amountPaid: number;
  status: string;
}

export const payments: Payment[] = [
  {
    id: "PAY-001",
    couponId: "COUP-001",
    customerId: "CUST-001",
    collectorId: "COL-001",
    amountDue: 50000,
    amountPaid: 0,
    status: "Unpaid",
  },
  {
    id: "PAY-002",
    couponId: "COUP-002",
    customerId: "CUST-002",
    collectorId: "COL-002",
    amountDue: 100000,
    amountPaid: 100000,
    status: "Paid",
  },
];

export interface SalesAgent {
  id: string;
  name: string;
  agentCode: string;
  phone: string;
  area: string;
}

export const salesAgents: SalesAgent[] = [
  {
    id: "AG-001",
    name: "Agent A",
    agentCode: "AG001",
    phone: "081111222333",
    area: "Jakarta Selatan",
  },
  {
    id: "AG-002",
    name: "Agent B",
    agentCode: "AG002",
    phone: "082222333444",
    area: "Jakarta Pusat",
  },
];

export interface CreditContract {
  id: string;
  contractRef: string;
  customerId: string;
  salesId: string;
  tenorDays: number;
  startDate: string;
  totalLoanAmount: number;
  status: string;
  couponCode: string;
}

export const creditContracts: CreditContract[] = [
  {
    id: "CON-001",
    contractRef: "CON001",
    customerId: "CUST-001",
    salesId: "AG-001",
    tenorDays: 30,
    startDate: "2025-12-01",
    totalLoanAmount: 1000000,
    status: "Active",
    couponCode: "30/AG001/Agent A",
  },
  {
    id: "CON-002",
    contractRef: "CON002",
    customerId: "CUST-002",
    salesId: "AG-002",
    tenorDays: 60,
    startDate: "2025-12-10",
    totalLoanAmount: 2000000,
    status: "Active",
    couponCode: "60/AG002/Agent B",
  },
];

export interface InstallmentCoupon {
  id: string;
  contractId: string;
  installmentIndex: number;
  dueDate: string;
  amount: number;
  couponCode: string;
}

export const installmentCoupons: InstallmentCoupon[] = [
  {
    id: "INST-001",
    contractId: "CON-001",
    installmentIndex: 1,
    dueDate: "2025-12-15",
    amount: 500000,
    couponCode: "30/AG001/Agent A",
  },
  {
    id: "INST-002",
    contractId: "CON-002",
    installmentIndex: 1,
    dueDate: "2025-12-20",
    amount: 1000000,
    couponCode: "60/AG002/Agent B",
  },
];

export interface InvoiceDetail {
  id: string;
  invoiceNumber: string;
  customerId: string;
  dueDate: string;
  amountDue: number;
  status: string;
}

export const invoiceDetails: InvoiceDetail[] = [
  {
    id: "INV-001",
    invoiceNumber: "INV001",
    customerId: "CUST-001",
    dueDate: "2025-12-15",
    amountDue: 500000,
    status: "Pending",
  },
  {
    id: "INV-002",
    invoiceNumber: "INV002",
    customerId: "CUST-002",
    dueDate: "2025-12-20",
    amountDue: 1000000,
    status: "Paid",
  },
];