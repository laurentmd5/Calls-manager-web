import { User as ApiUser } from '@/types/api';
import { User as AppUser } from '@/types';

/**
 * Convertit un utilisateur de l'API vers le format de l'application
 */
export const mapApiUserToAppUser = (apiUser: ApiUser): AppUser => ({
  id: apiUser.id,
  email: apiUser.email,
  firstName: apiUser.first_name || apiUser.firstName || '',
  lastName: apiUser.last_name || apiUser.lastName || '',
  phoneNumber: apiUser.phone_number || apiUser.phoneNumber || '',
  role: apiUser.role,
  isActive: apiUser.is_active || apiUser.isActive || false,
  createdAt: apiUser.created_at || apiUser.createdAt || new Date().toISOString(),
  updatedAt: apiUser.updated_at || apiUser.updatedAt,
  rating: apiUser.rating || 0,
  totalCalls: apiUser.totalCalls || 0,
  answeredCalls: apiUser.answeredCalls || 0,
  totalDuration: apiUser.totalDuration || 0,
});

/**
 * Convertit un tableau d'utilisateurs de l'API vers le format de l'application
 */
export const mapApiUsersToAppUsers = (apiUsers: ApiUser[]): AppUser[] => 
  apiUsers.map(mapApiUserToAppUser);
