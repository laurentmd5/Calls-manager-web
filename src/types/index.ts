export type UserRole = 'commercial' | 'admin' | 'manager';

export type CallStatus = 'answered' | 'missed' | 'rejected' | 'no_answer';

export type CallDecision = 'interested' | 'call_back' | 'not_interested' | 'no_answer' | 'wrong_number';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  avatar?: string;
  rating?: number;
  totalCalls?: number;
  answeredCalls?: number;
  totalDuration?: number;
}

export interface Call {
  id: number;
  phoneNumber: string;
  duration: number;
  status: CallStatus;
  decision?: CallDecision;
  notes?: string;
  callDate: string;
  commercialId: number;
  commercial?: User;
  clientId?: number;
  client?: Client;
  recording?: Recording;
  callType: 'incoming' | 'outgoing';
}

export interface Client {
  id: number;
  firstName: string;
  lastName: string;
  company?: string;
  email?: string;
  phoneNumber: string;
  address?: string;
  notes?: string;
  commercialId: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Recording {
  id: number;
  filename: string;
  filePath: string;
  fileSize?: number;
  duration?: number;
  uploadedAt: string;
  callId: number;
}

export interface DashboardStats {
  totalCalls: number;
  answeredCalls: number;
  missedCalls: number;
  totalDuration: number;
  averageDuration: number;
  responseRate: number;
}

export interface CommercialPerformance extends User {
  stats: DashboardStats;
  rating: number;
  comments?: string[];
}
