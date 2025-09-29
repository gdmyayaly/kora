// Base interface for all enum responses
export interface BaseEnumResponse<T> {
  code: number;
  data: T;
  error: null | string;
  message: string;
  success: boolean;
}

// Individual enum item interfaces
export interface BillingCycle {
  description: string;
  label: string;
  value: string;
}

export interface Country {
  code: string;
  label: string;
  region: string;
  value: string;
}

export interface Currency {
  description: string;
  label: string;
  symbol: string;
  value: string;
}

export interface DocumentType {
  description: string;
  label: string;
  value: string;
}

export interface LegalForm {
  description: string;
  label: string;
  value: string;
}

export interface PackageType {
  description: string;
  label: string;
  value: string;
}

export interface PaymentMethod {
  description: string;
  label: string;
  value: string;
}

export interface PaymentStatus {
  description: string;
  label: string;
  value: string;
}

export interface SubscriptionStatus {
  description: string;
  label: string;
  value: string;
}

export interface Timezone {
  description: string;
  label: string;
  value: string;
}

export interface UserRole {
  description: string;
  hierarchy: number;
  label: string;
  value: string;
}

// Global enums data structure
export interface GlobalEnumsData {
  billing_cycles: BillingCycle[];
  countries: Country[];
  currencies: Currency[];
  document_types: DocumentType[];
  legal_forms: LegalForm[];
  package_types: PackageType[];
  payment_methods: PaymentMethod[];
  payment_statuses: PaymentStatus[];
  subscription_statuses: SubscriptionStatus[];
  timezones: Timezone[];
  user_roles: UserRole[];
}

// Specific response types
export interface GlobalEnumsResponse extends BaseEnumResponse<GlobalEnumsData> {}
export interface CountriesResponse extends BaseEnumResponse<Country[]> {}
export interface CurrenciesResponse extends BaseEnumResponse<Currency[]> {}
export interface LegalFormsResponse extends BaseEnumResponse<LegalForm[]> {}
export interface PaymentStatusesResponse extends BaseEnumResponse<PaymentStatus[]> {}
export interface UserRolesResponse extends BaseEnumResponse<UserRole[]> {}

// Error response interface
export interface EnumsErrorResponse {
  error: string;
  message: string;
  success: boolean;
}

// Utility types for filtering and searching
export interface EnumFilterOptions {
  region?: string;
  hierarchy?: number;
  value?: string;
  label?: string;
}

// Cache interface for storing enums data
export interface EnumsCache {
  globalEnums: GlobalEnumsData | null;
  countries: Country[] | null;
  currencies: Currency[] | null;
  legalForms: LegalForm[] | null;
  paymentStatuses: PaymentStatus[] | null;
  userRoles: UserRole[] | null;
  lastUpdated: Date | null;
}