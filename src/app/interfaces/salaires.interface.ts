export interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  dateOfBirth: string;
  hireDate: string;
  position: string;
  department: EmployeeDepartment;
  contractType: ContractType;
  baseSalary: number;
  allowances: EmployeeAllowance[];
  bankAccount: BankAccount;
  socialSecurity: SocialSecurityInfo;
  status: EmployeeStatus;
  isActive: boolean;
  address: Address;
  emergencyContact: EmergencyContact;
  totalPaid: number;
  lastPayDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeAllowance {
  id: string;
  type: AllowanceType;
  name: string;
  amount: number;
  isPercentage: boolean;
  isTaxable: boolean;
}

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  iban?: string;
  branchCode?: string;
}

export interface SocialSecurityInfo {
  cnssNumber: string;
  ipresNumber?: string;
  taxNumber: string;
}

export interface Address {
  street: string;
  city: string;
  region: string;
  postalCode?: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface PayrollPeriod {
  id: string;
  year: number;
  month: number;
  startDate: string;
  endDate: string;
  payDate: string;
  status: PayrollPeriodStatus;
  employeeCount: number;
  totalGrossSalary: number;
  totalNetSalary: number;
  totalTaxes: number;
  totalContributions: number;
  totalAllowances: number;
  isFinalized: boolean;
  paySlips: PaySlip[];
  createdAt: string;
  finalizedAt?: string;
  createdBy: string;
}

export interface PaySlip {
  id: string;
  paySlipNumber: string;
  employeeId: string;
  employeeName: string;
  payrollPeriodId: string;
  period: string;
  grossSalary: number;
  baseSalary: number;
  allowances: PaySlipAllowance[];
  deductions: PaySlipDeduction[];
  taxes: PaySlipTax[];
  contributions: PaySlipContribution[];
  netSalary: number;
  workingDays: number;
  actualWorkingDays: number;
  overtimeHours: number;
  absenceHours: number;
  status: PaySlipStatus;
  generatedAt: string;
  sentAt?: string;
  acknowledgedAt?: string;
}

export interface PaySlipAllowance {
  id: string;
  type: AllowanceType;
  name: string;
  amount: number;
  isTaxable: boolean;
}

export interface PaySlipDeduction {
  id: string;
  type: DeductionType;
  name: string;
  amount: number;
  description?: string;
}

export interface PaySlipTax {
  id: string;
  type: TaxType;
  name: string;
  rate: number;
  baseAmount: number;
  amount: number;
}

export interface PaySlipContribution {
  id: string;
  type: ContributionType;
  name: string;
  employeeRate: number;
  employerRate: number;
  baseAmount: number;
  employeeAmount: number;
  employerAmount: number;
}

export interface SalaryMetrics {
  overview: {
    totalEmployees: number;
    activeEmployees: number;
    newEmployees: number;
    employeesOnLeave: number;
    avgMonthlySalary: number;
    totalPayroll: number;
    payrollGrowth: number;
  };
  payroll: {
    currentMonth: {
      totalGross: number;
      totalNet: number;
      totalTaxes: number;
      totalContributions: number;
      totalAllowances: number;
    };
    previousMonth: {
      totalGross: number;
      totalNet: number;
      totalTaxes: number;
      totalContributions: number;
      totalAllowances: number;
    };
    yearToDate: {
      totalGross: number;
      totalNet: number;
      totalTaxes: number;
      totalContributions: number;
      totalAllowances: number;
    };
  };
  departments: DepartmentMetrics[];
  monthlyTrends: MonthlyTrend[];
  contributions: ContributionSummary[];
}

export interface DepartmentMetrics {
  department: EmployeeDepartment;
  employeeCount: number;
  totalSalary: number;
  avgSalary: number;
  percentageOfTotal: number;
}

export interface MonthlyTrend {
  month: string;
  year: number;
  totalGross: number;
  totalNet: number;
  employeeCount: number;
  avgSalary: number;
}

export interface ContributionSummary {
  type: ContributionType;
  name: string;
  totalEmployeeAmount: number;
  totalEmployerAmount: number;
  totalAmount: number;
  percentage: number;
}

export interface PayrollCalculation {
  employeeId: string;
  baseSalary: number;
  workingDays: number;
  actualWorkingDays: number;
  dailyRate: number;
  grossSalary: number;
  allowances: PaySlipAllowance[];
  totalAllowances: number;
  taxableIncome: number;
  taxes: PaySlipTax[];
  totalTaxes: number;
  contributions: PaySlipContribution[];
  totalEmployeeContributions: number;
  totalEmployerContributions: number;
  otherDeductions: PaySlipDeduction[];
  totalDeductions: number;
  netSalary: number;
}

export type EmployeeDepartment =
  | 'direction'
  | 'comptabilite'
  | 'rh'
  | 'commercial'
  | 'technique'
  | 'maintenance'
  | 'marketing'
  | 'logistique'
  | 'juridique'
  | 'formation';

export type ContractType =
  | 'cdi'
  | 'cdd'
  | 'stage'
  | 'freelance'
  | 'consultation'
  | 'apprentissage';

export type EmployeeStatus =
  | 'active'
  | 'inactive'
  | 'on_leave'
  | 'terminated'
  | 'suspended';

export type AllowanceType =
  | 'transport'
  | 'food'
  | 'housing'
  | 'phone'
  | 'family'
  | 'overtime'
  | 'bonus'
  | 'commission'
  | 'other';

export type DeductionType =
  | 'advance'
  | 'loan'
  | 'disciplinary'
  | 'absence'
  | 'other';

export type TaxType =
  | 'income_tax'
  | 'professional_tax'
  | 'other_tax';

export type ContributionType =
  | 'cnss'
  | 'ipres'
  | 'cfce'
  | 'accident_work'
  | 'family_allowance';

export type PayrollPeriodStatus =
  | 'draft'
  | 'in_progress'
  | 'calculated'
  | 'validated'
  | 'paid'
  | 'closed';

export type PaySlipStatus =
  | 'draft'
  | 'generated'
  | 'sent'
  | 'acknowledged'
  | 'disputed';