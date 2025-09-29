export interface JournalEntry {
  id: string;
  date: string;
  entryNumber: string;
  description: string;
  account: string;
  accountName: string;
  debit: number;
  credit: number;
  balance: number;
  reference?: string;
  thirdParty?: string;
  thirdPartyName?: string;
  journalType: JournalType;
  status: JournalEntryStatus;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AccountingMetrics {
  overview: {
    totalEntries: number;
    totalDebit: number;
    totalCredit: number;
    balance: number;
    monthlyEvolution: number;
    yearlyEvolution: number;
  };
  byJournal: {
    purchases: JournalMetrics;
    sales: JournalMetrics;
    payroll: JournalMetrics;
  };
  topAccounts: AccountSummary[];
  recentEntries: JournalEntry[];
  monthlyTrends: MonthlyTrend[];
}

export interface JournalMetrics {
  totalEntries: number;
  totalDebit: number;
  totalCredit: number;
  balance: number;
  evolution: number;
  averageEntry: number;
  topAccounts: AccountSummary[];
}

export interface AccountSummary {
  account: string;
  accountName: string;
  totalDebit: number;
  totalCredit: number;
  balance: number;
  entriesCount: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  year: number;
  purchases: number;
  sales: number;
  payroll: number;
  total: number;
}

export interface JournalFilter {
  search?: string;
  journalType?: JournalType | '';
  account?: string;
  thirdParty?: string;
  status?: JournalEntryStatus | '';
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number | null;
  amountMax?: number | null;
  period?: JournalPeriod | '';
  tags?: string[];
}

export interface ExportOptions {
  format: ExportFormat;
  includeFilters: boolean;
  includeMetrics: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
  columns?: string[];
  groupBy?: 'account' | 'month' | 'thirdParty' | 'none';
}

export interface PurchaseJournalEntry extends JournalEntry {
  journalType: JournalType.PURCHASE;
  supplierId?: string;
  supplierName?: string;
  invoiceNumber?: string;
  vatAmount?: number;
  category: PurchaseCategory;
}

export interface SalesJournalEntry extends JournalEntry {
  journalType: JournalType.SALES;
  customerId?: string;
  customerName?: string;
  invoiceNumber?: string;
  vatAmount?: number;
  category: SalesCategory;
}

export interface PayrollJournalEntry extends JournalEntry {
  journalType: JournalType.PAYROLL;
  employeeId?: string;
  employeeName?: string;
  payrollPeriod?: string;
  socialCharges?: number;
  category: PayrollCategory;
}

export enum JournalType {
  PURCHASE = 'purchase',
  SALES = 'sales',
  PAYROLL = 'payroll',
  GENERAL = 'general'
}

export enum JournalEntryStatus {
  DRAFT = 'draft',
  POSTED = 'posted',
  CANCELLED = 'cancelled',
  PENDING_VALIDATION = 'pending_validation'
}

export enum JournalPeriod {
  CURRENT_MONTH = 'current_month',
  LAST_MONTH = 'last_month',
  CURRENT_QUARTER = 'current_quarter',
  LAST_QUARTER = 'last_quarter',
  CURRENT_YEAR = 'current_year',
  LAST_YEAR = 'last_year',
  CUSTOM = 'custom'
}

export enum ExportFormat {
  EXCEL = 'excel',
  CSV = 'csv',
  PDF = 'pdf'
}

export enum PurchaseCategory {
  GOODS = 'goods',
  SERVICES = 'services',
  SUPPLIES = 'supplies',
  EQUIPMENT = 'equipment',
  OTHER = 'other'
}

export enum SalesCategory {
  PRODUCTS = 'products',
  SERVICES = 'services',
  CONSULTING = 'consulting',
  SUBSCRIPTION = 'subscription',
  OTHER = 'other'
}

export enum PayrollCategory {
  SALARY = 'salary',
  SOCIAL_CHARGES = 'social_charges',
  BENEFITS = 'benefits',
  TAXES = 'taxes',
  OTHER = 'other'
}

export enum AccountType {
  ASSET = 'asset',
  LIABILITY = 'liability',
  EQUITY = 'equity',
  REVENUE = 'revenue',
  EXPENSE = 'expense'
}

export interface ChartOfAccounts {
  account: string;
  name: string;
  type: AccountType;
  parent?: string;
  level: number;
  isActive: boolean;
  description?: string;
}

export type JournalSortField =
  | 'date'
  | 'entryNumber'
  | 'description'
  | 'account'
  | 'debit'
  | 'credit'
  | 'balance'
  | 'thirdParty'
  | 'createdAt';

export type SortDirection = 'asc' | 'desc';