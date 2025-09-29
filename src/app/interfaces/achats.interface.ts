export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  status: 'active' | 'inactive' | 'pending';
  registrationNumber: string;
  taxNumber: string;
  totalInvoiced: number;
  lastInvoice?: string;
  paymentTerms: number;
  category: 'materials' | 'services' | 'equipment' | 'other';
  createdAt: string;
}

export interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  status: 'draft' | 'pending' | 'approved' | 'paid' | 'overdue' | 'cancelled';
  currency: 'XOF' | 'EUR' | 'USD';
  paymentMethod?: 'cash' | 'check' | 'transfer' | 'card';
  description: string;
  items: PurchaseInvoiceItem[];
  attachments?: string[];
  approvedBy?: string;
  paidAt?: string;
  createdAt: string;
}

export interface PurchaseInvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  totalPrice: number;
}

export interface ExpenseNote {
  id: string;
  noteNumber: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  title: string;
  description: string;
  totalAmount: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
  category: 'transport' | 'accommodation' | 'meals' | 'supplies' | 'travel' | 'other';
  submittedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  expenses: ExpenseItem[];
  attachments: string[];
  createdAt: string;
}

export interface ExpenseItem {
  id: string;
  description: string;
  amount: number;
  category: 'transport' | 'accommodation' | 'meals' | 'supplies' | 'travel' | 'other';
  date: string;
  receipt?: string;
  notes?: string;
}

export interface AchatsMetrics {
  suppliers: {
    total: number;
    active: number;
    newThisMonth: number;
    pending: number;
    byCountry: { country: string; count: number }[];
    byCategory: { category: string; count: number }[];
    monthlyGrowth: { month: string; count: number }[];
    averagePaymentTerms: number;
    totalInvoiced: number;
  };
  invoices: {
    totalAmount: number;
    pending: number;
    approved: number;
    paid: number;
    overdue: number;
    draft: number;
    monthlyTrend: { month: string; amount: number }[];
    bySupplier: { supplier: string; amount: number }[];
    byStatus: { status: string; count: number; amount: number }[];
    averageAmount: number;
    currency: { currency: string; amount: number }[];
  };
  expenses: {
    totalPending: number;
    approvedThisMonth: number;
    totalByCategory: { category: string; amount: number }[];
    byEmployee: { employee: string; amount: number }[];
    byStatus: { status: string; count: number; amount: number }[];
    monthlyTrend: { month: string; amount: number }[];
    averageProcessingTime: number;
    rejectionRate: number;
  };
}

export interface ChartData {
  suppliers: {
    countryDistribution: { labels: string[]; data: number[] };
    categoryDistribution: { labels: string[]; data: number[] };
    monthlyGrowth: { labels: string[]; data: number[] };
  };
  invoices: {
    supplierAmounts: { labels: string[]; data: number[] };
    monthlyTrend: { labels: string[]; data: number[] };
    statusDistribution: { labels: string[]; data: number[] };
  };
  expenses: {
    employeeSpending: { labels: string[]; data: number[] };
    categoryDistribution: { labels: string[]; data: number[] };
    monthlyTrend: { labels: string[]; data: number[] };
  };
}