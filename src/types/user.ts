export enum UserRole {
  COMMERCIAL = "commercial",
  ADMIN = "admin",
  MANAGER = "manager",
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  role: UserRole;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  // Alias pour la compatibilité avec le code existant
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

export interface PerformanceStats {
  total_calls: number;
  answered_calls: number;
  response_rate: number;
  average_duration: number;
  total_duration: number;
  rating?: number | null;
}

export interface WeeklyStats {
  week_start: string;
  week_end: string;
  calls: number;
  answered: number;
}

export interface MonthlyStats {
  month: string;
  calls: number;
}

export interface CommercialPerformance extends User {
  stats: PerformanceStats;
  weekly_stats: WeeklyStats[];
  monthly_stats: MonthlyStats[];
}
