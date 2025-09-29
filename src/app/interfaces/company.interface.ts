export interface Company {
  company_id: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  currency: string;
  legal_form: string;
  fiscal_number: string;
  role: string;
  workspace_id: string;
  owner_id?: string;
  permissions?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyRequest {
  name: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  currency: string;
  legal_form: string;
  fiscal_number: string;
  workspace_id: string;
}

export interface CompanyListResponse {
  code: number;
  data?: Company[];
  error: null;
  message: string;
  success: boolean;
}

export interface CreateCompanyResponse {
  data: {
    company_id: string;
    created_at: string;
    name: string;
  };
  message: string;
  success: boolean;
}

export interface CompanyErrorResponse {
  error: string;
  message: string;
  success: boolean;
}

export interface CompanyFormData {
  name: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  currency: string;
  legal_form: string;
  fiscal_number: string;
}

export interface CompanyDetailResponse {
  code: number;
  data: Company;
  error: null;
  message: string;
  success: boolean;
}

export interface UpdateCompanyRequest {
  name: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  currency: string;
  legal_form: string;
  fiscal_number: string;
}

export interface UpdateCompanyResponse {
  code: number;
  data: Company;
  error: null;
  message: string;
  success: boolean;
}

export interface DeleteCompanyResponse {
  code: number;
  data: null;
  error: null;
  message: string;
  success: boolean;
}