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

export const areas = [
  "Jakarta Selatan",
  "Jakarta Pusat",
  "Jakarta Timur",
  "Jakarta Barat",
  "Jakarta Utara",
];
