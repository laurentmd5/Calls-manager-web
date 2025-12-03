// Définition du type User
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Définition de la réponse de connexion
export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User; // L'utilisateur est maintenant requis dans la réponse
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Types pour les requêtes
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: 'commercial' | 'admin' | 'manager';
}

// Types pour les réponses
export type UserResponse = ApiResponse<User>;
export type UsersResponse = ApiResponse<User[]>;
