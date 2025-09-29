export interface Customer {
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
  status: 'active' | 'inactive' | 'prospect';
  registrationNumber?: string;
  taxNumber?: string;
  customerType: 'individual' | 'company' | 'government' | 'ngo';
  paymentTerms: number;
  creditLimit: number;
  totalSales: number;
  lastSale?: string;
  category: 'retail' | 'wholesale' | 'enterprise' | 'government';
  assignedSalesperson?: string;
  notes?: string;
  createdAt: string;
}

export interface Article {
  id: string;
  name: string;
  description: string;
  sku: string;
  barcode?: string;
  category: 'product' | 'service';
  subcategory: string;
  unitPrice: number;
  costPrice: number;
  taxRate: number;
  unit: 'piece' | 'kg' | 'liter' | 'meter' | 'hour' | 'day' | 'month';
  stock: {
    available: number;
    reserved: number;
    minThreshold: number;
    maxThreshold: number;
  };
  isActive: boolean;
  supplier?: string;
  brand?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  images: string[];
  totalSold: number;
  lastSold?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  currency: 'XOF' | 'EUR' | 'USD';
  paymentMethod?: 'cash' | 'check' | 'transfer' | 'card' | 'mobile';
  paymentStatus: 'pending' | 'paid' | 'partial' | 'failed';
  description?: string;
  items: SalesInvoiceItem[];
  payments: Payment[];
  attachments?: string[];
  salesRep?: string;
  notes?: string;
  terms?: string;
  createdAt: string;
  sentAt?: string;
  viewedAt?: string;
  paidAt?: string;
}

export interface SalesInvoiceItem {
  id: string;
  articleId: string;
  articleName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountRate: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  totalPrice: number;
  unit: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'check' | 'transfer' | 'card' | 'mobile';
  reference?: string;
  notes?: string;
  createdAt: string;
}

export interface VentesMetrics {
  customers: {
    total: number;
    active: number;
    prospects: number;
    newThisMonth: number;
    topCustomers: { customer: string; amount: number }[];
  };
  sales: {
    totalRevenue: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    averageOrderValue: number;
    totalInvoices: number;
    paidInvoices: number;
    pendingInvoices: number;
    overdueInvoices: number;
    monthlyTrend: { month: string; revenue: number; invoices: number }[];
    revenueByCategory: { category: string; amount: number }[];
    topProducts: { product: string; quantity: number; revenue: number }[];
  };
  articles: {
    totalProducts: number;
    activeProducts: number;
    lowStockItems: number;
    outOfStockItems: number;
    totalValue: number;
    topSellingProducts: { product: string; quantity: number }[];
    categoryDistribution: { category: string; count: number }[];
  };
  performance: {
    conversionRate: number;
    averageDaysToPayment: number;
    customerRetentionRate: number;
    salesGrowthRate: number;
    profitMargin: number;
  };
}

export interface QuotationRequest {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  company?: string;
  subject: string;
  description: string;
  items: QuotationItem[];
  status: 'pending' | 'quoted' | 'accepted' | 'rejected' | 'expired';
  priority: 'low' | 'medium' | 'high';
  validUntil: string;
  totalAmount?: number;
  assignedTo?: string;
  notes?: string;
  createdAt: string;
  quotedAt?: string;
  respondedAt?: string;
}

export interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  estimatedPrice?: number;
  notes?: string;
}

export interface SalesTarget {
  id: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  year: number;
  month?: number;
  quarter?: number;
  targetRevenue: number;
  actualRevenue: number;
  targetInvoices: number;
  actualInvoices: number;
  salesRep?: string;
  category?: string;
  progress: number;
  status: 'on-track' | 'behind' | 'exceeded' | 'at-risk';
  createdAt: string;
  updatedAt: string;
}