export interface AuthResponse {
  code: number;
  data: {
    access_token: string;
    email: string;
    email_confirmed_at: string;
    expires_at: number;
    id: string;
    last_sign_in_at: string;
    refresh_token: string;
    user_metadata: UserMetadata;
  };
  error: null;
  message: string;
  success: boolean;
}

export interface RefreshTokenResponse {
  code: number;
  data: {
    access_token: string;
    expires_at: number;
    refresh_token: string;
    user: UserInfo;
  };
  error: null;
  message: string;
  success: boolean;
}

export interface UserResponse {
  code: number;
  data: {
    auth_data: AuthData;
    profile_data: ProfileData;
    user_id: string;
  };
  error: null;
  message: string;
  success: boolean;
}

export interface ErrorResponse {
  code: number;
  error: string;
  message: string;
  success: boolean;
}

export interface UserMetadata {
  email: string;
  email_verified: boolean;
  first_name: string;
  last_name: string;
  phone_verified: boolean;
  sub: string;
}

export interface UserInfo {
  email: string;
  email_confirmed_at: string;
  id: string;
  user_metadata: UserMetadata;
}

export interface AuthData {
  app_metadata: {
    provider: string;
    providers: string[];
  };
  created_at: string;
  email: string;
  email_verified: boolean;
  id: string;
  phone: string;
  phone_verified: boolean;
  updated_at: string;
  user_metadata: UserMetadata;
}

export interface ProfileData {
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  country: string | null;
  created_at: string;
  display_name: string;
  email: string;
  first_name: string;
  is_active: boolean;
  is_first_login: boolean;
  last_name: string;
  onboarding_completed: boolean;
  package_id: string;
  phone: string | null;
  postal_code: string | null;
  profile_id: string;
  status: string;
  subscription_expires_at: string;
  subscription_status: string;
  total_companies_created: number;
  updated_at: string;
}

export interface SigninCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
}

export interface SignupResponse {
  code: number;
  data: {
    created_at: string;
    email: string;
    email_confirmed_at: string | null;
    id: string;
    setup_completed: boolean;
    setup_details: {
      invoice_created: boolean;
      package_assigned: boolean;
      profile_created: boolean;
      subscription_created: boolean;
      workspace_created: boolean;
    };
    setup_message: string;
  };
  error: null;
  message: string;
  success: boolean;
}

export interface ResendVerificationResponse {
  code: number;
  error: null;
  message: string;
  success: boolean;
}

export interface ProfileUpdateRequest {
  address_line1?: string;
  address_line2?: string;
  city?: string;
  country?: string;
  display_name: string;
  first_name: string;
  last_name: string;
  phone?: string;
  postal_code?: string;
}

export interface ChangePasswordRequest {
  new_password: string;
  confirm_password: string;
}

export interface ChangePasswordResponse {
  code: number;
  error: string | null;
  message: string;
  success: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  avatar?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  company?: string;
  position?: string;
  bio?: string;
  isFirstLogin: boolean;
  subscriptionStatus: string;
  subscriptionExpiresAt: string;
}