// Définition du type User pour l'API
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  role: 'commercial' | 'admin' | 'manager';
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  // Champs optionnels pour la compatibilité avec le type User de l'application
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  rating?: number;
  totalCalls?: number;
  answeredCalls?: number;
  totalDuration?: number;
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
  first_name: string;
  last_name: string;
  phone_number?: string;
  role: 'commercial' | 'admin' | 'manager';
}

export interface UpdateUserRequest {
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  role: 'commercial' | 'admin' | 'manager';
  is_active: boolean;
}

// Types pour les réponses
export type UserResponse = ApiResponse<User>;
export type UsersResponse = ApiResponse<User[]>;

// Types pour les appels
export interface Commercial {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface Call {
  id: number;
  phone_number: string;
  duration: number;
  status: 'answered' | 'missed' | 'rejected' | 'no_answer';
  decision: 'interested' | 'not_interested' | 'call_back' | null;
  notes: string | null;
  client_id: number | null;
  commercial_id: number;
  commercial: Commercial; // Ajout de l'objet commercial complet
  call_date: string;
  call_type?: 'incoming' | 'outgoing';
  has_recording?: boolean;
}

export interface Recording {
  id: number;
  file_size: number;
  uploaded_at: string;
  filename: string;
  file_path: string;
  duration: number;
  call_id: number;
  call?: Call; // Appel associé à l'enregistrement
}

export interface CallWithRecording extends Call {
  recording?: Recording;
}

export type CallResponse = ApiResponse<Call>;
export interface CallsResponse extends ApiResponse<Call[]> {
  total?: number;
}
export type RecordingResponse = ApiResponse<Recording>;
export type RecordingsResponse = ApiResponse<Recording[]>;
