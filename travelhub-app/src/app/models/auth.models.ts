export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  birth_date: string;
  password: string;
  user_type: 'traveler' | 'hotel';
  identification_type: string;
  identification_number: string;
}

export interface RegisterResponse {
  id?: string;
  email?: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  status: string;
  is_superuser: boolean;
  role: 'traveler' | 'hotel';
  created_at: string;
  updated_at: string;
}
