import { api } from './api';
import { User } from '../types/user';

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

export interface PerformanceResponse {
  stats: PerformanceStats;
  weekly_stats: WeeklyStats[];
  monthly_stats: MonthlyStats[];
}

export interface CommercialPerformance extends User {
  stats: PerformanceStats;
  weekly_stats: WeeklyStats[];
  monthly_stats: MonthlyStats[];
}

export const performanceService = {
  /**
   * Récupère les statistiques de performance pour un commercial spécifique
   */
  async getCommercialPerformance(commercialId: string | number): Promise<PerformanceResponse> {
    try {
      const response = await api.get<PerformanceResponse>(
        `/api/v1/performance/commercials/${commercialId}`
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des performances du commercial:', error);
      throw error;
    }
  },

  /**
   * Récupère les statistiques de performance pour l'utilisateur connecté
   */
  async getMyPerformance(): Promise<PerformanceResponse> {
    try {
      const response = await api.get<PerformanceResponse>('/api/v1/performance/my-performance');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de vos performances:', error);
      throw error;
    }
  },

  /**
   * Récupère les statistiques de performance pour tous les commerciaux
   */
  async getAllCommercialsPerformance(): Promise<CommercialPerformance[]> {
    try {
      const response = await api.get<CommercialPerformance[]>('/api/v1/performance/commercials');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des performances des commerciaux:', error);
      throw error;
    }
  },

  /**
   * Formate la durée en secondes en une chaîne lisible (HH:MM:SS)
   */
  formatDuration(seconds: number): string {
    if (!seconds) return '00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    const pad = (num: number) => num.toString().padStart(2, '0');
    
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
    }
    
    return `${pad(minutes)}:${pad(remainingSeconds)}`;
  },

  /**
   * Calcule le taux de réponse en pourcentage
   */
  calculateResponseRate(answered: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((answered / total) * 100);
  },
};

export default performanceService;
