export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  birth_date: string;
  password: string;
  user_type: 'traveler' | 'hotel_admin';
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
  user?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    user_type: string;
  };
}
